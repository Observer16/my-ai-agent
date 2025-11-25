// Профессиональный API Client для Mini App
class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
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
            const response = await this.fetchWithRetry(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
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
    async post(endpoint, body = {}, options = {}) {
        const url = this.baseURL + endpoint;
        
        try {
            const response = await this.fetchWithRetry(url, {
                method: 'POST',
                headers: {
                    ...this.getHeaders(),
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
     * Загрузка файла
     */
    async uploadFile(endpoint, file, fieldName = 'file') {
        const url = this.baseURL + endpoint;
        const formData = new FormData();
        formData.append(fieldName, file);
        
        try {
            const response = await this.fetchWithRetry(url, {
                method: 'POST',
                headers: this.getHeaders(false), // Без Content-Type для FormData
                body: formData
            });
            
            return await response.json();
        } catch (error) {
            console.error('❌ Upload Error:', endpoint, error);
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
            if (attempt < maxAttempts) {
                console.log(`🔄 Повтор ${attempt}/${maxAttempts}:`, url);
                await this.delay(1000 * attempt); // Экспоненциальная задержка
                return this.fetchWithRetry(url, options, attempt + 1);
            }
            throw error;
        }
    }
    
    /**
     * Fetch с таймаутом
     */
    async fetchWithTimeout(url, options = {}) {
        const timeout = CONFIG.SETTINGS.REQUEST_TIMEOUT;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
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
     * Получить заголовки
     */
    getHeaders(includeContentType = true) {
        const headers = {};
        
        // Добавить Telegram init data для авторизации
        if (CONFIG.TELEGRAM.initData) {
            headers['X-Telegram-Init-Data'] = CONFIG.TELEGRAM.initData;
        }
        
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        
        return headers;
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

// API методы
const API = {
    // === СИСТЕМНЫЕ ===
    
    async healthCheck() {
        return await api.get(CONFIG.ENDPOINTS.HEALTH, {}, { useCache: false });
    },
    
    async getStatistics() {
        return await api.get(CONFIG.ENDPOINTS.STATISTICS);
    },
    
    // === ЦЕНЫ ===
    
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
    
    // === ОТЧЕТЫ ===
    
    async getPriceAnalysis(days = 30) {
        return await api.get(CONFIG.ENDPOINTS.PRICE_ANALYSIS, { days });
    },
    
    // === ЗАГРУЗКА ===
    
    async uploadXML(file) {
        return await api.uploadFile(CONFIG.ENDPOINTS.UPLOAD_XML, file);
    },
    
    async processFolder(folderPath = null) {
        const params = folderPath ? { folder_path: folderPath } : {};
        return await api.post(CONFIG.ENDPOINTS.PROCESS_FOLDER, {}, params);
    },
    
    // === N8N ===
    
    async testN8N() {
        return await api.post(CONFIG.ENDPOINTS.N8N_TEST);
    },
    
    async sendReportToN8N(reportType) {
        return await api.post(CONFIG.ENDPOINTS.N8N_SEND_REPORT + `?report_type=${reportType}`);
    },
    
    // === ЗДОРОВЬЕ (заготовки) ===
    
    async logHealth(data) {
        return await api.post(CONFIG.ENDPOINTS.HEALTH_LOG, data);
    },
    
    async getHealthStats(days = 30) {
        return await api.get(CONFIG.ENDPOINTS.HEALTH_STATS, { days });
    },
    
    // === АКТИВНОСТЬ (заготовки) ===
    
    async logActivity(data) {
        return await api.post(CONFIG.ENDPOINTS.ACTIVITY_LOG, data);
    },
    
    async getActivityStats(days = 30) {
        return await api.get(CONFIG.ENDPOINTS.ACTIVITY_STATS, { days });
    },
    
    // === AI ДОКТОР (заготовка) ===
    
    async askDoctor(question) {
        return await api.post(CONFIG.ENDPOINTS.DOCTOR_CHAT, { question });
    }
};

console.log('✅ API Client готов');
