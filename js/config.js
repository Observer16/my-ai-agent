/**
 * Конфигурация приложения
 */

const CONFIG = {
    // API настройки
    API_URL: 'https://api.smartsaving.fun',
    
    // Версия приложения
    VERSION: '4.1.7',
    
    // Endpoints
    ENDPOINTS: {
        // Базовые
        HEALTH: '/health',
        ROOT: '/',
        
        // Статистика
        STATISTICS: '/statistics',
        STATISTICS_MONTHLY: '/statistics/monthly',
        
        // Продукты
        PRODUCTS: '/products',
        PRODUCTS_CREATE: '/products/create',
        PRODUCTS_DETAIL: '/products',  // + /{id}
        PRODUCTS_SEARCH: '/products/search',
        PRODUCTS_CATEGORY: '/products/category',
        PRODUCTS_BARCODE: '/products/barcode',
        PRODUCTS_BY_CODE: '/products/by-code',  // + /{code}
        
        // Магазины
        STORES: '/stores',
        
        // Категории
        CATEGORIES: '/categories',
        
        // Покупки
        PURCHASES_RECENT: '/purchases/recent',
        EXPENSES_MANUAL: '/expenses/manual',
        
        // Анализ цен
        PRICES_TRENDS: '/prices/trends',
        PRICES_COMPARE: '/prices/compare',
        
        // Загрузка файлов
        UPLOAD_XML: '/upload/xml',
        UPLOAD_XML_BATCH: '/upload/xml/batch',
        PROCESS_FOLDER: '/process/folder',
        
        // Семейная система (НОВОЕ!)
        FAMILY_INFO: '/family/info',
        FAMILY_CREATE: '/family/create',
        FAMILY_MEMBERS: '/family/members',
        FAMILY_INVITE: '/family/invite',
        FAMILY_INVITES_PENDING: '/family/invites/pending',
        FAMILY_INVITE_ACCEPT: '/family/invites',
        FAMILY_INVITE_DECLINE: '/family/invites',
        FAMILY_LEAVE: '/family/leave',
        FAMILY_REMOVE_MEMBER: '/family/members',
        
        // N8n интеграция
        N8N_TEST: '/n8n/test',
        N8N_SEND_REPORT: '/n8n/send-report',
        
        // Отчёты
        REPORTS_PRICE_ANALYSIS: '/reports/price-analysis'
    },
    
    // Настройки пагинации
    PAGINATION: {
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100,
        PRODUCTS_LIMIT: 50,
        PURCHASES_LIMIT: 20
    },
    
    // Настройки отображения
    UI: {
        // Валюта
        CURRENCY: 'PYG',
        CURRENCY_SYMBOL: '₲',
        
        // Локаль
        LOCALE: 'es-PY',
        
        // Форматы дат
        DATE_FORMAT: 'dd/MM/yyyy',
        DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
        
        // Цвета тем
        THEME_COLORS: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#06b6d4'
        }
    },
    
    // Настройки семейной системы
    FAMILY: {
        // Срок действия приглашения (дни)
        INVITE_EXPIRY_DAYS: 7,
        
        // Максимальное количество участников
        MAX_MEMBERS: 10,
        
        // Автоматическая проверка приглашений при запуске
        AUTO_CHECK_INVITES: true,
        
        // Показывать модальное окно приглашения
        SHOW_INVITE_MODAL: true
    },
    
    // Настройки уведомлений
    NOTIFICATIONS: {
        // Длительность показа toast (мс)
        TOAST_DURATION: 3000,
        
        // Позиция toast
        TOAST_POSITION: 'top-right',
        
        // Включить звуковые уведомления
        ENABLE_SOUND: true,
        
        // Включить haptic feedback (вибрацию)
        ENABLE_HAPTIC: true
    },
    
    // Настройки Telegram Web App
    TELEGRAM: {
        // Тема
        USE_TELEGRAM_THEME: true,
        
        // Показывать кнопку "Назад"
        SHOW_BACK_BUTTON: true,
        
        // Показывать главную кнопку
        SHOW_MAIN_BUTTON: false,
        
        // Цвет главной кнопки
        MAIN_BUTTON_COLOR: '#3b82f6'
    },
    
    // Настройки кэширования
    CACHE: {
        // Включить кэширование
        ENABLED: true,
        
        // Время жизни кэша (секунды)
        TTL: {
            STATISTICS: 300,      // 5 минут
            PRODUCTS: 600,        // 10 минут
            STORES: 600,          // 10 минут
            CATEGORIES: 3600,     // 1 час
            FAMILY_INFO: 300      // 5 минут
        }
    },
    
    // Настройки анализа
    ANALYSIS: {
        // Период для трендов цен (дни)
        DEFAULT_TREND_DAYS: 30,
        
        // Порог для "значительного изменения" цены (%)
        SIGNIFICANT_CHANGE_THRESHOLD: 10,
        
        // Количество топ продуктов/магазинов в отчётах
        TOP_ITEMS_COUNT: 10
    },
    
    // Режим разработки
    DEBUG: false,
    
    // Логирование
    LOGGING: {
        ENABLED: true,
        LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        LOG_API_CALLS: true,
        LOG_ERRORS: true
    }
};

