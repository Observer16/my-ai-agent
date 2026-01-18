/**
 * DayPicker - iOS-Style Wheel Picker для выбора даты
 * Компонент для выбора день/месяц/год с колесиками и инерцией
 *
 * Использование:
 * const picker = new DayPicker(containerElement, {
 *   initialDate: '2026-01-18',
 *   onDateSelect: (dateString) => console.log(`Дата: ${dateString}`),
 *   minDate: '2020-01-01',
 *   maxDate: '2030-12-31'
 * });
 */

class DayPicker {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            initialDate: options.initialDate || this.getToday(),
            onDateSelect: options.onDateSelect || (() => {}),
            minDate: options.minDate || null,
            maxDate: options.maxDate || null,
            format: options.format || 'DD.MM.YYYY',
            ...options
        };

        // Парсим начальную дату
        const initialDate = new Date(this.options.initialDate);
        this.state = {
            day: initialDate.getDate(),
            month: initialDate.getMonth() + 1,
            year: initialDate.getFullYear(),
            isDraggingDay: false,
            isDraggingMonth: false,
            isDraggingYear: false,
            velocityDay: 0,
            velocityMonth: 0,
            velocityYear: 0
        };

        this.itemHeight = 45;
        this.friction = 0.96;
        this.maxVelocity = 10;

        this.wheelElements = {};
        this.itemsElements = {};
        this.pickers = {};

        this.render();
        this.attachEventListeners();
        this.updateWheels();
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
    formatDate(day, month, year) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    /**
     * Получить количество дней в месяце
     */
    getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    /**
     * Рендер структуры компонента
     */
    render() {
        this.container.innerHTML = `
            <div class="day-picker-wrapper">
                <!-- День -->
                <div class="day-picker-column">
                    <div class="day-picker-wheel" data-type="day">
                        <div class="day-picker-items">
                            ${this.generateDayItems()}
                        </div>
                        <div class="day-picker-indicator"></div>
                    </div>
                    <div class="day-picker-label">День</div>
                </div>

                <!-- Месяц -->
                <div class="day-picker-column">
                    <div class="day-picker-wheel" data-type="month">
                        <div class="day-picker-items">
                            ${this.generateMonthItems()}
                        </div>
                        <div class="day-picker-indicator"></div>
                    </div>
                    <div class="day-picker-label">Месяц</div>
                </div>

                <!-- Год -->
                <div class="day-picker-column">
                    <div class="day-picker-wheel" data-type="year">
                        <div class="day-picker-items">
                            ${this.generateYearItems()}
                        </div>
                        <div class="day-picker-indicator"></div>
                    </div>
                    <div class="day-picker-label">Год</div>
                </div>
            </div>

            <style>
                .day-picker-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 20px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    border-radius: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .day-picker-column {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .day-picker-wheel {
                    position: relative;
                    width: 70px;
                    height: 180px;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    user-select: none;
                    cursor: grab;
                }

                .day-picker-wheel.dragging {
                    cursor: grabbing;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                }

                .day-picker-items {
                    position: relative;
                    height: 100%;
                    transition: none;
                }

                .day-picker-item {
                    position: absolute;
                    width: 100%;
                    height: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: 600;
                    color: #999;
                    transition: color 0.2s ease;
                }

                .day-picker-item.active {
                    color: #333;
                    font-weight: 700;
                }

                .day-picker-indicator {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 45px;
                    transform: translateY(-50%);
                    border-top: 1px solid #e0e0e0;
                    border-bottom: 1px solid #e0e0e0;
                    background: rgba(52, 152, 219, 0.05);
                    pointer-events: none;
                    z-index: 1;
                }

                .day-picker-label {
                    font-size: 12px;
                    color: #666;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                @media (max-width: 480px) {
                    .day-picker-wrapper {
                        padding: 16px;
                        gap: 6px;
                    }

                    .day-picker-wheel {
                        width: 60px;
                        height: 150px;
                    }

                    .day-picker-item {
                        font-size: 18px;
                        height: 40px;
                    }

                    .day-picker-indicator {
                        height: 40px;
                    }

                    .day-picker-label {
                        font-size: 10px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .day-picker-items {
                        transition: transform 0s !important;
                    }
                    .day-picker-item {
                        transition: none !important;
                    }
                }
            </style>
        `;

        this.wheelElements = {
            day: this.container.querySelector('[data-type="day"]'),
            month: this.container.querySelector('[data-type="month"]'),
            year: this.container.querySelector('[data-type="year"]')
        };

        this.itemsElements = {
            day: this.container.querySelector('[data-type="day"] .day-picker-items'),
            month: this.container.querySelector('[data-type="month"] .day-picker-items'),
            year: this.container.querySelector('[data-type="year"] .day-picker-items')
        };
    }

    /**
     * Генерация элементов дней
     */
    generateDayItems() {
        let html = '<div style="height: 67.5px;"></div>';

        const maxDays = this.getDaysInMonth(this.state.month, this.state.year);
        for (let i = 1; i <= maxDays; i++) {
            html += `<div class="day-picker-item" data-value="${i}">${String(i).padStart(2, '0')}</div>`;
        }

        html += '<div style="height: 67.5px;"></div>';
        return html;
    }

    /**
     * Генерация элементов месяцев
     */
    generateMonthItems() {
        const months = [
            'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
            'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
        ];

        let html = '<div style="height: 67.5px;"></div>';

        months.forEach((month, index) => {
            html += `<div class="day-picker-item" data-value="${index + 1}">${month}</div>`;
        });

        html += '<div style="height: 67.5px;"></div>';
        return html;
    }

    /**
     * Генерация элементов лет
     */
    generateYearItems() {
        let html = '<div style="height: 67.5px;"></div>';

        const currentYear = this.state.year;
        const minYear = 1900;
        const maxYear = 2100;

        for (let year = minYear; year <= maxYear; year++) {
            html += `<div class="day-picker-item" data-value="${year}">${year}</div>`;
        }

        html += '<div style="height: 67.5px;"></div>';
        return html;
    }

    /**
     * Привязка обработчиков событий
     */
    attachEventListeners() {
        // Mouse events
        this.wheelElements.day?.addEventListener('mousedown', (e) => this.startDrag(e, 'day'));
        this.wheelElements.month?.addEventListener('mousedown', (e) => this.startDrag(e, 'month'));
        this.wheelElements.year?.addEventListener('mousedown', (e) => this.startDrag(e, 'year'));

        // Touch events
        this.wheelElements.day?.addEventListener('touchstart', (e) => this.startDrag(e, 'day'), { passive: false });
        this.wheelElements.month?.addEventListener('touchstart', (e) => this.startDrag(e, 'month'), { passive: false });
        this.wheelElements.year?.addEventListener('touchstart', (e) => this.startDrag(e, 'year'), { passive: false });

        // Wheel events
        this.wheelElements.day?.addEventListener('wheel', (e) => this.handleWheel(e, 'day'), { passive: false });
        this.wheelElements.month?.addEventListener('wheel', (e) => this.handleWheel(e, 'month'), { passive: false });
        this.wheelElements.year?.addEventListener('wheel', (e) => this.handleWheel(e, 'year'), { passive: false });
    }

    /**
     * Начало перетаскивания
     */
    startDrag(e, type) {
        e.preventDefault();
        e.stopPropagation();

        const startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const startOffset = this.getOffset(type);
        let lastY = startY;
        let lastTime = Date.now();

        this.state[`isDragging${type.charAt(0).toUpperCase() + type.slice(1)}`] = true;
        this.wheelElements[type].classList.add('dragging');

        const moveFn = (e) => this.handleDragMove(e, type, startY, startOffset, lastY, lastTime, (y, t) => {
            lastY = y;
            lastTime = t;
        });

        const endFn = () => this.endDrag(type, moveFn, endFn);

        document.addEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', moveFn, { passive: false });
        document.addEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', endFn);
    }

    /**
     * Движение во время перетаскивания
     */
    handleDragMove(e, type, startY, startOffset, lastY, lastTime, updateLastState) {
        e.preventDefault();

        const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const diff = currentY - startY;

        const currentTime = Date.now();
        const timeDelta = Math.max(currentTime - lastTime, 1);
        const velocity = (currentY - lastY) / timeDelta * 16;

        this.state[`velocity${type.charAt(0).toUpperCase() + type.slice(1)}`] = Math.max(
            Math.min(velocity, this.maxVelocity),
            -this.maxVelocity
        );

        const newOffset = startOffset - diff;
        this.setOffset(type, newOffset);
        this.updateActiveItem(type);

        updateLastState(currentY, currentTime);
    }

    /**
     * Завершение перетаскивания
     */
    endDrag(type, moveFn, endFn) {
        document.removeEventListener('mousemove', moveFn);
        document.removeEventListener('touchmove', moveFn);
        document.removeEventListener('mouseup', endFn);
        document.removeEventListener('touchend', endFn);

        this.state[`isDragging${type.charAt(0).toUpperCase() + type.slice(1)}`] = false;
        this.wheelElements[type].classList.remove('dragging');

        this.applyMomentum(type);
        this.snapToNearest(type);
    }

    /**
     * Применение инерции (momentum scrolling)
     */
    applyMomentum(type) {
        const animate = () => {
            let velocity = this.state[`velocity${type.charAt(0).toUpperCase() + type.slice(1)}`];

            if (Math.abs(velocity) < 0.1) {
                this.snapToNearest(type);
                return;
            }

            const offset = this.getOffset(type);
            this.setOffset(type, offset - velocity * this.itemHeight);

            velocity *= this.friction;
            this.state[`velocity${type.charAt(0).toUpperCase() + type.slice(1)}`] = velocity;

            this.updateActiveItem(type);
            requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Привязка к ближайшему элементу
     */
    snapToNearest(type) {
        const offset = this.getOffset(type);
        const snappedOffset = Math.round(offset / this.itemHeight) * this.itemHeight;

        const itemsElement = this.itemsElements[type];
        itemsElement.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        this.setOffset(type, snappedOffset);
        this.updateActiveItem(type);

        setTimeout(() => {
            itemsElement.style.transition = 'none';
        }, 300);

        this.updateDate();
    }

    /**
     * Обработка прокрутки колеса мыши
     */
    handleWheel(e, type) {
        e.preventDefault();

        const direction = e.deltaY > 0 ? 1 : -1;
        const offset = this.getOffset(type);
        const newOffset = offset + direction * this.itemHeight;

        this.setOffset(type, newOffset);
        this.snapToNearest(type);
    }

    /**
     * Получить смещение элемента
     */
    getOffset(type) {
        const itemsElement = this.itemsElements[type];
        const transform = itemsElement.style.transform;
        const match = transform.match(/translateY\((-?\d+)px\)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Установить смещение элемента
     */
    setOffset(type, offset) {
        const maxScroll = this.itemHeight * 0.5;
        let minScroll = 0;

        if (type === 'day') {
            const maxDays = this.getDaysInMonth(this.state.month, this.state.year);
            minScroll = -this.itemHeight * (maxDays + 0.5);
        } else if (type === 'month') {
            minScroll = -this.itemHeight * (12 + 0.5);
        } else if (type === 'year') {
            minScroll = -this.itemHeight * (200 + 0.5);
        }

        const limitedOffset = Math.max(minScroll, Math.min(offset, maxScroll));
        this.itemsElements[type].style.transform = `translateY(${limitedOffset}px)`;
    }

    /**
     * Обновить активный элемент
     */
    updateActiveItem(type) {
        const items = this.wheelElements[type].querySelectorAll('.day-picker-item');
        const offset = this.getOffset(type);
        const activeIndex = Math.round(-offset / this.itemHeight);

        items.forEach((item, index) => {
            item.classList.toggle('active', index === activeIndex);
        });
    }

    /**
     * Обновить дату на основе текущего смещения
     */
    updateDate() {
        const dayOffset = this.getOffset('day');
        const monthOffset = this.getOffset('month');
        const yearOffset = this.getOffset('year');

        const dayIndex = Math.round(-dayOffset / this.itemHeight);
        const monthIndex = Math.round(-monthOffset / this.itemHeight);
        const yearIndex = Math.round(-yearOffset / this.itemHeight);

        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

        const newMonth = Math.max(1, Math.min(monthIndex + 1, 12));
        const minYear = 1900;
        const newYear = Math.max(minYear, Math.min(minYear + yearIndex, 2100));

        const maxDays = this.getDaysInMonth(newMonth, newYear);
        const newDay = Math.max(1, Math.min(dayIndex + 1, maxDays));

        this.state.day = newDay;
        this.state.month = newMonth;
        this.state.year = newYear;

        this.options.onDateSelect(this.formatDate(this.state.day, this.state.month, this.state.year));
    }

    /**
     * Обновить колеса на основе текущих значений
     */
    updateWheels() {
        // День
        const dayOffset = -(this.state.day - 1) * this.itemHeight;
        this.itemsElements.day.style.transform = `translateY(${dayOffset}px)`;
        this.updateActiveItem('day');

        // Месяц
        const monthOffset = -(this.state.month - 1) * this.itemHeight;
        this.itemsElements.month.style.transform = `translateY(${monthOffset}px)`;
        this.updateActiveItem('month');

        // Год
        const minYear = 1900;
        const yearOffset = -(this.state.year - minYear) * this.itemHeight;
        this.itemsElements.year.style.transform = `translateY(${yearOffset}px)`;
        this.updateActiveItem('year');
    }

    /**
     * Установить дату
     */
    setDate(dateString) {
        const parts = dateString.split('-');
        this.state.day = parseInt(parts[2]);
        this.state.month = parseInt(parts[1]);
        this.state.year = parseInt(parts[0]);
        this.updateWheels();
    }

    /**
     * Получить текущую дату
     */
    getDate() {
        return this.formatDate(this.state.day, this.state.month, this.state.year);
    }

    /**
     * Уничтожить компонент
     */
    destroy() {
        this.container.innerHTML = '';
        this.state = null;
        this.wheelElements = null;
        this.itemsElements = null;
    }
}

// Экспорт для использования в других модулях
if (typeof window !== 'undefined') {
    window.DayPicker = DayPicker;
}
