// app-patch.js - Добавить эту функцию в app.js

/**
 * Открыть настройки
 */
function openSettings() {
    tg.HapticFeedback.impactOccurred('light');
    window.location.href = 'pages/settings.html';
}
