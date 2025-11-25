const CONFIG = {
    API_BASE_URL: 'https://14f66ed9f07e.ngrok-free.app',
    
    ENDPOINTS: {
        // Существующие
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
        
        // Новые
        CREATE_PRODUCT: '/products/create',
        STORES: '/stores',
        CREATE_STORE: '/stores',
        CREATE_EXPENSE: '/expenses/manual',
        
        // Добавлено: последние покупки
        RECENT_PURCHASES: '/purchases/recent'
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
