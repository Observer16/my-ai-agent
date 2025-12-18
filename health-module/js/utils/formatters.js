// js/utils/formatters.js

const HealthFormatters = (function() {
    function formatTime(timeStr) {
        if (!timeStr) return '--:--';
        return typeof timeStr === 'string' ? timeStr.substring(0, 5) : '--:--';
    }

    function formatDate(dateStr, options = {}) {
        if (!dateStr) return '';

        // Парсим дату в формате YYYY-MM-DD, создавая объект в локальном времени
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month - 1 потому что в JS месяцы начинаются с 0

        return date.toLocaleDateString('ru-RU', {
            weekday: options.weekday ? 'long' : undefined,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        });
    }

    function getMonthName(monthIndex) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[monthIndex];
    }

    function getMoodEmoji(mood) {
        const MOOD_EMOJIS = {
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
        getIntensityColor
    };
})();

// Глобальный экспорт
if (typeof window !== 'undefined') {
    window.HealthFormatters = HealthFormatters;
}