// js/utils/constants.js
const HealthConstants = (function() {
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

    const INTENSITY_COLORS = {
        1: '#4CAF50',
        2: '#8BC34A',
        3: '#FFC107',
        4: '#FF9800',
        5: '#F44336'
    };

    const GENDER_OPTIONS = [
        { value: 'male', label: 'Мужской', icon: '👨', description: 'Стандартные рекомендации для мужчин' },
        { value: 'female', label: 'Женский', icon: '👩', description: 'Включая женское здоровье' },
        { value: 'other', label: 'Другой', icon: '🧑', description: 'Общие рекомендации' },
        { value: 'prefer_not_to_say', label: 'Не указывать', icon: '🙅', description: 'Общие настройки' }
    ];

    return {
        MOOD_EMOJIS,
        INTENSITY_COLORS,
        GENDER_OPTIONS
    };
})();

if (typeof window !== 'undefined') {
    window.HealthConstants = HealthConstants;
}