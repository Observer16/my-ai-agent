// js/product-search.js - Логика страницы поиска товара

const tg = window.Telegram.WebApp;
tg.expand();
tg.BackButton.show();

// Обработчик кнопки "Назад"
tg.BackButton.onClick(() => {
    // Если открыто модальное окно - закрываем его
    const card = document.getElementById('product-detail-card');
    if (card && card.style.display !== 'none') {
        closeDetailCard();
    } else {
        // Иначе возвращаемся на предыдущую страницу
        window.history.back();
    }
});

// Глобальные переменные
let barcodeScanner = null;
let searchTimeout = null;
let currentProductId = null;

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function init() {
    await initCurrency();

    // Инициализация сканера штрих-кода
    barcodeScanner = new BarcodeScanner({
        onScan: handleBarcodeScanned,
        onClose: () => console.log('Сканер закрыт'),
        onError: (error) => console.error('Ошибка сканера:', error)
    });

    // Обработчики событий
    document.getElementById('search-input').addEventListener('input', handleSearchInput);
    document.getElementById('scan-barcode-btn').addEventListener('click', openBarcodeScanner);

    tg.HapticFeedback.notificationOccurred('success');
}

// ==================== ПОИСК ====================
function handleSearchInput(e) {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);

    if (query.length < 2) {
        clearSearchResults();
        return;
    }

    searchTimeout = setTimeout(() => {
        // Определяем тип поиска: штрих-код (только цифры) или название
        const isBarcode = /^\d+$/.test(query);

        if (isBarcode && query.length >= 8) {
            searchByBarcode(query);
        } else {
            searchByName(query);
        }
    }, 300);
}

async function searchByName(query) {
    try {
        showLoading();
        const products = await API.searchProduct(query);
        renderSearchResults(products);
    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    }
}

async function searchByBarcode(barcode) {
    try {
        showLoading();
        const product = await API.getProductByBarcode(barcode);
        renderSearchResults([product]);
    } catch (error) {
        showError('Товар со штрих-кодом не найден');
    }
}

// ==================== СКАНЕР ====================
function openBarcodeScanner() {
    tg.HapticFeedback.impactOccurred('medium');
    barcodeScanner.open();
}

function handleBarcodeScanned(barcode) {
    console.log('Отсканирован штрих-код:', barcode);
    document.getElementById('search-input').value = barcode;
    searchByBarcode(barcode);
}

// ==================== ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ ====================
function renderSearchResults(products) {
    const container = document.getElementById('search-results');

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <div class="empty-text" data-i18n="productSearch.notFound">Товары не найдены</div>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(p => {
        const escapedName = escapeHtml(p.name);
        const escapedCategory = escapeHtml(p.category_name || 'Без категории');
        const escapedBarcode = p.barcode ? escapeHtml(p.barcode) : '';

        return `
            <div class="search-result-item" onclick="loadProductDetails('${p.id}')">
                <div class="product-info">
                    <div class="product-name">${escapedName}</div>
                    <div class="product-meta">
                        <span class="product-category">${escapedCategory}</span>
                        ${escapedBarcode ? `<span class="product-barcode">📊 ${escapedBarcode}</span>` : ''}
                    </div>
                </div>
                <div class="product-price">
                    ${p.avg_price ? `${Math.round(p.avg_price).toLocaleString('ru-RU')} ${getCurrencySymbol()}` : '-'}
                </div>
            </div>
        `;
    }).join('');

    tg.HapticFeedback.impactOccurred('light');
}

// ==================== ДЕТАЛЬНАЯ КАРТОЧКА ====================
async function loadProductDetails(productId) {
    try {
        currentProductId = productId;
        showDetailLoading();

        // Используем существующий эндпоинт GET /products/{id}
        const details = await API.getProduct(productId);

        renderProductDetailCard(details);
        tg.HapticFeedback.impactOccurred('medium');
    } catch (error) {
        showError('Ошибка загрузки информации о товаре: ' + error.message);
    }
}

