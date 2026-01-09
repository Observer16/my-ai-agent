/**
 * Компонент отображения последних чеков
 * js/components/recent-receipts.js
 */

class RecentReceipts {
    constructor(containerId) {
        this.containerId = containerId;
        this.tg = window.Telegram?.WebApp;
        this.receipts = [];
    }

    /**
     * Инициализирует компонент
     */
    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Контейнер ${this.containerId} не найден`);
            return;
        }

        // Создаем HTML структуру
        container.innerHTML = this.getTemplate();

        // Загружаем данные
        await this.loadReceipts();
    }

    /**
     * Возвращает HTML шаблон
     */
    getTemplate() {
        return `
            <div class="recent-receipts-container">
                <h3 class="recent-receipts-title">
                    <span data-i18n="budget.recentReceipts">Последние чеки</span>
                </h3>
                <div id="recent-receipts-list" class="recent-receipts-list"></div>
            </div>
        `;
    }

    /**
     * Загружает список чеков
     */
    async loadReceipts(limit = 5) {
        try {
            this.receipts = await API.getRecentPurchases(limit);
            this.render();
        } catch (error) {
            console.error('Ошибка загрузки чеков:', error);
            this.hideContainer();
        }
    }

    /**
     * Отображает список чеков
     */
    render() {
        const list = document.getElementById('recent-receipts-list');
        if (!list || !this.receipts || this.receipts.length === 0) {
            this.hideContainer();
            return;
        }

        list.innerHTML = '';

        this.receipts.forEach(receipt => {
            const item = this.createReceiptItem(receipt);
            list.appendChild(item);
        });

        this.attachEventListeners();
    }

    /**
     * Создаёт элемент чека
     */
    createReceiptItem(receipt) {
        const item = document.createElement('div');
        item.className = 'recent-receipt-item';
        item.dataset.purchaseId = receipt.id;

        item.innerHTML = `
            <div class="recent-receipt-header">
                <div class="recent-receipt-store">
                    <span class="store-icon">🏪</span>
                    <span class="store-name">${this.escapeHtml(receipt.store_name)}</span>
                </div>
                <span class="recent-receipt-date">${this.formatShortDate(receipt.purchase_date)}</span>
            </div>
            <div class="recent-receipt-footer">
                <span class="recent-receipt-items">📦 ${receipt.items_count} ${this.getItemsText(receipt.items_count)}</span>
                <span class="recent-receipt-amount">${this.formatMoney(receipt.total_amount)}</span>
            </div>
        `;

        return item;
    }

    /**
     * Прикрепляет обработчики событий
     */
    attachEventListeners() {
        const items = document.querySelectorAll('.recent-receipt-item');

        items.forEach(item => {
            item.onclick = () => this.handleReceiptClick(item.dataset.purchaseId);
        });
    }

    /**
     * Обработка клика на чек
     */
    handleReceiptClick(purchaseId) {
        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('medium');
        }

        if (window.receiptModal) {
            window.receiptModal.open(purchaseId);
        }
    }

    /**
     * Скрывает контейнер
     */
    hideContainer() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * Обновляет список чеков
     */
    async refresh() {
        await this.loadReceipts();
    }

    /**
     * Форматирует дату в короткий формат
     */
    formatShortDate(dateString) {
        if (!dateString) return '-';

        const date = new Date(dateString);
        const now = new Date();
        const language = getCurrentLanguage ? getCurrentLanguage() : 'ru';

        // Если сегодня
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) {
            const time = date.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            return language === 'ru' ? `Сегодня ${time}` : `Today ${time}`;
        }

        // Если вчера
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();
        if (isYesterday) {
            return language === 'ru' ? 'Вчера' : 'Yesterday';
        }

        // Иначе показываем дату
        return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
            day: 'numeric',
            month: 'short'
        });
    }

    /**
     * Форматирует денежную сумму
     */
    formatMoney(amount) {
        if (!amount && amount !== 0) return `0 ${getCurrencySymbol()}`;

        const numAmount = Number(amount);
        if (isNaN(numAmount)) return `0 ${getCurrencySymbol()}`;

        const language = getCurrentLanguage ? getCurrentLanguage() : 'ru';
        const formatted = numAmount.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

        return `${formatted} ${getCurrencySymbol()}`;
    }

    /**
     * Возвращает правильную форму слова "товар"
     */
    getItemsText(count) {
        const language = getCurrentLanguage ? getCurrentLanguage() : 'ru';

        if (language === 'ru') {
            const cases = ['товар', 'товара', 'товаров'];
            const titles = [2, 0, 1, 1, 1, 2];
            return cases[(count % 100 > 4 && count % 100 < 20) ? 2 : titles[(count % 10 < 5) ? count % 10 : 5]];
        }

        return count === 1 ? 'item' : 'items';
    }

    /**
     * Экранирует HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Создаём глобальный экземпляр
window.recentReceipts = new RecentReceipts('recent-receipts-container');

console.log('✅ Компонент RecentReceipts загружен');