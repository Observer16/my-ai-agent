// Обновленный js/config.js с поддержкой авторизации

const CONFIG = {
    API_BASE_URL: 'https://c053e0b76144.ngrok-free.app',
    
    ENDPOINTS: {
        STATISTICS: '/statistics',
        MONTHLY_STATISTICS: '/statistics/monthly',
        PRICE_TRENDS: '/prices/trends',
        PRICE_COMPARE: '/prices/compare',
        PRODUCTS_SEARCH: '/products/search',
        PRICE_ANALYSIS: '/reports/price-analysis',
        CATEGORIES: '/categories',
        PRODUCTS: '/products',
        PRODUCT_DETAILS: '/products',
        UPDATE_PRODUCT_CATEGORY: '/products/category',
        UPDATE_PRODUCT_BARCODE: '/products/barcode',
        CREATE_PRODUCT: '/products/create',
        STORES: '/stores',
        CREATE_STORE: '/stores',
        CREATE_EXPENSE: '/expenses/manual',
        RECENT_PURCHASES: '/purchases/recent',
        PRODUCT_BY_BARCODE: '/products/by-barcode',

        // Family endpoints:
        FAMILY_INFO: '/family/info',
        FAMILY_CREATE: '/family/create',
        FAMILY_MEMBERS: '/family/members',
        FAMILY_INVITE: '/family/invite',
        FAMILY_INVITES_PENDING: '/family/invites/pending',
        FAMILY_INVITE_ACCEPT: '/family/invites',  // + /{token}/accept
        FAMILY_INVITE_DECLINE: '/family/invites', // + /{token}/decline
        FAMILY_LEAVE: '/family/leave',
        FAMILY_REMOVE_MEMBER: '/family/members',  // + /{telegram_id}
        
    },
    
    SETTINGS: {
        CACHE_TIMEOUT: 5 * 60 * 1000,
        REQUEST_TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3,
        DEFAULT_DAYS: 30,
        DEFAULT_LIMIT: 20
    },
    
    LOCALE: 'ru-RU',
    CURRENCY: '₲',
    
    // Telegram WebApp
    TELEGRAM: {
        user: null,
        initData: null,
        initDataUnsafe: null,
    }
};

// Инициализация Telegram WebApp
if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Сохраняем данные пользователя
    CONFIG.TELEGRAM.user = tg.initDataUnsafe?.user;
    CONFIG.TELEGRAM.initData = tg.initData;
    CONFIG.TELEGRAM.initDataUnsafe = tg.initDataUnsafe;
    
    console.log('✅ Telegram User ID:', CONFIG.TELEGRAM.user?.id);
}

console.log('✅ Config загружен');
