// health-module/js/utils/date-utils.js

/**
 * Утилиты для работы с датами
 */

/**
 * Получить текущую дату в локальном времени в формате YYYY-MM-DD
 * @returns {string} Дата в формате YYYY-MM-DD
 */
function getTodayLocal() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Конвертировать Date в локальную строку YYYY-MM-DD
 * @param {Date} date - Объект Date
 * @returns {string} Дата в формате YYYY-MM-DD
 */
function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Получить дату N дней назад в локальном времени
 * @param {number} daysAgo - Количество дней назад
 * @returns {string} Дата в формате YYYY-MM-DD
 */
function getDateDaysAgo(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return toLocalDateString(date);
}