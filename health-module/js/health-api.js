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
            ...HealthConfig.NGROK_HEADERS // ← используем из конфига
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

    /**
     * Добавить сексуальную активность
     */
    async function addSexualActivity(date, activity) {
        try {
            const response = await fetch(`${BASE_URL}/health/entries/${date}/sexual-activity`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ sexual_activity: activity })
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
     * Получить лекарства на сегодня
     * Бэк возвращает: [{ medication: {...}, schedule: {...}, status: "..." }]
     */
    async function getTodayMedications() {
        try {
            const response = await fetch(`${BASE_URL}/health/medications/logs/today`, {
                method: 'GET',
                headers: getHeaders()
            });
            const result = await handleResponse(response);

            // Нормализуем ответ от бэка
            if (result.success && result.data) {
                const rawData = Array.isArray(result.data) ? result.data : [];

                // Преобразуем вложенную структуру в плоскую для UI
                const normalized = rawData.map(item => ({
                    // ID лекарства
                    medication_id: item.medication?.id || item.id,

                    // Основная информация
                    medication_name: item.medication?.name || item.name || 'Лекарство',
                    dosage: item.medication?.dosage || item.dosage || '',
                    form: item.medication?.form || item.form || '',
                    instructions: item.medication?.instructions || item.instructions || '',

                    // Расписание
                    time_of_day: item.schedule?.time_of_day || item.time_of_day || '00:00:00',
                    reminder_minutes: item.schedule?.reminder_minutes || item.reminder_minutes || 10,
                    days_of_week: item.schedule?.days_of_week || item.days_of_week || [0,1,2,3,4,5,6],

                    // Статус приема
                    status: item.status || 'pending',
                    taken_time: item.taken_time || null,

                    // Служебные ID
                    schedule_id: item.schedule?.id || item.schedule_id || null,
                    log_id: item.log_id || null
                }));

                if (HealthConfig.DEBUG) {
                    console.log('💊 Нормализованные лекарства:', {
                        raw: rawData.length,
                        normalized: normalized.length,
                        sample: normalized[0]
                    });
                }

                return { ...result, data: normalized };
            }

            return { ...result, data: [] };
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
            // ИСПРАВЛЕНО: Ищем schedule_id из сегодняшних лекарств
            const state = HealthModule.getState();
            const todayMeds = state.todayMedications || [];

            // Находим лекарство с нужным medication_id
            const medication = todayMeds.find(
                med => med.medication_id === medicationId
            );

            const scheduleId = medication?.schedule_id || null;

            if (!scheduleId) {
                console.warn(
                    `⚠️ schedule_id not found for medication ${medicationId}, ` +
                    `sending without it`
                );
            }

            const response = await fetch(`${BASE_URL}/health/medications/logs`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    medication_id: medicationId,
                    schedule_id: scheduleId,  // ДОБАВЛЕНО
                    status: status,
                    notes: notes
                })
            });

            const result = await handleResponse(response);

            if (HealthConfig.DEBUG) {
                console.log('✅ Medication logged:', {
                    medication_id: medicationId,
                    schedule_id: scheduleId,
                    status: status,
                    response: result
                });
            }

            return result;

        } catch (error) {
            console.error('❌ Ошибка логирования лекарства:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Обновить остатки лекарства
     */
    async function updateMedicationStock(medicationId, quantity, note = null) {
        try {
            const response = await fetch(`${BASE_URL}/health/medications/${medicationId}/stock`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({
                    quantity_available: quantity,
                    note: note
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
     * Получить лекарства с низким остатком
     */
    async function getLowStockMedications() {
        try {
            const response = await fetch(`${BASE_URL}/health/medications/low-stock/list`, {
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
     * Проверить остатки и отправить уведомления
     */
    async function checkLowStock() {
        try {
            const response = await fetch(`${BASE_URL}/health/medications/check-low-stock`, {
                method: 'POST',
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
     * Деактивировать лекарство
     */
    async function deactivateMedication(medicationId) {
        try {
            const response = await fetch(`${BASE_URL}/health/medications/${medicationId}/deactivate`, {
                method: 'POST',
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
     * Получить конкретное лекарство
     */
    async function getMedication(medicationId) {
        try {
            const response = await fetch(`${BASE_URL}/health/medications/${medicationId}`, {
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
     * Добавление симптомов к записи за дату
     * @param {string} entryDate - Дата в формате YYYY-MM-DD
     * @param {Object} data - Данные симптомов { symptoms: [{category, name, intensity}] }
     * @returns {Promise<Object>}
     */
    async function addSymptoms(entryDate, data) {
        console.log('📤 HealthAPI.addSymptoms:', { entryDate, data });

        try {
            const response = await fetch(`${BASE_URL}/health/entries/${entryDate}/symptoms`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });

            const result = await handleResponse(response);

            if (result.success) {
                console.log('✅ Симптомы добавлены:', result.data);
            }

            return result;

        } catch (error) {
            console.error('❌ Ошибка добавления симптомов:', error);

            return {
                success: false,
                error: error.message || 'Ошибка добавления симптомов',
                response: error.response || null
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
        updateMedicationStock,
        getLowStockMedications,
        checkLowStock,
        deactivateMedication,
        getMedication
    };
})();

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.HealthAPI = HealthAPI;
}