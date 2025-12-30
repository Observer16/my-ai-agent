// health-module/js/health-constants.js

/**
 * Константы для модуля здоровья
 */
const HealthConstants = (function() {
    const constants = {
        // Настроения с эмодзи
        MOOD_EMOJIS: {
            'радость': '😄',
            'удовлетворение': '🙂',
            'нейтрально': '😐',
            'грусть': '😔',
            'возбуждение': '😍',
            'тревога': '😰',
            'гнев': '😠',
            'спокойствие': '😌'
        },

        // Получить список настроений
        getMoodOptions: function() {
            return Object.keys(this.MOOD_EMOJIS);
        },

        // Получить эмодзи для настроения
        getMoodEmoji: function(mood) {
            return this.MOOD_EMOJIS[mood] || '😐';
        },

        // Получить все настроения с эмодзи
        getMoodsWithEmojis: function() {
            return Object.entries(this.MOOD_EMOJIS).map(([value, emoji]) => ({
                value,
                emoji,
                label: value.charAt(0).toUpperCase() + value.slice(1)
            }));
        }
    };

    return constants;
})();

// Экспорт
if (typeof window !== 'undefined') {
    window.HealthConstants = HealthConstants;
}

console.log('✅ HealthConstants загружен');
