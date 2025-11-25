class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.cache = new Map();
    }
    
    async get(endpoint, params = {}) {
        const url = this.buildURL(endpoint, params);
        const cacheKey = url;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CONFIG.SETTINGS.CACHE_TIMEOUT) {
                return cached.data;
            }
        }
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw new Error('Ошибка подключения к серверу');
        }
    }
    
    async post(endpoint, body = {}) {
        const url = this.baseURL + endpoint;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw new Error('Ошибка подключения к серверу');
        }
    }
    
    buildURL(endpoint, params = {}) {
        const url = new URL(this.baseURL + endpoint);
        Object.keys(params).forEach(key => {
            if (params[key] != null) {
                url.searchParams.append(key, params[key]);
            }
        });
        return url.toString();
    }
    
    clearCache() {
        this.cache.clear();
    }
}

const api = new APIClient();

const API = {
    // Существующие методы...
    getStatistics: () => api.get(CONFIG.ENDPOINTS.STATISTICS),
    getPriceTrends: (days = 30, productPattern = null, limit = 20) => {
        const params = { days, limit };
        if (productPattern) params.product_pattern = productPattern;
        return api.get(CONFIG.ENDPOINTS.PRICE_TRENDS, params);
    },
    comparePrices: (productPattern = null, limit = 20) => {
        const params = { limit };
        if (productPattern) params.product_pattern = productPattern;
        return api.get(CONFIG.ENDPOINTS.PRICE_COMPARE, params);
    },
    searchProduct: (name) => api.get(CONFIG.ENDPOINTS.PRODUCTS_SEARCH, { name }),
    getPriceAnalysis: (days = 30) => api.get(CONFIG.ENDPOINTS.PRICE_ANALYSIS, { days }),
    
    // Новые методы для категорий
    getCategories: () => api.get(CONFIG.ENDPOINTS.CATEGORIES),
    
    createCategory: (name, description = null, parentId = null) => {
        return api.post(CONFIG.ENDPOINTS.CATEGORIES, {
            name,
            description,
            parent_id: parentId
        });
    },
    
    deleteCategory: (categoryId) => {
        return api.delete(CONFIG.ENDPOINTS.CATEGORIES + '/' + categoryId);
    },
    
    // Новые методы для товаров
    getProducts: (categoryId = null, search = null, limit = 100) => {
        const params = { limit };
        if (categoryId) params.category_id = categoryId;
        if (search) params.search = search;
        return api.get(CONFIG.ENDPOINTS.PRODUCTS, params);
    },
    
    getProductDetails: (productId) => {
        return api.get(CONFIG.ENDPOINTS.PRODUCT_DETAILS + '/' + productId);
    },
    
    updateProductCategory: (productId, categoryId) => {
        return api.put(CONFIG.ENDPOINTS.UPDATE_PRODUCT_CATEGORY, {
            product_id: productId,
            category_id: categoryId
        });
    }
};

console.log('✅ API Client готов');
