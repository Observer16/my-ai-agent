// js/initial-setup.js
/**
 * Модальное окно первичной настройки для новых пользователей
 */

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
            const expenses = await API.getExpenses({ limit: 1 });
            if (expenses && expenses.length > 0) {
                console.log('✅ Найдены расходы - пользователь уже работает');
                localStorage.setItem('initial_setup_completed', 'true');
                return false;
            }
        } catch (e) {
            // Игнорируем ошибку, продолжаем проверку
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
                        <h2 class="initial-setup-title">Добро пожаловать!</h2>
                        <p class="initial-setup-subtitle">Настройте приложение под себя</p>
                    </div>
                    
                    <div class="initial-setup-body">
                        <!-- Выбор языка -->
                        <div class="initial-setup-field">
                            <label class="initial-setup-label">
                                <span class="label-icon">🗣️</span>
                                <span class="label-text">Язык интерфейса</span>
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
                                <span class="label-text">Валюта</span>
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
                            💡 Вы сможете изменить эти настройки позже в меню настроек
                        </div>
                    </div>
                    
                    <div class="initial-setup-footer">
                        <button class="initial-setup-button" onclick="completeInitialSetup()">
                            ✅ Продолжить
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
        tg.showAlert('Ошибка загрузки настроек: ' + error.message);
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
        button.textContent = '⏳ Сохранение...';
        button.disabled = true;
        
        // Отправляем настройки на сервер
        await API.initialSetup({
            preferred_language: selectedLanguage,
            preferred_currency: selectedCurrency,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            setup_completed: true  // Добавляем флаг завершения настройки
        });
        
        // Устанавливаем язык и валюту локально
        setLanguage(selectedLanguage);
        setCurrency(selectedCurrency);
        
        // Помечаем, что настройка завершена
        localStorage.setItem('initial_setup_completed', 'true');
        
        // Закрываем модальное окно
        const modal = document.getElementById('initial-setup-modal');
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.remove();
        }, 300);
        
        tg.HapticFeedback.notificationOccurred('success');
        
        // Перезагружаем данные на главной странице
        if (typeof loadDashboardData === 'function') {
            await loadDashboardData();
        }
        
    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
        tg.showAlert('Ошибка сохранения настроек: ' + error.message);
        
        // Восстанавливаем кнопку
        const button = document.querySelector('.initial-setup-button');
        button.textContent = '✅ Продолжить';
        button.disabled = false;
        
        tg.HapticFeedback.notificationOccurred('error');
    }
}

console.log('✅ Initial-setup.js загружен');
