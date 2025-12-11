// tabs/stats-manager.js
const StatsManager = (function() {
    let isInitialized = false;

    // Загрузить статистику
    async function load() {
        console.log('📈 Загрузка статистики...');

        // Загружаем данные
        await DataManager.loadHealthSummary(30);

        // Рендерим контент
        await render();

        // Инициализируем компоненты
        initComponents();

        EventManager.emit('stats:loaded');
    }

    // Рендеринг
    async function render() {
        try {
            const html = await ComponentLoader.load('health-stats.html');
            DomManager.setContainerHTML(html);
        } catch (error) {
            console.error('❌ Ошибка рендеринга статистики:', error);
            ErrorHandler.show('Не удалось загрузить статистику');
        }
    }

    // Инициализация компонентов
    function initComponents() {
        if (window.HealthUI && window.HealthUI.initStatsComponents) {
            HealthUI.initStatsComponents();
        }
    }

    // Инициализация
    function init() {
        if (isInitialized) return;

        // Регистрируем обработчик вкладки
        TabManager.registerTabHandler('stats', load);

        isInitialized = true;
        console.log('✅ StatsManager инициализирован');
    }

    return {
        init,
        load
    };
})();

if (typeof window !== 'undefined') {
    window.StatsManager = StatsManager;
}