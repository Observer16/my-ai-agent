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
 * 🆕 Получить текущий язык системы
 */
function getCurrentLanguage() {
    if (typeof window.i18n?.getCurrentLanguage === 'function') {
        return window.i18n.getCurrentLanguage();
    }
    return localStorage.getItem('preferred_language') || 'ru';
}

/**
 * 🆕 Временная установка языка для модального окна
 */
function setLanguageForModal(langCode) {
    if (typeof setLanguage === 'function') {
        setLanguage(langCode);
    } else if (typeof window.i18n?.setLanguage === 'function') {
        window.i18n.setLanguage(langCode);
    } else {
        // Fallback: устанавливаем в localStorage
        localStorage.setItem('preferred_language', langCode);
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

        // 🆕 Временная установка языка для отображения модалки
        const currentLang = getCurrentLanguage();
        setLanguageForModal(bestLanguage);

        // Получаем переводы на выбранном языке
        const welcomeText = t('initialSetup.welcome') || 'Добро пожаловать!';
        const subtitleText = t('initialSetup.subtitle') || 'Настройте приложение под себя';
        const languageLabel = t('initialSetup.selectLanguage') || 'Выберите язык';
        const currencyLabel = t('initialSetup.selectCurrency') || 'Выберите валюту';
        const continueText = t('initialSetup.continue') || 'Продолжить';
        const savingText = t('common.saving') || t('settings.save') || 'Сохранение...';

        // Создаем HTML модального окна
        const modalHTML = `
            <div class="initial-setup-modal" id="initial-setup-modal">
                <div class="initial-setup-content">
                    <div class="initial-setup-header">
                        <div class="initial-setup-icon">🌍</div>
                        <h2 class="initial-setup-title">${welcomeText}</h2>
                        <p class="initial-setup-subtitle">${subtitleText}</p>
                    </div>

                    <div class="initial-setup-body">
                        <!-- Выбор языка -->
                        <div class="initial-setup-field">
                            <label class="initial-setup-label">
                                <span class="label-icon">🗣️</span>
                                <span class="label-text">${languageLabel}</span>
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
                                <span class="label-text">${currencyLabel}</span>
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
                            💡 ${t('settings.currencyDescription') || 'Все суммы будут отображаться в выбранной валюте'}
                        </div>
                    </div>

                    <div class="initial-setup-footer">
                        <button class="initial-setup-button" onclick="completeInitialSetup()">
                            ✅ ${continueText}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Добавляем модальное окно в DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Восстанавливаем исходный язык
        setLanguageForModal(currentLang);

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

        // 🆕 ВРЕМЕННО УСТАНАВЛИВАЕМ ЯЗЫК ДЛЯ ПЕРЕВОДОВ
        const originalLanguage = getCurrentLanguage();
        setLanguageForModal(selectedLanguage);

        // Получаем переводы НА ВЫБРАННОМ ЯЗЫКЕ
        const savingText = t('common.saving') || t('settings.save') || 'Сохранение...';
        const savedText = t('settings.saved') || 'Настройки сохранены!';
        const errorText = t('common.error') || 'Ошибка';
        const continueText = t('initialSetup.continue') || 'Продолжить';

        // Показываем индикатор загрузки с правильным переводом
        const button = document.querySelector('.initial-setup-button');
        button.textContent = '⏳ ' + savingText;
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
                        // 2. Показываем уведомление об успехе (уже на правильном языке)
                        tg.showPopup({
                            title: '✅',
                            message: savedText,
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

            // 🆕 Восстанавливаем исходный язык (если нужно)
            // setLanguageForModal(originalLanguage);

        }, 300);

    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);

        // Используем перевод на выбранном языке для ошибки
        tg.showAlert(errorText + ': ' + error.message);

        // Восстанавливаем кнопку
        const button = document.querySelector('.initial-setup-button');
        button.textContent = '✅ ' + continueText;
        button.disabled = false;

        tg.HapticFeedback.notificationOccurred('error');

        // 🆕 Восстанавливаем исходный язык при ошибке
        // setLanguageForModal(originalLanguage);
    }
}

console.log('✅ Initial-setup.js загружен с автоматическим определением языка Telegram');