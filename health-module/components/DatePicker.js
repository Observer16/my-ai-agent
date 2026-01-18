/**
 * DatePicker - Всплывающий календарь для выбора даты
 * Компонент для удобного выбора даты с навигацией по месяцам и годам
 *
 * Использование:
 * const picker = new DatePicker(containerElement, {
 *   initialDate: '2026-01-18',
 *   onDateSelect: (dateString) => console.log(`Выбрана дата: ${dateString}`),
 *   minDate: '2020-01-01',
 *   maxDate: '2030-12-31'
 * });
 */

class DatePicker {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            initialDate: options.initialDate || this.getToday(),
            onDateSelect: options.onDateSelect || (() => {}),
            minDate: options.minDate || null,
            maxDate: options.maxDate || null,
            ...options
        };

        this.currentDate = new Date(this.options.initialDate);
        this.selectedDate = new Date(this.options.initialDate);

        this.render();
        this.attachEventListeners();
    }

    /**
     * Получить сегодняшнюю дату в формате YYYY-MM-DD
     */
    getToday() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Преобразовать дату в объект Date
     */
    parseDate(dateString) {
        const parts = dateString.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }

    /**
     * Преобразовать объект Date в строку YYYY-MM-DD
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Проверить доступна ли дата
     */
    isDateAvailable(date) {
        const dateStr = this.formatDate(date);

        if (this.options.minDate && dateStr < this.options.minDate) {
            return false;
        }

        if (this.options.maxDate && dateStr > this.options.maxDate) {
            return false;
        }

        return true;
    }

    /**
     * Рендер компонента
     */
    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const selectedDateStr = this.formatDate(this.selectedDate);

        this.container.innerHTML = `
            <div class="date-picker-wrapper">
                <!-- Шапка с навигацией -->
                <div class="date-picker-header">
                    <button type="button" class="date-picker-nav-btn prev-month-btn">
                        <span>‹</span>
                    </button>
                    <div class="date-picker-title">
                        <div class="month-year-selector">
                            <select class="month-select" id="month-select">
                                ${this.renderMonthOptions(month)}
                            </select>
                            <select class="year-select" id="year-select">
                                ${this.renderYearOptions(year)}
                            </select>
                        </div>
                    </div>
                    <button type="button" class="date-picker-nav-btn next-month-btn">
                        <span>›</span>
                    </button>
                </div>

                <!-- Дни недели -->
                <div class="date-picker-weekdays">
                    <div class="weekday">Пн</div>
                    <div class="weekday">Вт</div>
                    <div class="weekday">Ср</div>
                    <div class="weekday">Чт</div>
                    <div class="weekday">Пт</div>
                    <div class="weekday">Сб</div>
                    <div class="weekday">Вс</div>
                </div>

                <!-- Дни месяца -->
                <div class="date-picker-days">
                    ${this.renderCalendarDays(year, month, selectedDateStr)}
                </div>

                <!-- Кнопки действия -->
                <div class="date-picker-actions">
                    <button type="button" class="health-btn btn-secondary cancel-btn">
                        Отмена
                    </button>
                    <button type="button" class="health-btn btn-primary confirm-btn">
                        Выбрать
                    </button>
                </div>
            </div>

            <style>
                .date-picker-wrapper {
                    background: white;
                    border-radius: 16px;
                    padding: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .date-picker-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    gap: 8px;
                }

                .date-picker-nav-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #333;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .date-picker-nav-btn:hover {
                    background: #f0f0f0;
                    color: #007AFF;
                }

                .date-picker-nav-btn:active {
                    transform: scale(0.95);
                }

                .date-picker-title {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                }

                .month-year-selector {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .month-select,
                .year-select {
                    padding: 8px 12px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .month-select:hover,
                .year-select:hover {
                    border-color: #007AFF;
                    background: #f8f9ff;
                }

                .month-select:focus,
                .year-select:focus {
                    outline: none;
                    border-color: #007AFF;
                    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
                }

                .date-picker-weekdays {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                    margin-bottom: 8px;
                }

                .weekday {
                    text-align: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: #999;
                    padding: 8px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .date-picker-days {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                    margin-bottom: 16px;
                }

                .date-day {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: white;
                    color: #333;
                    border: 1px solid transparent;
                }

                .date-day.other-month {
                    color: #ccc;
                    cursor: not-allowed;
                }

                .date-day.disabled {
                    color: #e0e0e0;
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .date-day.today {
                    border: 2px solid #007AFF;
                    color: #007AFF;
                    font-weight: 600;
                }

                .date-day.selected {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-weight: 600;
                }

                .date-day:hover:not(.disabled):not(.other-month) {
                    background: #f0f0f0;
                    border-color: #007AFF;
                }

                .date-day:active:not(.disabled):not(.other-month) {
                    transform: scale(0.95);
                }

                .date-picker-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                .date-picker-actions .health-btn {
                    min-width: 100px;
                }

                @media (max-width: 480px) {
                    .date-picker-wrapper {
                        padding: 12px;
                    }

                    .month-year-selector {
                        flex-direction: column;
                        gap: 6px;
                    }

                    .month-select,
                    .year-select {
                        padding: 6px 10px;
                        font-size: 13px;
                    }

                    .date-day {
                        font-size: 12px;
                    }

                    .date-picker-actions {
                        flex-direction: column;
                    }

                    .date-picker-actions .health-btn {
                        width: 100%;
                    }
                }
            </style>
        `;
    }

    /**
     * Рендер опций месяцев
     */
    renderMonthOptions(selectedMonth) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        return months.map((month, index) => `
            <option value="${index}" ${index === selectedMonth ? 'selected' : ''}>
                ${month}
            </option>
        `).join('');
    }

    /**
     * Рендер опций лет
     */
    renderYearOptions(selectedYear) {
        const minYear = 1900;
        const maxYear = 2100;
        const options = [];

        for (let year = minYear; year <= maxYear; year++) {
            options.push(`
                <option value="${year}" ${year === selectedYear ? 'selected' : ''}>
                    ${year}
                </option>
            `);
        }

        return options.join('');
    }

    /**
     * Рендер дней месяца
     */
    renderCalendarDays(year, month, selectedDateStr) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);

        const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const daysInMonth = lastDay.getDate();
        const daysInPrevMonth = prevLastDay.getDate();

        let html = '';

        // Дни из предыдущего месяца
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += `<div class="date-day other-month">${day}</div>`;
        }

        // Дни текущего месяца
        const today = this.formatDate(new Date());
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === today;
            const isDisabled = !this.isDateAvailable(new Date(dateStr));

            let classes = 'date-day';
            if (isSelected) classes += ' selected';
            if (isToday) classes += ' today';
            if (isDisabled) classes += ' disabled';

            html += `
                <div class="${classes}" data-date="${dateStr}" onclick="this.closest('.date-picker-wrapper').__picker?.selectDate('${dateStr}')">
                    ${day}
                </div>
            `;
        }

        // Дни из следующего месяца
        const totalCells = firstDayOfWeek + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="date-day other-month">${day}</div>`;
        }

        return html;
    }

    /**
     * Выбрать дату
     */
    selectDate(dateString) {
        const date = new Date(dateString);
        if (!this.isDateAvailable(date)) {
            return;
        }

        this.selectedDate = date;
        this.render();
        this.attachEventListeners();
    }

    /**
     * Перейти на предыдущий месяц
     */
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
        this.attachEventListeners();
    }

    /**
     * Перейти на следующий месяц
     */
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
        this.attachEventListeners();
    }

    /**
     * Привязка обработчиков событий
     */
    attachEventListeners() {
        const wrapper = this.container.querySelector('.date-picker-wrapper');
        if (wrapper) {
            wrapper.__picker = this;
        }

        // Кнопки навигации
        this.container.querySelector('.prev-month-btn')?.addEventListener('click', () => this.previousMonth());
        this.container.querySelector('.next-month-btn')?.addEventListener('click', () => this.nextMonth());

        // Селекты месяца и года
        this.container.querySelector('#month-select')?.addEventListener('change', (e) => {
            this.currentDate.setMonth(parseInt(e.target.value));
            this.render();
            this.attachEventListeners();
        });

        this.container.querySelector('#year-select')?.addEventListener('change', (e) => {
            this.currentDate.setFullYear(parseInt(e.target.value));
            this.render();
            this.attachEventListeners();
        });

        // Кнопки действия
        this.container.querySelector('.confirm-btn')?.addEventListener('click', () => {
            const dateStr = this.formatDate(this.selectedDate);
            this.options.onDateSelect(dateStr);
        });

        this.container.querySelector('.cancel-btn')?.addEventListener('click', () => {
            if (typeof this.options.onCancel === 'function') {
                this.options.onCancel();
            }
        });
    }

    /**
     * Установить дату
     */
    setDate(dateString) {
        this.selectedDate = this.parseDate(dateString);
        this.currentDate = new Date(this.selectedDate);
        this.render();
        this.attachEventListeners();
    }

    /**
     * Получить выбранную дату
     */
    getDate() {
        return this.formatDate(this.selectedDate);
    }

    /**
     * Уничтожить компонент
     */
    destroy() {
        this.container.innerHTML = '';
    }
}

// Экспорт для использования в других модулях
if (typeof window !== 'undefined') {
    window.DatePicker = DatePicker;
}
