/**
 * API клиент для системы семейного бюджета
 * Версия: 4.1.0 - Исправлена интеграция с реальным бэкендом
 */

class APIClient {
    constructor() {
        // Базовый URL API из CONFIG
        this.baseURL = window.CONFIG //? window.CONFIG.API_URL : 'https://c053e0b76144.ngrok-free.app';

        // Telegram User ID из Telegram Web App
        this.telegramUserId = null;

        // Инициализация Telegram Web App
        this.initTelegram();
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
     * Базовый метод для GET запросов
     */
    async get(endpoint, includeAuth = true) {
        try {
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

            return await response.json();
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

            return await response.json();
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

            return await response.json();
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

            return await response.json();
        } catch (error) {
            console.error(`DELETE ${endpoint} error:`, error);
            throw error;
        }
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
     * Получить список продуктов
     * ✅ Параметры в правильном порядке согласно бэкенду
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
     * ✅ Поддержка двух форматов: объект ИЛИ параметры
     */
    async createProduct(nameOrData, categoryId = null, brand = null, unit = 'unidad', barcode = null) {
        // Если первый параметр - объект, используем его
        if (typeof nameOrData === 'object') {
            return this.post('/products/create', nameOrData);
        }

        // Иначе создаём объект из параметров
        return this.post('/products/create', {
            name: nameOrData,
            category_id: categoryId,
            brand: brand,
            unit: unit,
            barcode: barcode
        });
    }

    /**
     * ✅ НОВОЕ: Получить продукт по штрих-коду
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
     * ✅ НОВОЕ: Обновить штрих-код продукта
     * Бэкенд ожидает Query параметры, а не Body
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
     * ✅ Поддержка двух форматов: объект ИЛИ параметры
     */
    async createStore(nameOrData, storeType = 'Магазин') {
        // Если первый параметр - объект, используем его
        if (typeof nameOrData === 'object') {
            return this.post('/stores', nameOrData);
        }

        // Иначе создаём объект из параметров
        return this.post('/stores', {
            name: nameOrData,
            store_type: storeType
        });
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
     * ✅ Поддержка двух форматов: объект ИЛИ параметры
     */
    async createCategory(nameOrData, description = null, parentId = null) {
        // Если первый параметр - объект, используем его
        if (typeof nameOrData === 'object') {
            return this.post('/categories', nameOrData);
        }

        // Иначе создаём объект из параметров
        return this.post('/categories', {
            name: nameOrData,
            description: description,
            parent_id: parentId
        });
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
     * ✅ НОВОЕ: Создать расход (новое название метода)
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
     * ✅ Исправлено: параметр product_pattern вместо search
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

            return await response.json();
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

            return await response.json();
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
}

// Создаём глобальный экземпляр API
const API = new APIClient();

// Экспортируем для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

// Делаем API глобально доступным
window.API = API;

console.log('✅ API клиент инициализирован v4.1.0', {
    baseURL: API.baseURL,
    telegramUserId: API.telegramUserId
});
