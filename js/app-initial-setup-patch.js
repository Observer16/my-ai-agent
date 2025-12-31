// js/app-initial-setup-patch.js
/**
 * Патч для интеграции первичной настройки в app.js
 * Этот файл должен загружаться ПОСЛЕ app.js
 */

// Сохраняем оригинальный обработчик DOMContentLoaded
const originalDOMContentLoaded = document.addEventListener;

// Перехватываем DOMContentLoaded только для интеграции первичной настройки
(async function initAppWithSetup() {
    // Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    
    // Небольшая задержка чтобы app.js точно успел выполниться
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('🔧 Проверка необходимости первичной настройки...');
    
    // Проверяем нужна ли первичная настройка
    try {
        const needsSetup = await checkInitialSetup();
        
        if (needsSetup) {
            console.log('📝 Показываем окно первичной настройки');
            await showInitialSetupModal();
        } else {
            console.log('✅ Первичная настройка не требуется');
        }
    } catch (error) {
        console.error('❌ Ошибка проверки первичной настройки:', error);
        // Не блокируем работу приложения при ошибке
    }
})();

console.log('✅ App-initial-setup-patch.js загружен');
