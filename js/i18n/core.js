// js/i18n/core.js - Ядро системы переводов

/**
 * Хранилище всех переводов
 */
const translations = {
    ru: {},
    en: {},
    es: {},
    uk: {}
};

/**
 * Текущий язык (по умолчанию русский)
 */
let currentLanguage = 'ru';

/**
 * Регистрация переводов для секции
 * @param {string} section - Название секции (например 'family', 'settings')
 * @param {object} data - Объект с переводами { ru: {...}, en: {...}, es: {...}, uk: {...} }
 */
function registerTranslations(section, data) {
    if (data.ru) {
        translations.ru[section] = data.ru;
    }
    if (data.en) {
        translations.en[section] = data.en;
    }
    if (data.es) {
        translations.es[section] = data.es;
    }
    if (data.uk) {
        translations.uk[section] = data.uk;
    }
}

/**
 * Инициализация языка из localStorage или настроек пользователя
 */
function initLanguage() {
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    }
}

/**
 * Установить текущий язык
 * @param {string} lang - Код языка ('ru', 'en', 'es' или 'uk')
 * @returns {boolean} - true если язык установлен успешно
 */
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('preferred_language', lang);
        return true;
    }
    return false;
}

/**
 * Получить текущий язык
 * @returns {string} - Код текущего языка
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Получить перевод по ключу
 * @param {string} key - Ключ перевода в формате "section.subsection.key"
 * @param {object} params - Параметры для подстановки
 * @returns {string|array} - Переведенная строка или массив
 */
function t(key, params = {}) {
    const keys = key.split('.');
    let value = translations[currentLanguage];

    // Проходим по вложенным ключам
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            // Если ключ не найден, возвращаем ключ как есть
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
    }

    // Если значение - массив, возвращаем его
    if (Array.isArray(value)) {
        return value;
    }

    // Если значение не строка, возвращаем ключ
    if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
    }

    // Подставляем параметры в строку
    let result = value;
    for (const [param, val] of Object.entries(params)) {
        result = result.replace(`{${param}}`, val);
    }

    return result;
}

/**
 * Получить название месяца
 * @param {number} monthIndex - Индекс месяца (0-11)
 * @returns {string} - Название месяца
 */
function getMonthName(monthIndex) {
    const months = t('months');
    return months[monthIndex] || '';
}

// Инициализируем язык при загрузке
initLanguage();

console.log('✅ i18n/core.js загружен, текущий язык:', currentLanguage);
