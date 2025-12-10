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
    let elements = null;

    /**
     * Инициализация модуля
     */
    async function init() {
        console.log('🩺 Инициализация модуля здоровья...');

        // ВАЖНО: Всегда сбрасываем состояние при инициализации
        state.isOnboarding = false;
        state.isLoading = true;

        // 1. Инициализируем DOM элементы (ВСЕГДА сначала это!)
        initElements();

        // 2. Проверяем, что элементы существуют
        if (!elements || !elements.container) {
            console.error('❌ Критическая ошибка: DOM элементы не найдены');
            showCriticalError('Не удалось инициализировать интерфейс');
            return;
        }

        // 3. Показываем индикатор загрузки (с проверкой)
        if (elements.loading && elements.loading.style) {
            elements.loading.style.display = 'flex';
        }

        try {
            // 4. Загружаем гендер пользователя
            await loadUserGender();

            // 5. Проверяем, нужен ли онбординг
            const needsOnboarding = checkOnboarding();

            console.log('🔍 Результат проверки онбординга:', {
                needsOnboarding,
                userGender: state.userGender,
                isOnboarding: state.isOnboarding
            });

            if (needsOnboarding) {
                // Показываем онбординг
                console.log('👋 Требуется онбординг');
                await showOnboarding();
                return; // Не продолжаем дальше
            }

            // 6. Загружаем остальные данные
            await loadUserData();
            await loadUserOptions();

            // 7. Инициализируем интерфейс
            initTabs();
            await loadCurrentTab();

            state.isLoading = false;
            updateUI();

            console.log('✅ Модуль здоровья инициализирован');

        } catch (error) {
            console.error('💥 Ошибка инициализации модуля:', error);
            showError(`Ошибка загрузки: ${error.message}`);
        } finally {
            // 8. Всегда скрываем индикатор загрузки (с проверкой)
            if (elements.loading && elements.loading.style) {
                elements.loading.style.display = 'none';
            }
        }
    }

    /**
     * Инициализация DOM элементов (БЕЗОПАСНАЯ версия)
     */
    function initElements() {
        console.log('🔧 Инициализация DOM элементов...');

        try {
            elements = {
                container: document.getElementById('health-container'),
                loading: document.getElementById('health-loading'),
                tabs: document.getElementById('health-tabs'),
                tabButtons: document.querySelectorAll('.health-tab'),
                modals: document.getElementById('health-modals')
            };

            // Проверяем каждый элемент
            const elementChecks = {
                container: !!elements.container,
                loading: !!elements.loading,
                tabs: !!elements.tabs,
                tabButtons: elements.tabButtons ? elements.tabButtons.length : 0,
                modals: !!elements.modals
            };

            console.log('✅ DOM элементы:', elementChecks);

            // Если контейнер не найден - критическая ошибка
            if (!elements.container) {
                throw new Error('Контейнер health-container не найден в DOM');
            }

        } catch (error) {
            console.error('❌ Ошибка инициализации DOM элементов:', error);
            elements = {
                container: document.body, // Фолбэк на body
                loading: null,
                tabs: null,
                tabButtons: [],
                modals: null
            };
        }
    }

    /**
     * Показать экран онбординга
     */
    async function showOnboarding() {
        console.log('👋 Показываем экран онбординга...');

        // 1. Скрываем табы (с проверкой)
        if (elements.tabs && elements.tabs.style) {
            elements.tabs.style.display = 'none';
        }

        // 2. Скрываем индикатор загрузки (с проверкой)
        if (elements.loading && elements.loading.style) {
            elements.loading.style.display = 'none';
        }

        // 3. Очищаем контейнер
        if (elements.container) {
            elements.container.innerHTML = '';

            // Загружаем HTML онбординга
            try {
                const html = await fetchComponent('health-onboarding.html');
                elements.container.innerHTML = html;

                // Инициализируем компонент онбординга
                if (typeof HealthUI !== 'undefined' && HealthUI.initOnboardingComponents) {
                    HealthUI.initOnboardingComponents();
                } else {
                    throw new Error('HealthUI не загружен');
                }

            } catch (error) {
                console.error('❌ Ошибка загрузки онбординга:', error);
                showError('Не удалось загрузить форму онбординга');
            }
        }
    }

    /**
     * Завершить онбординг и перезагрузить модуль (БЕЗОПАСНАЯ версия)
     */
    async function completeOnboarding() {
        console.log('🎉 Завершение онбординга...');

        // 1. Сбрасываем флаги
        state.isOnboarding = false;
        state.isLoading = true;

        // 2. Переинициализируем DOM элементы (ВАЖНО!)
        initElements();

        // 3. Показываем индикатор загрузки (с проверкой)
        if (elements.loading && elements.loading.style) {
            elements.loading.style.display = 'flex';
        }

        // 4. Очищаем контейнер с плавным переходом
        if (elements.container && elements.container.style) {
            elements.container.style.opacity = '0.5';
            elements.container.style.transition = 'opacity 0.3s ease';

            setTimeout(() => {
                if (elements.container) {
                    elements.container.innerHTML = `
                        <div style="text-align: center; padding: 80px 20px;">
                            <div class="loading-spinner" style="margin: 0 auto 20px;"></div>
                            <p style="color: #666; font-size: 16px;">Настраиваем модуль здоровья...</p>
                        </div>
                    `;
                    elements.container.style.opacity = '1';
                }
            }, 300);
        }

        // 5. Загружаем гендер ЕЩЕ РАЗ
        await loadUserGender();

        // 6. Ждем немного и перезапускаем модуль
        setTimeout(async () => {
            try {
                await init(); // Вызываем init() а не this.init()
            } catch (error) {
                console.error('❌ Ошибка перезагрузки модуля:', error);
                showError('Ошибка перезагрузки модуля');
            }
        }, 1000);
    }

    /**
     * Показать критическую ошибку
     */
    function showCriticalError(message) {
        // Используем document.body как фолбэк
        const container = elements?.container || document.body;
        container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h3 style="margin-bottom: 10px;">Критическая ошибка</h3>
                <p style="color: #666; margin-bottom: 20px;">${message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Перезагрузить
                </button>
            </div>
        `;
    }

    /**
     * Показать ошибку
     */
    function showError(message) {
        if (elements.container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'health-error-message';
            errorDiv.innerHTML = `
                <div class="error-icon">⚠️</div>
                <div class="error-text">${message}</div>
            `;
            elements.container.appendChild(errorDiv);
        }
    }

    /**
     * Обновление UI (с проверкой элементов)
     */
    function updateUI() {
        // Обновляем заголовок
        document.title = `Здоровье - ${getTabTitle(state.currentTab)}`;

        // Показываем табы если они были скрыты (с проверкой)
        if (elements.tabs && elements.tabs.style) {
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

        // Явно экспортируем initElements для отладки
        _debug: {
            initElements,
            elements: () => elements
        },

        setUserGender: async function(gender) {
            try {
                console.log('💾 Сохраняем гендер:', gender);

                const response = await HealthAPI.updateUserGender(gender);

                if (response.success) {
                    // Сохраняем локально
                    state.userGender = gender;
                    localStorage.setItem('health_user_gender', gender);

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

            // Сбрасываем флаг ПЕРЕД инициализацией
            state.isOnboarding = false;

            // Убеждаемся что гендер сохранён
            console.log('📋 Гендер перед перезапуском:', {
                state: state.userGender,
                localStorage: localStorage.getItem('health_user_gender')
            });

            // Перезапускаем модуль
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