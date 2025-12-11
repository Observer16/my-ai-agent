// managers/onboarding-manager.js
const OnboardingManager = (function() {
    let isInitialized = false;

    // Проверить нужен ли онбординг
    async function checkIfNeeded(userGender) {
        console.log('🎯 Проверка необходимости онбординга...', {
            stateGender: userGender,
            cachedGender: localStorage.getItem('health_user_gender')
        });

        // Если уже в процессе онбординга
        if (StateManager.getState().isOnboarding) {
            console.log('⏳ Онбординг уже в процессе');
            return false;
        }

        // Проверяем гендер в state
        if (userGender && userGender !== 'null' && userGender !== '') {
            console.log('✅ Гендер уже указан в state:', userGender);
            return false;
        }

        // Проверяем кэш в localStorage
        const cachedGender = localStorage.getItem('health_user_gender');
        if (cachedGender && cachedGender !== 'null' && cachedGender !== '') {
            console.log('✅ Гендер найден в кэше:', cachedGender);
            StateManager.updateState({ userGender: cachedGender });
            return false;
        }

        // Если гендера нет нигде - требуется онбординг
        console.log('❌ Гендер не найден, требуется онбординг');
        return true;
    }

    // Показать экран онбординга
    async function show() {
        console.log('👋 Показываем онбординг...');

        const state = StateManager.getState();
        if (state.isOnboarding) return;

        // Обновляем состояние - ГЛАВНОЕ: isLoading = false
        StateManager.updateState({
            isOnboarding: true,
            isLoading: false
        });

        // Скрываем табы
        DomManager.hideTabs();
        DomManager.hideLoading(); // ← важно!

        // Загружаем HTML онбординга
        const html = await ComponentLoader.load('health-onboarding.html');

        // Очищаем контейнер и добавляем контент
        DomManager.clearContainer();
        DomManager.setContainerHTML(html);

        // Анимация появления
        setTimeout(() => {
            const onboardingContainer = document.querySelector('.onboarding-container');
            if (onboardingContainer) {
                onboardingContainer.style.opacity = '0';
                onboardingContainer.style.transition = 'opacity 0.5s ease';
                void onboardingContainer.offsetWidth;
                onboardingContainer.style.opacity = '1';
            }
        }, 50);

        // Инициализируем компоненты
        if (window.HealthUI && window.HealthUI.initOnboardingComponents) {
            HealthUI.initOnboardingComponents();
        }

        // ВОЗВРАЩАЕМ ПРОМИС, который разрешится когда онбординг завершится
        return new Promise((resolve) => {
            EventManager.on('onboarding:completed', () => {
                console.log('🎉 Онбординг завершен в менеджере');
                resolve(true);
            });
        });
    }

    // Сохранить гендер пользователя
    async function saveGender(gender) {
        try {
            console.log('💾 Сохраняем гендер:', gender);

            if (!window.HealthAPI) {
                throw new Error('HealthAPI не доступен');
            }

            const response = await HealthAPI.updateUserGender(gender);

            if (response.success) {
                // Сохраняем локально
                StateManager.updateState({ userGender: gender });
                localStorage.setItem('health_user_gender', gender);

                console.log('✅ Гендер сохранен:', {
                    в_state: gender,
                    в_localStorage: localStorage.getItem('health_user_gender'),
                    ответ_API: response.data
                });

                EventManager.emit('onboarding:genderSaved', gender);
                return true;
            } else {
                console.error('❌ Ошибка сохранения гендера:', response.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Ошибка обновления пола:', error);
            ErrorHandler.show('Не удалось сохранить гендер');
            return false;
        }
    }

    // Завершить онбординг
    async function complete() {
        console.log('🎉 Завершаем онбординг...');

        // Сначала завершаем процесс онбординга
        StateManager.updateState({
            isOnboarding: false,
            isLoading: true // будем загружать основной интерфейс
        });

        console.log('📋 Гендер после онбординга:', {
            state: StateManager.getState().userGender,
            localStorage: localStorage.getItem('health_user_gender')
        });

        // Скрываем контейнер онбординга плавно
        const onboardingContainer = document.querySelector('.onboarding-container');
        if (onboardingContainer) {
            onboardingContainer.style.opacity = '0';
            onboardingContainer.style.transition = 'opacity 0.3s ease';

            // Ждем завершения анимации
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // ТРИГГЕРИМ СОБЫТИЕ завершения
        EventManager.emit('onboarding:completed');

        console.log('✅ Онбординг завершен, можно загружать основной интерфейс');
        return true;
    }

    // Инициализация
    function init() {
        if (isInitialized) return;
        isInitialized = true;
        console.log('✅ OnboardingManager инициализирован');
    }

    return {
        init,
        checkIfNeeded,
        show,
        saveGender,
        complete
    };
})();

if (typeof window !== 'undefined') {
    window.OnboardingManager = OnboardingManager;
}