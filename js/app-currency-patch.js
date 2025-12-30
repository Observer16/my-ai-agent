// js/app-currency-patch.js
/**
 * Патч для app.js - добавляет поддержку валют
 * Загружается ПОСЛЕ app.js
 */

// Сохраняем оригинальную функцию formatCurrency
const originalFormatCurrency = window.formatCurrency;

// Переопределяем formatCurrency для использования динамической валюты
window.formatCurrency = function(amount) {
    // Используем formatAmount из currency.js если доступен
    if (typeof formatAmount === 'function') {
        return formatAmount(amount);
    }
    // Fallback на оригинальную функцию
    return originalFormatCurrency(amount);
};

// Добавляем функцию открытия настроек
window.openSettings = function() {
    const tg = window.Telegram.WebApp;
    tg.HapticFeedback.impactOccurred('light');
    window.location.href = 'pages/settings.html';
};

// Инициализация валюты при загрузке приложения
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof initCurrency === 'function') {
        await initCurrency();
        console.log('✅ Валюта инициализирована');
        
        // Перезагружаем данные dashboard с новой валютой
        if (typeof loadMonthlyStats === 'function') {
            await loadMonthlyStats();
        }
    }
});

console.log('✅ Патч валют применён к app.js');
