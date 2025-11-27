/**
 * API клиент для системы семейного бюджета
 * Версия: 4.0.0 - Поддержка семейной системы
 */

class API {
    constructor() {
        // Базовый URL API (можно настроить через CONFIG)
        this.baseURL = window.CONFIG?.API_URL;
        
        // Telegram User ID из Telegram Web App
        this.telegramUserId = null;
        
        // Инициализация Telegram Web App
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
        
        return headers;
    }

    /**
     * Базовый метод для GET запросов
     */
    async get(endpoint, includeAuth = true) {
        try {
            const headers = includeAuth ? this.getHeaders(false) : {};
            
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка запроса');
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
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка запроса');
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
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка запроса');
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
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(false)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка запроса');
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
     */
    async getProducts(search = null, categoryId = null, limit = 100) {
        let endpoint = '/products';
        const params = new URLSearchParams();
        
        if (search) params.append('search', search);
        if (categoryId) params.append('category_id', categoryId);
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
    async createProduct(productData) {
        return this.post('/products/create', productData);
    }

    /**
     * Поиск продукта
     */
    async searchProduct(query) {
        return this.get(`/products/search?query=${encodeURIComponent(query)}`);
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
    async createStore(storeData) {
        return this.post('/stores', storeData);
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
    async createCategory(categoryData) {
        return this.post('/categories', categoryData);
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
     * Создать покупку вручную
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
    async getPriceTrends(days = 30, limit = 20) {
        return this.get(`/prices/trends?days=${days}&limit=${limit}`);
    }

    /**
     * Сравнить цены по магазинам
     */
    async comparePrices(productName = null, limit = 10) {
        let endpoint = `/prices/compare?limit=${limit}`;
        if (productName) {
            endpoint += `&product_name=${encodeURIComponent(productName)}`;
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
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка загрузки');
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
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка загрузки');
            }

            return await response.json();
        } catch (error) {
            console.error('Upload multiple XML error:', error);
            throw error;
        }
    }

    // ============================================================================
    // СЕМЕЙНАЯ СИСТЕМА (НОВОЕ!)
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
const API = new API();

// Экспортируем для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

// Делаем API глобально доступным
window.API = API;
