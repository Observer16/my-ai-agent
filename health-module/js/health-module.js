// health-module.js

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
     * Запуск модуля
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

            // 2. Проверяем нужен ли онбординг
            const needsOnboarding = await OnboardingManager.checkIfNeeded(
                StateManager.getState().userGender
            );

            console.log('🔍 Результат проверки онбординга:', { needsOnboarding });

            if (needsOnboarding) {
                console.log('🔄 Начинаем процесс онбординга...');

                // Скрываем загрузку перед показом онбординга
                DomManager.hideLoading();

                // ПОКАЗЫВАЕМ ОНБОРДИНГ И ЖДЕМ ЕГО ЗАВЕРШЕНИЯ
                await OnboardingManager.show();

                console.log('✅ Онбординг завершен, продолжаем загрузку dashboard...');

                // После онбординга НЕ делаем restart - просто продолжаем
                // Гендер уже сохранен в state и localStorage
            }

            // 3. Загружаем остальные данные пользователя
            await DataManager.loadAllUserData();

            // 4. ПОКАЗЫВАЕМ ТАБЫ
            DomManager.showTabs();

            // 5. Загружаем начальную вкладку dashboard
            await TabManager.loadInitialTab('dashboard');

            // 6. Обновляем состояние
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
     * Перезапуск модуля
     */
    async function restart() {
        console.log('🔄 Перезапуск модуля...');

        isInitialized = false;
        StateManager.reset();

        await init();
    }

    // Публичное API (сохранено полностью для обратной совместимости)
    return {
        // Основные методы
        init,
        restart,
        getState: () => StateManager.getState(),

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

// Автоматическая инициализация при загрузке
if (typeof window !== 'undefined' && !window.HEALTH_MODULE_NO_AUTO_INIT) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            HealthModule.init().catch(error => {
                console.error('💥 Не удалось автоматически инициализировать модуль:', error);
            });
        }, 100);
    });
}