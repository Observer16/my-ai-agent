// API Client для Mini App
class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.cache = new Map();
    }
    
    /**
     * Выполнить GET запрос
     */
    async get(endpoint, params = {}, useCache = true) {
        const url = this.buildURL(endpoint, params);
        const cacheKey = url;
        
        // Проверить кэш
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CONFIG.SETTINGS.CACHE_TIMEOUT) {
                console.log('📦 Из кэша:', endpoint);
                return cached.data;
            }
        }
        
        try {
            const response = await this.fetchWithTimeout(url);
            const data = await response.json();
            
            // Сохранить в кэш
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }
    
    /**
     * Выполнить POST запрос
     */
    async post(endpoint, body = {}) {
        const url = this.baseURL + endpoint;
        
        try {
            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            return await response.json();
        } catch (error) {
            console.error('❌ API Error:', error);
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
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
     * Очистить кэш
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Кэш очищен');
    }
}

// Создать глобальный экземпляр
const api = new APIClient();

// API методы для удобства
const API = {
    // === БЮДЖЕТ ===
    
    /**
     * Получить статистику
     */
    async getStatistics() {
        return await api.get(CONFIG.ENDPOINTS.STATISTICS);
    },
    
    /**
     * Получить тренды цен
     */
    async getPriceTrends(days = 30, limit = 20) {
        return await api.get(CONFIG.ENDPOINTS.PRICE_TRENDS, { days, limit });
    },
    
    /**
     * Сравнить цены
     */
    async comparePrices(limit = 20) {
        return await api.get(CONFIG.ENDPOINTS.PRICE_COMPARE, { limit });
    },
    
    // === ЗДОРОВЬЕ (заготовки) ===
    
    /**
     * Записать самочувствие
     */
    async logHealth(data) {
        return await api.post(CONFIG.ENDPOINTS.HEALTH_LOG, data);
    },
    
    /**
     * Получить статистику здоровья
     */
    async getHealthStats(days = 30) {
        return await api.get(CONFIG.ENDPOINTS.HEALTH_STATS, { days });
    },
    
    // === АКТИВНОСТЬ (заготовки) ===
    
    /**
     * Записать тренировку
     */
    async logActivity(data) {
        return await api.post(CONFIG.ENDPOINTS.ACTIVITY_LOG, data);
    },
    
    /**
     * Получить статистику активности
     */
    async getActivityStats(days = 30) {
        return await api.get(CONFIG.ENDPOINTS.ACTIVITY_STATS, { days });
    },
    
    // === AI ДОКТОР (заготовка) ===
    
    /**
     * Отправить вопрос доктору
     */
    async askDoctor(question) {
        return await api.post(CONFIG.ENDPOINTS.DOCTOR_CHAT, { question });
    }
};

console.log('✅ API Client готов');
