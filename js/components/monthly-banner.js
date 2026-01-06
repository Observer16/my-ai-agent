/**
 * Модуль месячного баннера расходов
 * Поддерживает i18n и может использоваться на разных страницах
 */

class MonthlyBanner {
    constructor(containerId) {
        this.containerId = containerId;
        this.tg = window.Telegram?.WebApp;
    }

    /**
     * Инициализирует баннер в указанном контейнере
     */
    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Контейнер ${this.containerId} не найден`);
            return;
        }

        // Создаем HTML баннера
        container.innerHTML = this.getTemplate();

        // Загружаем данные
        await this.loadData();

        // Назначаем обработчик клика
        this.attachClickHandler();
    }

    /**
     * Возвращает HTML шаблон баннера
     */
    getTemplate() {
        return `
            <div class="monthly-banner" id="monthly-banner">
                <div class="monthly-banner-header">
                    <span>💰 <span data-i18n="budget.monthlyExpenses">Расходы за текущий месяц</span></span>
                    <span class="monthly-banner-arrow">→</span>
                </div>
                <div class="monthly-banner-amount" id="monthly-banner-amount">-</div>
                <div class="monthly-banner-details">
                    <span>📅 <span id="monthly-banner-period">-</span></span>
                    <span>🧾 <span id="monthly-banner-purchases">-</span> <span data-i18n="budget.purchases">покупок</span></span>
                    <span>🏪 <span id="monthly-banner-stores">-</span> <span data-i18n="budget.stores">магазинов</span></span>
                </div>
            </div>
        `;
    }

    /**
     * Загружает данные для баннера
     */
    async loadData() {
        try {
            const stats = await API.getMonthlyStatistics();
            this.updateBanner(stats);
        } catch (error) {
            console.error('Ошибка загрузки месячной статистики:', error);
            this.hideBanner();
        }
    }

    /**
     * Обновляет данные в баннере
     */
    updateBanner(stats) {
        if (!stats?.summary) {
            this.hideBanner();
            return;
        }

        document.getElementById('monthly-banner-amount').textContent = this.formatMoney(stats.summary.total_spent);

        const now = new Date();
        const monthName = this.getMonthName(now.getMonth());
        document.getElementById('monthly-banner-period').textContent = monthName;
        document.getElementById('monthly-banner-purchases').textContent = stats.summary.total_purchases;
        document.getElementById('monthly-banner-stores').textContent = stats.summary.unique_stores;
    }

    /**
     * Скрывает баннер
     */
    hideBanner() {
        const banner = document.getElementById('monthly-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    /**
     * Прикрепляет обработчик клика
     */
    attachClickHandler() {
        const banner = document.getElementById('monthly-banner');
        if (banner) {
            banner.onclick = () => this.openMonthlyStats();
        }
    }

    /**
     * Открывает страницу статистики
     */
    openMonthlyStats() {
        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('medium');
        }
        window.location.href = 'monthly-stats.html';
    }

    /**
     * Форматирует денежную сумму
     */
    formatMoney(amount) {
        if (!amount && amount !== 0) return `0 ${getCurrencySymbol()}`;

        const numAmount = Number(amount);
        if (isNaN(numAmount)) return `0 ${getCurrencySymbol()}`;

        if (numAmount === 0) return `0 ${getCurrencySymbol()}`;

        const absAmount = Math.abs(numAmount);
        const language = getCurrentLanguage ? getCurrentLanguage() : 'ru';

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
     * Возвращает название месяца
     */
    getMonthName(monthIndex) {
        const language = getCurrentLanguage ? getCurrentLanguage() : 'ru';
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
}

// Создаем глобальный экземпляр для использования на странице
window.monthlyBanner = new MonthlyBanner('monthly-banner-container');