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

APIClient.prototype.getSupportedCurrencies = async function() {
    return this.get('/users/currencies');
};

console.log('✅ API расширения загружены (PATCH, настройки)');
