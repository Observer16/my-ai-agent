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
 * 🆕 Определить оптимальный язык для пользователя на основе Telegram
 */
function detectBestLanguage(telegramLanguageCode, supportedLanguages) {
    if (!telegramLanguageCode) return 'en';

    // Нормализуем код языка (например, 'en-US' -> 'en', 'es-ES' -> 'es')
    const tgLang = telegramLanguageCode.split('-')[0].toLowerCase();
    const supportedCodes = supportedLanguages.map(lang => lang.code);

    console.log('🔍 Определение лучшего языка:', {
        telegram: telegramLanguageCode,
        normalized: tgLang,
        supported: supportedCodes
    });

    // 1. Прямое совпадение (en -> en, es -> es, ru -> ru, uk -> uk)
    if (supportedCodes.includes(tgLang)) {
        console.log(`✅ Прямое совпадение: ${tgLang}`);
        return tgLang;
    }

    // 2. Для русскоязычных пользователей (ru, uk, be, kk, ky и другие языки СНГ)
    const russianSpeaking = ['ru', 'uk', 'be', 'kk', 'ky', 'tg', 'tt', 'az', 'hy', 'ka'];
    if (russianSpeaking.includes(tgLang)) {
        const result = supportedCodes.includes('ru') ? 'ru' : 'en';
        console.log(`🇷🇺 Русскоязычный пользователь (${tgLang}): ${result}`);
        return result;
    }

    // 3. Для испаноговорящих (es, es-419, es-MX, es-AR и т.д.)
    if (tgLang.startsWith('es')) {
        const result = supportedCodes.includes('es') ? 'es' : 'en';
        console.log(`🇪🇸 Испаноговорящий пользователь: ${result}`);
        return result;
    }

    // 4. Для португальского
    if (tgLang.startsWith('pt')) {
        const result = supportedCodes.includes('pt') ? 'pt' :
                      supportedCodes.includes('es') ? 'es' : 'en';
        console.log(`🇵🇹 Португальский пользователь: ${result}`);
        return result;
    }

    // 5. Попробуем найти похожий язык (например, 'zh' -> 'en')
    const languageMap = {
        'fr': 'en', // Французский -> Английский
        'de': 'en', // Немецкий -> Английский
        'it': 'en', // Итальянский -> Английский
        'pl': 'en', // Польский -> Английский
        'tr': 'en', // Турецкий -> Английский
        'ar': 'en', // Арабский -> Английский
        'ja': 'en', // Японский -> Английский
        'ko': 'en', // Корейский -> Английский
        'zh': 'en', // Китайский -> Английский
        'hi': 'en'  // Хинди -> Английский
    };

    if (languageMap[tgLang]) {
        console.log(`🌍 Сопоставление ${tgLang} -> ${languageMap[tgLang]}`);
        return languageMap[tgLang];
    }

    // 6. Для остальных - английский
    console.log(`🌐 Язык ${tgLang} не поддерживается, используем английский`);
    return 'en';
}

/**
 * 🆕 Получить тексты для модалки на конкретном языке
 * Используем статические тексты, чтобы не зависеть от системы i18n
 */
