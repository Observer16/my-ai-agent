// js/currency.js
/**
 * Утилиты для работы с валютами
 */

const CURRENCIES = {
    'PYG': { symbol: '₲', decimals: 0, name: 'Гуарани' },
    'USD': { symbol: '$', decimals: 2, name: 'Доллар США' },
    'EUR': { symbol: '€', decimals: 2, name: 'Евро' },
    'RUB': { symbol: '₽', decimals: 2, name: 'Рубль' },
    'BRL': { symbol: 'R$', decimals: 2, name: 'Реал' },
    'UAH': { symbol: '₴', decimals: 2, name: 'Гривна' }
};

const DEFAULT_CURRENCY = 'PYG';

/**
 * Текущая валюта пользователя (загружается из API)
 */
let currentCurrency = DEFAULT_CURRENCY;
let currentCurrencyInfo = CURRENCIES[DEFAULT_CURRENCY];

/**
 * Инициализация валюты из настроек пользователя
 */
async function initCurrency() {
    try {
        const settings = await API.getUserSettings();
        if (settings && settings.preferred_currency) {
            currentCurrency = settings.preferred_currency;
            currentCurrencyInfo = CURRENCIES[currentCurrency] || CURRENCIES[DEFAULT_CURRENCY];
            console.log('✅ Валюта загружена:', currentCurrency);
        }
    } catch (e) {
        console.warn('⚠️ Не удалось загрузить валюту, используем PYG:', e);
        currentCurrency = DEFAULT_CURRENCY;
        currentCurrencyInfo = CURRENCIES[DEFAULT_CURRENCY];
    }
}

/**
 * Получить символ текущей валюты
 */
function getCurrencySymbol() {
    return currentCurrencyInfo.symbol;
}

/**
 * Получить код текущей валюты
 */
function getCurrencyCode() {
    return currentCurrency;
}

/**
 * Получить информацию о текущей валюте
 */
function getCurrencyInfo() {
    return currentCurrencyInfo;
}

/**
 * Форматирование суммы с текущей валютой
 * @param {number} amount - Сумма
 * @param {boolean} withSymbol - Добавлять символ валюты
 * @returns {string} Отформатированная сумма
 */
function formatAmount(amount, withSymbol = true) {
    if (!amount && amount !== 0) return '-';
    
    const decimals = currentCurrencyInfo.decimals;
    const symbol = currentCurrencyInfo.symbol;
    
    let formatted;
    if (decimals === 0) {
        // Для валют без копеек (PYG) - округляем и форматируем без десятичных
        formatted = Math.round(amount).toLocaleString('ru-RU');
    } else {
        // Для валют с копейками - форматируем с нужным количеством знаков
        formatted = amount.toLocaleString('ru-RU', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    return withSymbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Установить валюту
 * @param {string} currencyCode - Код валюты
 */
function setCurrency(currencyCode) {
    if (CURRENCIES[currencyCode]) {
        currentCurrency = currencyCode;
        currentCurrencyInfo = CURRENCIES[currencyCode];
        console.log('✅ Валюта изменена на:', currencyCode);
        return true;
    }
    console.warn('⚠️ Неизвестная валюта:', currencyCode);
    return false;
}

/**
 * Получить список всех поддерживаемых валют
 */
function getAllCurrencies() {
    return CURRENCIES;
}
