// core/dom-manager.js
const DomManager = (function() {
    let elements = {};

    // Селекторы элементов
    const SELECTORS = {
        container: '#health-container',
        tabs: '#health-tabs',
        tabButtons: '.health-tab',
        modals: '#health-modals',
        loading: '#health-loading'
    };

    // Инициализация DOM элементов
    function init() {
        try {
            // Получаем основные элементы
            elements.container = document.getElementById('health-container');
            elements.tabs = document.getElementById('health-tabs');
            elements.tabButtons = document.querySelectorAll('.health-tab');
            elements.modals = document.getElementById('health-modals');

            // Гарантируем наличие loading элемента
            ensureLoadingElement();

            console.log('✅ DOM элементы инициализированы:', {
                container: !!elements.container,
                loading: !!elements.loading,
                tabs: !!elements.tabs,
                tabButtons: elements.tabButtons?.length || 0,
                modals: !!elements.modals
            });

            return elements;
        } catch (error) {
            console.error('❌ Ошибка инициализации DOM:', error);
            createMinimalElements();
            return elements;
        }
    }

    // Создать элемент загрузки если его нет
    function ensureLoadingElement() {
        elements.loading = document.getElementById('health-loading');

        if (!elements.loading) {
            console.log('⚠️ Элемент health-loading не найден, создаем...');
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'health-loading';
            loadingDiv.className = 'health-loading';
            loadingDiv.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            `;
            loadingDiv.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Загрузка модуля здоровья...</p>
            `;

            document.body.appendChild(loadingDiv);
            elements.loading = loadingDiv;
        }
    }

    // Создать минимальный набор элементов при ошибке
    function createMinimalElements() {
        elements = {
            container: document.getElementById('health-container') || document.body,
            tabs: document.getElementById('health-tabs'),
            tabButtons: [],
            modals: document.getElementById('health-modals')
        };

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'health-loading';
        loadingDiv.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;
        loadingDiv.innerHTML = `
            <div style="width:40px;height:40px;border:4px solid #f3f3f3;
                border-top:4px solid #3498db;border-radius:50%;
                animation:spin 1s linear infinite"></div>
            <p>Загрузка...</p>
        `;
        document.body.appendChild(loadingDiv);
        elements.loading = loadingDiv;
    }

    // Показать/скрыть индикатор загрузки
    function showLoading() {
        if (elements.loading) {
            elements.loading.style.display = 'flex';
        }
    }

    function hideLoading() {
        if (elements.loading) {
            elements.loading.style.display = 'none';
        }
    }

    // Показать/скрыть табы
    function showTabs() {
        if (elements.tabs) {
            // НЕ меняем display, используем visibility или просто ничего не делаем
            // CSS управляет layout через grid
            elements.tabs.style.visibility = 'visible';
        }
    }

    function hideTabs() {
        if (elements.tabs) {
            elements.tabs.style.visibility = 'hidden';
        }
    }

    // Очистить контейнер
    function clearContainer() {
        if (elements.container) {
            const loadingEl = elements.container.querySelector('#health-loading');
            const tabsEl = elements.container.querySelector('#health-tabs');

            elements.container.innerHTML = '';

            if (loadingEl) elements.container.appendChild(loadingEl);
            if (tabsEl) elements.container.appendChild(tabsEl);
        }
    }

    // Вставить HTML в контейнер
    function setContainerHTML(html) {
        if (elements.container) {
            elements.container.innerHTML = html;
            return true;
        }
        return false;
    }

    // Получить элемент по селектору
    function getElement(selector) {
        return elements[selector] || document.querySelector(selector);
    }

    // Получить все элементы
    function getAllElements() {
        return { ...elements };
    }

    // Добавить обработчик события
    function addEventListener(selector, event, handler, useCapture = false) {
        const element = getElement(selector);
        if (element) {
            element.addEventListener(event, handler, useCapture);
            return () => element.removeEventListener(event, handler, useCapture);
        }
        return null;
    }

    return {
        init,
        showLoading,
        hideLoading,
        showTabs,
        hideTabs,
        clearContainer,
        setContainerHTML,
        getElement,
        getAllElements,
        addEventListener
    };
})();

if (typeof window !== 'undefined') {
    window.DomManager = DomManager;
}
