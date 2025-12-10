// js/health-module.js

/**
 * Основной модуль здоровья
 */
const HealthModule = (function() {
    // Состояние модуля
    let state = {
        currentTab: 'dashboard',
        userData: null,
        userOptions: null,
        medications: [],
        todayMedications: [],
        todayEntry: null,
        stats: null,
        isLoading: true,
        isOnboarding: false // Флаг онбординга
    };

    // DOM элементы
    let elements = {};

    /**
     * Инициализация модуля
     */
    async function init() {
        console.log('🩺 Инициализация модуля здоровья...');

        // Инициализируем DOM элементы
        initElements();

        // Загружаем данные пользователя
        await loadUserData();

        // Проверяем, прошел ли пользователь онбординг
        const needsOnboarding = await checkOnboarding();

        if (needsOnboarding) {
            // Показываем онбординг и ждем его завершения
            console.log('👋 Требуется онбординг');
            await showOnboarding();
            // После онбординга не продолжаем - перезапустится в initOnboardingComponents
            return;
        }

        // Только если онбординг не требуется или завершен
        await continueInitialization();
    }

    /**
     * Продолжение инициализации после онбординга
     */
    async function continueInitialization() {
        // Загружаем опции пользователя
        await loadUserOptions();

        // Инициализируем вкладки
        initTabs();

        // Загружаем данные для текущей вкладки
        await loadCurrentTab();

        state.isLoading = false;
        updateUI();

        console.log('✅ Модуль здоровья инициализирован');
    }

    /**
     * Инициализация DOM элементов
     */
    function initElements() {
        elements = {
            container: document.getElementById('health-container'),
            loading: document.getElementById('health-loading'),
            tabs: document.getElementById('health-tabs'),
            tabButtons: document.querySelectorAll('.health-tab'),
            modals: document.getElementById('health-modals')
        };
    }

    /**
     * Загрузка данных пользователя
     */
    async function loadUserData() {
        try {
            // Получаем данные пользователя из API
            const userResponse = await HealthAPI.getUserInfo();
            if (userResponse.success) {
                state.userData = userResponse.data;
                console.log('👤 Данные пользователя загружены:', state.userData);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки данных пользователя:', error);
        }
    }

    /**
     * Проверка онбординга
     */
    async function checkOnboarding() {
        // Возвращает true если нужен онбординг
        if (!state.userData) {
            console.warn('⚠️ Данные пользователя не загружены');
            return false;
        }

        // Проверяем наличие гендера (допускаем 'prefer_not_to_say' как валидный выбор)
        const hasGender = state.userData.gender &&
                         state.userData.gender !== 'prefer_not_to_say';

        if (!hasGender) {
            console.log('👤 Гендер не указан или выбран "Не указывать"');
            state.isOnboarding = true;
            return true;
        }

        console.log('✅ Онбординг не требуется');
        state.isOnboarding = false;
        return false;
    }

    /**
     * Загрузка опций пользователя
     */
    async function loadUserOptions() {
        try {
            const options = await HealthStorage.getUserOptions();
            if (options) {
                state.userOptions = options;
            } else {
                // Загружаем с сервера
                const response = await HealthAPI.getUserOptions();
                if (response.success) {
                    state.userOptions = response.data;
                    await HealthStorage.saveUserOptions(response.data);
                }
            }
            console.log('⚙️ Опции пользователя загружены');
        } catch (error) {
            console.error('❌ Ошибка загрузки опций:', error);
        }
    }

    /**
     * Инициализация вкладок
     */
    function initTabs() {
        elements.tabButtons.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                switchTab(tabName);
            });
        });
    }

    /**
     * Переключение вкладки
     */
    async function switchTab(tabName) {
        if (state.currentTab === tabName) return;

        // Обновляем активную вкладку
        elements.tabButtons.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            }
        });

        state.currentTab = tabName;
        await loadCurrentTab();
        updateUI();
    }

    /**
     * Загрузка данных для текущей вкладки
     */
    async function loadCurrentTab() {
        elements.container.innerHTML = '';
        elements.loading.style.display = 'flex';

        try {
            switch (state.currentTab) {
                case 'dashboard':
                    await loadDashboard();
                    break;
                case 'medications':
                    await loadMedications();
                    break;
                case 'diary':
                    await loadDiary();
                    break;
                case 'stats':
                    await loadStats();
                    break;
            }
        } catch (error) {
            console.error(`❌ Ошибка загрузки вкладки ${state.currentTab}:`, error);
            showError(`Не удалось загрузить данные: ${error.message}`);
        } finally {
            elements.loading.style.display = 'none';
        }
    }

    /**
     * Загрузка главной панели
     */
    async function loadDashboard() {
        console.log('📊 Загрузка главной панели...');

        // ИНИЦИАЛИЗИРУЕМ массив, если его нет
        if (!Array.isArray(state.todayMedications)) {
            state.todayMedications = [];
        }

        // Загружаем лекарства на сегодня
        try {
            const medsResponse = await HealthAPI.getTodayMedications();
            console.log('💊 Ответ API лекарств:', medsResponse);

            if (medsResponse.success) {
                // ГАРАНТИРУЕМ, что это массив
                state.todayMedications = Array.isArray(medsResponse.data)
                    ? medsResponse.data
                    : [];
            } else {
                console.warn('⚠️ Не удалось загрузить лекарства:', medsResponse.error);
                state.todayMedications = [];
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки лекарств:', error);
            state.todayMedications = [];
        }

        // Загружаем запись за сегодня
        try {
            const today = new Date().toISOString().split('T')[0];
            console.log('📅 Загрузка записи за:', today);

            const entryResponse = await HealthAPI.getEntryByDate(today);
            console.log('📝 Ответ API записи:', entryResponse);

            if (entryResponse.success) {
                state.todayEntry = entryResponse.data || null;
            } else {
                console.log('📝 Запись за сегодня не найдена');
                state.todayEntry = null;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки записи:', error);
            state.todayEntry = null;
        }

        // Загружаем сводку
        try {
            console.log('📈 Загрузка сводки...');
            const summaryResponse = await HealthAPI.getHealthSummary(7);
            console.log('📊 Ответ API сводки:', summaryResponse);

            if (summaryResponse.success) {
                state.stats = summaryResponse.data || null;
            } else {
                console.warn('⚠️ Не удалось загрузить сводку:', summaryResponse.error);
                state.stats = null;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки сводки:', error);
            state.stats = null;
        }

        // Рендерим контент
        try {
            const html = await fetchComponent('health-dashboard.html');
            elements.container.innerHTML = html;

            // Инициализируем компоненты панели
            HealthUI.initDashboardComponents();
        } catch (error) {
            console.error('❌ Ошибка рендеринга панели:', error);
            showError('Не удалось загрузить главную панель');
        }
    }

    /**
     * Загрузка аптечки
     */
    async function loadMedications() {
        const response = await HealthAPI.getMedications(true);
        if (response.success) {
            state.medications = response.data || [];
        }

        const html = await fetchComponent('health-medications.html');
        elements.container.innerHTML = html;

        HealthUI.initMedicationsComponents();
    }

    /**
     * Загрузка дневника
     */
    async function loadDiary() {
        const html = await fetchComponent('health-diary.html');
        elements.container.innerHTML = html;

        HealthUI.initDiaryComponents();
    }

    /**
     * Загрузка статистики
     */
    async function loadStats() {
        const response = await HealthAPI.getHealthStatistics(30);
        if (response.success) {
            state.stats = response.data;
        }

        const html = await fetchComponent('health-stats.html');
        elements.container.innerHTML = html;

        HealthUI.initStatsComponents();
    }

    /**
     * Загрузка HTML компонента
     */
    async function fetchComponent(componentName) {
        try {
            const response = await fetch(`components/${componentName}`);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName}`);
            }
            return await response.text();
        } catch (error) {
            console.error('❌ Ошибка загрузки компонента:', error);
            return '<div class="health-error">Не удалось загрузить компонент</div>';
        }
    }

    /**
     * Скрыть экран онбординга
     */
    function hideOnboarding() {
        const onboardingContainer = elements.container.querySelector('.onboarding-container');
        if (onboardingContainer) {
            onboardingContainer.classList.add('onboarding-fade-out');

            // Удаляем через 300мс после анимации
            setTimeout(() => {
                elements.container.innerHTML = '';

                // Показываем табы
                if (elements.tabs) {
                    elements.tabs.style.display = 'flex';
                }

                // Показываем индикатор загрузки
                if (elements.loading) {
                    elements.loading.style.display = 'flex';
                }
            }, 300);
        }
    }

    /**
     * Показать экран онбординга
     */
    async function showOnboarding() {
        console.log('👋 Показываем онбординг...');

        // Скрываем табы на время онбординга
        if (elements.tabs) {
            elements.tabs.style.display = 'none';
        }

        // Скрываем индикатор загрузки
        if (elements.loading) {
            elements.loading.style.display = 'none';
        }

        // Загружаем HTML онбординга
        const html = await fetchComponent('health-onboarding.html');

        // Очищаем контейнер и добавляем плавное появление
        elements.container.innerHTML = '';
        elements.container.innerHTML = html;

        // Анимация появления
        setTimeout(() => {
            const onboardingContainer = elements.container.querySelector('.onboarding-container');
            if (onboardingContainer) {
                onboardingContainer.style.opacity = '0';
                onboardingContainer.style.transition = 'opacity 0.5s ease';

                // Принудительный reflow для анимации
                void onboardingContainer.offsetWidth;

                onboardingContainer.style.opacity = '1';
            }
        }, 50);

        // Инициализируем компонент онбординга
        HealthUI.initOnboardingComponents();
    }

    /**
     * Обновление UI
     */
    function updateUI() {
        // Обновляем заголовок
        document.title = `Здоровье - ${getTabTitle(state.currentTab)}`;

        // Показываем табы если они были скрыты
        if (elements.tabs) {
            elements.tabs.style.display = 'flex';
        }
    }

    /**
     * Получить заголовок вкладки
     */
    function getTabTitle(tabName) {
        const titles = {
            dashboard: 'Сегодня',
            medications: 'Аптечка',
            diary: 'Дневник',
            stats: 'Статистика'
        };
        return titles[tabName] || 'Здоровье';
    }

    /**
     * Показать ошибку
     */
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'health-error-message';
        errorDiv.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-text">${message}</div>
        `;
        elements.container.appendChild(errorDiv);
    }

    // Публичные методы
    return {
        init,
        hideOnboarding,
        getState: () => ({ ...state }),
        switchTab,
        refreshData: async () => {
            await loadCurrentTab();
            updateUI();
        },

        // Методы для работы с данными
        setUserGender: async function(gender) {
            try {
                console.log('👤 Сохраняем гендер:', gender);
                const response = await HealthAPI.updateUserGender(gender);
                if (response.success) {
                    state.userData.gender = gender;
                    state.isOnboarding = false;

                    // Перезагружаем опции
                    await loadUserOptions();

                    console.log('✅ Гендер сохранен');
                    return true;
                } else {
                    console.error('❌ Ошибка сохранения гендера:', response.error);
                    return false;
                }
            } catch (error) {
                console.error('❌ Ошибка обновления пола:', error);
                return false;
            }
        },

        // Метод для завершения онбординга (вызывается из UI)
        completeOnboarding: async function() {
            console.log('🎉 Завершаем онбординг...');
            state.isOnboarding = false;

            // Полностью перезапускаем модуль
            await this.init();
        },

        logMedication: async function(medicationId, status, notes) {
            try {
                const response = await HealthAPI.logMedicationIntake(medicationId, status, notes);
                if (response.success) {
                    // Обновляем список лекарств
                    await loadCurrentTab();
                    return true;
                }
                return false;
            } catch (error) {
                console.error('❌ Ошибка отметки лекарства:', error);
                return false;
            }
        },

        updateHealthEntry: async function(date, field, value) {
            try {
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
                }

                if (response && response.success) {
                    state.todayEntry = response.data;
                    return true;
                }
                return false;
            } catch (error) {
                console.error(`❌ Ошибка обновления ${field}:`, error);
                return false;
            }
        }
    };
})();

// Делаем модуль доступным глобально
if (typeof window !== 'undefined') {
    window.HealthModule = HealthModule;
}