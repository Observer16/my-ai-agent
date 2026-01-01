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
            const monthNames = typeof getMonthName === 'function' ? 
                Array.from({length: 12}, (_, i) => getMonthName(i)) :
                ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
            
            const periodEl = document.getElementById('period-display');
            if (periodEl) {
                periodEl.textContent = `${monthNames[currentMonth - 1]} ${currentYear}`;
            }

            // Общая сумма
            const totalSpentEl = document.getElementById('total-spent');
            if (totalSpentEl) {
                totalSpentEl.textContent = formatMoney(stats.summary.total_spent);
            }

            // Средний чек
            const avgPurchaseEl = document.getElementById('avg-purchase');
            if (avgPurchaseEl) {
                avgPurchaseEl.textContent = formatMoney(stats.summary.avg_purchase);
            }

            // Покупки
            const purchasesEl = document.getElementById('total-purchases');
            if (purchasesEl) {
                purchasesEl.textContent = stats.summary.total_purchases;
            }

            // Магазины
            const storesEl = document.getElementById('unique-stores');
            if (storesEl) {
                storesEl.textContent = stats.summary.unique_stores;
            }

            // Позиции
            const itemsEl = document.getElementById('total-items');
            if (itemsEl) {
                itemsEl.textContent = stats.summary.total_items || 0;
            }

            // Уникальные товары
            const productsEl = document.getElementById('unique-products');
            if (productsEl) {
                productsEl.textContent = stats.summary.unique_products || 0;
            }

            // График по дням
            renderDailyChart(stats.daily_spending || [], stats.summary.total_spent);

            // Топ категорий
            renderTopCategories(stats.top_categories || [], stats.summary.total_spent);

            // Топ магазинов
            renderTopStores(stats.top_stores || [], stats.summary.total_spent);

            // Крупнейшие покупки
            renderTopPurchases(stats.top_purchases || []);

            // Статистика по дням недели
            renderWeekdayStats(stats.weekday_stats || []);

        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            showError('Ошибка загрузки данных');
        }
    }

    function renderDailyChart(dailyData, totalSpent) {
        const container = document.getElementById('daily-chart');
        if (!container) return;

        if (!dailyData || dailyData.length === 0) {
            container.innerHTML = '<div class="empty">Нет данных за этот период</div>';
            return;
        }

        // Сортируем по дате
        dailyData.sort((a, b) => new Date(a.purchase_day) - new Date(b.purchase_day));

        // Берем последние 14 дней или все, если меньше
        const daysToShow = dailyData.slice(-14);
        const maxAmount = Math.max(...daysToShow.map(d => d.day_spent), 1);

        const html = daysToShow.map(day => {
            const [year, month, dayOfMonth] = day.purchase_day.split('-').map(Number);
            const date = new Date(Date.UTC(year, month - 1, dayOfMonth));

            const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн',
                               'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
            const dateStr = `${dayOfMonth} ${monthNames[month - 1]}`;

            const percent = (day.day_spent / maxAmount) * 100;

            return `
                <div class="day-row">
                    <div class="day-date">${dateStr}</div>
                    <div class="day-bar">
                        <div class="day-bar-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="day-amount">${formatMoney(day.day_spent)}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
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

    function renderTopPurchases(purchases) {
        const container = document.getElementById('purchases-list');
        if (!container) return;

        if (!purchases || purchases.length === 0) {
            container.innerHTML = '<div class="empty">Нет данных о покупках</div>';
            return;
        }

        const html = purchases.map(purchase => {
            const date = new Date(purchase.purchase_date);
            const dateStr = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="purchase-card">
                    <div class="card-header">
                        <div class="card-name">${purchase.store_name}</div>
                        <div class="card-amount">${formatMoney(purchase.total_amount)}</div>
                    </div>
                    <div class="card-details">
                        <div class="purchase-info">
                            <span class="purchase-date">${dateStr}</span>
                            <span class="purchase-items">${purchase.items_count} товаров</span>
                        </div>
                        <div class="purchase-invoice">Чек: ${purchase.invoice_number}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    function renderWeekdayStats(weekdayStats) {
        const container = document.getElementById('weekday-stats');
        if (!container) return;

        if (!weekdayStats || weekdayStats.length === 0) {
            container.innerHTML = '<div class="empty">Нет данных по дням недели</div>';
            return;
        }

        const sortedStats = [...weekdayStats].sort((a, b) => a.day_of_week - b.day_of_week);

        const html = sortedStats.map(day => {
            return `
                <div class="weekday-card">
                    <div class="weekday-header">
                        <div class="weekday-name">${day.day_name}</div>
                        <div class="weekday-amount">${formatMoney(day.day_spent)}</div>
                    </div>
                    <div class="weekday-details">
                        <div class="weekday-info">
                            <span>${day.purchases_count} покупок</span>
                            <span>Средний чек: ${formatMoney(day.avg_spent)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    async function previousMonth() {
        currentMonth--;
        if (currentMonth < 1) {
            currentMonth = 12;
            currentYear--;
        }
        await loadMonthlyData();
        tg.HapticFeedback.impactOccurred('light');
    }

    async function nextMonth() {
        const now = new Date();
        const currentYearNow = now.getFullYear();
        const currentMonthNow = now.getMonth() + 1;

        // Не даем переходить в будущее
        if (currentYear === currentYearNow && currentMonth === currentMonthNow) {
            return;
        }

        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
        await loadMonthlyData();
        tg.HapticFeedback.impactOccurred('light');
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
