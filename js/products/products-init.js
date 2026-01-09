// js/products/products-init.js - Инициализация и загрузка данных

// Глобальные переменные
const tg = window.Telegram.WebApp;
let allProducts = [];
let allCategories = [];
let allStores = [];
let currentCategoryFilter = null;
let currentProductEdit = null;
let currentCategoryEdit = null;
let currentStoreEdit = null;
let searchTimeout = null;
let currentTab = 'products';

// Инициализация приложения
async function init() {
    await initCurrency();

    tg.expand();

    // Инициализируем компонент кнопки "Назад"
    if (window.BackButton && typeof window.BackButton.init === 'function') {
        // Определяем fallback URL
        let fallbackUrl = 'finance.html'; // Возвращаем на finance.html

        // Пытаемся определить откуда пришли
        if (document.referrer) {
            try {
                const referrer = new URL(document.referrer);
                const current = new URL(window.location.href);

                // Если пришли не с той же страницы, используем referrer как fallback
                if (referrer.pathname !== current.pathname) {
                    fallbackUrl = document.referrer;
                }
            } catch (e) {
                console.log('🔙 Не удалось разобрать referrer:', e);
            }
        }

        window.BackButton.setFallbackUrl(fallbackUrl).init();
        console.log('🔙 Компонент BackButton инициализирован на странице products');
    } else {
        // Fallback: используем стандартную кнопку Telegram если доступна
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'finance.html'; // Возвращаем на finance.html
            }
        });
    }

    loadData();
    updateButtonsVisibility();
}

// Загрузка всех данных
async function loadData() {
    try {
        await Promise.all([
            loadStatistics(),
            loadCategories(),
            loadStores()
        ]);
        await loadProducts();
        tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        tg.showAlert(`${t('common.error')}: ${error.message}`);
    }
}

// Загрузка статистики
async function loadStatistics() {
    try {
        const stats = await API.getStatistics();
        document.getElementById('total-products').textContent = stats.unique_products || 0;
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        document.getElementById('total-products').textContent = '-';
    }
}

// Загрузка категорий
async function loadCategories() {
    try {
        allCategories = await API.getCategories();
        updateCategoryStatistics();
        renderCategoryFilters();
        renderCategoriesList();
        populateCategorySelects();
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
    }
}

// Загрузка магазинов
async function loadStores() {
    try {
        allStores = await API.getStores();
        populateStoreSelect();
        renderStoresList();
    } catch (error) {
        console.error('Ошибка загрузки магазинов:', error);
    }
}

// Загрузка товаров
async function loadProducts(categoryId = null, search = null) {
    showLoading('products-list');
    try {
        allProducts = await API.getProducts(categoryId, search, 50);
        renderProducts(allProducts);
        updateUncategorizedCount();
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showError('products-list', error.message);
    }
}

// Обновление статистики категорий
function updateCategoryStatistics() {
    document.getElementById('total-categories').textContent = allCategories.length;

    if (allProducts.length > 0) {
        const uncategorizedCount = allProducts.filter(p => !p.category_id).length;
        document.getElementById('uncategorized').textContent = uncategorizedCount;
    }
}

// Обновление счетчика товаров без категории
function updateUncategorizedCount() {
    const uncategorizedCount = allProducts.filter(p => !p.category_id).length;
    document.getElementById('uncategorized').textContent = uncategorizedCount;
}

// Обновление видимости кнопок в зависимости от активного таба
function updateButtonsVisibility() {
    const btnCreateCategory = document.getElementById('btn-create-category');
    const btnEditStore = document.getElementById('btn-edit-store');

    btnCreateCategory.style.display = 'none';
    btnEditStore.style.display = 'none';

    if (currentTab === 'categories') {
        btnCreateCategory.style.display = 'block';
    } else if (currentTab === 'stores') {
        btnEditStore.style.display = 'block';
    }
}

// Фильтр по категории
function filterByCategory(categoryId) {
    currentCategoryFilter = categoryId;
    loadProducts(categoryId);
    renderCategoryFilters();
    tg.HapticFeedback.impactOccurred('light');
}

// Поиск товаров
function searchProducts(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadProducts(currentCategoryFilter, query || null);
    }, 500);
}

// Переключение табов
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const clickedTab = event.target;

    tabs.forEach(t => t.classList.remove('active'));
    clickedTab.classList.add('active');

    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    currentTab = tab;
    updateButtonsVisibility();

    tg.HapticFeedback.impactOccurred('light');
}

console.log('✅ products-init.js загружен');