/**
 * Компонент модального окна для отображения деталей чека
 * Используется на странице finance.html для просмотра содержимого покупок
 */

class ReceiptModal {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.modalId = 'receipt-modal';
        this.createModal();
    }

    /**
     * Создаёт HTML структуру модального окна
     */
    createModal() {
        const modalHTML = `
            <div id="${this.modalId}" class="receipt-modal">
                <div class="receipt-modal-overlay"></div>
                <div class="receipt-modal-content">
                    <div class="receipt-modal-header">
                        <h2 data-i18n="budget.receiptDetails">Детали чека</h2>
                        <button class="receipt-modal-close" id="receipt-modal-close">×</button>
                    </div>

                    <div class="receipt-modal-body">
                        <div class="receipt-info">
                            <div class="receipt-info-row">
                                <span class="receipt-info-label">🏪 <span data-i18n="budget.store">Магазин</span>:</span>
                                <span class="receipt-info-value" id="receipt-store"></span>
                            </div>
                            <div class="receipt-info-row">
                                <span class="receipt-info-label">📅 <span data-i18n="budget.date">Дата</span>:</span>
                                <span class="receipt-info-value" id="receipt-date"></span>
                            </div>
                            <div class="receipt-info-row">
                                <span class="receipt-info-label">💳 <span data-i18n="budget.paymentMethod">Оплата</span>:</span>
                                <span class="receipt-info-value" id="receipt-payment"></span>
                            </div>
                            <div class="receipt-info-row">
                                <span class="receipt-info-label">🧾 <span data-i18n="budget.invoiceNumber">Номер</span>:</span>
                                <span class="receipt-info-value" id="receipt-invoice"></span>
                            </div>
                        </div>

                        <div class="receipt-items-header">
                            <h3 data-i18n="budget.items">Товары</h3>
                            <span class="receipt-items-count" id="receipt-items-count"></span>
                        </div>

                        <div class="receipt-items" id="receipt-items"></div>

                        <div class="receipt-total">
                            <span data-i18n="budget.total">Итого</span>:
                            <span id="receipt-total-amount"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.attachEventListeners();
    }

    /**
     * Прикрепляет обработчики событий
     */
    attachEventListeners() {
        const modal = document.getElementById(this.modalId);
        const closeBtn = document.getElementById('receipt-modal-close');
        const overlay = modal.querySelector('.receipt-modal-overlay');

        closeBtn.onclick = () => this.close();
        overlay.onclick = () => this.close();

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    /**
     * Открывает модальное окно с данными о чеке
     */
    async open(purchaseId) {
        try {
            const data = await API.getPurchaseDetails(purchaseId);
            this.renderData(data);

            const modal = document.getElementById(this.modalId);
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (this.tg?.HapticFeedback) {
                this.tg.HapticFeedback.impactOccurred('light');
            }
        } catch (error) {
            console.error('Ошибка загрузки деталей чека:', error);
            this.showError();
        }
    }

    /**
     * Закрывает модальное окно
     */
    close() {
        const modal = document.getElementById(this.modalId);
        modal.classList.remove('active');
        document.body.style.overflow = '';

        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('light');
        }
    }

    /**
     * Отображает данные в модальном окне
     */
    renderData(data) {
        document.getElementById('receipt-store').textContent =
            `${data.store_name} ${data.store_type ? `(${data.store_type})` : ''}`;

        document.getElementById('receipt-date').textContent =
            this.formatDate(data.purchase_date);

        document.getElementById('receipt-payment').textContent =
            data.payment_method || '-';

        document.getElementById('receipt-invoice').textContent =
            data.invoice_number || '-';

        document.getElementById('receipt-items-count').textContent =
            `(${data.items.length})`;

        document.getElementById('receipt-total-amount').textContent =
            this.formatMoney(data.total_amount);

        this.renderItems(data.items);
    }

    /**
     * Отображает список товаров
     */
    renderItems(items) {
        const container = document.getElementById('receipt-items');
        container.innerHTML = '';

        items.forEach(item => {
            const itemHTML = `
                <div class="receipt-item">
                    <div class="receipt-item-header">
                        <span class="receipt-item-name">${this.escapeHtml(item.product_name)}</span>
                        ${item.category_name ? `<span class="receipt-item-category">${this.escapeHtml(item.category_name)}</span>` : ''}
                    </div>
                    <div class="receipt-item-details">
                        <span class="receipt-item-quantity">
                            ${item.quantity} ${item.unit || 'шт'} × ${this.formatMoney(item.unit_price)}
                        </span>
                        <span class="receipt-item-total">${this.formatMoney(item.total_price)}</span>
                    </div>
                    ${item.discount > 0 ? `<div class="receipt-item-discount">💰 Скидка: ${this.formatMoney(item.discount)}</div>` : ''}
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    /**
     * Показывает сообщение об ошибке
     */
    showError() {
        const modal = document.getElementById(this.modalId);
        const body = modal.querySelector('.receipt-modal-body');
        body.innerHTML = `
            <div class="receipt-error">
                <p>❌ Не удалось загрузить детали чека</p>
                <button class="btn-primary" onclick="receiptModal.close()">Закрыть</button>
            </div>
        `;
        modal.classList.add('active');
    }

    /**
     * Форматирует дату
     */
    formatDate(dateString) {
        if (!dateString) return '-';

        const date = new Date(dateString);
        const language = getCurrentLanguage ? getCurrentLanguage() : 'ru';

        return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
     * Экранирует HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Создаём глобальный экземпляр для использования на странице
window.receiptModal = new ReceiptModal();