    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.BackButton.show();
    tg.BackButton.onClick(() => window.history.back());

    let currentYear, currentMonth;

    async function init() {
        // Инициализация валюты
        await initCurrency();
        
        const now = new Date();
        currentYear = now.getFullYear();
        currentMonth = now.getMonth() + 1;

        await loadMonthlyData();
        tg.HapticFeedback.notificationOccurred('success');
    }

    async function loadMonthlyData() {
        try {
            const stats = await API.getMonthlyStatistics(currentYear, currentMonth);

            if (!stats) {
                showError('Нет данных за этот период');
                return;
            }

            // Отображаем период
            const monthNames = getMonthName ? 
                Array.from({length: 12}, (_, i) => getMonthName(i)) :
                ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
            
            const periodEl = document.getElementById('period');
            if (periodEl) {
                periodEl.textContent = `${monthNames[currentMonth - 1]} ${currentYear}`;
            }

            // Общая сумма
            const totalAmountEl = document.getElementById('total-amount');
            if (totalAmountEl) {
                totalAmountEl.textContent = formatMoney(stats.summary.total_spent);
            }

            // Покупки
            const purchasesEl = document.getElementById('total-purchases');
            if (purchasesEl) {
                purchasesEl.textContent = stats.summary.total_purchases;
            }

            // Магазины
            const storesEl = document.getElementById('total-stores');
            if (storesEl) {
                storesEl.textContent = stats.summary.unique_stores;
            }

            // Топ категорий
            renderTopCategories(stats.top_categories || [], stats.summary.total_spent);

            // Топ магазинов
            renderTopStores(stats.top_stores || [], stats.summary.total_spent);

        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            showError('Ошибка загрузки данных');
        }
    }

    function renderTopCategories(categories, totalSpent) {
        const container = document.getElementById('categories-list');
        if (!container) return;

        if (!categories || categories.length === 0) {
            container.innerHTML = '<div class="empty">Нет данных о категориях</div>';
            return;
        }

        const html = categories.map(cat => {
            const percent = totalSpent > 0 ? (cat.category_spent / totalSpent) * 100 : 0;

            return `
                <div class="category-card">
                    <div class="card-header">
                        <div class="card-name">${cat.category_name}</div>
                        <div class="card-amount">${formatMoney(cat.category_spent)}</div>
                    </div>
                    <div class="card-bar">
                        <div class="card-bar-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="card-details">
                        ${cat.items_count} позиций • ${percent.toFixed(1)}% от общей суммы
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    function renderTopStores(stores, totalSpent) {
        const container = document.getElementById('stores-list');
        if (!container) return;

        if (!stores || stores.length === 0) {
            container.innerHTML = '<div class="empty">Нет данных о магазинах</div>';
            return;
        }

        const html = stores.map(store => {
            const percent = totalSpent > 0 ? (store.store_spent / totalSpent) * 100 : 0;

            return `
                <div class="store-card">
                    <div class="card-header">
                        <div class="card-name">🏪 ${store.store_name}</div>
                        <div class="card-amount">${formatMoney(store.store_spent)}</div>
                    </div>
                    <div class="card-bar">
                        <div class="card-bar-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="card-details">
                        ${store.visits_count} визитов • ${percent.toFixed(1)}% от общей суммы
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    function formatMoney(amount) {
        if (!amount || amount === 0) return `0 ${getCurrencySymbol()}`;

        const rounded = Math.round(amount);

        // Всегда показываем в тысячах для сумм >= 1000
        if (rounded >= 1000) {
            const thousands = Math.round(rounded / 1000);
            return `${thousands.toLocaleString('ru-RU')}K ${getCurrencySymbol()}`;
        }
        // Для сумм < 1 000
        else {
            return `${rounded.toLocaleString('ru-RU')} ${getCurrencySymbol()}`;
        }
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = `❌ ${message}`;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ffebee;
            color: #c62828;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(errorDiv);

        // Автоматически удаляем через 5 секунд
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Инициализация при загрузке
    document.addEventListener('DOMContentLoaded', init);
