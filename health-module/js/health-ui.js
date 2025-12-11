// health-module/js/health-ui.js - минимальная обёртка
console.log('📁 health-ui.js - используйте main.js напрямую');

// Просто переадресация
if (typeof window !== 'undefined') {
    // Загружаем main.js если он есть
    if (!window.HealthUI && window.HealthUIMain) {
        window.HealthUI = window.HealthUIMain;
    }

    // Автозагрузка при необходимости
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.HealthUI && window.loadHealthModule) {
            window.loadHealthModule();
        }
    });
}