/**
 * Основная логика страницы бюджета
 */

const tg = window.Telegram.WebApp;
let currentDays = 7;
let trendsData = [];
let compareData = [];

/**
 * Инициализация приложения
 */
async function init() {
    tg.expand();
    tg.BackButton.show();
    tg.BackButton.onClick(() => window.location.href = '../index.html');

    await initCurrency();

    // Инициализируем баннер, если он доступен
    if (window.monthlyBanner) {
        await window.monthlyBanner.init();
    }

    try {
        await loadOverview();
        tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error('Init error:', error);
    }

    setupMainButton();
}

/**
 * Настройка главной кнопки Telegram
 */
function setupMainButton() {
    tg.MainButton.setText('🔄 ' + t('budget.refresh'));
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
        if (typeof API !== 'undefined' && API.clearCache) {
            API.clearCache();
        }
        init();
        tg.HapticFeedback.impactOccurred('medium');
    });
}

/**
 * Загрузка обзора
 */
async function loadOverview() {
    try {
        const stats = await API.getStatistics();
        updateOverviewStats(stats);
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

/**
 * Обновление статистики обзора
 */
function updateOverviewStats(stats) {
    document.getElementById('total').textContent = formatMoney(stats.total_spent);
    document.getElementById('purchases').textContent = stats.total_purchases;
    document.getElementById('products').textContent = stats.unique_products;
    document.getElementById('stores').textContent = stats.unique_stores;
}

/**
 * Загрузка трендов
 */
async function loadTrends(days = 7, search = null) {
    showLoading('trends-list');
    try {
        trendsData = await API.getPriceTrends(days, search, 50);
        renderTrends(trendsData, 'trends-list');
    } catch (error) {
        showError('trends-list', error.message);
    }
}

/**
 * Загрузка сравнения
 */
async function loadCompare(search = null) {
    showLoading('compare-list');
    try {
        compareData = await API.comparePrices(search, 50);
        renderCompare(compareData);
    } catch (error) {
        console.error('Ошибка загрузки сравнения:', error);

        let errorMessage = t('budget.error');
        if (error.message.includes('403') || error.message.includes('Доступ запрещен')) {
            errorMessage = '🔒 ' + t('budget.accessDenied');
        } else if (error.message.includes('401') || error.message.includes('авторизац')) {
            errorMessage = '🔑 ' + t('budget.authRequired');
        } else if (error.message) {
            errorMessage = `${t('common.error')}: ${error.message}`;
        }

        showError('compare-list', errorMessage);
    }
}

/**
 * Отображение трендов
 */
function renderTrends(trends, containerId) {
    const container = document.getElementById(containerId);

    if (!trends?.length) {
        container.innerHTML = `<div class="empty">📊 ${t('budget.noTrendsData')}</div>`;
        return;
    }

    const html = trends.map(t_item => `
        <div class="card ${t_item.trend_direction}">
            <div class="product-name">${t_item.product_name}</div>
            <div class="store">🏪 ${t_item.store_name}</div>
            <div class="prices">
                <span class="price-current">${t_item.current_price.toFixed(0)} ${getCurrencySymbol()}</span>
                ${t_item.previous_price ? `
                    <span class="price-old">${t_item.previous_price.toFixed(0)} ${getCurrencySymbol()}</span>
                    <span class="price-change ${t_item.trend_direction}">
                        ${t_item.trend_direction === 'up' ? '📈' : '📉'}
                        ${Math.abs(t_item.percent_change || 0).toFixed(1)}%
                    </span>
                ` : `<span>🆕 ${t('budget.newProduct')}</span>`}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Форматирование цены
 */
function formatPrice(price) {
    if (!price && price !== 0) return `0 ${getCurrencySymbol()}`;

    const num = typeof price === 'object' && price.toString ?
                parseFloat(price.toString()) :
                Number(price);

    if (isNaN(num)) return `0 ${getCurrencySymbol()}`;

    const language = getCurrentLanguage();

    if (Number.isInteger(num)) {
        return num.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US') + ' ' + getCurrencySymbol();
    }

    return num.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' ' + getCurrencySymbol();
}

/**
 * Отображение сравнения
 */
function renderCompare(data) {
    const container = document.getElementById('compare-list');

    if (!data?.length) {
        container.innerHTML = `
            <div class="empty">
                <div style="font-size: 48px; margin-bottom: 10px;">🏪</div>
                <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">
                    ${t('budget.noCompareData')}
                </div>
                <div style="font-size: 13px; opacity: 0.7; line-height: 1.5;">
                    ${t('budget.compareDescription')}
                </div>
            </div>
        `;
        return;
    }

    const html = data.map(c => `
        <div class="comparison-card">
            <div class="comparison-header">🛒 ${c.product_name}</div>
            ${c.stores.map(s => `
                <div class="store-price ${s.store_name === c.cheapest_store ? 'best' : ''}">
                    <span>
                        ${s.store_name === c.cheapest_store ? '🏆' : '🏪'}
                        ${s.store_name}
                    </span>
                    <strong>${formatPrice(s.price)}</strong>
                </div>
            `).join('')}
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Переключение вкладок
 */
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t_el => t_el.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');

    if (tab === 'trends' && !trendsData.length) {
        loadTrends(currentDays);
    } else if (tab === 'compare') {
        loadCompare();
    }

    tg.HapticFeedback.impactOccurred('light');
}

/**
 * Фильтрация трендов
 */
function filterTrends(days) {
    currentDays = days;

    document.querySelectorAll('.filters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    loadTrends(days);
    tg.HapticFeedback.impactOccurred('light');
}

/**
 * Поиск по трендам
 */
let searchTrendsTimeout;
function searchTrends(query) {
    clearTimeout(searchTrendsTimeout);
    searchTrendsTimeout = setTimeout(() => {
        loadTrends(currentDays, query || null);
    }, 500);
}

/**
 * Поиск по сравнению
 */
let searchCompareTimeout;
function searchCompare(query) {
    clearTimeout(searchCompareTimeout);
    searchCompareTimeout = setTimeout(() => {
        loadCompare(query || null);
    }, 500);
}

/**
 * Форматирование денежной суммы
 */
function formatMoney(amount) {
    if (!amount && amount !== 0) return `0 ${getCurrencySymbol()}`;

    const numAmount = Number(amount);
    if (isNaN(numAmount)) return `0 ${getCurrencySymbol()}`;

    if (numAmount === 0) return `0 ${getCurrencySymbol()}`;

    const absAmount = Math.abs(numAmount);
    const language = getCurrentLanguage();

    if (absAmount >= 1000000) {
        const millions = (numAmount / 1000000).toFixed(1);
        return `${millions}M ${getCurrencySymbol()}`;
    }
    else if (absAmount >= 1000) {
        const thousands = (numAmount / 1000).toFixed(1);
        return `${thousands}K ${getCurrencySymbol()}`;
    }
    else {
        if (Number.isInteger(numAmount)) {
            return `${numAmount.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')} ${getCurrencySymbol()}`;
        } else {
            return `${numAmount.toFixed(2).replace('.', ',')} ${getCurrencySymbol()}`;
        }
    }
}

/**
 * Показать индикатор загрузки
 */
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div style="text-align:center; padding:40px;">
            <div style="font-size:48px; animation: spin 1s linear infinite;">⏳</div>
            <div style="margin-top:10px; opacity:0.7;">${t('budget.loading')}</div>
        </div>
    `;
}

/**
 * Показать ошибку
 */
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="empty">
            <div style="font-size:48px; margin-bottom:10px;">⚠️</div>
            <div>${message}</div>
        </div>
    `;
}

/**
 * Получить название месяца
 */
function getMonthName(monthIndex) {
    const language = getCurrentLanguage();
    const months = {
        ru: [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ],
        en: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ],
        es: [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ],
        uk: [
            'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
            'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
        ]
    };

    return months[language]?.[monthIndex] || months.ru[monthIndex];
}