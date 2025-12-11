// managers/tab-manager.js
const TabManager = (function() {
    let currentTab = 'dashboard';
    const tabHandlers = new Map();

    // Названия вкладок
    const TAB_TITLES = {
        dashboard: 'Сегодня',
        medications: 'Аптечка',
        diary: 'Дневник',
        stats: 'Статистика'
    };

    // Инициализация вкладок
    function init() {
        initTabButtons();
        loadTabHandlers();

        // Подписываемся на изменения вкладок
        EventManager.on('tab:switch', switchToTab);

        console.log('✅ TabManager инициализирован');
    }

    // Метод для начальной загрузки
    async function loadInitialTab(tabName = 'dashboard') {
        console.log(`🚀 Начальная загрузка вкладки: ${tabName}`);

        currentTab = tabName;
        StateManager.updateState({ currentTab: tabName });
        updateDocumentTitle(tabName);
        updateActiveTabButton(tabName);

        // Загружаем содержимое вкладки
        await loadCurrentTab();

        // Показываем табы
        DomManager.showTabs();

        EventManager.emit('tab:initialLoaded', tabName);
    }

    return {
        init,
        switchToTab,
        loadInitialTab, // <-- Добавить этот метод
        getCurrentTab,
        getTabTitle,
        registerTabHandler,
        loadCurrentTab
    };

    // Инициализация кнопок вкладок
    function initTabButtons() {
        const tabButtons = document.querySelectorAll('.health-tab');

        tabButtons.forEach(tab => {
            tab.removeEventListener('click', handleTabClick);
            tab.addEventListener('click', handleTabClick);
        });

        function handleTabClick() {
            const tabName = this.getAttribute('data-tab');
            switchToTab(tabName);
        }
    }

    // Загрузка обработчиков вкладок
    function loadTabHandlers() {
        tabHandlers.set('dashboard', DashboardManager.load);
        tabHandlers.set('medications', MedicationsManager.load);
        tabHandlers.set('diary', DiaryManager.load);
        tabHandlers.set('stats', StatsManager.load);
    }

    // Переключение вкладки
    async function switchToTab(tabName) {
        if (currentTab === tabName) return;

        console.log(`🔄 Переключение на вкладку: ${tabName}`);

        // Обновляем активную кнопку
        updateActiveTabButton(tabName);

        // Сохраняем текущую вкладку
        currentTab = tabName;
        StateManager.updateState({ currentTab: tabName });

        // Обновляем заголовок
        updateDocumentTitle(tabName);

        // Загружаем содержимое вкладки
        await loadCurrentTab();

        // Показываем табы
        DomManager.showTabs();

        EventManager.emit('tab:switched', tabName);
    }

    // Обновление активной кнопки вкладки
    function updateActiveTabButton(tabName) {
        const tabButtons = document.querySelectorAll('.health-tab');
        tabButtons.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            }
        });
    }

    // Обновление заголовка документа
    function updateDocumentTitle(tabName) {
        const title = TAB_TITLES[tabName] || 'Здоровье';
        document.title = `Здоровье - ${title}`;
    }

    // Загрузка текущей вкладки
    async function loadCurrentTab() {
        const tabName = currentTab;
        const handler = tabHandlers.get(tabName);

        if (!handler) {
            console.error(`❌ Обработчик для вкладки ${tabName} не найден`);
            ErrorHandler.show(`Вкладка "${tabName}" не поддерживается`);
            return;
        }

        // Показываем загрузку
        DomManager.showLoading();
        DomManager.clearContainer();

        try {
            await handler();
            EventManager.emit('tab:loaded', tabName);
        } catch (error) {
            console.error(`❌ Ошибка загрузки вкладки ${tabName}:`, error);
            ErrorHandler.show(`Не удалось загрузить вкладку: ${error.message}`);
        } finally {
            DomManager.hideLoading();
        }
    }

    // Получить текущую вкладку
    function getCurrentTab() {
        return currentTab;
    }

    // Получить название вкладки
    function getTabTitle(tabName) {
        return TAB_TITLES[tabName] || tabName;
    }

    // Регистрация нового обработчика вкладки
    function registerTabHandler(tabName, handler) {
        tabHandlers.set(tabName, handler);
        console.log(`✅ Зарегистрирован обработчик для вкладки: ${tabName}`);
    }

    return {
        init,
        switchToTab,
        getCurrentTab,
        getTabTitle,
        registerTabHandler,
        loadCurrentTab
    };
})();

if (typeof window !== 'undefined') {
    window.TabManager = TabManager;
}