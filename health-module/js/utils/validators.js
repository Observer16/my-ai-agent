// js/utils/validators.js
const HealthValidators = (function() {

    function isValidMood(mood) {
        const MOOD_OPTIONS = [
            'радость', 'удовлетворение', 'нейтрально', 'грусть',
            'стресс', 'гнев', 'беспокойство', 'усталость', 'энергичность', 'спокойствие'
        ];
        return !mood || MOOD_OPTIONS.includes(mood);
    }

    function isValidSleepHours(hours) {
        if (hours === null || hours === undefined || hours === '') return true;
        const num = parseFloat(hours);
        return !isNaN(num) && num >= 0 && num <= 24;
    }

    function isValidWeight(weight) {
        if (weight === null || weight === undefined || weight === '') return true;
        const num = parseFloat(weight);
        return !isNaN(num) && num > 0 && num < 500;
    }

    function isSymptomAvailableForGender(category, name, gender) {
        // Базовые симптомы доступны всем
        const BASE_SYMPTOMS = {
            "общее": ["усталость", "слабость", "температура", "озноб", "потливость", "бессонница", "сонливость"],
            "голова": ["головная боль", "головокружение", "мигрень", "давление", "гул", "потрескивание"],
            "живот": ["боль в животе", "тошнота", "рвота", "диарея", "запор", "вздутие", "изжога"],
            "прочее": ["боль в спине", "боль в груди", "кашель", "насморк", "боль в горле"]
        };

        if (BASE_SYMPTOMS[category] && BASE_SYMPTOMS[category].includes(name)) {
            return true;
        }

        // Женские симптомы
        if (gender === 'female') {
            const FEMALE_SYMPTOMS = {
                "гинекология": [
                    "менструальная боль", "задержка месячных", "обильные месячные", "скудные месячные",
                    "нерегулярный цикл", "ПМС", "овуляторная боль", "выделения", "зуд", "боль в груди", "набухание груди"
                ]
            };
            if (FEMALE_SYMPTOMS[category] && FEMALE_SYMPTOMS[category].includes(name)) {
                return true;
            }
        }

        // Мужские симптомы
        if (gender === 'male') {
            const MALE_SYMPTOMS = {
                "урология": [
                    "дискомфорт в паху", "боль при мочеиспускании", "частое мочеиспускание", "проблемы с эрекцией"
                ]
            };
            if (MALE_SYMPTOMS[category] && MALE_SYMPTOMS[category].includes(name)) {
                return true;
            }
        }

        return false;
    }

    function isSexualActivityValid(activity, gender) {
        if (!activity) return true;

        const SEXUAL_ACTIVITY_OPTIONS_BASE = ["нет", "защищенный секс", "незащищенный секс", "самостоятельно"];
        const SEXUAL_ACTIVITY_OPTIONS_FEMALE = [...SEXUAL_ACTIVITY_OPTIONS_BASE, "активная роль", "пассивная роль", "период овуляции", "во время месячных"];
        const SEXUAL_ACTIVITY_OPTIONS_MALE = [...SEXUAL_ACTIVITY_OPTIONS_BASE, "активная роль", "пассивная роль"];

        let validOptions;
        switch(gender) {
            case 'female': validOptions = SEXUAL_ACTIVITY_OPTIONS_FEMALE; break;
            case 'male': validOptions = SEXUAL_ACTIVITY_OPTIONS_MALE; break;
            default: validOptions = SEXUAL_ACTIVITY_OPTIONS_BASE;
        }

        return validOptions.includes(activity);
    }

    // Публичный API
    return {
        isValidMood,
        isValidSleepHours,
        isValidWeight,
        isSymptomAvailableForGender,
        isSexualActivityValid
    };
})();

// Экспорт
if (typeof window !== 'undefined') {
    window.HealthValidators = HealthValidators;
}