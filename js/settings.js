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

/**
 * Инициализация страницы
 */
async function init() {
    try {
        // Загружаем текущие настройки
        currentSettings = await API.getUserSettings();
        
        // Отображаем данные пользователя
        displayUserInfo(currentSettings);
        
        // Устанавливаем текущую валюту в select
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect && currentSettings.preferred_currency) {
            currencySelect.value = currentSettings.preferred_currency;
        }
        
        // Загружаем информацию о семье
        await loadFamilyStatus();
        
        // Устанавливаем обработчик изменения валюты
        currencySelect.addEventListener('change', onCurrencyChange);
        
        tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error('Ошибка инициализации настроек:', e);
        tg.showAlert('Ошибка загрузки настроек: ' + e.message);
    }
}

/**
 * Отобразить информацию о пользователе
 */
function displayUserInfo(settings) {
    const userName = settings.first_name || settings.username || 'Пользователь';
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
                `${familyInfo.name} • ${familyInfo.members_count} участников`;
        } else {
            document.getElementById('family-status').textContent = 'Нет семьи';
        }
    } catch (e) {
        console.warn('Семья не найдена:', e);
        document.getElementById('family-status').textContent = 'Нет семьи';
    }
}

/**
 * Обработчик изменения валюты
 */
async function onCurrencyChange(event) {
    const newCurrency = event.target.value;
    
    if (newCurrency === currentSettings.preferred_currency) {
        hasChanges = false;
        tg.MainButton.hide();
        return;
    }
    
    hasChanges = true;
    tg.MainButton.setText('💾 Сохранить изменения');
    tg.MainButton.show();
    tg.HapticFeedback.impactOccurred('light');
}

/**
 * Сохранить настройки
 */
async function saveSettings() {
    if (!hasChanges) {
        return;
    }
    
    const newCurrency = document.getElementById('currency-select').value;
    
    try {
        tg.MainButton.showProgress();
        
        // Обновляем настройки на сервере
        const updatedSettings = await API.updateUserSettings({
            preferred_currency: newCurrency
        });
        
        // Обновляем валюту в currency.js
        setCurrency(newCurrency);
        
        currentSettings = updatedSettings;
        hasChanges = false;
        
        tg.MainButton.hideProgress();
        tg.MainButton.hide();
        
        // Показываем уведомление
        tg.showPopup({
            title: '✅',
            message: 'Настройки сохранены',
            buttons: [{type: 'ok'}]
        });
        
        tg.HapticFeedback.notificationOccurred('success');
        
    } catch (e) {
        tg.MainButton.hideProgress();
        console.error('Ошибка сохранения настроек:', e);
        tg.showAlert('Ошибка сохранения: ' + e.message);
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
