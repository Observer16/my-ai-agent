// js/health-module.js

/**
 * Основной модуль здоровья
 */
const HealthModule = (function() {
    // Состояние модуля
    let state = {
        currentTab: 'dashboard',
        userData: null,
        userGender: null,
        userOptions: null,
        medications: [],
        todayMedications: [],
        todayEntry: null,
        stats: null,
        isLoading: true,
        isOnboarding: false
    };

    // DOM элементы
    let elements = {};

    /**
     * Инициализация DOM элементов
     */
    function initElements() {
        try {
            // Получаем или создаем основные элементы
            elements.container = document.getElementById('health-container');
            elements.loading = document.getElementById('health-loading');
            elements.tabs = document.getElementById('health-tabs');
            elements.tabButtons = document.querySelectorAll('.health-tab');
            elements.modals = document.getElementById('health-modals');

            // Если loading не найден - создаем его
            if (!elements.loading && elements.container) {
                console.log('⚠️ Элемент health-loading не найден, создаем...');
                const loadingDiv = document.createElement('div');
                loadingDiv.id = 'health-loading';
                loadingDiv.className = 'health-loading';
                loadingDiv.innerHTML = `
                    <div class="loading-spinner"></div>
                    <p>Загрузка модуля здоровья...</p>
                `;
                loadingDiv.style.display = 'none';
                elements.container.appendChild(loadingDiv);
                elements.loading = loadingDiv;
            }

            console.log('✅ DOM элементы инициализированы:', {
                container: !!elements.container,
                loading: !!elements.loading,
                tabs: !!elements.tabs,
                tabButtons: elements.tabButtons.length,
                modals: !!elements.modals
            });
        } catch (error) {
            console.error('❌ Ошибка инициализации DOM элементов:', error);
            // Создаем минимальный набор элементов
            elements = {
                container: document.getElementById('health-container') || document.body,
                loading: document.getElementById('health-loading'),
                tabs: document.getElementById('health-tabs'),
                tabButtons: [],
                modals: document.getElementById('health-modals')
            };
        }
    }

    /**
     * Инициализация модуля
     */
    async function init() {
        console.log('🩺 Инициализация модуля здоровья...');

        // Сбрасываем состояние онбординга
        state.isOnboarding = false;
        state.isLoading = true;

        // Инициализируем DOM элементы
        initElements();

        // Показываем индикатор загрузки
        if (elements.loading) {
            elements.loading.style.display = 'flex';
        }

        try {
            // 1. Загружаем гендер пользователя (ГЛАВНЫЙ проверочный метод)
            await loadUserGender();

            // 2. Проверяем, нужен ли онбординг
            const needsOnboarding = await checkOnboarding();

            console.log('🔍 Результат проверки онбординга:', {
                needsOnboarding,
                userGender: state.userGender,
                isOnboarding: state.isOnboarding
            });

            if (needsOnboarding) {
                // Показываем онбординг и ВЫХОДИМ из init
                console.log('👋 Требуется онбординг');
                await showOnboarding();
                return; // Не продолжаем дальше!
            }

            // 3. Загружаем остальные данные (только если онбординг не нужен)
            await loadUserData();
            await loadUserOptions();

            // 4. Инициализируем интерфейс
            initTabs();
            await loadCurrentTab();

            state.isLoading = false;
            updateUI();

            console.log('✅ Модуль здоровья инициализирован');

        } catch (error) {
            console.error('💥 Ошибка инициализации модуля:', error);
            showError(`Ошибка загрузки: ${error.message}`);
        } finally {
            if (elements.loading) {
                elements.loading.style.display = 'none';
            }
        }
    }

    /**
     * Загрузить гендер пользователя
     */
    async function loadUserGender() {
        try {
            console.log('🔍 Проверяем гендер пользователя...');

            const response = await HealthAPI.getUserGender();

            if (response.success && response.data) {
                // Гендер может быть строкой или null
                const gender = response.data.gender;

                console.log('⚧️ Получен гендер из API:', {
                    gender,
                    isString: typeof gender === 'string',
                    isNull: gender === null,
                    isUndefined: gender === undefined,
                    length: gender ? gender.length : 0
                });

                // Сохраняем в state
                state.userGender = gender;

                // Сохраняем в localStorage для быстрого доступа
                if (gender) {
                    localStorage.setItem('health_user_gender', gender);
                } else {
                    localStorage.removeItem('health_user_gender');
                }

                return true;
            } else {
                console.warn('⚠️ Не удалось загрузить гендер:', response.error);
                state.userGender = null;
                return false;
            }

        } catch (error) {
            console.error('❌ Ошибка загрузки гендера:', error);
            state.userGender = null;
            return false;
        }
    }

    /**
     * Проверка онбординга
     */
    function checkOnboarding() {
        console.log('🎯 Проверка необходимости онбординга...', {
            stateGender: state.userGender,
            cachedGender: localStorage.getItem('health_user_gender')
        });

        // 1. Если уже в процессе онбординга - не показываем снова
        if (state.isOnboarding) {
            console.log('⏳ Онбординг уже в процессе');
            return false;
        }

        // 2. Проверяем гендер в state (только что загруженный из API)
        if (state.userGender && state.userGender !== 'null' && state.userGender !== '') {
            console.log('✅ Гендер уже указан в state:', state.userGender);
            return false;
        }

        // 3. Проверяем кэш в localStorage
        const cachedGender = localStorage.getItem('health_user_gender');
        if (cachedGender && cachedGender !== 'null' && cachedGender !== '') {
            console.log('✅ Гендер найден в кэше:', cachedGender);
            state.userGender = cachedGender;
            return false;
        }

        // 4. Если гендера нет нигде - требуется онбординг
        console.log('❌ Гендер не найден, требуется онбординг');
        state.isOnboarding = true;
        return true;
    }

    /**
     * Завершить онбординг и перезагрузить модуль
     */
    async function completeOnboarding() {
        console.log('🎉 Завершение онбординга...');

        // 1. Сбрасываем флаги
        state.isOnboarding = false;
        state.isLoading = true;

        // 2. Показываем индикатор загрузки
        if (elements.loading) {
            elements.loading.style.display = 'flex';
        }

        // 3. Очищаем контейнер, но НЕ удаляем health-loading
        if (elements.container) {
            // Находим health-loading и сохраняем ссылку
            const loadingEl = elements.container.querySelector('#health-loading');

            // Очищаем остальной контент
            const children = Array.from(elements.container.children);
            children.forEach(child => {
                if (child.id !== 'health-loading' && child.id !== 'health-tabs') {
                    elements.container.removeChild(child);
                }
            });

            // Добавляем сообщение о загрузке
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'onboarding-complete-message';
            loadingMessage.style.textAlign = 'center';
            loadingMessage.style.padding = '80px 20px';
            loadingMessage.innerHTML = `
                <div class="loading-spinner" style="margin: 0 auto 20px;"></div>
                <p style="color: #666; font-size: 16px;">Настраиваем модуль здоровья...</p>
            `;

            elements.container.appendChild(loadingMessage);
        }

        // 4. Ждем немного и перезапускаем модуль
        setTimeout(async () => {
            // Перезапускаем модуль
            await init();
        }, 1000);
    }

    /**
     * Загрузить данные пользователя (профиль)
     */
    async function loadUserData() {
        try {
            const userResponse = await HealthAPI.getUserInfo();
            if (userResponse.success) {
                state.userData = userResponse.data;
                console.log('👤 Данные пользователя загружены');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки данных пользователя:', error);
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
        // Очищаем контейнер, но не health-loading
        const children = Array.from(elements.container.children);
        children.forEach(child => {
            if (child.id !== 'health-loading' && child.id !== 'health-tabs') {
                elements.container.removeChild(child);
            }
        });

        // Защита от null
        if (elements.loading) {
            elements.loading.style.display = 'flex';
        }

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
            // Защита от null
            if (elements.loading) {
                elements.loading.style.display = 'none';
            }
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
        completeOnboarding,
        getState: () => ({ ...state }),

        setUserGender: async function(gender) {
            try {
                console.log('💾 Сохраняем гендер:', gender);

                const response = await HealthAPI.updateUserGender(gender);

                if (response.success) {
                    // Сохраняем локально
                    state.userGender = gender;
                    localStorage.setItem('health_user_gender', gender);

                    console.log('✅ Гендер сохранен:', {
                        в_state: state.userGender,
                        в_localStorage: localStorage.getItem('health_user_gender'),
                        ответ_API: response.data
                    });

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

            // Сбрасываем флаг ПЕРЕД инициализацией
            state.isOnboarding = false;

            // Убеждаемся что гендер сохранён
            console.log('📋 Гендер перед перезапуском:', {
                state: state.userGender,
                localStorage: localStorage.getItem('health_user_gender')
            });

            // Перезапускаем модуль - вызываем внутреннюю функцию init
            await init();
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