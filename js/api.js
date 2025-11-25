// Профессиональный API Client для Mini App
class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.cache = new Map();
    }
    
    /**
     * GET запрос с кэшированием
     */
    async get(endpoint, params = {}, options = {}) {
        const { useCache = true, forceRefresh = false } = options;
        const url = this.buildURL(endpoint, params);
        const cacheKey = url;
        
        // Проверить кэш
        if (useCache && !forceRefresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CONFIG.SETTINGS.CACHE_TIMEOUT) {
                console.log('📦 Из кэша:', endpoint);
                return cached.data;
            }
        }
        
        try {
            const response = await this.fetchWithRetry(url, { method: 'GET' });
            const data = await response.json();
            
            // Сохранить в кэш
            if (useCache) {
                this.cache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
            }
            
            return data;
        } catch (error) {
            console.error('❌ GET Error:', endpoint, error);
            throw this.handleError(error);
        }
    }
    
    /**
     * POST запрос
     */
    async post(endpoint, body = {}) {
        const url = this.baseURL + endpoint;
        
        try {
            const response = await this.fetchWithRetry(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            return await response.json();
        } catch (error) {
            console.error('❌ POST Error:', endpoint, error);
            throw this.handleError(error);
        }
    }
    
    /**
     * Fetch с retry логикой
     */
    async fetchWithRetry(url, options = {}, attempt = 1) {
        const maxAttempts = CONFIG.SETTINGS.RETRY_ATTEMPTS;
        
        try {
            return await this.fetchWithTimeout(url, options);
        } catch (error) {
            if (attempt < maxAttempts && !error.message.includes('401')) {
                console.log(`🔄 Повтор ${attempt}/${maxAttempts}:`, url);
                await this.delay(1000 * attempt);
                return this.fetchWithRetry(url, options, attempt + 1);
            }
            throw error;
        }
    }
    
    /**
     * Fetch с таймаутом (исправленный)
     */
    async fetchWithTimeout(url, options = {}) {
        const timeout = CONFIG.SETTINGS.REQUEST_TIMEOUT;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const fetchOptions = {
                signal: controller.signal,
                mode: 'cors',
                cache: 'no-cache'
            };
            
            // Добавить метод
            if (options.method) {
                fetchOptions.method = options.method;
            }
            
            // Добавить body для POST
            if (options.body) {
                fetchOptions.body = options.body;
                fetchOptions.headers = {
                    'Content-Type': 'application/json'
                };
            }
            
            const response = await fetch(url, fetchOptions);
            clearTimeout(id);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }
            
            return response;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error('Превышен таймаут запроса');
            }
            throw error;
        }
    }
    
    /**
     * Построить URL с параметрами
     */
    buildURL(endpoint, params = {}) {
        const url = new URL(this.baseURL + endpoint);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        return url.toString();
    }
    
    /**
     * Обработка ошибок
     */
    handleError(error) {
        if (error.message.includes('таймаут')) {
            return new Error('⏱️ Сервер не отвечает');
        } else if (error.message.includes('Failed to fetch')) {
            return new Error('🌐 Проблема с подключением');
        } else if (error.message.includes('401')) {
            return new Error('🔐 Ошибка авторизации');
        } else if (error.message.includes('500')) {
            return new Error('⚠️ Ошибка сервера');
        }
        return error;
    }
    
    /**
     * Задержка
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Очистить кэш
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Кэш очищен');
    }
}

// Глобальный экземпляр
const api = new APIClient();

// API методы (без изменений)
const API = {
    async healthCheck() {
        return await api.get(CONFIG.ENDPOINTS.HEALTH, {}, { useCache: false });
    },
    
    async getStatistics() {
        return await api.get(CONFIG.ENDPOINTS.STATISTICS);
    },
    
    async getPriceTrends(days = 30, productPattern = null, limit = 20) {
        const params = { days, limit };
        if (productPattern) params.product_pattern = productPattern;
        return await api.get(CONFIG.ENDPOINTS.PRICE_TRENDS, params);
    },
    
    async comparePrices(productPattern = null, limit = 20) {
        const params = { limit };
        if (productPattern) params.product_pattern = productPattern;
        return await api.get(CONFIG.ENDPOINTS.PRICE_COMPARE, params);
    },
    
    async searchProduct(name) {
        return await api.get(CONFIG.ENDPOINTS.PRODUCTS_SEARCH, { name });
    },
    
    async getPriceAnalysis(days = 30) {
        return await api.get(CONFIG.ENDPOINTS.PRICE_ANALYSIS, { days });
    }
};

console.log('✅ API Client готов');
```

## Проверка после исправлений

После изменений перезапусти:

1. **Backend**: `python api_server.py`
2. **Ngrok**: если запущен, перезапусти
3. **Frontend**: Hard refresh в Telegram (закрой и открой Mini App заново)

В логах должны появиться **GET** запросы вместо только OPTIONS:
```
INFO: GET /statistics - 200 OK
INFO: GET /prices/trends?days=7&limit=50 - 200 OK
INFO: GET /prices/compare?limit=50 - 200 OK
