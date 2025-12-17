/**
 * Менеджер вкладки "Настройки"
 */

const SettingsManager = {
    /**
     * Инициализация вкладки
     */
    async init() {
        console.log('⚙️ Инициализация вкладки настроек...');
        
        const container = document.getElementById('health-container');
        if (!container) {
            console.error('Контейнер не найден');
            return;
        }

        // Рендерим компонент
        container.innerHTML = SettingsComponent.render();

        // Инициализируем компонент
        await SettingsComponent.init();
    },

    /**
     * Очистка вкладки
     */
    cleanup() {
        console.log('🧹 Очистка вкладки настроек...');
        
        // Останавливаем таймер если он есть
        if (SettingsComponent.state.countdownTimer) {
            SettingsComponent.stopCountdown();
        }
    }
};

// Экспорт
window.SettingsManager = SettingsManager;
