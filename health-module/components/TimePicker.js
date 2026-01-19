/**
 * iOS-Style Wheel Time Picker
 * Компонент для выбора времени (часы и минуты) с удобной прокруткой
 *
 * Использование:
 * const picker = new TimePicker(containerElement, {
 *   initialHours: 14,
 *   initialMinutes: 30,
 *   onTimeSelect: (hours, minutes) => console.log(`${hours}:${minutes}`),
 *   hoursLabel: 'ч',
 *   minutesLabel: 'мин',
 *   format24h: true,
 *   minuteStep: 1
 * });
 */

class TimePicker {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            initialHours: options.initialHours || 12,
            initialMinutes: options.initialMinutes || 0,
            onTimeSelect: options.onTimeSelect || (() => {}),
            hoursLabel: options.hoursLabel || 'ч',
            minutesLabel: options.minutesLabel || 'мин',
            format24h: options.format24h !== false,
            minuteStep: options.minuteStep || 1,
            ...options
        };

        this.state = {
            hours: this.options.initialHours,
            minutes: this.options.initialMinutes,
            isDraggingHours: false,
            isDraggingMinutes: false,
            velocityHours: 0,
            velocityMinutes: 0
        };

        this.hoursRange = this.options.format24h ? 24 : 12;
        this.minutesRange = Math.ceil(60 / this.options.minuteStep);
        this.itemHeight = 22.5; // Высота одного элемента (уменьшено в 2 раза с 45)
        this.friction = 0.96; // Трение для инерции
        this.maxVelocity = 10;

        this.render();
        this.attachEventListeners();
        this.updateWheels();
    }

    /**
     * Рендер структуры компонента
     */
    render() {
        this.container.innerHTML = `
            <div class="time-picker-wrapper">
                <!-- Hours Wheel -->
                <div class="time-picker-column">
                    <div class="time-picker-wheel" data-type="hours">
                        <div class="time-picker-items">
                            ${this.generateHoursItems()}
                        </div>
                        <div class="time-picker-indicator"></div>
                    </div>
                    <div class="time-picker-label">${this.options.hoursLabel}</div>
                </div>

                <!-- Separator -->
                <div class="time-picker-separator">:</div>

                <!-- Minutes Wheel -->
                <div class="time-picker-column">
                    <div class="time-picker-wheel" data-type="minutes">
                        <div class="time-picker-items">
                            ${this.generateMinutesItems()}
                        </div>
                        <div class="time-picker-indicator"></div>
                    </div>
                    <div class="time-picker-label">${this.options.minutesLabel}</div>
                </div>
            </div>

            <style>
                .time-picker-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 10px;
                    background: #ffffff;
                    border-radius: 12px;
                    border: 1px solid #e0e0e0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .time-picker-column {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }

                .time-picker-wheel {
                    position: relative;
                    width: 35px;
                    height: 90px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                    user-select: none;
                    cursor: grab;
                    border: 1px solid #d0d0d0;
                }

                .time-picker-wheel.dragging {
                    cursor: grabbing;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
                }

                .time-picker-items {
                    position: relative;
                    height: 100%;
                    transition: none;
                }

                .time-picker-item {
                    position: absolute;
                    width: 100%;
                    height: 22.5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 600;
                    color: #aaa;
                    transition: color 0.2s ease;
                }

                .time-picker-item.active {
                    color: #333;
                    font-weight: 700;
                }

                .time-picker-indicator {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 22.5px;
                    transform: translateY(-50%);
                    border-top: 1px solid #d0d0d0;
                    border-bottom: 1px solid #d0d0d0;
                    background: rgba(52, 152, 219, 0.08);
                    pointer-events: none;
                    z-index: 1;
                }

                .time-picker-separator {
                    font-size: 16px;
                    font-weight: 700;
                    color: #333;
                    margin: 0 2px;
                    line-height: 1;
                }

                .time-picker-label {
                    font-size: 8px;
                    color: #666;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .time-picker-items {
                        transition: transform 0s !important;
                    }
                    .time-picker-item {
                        transition: none !important;
                    }
                }
            </style>
        `;

        this.wheelElements = {
            hours: this.container.querySelector('[data-type="hours"]'),
            minutes: this.container.querySelector('[data-type="minutes"]')
        };

        this.itemsElements = {
            hours: this.container.querySelector('[data-type="hours"] .time-picker-items'),
            minutes: this.container.querySelector('[data-type="minutes"] .time-picker-items')
        };
    }

    /**
     * Генерация элементов часов
     */
    generateHoursItems() {
        let html = '<div style="height: 33.75px;"></div>'; // Отступ сверху (уменьшено в 2 раза)

        for (let i = 0; i < this.hoursRange; i++) {
            const displayHour = this.options.format24h ?
                String(i).padStart(2, '0') :
                String(i === 0 ? 12 : i > 12 ? i - 12 : i).padStart(2, '0');

            html += `<div class="time-picker-item" data-value="${i}">${displayHour}</div>`;
        }

        html += '<div style="height: 33.75px;"></div>'; // Отступ снизу (уменьшено в 2 раза)
        return html;
    }

    /**
     * Генерация элементов минут
     */
    generateMinutesItems() {
        let html = '<div style="height: 33.75px;"></div>'; // Отступ сверху (уменьшено в 2 раза)

        for (let i = 0; i < this.minutesRange; i++) {
            const minutes = i * this.options.minuteStep;
            const displayMinutes = String(minutes).padStart(2, '0');

            html += `<div class="time-picker-item" data-value="${minutes}">${displayMinutes}</div>`;
        }

        html += '<div style="height: 33.75px;"></div>'; // Отступ снизу (уменьшено в 2 раза)
        return html;
    }

    /**
     * Привязка обработчиков событий
     */
    attachEventListeners() {
        // Mouse events
        this.wheelElements.hours.addEventListener('mousedown', (e) => this.startDrag(e, 'hours'));
        this.wheelElements.minutes.addEventListener('mousedown', (e) => this.startDrag(e, 'minutes'));

        // Touch events
        this.wheelElements.hours.addEventListener('touchstart', (e) => this.startDrag(e, 'hours'), { passive: false });
        this.wheelElements.minutes.addEventListener('touchstart', (e) => this.startDrag(e, 'minutes'), { passive: false });

        // Wheel events
        this.wheelElements.hours.addEventListener('wheel', (e) => this.handleWheel(e, 'hours'), { passive: false });
        this.wheelElements.minutes.addEventListener('wheel', (e) => this.handleWheel(e, 'minutes'), { passive: false });

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
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

        // Расчет скорости
        const currentTime = Date.now();
        const timeDelta = Math.max(currentTime - lastTime, 1);
        const velocity = (currentY - lastY) / timeDelta * 16; // Нормализация на 60fps

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

        // Применение инерции
        this.applyMomentum(type);

        // Привязка к ближайшему элементу
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

        this.updateTime();
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
     * Обработка клавиатурных команд
     */
    handleKeyboard(e) {
        if (!this.container.contains(document.activeElement)) return;

        if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            // Можно добавить фокусировку на элементы если нужно
        }
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
        // Ограничение смещения
        const maxScroll = this.itemHeight * 0.5;
        const minScroll = -this.itemHeight * (this.getMaxValue(type) + 0.5);

        const limitedOffset = Math.max(minScroll, Math.min(offset, maxScroll));
        this.itemsElements[type].style.transform = `translateY(${limitedOffset}px)`;
    }

    /**
     * Получить максимальное значение для типа
     */
    getMaxValue(type) {
        return type === 'hours' ? this.hoursRange - 1 : this.minutesRange - 1;
    }

    /**
     * Обновить активный элемент
     */
    updateActiveItem(type) {
        const items = this.wheelElements[type].querySelectorAll('.time-picker-item');
        const offset = this.getOffset(type);
        const activeIndex = Math.round(-offset / this.itemHeight);

        items.forEach((item, index) => {
            item.classList.toggle('active', index === activeIndex);
        });
    }

    /**
     * Обновить время на основе текущего смещения
     */
    updateTime() {
        const hoursOffset = this.getOffset('hours');
        const minutesOffset = this.getOffset('minutes');

        const hoursIndex = Math.round(-hoursOffset / this.itemHeight);
        const minutesIndex = Math.round(-minutesOffset / this.itemHeight);

        this.state.hours = Math.max(0, Math.min(hoursIndex, this.hoursRange - 1));
        this.state.minutes = Math.max(0, Math.min(minutesIndex * this.options.minuteStep, 59));

        this.options.onTimeSelect(this.state.hours, this.state.minutes);
    }

    /**
     * Обновить колеса на основе начальных значений
     */
    updateWheels() {
        // Часы
        const hoursOffset = -this.state.hours * this.itemHeight;
        this.itemsElements.hours.style.transform = `translateY(${hoursOffset}px)`;
        this.updateActiveItem('hours');

        // Минуты
        const minutesIndex = Math.round(this.state.minutes / this.options.minuteStep);
        const minutesOffset = -minutesIndex * this.itemHeight;
        this.itemsElements.minutes.style.transform = `translateY(${minutesOffset}px)`;
        this.updateActiveItem('minutes');
    }

    /**
     * Публичные методы
     */

    /**
     * Установить время
     */
    setTime(hours, minutes) {
        this.state.hours = Math.max(0, Math.min(hours, this.hoursRange - 1));
        this.state.minutes = Math.max(0, Math.min(minutes, 59));
        this.updateWheels();
        this.updateTime();
    }

    /**
     * Получить текущее время
     */
    getTime() {
        return {
            hours: this.state.hours,
            minutes: this.state.minutes,
            formatted: `${String(this.state.hours).padStart(2, '0')}:${String(this.state.minutes).padStart(2, '0')}`
        };
    }

    /**
     * Сбросить на начальное время
     */
    reset() {
        this.setTime(this.options.initialHours, this.options.initialMinutes);
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
    window.TimePicker = TimePicker;
}
