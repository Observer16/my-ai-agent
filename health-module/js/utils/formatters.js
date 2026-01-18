// js/utils/formatters.js

const HealthFormatters = (function() {
    // Получить текущий язык и преобразовать в локаль
    function getLocale() {
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'ru';
        const localeMap = {
            ru: 'ru-RU',
            en: 'en-US',
            es: 'es-ES',
            uk: 'uk-UA'
        };
        return localeMap[lang] || 'ru-RU';
    }

    function formatTime(timeStr) {
        if (!timeStr) return '--:--';
        return typeof timeStr === 'string' ? timeStr.substring(0, 5) : '--:--';
    }

    function formatDate(dateStr, options = {}) {
        if (!dateStr) return '';

        // Парсим дату в формате YYYY-MM-DD, создавая объект в локальном времени
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month - 1 потому что в JS месяцы начинаются с 0

        const locale = getLocale();
        return date.toLocaleDateString(locale, {
            weekday: options.weekday ? 'long' : undefined,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        });
    }

    function getMonthName(monthIndex) {
        // Получаем месяцы из переводов если доступна функция t()
        if (typeof t === 'function') {
            const monthKey = `health.months.${monthIndex}`;
            const monthName = t(monthKey);
            // Если ключ не найден, используем fallback
            if (!monthName.startsWith('health.months')) {
                return monthName;
            }
        }

        // Fallback на русские месяцы
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[monthIndex];
    }

    function getMoodEmoji(mood) {
        // Используем константы если доступны (уже с английскими ключами)
        if (typeof HealthConstants !== 'undefined' && HealthConstants.MOOD_EMOJIS) {
            return HealthConstants.MOOD_EMOJIS[mood] || '😐';
        }

        // Fallback с английскими ключами (совместимость)
        const MOOD_EMOJIS = {
            'joy': '😄',
            'satisfaction': '🙂',
            'neutral': '😐',
            'sadness': '😔',
            'stress': '😫',
            'irritability': '😠',
            'anxiety': '😟',
            'fatigue': '😴',
            'energy': '⚡️',
            'calm': '😌',
            // Для обратной совместимости с русскими ключами
            'радость': '😄',
            'удовлетворение': '🙂',
            'нейтрально': '😐',
            'грусть': '😔',
            'стресс': '😫',
            'раздражительность': '😠',
            'беспокойство': '😟',
            'усталость': '😴',
            'энергичность': '⚡️',
            'спокойствие': '😌'
        };
        return MOOD_EMOJIS[mood] || '😐';
    }

    function getIntensityColor(intensity) {
        const INTENSITY_COLORS = {
            1: '#4CAF50',
            2: '#8BC34A',
            3: '#FFC107',
            4: '#FF9800',
            5: '#F44336'
        };
        return INTENSITY_COLORS[intensity] || '#4CAF50';
    }

    // Публичный API
    return {
        formatTime,
        formatDate,
        getMonthName,
        getMoodEmoji,
        getIntensityColor,
        getLocale
    };
})();

// Глобальный экспорт
if (typeof window !== 'undefined') {
    window.HealthFormatters = HealthFormatters;
}