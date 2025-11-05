// Конфигурация Mini App
const CONFIG = {
    // API endpoints
    API_BASE_URL: 'https://твой-api.ngrok-free.app', // ЗАМЕНИ на свой Static Domain!
    
    // Endpoints
    ENDPOINTS: {
        // Бюджет
        STATISTICS: '/statistics',
        PRICE_TRENDS: '/prices/trends',
        PRICE_COMPARE: '/prices/compare',
        
        // Здоровье (добавишь позже)
        HEALTH_LOG: '/health/log',
        HEALTH_STATS: '/health/stats',
        
        // Активность (добавишь позже)
        ACTIVITY_LOG: '/activity/log',
        ACTIVITY_STATS: '/activity/stats',
        
        // AI Доктор (добавишь позже)
        DOCTOR_CHAT: '/doctor/chat'
    },
    
    // Настройки
    SETTINGS: {
        CACHE_TIMEOUT: 5 * 60 * 1000, // 5 минут
        REQUEST_TIMEOUT: 10000, // 10 секунд
        RETRY_ATTEMPTS: 3
    },
    
    // Локализация
    LOCALE: 'ru-RU',
    CURRENCY: '₲',
    
    // Telegram WebApp
    TELEGRAM: {
        // Будет заполнено автоматически
        user: null,
        theme: null
    }
};

// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Развернуть на весь экран
    tg.expand();
    
    // Сохранить данные пользователя
    CONFIG.TELEGRAM.user = tg.initDataUnsafe.user;
    CONFIG.TELEGRAM.theme = tg.themeParams;
    
    // Показать кнопку "Назад"
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.history.back();
        } else {
            tg.close();
        }
    });
    
    // Включить подтверждение закрытия
    tg.enableClosingConfirmation();
    
    console.log('✅ Telegram WebApp инициализирован');
    console.log('User:', CONFIG.TELEGRAM.user);
}
