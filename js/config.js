// Конфигурация Mini App
const CONFIG = {
    // API endpoints
    API_BASE_URL: 'https://14f66ed9f07e.ngrok-free.app',
    
    // Endpoints
    ENDPOINTS: {
        // Системные
        HEALTH: '/health',
        STATISTICS: '/statistics',
        
        // Загрузка файлов
        UPLOAD_XML: '/upload/xml',
        UPLOAD_XML_BATCH: '/upload/xml/batch',
        PROCESS_FOLDER: '/process/folder',
        
        // Анализ цен
        PRICE_TRENDS: '/prices/trends',
        PRICE_COMPARE: '/prices/compare',
        PRODUCTS_SEARCH: '/products/search',
        
        // Отчеты
        PRICE_ANALYSIS: '/reports/price-analysis',
        
        // N8n интеграция
        N8N_TEST: '/n8n/test',
        N8N_SEND_REPORT: '/n8n/send-report',
        
        // Здоровье (будущее)
        HEALTH_LOG: '/health/log',
        HEALTH_STATS: '/health/stats',
        
        // Активность (будущее)
        ACTIVITY_LOG: '/activity/log',
        ACTIVITY_STATS: '/activity/stats',
        
        // AI Доктор (будущее)
        DOCTOR_CHAT: '/doctor/chat'
    },
    
    // Настройки
    SETTINGS: {
        CACHE_TIMEOUT: 5 * 60 * 1000, // 5 минут
        REQUEST_TIMEOUT: 10000, // 10 секунд
        RETRY_ATTEMPTS: 3,
        DEFAULT_DAYS: 30,
        DEFAULT_LIMIT: 20
    },
    
    // Локализация
    LOCALE: 'ru-RU',
    CURRENCY: '₲',
    
    // Telegram WebApp
    TELEGRAM: {
        user: null,
        theme: null,
        initData: null
    }
};

// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    
    tg.expand();
    tg.enableClosingConfirmation();
    
    CONFIG.TELEGRAM.user = tg.initDataUnsafe.user;
    CONFIG.TELEGRAM.theme = tg.themeParams;
    CONFIG.TELEGRAM.initData = tg.initData;
    
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.history.back();
        } else {
            tg.close();
        }
    });
    
    console.log('✅ Telegram WebApp инициализирован');
}
