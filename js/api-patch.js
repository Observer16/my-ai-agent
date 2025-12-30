// Патч для api.js - добавить эти методы в класс APIClient перед закрывающей скобкой

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
