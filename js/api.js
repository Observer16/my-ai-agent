/**
 * API клиент для системы семейного бюджета
 * Версия: 4.0.0 - Поддержка семейной системы
 */

class APIClient {
    constructor() {
        // Базовый URL API
        this.baseURL = window.CONFIG?.API_URL;
        
        // Telegram User ID из Telegram Web App
        this.telegramUserId = null;
        
        // Инициализация
        this.init();
    }

    /**
     * Инициализация API клиента
     */
    init() {
        // Получаем данные пользователя
        if (window.CONFIG?.TELEGRAM?.user) {
            this.telegramUserId = window.CONFIG.TELEGRAM.user.id;
            CONFIG.log('info', '✅ Telegram User ID:', this.telegramUserId);
        } else {
            CONFIG.log('warn', '⚠️ Telegram User ID не найден');
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
            headers['X-Telegram-User-Id'] = this.telegramUserId.toString();
        }
        
        CONFIG.log('debug', '📤 Заголовки запроса:', headers);
        return headers;
    }

    /**
     * Обработка ошибок
     */
    async handleResponse(response) {
        CONFIG.log('debug', '📥 Ответ API:', {
            status: response.status,
            url: response.url,
            ok: response.ok
        });

        if (!response.ok) {
            let errorMessage = 'Ошибка запроса';
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
                CONFIG.log('error', '❌ Ошибка API:', errorData);
            } catch (e) {
                CONFIG.log('error', '❌ Ошибка парсинга ошибки:', e);
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            
            throw new Error(errorMessage);
        }

        try {
            const data = await response.json();
            CONFIG.log('debug', '✅ Успешный ответ:', data);
            return data;
        } catch (error) {
            CONFIG.log('error', '❌ Ошибка парсинга ответа:', error);
            throw new Error('Ошибка обработки ответа сервера');
        }
    }

    /**
     * Базовый метод для GET запросов
     */
    async get(endpoint, includeAuth = true) {
        const url = `${this.baseURL}${endpoint}`;
        CONFIG.log('info', '📤 GET запрос:', url);
        
        try {
            const headers = includeAuth ? this.getHeaders(false) : {};
            
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            return await this.handleResponse(response);
        } catch (error) {
            CONFIG.log('error', `❌ GET ${endpoint} ошибка:`, error);
            throw error;
        }
    }

    /**
     * Базовый метод для POST запросов
     */
    async post(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        CONFIG.log('info', '📤 POST запрос:', url, data);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            return await this.handleResponse(response);
        } catch (error) {
            CONFIG.log('error', `❌ POST ${endpoint} ошибка:`, error);
            throw error;
        }
    }

    /**
     * Базовый метод для PUT запросов
     */
    async put(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        CONFIG.log('info', '📤 PUT запрос:', url, data);
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            return await this.handleResponse(response);
        } catch (error) {
            CONFIG.log('error', `❌ PUT ${endpoint} ошибка:`, error);
            throw error;
        }
    }

    /**
     * Базовый метод для DELETE запросов
     */
    async delete(endpoint) {
        const url = `${this.baseURL}${endpoint}`;
        CONFIG.log('info', '📤 DELETE запрос:', url);
        
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders(false)
            });

            return await this.handleResponse(response);
        } catch (error) {
            CONFIG.log('error', `❌ DELETE ${endpoint} ошибка:`, error);
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
        try {
            return await this.get('/statistics');
        } catch (error) {
            CONFIG.log('error', '❌ Ошибка загрузки статистики:', error);
            // Возвращаем заглушку при ошибке
            return {
                total_spent: 0,
                total_purchases: 0,
                average_per_day: 0
            };
        }
    }

    /**
     * Получить месячную статистику
     */
    async getMonthlyStatistics(year = null, month = null) {
        try {
            let endpoint = '/statistics/monthly';
            const params = new URLSearchParams();
            
            if (year) params.append('year', year);
            if (month) params.append('month', month);
            
            const query = params.toString();
            if (query) endpoint += `?${query}`;
            
            return await this.get(endpoint);
        } catch (error) {
            CONFIG.log('error', '❌ Ошибка загрузки месячной статистики:', error);
            // Возвращаем заглушку при ошибке
            return {
                summary: {
                    total_spent: 0,
                    total_purchases: 0,
                    average_per_day: 0
                },
                daily_stats: []
            };
        }
    }

    // ============================================================================
    // ПРОДУКТЫ
    // ============================================================================

    /**
     * Получить список продуктов
     */
    async getProducts(search = null, categoryId = null, limit = 100) {
        try {
            let endpoint = '/products';
            const params = new URLSearchParams();
            
            if (search) params.append('search', search);
            if (categoryId) params.append('category_id', categoryId);
            if (limit) params.append('limit', limit);
            
            const query = params.toString();
            if (query) endpoint += `?${query}`;
            
            return await this.get(endpoint);
        } catch (error) {
            CONFIG.log('error', '❌ Ошибка загрузки продуктов:', error);
            return [];
        }
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
        try {
            return await this.get('/stores');
        } catch (error) {
            CONFIG.log('error', '❌ Ошибка загрузки магазинов:', error);
            return [];
        }
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
        try {
            return await this.get('/categories');
        } catch (error) {
            CONFIG.log('error', '❌ Ошибка загрузки категорий:', error);
            return [];
        }
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

            return await this.handleResponse(response);
        } catch (error) {
            CONFIG.log('error', 'Upload XML error:', error);
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

            return await this.handleResponse(response);
        } catch (error) {
            CONFIG.log('error', 'Upload multiple XML error:', error);
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
        try {
            return await this.get('/family/info');
        } catch (error) {
            CONFIG.log('error', '❌ Ошибка загрузки информации о семье:', error);
            return null;
        }
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
        try {
            return await this.get('/family/invites/pending');
        } catch (error) {
            CONFIG.log('error', '❌ Ошибка загрузки приглашений:', error);
            return [];
        }
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
        return CONFIG.formatCurrency(amount);
    }

    /**
     * Форматирование даты
     */
    formatDate(dateString) {
        return CONFIG.formatDate(dateString);
    }

    /**
     * Форматирование даты и времени
     */
    formatDateTime(dateString) {
        return CONFIG.formatDateTime(dateString);
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
     * Проверка подключения к API
     */
    async testConnection() {
        try {
            const result = await this.health();
            CONFIG.log('info', '✅ Подключение к API успешно');
            return true;
        } catch (error) {
            CONFIG.log('error', '❌ Ошибка подключения к API:', error);
            return false;
        }
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

CONFIG.log('info', '✅ API клиент инициализирован');
