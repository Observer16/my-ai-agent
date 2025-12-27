/**
 * Автоинициализация timezone при загрузке приложения
 * Версия: 1.0
 * 
 * Этот файл должен быть подключён ПОСЛЕ:
 * - config.js
 * - api.js
 * - timezone.js
 */

(async function() {
    console.log('🚀 Инициализация timezone...');

    // Ждём полной загрузки Telegram WebApp
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Ждём готовности Telegram WebApp
        tg.ready();
        
        // Небольшая задержка для инициализации API
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Проверяем что API доступен
    if (typeof API === 'undefined') {
        console.error('❌ API не найден. Timezone не инициализирован.');
        return;
    }

    // Проверяем что TimezoneManager доступен
    if (typeof TimezoneManager === 'undefined') {
        console.error('❌ TimezoneManager не найден. Загрузите timezone.js');
        return;
    }

    // Автоинициализация timezone
    try {
        await TimezoneManager.initialize();
    } catch (error) {
        console.error('❌ Ошибка инициализации timezone:', error);
    }
})();
