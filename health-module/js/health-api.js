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
        'ngrok-skip-browser-warning': 'true'
    };

        // Добавляем Telegram User ID
        if (HealthConfig.TELEGRAM_USER?.id) {
            headers['X-Telegram-User-Id'] = HealthConfig.TELEGRAM_USER.id.toString();
        }

        // Добавляем initData если есть
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

    console.log(`📡 API Response [${response.status} ${response.url}]:`, data);

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
     * Получить информацию о пользователе
     */
    async function getUserInfo() {
        try {
            const response = await fetch(`${BASE_URL}/auth/me`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
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

    /**
     * Получить лекарства на сегодня
     */
    async function getTodayMedications() {
    try {
        const response = await fetch(`${BASE_URL}/health/medications/logs/today`, {
            method: 'GET',
            headers: getHeaders()
        });
        const result = await handleResponse(response);

        // Гарантируем, что data всегда массив
        if (result.success && result.data) {
            // Если data - объект, проверяем, есть ли массив внутри
            if (Array.isArray(result.data)) {
                result.data = result.data;
            } else if (result.data.data && Array.isArray(result.data.data)) {
                result.data = result.data.data;
            } else if (result.data.medications && Array.isArray(result.data.medications)) {
                result.data = result.data.medications;
            } else {
                console.warn('⚠️ Ответ не содержит массива лекарств:', result.data);
                result.data = [];
            }
        } else if (result.success) {
            result.data = [];
        }

        return result;
    } catch (error) {
        console.error('❌ Ошибка получения лекарств на сегодня:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
}

    /**
     * Получить все лекарства
     */
    async function getMedications(activeOnly = true) {
        try {
            const url = new URL(`${BASE_URL}/health/medications`);
            if (activeOnly) {
                url.searchParams.append('active_only', 'true');
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Отметить прием лекарства
     */
    async function logMedicationIntake(medicationId, status = 'taken', notes = '') {
        try {
            const response = await fetch(`${BASE_URL}/health/medications/logs`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    medication_id: medicationId,
                    status: status,
                    notes: notes
                })
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Получить запись по дате
     */
    async function getEntryByDate(date) {
        try {
            const response = await fetch(`${BASE_URL}/health/entries/${date}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Добавить настроение
     */
    async function addMood(date, mood) {
        try {
            const response = await fetch(`${BASE_URL}/health/entries/${date}/mood`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ mood })
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Добавить сон
     */
    async function addSleep(date, sleepHours) {
        try {
            const response = await fetch(`${BASE_URL}/health/entries/${date}/sleep`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ sleep_hours: sleepHours })
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Добавить вес
     */
    async function addWeight(date, weight) {
        try {
            const response = await fetch(`${BASE_URL}/health/entries/${date}/weight`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ weight })
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Добавить симптомы
     */
    async function addSymptoms(date, symptoms) {
        try {
            const response = await fetch(`${BASE_URL}/health/entries/${date}/symptoms`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ symptoms })
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Добавить заметки
     */
    async function addNotes(date, notes) {
        try {
            const response = await fetch(`${BASE_URL}/health/entries/${date}/notes`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ notes })
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Получить сводку здоровья
     */
    async function getHealthSummary(days = 30) {
        try {
            const response = await fetch(`${BASE_URL}/health/statistics/summary?days=${days}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Получить статистику здоровья
     */
    async function getHealthStatistics(days = 30) {
        try {
            const response = await fetch(`${BASE_URL}/health/statistics/by-days?days=${days}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Создать лекарство
     */
    async function createMedication(medicationData) {
        try {
            const response = await fetch(`${BASE_URL}/health/medications`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(medicationData)
            });
            return await handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Публичные методы
    return {
        getUserInfo,
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
        getHealthSummary,
        getHealthStatistics,
        createMedication
    };
})();

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.HealthAPI = HealthAPI;
}