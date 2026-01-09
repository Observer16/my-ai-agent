// js/api-extensions.js
/**
 * Расширения для API клиента
 * Добавляет методы PATCH и работы с настройками пользователя
 */

// Добавляем метод PATCH
APIClient.prototype.patch = async function(endpoint, data = {}) {
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
};

// Добавляем метод POST для первичной настройки
APIClient.prototype.post = async function(endpoint, data = {}) {
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
        
        // Инвалидация кэша после изменений
        if (this.cache) {
            this.invalidateCache(endpoint);
        }

        return result;
    } catch (error) {
        console.error(`POST ${endpoint} error:`, error);
        throw error;
    }
};

/**
 * Получает детальную информацию о покупке (чеке)
 * @param {string} purchaseId - UUID покупки
 * @returns {Promise<Object>} Детали чека с товарами
 */
API.getPurchaseDetails = async function(purchaseId) {
    try {
        console.log(`📄 Получение деталей чека: ${purchaseId}`);

        const response = await this.request(`/purchases/${purchaseId}/items`, {
            method: 'GET'
        });

        console.log(`✅ Детали чека получены:`, response);
        return response;
    } catch (error) {
        console.error('❌ Ошибка получения деталей чека:', error);
        throw error;
    }
};

console.log('✅ API метод getPurchaseDetails добавлен');

// Методы для работы с настройками пользователя
APIClient.prototype.getUserSettings = async function() {
    return this.get('/users/me/settings');
};

APIClient.prototype.updateUserSettings = async function(settings) {
    const result = await this.patch('/users/me/settings', settings);
    
    // Инвалидируем кэш настроек
    if (this.cache) {
        this.cache.clear('users');
    }
    
    return result;
};

APIClient.prototype.initialSetup = async function(setupData) {
    const result = await this.post('/users/me/initial-setup', setupData);
    
    // Инвалидируем кэш настроек
    if (this.cache) {
        this.cache.clear('users');
    }
    
    return result;
};

APIClient.prototype.getSupportedCurrencies = async function() {
    return this.get('/users/currencies');
};

APIClient.prototype.getSupportedLanguages = async function() {
    return this.get('/users/languages');
};

console.log('✅ API расширения загружены (PATCH, POST, настройки, языки)');
