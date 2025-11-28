// API клиент для системы семейного бюджета - УПРОЩЕННАЯ ВЕРСИЯ
// Версия: 4.1.1 - Возврат к работающему подходу

class APIClient {
    constructor() {
        this.baseURL = window.CONFIG ? window.CONFIG.API_URL : 'https://c053e0b76144.ngrok-free.app';
        this.telegramUserId = null;
        this.cache = new Map();

        this.initTelegram();
    }

    /**
     * Инициализация Telegram Web App
     */
    initTelegram() {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();

            if (tg.initDataUnsafe?.user) {
                this.telegramUserId = tg.initDataUnsafe.user.id;
                console.log('✅ Telegram User ID:', this.telegramUserId);
            }
        }
    }

    /**
     * GET запрос с кэшированием (как в рабочем коде)
     */
    async get(endpoint, params = {}, useCache = true) {
        const url = this.buildURL(endpoint, params);
        const cacheKey = url;

        // Проверить кэш
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < (5 * 60 * 1000)) { // 5 минут
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
            console.error(`GET ${endpoint} error:`, error);
            throw error;
        }
    }

    /**
     * POST запрос (упрощенный)
     */
    async post(endpoint, data = {}) {
        const url = this.baseURL + endpoint;

        try {
            const response = await this.fetchWithRetry(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return await response.json();
        } catch (error) {
            console.error(`POST ${endpoint} error:`, error);
            throw error;
        }
    }

    /**
     * PUT запрос
     */
    async put(endpoint, data = {}) {
        const url = this.baseURL + endpoint;

        try {
            const response = await this.fetchWithRetry(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return await response.json();
        } catch (error) {
            console.error(`PUT ${endpoint} error:`, error);
            throw error;
        }
    }

    /**
     * DELETE запрос
     */
    async delete(endpoint) {
        const url = this.baseURL + endpoint;

        try {
            const response = await this.fetchWithRetry(url, {
                method: 'DELETE'
            });

            return await response.json();
        } catch (error) {
            console.error(`DELETE ${endpoint} error:`, error);
            throw error;
        }
    }

    /**
     * Fetch с retry логикой (из рабочего кода)
     */
    async fetchWithRetry(url, options = {}, attempt = 1) {
        const maxAttempts = 3;

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
     * Fetch с таймаутом (из рабочего кода)
     */
    async fetchWithTimeout(url, options = {}) {
        const timeout = 10000; // 10 секунд
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            // Базовые опции - ВАЖНО: не добавляем лишние заголовки
            const fetchOptions = {
                signal: controller.signal,
                // НЕ добавляем mode: 'cors' явно - пусть браузер сам решает
                // НЕ добавляем лишние заголовки кроме Content-Type для POST/PUT
            };

            // Копируем метод
            if (options.method) {
                fetchOptions.method = options.method;
            }

            // Копируем body и headers
            if (options.body) {
                fetchOptions.body = options.body;
            }
            if (options.headers) {
                fetchOptions.headers = options.headers;
            }

            // Добавляем Telegram User ID если есть
            if (this.telegramUserId && !fetchOptions.headers?.['X-Telegram-User-Id']) {
                if (!fetchOptions.headers) fetchOptions.headers = {};
                fetchOptions.headers['X-Telegram-User-Id'] = this.telegramUserId;
            }

            const response = await fetch(url, fetchOptions);
            clearTimeout(id);

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
     * Построить URL с параметрами (из рабочего кода)
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
     * Задержка
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============================================================================
    // ОСНОВНЫЕ ENDPOINTS (упрощенные)
    // ============================================================================

    async health() {
        return this.get('/health', {}, false);
    }

    async getStatistics() {
        return this.get('/statistics');
    }

    async getMonthlyStatistics(year = null, month = null) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        return this.get('/statistics/monthly', params);
    }

    async getProducts(category_id = null, search = null, limit = 100) {
        const params = { limit };
        if (category_id) params.category_id = category_id;
        if (search) params.search = search;
        return this.get('/products', params);
    }

    async getProduct(productId) {
        return this.get(`/products/${productId}`);
    }

    async createProduct(name, categoryId = null, brand = null, unit = 'unidad', barcode = null) {
        return this.post('/products/create', {
            name: name,
            category_id: categoryId,
            brand: brand,
            unit: unit,
            barcode: barcode
        });
    }

    async getProductByBarcode(barcode) {
        return this.get(`/products/by-code/${encodeURIComponent(barcode)}`);
    }

    async getStores() {
        return this.get('/stores');
    }

    async createStore(name, storeType = 'Магазин') {
        return this.post('/stores', {
            name: name,
            store_type: storeType
        });
    }

    async getCategories() {
        return this.get('/categories');
    }

    async createCategory(name, description = null, parentId = null) {
        return this.post('/categories', {
            name: name,
            description: description,
            parent_id: parentId
        });
    }

    async getRecentPurchases(limit = 20) {
        return this.get('/purchases/recent', { limit });
    }

    async createExpense(storeId, productId, quantity, unitPrice, purchaseDate = null) {
        return this.post('/expenses/manual', {
            store_id: storeId,
            product_id: productId,
            quantity: quantity,
            unit_price: unitPrice,
            purchase_date: purchaseDate || new Date().toISOString()
        });
    }

    async getPriceTrends(days = 30, search = null, limit = 20) {
        const params = { days, limit };
        if (search) params.product_pattern = search;
        return this.get('/prices/trends', params);
    }

    async comparePrices(productName = null, limit = 10) {
        const params = { limit };
        if (productName) params.search = productName;
        return this.get('/prices/compare', params);
    }

    async getFamilyInfo() {
        return this.get('/family/info');
    }

    // Вспомогательные методы
    formatCurrency(amount, currency = 'PYG') {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-PY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    isAuthenticated() {
        return this.telegramUserId !== null;
    }
}

// Создаём глобальный экземпляр API
const API = new APIClient();

// Делаем API глобально доступным
window.API = API;

console.log('✅ API клиент инициализирован v4.1.1', {
    baseURL: API.baseURL,
    telegramUserId: API.telegramUserId
});