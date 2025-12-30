// health-module/js/health-api.js

/**
 * API модуль для взаимодействия с бэкендом здоровья
 */
const HealthAPI = (function() {
    const BASE_URL = HealthConfig.API_URL;

    console.log('🩺 HealthAPI инициализация:', {
        baseUrl: BASE_URL,
        telegramUserId: HealthConfig.TELEGRAM_USER?.id
    });

    /**
     * Получить заголовки с Telegram ID
     */
    function getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...HealthConfig.NGROK_HEADERS
        };

        if (HealthConfig.TELEGRAM_USER?.id) {
            headers['X-Telegram-User-Id'] = HealthConfig.TELEGRAM_USER.id.toString();
        }

        if (HealthConfig.TELEGRAM_DATA) {
            headers['X-Telegram-Init-Data'] = HealthConfig.TELEGRAM_DATA;
        }

        return headers;
    }

    /**
     * Обработка ответа API
     */
    async function handleResponse(response) {
        const text = await response.text();
        let data;

        try {
            data = text ? JSON.parse(text) : {};
        } catch (error) {
            console.error('❌ Ошибка парсинга JSON:', error, 'Текст ответа:', text);
            data = {};
        }

        if (HealthConfig.DEBUG) {
            console.log(`📡 API Response [${response.status} ${response.url}]:`, data);
        }

        if (response.ok) {
            return {
                success: true,
                data: data,
                status: response.status
            };
        } else {
            return {
                success: false,
                error: data.detail || data.message || `HTTP ${response.status}`,
                status: response.status
            };
        }
    }

    /**
     * Получить профиль пользователя
     */
    async function getUserProfile() {
        try {
            const response = await fetch(`${BASE_URL}/health/profile`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка получения профиля:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Обновить профиль пользователя
     */
    async function updateUserProfile(profileData) {
        try {
            const response = await fetch(`${BASE_URL}/health/profile`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(profileData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка обновления профиля:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Получить информацию о пользователе
     */
    async function getUserInfo() {
        try {
            const response = await fetch(`${BASE_URL}/auth/me`, {
                method: 'GET',
                headers: getHeaders()
            });

            const result = await handleResponse(response);

            if (HealthConfig.DEBUG) {
                console.log('👤 Ответ getUserInfo:', {
                    success: result.success,
                    hasData: !!result.data,
                    fullResponse: result
                });
            }

            return result;
        } catch (error) {
            console.error('❌ Ошибка получения данных пользователя:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Получить гендер пользователя
     */
    async function getUserGender() {
        try {
            const response = await fetch(`${BASE_URL}/health/profile/gender`, {
                method: 'GET',
                headers: getHeaders()
            });

            const result = await handleResponse(response);

            if (HealthConfig.DEBUG) {
                console.log('⚧️ Ответ getUserGender:', {
                    success: result.success,
                    gender: result.data?.gender,
                    hasGender: !!result.data?.gender,
                    options: result.data?.options,
                    fullResponse: result
                });
            }

            return result;
        } catch (error) {
            console.error('❌ Ошибка получения гендера:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Получить опции пользователя
     */
    async function getUserOptions() {
        try {
            const response = await fetch(`${BASE_URL}/health/profile/options`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка получения опций:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Обновить пол пользователя
     */
    async function updateUserGender(gender) {
        try {
            if (HealthConfig.DEBUG) {
                console.log('📤 Отправляем гендер на сервер:', gender);
            }

            const response = await fetch(`${BASE_URL}/health/profile/gender`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ gender })
            });

            const result = await handleResponse(response);

            if (HealthConfig.DEBUG) {
                console.log('📥 Ответ updateUserGender:', {
                    success: result.success,
                    gender: result.data?.gender,
                    fullResponse: result
                });
            }

            return result;
        } catch (error) {
            console.error('❌ Ошибка обновления гендера:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ... остальные методы остаются без изменений ...
    // (здесь должны быть все остальные методы из оригинального файла)

    // Публичные методы
    return {
        getUserProfile,
        updateUserProfile,
        getUserInfo,
        getUserGender,
        getUserOptions,
        updateUserGender,
        getTodayMedications,
        getMedications,
        logMedicationIntake,
        getEntryByDate,
        addMood,
        addSleep,
        addWeight,
        addSymptoms,
        addNotes,
        addSexualActivity,
        getHealthSummary,
        getHealthStatistics,
        createMedication,
        updateMedication,
        updateMedicationSchedule,
        updateMedicationStock,
        getLowStockMedications,
        checkLowStock,
        deactivateMedication,
        getMedication,
        getTelegramStatus,
        generateLinkCode,
        unlinkTelegram,
        getNotificationSettings,
        updateNotificationSettings
    };
})();

if (typeof window !== 'undefined') {
    window.HealthAPI = HealthAPI;
}
