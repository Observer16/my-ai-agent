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
        isLoading: true
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
        await checkOnboarding();

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
        if (!state.userData || !state.userData.gender) {
            // Показываем экран онбординга
            await showOnboarding();
        }
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
        // Загружаем лекарства на сегодня
        const medsResponse = await HealthAPI.getTodayMedications();
        if (medsResponse.success) {
            state.todayMedications = medsResponse.data || [];
        }

        // Загружаем запись за сегодня
        const today = new Date().toISOString().split('T')[0];
        const entryResponse = await HealthAPI.getEntryByDate(today);
        if (entryResponse.success) {
            state.todayEntry = entryResponse.data;
        }

        // Загружаем сводку
        const summaryResponse = await HealthAPI.getHealthSummary(7);
        if (summaryResponse.success) {
            state.stats = summaryResponse.data;
        }

        // Рендерим контент
        const html = await fetchComponent('health-dashboard.html');
        elements.container.innerHTML = html;

        // Инициализируем компоненты панели
        HealthUI.initDashboardComponents();
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
     * Показать экран онбординга
     */
    async function showOnboarding() {
        const html = await fetchComponent('health-onboarding.html');
        elements.container.innerHTML = html;

        // Инициализируем компонент онбординга
        HealthUI.initOnboardingComponents();
    }

    /**
     * Обновление UI
     */
    function updateUI() {
        // Обновляем заголовок
        document.title = `Здоровье - ${getTabTitle(state.currentTab)}`;
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
        getState: () => ({ ...state }),
        switchTab,
        refreshData: async () => {
            await loadCurrentTab();
            updateUI();
        },

        // Методы для работы с данными
        setUserGender: async function(gender) {
            try {
                const response = await HealthAPI.updateUserGender(gender);
                if (response.success) {
                    state.userData.gender = gender;
                    // Перезагружаем опции
                    await loadUserOptions();
                    return true;
                }
                return false;
            } catch (error) {
                console.error('❌ Ошибка обновления пола:', error);
                return false;
            }
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