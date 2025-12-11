// health-module/js/load-compat.js
// Загрузчик для совместимости старых и новых модулей

function loadHealthModule() {
    // Проверяем, загружен ли уже main.js
    if (window.HealthUI && window.HealthUI.__isMainModule) {
        console.log('✅ Main module already loaded');
        return;
    }

    // Динамически загружаем скрипты (в правильном порядке)
    const scripts = [
        'utils/constants.js',
        'utils/formatters.js',
        'utils/validators.js',
        'components/Dashboard.js',
        'components/Diary.js',
        'components/Medications.js',
        'components/Stats.js',
        'components/Onboarding.js',
        'modals/BaseModal.js',
        'modals/MoodModal.js',
        'modals/SymptomModal.js',
        'main.js'
    ];

    // Загрузчик для старых браузеров без модулей ES6
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Последовательная загрузка
    async function loadAll() {
        console.log('🔄 Загрузка декомпозированных модулей...');

        for (const script of scripts) {
            try {
                await loadScript(`/health-module/js/${script}`);
                console.log(`✅ Загружен: ${script}`);
            } catch (error) {
                console.error(`❌ Ошибка загрузки ${script}:`, error);
            }
        }

        console.log('✅ Все модули загружены');

        // Обновляем обёртку
        if (window.HealthUILegacy) {
            window.HealthUI = window.HealthUILegacy;
        }
    }

    loadAll();
}

// Экспорт
if (typeof window !== 'undefined') {
    window.loadHealthModule = loadHealthModule;

    // Автозагрузка при наличии старого кода
    if (document.querySelector('[data-health-module]')) {
        setTimeout(loadHealthModule, 100);
    }
}