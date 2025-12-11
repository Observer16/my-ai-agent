// tabs/medications-manager.js
const MedicationsManager = (function() {
    let isInitialized = false;

    // Загрузить аптечку
    async function load() {
        console.log('💊 Загрузка аптечки...');

        // Загружаем данные
        await DataManager.loadAllMedications();

        // Рендерим контент
        await render();

        // Инициализируем компоненты
        initComponents();

        EventManager.emit('medications:loaded');
    }

    // Рендеринг
    async function render() {
        try {
            const html = await ComponentLoader.load('health-medications.html');
            DomManager.setContainerHTML(html);
        } catch (error) {
            console.error('❌ Ошибка рендеринга аптечки:', error);
            ErrorHandler.show('Не удалось загрузить аптечку');
        }
    }

    // Инициализация компонентов
    function initComponents() {
        if (window.HealthUI && window.HealthUI.initMedicationsComponents) {
            HealthUI.initMedicationsComponents();
        }
    }

    // Инициализация
    function init() {
        if (isInitialized) return;

        // Регистрируем обработчик вкладки
        TabManager.registerTabHandler('medications', load);

        isInitialized = true;
        console.log('✅ MedicationsManager инициализирован');
    }

    return {
        init,
        load
    };
})();

if (typeof window !== 'undefined') {
    window.MedicationsManager = MedicationsManager;
}