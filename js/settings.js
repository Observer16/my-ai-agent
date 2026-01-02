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

// Популярные часовые пояса
const COMMON_TIMEZONES = [
    { value: 'America/Asuncion', label: 'Paraguay (America/Asuncion)' },
    { value: 'America/Sao_Paulo', label: 'Brazil (America/Sao_Paulo)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (America/Argentina/Buenos_Aires)' },
    { value: 'America/New_York', label: 'USA East (America/New_York)' },
    { value: 'America/Los_Angeles', label: 'USA West (America/Los_Angeles)' },
    { value: 'America/Chicago', label: 'USA Central (America/Chicago)' },
    { value: 'Europe/London', label: 'UK (Europe/London)' },
    { value: 'Europe/Paris', label: 'France (Europe/Paris)' },
    { value: 'Europe/Berlin', label: 'Germany (Europe/Berlin)' },
    { value: 'Europe/Moscow', label: 'Russia Moscow (Europe/Moscow)' },
    { value: 'Asia/Dubai', label: 'UAE (Asia/Dubai)' },
    { value: 'Asia/Tokyo', label: 'Japan (Asia/Tokyo)' },
    { value: 'Asia/Shanghai', label: 'China (Asia/Shanghai)' },
    { value: 'Australia/Sydney', label: 'Australia (Australia/Sydney)' },
    { value: 'UTC', label: 'UTC' }
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
    document.getElementById('user-timezone-display').textContent = settings.timezone || 'UTC';
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
 * Изменить часовой пояс
 */
async function changeTimezone() {
    try {
        tg.HapticFeedback.impactOccurred('medium');
        
        // Создаем HTML для выбора timezone
        const optionsHtml = COMMON_TIMEZONES.map(tz => 
            `<option value="${tz.value}" ${tz.value === currentSettings.timezone ? 'selected' : ''}>${tz.label}</option>`
        ).join('');
        
        const modalHtml = `
            <div class="timezone-modal" id="timezone-modal">
                <div class="timezone-modal-content">
                    <h3>${t('settings.selectNewTimezone')}</h3>
                    <select id="timezone-select" class="settings-select">
                        ${optionsHtml}
                    </select>
                    <div class="timezone-modal-buttons">
                        <button class="timezone-btn timezone-btn-cancel" onclick="closeTimezoneModal()">
                            ${t('common.cancel')}
                        </button>
                        <button class="timezone-btn timezone-btn-save" onclick="saveTimezone()">
                            ${t('common.save')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        setTimeout(() => {
            document.getElementById('timezone-modal').classList.add('active');
        }, 10);
        
    } catch (e) {
        console.error('Ошибка открытия модального окна:', e);
        tg.showAlert(t('common.error'));
    }
}

/**
 * Закрыть модальное окно timezone
 */
function closeTimezoneModal() {
    const modal = document.getElementById('timezone-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * Сохранить новый часовой пояс
 */
async function saveTimezone() {
    try {
        const select = document.getElementById('timezone-select');
        const newTimezone = select.value;
        
        if (newTimezone === currentSettings.timezone) {
            closeTimezoneModal();
            return;
        }
        
        tg.HapticFeedback.impactOccurred('medium');
        
        // Отправляем на сервер
        const updatedSettings = await API.updateUserSettings({
            timezone: newTimezone
        });
        
        currentSettings = updatedSettings;
        
        // Обновляем отображение
        document.getElementById('user-timezone-display').textContent = newTimezone;
        
        closeTimezoneModal();
        
        tg.showPopup({
            title: '✅',
            message: t('settings.timezoneChanged'),
            buttons: [{type: 'ok'}]
        });
        
        tg.HapticFeedback.notificationOccurred('success');
        
    } catch (e) {
        console.error('Ошибка сохранения timezone:', e);
        tg.showAlert(t('common.error') + ': ' + e.message);
        tg.HapticFeedback.notificationOccurred('error');
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
