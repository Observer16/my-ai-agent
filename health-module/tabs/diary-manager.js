// tabs/diary-manager.js
const DiaryManager = (function() {
    let isInitialized = false;

    // Загрузить дневник
    async function load() {
        console.log('📔 Загрузка дневника...');

        // Рендерим контент
        await render();

        // Инициализируем компоненты
        initComponents();

        EventManager.emit('diary:loaded');
    }

    // Рендеринг
    async function render() {
        try {
            const html = await ComponentLoader.load('health-diary.html');
            DomManager.setContainerHTML(html);
        } catch (error) {
            console.error('❌ Ошибка рендеринга дневника:', error);
            ErrorHandler.show('Не удалось загрузить дневник');
        }
    }

    // Инициализация компонентов
    function initComponents() {
        if (window.HealthUI && window.HealthUI.initDiaryComponents) {
            HealthUI.initDiaryComponents();
        }
    }

    // Инициализация
    function init() {
        if (isInitialized) return;

        // Регистрируем обработчик вкладки
        TabManager.registerTabHandler('diary', load);

        isInitialized = true;
        console.log('✅ DiaryManager инициализирован');
    }

    return {
        init,
        load
    };
})();

if (typeof window !== 'undefined') {
    window.DiaryManager = DiaryManager;
}