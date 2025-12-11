// managers/data-manager.js
const DataManager = (function() {
    // Загрузить все данные пользователя
    async function loadAllUserData() {
        try {
            await Promise.all([
                loadUserData(),
                loadUserOptions()
            ]);
            console.log('✅ Все данные пользователя загружены');
            return true;
        } catch (error) {
            console.error('❌ Ошибка загрузки данных пользователя:', error);
            return false;
        }
    }

    // Загрузить данные профиля
    async function loadUserData() {
        try {
            if (!window.HealthAPI) {
                throw new Error('HealthAPI не доступен');
            }

            const response = await HealthAPI.getUserInfo();
            if (response.success) {
                StateManager.updateState({ userData: response.data });
                console.log('👤 Данные пользователя загружены');
                EventManager.emit('data:userLoaded', response.data);
                return response.data;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки данных пользователя:', error);
            throw error;
        }
    }

    // Загрузить опции пользователя
    async function loadUserOptions() {
        try {
            // Пробуем из локального хранилища
            const localOptions = await StorageHelper.getUserOptions();
            if (localOptions) {
                StateManager.updateState({ userOptions: localOptions });
                console.log('⚙️ Опции пользователя загружены из кэша');
                EventManager.emit('data:optionsLoaded', localOptions);
                return localOptions;
            }

            // Или загружаем с сервера
            if (!window.HealthAPI) {
                throw new Error('HealthAPI не доступен');
            }

            const response = await HealthAPI.getUserOptions();
            if (response.success) {
                StateManager.updateState({ userOptions: response.data });
                await StorageHelper.saveUserOptions(response.data);
                console.log('⚙️ Опции пользователя загружены с сервера');
                EventManager.emit('data:optionsLoaded', response.data);
                return response.data;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки опций:', error);
            throw error;
        }
    }

    // Загрузить гендер пользователя
    async function loadUserGender() {
        try {
            if (!window.HealthAPI) {
                throw new Error('HealthAPI не доступен');
            }

            const response = await HealthAPI.getUserGender();

            if (response.success && response.data) {
                const gender = response.data.gender;

                console.log('⚧️ Получен гендер из API:', {
                    gender,
                    isString: typeof gender === 'string',
                    isNull: gender === null,
                    isUndefined: gender === undefined
                });

                // Сохраняем в state
                StateManager.updateState({ userGender: gender });

                // Сохраняем в localStorage
                if (gender) {
                    localStorage.setItem('health_user_gender', gender);
                } else {
                    localStorage.removeItem('health_user_gender');
                }

                EventManager.emit('data:genderLoaded', gender);
                return gender;
            } else {
                console.warn('⚠️ Не удалось загрузить гендер:', response.error);
                return null;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки гендера:', error);
            throw error;
        }
    }

    // Загрузить лекарства на сегодня
    async function loadTodayMedications() {
        try {
            if (!window.HealthAPI) {
                throw new Error('HealthAPI не доступен');
            }

            const response = await HealthAPI.getTodayMedications();

            if (response.success) {
                const medications = Array.isArray(response.data) ? response.data : [];
                StateManager.updateState({ todayMedications: medications });
                EventManager.emit('data:todayMedsLoaded', medications);
                return medications;
            } else {
                console.warn('⚠️ Не удалось загрузить лекарства:', response.error);
                StateManager.updateState({ todayMedications: [] });
                return [];
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки лекарств:', error);
            StateManager.updateState({ todayMedications: [] });
            return [];
        }
    }

    // Загрузить запись за сегодня

    async function loadTodayEntry() {
        try {
            const today = new Date().toISOString().split('T')[0];

            if (!window.HealthAPI) {
                throw new Error('HealthAPI не доступен');
            }

            const response = await HealthAPI.getEntryByDate(today);

            if (response.success) {
                StateManager.updateState({ todayEntry: response.data || null });
                EventManager.emit('data:todayEntryLoaded', response.data);
                return response.data;
            } else {
                // ИСПРАВЛЕНО: Не логируем как ошибку, это нормально
                console.log('📝 Запись за сегодня не найдена (создается при первом добавлении данных)');
                StateManager.updateState({ todayEntry: null });
                return null;
            }
        } catch (error) {
            // ИСПРАВЛЕНО: 404 это не критичная ошибка
            if (error.message && error.message.includes('404')) {
                console.log('📝 Запись за сегодня отсутствует');
            } else {
                console.error('❌ Ошибка загрузки записи:', error);
            }
            StateManager.updateState({ todayEntry: null });
            return null;
        }
    }

    // Загрузить сводку здоровья
    async function loadHealthSummary(days = 7) {
        try {
            if (!window.HealthAPI) {
                throw new Error('HealthAPI не доступен');
            }

            const response = await HealthAPI.getHealthSummary(days);

            if (response.success) {
                StateManager.updateState({ stats: response.data || null });
                EventManager.emit('data:summaryLoaded', response.data);
                return response.data;
            } else {
                console.warn('⚠️ Не удалось загрузить сводку:', response.error);
                StateManager.updateState({ stats: null });
                return null;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки сводки:', error);
            StateManager.updateState({ stats: null });
            return null;
        }
    }

    // Загрузить все лекарства
    async function loadAllMedications() {
        try {
            if (!window.HealthAPI) {
                throw new Error('HealthAPI не доступен');
            }

            const response = await HealthAPI.getMedications(true);

            if (response.success) {
                StateManager.updateState({ medications: response.data || [] });
                EventManager.emit('data:medicationsLoaded', response.data);
                return response.data;
            } else {
                console.warn('⚠️ Не удалось загрузить лекарства:', response.error);
                StateManager.updateState({ medications: [] });
                return [];
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки лекарств:', error);
            StateManager.updateState({ medications: [] });
            return [];
        }
    }

    // Обновить запись здоровья
    async function updateHealthEntry(date, field, value) {
        try {
            if (!window.HealthAPI) {
                throw new Error('HealthAPI не доступен');
            }

            let response;

            switch (field) {
                case 'mood':
                    response = await HealthAPI.addMood(date, value);
                    break;
                case 'sleep':
                    response = await HealthAPI.addSleep(date, value);
                    break;
                case 'weight':
                    response = await HealthAPI.addWeight(date, value);
                    break;
                case 'symptoms':
                    response = await HealthAPI.addSymptoms(date, value);
                    break;
                case 'notes':
                    response = await HealthAPI.addNotes(date, value);
                    break;
                case 'sexual_activity':
                    response = await HealthAPI.addSexualActivity(date, value);
                    break;
                default:
                    throw new Error(`Неизвестное поле: ${field}`);
            }

            if (response && response.success) {
                StateManager.updateState({ todayEntry: response.data });
                EventManager.emit('data:entryUpdated', { date, field, value, data: response.data });
                return true;
            }

            return false;
        } catch (error) {
            console.error(`❌ Ошибка обновления ${field}:`, error);
            ErrorHandler.show(`Не удалось обновить ${field}`);
            return false;
        }
    }

    // Отметить прием лекарства
    async function logMedicationIntake(medicationId, status, notes) {
        try {
            if (!window.HealthAPI) {
                throw new Error('HealthAPI не доступен');
            }

            const response = await HealthAPI.logMedicationIntake(medicationId, status, notes);

            if (response.success) {
                EventManager.emit('data:medicationLogged', { medicationId, status, notes });
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ Ошибка отметки лекарства:', error);
            ErrorHandler.show('Не удалось отметить прием лекарства');
            return false;
        }
    }

    // Обновить все данные
    async function refreshAllData() {
        const state = StateManager.getState();

        if (state.isOnboarding || state.isLoading) {
            return;
        }

        StateManager.updateState({ isLoading: true });

        try {
            const promises = [];

            if (state.currentTab === 'dashboard') {
                promises.push(loadTodayMedications());
                promises.push(loadTodayEntry());
                promises.push(loadHealthSummary());
            } else if (state.currentTab === 'medications') {
                promises.push(loadAllMedications());
            }

            await Promise.all(promises);
            EventManager.emit('data:refreshed');
        } catch (error) {
            console.error('❌ Ошибка обновления данных:', error);
        } finally {
            StateManager.updateState({ isLoading: false });
        }
    }

    return {
        loadAllUserData,
        loadUserData,
        loadUserOptions,
        loadUserGender,
        loadTodayMedications,
        loadTodayEntry,
        loadHealthSummary,
        loadAllMedications,
        updateHealthEntry,
        logMedicationIntake,
        refreshAllData
    };
})();

if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}