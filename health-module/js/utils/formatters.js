// health-module/js/utils/formatters.js

/**
 * Утилиты для форматирования данных
 */

/**
 * Форматирование времени из HH:MM в короткий формат
 */
export function formatTime(timeStr) {
    if (!timeStr) return '--:--';
    return typeof timeStr === 'string' ? timeStr.substring(0, 5) : '--:--';
}

/**
 * Форматирование даты в русскую локаль
 */
export function formatDate(dateStr, options = {}) {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        weekday: options.weekday ? 'long' : undefined,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    });
}

/**
 * Форматирование времени для отображения
 */
export function formatTimeForDisplay(datetimeStr) {
    if (!datetimeStr) return '';

    const date = new Date(datetimeStr);
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Получение названия месяца
 */
export function getMonthName(monthIndex) {
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[monthIndex];
}

/**
 * Получение эмодзи для настроения
 */
export function getMoodEmoji(mood) {
    const MOOD_EMOJIS = {
        'радость': '😄',
        'удовлетворение': '🙂',
        'нейтрально': '😐',
        'грусть': '😔',
        'стресс': '😫',
        'гнев': '😠',
        'беспокойство': '😟',
        'усталость': '😴',
        'энергичность': '⚡️',
        'спокойствие': '😌'
    };
    return MOOD_EMOJIS[mood] || '😐';
}

/**
 * Получение цвета для интенсивности
 */
export function getIntensityColor(intensity) {
    const INTENSITY_COLORS = {
        1: '#4CAF50',
        2: '#8BC34A',
        3: '#FFC107',
        4: '#FF9800',
        5: '#F44336'
    };
    return INTENSITY_COLORS[intensity] || '#4CAF50';
}