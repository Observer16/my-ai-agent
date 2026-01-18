// js/utils/constants.js
const HealthConstants = (function() {
    // Настроения используют английские ключи (language-independent)
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
        'calm': '😌'
    };

    const INTENSITY_COLORS = {
        1: '#4CAF50',
        2: '#8BC34A',
        3: '#FFC107',
        4: '#FF9800',
        5: '#F44336'
    };

    // Гендерные опции (также используют английские ключи)
    const GENDER_OPTIONS = [
        { value: 'male', icon: '👨' },
        { value: 'female', icon: '👩' },
        { value: 'other', icon: '🧑' },
        { value: 'prefer_not_to_say', icon: '🙅' }
    ];

    /**
     * Получить локализованный ярлык настроения
     * @param {string} moodKey - Английский ключ настроения
     * @returns {string} - Локализованный ярлык
     */
    function getMoodLabel(moodKey) {
        if (typeof t === 'function') {
            return t(`health.moods.${moodKey}`);
        }
        return moodKey; // fallback
    }

    /**
     * Получить локализованные опции гендера
     * @returns {array} - Массив опций гендера с переводом
     */
    function getGenderOptions() {
        return GENDER_OPTIONS.map(option => {
            const label = typeof t === 'function' ? t(`health.genders.${option.value}.label`) : option.value;
            const description = typeof t === 'function' ? t(`health.genders.${option.value}.description`) : '';

            return {
                value: option.value,
                label: label,
                description: description,
                icon: option.icon
            };
        });
    }

    /**
     * Получить локализованные формы лекарств
     * @returns {array} - Массив форм с переводом
     */
    function getMedicationForms() {
        const forms = [
            'tablet', 'capsule', 'syrup', 'solution', 'ointment',
            'cream', 'drops', 'spray', 'powder', 'other'
        ];

        return forms.map(formKey => ({
            value: formKey,
            label: typeof t === 'function' ? t(`health.medicationForms.${formKey}`) : formKey
        }));
    }

    return {
        MOOD_EMOJIS,
        INTENSITY_COLORS,
        GENDER_OPTIONS,
        getMoodLabel,           // NEW
        getGenderOptions,       // NEW
        getMedicationForms      // NEW
    };
})();

if (typeof window !== 'undefined') {
    window.HealthConstants = HealthConstants;
}