function renderProductDetailCard(details) {
    const { product, price_stats, purchase_history } = details;
    const card = document.getElementById('product-detail-card');

    card.innerHTML = `
        <div class="detail-content">
            <div class="detail-header">
                <button class="close-detail-btn" id="close-detail-btn">✕</button>
                <h2 class="detail-title">${escapeHtml(product.name)}</h2>
                ${product.category_name ? `<div class="detail-category">${escapeHtml(product.category_name)}</div>` : ''}
            </div>

            <div class="detail-section">
                <div class="detail-label" data-i18n="productSearch.basicInfo">Основная информация</div>
                ${product.brand ? `<div class="detail-row"><span data-i18n="productSearch.brand">Бренд:</span> <strong>${escapeHtml(product.brand)}</strong></div>` : ''}
                ${product.barcode ? `<div class="detail-row"><span data-i18n="productSearch.barcode">Штрих-код:</span> <strong>${escapeHtml(product.barcode)}</strong></div>` : ''}
                <div class="detail-row"><span data-i18n="productSearch.unit">Единица:</span> <strong>${getUnitName(product.unit)}</strong></div>
            </div>

            ${renderPriceStats(price_stats)}
            ${renderPurchaseHistory(purchase_history)}
        </div>
    `;

    card.style.display = 'block';

    // Добавляем обработчик для кнопки закрытия
    // Используем небольшую задержку, чтобы DOM успел обновиться
    setTimeout(() => {
        const closeBtn = document.getElementById('close-detail-btn');
        if (closeBtn) {
            console.log('✅ Кнопка закрытия найдена, привязываем обработчик');
            closeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔘 Клик по кнопке закрытия');
                closeDetailCard();
            };
        } else {
            console.error('❌ Кнопка закрытия не найдена!');
        }
    }, 0);
}

function renderPriceStats(stats) {
    if (!stats || !stats.min_price) {
        return `<div class="detail-section">
            <div class="detail-label" data-i18n="productSearch.priceInfo">Информация о ценах</div>
            <div class="no-data" data-i18n="productSearch.noPriceData">Нет данных о ценах</div>
        </div>`;
    }

    const currency = getCurrencySymbol();

    return `
        <div class="detail-section">
            <div class="detail-label" data-i18n="productSearch.priceInfo">Информация о ценах</div>
            <div class="price-stats-grid">
                <div class="price-stat-card">
                    <div class="price-stat-label" data-i18n="productSearch.minPrice">Мин. цена</div>
                    <div class="price-stat-value">${Math.round(stats.min_price).toLocaleString('ru-RU')} ${currency}</div>
                </div>
                <div class="price-stat-card">
                    <div class="price-stat-label" data-i18n="productSearch.maxPrice">Макс. цена</div>
                    <div class="price-stat-value">${Math.round(stats.max_price).toLocaleString('ru-RU')} ${currency}</div>
                </div>
                ${stats.last_price ? `
                <div class="price-stat-card highlight">
                    <div class="price-stat-label" data-i18n="productSearch.lastPrice">Последняя цена</div>
                    <div class="price-stat-value">${Math.round(stats.last_price).toLocaleString('ru-RU')} ${currency}</div>
                </div>
                ` : ''}
            </div>
            ${stats.last_purchase_date ? `
                <div class="detail-row">
                    <span data-i18n="productSearch.lastPurchase">Последняя покупка:</span>
                    <strong>${formatDate(stats.last_purchase_date)}</strong>
                </div>
            ` : ''}
            ${stats.purchases_count ? `
                <div class="detail-row">
                    <span data-i18n="productSearch.purchasesCount">Количество покупок:</span>
                    <strong>${stats.purchases_count}</strong>
                </div>
            ` : ''}
        </div>
    `;
}

function renderPurchaseHistory(history) {
    if (!history || history.length === 0) {
        return '';
    }

    return `
        <div class="detail-section">
            <div class="detail-label" data-i18n="productSearch.purchaseHistory">История покупок</div>
            <div class="purchase-history-list">
                ${history.slice(0, 10).map(h => `
                    <div class="purchase-history-item">
                        <div class="purchase-store">${escapeHtml(h.store_name)}</div>
                        <div class="purchase-details">
                            <span class="purchase-price">${Math.round(h.price).toLocaleString('ru-RU')} ${getCurrencySymbol()}</span>
                            <span class="purchase-date">${formatDate(h.purchase_date)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function closeDetailCard() {
    console.log('🚪 Закрытие модального окна');
    const card = document.getElementById('product-detail-card');
    if (card) {
        card.style.display = 'none';
        currentProductId = null;
        tg.HapticFeedback.impactOccurred('light');
        console.log('✅ Модальное окно закрыто');
    } else {
        console.error('❌ Элемент product-detail-card не найден!');
    }
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getUnitName(unit) {
    const units = {
        'unidad': 'шт',
        'kg': 'кг',
        'g': 'г',
        'l': 'л',
        'ml': 'мл'
    };
    return units[unit] || unit;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showLoading() {
    document.getElementById('search-results').innerHTML = '<div class="loading">Поиск...</div>';
}

function showDetailLoading() {
    const card = document.getElementById('product-detail-card');
    card.innerHTML = '<div class="loading">Загрузка...</div>';
    card.style.display = 'block';
}

function showError(message) {
    document.getElementById('search-results').innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

function clearSearchResults() {
    document.getElementById('search-results').innerHTML = '';
}

// Инициализация при загрузке
init();
