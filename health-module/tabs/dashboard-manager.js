// tabs/dashboard-manager.js
const DashboardManager = (function() {
    let isInitialized = false;

    // Загрузить панель
    async function load() {
        console.log('📊 Загрузка главной панели...');

        // Загружаем данные
        await Promise.all([
            DataManager.loadTodayMedications(),
            DataManager.loadTodayEntry(),
            DataManager.loadHealthSummary(7)
        ]);

        // Рендерим контент
        await render();

        // Инициализируем компоненты
        initComponents();

        EventManager.emit('dashboard:loaded');
    }

    // Рендеринг
    async function render() {
        try {
            const html = await ComponentLoader.load('health-dashboard.html');
            DomManager.setContainerHTML(html);
        } catch (error) {
            console.error('❌ Ошибка рендеринга панели:', error);
            ErrorHandler.show('Не удалось загрузить главную панель');
        }
    }

    // Инициализация компонентов
    function initComponents() {
        if (window.HealthUI && window.HealthUI.initDashboardComponents) {
            HealthUI.initDashboardComponents();
        }

        // Добавляем обработчики событий
        setupEventListeners();
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Обработчик для обновления данных
        const refreshBtn = document.querySelector('.refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await DataManager.refreshAllData();
            });
        }
    }

    // Инициализация
    function init() {
        if (isInitialized) return;

        // Регистрируем обработчик вкладки
        TabManager.registerTabHandler('dashboard', load);

        isInitialized = true;
        console.log('✅ DashboardManager инициализирован');
    }

    return {
        init,
        load
    };
})();

if (typeof window !== 'undefined') {
    window.DashboardManager = DashboardManager;
}