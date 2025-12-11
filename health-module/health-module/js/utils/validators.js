// health-module/js/utils/validators.js

/**
 * Валидация данных (совместимо с models.py)
 */

/**
 * Проверка валидности настроения
 */
export function isValidMood(mood) {
    const MOOD_OPTIONS = [
        'радость', 'удовлетворение', 'нейтрально', 'грусть',
        'стресс', 'гнев', 'беспокойство', 'усталость', 'энергичность', 'спокойствие'
    ];
    return !mood || MOOD_OPTIONS.includes(mood);
}

/**
 * Проверка валидности часов сна
 */
export function isValidSleepHours(hours) {
    if (hours === null || hours === undefined || hours === '') return true;
    const num = parseFloat(hours);
    return !isNaN(num) && num >= 0 && num <= 24;
}

/**
 * Проверка валидности веса
 */
export function isValidWeight(weight) {
    if (weight === null || weight === undefined || weight === '') return true;
    const num = parseFloat(weight);
    return !isNaN(num) && num > 0 && num < 500;
}

/**
 * Проверка доступности симптома для гендера
 */
export function isSymptomAvailableForGender(category, name, gender) {
    // Импортируем константы
    const BASE_SYMPTOMS = {
        "общее": ["усталость", "слабость", "температура", "озноб", "потливость", "бессонница", "сонливость"],
        "голова": ["головная_боль", "головокружение", "мигрень", "давление"],
        "живот": ["боль_в_животе", "тошнота", "рвота", "диарея", "запор", "вздутие", "изжога"],
        "прочее": ["боль_в_спине", "боль_в_груди", "кашель", "насморк", "боль_в_горле"]
    };

    const FEMALE_SYMPTOMS = {
        "гинекология": [
            "менструальная_боль", "задержка_месячных", "обильные_месячные", "скудные_месячные",
            "нерегулярный_цикл", "ПМС", "овуляторная_боль", "выделения", "зуд", "боль_в_груди", "набухание_груди"
        ]
    };

    const MALE_SYMPTOMS = {
        "урология": [
            "дискомфорт_в_паху", "боль_при_мочеиспускании", "частое_мочеиспускание", "проблемы_с_эрекцией"
        ]
    };

    // Проверяем базовые симптомы
    if (BASE_SYMPTOMS[category] && BASE_SYMPTOMS[category].includes(name)) {
        return true;
    }

    // Проверяем гендерные симптомы
    if (gender === 'female' && FEMALE_SYMPTOMS[category] && FEMALE_SYMPTOMS[category].includes(name)) {
        return true;
    }

    if (gender === 'male' && MALE_SYMPTOMS[category] && MALE_SYMPTOMS[category].includes(name)) {
        return true;
    }

    return false;
}

/**
 * Проверка валидности сексуальной активности для гендера
 */
export function isSexualActivityValid(activity, gender) {
    if (!activity) return true;

    const SEXUAL_ACTIVITY_OPTIONS_BASE = ["нет", "защищенный_секс", "незащищенный_секс", "самостоятельно"];
    const SEXUAL_ACTIVITY_OPTIONS_FEMALE = [...SEXUAL_ACTIVITY_OPTIONS_BASE, "активная_роль", "пассивная_роль", "период_овуляции", "во_время_месячных"];
    const SEXUAL_ACTIVITY_OPTIONS_MALE = [...SEXUAL_ACTIVITY_OPTIONS_BASE, "активная_роль", "пассивная_роль"];

    let validOptions;
    switch(gender) {
        case 'female': validOptions = SEXUAL_ACTIVITY_OPTIONS_FEMALE; break;
        case 'male': validOptions = SEXUAL_ACTIVITY_OPTIONS_MALE; break;
        default: validOptions = SEXUAL_ACTIVITY_OPTIONS_BASE;
    }

    return validOptions.includes(activity);
}