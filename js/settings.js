// js/settings.js
/**
 * Логика страницы настроек
 */

const tg = window.Telegram.WebApp;
tg.expand();
tg.BackButton.show();
tg.BackButton.onClick(() => window.history.back());

let currentSettings = null;
let hasChanges = false;

// Список валют с символами
const AVAILABLE_CURRENCIES = [
    { code: 'PYG', symbol: '₲' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'RUB', symbol: '₽' },
    { code: 'BRL', symbol: 'R$' },
    { code: 'UAH', symbol: '₴' }
];

/**
 * Заполнить список валют с переводами
 */
function populateCurrencySelect() {
    const select = document.getElementById('currency-select');
    if (!select) return;
    
    select.innerHTML = AVAILABLE_CURRENCIES.map(curr => {
        const name = t(`currency.${curr.code}`);
        return `<option value="${curr.code}">${curr.symbol} ${name} (${curr.code})</option>`;
    }).join('');
}

/**
 * Инициализация страницы
 */
async function init() {
    try {
        // Устанавливаем начальный текст загрузки
        document.getElementById('family-status').textContent = t('common.loading');
        
        // Загружаем текущие настройки
        currentSettings = await API.getUserSettings();
        
        // Заполняем список валют с переводами
        populateCurrencySelect();
        
        // Отображаем данные пользователя
        displayUserInfo(currentSettings);
        
        // Устанавливаем текущий язык в select
        const languageSelect = document.getElementById('language-select');
        if (languageSelect && currentSettings.preferred_language) {
            languageSelect.value = currentSettings.preferred_language;
        }
        
        // Устанавливаем текущую валюту в select
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect && currentSettings.preferred_currency) {
            currencySelect.value = currentSettings.preferred_currency;
        }
        
        // Загружаем информацию о семье
        await loadFamilyStatus();
        
        // Устанавливаем обработчики изменений
        languageSelect.addEventListener('change', onLanguageChange);
        currencySelect.addEventListener('change', onCurrencyChange);
        
        tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error('Ошибка инициализации настроек:', e);
        tg.showAlert(t('common.error') + ': ' + e.message);
    }
}

/**
 * Отобразить информацию о пользователе
 */
function displayUserInfo(settings) {
    const userName = settings.first_name || settings.username || t('settings.user');
    document.getElementById('user-name').textContent = userName;
    document.getElementById('user-telegram-id').textContent = settings.telegram_id || '-';
    document.getElementById('user-timezone').textContent = settings.timezone || 'UTC';
}

/**
 * Загрузить статус семьи
 */
async function loadFamilyStatus() {
    try {
        const familyInfo = await API.getFamilyInfo();
        
        if (familyInfo && familyInfo.id) {
            document.getElementById('family-status').textContent = 
                `${familyInfo.name} • ${familyInfo.members_count} ${t('settings.members')}`;
        } else {
            document.getElementById('family-status').textContent = t('settings.noFamily');
        }
    } catch (e) {
        console.warn('Семья не найдена:', e);
        document.getElementById('family-status').textContent = t('settings.noFamily');
    }
}

/**
 * Обработчик изменения языка
 */
function onLanguageChange(event) {
    const newLanguage = event.target.value;
    
    if (newLanguage === currentSettings.preferred_language) {
        checkChanges();
        return;
    }
    
    hasChanges = true;
    tg.MainButton.setText(`💾 ${t('settings.saveChanges')}`);
    tg.MainButton.show();
    tg.HapticFeedback.impactOccurred('light');
}

/**
 * Обработчик изменения валюты
 */
function onCurrencyChange(event) {
    const newCurrency = event.target.value;
    
    if (newCurrency === currentSettings.preferred_currency) {
        checkChanges();
        return;
    }
    
    hasChanges = true;
    tg.MainButton.setText(`💾 ${t('settings.saveChanges')}`);
    tg.MainButton.show();
    tg.HapticFeedback.impactOccurred('light');
}

/**
 * Проверить наличие изменений
 */
function checkChanges() {
    const languageSelect = document.getElementById('language-select');
    const currencySelect = document.getElementById('currency-select');
    
    const languageChanged = languageSelect.value !== currentSettings.preferred_language;
    const currencyChanged = currencySelect.value !== currentSettings.preferred_currency;
    
    hasChanges = languageChanged || currencyChanged;
    
    if (!hasChanges) {
        tg.MainButton.hide();
    }
}

/**
 * Сохранить настройки
 */
async function saveSettings() {
    if (!hasChanges) {
        return;
    }
    
    const newLanguage = document.getElementById('language-select').value;
    const newCurrency = document.getElementById('currency-select').value;
    
    const languageChanged = newLanguage !== currentSettings.preferred_language;
    
    try {
        tg.MainButton.showProgress();
        
        // Обновляем настройки на сервере
        const updatedSettings = await API.updateUserSettings({
            preferred_language: newLanguage,
            preferred_currency: newCurrency
        });
        
        // Обновляем валюту в currency.js
        setCurrency(newCurrency);
        
        currentSettings = updatedSettings;
        hasChanges = false;
        
        tg.MainButton.hideProgress();
        tg.MainButton.hide();
        
        tg.HapticFeedback.notificationOccurred('success');
        
        // Если изменился язык - сохраняем в localStorage и перезагружаем страницу
        if (languageChanged) {
            // ВАЖНО: Сохраняем новый язык в localStorage ПЕРЕД перезагрузкой
            localStorage.setItem('preferred_language', newLanguage);
            
            // Временно переключаем язык для получения переведенного сообщения
            const oldLang = getCurrentLanguage();
            setLanguage(newLanguage);
            const message = t('settings.savedReload');
            setLanguage(oldLang); // Возвращаем обратно (на случай если popup отменят)
            
            tg.showPopup({
                title: '✅',
                message: message,
                buttons: [{type: 'ok'}]
            }, () => {
                window.location.reload();
            });
        } else {
            // Просто показываем уведомление
            tg.showPopup({
                title: '✅',
                message: t('settings.saved'),
                buttons: [{type: 'ok'}]
            });
        }
        
    } catch (e) {
        tg.MainButton.hideProgress();
        console.error('Ошибка сохранения настроек:', e);
        tg.showAlert(t('common.error') + ': ' + e.message);
        tg.HapticFeedback.notificationOccurred('error');
    }
}

/**
 * Открыть страницу семьи
 */
function openFamily() {
    window.location.href = 'family.html';
}

// Инициализация при загрузке
init();

// Настройка MainButton
tg.MainButton.onClick(saveSettings);
