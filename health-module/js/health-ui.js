// health-module/js/health-ui.js
// Обёртка для обратной совместимости после декомпозиции

console.log('🔗 health-ui.js - обёртка для обратной совместимости');

const HealthUIWrapper = (function() {
    // Флаг, что это обёртка, а не реальная реализация
    const isWrapper = true;

    // Ждём загрузки main.js
    function waitForMainModule() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.HealthUIMain && !window.HealthUIMain.__isStub) {
                    clearInterval(checkInterval);
                    resolve(window.HealthUIMain);
                }
            }, 100);

            // Таймаут 5 секунд
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(null);
            }, 5000);
        });
    }

    // Получить реальную реализацию или заглушку
    async function getRealImplementation() {
        // Если main.js уже загружен
        if (window.HealthUIMain && !window.HealthUIMain.__isStub) {
            return window.HealthUIMain;
        }

        // Если компоненты уже загружены напрямую
        if (window.Dashboard && window.Diary && window.Medications) {
            console.log('✅ Декомпозированные компоненты уже загружены');
            return {
                initDashboardComponents: () => window.Dashboard?.init(),
                initMedicationsComponents: () => window.Medications?.init(),
                initDiaryComponents: () => window.Diary?.init(),
                initStatsComponents: () => window.Stats?.init(),
                initOnboardingComponents: () => window.Onboarding?.init(),
                showToast: (msg, type) => {
                    console.log(`[Toast ${type}]: ${msg}`);
                    // Простая реализация, если нет основной
                    const toast = document.createElement('div');
                    toast.className = `health-toast toast-${type}`;
                    toast.textContent = msg;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                },
                showModal: (type, data) => {
                    console.log(`[Modal ${type}]:`, data);
                    if (window.ModalManager) window.ModalManager.show(type, data);
                },
                closeModal: () => {
                    if (window.ModalManager) window.ModalManager.close();
                },
                selectMood: async (mood) => {
                    const today = new Date().toISOString().split('T')[0];
                    return HealthModule?.updateHealthEntry(today, 'mood', mood);
                },
                saveSleep: async () => {
                    const input = document.getElementById('modal-sleep-input');
                    if (!input?.value) return false;
                    const today = new Date().toISOString().split('T')[0];
                    return HealthModule?.updateHealthEntry(today, 'sleep', parseFloat(input.value));
                },
                saveWeight: async () => {
                    const input = document.getElementById('modal-weight-input');
                    if (!input?.value) return false;
                    const today = new Date().toISOString().split('T')[0];
                    return HealthModule?.updateHealthEntry(today, 'weight', parseFloat(input.value));
                },
                updateSymptomsList: () => {
                    if (window.SymptomModal) window.SymptomModal.updateSymptomsList();
                },
                saveSymptom: async () => {
                    if (window.SymptomModal) return window.SymptomModal.save();
                    return false;
                }
            };
        }

        // Ждём загрузки main.js
        console.log('⏳ Ожидание загрузки main.js...');
        const mainModule = await waitForMainModule();

        if (mainModule) {
            console.log('✅ Main.js загружен, делегирую вызовы');
            return mainModule;
        }

        console.warn('⚠️ Main.js не загружен, использую заглушки');
        return null;
    }

    // Создаём прокси-объект, который делегирует вызовы
    return new Proxy({}, {
        get: function(target, prop) {
            // Если метод существует в обёртке
            if (prop === '__isWrapper') return isWrapper;
            if (prop === '__isStub') return true;

            // Возвращаем асинхронную функцию, которая найдёт реальную реализацию
            return async function(...args) {
                const realImpl = await getRealImplementation();

                if (realImpl && typeof realImpl[prop] === 'function') {
                    return realImpl[prop].apply(realImpl, args);
                }

                // Если метода нет, логируем и пробуем альтернативы
                console.warn(`⚠️ HealthUI.${prop} не найден, пробую альтернативы...`);

                // Альтернативные реализации для ключевых методов
                switch(prop) {
                    case 'initDashboardComponents':
                        if (window.Dashboard && window.Dashboard.init) {
                            console.log('✅ Использую Dashboard.init() напрямую');
                            return window.Dashboard.init();
                        }
                        break;

                    case 'initMedicationsComponents':
                        if (window.Medications && window.Medications.init) {
                            return window.Medications.init();
                        }
                        break;

                    case 'initDiaryComponents':
                        if (window.Diary && window.Diary.init) {
                            return window.Diary.init();
                        }
                        break;

                    case 'initStatsComponents':
                        if (window.Stats && window.Stats.init) {
                            return window.Stats.init();
                        }
                        break;

                    case 'initOnboardingComponents':
                        if (window.Onboarding && window.Onboarding.init) {
                            return window.Onboarding.init();
                        }
                        break;

                    case 'showToast':
                        console.log(`[Toast]: ${args[0]}`);
                        return;
                }

                console.error(`❌ HealthUI.${prop} не реализован`);
                return null;
            };
        }
    });
})();

// Экспорт в глобальную область
if (typeof window !== 'undefined') {
    // Сохраняем текущий HealthUI если он есть
    if (window.HealthUI && !window.HealthUI.__isWrapper) {
        window.HealthUIPrevious = window.HealthUI;
    }

    // Устанавливаем нашу обёртку
    window.HealthUI = HealthUIWrapper;

    // Если main.js загрузится позже, он должен перезаписать HealthUI
    Object.defineProperty(window, 'HealthUIMain', {
        set: function(value) {
            // Сохраняем ссылку на main.js реализацию
            window.__HealthUIMain = value;
            // Перезаписываем HealthUI
            window.HealthUI = value;
            console.log('✅ HealthUI заменён на main.js реализацию');
        },
        get: function() {
            return window.__HealthUIMain;
        }
    });

    console.log('✅ HealthUI обёртка установлена');
}

// Автоматически инициируем загрузку компонентов если они нужны
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли контейнер здоровья на странице
    const healthContainer = document.getElementById('health-container');
    if (healthContainer && !window.Dashboard && window.loadHealthModule) {
        console.log('🔄 Автозагрузка компонентов здоровья...');
        setTimeout(() => window.loadHealthModule(), 100);
    }
});

// Для ES6 модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthUIWrapper;
}