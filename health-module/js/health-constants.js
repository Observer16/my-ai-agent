// health-module/js/health-constants.js
// Константы для модуля здоровья

const HealthConstants = {
    // Настроения из formatters.js (10 вариантов)
    MOOD_EMOJIS: {
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
    },
    
    getMoodOptions: function() {
        return Object.keys(this.MOOD_EMOJIS);
    },
    
    getMoodEmoji: function(mood) {
        return this.MOOD_EMOJIS[mood] || '😐';
    },
    
    getMoodsWithEmojis: function() {
        return Object.entries(this.MOOD_EMOJIS).map(([value, emoji]) => ({
            value,
            emoji,
            label: value.charAt(0).toUpperCase() + value.slice(1)
        }));
    }
};

console.log('✅ HealthConstants загружен');

if (typeof window !== 'undefined') {
    window.HealthConstants = HealthConstants;
}
