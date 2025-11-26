const CONFIG = {
    API_BASE_URL: 'https://c053e0b76144.ngrok-free.app',
    
    ENDPOINTS: {
        STATISTICS: '/statistics',
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
        MONTHLY_STATISTICS: '/statistics/monthly',
        CREATE_STORE: '/stores',
        CREATE_EXPENSE: '/expenses/manual',
        RECENT_PURCHASES: '/purchases/recent',
        PRODUCT_BY_BARCODE: '/products/by-barcode'
    },
    
    SETTINGS: {
        CACHE_TIMEOUT: 5 * 60 * 1000,
        REQUEST_TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3,
        DEFAULT_DAYS: 30,
        DEFAULT_LIMIT: 20
    },
    
    LOCALE: 'ru-RU',
    CURRENCY: '₲'
};

if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.enableClosingConfirmation();
}

console.log('✅ Config загружен');