// Функции-помощники конфигурации

/**
 * Получить полный URL endpoint
 */
CONFIG.getEndpointURL = function(endpoint) {
    return `${this.API_URL}${endpoint}`;
};

/**
 * Проверка режима разработки
 */
CONFIG.isDev = function() {
    return this.DEBUG || window.location.hostname === 'localhost';
};

/**
 * Логирование (если включено)
 */
CONFIG.log = function(level, ...args) {
    if (!this.LOGGING.ENABLED) return;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const minLevel = levels.indexOf(this.LOGGING.LEVEL);
    const currentLevel = levels.indexOf(level);
    
    if (currentLevel >= minLevel) {
        console[level](...args);
    }
};

/**
 * Форматирование валюты
 */
CONFIG.formatCurrency = function(amount) {
    return new Intl.NumberFormat(this.UI.LOCALE, {
        style: 'currency',
        currency: this.UI.CURRENCY,
        minimumFractionDigits: 0
    }).format(amount);
};

/**
 * Форматирование даты
 */
CONFIG.formatDate = function(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(this.UI.LOCALE, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

/**
 * Форматирование даты и времени
 */
CONFIG.formatDateTime = function(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(this.UI.LOCALE, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

/**
 * Получить цвет темы
 */
CONFIG.getThemeColor = function(colorName) {
    return this.UI.THEME_COLORS[colorName] || this.UI.THEME_COLORS.primary;
};

// Загрузка конфигурации из localStorage (если есть)
if (typeof window !== 'undefined' && window.localStorage) {
    try {
        const savedConfig = localStorage.getItem('app_config');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            Object.assign(CONFIG, parsed);
            CONFIG.log('info', '✅ Конфигурация загружена из localStorage');
        }
    } catch (error) {
        CONFIG.log('error', '❌ Ошибка загрузки конфигурации:', error);
    }
}

// Сохранение конфигурации
CONFIG.save = function() {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            localStorage.setItem('app_config', JSON.stringify({
                API_URL: this.API_URL,
                DEBUG: this.DEBUG,
                FAMILY: this.FAMILY,
                NOTIFICATIONS: this.NOTIFICATIONS,
                TELEGRAM: this.TELEGRAM
            }));
            this.log('info', '✅ Конфигурация сохранена');
        } catch (error) {
            this.log('error', '❌ Ошибка сохранения конфигурации:', error);
        }
    }
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Логируем загрузку конфигурации
CONFIG.log('info', '✅ Конфигурация загружена', {
    version: CONFIG.VERSION,
    api_url: CONFIG.API_URL,
    debug: CONFIG.DEBUG
});
