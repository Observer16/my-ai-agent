// constants/config.js
const HealthConfig = {
    // Основные настройки
    APP_NAME: 'Модуль здоровья',
    VERSION: '1.0.0',

    // Пути
    COMPONENTS_PATH: 'components/',

    // Таймауты
    LOADING_TIMEOUT: 10000, // 10 секунд
    CACHE_DURATION: 5 * 60 * 1000, // 5 минут

    // Настройки API
    API_RETRY_ATTEMPTS: 3,
    API_RETRY_DELAY: 1000,

    // Настройки UI
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000,

    // Названия вкладок
    TAB_TITLES: {
        dashboard: 'Сегодня',
        medications: 'Аптечка',
        diary: 'Дневник',
        stats: 'Статистика'
    },

    // Гендерные опции
    GENDER_OPTIONS: [
        { value: 'male', label: 'Мужской', icon: '👨' },
        { value: 'female', label: 'Женский', icon: '👩' },
        { value: 'other', label: 'Другой', icon: '👤' }
    ],

    // Настроение
    MOOD_OPTIONS: [
        { value: 1, label: 'Ужасно', emoji: '😭', color: '#e74c3c' },
        { value: 2, label: 'Плохо', emoji: '😔', color: '#e67e22' },
        { value: 3, label: 'Нормально', emoji: '😐', color: '#f1c40f' },
        { value: 4, label: 'Хорошо', emoji: '🙂', color: '#2ecc71' },
        { value: 5, label: 'Отлично', emoji: '😄', color: '#27ae60' }
    ],

    // Статус приема лекарств
    MEDICATION_STATUS: {
        TAKEN: { value: 'taken', label: 'Принято', color: '#27ae60' },
        SKIPPED: { value: 'skipped', label: 'Пропущено', color: '#e74c3c' },
        DELAYED: { value: 'delayed', label: 'Отложено', color: '#f39c12' }
    },

    // Цвета темы
    COLORS: {
        primary: '#3498db',
        secondary: '#2ecc71',
        danger: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db',
        success: '#27ae60',
        light: '#f8f9fa',
        dark: '#343a40'
    }
};

if (typeof window !== 'undefined') {
    window.HealthConfig = HealthConfig;
}