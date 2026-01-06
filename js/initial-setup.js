// js/initial-setup.js
/**
 * Модальное окно первичной настройки для новых пользователей
 */

// Глобальные переменные Telegram
const tg = window.Telegram.WebApp;

/**
 * Проверить, нужна ли первичная настройка
 */
async function checkInitialSetup() {
    try {
        // Проверяем флаг в localStorage
        const setupCompleted = localStorage.getItem('initial_setup_completed');

        if (setupCompleted === 'true') {
            console.log('✅ Первичная настройка уже выполнена');
            return false;
        }

        // Проверяем настройки пользователя на сервере
        const settings = await API.getUserSettings();

        // Проверяем флаг setup_completed от бэкенда (если есть)
        if (settings.setup_completed === true) {
            console.log('✅ Настройки пользователя подтверждены сервером');
            localStorage.setItem('initial_setup_completed', 'true');
            return false;
        }

        // Дополнительная проверка: если есть хоть один расход, значит пользователь уже работает
        try {
            // Пробуем получить расходы или покупки
            let hasData = false;

            // Вариант 1: попробовать получить статистику
            try {
                const stats = await API.getStatistics();
                if (stats && (stats.total_spent > 0 || stats.total_purchases > 0)) {
                    hasData = true;
                }
            } catch (e1) {
                console.log('Проверка статистики не удалась:', e1.message);
            }

            // Вариант 2: попробовать получить последние покупки
            if (!hasData) {
                try {
                    const purchases = await API.getRecentPurchases(1);
                    if (purchases && purchases.length > 0) {
                        hasData = true;
                    }
                } catch (e2) {
                    console.log('Проверка покупок не удалась:', e2.message);
                }
            }

            if (hasData) {
                console.log('✅ Найдены данные - пользователь уже работает');
                localStorage.setItem('initial_setup_completed', 'true');
                return false;
            }
        } catch (e) {
            // Игнорируем ошибку, продолжаем проверку
            console.log('Проверка данных не удалась:', e.message);
        }

        // Нужна первичная настройка
        console.log('📝 Требуется первичная настройка');
        return true;

    } catch (error) {
        console.error('Ошибка проверки первичной настройки:', error);
        // В случае ошибки НЕ показываем модалку, чтобы не блокировать приложение
        return false;
    }
}

/**
 * Показать модальное окно первичной настройки
 */
