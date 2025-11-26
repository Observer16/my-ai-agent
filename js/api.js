// Обновленный js/api.js с поддержкой авторизации
// Версия 3.2 - Telegram WebApp Auth

const API = {
    cache: new Map(),
    cacheTimeout: CONFIG.SETTINGS.CACHE_TIMEOUT,
    
    /**
     * Получить Telegram User ID из WebApp
     */
    getTelegramUserId() {
        return CONFIG.TELEGRAM.user?.id || null;
    },
    
    /**
     * Получить заголовки с авторизацией
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        };
        
        // Добавляем Telegram User ID если доступен
        const userId = this.getTelegramUserId();
        if (userId) {
            headers['X-Telegram-User-Id'] = userId.toString();
        }
        
        return headers;
    },
    
    /**
     * Базовый метод для запросов
     */
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        const defaultOptions = {
            headers: this.getHeaders(),
            ...options
        };
        
        try {
            console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
            
            const response = await fetch(url, defaultOptions);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ 
                    detail: `HTTP ${response.status}` 
                }));
                
                // Обработка ошибок авторизации
                if (response.status === 401) {
                    console.error('❌ Требуется авторизация');
                    throw new Error('Требуется авторизация в Telegram');
                }
                
                if (response.status === 403) {
                    console.error('❌ Доступ запрещен');
                    throw new Error(error.detail || 'Недостаточно прав доступа');
                }
                
                throw new Error(error.detail || `Ошибка: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ API Response: ${endpoint}`, data);
            return data;
            
        } catch (error) {
            console.error(`❌ API Error: ${endpoint}`, error);
            throw error;
        }
    },
    
    /**
     * GET запрос с кэшированием
     */
    async get(endpoint, useCache = true) {
        const cacheKey = endpoint;
        
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log(`📦 Cache hit: ${endpoint}`);
                return cached.data;
            }
        }
        
        const data = await this.request(endpoint, { method: 'GET' });
        
        if (useCache) {
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
        }
        
        return data;
    },
    
    /**
     * POST запрос
     */
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },
    
    /**
     * PUT запрос
     */
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },
    
    /**
     * DELETE запрос
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    },
    
    /**
     * Очистить кэш
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    },
    
    // ==================== AUTH ENDPOINTS ====================
    
    /**
     * Получить информацию о текущем пользователе
     */
    async getUserInfo() {
        return this.get(CONFIG.ENDPOINTS.GET_USER_INFO, false);
    },
    
    /**
     * Проверить доступ к ресурсу
     */
    async checkAccess(resource, action = 'read') {
        return this.get(
            `${CONFIG.ENDPOINTS.CHECK_ACCESS}?resource=${resource}&action=${action}`,
            false
        );
    },
    
    /**
     * Зарегистрировать пользователя
     */
    async registerUser(username, firstName, lastName) {
        const params = new URLSearchParams();
        if (username) params.append('username', username);
        if (firstName) params.append('first_name', firstName);
        if (lastName) params.append('last_name', lastName);
        
        return this.post(
            `/auth/register?${params.toString()}`,
            {}
        );
    },
    
    // ==================== STATISTICS ====================
    
    async getStatistics() {
        return this.get(CONFIG.ENDPOINTS.STATISTICS);
    },
    
    async getMonthlyStatistics(year, month) {
        let endpoint = CONFIG.ENDPOINTS.MONTHLY_STATISTICS;
        const params = new URLSearchParams();
        
        if (year) params.append('year', year);
        if (month) params.append('month', month);
        
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        
        return this.get(endpoint);
    },
    
    // ==================== PRICES ====================
    
    async getPriceTrends(days = 30, search = null, limit = 50) {
        const params = new URLSearchParams({ days, limit });
        if (search) params.append('search', search);
        
        return this.get(`${CONFIG.ENDPOINTS.PRICE_TRENDS}?${params.toString()}`);
    },
    
    async comparePrices(search = null, limit = 50) {
        const params = new URLSearchParams({ limit });
        if (search) params.append('search', search);
        
        return this.get(`${CONFIG.ENDPOINTS.PRICE_COMPARE}?${params.toString()}`);
    },
    
    // ==================== PRODUCTS ====================
    
    async getProducts(categoryId = null, search = null, limit = 100) {
        const params = new URLSearchParams({ limit });
        if (categoryId) params.append('category_id', categoryId);
        if (search) params.append('search', search);
        
        return this.get(`${CONFIG.ENDPOINTS.PRODUCTS}?${params.toString()}`);
    },
    
    async getProductDetails(productId) {
        return this.get(`${CONFIG.ENDPOINTS.PRODUCT_DETAILS}/${productId}`);
    },
    
    async updateProductCategory(productId, categoryId) {
        return this.put(CONFIG.ENDPOINTS.UPDATE_PRODUCT_CATEGORY, {
            product_id: productId,
            category_id: categoryId
        });
    },
    
    async createProduct(productData) {
        return this.post(CONFIG.ENDPOINTS.CREATE_PRODUCT, productData);
    },
    
    // ==================== CATEGORIES ====================
    
    async getCategories() {
        return this.get(CONFIG.ENDPOINTS.CATEGORIES);
    },
    
    async createCategory(name, description, parentId) {
        return this.post(CONFIG.ENDPOINTS.CATEGORIES, {
            name,
            description,
            parent_id: parentId
        });
    },
    
    // ==================== STORES ====================
    
    async getStores() {
        return this.get(CONFIG.ENDPOINTS.STORES);
    },
    
    async createStore(name, storeType) {
        return this.post(CONFIG.ENDPOINTS.CREATE_STORE, {
            name,
            store_type: storeType
        });
    },
    
    // ==================== EXPENSES ====================
    
    async createExpense(expenseData) {
        return this.post(CONFIG.ENDPOINTS.CREATE_EXPENSE, expenseData);
    },
    
    async getRecentPurchases(days = 7) {
        return this.get(`${CONFIG.ENDPOINTS.RECENT_PURCHASES}?days=${days}`);
    },
    
    // ==================== ADMIN ====================
    
    async getAllUsers() {
        return this.get('/admin/users', false);
    },
    
    async updateUserRole(userTelegramId, newRole) {
        return this.put(
            `/admin/users/${userTelegramId}/role?new_role=${newRole}`,
            {}
        );
    }
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

// Проверяем авторизацию при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    const userId = API.getTelegramUserId();
    
    if (!userId) {
        console.warn('⚠️ Telegram User ID не найден');
        return;
    }
    
    console.log('✅ Telegram User ID:', userId);
    
    // Пытаемся получить информацию о пользователе
    try {
        const userInfo = await API.getUserInfo();
        console.log('✅ User info:', userInfo);
        
        // Сохраняем в глобальную переменную
        window.currentUser = userInfo;
        
        // Показываем роль пользователя в консоли
        console.log(`👤 Роль: ${userInfo.role}`);
        
    } catch (error) {
        console.warn('⚠️ Ошибка получения информации о пользователе:', error);
        
        // Если пользователь не найден, пытаемся зарегистрировать
        if (error.message.includes('не найден')) {
            try {
                const user = CONFIG.TELEGRAM.user;
                await API.registerUser(
                    user.username,
                    user.first_name,
                    user.last_name
                );
                console.log('✅ Пользователь зарегистрирован как guest');
            } catch (registerError) {
                console.error('❌ Ошибка регистрации:', registerError);
            }
        }
    }
});

console.log('✅ API module loaded (with auth)');
