// js/settings.js
/**
 * Логика страницы настроек
 */

const tg = window.Telegram.WebApp;
tg.expand();
tg.BackButton.show();
tg.BackButton.onClick(() => window.history.back());

let currentSettings = null;
let availableCurrencies = [];

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function init() {
    try {
        // Показываем Telegram ID
        document.getElementById('user-telegram-id').textContent = API.getTelegramUserId() || '-';
        
        // Загружаем список валют
        await loadCurrencies();
        
        // Загружаем текущие настройки
        await loadSettings();
        
        // Загружаем информацию о семье
        await loadFamilyStatus();
        
        tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error('Ошибка инициализации:', e);
        tg.showAlert('Ошибка загрузки настроек');
    }
}

// ==================== ВАЛЮТЫ ====================
async function loadCurrencies() {
    try {
        const response = await API.getSupportedCurrencies();
        availableCurrencies = response.currencies;
        
        const select = document.getElementById('currency-select');
        select.innerHTML = availableCurrencies.map(c => 
            `<option value="${c.code}">${c.symbol} ${c.name_ru} (${c.code})</option>`
        ).join('');
        
        // Обработчик изменения валюты
        select.addEventListener('change', onCurrencyChange);
        
        console.log('✅ Валюты загружены:', availableCurrencies.length);
    } catch (e) {
        console.error('Ошибка загрузки валют:', e);
        document.getElementById('currency-select').innerHTML = 
            '<option value="">Ошибка загрузки</option>';
    }
}

async function loadSettings() {
    try {
        currentSettings = await API.getUserSettings();
        
        // Устанавливаем текущую валюту
        const select = document.getElementById('currency-select');
        select.value = currentSettings.preferred_currency || 'PYG';
        
        // Обновляем валюту в currency.js
        setCurrency(currentSettings.preferred_currency || 'PYG');
        
        console.log('✅ Настройки загружены:', currentSettings);
    } catch (e) {
        console.error('Ошибка загрузки настроек:', e);
    }
}

async function onCurrencyChange(event) {
    const newCurrency = event.target.value;
    
    if (!newCurrency) return;
    
    try {
        tg.MainButton.showProgress();
        
        // Обновляем настройки на сервере
        await API.updateUserSettings({
            preferred_currency: newCurrency
        });
        
        // Обновляем локально
        setCurrency(newCurrency);
        currentSettings.preferred_currency = newCurrency;
        
        tg.MainButton.hideProgress();
        tg.HapticFeedback.notificationOccurred('success');
        
        tg.showPopup({
            title: '✅ Готово',
            message: `Валюта изменена на ${newCurrency}`,
            buttons: [{ type: 'ok' }]
        });
        
        console.log('✅ Валюта изменена:', newCurrency);
    } catch (e) {
        tg.MainButton.hideProgress();
        console.error('Ошибка изменения валюты:', e);
        tg.showAlert('Ошибка сохранения настроек');
        
        // Возвращаем предыдущее значение
        event.target.value = currentSettings.preferred_currency || 'PYG';
    }
}

// ==================== СЕМЬЯ ====================
async function loadFamilyStatus() {
    const container = document.getElementById('family-status');
    
    try {
        const familyInfo = await API.getFamilyInfo();
        
        if (familyInfo && familyInfo.id) {
            // Пользователь в семье
            container.innerHTML = `
                <div class="family-info">
                    <div class="family-name">👨‍👩‍👧‍👦 ${familyInfo.name}</div>
                    <div class="family-members">Участников: ${familyInfo.members_count}</div>
                    <button class="settings-btn" onclick="openFamilyPage()">
                        Управление семьёй
                    </button>
                </div>
            `;
        } else {
            // Пользователь не в семье
            container.innerHTML = `
                <div class="family-info">
                    <div class="family-empty">Вы не состоите в семье</div>
                    <button class="settings-btn" onclick="openFamilyPage()">
                        Создать или присоединиться
                    </button>
                </div>
            `;
        }
    } catch (e) {
        console.error('Ошибка загрузки семьи:', e);
        container.innerHTML = `
            <div class="family-info">
                <button class="settings-btn" onclick="openFamilyPage()">
                    Управление семьёй
                </button>
            </div>
        `;
    }
}

function openFamilyPage() {
    window.location.href = 'family.html';
}

// ==================== ЗАПУСК ====================
init();
