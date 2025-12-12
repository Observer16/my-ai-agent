// js/utils/toast.js
(function() {
    /**
     * Показывает toast-уведомление
     * @param {string} message - Текст сообщения
     * @param {string} type - Тип: 'success', 'error', 'info', 'warning'
     */
    window.showToast = function(message, type = 'info') {
        console.log(`🍞 Toast [${type}]: ${message}`);

        // Haptic feedback для Telegram
        if (window.Telegram?.WebApp) {
            if (type === 'success') {
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } else if (type === 'error') {
                Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            } else {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        }

        // Удаляем предыдущие toast (чтобы не накапливались)
        const existingToasts = document.querySelectorAll('.health-toast');
        existingToasts.forEach(t => t.remove());

        // Создаем toast
        const toast = document.createElement('div');
        toast.className = `health-toast toast-${type}`;

        // Иконка по типу
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        const icon = icons[type] || 'ℹ️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        // Добавляем в body
        document.body.appendChild(toast);

        // Анимация появления
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        });

        // Скрываем через 3 секунды
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    };

    console.log('✅ Toast utility загружен');
})();