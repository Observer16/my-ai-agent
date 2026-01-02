/**
 * API клиент для системы семейного бюджета
 * Версия: - С кэшированием
 */

class APIClient {
    constructor() {
        // 🔴 ВАЖНО: проверяем что config.js загружен
        if (typeof window.CONFIG === 'undefined') {
            throw new Error('CONFIG не загружен. Загрузите config.js перед api.js');
        }

        // 🔴 ВАЖНО: проверяем что API_URL существует
        if (!window.CONFIG.API_URL) {
            throw new Error('API_URL не настроен в config.js');
        }

        // ✅ Используем URL ТОЛЬКО из config.js
        this.baseURL = window.CONFIG.API_URL;
        console.log('✅ API URL из config.js:', this.baseURL);

        // Telegram User ID из Telegram Web App
        this.telegramUserId = null;

        // Инициализация Telegram Web App
        this.initTelegram();
        
        // 🆕 Инициализация кэша (если доступен)
        this.cache = window.Cache || null;
        if (this.cache) {
            console.log('✅ Кэширование активировано');
        }
    }

    /**
     * Инициализация Telegram Web App
     */
    initTelegram() {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();

            // Получаем данные пользователя
            if (tg.initDataUnsafe?.user) {
                this.telegramUserId = tg.initDataUnsafe.user.id;
                console.log('✅ Telegram User ID:', this.telegramUserId);
            } else {
                console.warn('⚠️ Telegram User ID не найден');
            }
        } else {
            console.warn('⚠️ Telegram WebApp не обнаружен');
        }
    }

    /**
     * Получение заголовков для запросов
     */
    getHeaders(includeContentType = true) {
        const headers = {};

        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }

        // Добавляем Telegram User ID если есть
        if (this.telegramUserId) {
            headers['X-Telegram-User-Id'] = this.telegramUserId;
        }

        // ✅ NGROK FIX: пропускаем warning страницу
        headers['ngrok-skip-browser-warning'] = 'true';

        return headers;
    }
    
    /**
     * Извлечь параметры из endpoint
     */
    extractParams(endpoint) {
        const [path, query] = endpoint.split('?');
        if (!query) return { path, params: null };
        
        const params = {};
        query.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            params[key] = value;
        });
        
        return { path, params };
    }

    /**
     * Базовый метод для GET запросов (С КЭШИРОВАНИЕМ)
     */
    async get(endpoint, includeAuth = true) {
        try {
            // 🆕 Проверяем кэш
            if (this.cache) {
                const { path, params } = this.extractParams(endpoint);
                const cached = this.cache.get(path, params);
                
                if (cached !== null) {
                    return cached;
                }
            }
            
            // Запрос к API
            const headers = includeAuth ? this.getHeaders(false) : {
                'ngrok-skip-browser-warning': 'true'
            };

            const fullUrl = `${this.baseURL}${endpoint}`;
            console.log(`🌐 GET ${fullUrl}`);

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorDetail = 'Ошибка запроса';

                try {
                    const errorJson = JSON.parse(errorText);
                    errorDetail = errorJson.detail || errorDetail;
                } catch (e) {
                    errorDetail = errorText || `HTTP ${response.status}`;
                }

                throw new Error(errorDetail);
            }

            const data = await response.json();
            
            // 🆕 Сохраняем в кэш
            if (this.cache) {
                const { path, params } = this.extractParams(endpoint);
                this.cache.set(path, data, params);
            }

            return data;
        } catch (error) {
            console.error(`GET ${endpoint} error:`, error);
            throw error;
        }
    }

    /**
     * Базовый метод для POST запросов
     */
    async post(endpoint, data = {}) {
        try {
            const fullUrl = `${this.baseURL}${endpoint}`;
            console.log(`🌐 POST ${fullUrl}`, data);

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorDetail = 'Ошибка запроса';

                try {
                    const errorJson = JSON.parse(errorText);
                    errorDetail = errorJson.detail || errorDetail;
                } catch (e) {
                    errorDetail = errorText || `HTTP ${response.status}`;
                }

                throw new Error(errorDetail);
            }

            const result = await response.json();
            
            // 🆕 Инвалидация кэша после изменений
            if (this.cache) {
                this.invalidateCache(endpoint);
            }

            return result;
        } catch (error) {
            console.error(`POST ${endpoint} error:`, error);
            throw error;
        }
    }

    /**
     * Базовый метод для PUT запросов
     */
    async put(endpoint, data = {}) {
        try {
            const fullUrl = `${this.baseURL}${endpoint}`;
            console.log(`🌐 PUT ${fullUrl}`, data);

            const response = await fetch(fullUrl, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorDetail = 'Ошибка запроса';

                try {
                    const errorJson = JSON.parse(errorText);
                    errorDetail = errorJson.detail || errorDetail;
                } catch (e) {
                    errorDetail = errorText || `HTTP ${response.status}`;
                }

                throw new Error(errorDetail);
            }

            const result = await response.json();
            
            // 🆕 Инвалидация кэша после изменений
            if (this.cache) {
                this.invalidateCache(endpoint);
            }

            return result;
        } catch (error) {
            console.error(`PUT ${endpoint} error:`, error);
            throw error;
        }
    }

    /**
     * Базовый метод для DELETE запросов
     */
    async delete(endpoint) {
        try {
            const fullUrl = `${this.baseURL}${endpoint}`;
            console.log(`🌐 DELETE ${fullUrl}`);

            const response = await fetch(fullUrl, {
                method: 'DELETE',
                headers: this.getHeaders(false)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorDetail = 'Ошибка запроса';

                try {
                    const errorJson = JSON.parse(errorText);
                    errorDetail = errorJson.detail || errorDetail;
                } catch (e) {
                    errorDetail = errorText || `HTTP ${response.status}`;
                }

                throw new Error(errorDetail);
            }

            const result = await response.json();
            
            // 🆕 Инвалидация кэша после изменений
            if (this.cache) {
                this.invalidateCache(endpoint);
            }

            return result;
        } catch (error) {
            console.error(`DELETE ${endpoint} error:`, error);
            throw error;
        }
    }
    
    /**
     * 🆕 Инвалидация кэша при изменениях
     */
    invalidateCache(endpoint) {
        if (!this.cache) return;
        
        // Определяем что очистить
        if (endpoint.includes('/products')) {
            this.cache.clear('products');
        } else if (endpoint.includes('/stores')) {
            this.cache.clear('stores');
        } else if (endpoint.includes('/categories')) {
            this.cache.clear('categories');
        } else if (endpoint.includes('/family')) {
            this.cache.clear('family');
        } else if (endpoint.includes('/expenses') || endpoint.includes('/purchases')) {
            this.cache.clear('statistics');
            this.cache.clear('purchases');
            this.cache.clear('prices');
        }
    }

    /**
     * Обновить информацию о пользователе (для первого входа)
     */
    async updateUserInfo(userData) {
        return this.post('/auth/update-info', userData);
    }

    /**
     * Получить информацию о текущем пользователе
     */
    async getCurrentUserInfo() {
        return this.get('/auth/me');
    }

    // ============================================================================
    // БАЗОВЫЕ ENDPOINTS
    // ============================================================================

    /**
     * Проверка здоровья API
     */
    async health() {
        return this.get('/health', false);
    }

    /**
     * Получить общую статистику
     */
    async getStatistics() {
        return this.get('/statistics');
    }

    /**
     * Получить месячную статистику
     */
    async getMonthlyStatistics(year = null, month = null) {
        let endpoint = '/statistics/monthly';
        const params = new URLSearchParams();

        if (year) params.append('year', year);
        if (month) params.append('month', month);

        const query = params.toString();
        if (query) endpoint += `?${query}`;

        return this.get(endpoint);
    }

    // ============================================================================
    // ПРОДУКТЫ
    // ============================================================================

    /**
     * Обновить товар
     */
    async updateProduct(productId, productData) {
        return this.put(`/products/${productId}`, productData);
    }

    /**
     * Получить список продуктов
     */
    async getProducts(category_id = null, search = null, limit = 100) {
        let endpoint = '/products';
        const params = new URLSearchParams();

        if (category_id) params.append('category_id', category_id);
        if (search) params.append('search', search);
        if (limit) params.append('limit', limit);

        const query = params.toString();
        if (query) endpoint += `?${query}`;

        return this.get(endpoint);
    }

    /**
     * Получить информацию о продукте
     */
    async getProduct(productId) {
        return this.get(`/products/${productId}`);
    }

    /**
     * Создать продукт
     */
    async createProduct(nameOrData, categoryId = null, brand = null, unit = 'unidad', barcode = null) {
        if (typeof nameOrData === 'object') {
            return this.post('/products/create', nameOrData);
        }

        return this.post('/products/create', {
            name: nameOrData,
            category_id: categoryId,
            brand: brand,
            unit: unit,
            barcode: barcode
        });
    }

    /**
     * Получить продукт по штрих-коду
     */
    async getProductByBarcode(barcode) {
        return this.get(`/products/by-code/${encodeURIComponent(barcode)}`);
    }

    /**
     * Поиск продукта
     */
    async searchProduct(query) {
        return this.get(`/products/search?name=${encodeURIComponent(query)}`);
    }

    /**
     * Обновить категорию продукта
     */
    async updateProductCategory(productId, categoryId) {
        return this.put('/products/category', {
            product_id: productId,
            category_id: categoryId
        });
    }

    /**
     * Обновить штрих-код продукта
     */
    async updateProductBarcode(productId, barcode) {
        return this.put(`/products/barcode?product_id=${encodeURIComponent(productId)}&barcode=${encodeURIComponent(barcode)}`);
    }

    // ============================================================================
    // МАГАЗИНЫ
    // ============================================================================

    /**
     * Получить список магазинов
     */
    async getStores() {
        return this.get('/stores');
    }

    /**
     * Создать магазин
     */
    async createStore(nameOrData, storeType = 'Магазин') {
        if (typeof nameOrData === 'object') {
            return this.post('/stores', nameOrData);
        }

        return this.post('/stores', {
            name: nameOrData,
            store_type: storeType
        });
    }

    /**
     * Обновить магазин
     */
    async updateStore(storeId, storeData) {
        return this.put(`/stores/${storeId}`, storeData);
    }

    // ============================================================================
    // КАТЕГОРИИ
    // ============================================================================

    /**
     * Получить список категорий
     */
    async getCategories() {
        return this.get('/categories');
    }

    /**
     * Создать категорию
     */
    async createCategory(nameOrData, description = null, parentId = null) {
        if (typeof nameOrData === 'object') {
            return this.post('/categories', nameOrData);
        }

        return this.post('/categories', {
            name: nameOrData,
            description: description,
            parent_id: parentId
        });
    }

    /**
     * Редактировать категорию
     */
    async updateCategory(categoryId, categoryData) {
        return this.put(`/categories/${categoryId}`, categoryData);
    }

    /**
     * Удалить категорию
     */
    async deleteCategory(categoryId) {
        return this.delete(`/categories/${categoryId}`);
    }

    // ============================================================================
    // ПОКУПКИ
    // ============================================================================

    /**
     * Получить последние покупки
     */
    async getRecentPurchases(limit = 20) {
        return this.get(`/purchases/recent?limit=${limit}`);
    }

    /**
     * Создать расход
     */
    async createExpense(storeId, productId, quantity, unitPrice, purchaseDate = null) {
        return this.post('/expenses/manual', {
            store_id: storeId,
            product_id: productId,
            quantity: quantity,
            unit_price: unitPrice,
            purchase_date: purchaseDate || new Date().toISOString()
        });
    }

    /**
     * Создать покупку вручную (старое название для обратной совместимости)
     */
    async createManualExpense(expenseData) {
        return this.post('/expenses/manual', expenseData);
    }

    // ============================================================================
    // АНАЛИЗ ЦЕН
    // ============================================================================

    /**
     * Получить тренды цен
     */
    async getPriceTrends(days = 30, search = null, limit = 20) {
        let endpoint = `/prices/trends?days=${days}&limit=${limit}`;
        if (search) {
            endpoint += `&product_pattern=${encodeURIComponent(search)}`;
        }
        return this.get(endpoint);
    }

    /**
     * Сравнить цены по магазинам
     */
    async comparePrices(productName = null, limit = 10) {
        let endpoint = `/prices/compare?limit=${limit}`;
        if (productName) {
            endpoint += `&search=${encodeURIComponent(productName)}`;
        }
        return this.get(endpoint);
    }

    // ============================================================================
    // ЗАГРУЗКА ФАЙЛОВ
    // ============================================================================

    /**
     * Загрузить XML файл
     */
    async uploadXML(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.baseURL}/upload/xml`, {
                method: 'POST',
                headers: {
                    'X-Telegram-User-Id': this.telegramUserId
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorDetail = 'Ошибка загрузки';

                try {
                    const errorJson = JSON.parse(errorText);
                    errorDetail = errorJson.detail || errorDetail;
                } catch (e) {
                    errorDetail = errorText || `HTTP ${response.status}`;
                }

                throw new Error(errorDetail);
            }

            const result = await response.json();
            
            // Очищаем кэш после загрузки
            if (this.cache) {
                this.cache.clear();
            }

            return result;
        } catch (error) {
            console.error('Upload XML error:', error);
            throw error;
        }
    }

    /**
     * Загрузить несколько XML файлов
     */
    async uploadMultipleXML(files) {
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await fetch(`${this.baseURL}/upload/xml/batch`, {
                method: 'POST',
                headers: {
                    'X-Telegram-User-Id': this.telegramUserId
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorDetail = 'Ошибка загрузки';

                try {
                    const errorJson = JSON.parse(errorText);
                    errorDetail = errorJson.detail || errorDetail;
                } catch (e) {
                    errorDetail = errorText || `HTTP ${response.status}`;
                }

                throw new Error(errorDetail);
            }

            const result = await response.json();
            
            // Очищаем кэш после загрузки
            if (this.cache) {
                this.cache.clear();
            }

            return result;
        } catch (error) {
            console.error('Upload multiple XML error:', error);
            throw error;
        }
    }

    // ============================================================================
    // СЕМЕЙНАЯ СИСТЕМА
    // ============================================================================

    /**
     * Получить информацию о текущей семье
     */
    async getFamilyInfo() {
        return this.get('/family/info');
    }

    /**
     * Создать семью
     */
    async createFamily(name = 'Моя семья') {
        return this.post('/family/create', { name });
    }

    /**
     * Получить список участников семьи
     */
    async getFamilyMembers() {
        return this.get('/family/members');
    }

    /**
     * Пригласить пользователя в семью
     */
    async inviteToFamily(telegramId, message = null) {
        return this.post('/family/invite', {
            telegram_id: telegramId,
            message: message
        });
    }

    /**
     * Получить входящие приглашения
     */
    async getPendingInvites() {
        return this.get('/family/invites/pending');
    }

    /**
     * Принять приглашение
     */
    async acceptInvite(inviteToken) {
        return this.post(`/family/invites/${inviteToken}/accept`, {});
    }

    /**
     * Отклонить приглашение
     */
    async declineInvite(inviteToken) {
        return this.post(`/family/invites/${inviteToken}/decline`, {});
    }

    /**
     * Выйти из семьи
     */
    async leaveFamily() {
        return this.post('/family/leave', {});
    }

    /**
     * Исключить участника из семьи
     */
    async removeFamilyMember(telegramId) {
        return this.delete(`/family/members/${telegramId}`);
    }

    // ============================================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ============================================================================

    /**
     * Форматирование суммы в валюту
     */
    formatCurrency(amount, currency = 'PYG') {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Форматирование даты
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-PY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    /**
     * Форматирование даты и времени
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-PY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    /**
     * Получить Telegram User ID
     */
    getTelegramUserId() {
        return this.telegramUserId;
    }

    /**
     * Проверка авторизации
     */
    isAuthenticated() {
        return this.telegramUserId !== null;
    }
    
    /**
     * 🆕 Получить статистику кэша
     */
    getCacheStats() {
        return this.cache ? this.cache.getStats() : null;
    }
    
    /**
     * 🆕 Очистить весь кэш
     */
    clearCache(pattern = null) {
        if (this.cache) {
            return this.cache.clear(pattern);
        }
        return 0;
    }

    /**
     * Базовый метод для PATCH запросов
     */
    async patch(endpoint, data = {}) {
        try {
            const fullUrl = `${this.baseURL}${endpoint}`;
            console.log(`🌐 PATCH ${fullUrl}`, data);

            const response = await fetch(fullUrl, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorDetail = 'Ошибка запроса';

                try {
                    const errorJson = JSON.parse(errorText);
                    errorDetail = errorJson.detail || errorDetail;
                } catch (e) {
                    errorDetail = errorText || `HTTP ${response.status}`;
                }

                throw new Error(errorDetail);
            }

            const result = await response.json();

            // Инвалидация кэша после изменений
            if (this.cache) {
                this.invalidateCache(endpoint);
            }

            return result;
        } catch (error) {
            console.error(`PATCH ${endpoint} error:`, error);
            throw error;
        }
    }

    // ============================================================================
    // НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ
    // ============================================================================

    /**
     * Получить настройки пользователя
     */
    async getUserSettings() {
        return this.get('/users/me/settings');
    }

    /**
     * Обновить настройки пользователя
     */
    async updateUserSettings(settings) {
        const result = await this.patch('/users/me/settings', settings);

        // Инвалидируем кэш настроек
        if (this.cache) {
            this.cache.clear('users');
        }

        return result;
    }

    /**
     * Получить список поддерживаемых валют
     */
    async getSupportedCurrencies() {
        return this.get('/users/currencies');
    }
}

// Создаём глобальный экземпляр API
const API = new APIClient();

// Экспортируем для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

// Делаем API глобально доступным
window.API = API;

console.log('✅ API клиент инициализирован', {
    baseURL: API.baseURL,
    telegramUserId: API.telegramUserId,
    cacheEnabled: API.cache !== null
});