async function showInitialSetupModal() {
    try {
        // Получаем список поддерживаемых валют и языков
        const [currencies, languages] = await Promise.all([
            API.getSupportedCurrencies(),
            API.getSupportedLanguages()
        ]);

        // Определяем язык из Telegram (если доступен)
        const tgUser = tg.initDataUnsafe?.user;
        const tgLanguage = tgUser?.language_code || 'ru';
        const defaultLanguage = tgLanguage.startsWith('en') ? 'en' : 'ru';

        // Создаем HTML модального окна
        const modalHTML = `
            <div class="initial-setup-modal" id="initial-setup-modal">
                <div class="initial-setup-content">
                    <div class="initial-setup-header">
                        <div class="initial-setup-icon">🌍</div>
                        <h2 class="initial-setup-title">${t('initialSetup.welcome') || 'Добро пожаловать!'}</h2>
                        <p class="initial-setup-subtitle">${t('initialSetup.subtitle') || 'Настройте приложение под себя'}</p>
                    </div>

                    <div class="initial-setup-body">
                        <!-- Выбор языка -->
                        <div class="initial-setup-field">
                            <label class="initial-setup-label">
                                <span class="label-icon">🗣️</span>
                                <span class="label-text">${t('initialSetup.language') || 'Язык интерфейса'}</span>
                            </label>
                            <select id="setup-language" class="initial-setup-select">
                                ${languages.languages.map(lang => `
                                    <option value="${lang.code}" ${lang.code === defaultLanguage ? 'selected' : ''}>
                                        ${lang.name_native}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Выбор валюты -->
                        <div class="initial-setup-field">
                            <label class="initial-setup-label">
                                <span class="label-icon">💰</span>
                                <span class="label-text">${t('initialSetup.currency') || 'Валюта'}</span>
                            </label>
                            <select id="setup-currency" class="initial-setup-select">
                                ${currencies.currencies.map(curr => `
                                    <option value="${curr.code}" ${curr.code === 'PYG' ? 'selected' : ''}>
                                        ${curr.symbol} ${curr.name_ru} (${curr.code})
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Информация -->
                        <div class="initial-setup-info">
                            💡 ${t('initialSetup.info') || 'Вы сможете изменить эти настройки позже в меню настроек'}
                        </div>
                    </div>

                    <div class="initial-setup-footer">
                        <button class="initial-setup-button" onclick="completeInitialSetup()">
                            ✅ ${t('initialSetup.continue') || 'Продолжить'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Добавляем модальное окно в DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Показываем модальное окно с анимацией
        setTimeout(() => {
            document.getElementById('initial-setup-modal').classList.add('active');
        }, 100);

        tg.HapticFeedback.notificationOccurred('success');

    } catch (error) {
        console.error('Ошибка показа модального окна:', error);
        tg.showAlert(t('common.error') || 'Ошибка' + ': ' + error.message);
    }
}

/**
 * Завершить первичную настройку
 */
async function completeInitialSetup() {
    const languageSelect = document.getElementById('setup-language');
    const currencySelect = document.getElementById('setup-currency');

    if (!languageSelect || !currencySelect) {
        console.error('Элементы формы не найдены');
        return;
    }

    const selectedLanguage = languageSelect.value;
    const selectedCurrency = currencySelect.value;

    try {
        tg.HapticFeedback.impactOccurred('medium');

        // Показываем индикатор загрузки
        const button = document.querySelector('.initial-setup-button');
        button.textContent = t('initialSetup.saving') || '⏳ Сохранение...';
        button.disabled = true;

        // Отправляем настройки на сервер
        await API.initialSetup({
            preferred_language: selectedLanguage,
            preferred_currency: selectedCurrency,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            setup_completed: true
        });

        // Помечаем, что настройка завершена
        localStorage.setItem('initial_setup_completed', 'true');

        // Закрываем модальное окно
        const modal = document.getElementById('initial-setup-modal');
        modal.classList.remove('active');

        setTimeout(async () => {
            modal.remove();

            // 🆕 ОБНОВЛЯЕМ ПРИЛОЖЕНИЕ БЕЗ ПЕРЕЗАГРУЗКИ
            try {
                // 1. Обновляем приложение через глобальную функцию
                if (typeof window.refreshAppAfterSetup === 'function') {
                    const success = await window.refreshAppAfterSetup(selectedLanguage, selectedCurrency);

                    if (success) {
                        // 2. Показываем уведомление об успехе
                        if (typeof window.showSetupSuccess === 'function') {
                            window.showSetupSuccess();
                        } else {
                            tg.showPopup({
                                title: '✅',
                                message: t('initialSetup.completed') || 'Настройки сохранены!',
                                buttons: [{type: 'ok'}]
                            });
                        }
                    } else {
                        // Если обновление не удалось, перезагружаем
                        window.location.reload();
                    }
                } else {
                    // Если функция обновления не найдена, перезагружаем
                    console.warn('Функция refreshAppAfterSetup не найдена, перезагружаем...');
                    window.location.reload();
                }
            } catch (refreshError) {
                console.error('Ошибка обновления приложения:', refreshError);
                // В случае ошибки все равно перезагружаем
                window.location.reload();
            }
        }, 300);

        tg.HapticFeedback.notificationOccurred('success');

    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
        tg.showAlert((t('common.error') || 'Ошибка') + ': ' + error.message);

        // Восстанавливаем кнопку
        const button = document.querySelector('.initial-setup-button');
        button.textContent = '✅ ' + (t('initialSetup.continue') || 'Продолжить');
        button.disabled = false;

        tg.HapticFeedback.notificationOccurred('error');
    }
}

// 🆕 Добавляем функции перевода для initial-setup
if (typeof window.i18n === 'undefined') {
    window.i18n = {};
}

// Простые fallback переводы для initial-setup
const setupTranslations = {
    'ru': {
        'initialSetup.welcome': 'Добро пожаловать!',
        'initialSetup.subtitle': 'Настройте приложение под себя',
        'initialSetup.language': 'Язык интерфейса',
        'initialSetup.currency': 'Валюта',
        'initialSetup.info': 'Вы сможете изменить эти настройки позже в меню настроек',
        'initialSetup.continue': 'Продолжить',
        'initialSetup.saving': '⏳ Сохранение...',
        'initialSetup.completed': 'Настройки сохранены!'
    },
    'en': {
        'initialSetup.welcome': 'Welcome!',
        'initialSetup.subtitle': 'Configure the app for yourself',
        'initialSetup.language': 'Interface language',
        'initialSetup.currency': 'Currency',
        'initialSetup.info': 'You can change these settings later in the settings menu',
        'initialSetup.continue': 'Continue',
        'initialSetup.saving': '⏳ Saving...',
        'initialSetup.completed': 'Settings saved!'
    }
};

// Fallback функция t если основная не загружена
if (typeof t === 'undefined') {
    window.t = function(key) {
        const lang = localStorage.getItem('preferred_language') || 'ru';
        const translations = setupTranslations[lang] || setupTranslations['ru'];
        return translations[key] || key;
    };
}

console.log('✅ Initial-setup.js загружен с поддержкой обновления без перезагрузки');