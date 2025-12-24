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
            // 1. Инициализируем утилиты
            await initUtils();

            // 2. Инициализируем ядро
            await initCore();

            // 3. Инициализируем менеджеры
            await initManagers();

            // 4. Инициализируем вкладки
            await initTabs();

            // 5. Загружаем данные и запускаем
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
     * Инициализация утилит
     */
    async function initUtils() {
        // Настройка глобальной обработки ошибок
        ErrorHandler.setupGlobalErrorHandling();

        // Предзагрузка часто используемых компонентов
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
        // DOM элементы
        DomManager.init();

        // State manager подписывается на события
        StateManager.subscribe((oldState, newState, updates) => {
            // Логирование важных изменений состояния
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
     * Запуск модуля (ОБНОВЛЕННАЯ ВЕРСИЯ)
     */
    async function startModule() {
        // Сбрасываем состояние
        StateManager.updateState({
            isLoading: true,
            isOnboarding: false
        });

        // Показываем загрузку
        DomManager.showLoading();

        try {
            // 1. Загружаем гендер пользователя
            await DataManager.loadUserGender();

            // 2. 🆕 ПРЕДЗАГРУЖАЕМ ОПЦИИ ПОЛЬЗОВАТЕЛЯ В КЭШ (если гендер есть)
            const userGender = StateManager.getState().userGender;
            if (userGender && userGender !== 'null' && userGender !== '' && userGender !== 'undefined') {
                console.log('⚡ Пользователь имеет гендер, предзагружаем опции:', userGender);

                // Фоновая загрузка опций в кэш
                if (typeof OptionsCache !== 'undefined' && OptionsCache.getUserOptions) {
                    try {
                        OptionsCache.getUserOptions().then(result => {
                            if (HealthConfig.DEBUG) {
                                console.log('⚡ Опции предзагружены:', {
                                    success: result.success,
                                    source: result.source || 'unknown',
                                    hasSexualOptions: !!result.data?.sexual_activity_options,
                                    hasMoodOptions: !!result.data?.mood_options,
                                    optionsCount: result.data ? Object.keys(result.data).length : 0
                                });
                            }
                        }).catch(error => {
                            console.warn('⚠️ Не удалось предзагрузить опции:', error);
                        });
                    } catch (error) {
                        console.warn('⚠️ Ошибка при предзагрузке опций:', error);
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

                // Скрываем загрузку перед показом онбординга
                DomManager.hideLoading();

                // ПОКАЗЫВАЕМ ОНБОРДИНГ И ЖДЕМ ЕГО ЗАВЕРШЕНИЯ
                await OnboardingManager.show();

                console.log('✅ Онбординг завершен, продолжаем загрузку dashboard...');

                // После онбординга гендер уже сохранен в state и localStorage
                // 🆕 После онбординга также загружаем опции
                const newGender = StateManager.getState().userGender;
                if (newGender && typeof OptionsCache !== 'undefined') {
                    try {
                        await OptionsCache.getUserOptions();
                        console.log('✅ Опции загружены после онбординга');
                    } catch (error) {
                        console.warn('⚠️ Не удалось загрузить опции после онбординга:', error);
                    }
                }
            }

            // 4. Загружаем остальные данные пользователя
            await DataManager.loadAllUserData();

            // 5. ПОКАЗЫВАЕМ ТАБЫ
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

    // Публичное API (ОБНОВЛЕННАЯ ВЕРСИЯ)
    return {
        // Основные методы
        init,
        restart,
        getState: () => StateManager.getState(),

        // Методы онбординга
        setUserGender: async function(gender) {
            return OnboardingManager.saveGender(gender);
        },

        // НОВАЯ ФУНКЦИЯ: Обновление гендера с инвалидацией кэша
        updateGender: async function(gender) {
            try {
                console.log('⚡ Обновление гендера через HealthModule.updateGender():', gender);

                // Используем существующую функцию OnboardingManager
                const success = await OnboardingManager.saveGender(gender);

                if (success) {
                    // Дополнительно можно обновить UI
                    if (window.Dashboard && typeof Dashboard.init === 'function') {
                        setTimeout(() => Dashboard.init(), 500);
                    }

                    return { success: true, gender };
                } else {
                    return { success: false, error: 'Не удалось сохранить гендер' };
                }

            } catch (error) {
                console.error('❌ Ошибка в HealthModule.updateGender:', error);
                return { success: false, error: error.message };
            }
        },

        completeOnboarding: async function() {
            return await OnboardingManager.complete();
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