function getModalTexts(languageCode) {
    const texts = {
        'ru': {
            welcome: 'Добро пожаловать!',
            subtitle: 'Настройте приложение под себя',
            selectLanguage: 'Выберите язык',
            selectCurrency: 'Выберите валюту',
            info: 'Все суммы будут отображаться в выбранной валюте',
            continue: 'Продолжить',
            saving: 'Сохранение...',
            saved: 'Настройки сохранены!',
            error: 'Ошибка'
        },
        'en': {
            welcome: 'Welcome!',
            subtitle: 'Customize the app for yourself',
            selectLanguage: 'Select language',
            selectCurrency: 'Select currency',
            info: 'All amounts will be displayed in selected currency',
            continue: 'Continue',
            saving: 'Saving...',
            saved: 'Settings saved!',
            error: 'Error'
        },
        'es': {
            welcome: '¡Bienvenido!',
            subtitle: 'Personaliza la aplicación para ti',
            selectLanguage: 'Seleccionar idioma',
            selectCurrency: 'Seleccionar moneda',
            info: 'Todas las cantidades se mostrarán en la moneda seleccionada',
            continue: 'Continuar',
            saving: 'Guardando...',
            saved: 'Configuración guardada!',
            error: 'Error'
        },
        'uk': {
            welcome: 'Ласкаво просимо!',
            subtitle: 'Налаштуйте програму для себе',
            selectLanguage: 'Виберіть мову',
            selectCurrency: 'Виберіть валюту',
            info: 'Всі суми будуть відображатися у вибраній валюті',
            continue: 'Продовжити',
            saving: 'Збереження...',
            saved: 'Налаштування збережено!',
            error: 'Помилка'
        }
    };

    return texts[languageCode] || texts['en'];
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

        // 🆕 Определяем язык Telegram пользователя
        const tgUser = tg.initDataUnsafe?.user;
        const telegramLanguage = tgUser?.language_code;

        // 🆕 Определяем оптимальный язык для модалки
        const bestLanguage = detectBestLanguage(telegramLanguage, languages.languages);

        console.log('🌍 Настройки языка для модалки:', {
            telegramLanguage,
            bestLanguage,
            supported: languages.languages.map(l => l.code)
        });

        // 🆕 Получаем тексты на выбранном языке
        const texts = getModalTexts(bestLanguage);

        // Создаем HTML модального окна
        const modalHTML = `
            <div class="initial-setup-modal" id="initial-setup-modal">
                <div class="initial-setup-content">
                    <div class="initial-setup-header">
                        <div class="initial-setup-icon">🌍</div>
                        <h2 class="initial-setup-title">${texts.welcome}</h2>
                        <p class="initial-setup-subtitle">${texts.subtitle}</p>
                    </div>

                    <div class="initial-setup-body">
                        <!-- Выбор языка -->
                        <div class="initial-setup-field">
                            <label class="initial-setup-label">
                                <span class="label-icon">🗣️</span>
                                <span class="label-text">${texts.selectLanguage}</span>
                            </label>
                            <select id="setup-language" class="initial-setup-select">
                                ${languages.languages.map(lang => `
                                    <option value="${lang.code}" ${lang.code === bestLanguage ? 'selected' : ''}>
                                        ${lang.name_native}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Выбор валюты -->
                        <div class="initial-setup-field">
                            <label class="initial-setup-label">
                                <span class="label-icon">💰</span>
                                <span class="label-text">${texts.selectCurrency}</span>
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
                            💡 ${texts.info}
                        </div>
                    </div>

                    <div class="initial-setup-footer">
                        <button class="initial-setup-button" onclick="completeInitialSetup()">
                            ✅ ${texts.continue}
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
        // Используем простой текст для ошибки
        tg.showAlert('Ошибка: ' + error.message);
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

        // 🆕 Получаем тексты на выбранном языке
        const texts = getModalTexts(selectedLanguage);

        // Показываем индикатор загрузки
        const button = document.querySelector('.initial-setup-button');
        button.textContent = '⏳ ' + texts.saving;
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
                        tg.showPopup({
                            title: '✅',
                            message: texts.saved,
                            buttons: [{type: 'ok'}]
                        });

                        tg.HapticFeedback.notificationOccurred('success');
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

    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);

        // Используем текст на выбранном языке для ошибки
        const texts = getModalTexts(selectedLanguage);
        tg.showAlert(texts.error + ': ' + error.message);

        // Восстанавливаем кнопку
        const button = document.querySelector('.initial-setup-button');
        button.textContent = '✅ ' + texts.continue;
        button.disabled = false;

        tg.HapticFeedback.notificationOccurred('error');
    }
}

console.log('✅ Initial-setup.js загружен с автоматическим определением языка Telegram');