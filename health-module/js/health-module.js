// health-module/js/health-module.js

const HealthModule = (function() {
    let isInitialized = false;

    /**
     * Инициализация модуля
     */
    async function init() {
        if (isInitialized) {
            console.warn('⚠️ Модуль уже инициализирован');
            return;
        }

        console.log('🩺 Инициализация модуля здоровья...');

        try {
            await initUtils();
            await initCore();
            await initManagers();
            await initTabs();
            await startModule();

            isInitialized = true;
            console.log('✅ Модуль здоровья полностью инициализирован');

        } catch (error) {
            console.error('💥 Критическая ошибка инициализации:', error);
            ErrorHandler.show(`Ошибка загрузки модуля: ${error.message}`, { type: 'error' });
            throw error;
        }
    }

    /**
     * Перезапуск модуля
     */
    async function restart() {
        console.log('🔄 Перезапуск модуля здоровья...');
        
        try {
            isInitialized = false;
            StateManager.reset();
            await init();
            console.log('✅ Модуль успешно перезапущен');
        } catch (error) {
            console.error('❌ Ошибка перезапуска модуля:', error);
            throw error;
        }
    }

    /**
     * Инициализация утилит
     */
    async function initUtils() {
        ErrorHandler.setupGlobalErrorHandling();

        await ComponentLoader.preload([
            'health-dashboard.html',
            'health-onboarding.html'
        ]);

        console.log('✅ Утилиты инициализированы');
    }

    /**
     * Инициализация ядра
     */
    async function initCore() {
        DomManager.init();

        StateManager.subscribe((oldState, newState, updates) => {
            if (updates.isOnboarding !== undefined ||
                updates.isLoading !== undefined ||
                updates.userGender !== undefined) {
                console.log('🔄 Критическое изменение состояния:', updates);
            }
        });

        console.log('✅ Ядро инициализировано');
    }

    /**
     * Инициализация менеджеров
     */
    async function initManagers() {
        OnboardingManager.init();
        TabManager.init();

        console.log('✅ Менеджеры инициализированы');
    }

    /**
     * Инициализация вкладок
     */
    async function initTabs() {
        DashboardManager.init();
        MedicationsManager.init();
        DiaryManager.init();
        StatsManager.init();

        console.log('✅ Вкладки инициализированы');
    }

    /**
     * Запуск модуля
     */
    async function startModule() {
        StateManager.updateState({
            isLoading: true,
            isOnboarding: false
        });

        DomManager.showLoading();

        try {
            // 1. Загружаем гендер пользователя
            await DataManager.loadUserGender();

            // 2. Предзагружаем опции пользователя в кэш (если гендер есть)
            const userGender = StateManager.getState().userGender;
            if (userGender && userGender !== 'null' && userGender !== '' && userGender !== 'undefined') {
                console.log('⚡ Пользователь имеет гендер, предзагружаем опции:', userGender);

                if (typeof OptionsCache !== 'undefined' && OptionsCache.getUserOptions) {
                    try {
                        const optionsResult = await OptionsCache.getUserOptions();
                        
                        if (optionsResult.success && optionsResult.data) {
                            // Сохраняем опции в state
                            StateManager.updateState({ userOptions: optionsResult.data });
                            
                            if (HealthConfig.DEBUG) {
                                console.log('⚡ Опции предзагружены и сохранены в state:', {
                                    success: optionsResult.success,
                                    source: optionsResult.source || 'unknown',
                                    hasSexualOptions: !!optionsResult.data?.sexual_activity_options,
                                    hasMoodOptions: !!optionsResult.data?.mood_options,
                                    optionsCount: optionsResult.data ? Object.keys(optionsResult.data).length : 0
                                });
                            }
                        }
                    } catch (error) {
                        console.warn('⚠️ Не удалось предзагрузить опции:', error);
                    }
                } else {
                    console.warn('⚠️ OptionsCache не доступен для предзагрузки');
                }
            } else {
                console.log('⚠️ Гендер пользователя не указан, пропускаем предзагрузку опций');
            }

            // 3. Проверяем нужен ли онбординг
            const needsOnboarding = await OnboardingManager.checkIfNeeded(
                StateManager.getState().userGender
            );

            console.log('🔍 Результат проверки онбординга:', {
                needsOnboarding,
                userGender: StateManager.getState().userGender
            });

            if (needsOnboarding) {
                console.log('🔄 Начинаем процесс онбординга...');

                DomManager.hideLoading();

                await OnboardingManager.show();

                console.log('✅ Онбординг завершен, продолжаем загрузку dashboard...');

                // После онбординга также загружаем опции
                const newGender = StateManager.getState().userGender;
                if (newGender && typeof OptionsCache !== 'undefined') {
                    try {
                        const optionsResult = await OptionsCache.getUserOptions();
                        if (optionsResult.success && optionsResult.data) {
                            StateManager.updateState({ userOptions: optionsResult.data });
                        }
                        console.log('✅ Опции загружены после онбординга');
                    } catch (error) {
                        console.warn('⚠️ Не удалось загрузить опции после онбординга:', error);
                    }
                }
            }

            // 4. Загружаем остальные данные пользователя
            await DataManager.loadAllUserData();

            // 5. Показываем табы
            DomManager.showTabs();

            // 6. Загружаем начальную вкладку dashboard
            await TabManager.loadInitialTab('dashboard');

            // 7. Обновляем состояние
            StateManager.updateState({
                isLoading: false,
                isOnboarding: false
            });

            console.log('✅ Модуль запущен');

        } catch (error) {
            console.error('❌ Ошибка запуска модуля:', error);
            ErrorHandler.show(`Ошибка запуска: ${error.message}`);
            throw error;
        } finally {
            DomManager.hideLoading();
        }
    }

    /**
     * Показ уведомления
     */
    function showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`[Toast ${type}]: ${message}`);
        }
    }

    // Публичное API
    return {
        // Основные методы
        init,
        restart,
        getState: () => StateManager.getState(),

        // Обновление гендера с инвалидацией кэша и обновлением опций
        updateGender: async function(gender) {
            try {
                console.log('⚡ Обновление гендера через HealthModule.updateGender():', gender);

                // 1. Отправляем на сервер
                const response = await HealthAPI.updateUserGender(gender);

                if (!response.success) {
                    throw new Error(response.error || 'Ошибка обновления');
                }

                // 2. Инвалидируем кэш опций
                if (window.OptionsCache && typeof OptionsCache.invalidate === 'function') {
                    OptionsCache.invalidate();
                    console.log('🗑️ Кэш опций инвалидирован после смены гендера');
                }

                // 3. Загружаем новые опции с сервера
                let newOptions = null;
                if (window.OptionsCache && typeof OptionsCache.getUserOptions === 'function') {
                    try {
                        const optionsResult = await OptionsCache.getUserOptions();
                        if (optionsResult.success && optionsResult.data) {
                            newOptions = optionsResult.data;
                            console.log('✅ Новые опции загружены для гендера:', gender);
                        }
                    } catch (error) {
                        console.warn('⚠️ Не удалось загрузить новые опции:', error);
                    }
                }

                // 4. Обновляем состояние с новым гендером и опциями
                StateManager.updateState({ 
                    userGender: gender,
                    userOptions: newOptions || StateManager.getState().userOptions
                });

                // 5. Обновляем localStorage
                StorageHelper.set('user_gender', gender);

                // 6. Показываем уведомление
                showToast('✅ Пол обновлен', 'success');

                // 7. Обновляем UI
                if (window.Dashboard && typeof Dashboard.init === 'function') {
                    setTimeout(() => Dashboard.init(), 500);
                }

                return { success: true, gender };

            } catch (error) {
                console.error('❌ Ошибка обновления гендера:', error);
                showToast(`❌ ${error.message}`, 'error');
                return { success: false, error: error.message };
            }
        },

        // Методы онбординга
        setUserGender: async function(gender) {
            return OnboardingManager.saveGender(gender);
        },

        completeOnboarding: async function() {
            const success = await OnboardingManager.complete();
            if (success) {
                await restart();
            }
            return success;
        },

        // Методы данных
        logMedication: async function(medicationId, status, notes) {
            return DataManager.logMedicationIntake(medicationId, status, notes);
        },

        updateHealthEntry: async function(date, field, value) {
            return DataManager.updateHealthEntry(date, field, value);
        },

        // Методы интерфейса
        switchTab: function(tabName) {
            return TabManager.switchToTab(tabName);
        },

        refreshData: async function() {
            return DataManager.refreshAllData();
        },

        // Вспомогательные методы
        showError: function(message) {
            ErrorHandler.show(message, { type: 'error' });
        },

        showSuccess: function(message) {
            ErrorHandler.show(message, { type: 'success' });
        },

        // Экспорт внутренних модулей (для разработки)
        _modules: {
            StateManager,
            DomManager,
            EventManager,
            DataManager,
            TabManager,
            OnboardingManager,
            ComponentLoader,
            ErrorHandler,
            StorageHelper,
            UIHelpers,
            Config: HealthConfig
        }
    };

})();

// Глобальный экспорт
if (typeof window !== 'undefined') {
    window.HealthModule = HealthModule;
}
