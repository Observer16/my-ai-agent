// js/modals/MedicationFormModal.js
const MedicationFormModal = (function() {
    let currentStep = 1;
    let medicationId = null;
    let formData = {
        // Шаг 1
        name: '',
        dosage: '',
        form: 'таблетки',
        instructions: '',

        // Шаг 2
        intake_type: 'постоянно',
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,

        // Шаг 3
        quantity_available: 0,
        quantity_threshold: 5,
        quantity_unit: 'таблетки',

        // Шаг 4
        schedules: []
    };

    // Константы
    const TOTAL_STEPS = 4;
    const FORM_OPTIONS = [
        'таблетки', 'капсулы', 'сироп', 'раствор',
        'мазь', 'крем', 'капли', 'спрей', 'порошок', 'другое'
    ];

    const QUANTITY_UNITS = [
        { value: 'таблетки', label: 'Таблетки', icon: '💊' },
        { value: 'капсулы', label: 'Капсулы', icon: '💊' },
        { value: 'мл', label: 'Миллилитры (мл)', icon: '💧' },
        { value: 'капли', label: 'Капли', icon: '💧' },
        { value: 'дозы', label: 'Дозы', icon: '💉' },
        { value: 'штуки', label: 'Штуки', icon: '📦' }
    ];

    const DAYS_OF_WEEK = [
        { value: 0, label: 'Пн', fullLabel: 'Понедельник' },
        { value: 1, label: 'Вт', fullLabel: 'Вторник' },
        { value: 2, label: 'Ср', fullLabel: 'Среда' },
        { value: 3, label: 'Чт', fullLabel: 'Четверг' },
        { value: 4, label: 'Пт', fullLabel: 'Пятница' },
        { value: 5, label: 'Сб', fullLabel: 'Суббота' },
        { value: 6, label: 'Вс', fullLabel: 'Воскресенье' }
    ];

    async function show(data = {}) {
        console.log('💊 Открытие формы лекарства:', data);

        currentStep = 1;
        medicationId = data.medicationId || null;

        if (medicationId) {
            await loadMedicationData(medicationId);
        } else {
            resetFormData();
        }

        renderStep(currentStep);
    }

    function resetFormData() {
        formData = {
            name: '',
            dosage: '',
            form: 'таблетки',
            instructions: '',
            intake_type: 'постоянно',
            start_date: new Date().toISOString().split('T')[0],
            end_date: null,
            quantity_available: 0,
            quantity_threshold: 5,
            quantity_unit: 'таблетки',
            schedules: []
        };
    }

    async function loadMedicationData(id) {
        try {
            const result = await HealthAPI.getMedication(id);

            if (result.success && result.data) {
                const med = result.data;

                // Заполняем formData из загруженных данных
                formData.name = med.name || '';
                formData.dosage = (med.dosage && med.dosage !== 'string') ? med.dosage : '';
                formData.form = (med.form && med.form !== 'string') ? med.form : 'таблетки';
                formData.instructions = (med.instructions && med.instructions !== 'string') ? med.instructions : '';
                formData.intake_type = med.intake_type || 'постоянно';
                formData.start_date = med.start_date || new Date().toISOString().split('T')[0];
                formData.end_date = med.end_date || null;
                formData.quantity_available = med.quantity_available || 0;
                formData.quantity_threshold = med.quantity_threshold || 5;
                formData.quantity_unit = med.quantity_unit || 'таблетки';
                formData.schedules = (med.schedules || []).map(s => ({
                    id: s.id,
                    days_of_week: s.days_of_week || [],
                    time_of_day: s.time_of_day || '08:00',
                    dosage_amount: s.dosage_amount || 1.0,
                    reminder_minutes: s.reminder_minutes || 10,
                    is_active: s.is_active !== false
                }));

                console.log('✅ Данные лекарства загружены:', formData);
            } else {
                throw new Error('Лекарство не найдено');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки лекарства:', error);
            showToast('❌ Не удалось загрузить данные: ' + error.message, 'error');
            close();
        }
    }

    function renderStep(step) {
        let content = '';

        switch(step) {
            case 1:
                content = renderStep1();
                break;
            case 2:
                content = renderStep2();
                break;
            case 3:
                content = renderStep3();
                break;
            case 4:
                content = renderStep4();
                break;
            default:
                content = '<p>Неизвестный шаг</p>';
        }

        const title = medicationId ? '✏️ Редактировать лекарство' : '💊 Добавить лекарство';
        const modalHtml = BaseModal.createModalStructure(title, content, 'large');
        BaseModal.show(modalHtml);

        initStepHandlers(step);
    }

    function renderStepIndicator(currentStep) {
        return `
            <div class="step-indicator">
                ${renderStepItem(1, 'Основное', currentStep)}
                <div class="step-line"></div>
                ${renderStepItem(2, 'Тип приёма', currentStep)}
                <div class="step-line"></div>
                ${renderStepItem(3, 'Остатки', currentStep)}
                <div class="step-line"></div>
                ${renderStepItem(4, 'Расписание', currentStep)}
            </div>
        `;
    }

    function renderStepItem(stepNum, label, currentStep) {
        let className = 'step-item';
        let numberContent = stepNum;

        if (stepNum < currentStep) {
            className += ' completed';
            numberContent = '✓';
        } else if (stepNum === currentStep) {
            className += ' active';
        }

        return `
            <div class="${className}">
                <div class="step-number">${numberContent}</div>
                <div class="step-label">${label}</div>
            </div>
        `;
    }

    function renderStep1() {
        return `
            <div class="medication-form-step">
                ${renderStepIndicator(1)}
                <div class="form-content">
                    <div class="form-group">
                        <label for="medication-name">
                            Название лекарства <span style="color: var(--health-danger);">*</span>
                        </label>
                        <input
                            type="text"
                            id="medication-name"
                            class="modal-input"
                            value="${formData.name}"
                            placeholder="Например: Витамин D"
                            required
                            autofocus
                        >
                    </div>
                    <div class="form-group">
                        <label for="medication-dosage">Дозировка</label>
                        <input
                            type="text"
                            id="medication-dosage"
                            class="modal-input"
                            value="${formData.dosage}"
                            placeholder="Например: 1000 МЕ"
                        >
                        <div class="form-hint">Укажите дозировку одной единицы</div>
                    </div>
                    <div class="form-group">
                        <label for="medication-form">Форма выпуска</label>
                        <select id="medication-form" class="modal-input">
                            ${FORM_OPTIONS.map(option => `
                                <option value="${option}" ${formData.form === option ? 'selected' : ''}>
                                    ${option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="medication-instructions">Инструкция по применению</label>
                        <textarea
                            id="medication-instructions"
                            class="modal-input"
                            rows="3"
                            placeholder="Например: Принимать во время еды, запивая водой"
                        >${formData.instructions}</textarea>
                        <div class="form-hint">Как правильно принимать это лекарство</div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="MedicationFormModal.close()">
                        Отмена
                    </button>
                    <button class="health-btn btn-primary" onclick="MedicationFormModal.nextStep()">
                        Далее →
                    </button>
                </div>
            </div>
        `;
    }

    function renderStep2() {
        const isCourse = formData.intake_type === 'курсом';

        return `
            <div class="medication-form-step">
                ${renderStepIndicator(2)}
                <div class="form-content">
                    <div class="form-group">
                        <label>Тип приёма <span style="color: var(--health-danger);">*</span></label>
                        <div class="intake-type-selector">
                            <button
                                class="intake-type-btn ${!isCourse ? 'active' : ''}"
                                onclick="MedicationFormModal.selectIntakeType('постоянно')"
                            >
                                <span class="intake-icon">🔄</span>
                                <div class="intake-details">
                                    <div class="intake-label">Постоянно</div>
                                    <div class="intake-description">Принимаю регулярно</div>
                                </div>
                            </button>
                            <button
                                class="intake-type-btn ${isCourse ? 'active' : ''}"
                                onclick="MedicationFormModal.selectIntakeType('курсом')"
                            >
                                <span class="intake-icon">📅</span>
                                <div class="intake-details">
                                    <div class="intake-label">Курсом</div>
                                    <div class="intake-description">Ограниченный период</div>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="medication-start-date">Начало приёма</label>
                        <input
                            type="date"
                            id="medication-start-date"
                            class="modal-input"
                            value="${formData.start_date}"
                        >
                    </div>
                    ${isCourse ? `
                        <div class="form-group">
                            <label for="medication-end-date">
                                Окончание приёма <span style="color: var(--health-danger);">*</span>
                            </label>
                            <input
                                type="date"
                                id="medication-end-date"
                                class="modal-input"
                                value="${formData.end_date || ''}"
                                required
                            >
                            <div class="form-hint">Обязательно для курсового приёма</div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="MedicationFormModal.prevStep()">
                        ← Назад
                    </button>
                    <button class="health-btn btn-primary" onclick="MedicationFormModal.nextStep()">
                        Далее →
                    </button>
                </div>
            </div>
        `;
    }

    function renderStep3() {
        const selectedUnit = formData.quantity_unit;
        const unitInfo = QUANTITY_UNITS.find(u => u.value === selectedUnit) || QUANTITY_UNITS[0];

        return `
            <div class="medication-form-step">
                ${renderStepIndicator(3)}
                <div class="form-content">
                    <div class="form-group">
                        <label for="medication-quantity-unit">
                            Единица измерения <span style="color: var(--health-danger);">*</span>
                        </label>
                        <div class="quantity-unit-selector">
                            ${QUANTITY_UNITS.map(unit => `
                                <button
                                    class="quantity-unit-btn ${selectedUnit === unit.value ? 'active' : ''}"
                                    onclick="MedicationFormModal.selectQuantityUnit('${unit.value}')"
                                    type="button"
                                >
                                    <span class="unit-icon">${unit.icon}</span>
                                    <span class="unit-label">${unit.label}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="medication-quantity-available">
                            Количество в наличии
                        </label>
                        <div class="quantity-input-group">
                            <button
                                type="button"
                                class="quantity-btn"
                                onclick="MedicationFormModal.changeQuantity('available', -1)"
                            >
                                −
                            </button>
                            <input
                                type="number"
                                id="medication-quantity-available"
                                class="modal-input quantity-input"
                                value="${formData.quantity_available}"
                                min="0"
                                step="1"
                            >
                            <button
                                type="button"
                                class="quantity-btn"
                                onclick="MedicationFormModal.changeQuantity('available', 1)"
                            >
                                +
                            </button>
                            <span class="quantity-unit-label">${unitInfo.label}</span>
                        </div>
                        <div class="form-hint">Сколько у вас есть сейчас</div>
                    </div>
                    <div class="form-group">
                        <label for="medication-quantity-threshold">
                            Уведомить о покупке когда остаётся
                        </label>
                        <div class="quantity-input-group">
                            <button
                                type="button"
                                class="quantity-btn"
                                onclick="MedicationFormModal.changeQuantity('threshold', -1)"
                            >
                                −
                            </button>
                            <input
                                type="number"
                                id="medication-quantity-threshold"
                                class="modal-input quantity-input"
                                value="${formData.quantity_threshold}"
                                min="0"
                                step="1"
                            >
                            <button
                                type="button"
                                class="quantity-btn"
                                onclick="MedicationFormModal.changeQuantity('threshold', 1)"
                            >
                                +
                            </button>
                            <span class="quantity-unit-label">${unitInfo.label}</span>
                        </div>
                        <div class="form-hint">
                            ${formData.intake_type === 'постоянно'
                                ? '💡 Вы получите уведомление когда остаток будет ≤ этого значения'
                                : '⚠️ Уведомления работают только для постоянных лекарств'}
                        </div>
                    </div>
                    ${formData.intake_type === 'постоянно' && formData.quantity_available > 0 ? `
                        <div class="stock-preview">
                            <div class="stock-preview-header">
                                <span>📊 Прогноз</span>
                            </div>
                            <div class="stock-preview-body">
                                ${renderStockPreview()}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="MedicationFormModal.prevStep()">
                        ← Назад
                    </button>
                    <button class="health-btn btn-primary" onclick="MedicationFormModal.nextStep()">
                        Далее →
                    </button>
                </div>
            </div>
        `;
    }

    function renderStep4() {
        return `
            <div class="medication-form-step">
                ${renderStepIndicator(4)}
                <div class="form-content">
                    <div class="form-group">
                        <label>Расписание приёма</label>
                        <div class="form-hint">Добавьте время и дни для приёма лекарства</div>
                    </div>

                    <!-- Список расписаний -->
                    <div id="schedules-list" class="schedules-list">
                        ${formData.schedules.length === 0 ? `
                            <div class="empty-schedules">
                                <span class="empty-icon">📅</span>
                                <div class="empty-text">Расписание не добавлено</div>
                                <div class="empty-hint">Можно сохранить без расписания и добавить позже</div>
                            </div>
                        ` : formData.schedules.map((schedule, index) => renderScheduleItem(schedule, index)).join('')}
                    </div>

                    <!-- Кнопка добавления -->
                    <button
                        type="button"
                        class="health-btn btn-secondary add-schedule-btn"
                        onclick="MedicationFormModal.showScheduleForm()"
                    >
                        <span>➕</span> Добавить время приёма
                    </button>

                    <!-- Форма добавления (скрыта по умолчанию) -->
                    <div id="schedule-form" class="schedule-form" style="display: none;">
                        <div class="schedule-form-header">
                            <span>➕ Новое время приёма</span>
                            <button
                                type="button"
                                class="close-schedule-form-btn"
                                onclick="MedicationFormModal.hideScheduleForm()"
                            >
                                ✕
                            </button>
                        </div>

                        <div class="form-group">
                            <label>Дни недели <span style="color: var(--health-danger);">*</span></label>
                            <div class="days-selector">
                                ${DAYS_OF_WEEK.map(day => `
                                    <button
                                        type="button"
                                        class="day-btn"
                                        data-day="${day.value}"
                                        onclick="MedicationFormModal.toggleDay(${day.value})"
                                    >
                                        ${day.label}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="quick-select-days">
                                <button type="button" class="quick-btn" onclick="MedicationFormModal.selectAllDays()">Все дни</button>
                                <button type="button" class="quick-btn" onclick="MedicationFormModal.selectWeekdays()">Будни</button>
                                <button type="button" class="quick-btn" onclick="MedicationFormModal.selectWeekends()">Выходные</button>
                                <button type="button" class="quick-btn" onclick="MedicationFormModal.clearDays()">Очистить</button>
                            </div>
                        </div>

                        <div class="schedule-time-dosage">
                            <div class="form-group">
                                <label for="schedule-time">Время <span style="color: var(--health-danger);">*</span></label>
                                <input
                                    type="time"
                                    id="schedule-time"
                                    class="modal-input"
                                    value="08:00"
                                    required
                                >
                            </div>

                            <div class="form-group">
                                <label for="schedule-reminder">Напомнить за (минут)</label>
                                <select id="schedule-reminder" class="modal-input">
                                    <option value="0">Не напоминать</option>
                                    <option value="5">5 минут</option>
                                    <option value="10" selected>10 минут</option>
                                    <option value="15">15 минут</option>
                                    <option value="30">30 минут</option>
                                    <option value="60">1 час</option>
                                    <option value="120">2 часа</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="schedule-dosage">Количество</label>
                                <div class="quantity-input-group">
                                    <button
                                        type="button"
                                        class="quantity-btn"
                                        onclick="MedicationFormModal.changeScheduleDosage(-0.5)"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        id="schedule-dosage"
                                        class="modal-input quantity-input"
                                        value="1"
                                        min="0.5"
                                        step="0.5"
                                    >
                                    <button
                                        type="button"
                                        class="quantity-btn"
                                        onclick="MedicationFormModal.changeScheduleDosage(0.5)"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            class="health-btn btn-primary"
                            onclick="MedicationFormModal.addSchedule()"
                        >
                            ✓ Добавить
                        </button>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="MedicationFormModal.prevStep()">
                        ← Назад
                    </button>
                    <button class="health-btn btn-primary" onclick="MedicationFormModal.save()">
                        💾 Сохранить
                    </button>
                </div>
            </div>
        `;
    }

    function renderScheduleItem(schedule, index) {
        const daysLabels = schedule.days_of_week
            .sort((a, b) => a - b)
            .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label || d)
            .join(', ');

        const unitInfo = QUANTITY_UNITS.find(u => u.value === formData.quantity_unit) || QUANTITY_UNITS[0];

        return `
            <div class="schedule-item">
                <div class="schedule-item-content">
                    <div class="schedule-time">
                        <span class="time-icon">⏰</span>
                        <span class="time-value">${schedule.time_of_day}</span>
                    </div>
                    <div class="schedule-days">${daysLabels}</div>
                    <div class="schedule-dosage">
                        ${schedule.dosage_amount} ${unitInfo.label.toLowerCase()}
                    </div>
                </div>
                <button
                    type="button"
                    class="schedule-item-delete"
                    onclick="MedicationFormModal.removeSchedule(${index})"
                    title="Удалить"
                >
                    🗑️
                </button>
            </div>
        `;
    }

    function renderStockPreview() {
        const { quantity_available, quantity_threshold } = formData;
        const diff = quantity_available - quantity_threshold;

        if (diff > 0) {
            return `
                <div class="stock-status stock-ok">
                    <span class="stock-icon">✅</span>
                    <div class="stock-text">
                        <div class="stock-main">Запас в норме</div>
                        <div class="stock-detail">Осталось ${diff} до уведомления</div>
                    </div>
                </div>
            `;
        } else if (diff === 0) {
            return `
                <div class="stock-status stock-warning">
                    <span class="stock-icon">⚠️</span>
                    <div class="stock-text">
                        <div class="stock-main">Пора пополнить</div>
                        <div class="stock-detail">Достигнут порог уведомления</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="stock-status stock-low">
                    <span class="stock-icon">🔴</span>
                    <div class="stock-text">
                        <div class="stock-main">Низкий остаток!</div>
                        <div class="stock-detail">Ниже порога на ${Math.abs(diff)}</div>
                    </div>
                </div>
            `;
        }
    }

    function initStepHandlers(step) {
        setTimeout(() => {
            const firstInput = document.querySelector('.modal-input');
            if (firstInput && step === 1) {
                firstInput.focus();
            }
        }, 100);
    }

    function nextStep() {
        if (!validateStep(currentStep)) {
            return;
        }

        saveStepData(currentStep);
        currentStep++;
        renderStep(currentStep);
    }

    function prevStep() {
        saveStepData(currentStep);
        currentStep--;
        renderStep(currentStep);
    }

    function validateStep(step) {
        switch(step) {
            case 1:
                const name = document.getElementById('medication-name')?.value.trim();
                if (!name) {
                    showToast('⚠️ Укажите название лекарства', 'warning');
                    return false;
                }
                return true;

            case 2:
                const intakeType = formData.intake_type;
                if (intakeType === 'курсом') {
                    const endDate = document.getElementById('medication-end-date')?.value;
                    if (!endDate) {
                        showToast('⚠️ Укажите дату окончания курса', 'warning');
                        return false;
                    }

                    const startDate = document.getElementById('medication-start-date')?.value;
                    if (endDate <= startDate) {
                        showToast('⚠️ Дата окончания должна быть позже начала', 'warning');
                        return false;
                    }
                }
                return true;

            case 3:
                const available = parseInt(document.getElementById('medication-quantity-available')?.value || 0);
                const threshold = parseInt(document.getElementById('medication-quantity-threshold')?.value || 0);

                if (available < 0 || threshold < 0) {
                    showToast('⚠️ Количество не может быть отрицательным', 'warning');
                    return false;
                }
                return true;

            case 4:
                if (formData.schedules.length === 0) {
                    showToast('⚠️ Добавьте хотя бы одно время приёма', 'warning');
                    return false;
                }
                return true;

            default:
                return true;
        }
    }

    function saveStepData(step) {
        switch(step) {
            case 1:
                formData.name = document.getElementById('medication-name')?.value.trim() || '';
                formData.dosage = document.getElementById('medication-dosage')?.value.trim() || '';
                formData.form = document.getElementById('medication-form')?.value || 'таблетки';
                formData.instructions = document.getElementById('medication-instructions')?.value.trim() || '';
                break;

            case 2:
                formData.start_date = document.getElementById('medication-start-date')?.value || null;
                if (formData.intake_type === 'курсом') {
                    formData.end_date = document.getElementById('medication-end-date')?.value || null;
                } else {
                    formData.end_date = null;
                }
                break;

            case 3:
                formData.quantity_available = parseInt(document.getElementById('medication-quantity-available')?.value || 0);
                formData.quantity_threshold = parseInt(document.getElementById('medication-quantity-threshold')?.value || 5);
                break;
        }

        console.log('📝 Данные шага сохранены:', formData);
    }

    function selectIntakeType(type) {
        formData.intake_type = type;
        renderStep(2);
    }

    function selectQuantityUnit(unit) {
        formData.quantity_unit = unit;
        renderStep(3);
    }

    function changeQuantity(type, delta) {
        const inputId = type === 'available'
            ? 'medication-quantity-available'
            : 'medication-quantity-threshold';

        const input = document.getElementById(inputId);
        if (!input) return;

        const currentValue = parseInt(input.value || 0);
        const newValue = Math.max(0, currentValue + delta);

        input.value = newValue;

        if (type === 'available') {
            formData.quantity_available = newValue;
        } else {
            formData.quantity_threshold = newValue;
        }

        const previewElement = document.querySelector('.stock-preview-body');
        if (previewElement) {
            previewElement.innerHTML = renderStockPreview();
        }
    }

    // ==================== РАСПИСАНИЕ ====================

    let tempSchedule = {
        days_of_week: [],
        time_of_day: '08:00',
        dosage_amount: 1.0,
        reminder_minutes: 10
    };

    function showScheduleForm() {
        // Сбрасываем временное расписание
        tempSchedule = {
            days_of_week: [],
            time_of_day: '08:00',
            dosage_amount: 1.0
        };

        const form = document.getElementById('schedule-form');
        if (form) {
            form.style.display = 'block';

            // Очищаем выбранные дни
            document.querySelectorAll('.day-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Сбрасываем поля
            document.getElementById('schedule-time').value = '08:00';
            document.getElementById('schedule-dosage').value = '1';
        }
    }

    function hideScheduleForm() {
        const form = document.getElementById('schedule-form');
        if (form) {
            form.style.display = 'none';
        }
    }

    function toggleDay(dayValue) {
        const btn = document.querySelector(`.day-btn[data-day="${dayValue}"]`);
        if (!btn) return;

        const index = tempSchedule.days_of_week.indexOf(dayValue);
        if (index > -1) {
            tempSchedule.days_of_week.splice(index, 1);
            btn.classList.remove('active');
        } else {
            tempSchedule.days_of_week.push(dayValue);
            btn.classList.add('active');
        }
    }

    function selectAllDays() {
        tempSchedule.days_of_week = [0, 1, 2, 3, 4, 5, 6];
        document.querySelectorAll('.day-btn').forEach(btn => btn.classList.add('active'));
    }

    function selectWeekdays() {
        tempSchedule.days_of_week = [0, 1, 2, 3, 4];  // Было [1, 2, 3, 4, 5]
        document.querySelectorAll('.day-btn').forEach(btn => {
            const day = parseInt(btn.dataset.day);
            btn.classList.toggle('active', day >= 0 && day <= 4);  // Было day >= 1 && day <= 5
        });
    }

    function selectWeekends() {
        tempSchedule.days_of_week = [5, 6];  // Было [0, 6]
        document.querySelectorAll('.day-btn').forEach(btn => {
            const day = parseInt(btn.dataset.day);
            btn.classList.toggle('active', day === 5 || day === 6);  // Было day === 0 || day === 6
        });
    }

    function clearDays() {
        tempSchedule.days_of_week = [];
        document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
    }

    function changeScheduleDosage(delta) {
        const input = document.getElementById('schedule-dosage');
        if (!input) return;

        const currentValue = parseFloat(input.value || 1);
        const newValue = Math.max(0.5, currentValue + delta);

        input.value = newValue;
        tempSchedule.dosage_amount = newValue;
    }

    function addSchedule() {
        // Валидация
        if (tempSchedule.days_of_week.length === 0) {
            showToast('⚠️ Выберите хотя бы один день недели', 'warning');
            return;
        }

        const timeInput = document.getElementById('schedule-time');
        if (!timeInput || !timeInput.value) {
            showToast('⚠️ Укажите время приёма', 'warning');
            return;
        }

        const dosageInput = document.getElementById('schedule-dosage');
        const dosage = parseFloat(dosageInput?.value || 1);

        if (dosage <= 0) {
            showToast('⚠️ Количество должно быть больше нуля', 'warning');
            return;
        }

        // Добавляем расписание
        const reminderInput = document.getElementById('schedule-reminder');
        const reminderMinutes = parseInt(reminderInput?.value || 10);

        formData.schedules.push({
            days_of_week: [...tempSchedule.days_of_week].sort((a, b) => a - b),
            time_of_day: timeInput.value,
            dosage_amount: dosage,
            reminder_minutes: reminderMinutes,
            is_active: true
        });

        console.log('✅ Расписание добавлено:', formData.schedules);

        // Закрываем форму и обновляем список
        hideScheduleForm();
        renderStep(4);

        showToast('✅ Время приёма добавлено', 'success');
    }

    function removeSchedule(index) {
        formData.schedules.splice(index, 1);
        renderStep(4);
        showToast('🗑️ Расписание удалено', 'info');
    }

    async function save() {
        console.log('💾 Сохранение лекарства:', formData);

        if (!validateStep(currentStep)) {
            return;
        }

        saveStepData(currentStep);

        try {
            const medicationData = {
                name: formData.name,
                dosage: formData.dosage || null,
                form: formData.form || null,
                instructions: formData.instructions || null,
                intake_type: formData.intake_type,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                quantity_available: formData.quantity_available,
                quantity_threshold: formData.quantity_threshold,
                quantity_unit: formData.quantity_unit,
                schedules: formData.schedules.map(s => ({
                    days_of_week: s.days_of_week,
                    time_of_day: s.time_of_day,
                    dosage_amount: s.dosage_amount,
                    reminder_minutes: s.reminder_minutes,
                    is_active: s.is_active !== false
                }))
            };

            console.log('📤 Отправка на сервер:', medicationData);

            let result;
            if (medicationId) {
                // РЕДАКТИРОВАНИЕ существующего лекарства

                // 1. Обновляем основную информацию (без расписаний)
                result = await HealthAPI.updateMedication(medicationId, medicationData);

                if (!result.success) {
                    throw new Error(result.error || 'Ошибка обновления лекарства');
                }

                // 2. Обновляем расписания
                const scheduleErrors = [];
                for (const schedule of formData.schedules) {
                    if (schedule.id) {
                        // Существующее расписание - обновляем
                        const scheduleResult = await HealthAPI.updateMedicationSchedule(
                            medicationId,
                            schedule.id,
                            {
                                time_of_day: schedule.time_of_day,
                                days_of_week: schedule.days_of_week,
                                dosage_amount: schedule.dosage_amount,
                                reminder_minutes: schedule.reminder_minutes,
                                is_active: schedule.is_active !== false
                            }
                        );

                        if (!scheduleResult.success) {
                            scheduleErrors.push(`Расписание ${schedule.time_of_day}: ${scheduleResult.error}`);
                        }
                    }
                    // Новые расписания (без id) игнорируем - они не будут созданы
                    // Для создания новых расписаний нужен отдельный POST endpoint
                }

                if (scheduleErrors.length > 0) {
                    console.warn('⚠️ Ошибки обновления расписаний:', scheduleErrors);
                    showToast('✅ Лекарство обновлено, но есть проблемы с расписаниями', 'warning');
                } else {
                    showToast('✅ Лекарство обновлено', 'success');
                }

            } else {
                // СОЗДАНИЕ нового лекарства (с расписаниями)
                result = await HealthAPI.createMedication(medicationData);
                if (result.success) {
                    showToast('✅ Лекарство добавлено', 'success');
                }
            }

            if (result.success) {
                close();
                await HealthModule.refreshData();

                if (window.Medications && window.Medications.init) {
                    Medications.init();
                }
            } else {
                throw new Error(result.error || 'Ошибка сохранения');
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения лекарства:', error);
            showToast('❌ Не удалось сохранить: ' + error.message, 'error');
        }
    }

    function close() {
        BaseModal.close();
        resetFormData();
        currentStep = 1;
        medicationId = null;
        tempSchedule = { days_of_week: [], time_of_day: '08:00', dosage_amount: 1.0 };
    }

    // Публичный API
    return {
        show,
        close,
        nextStep,
        prevStep,
        selectIntakeType,
        selectQuantityUnit,
        changeQuantity,
        showScheduleForm,
        hideScheduleForm,
        toggleDay,
        selectAllDays,
        selectWeekdays,
        selectWeekends,
        clearDays,
        changeScheduleDosage,
        addSchedule,
        removeSchedule,
        save
    };
})();

if (typeof window !== 'undefined') {
    window.MedicationFormModal = MedicationFormModal;
}

console.log('✅ MedicationFormModal загружен (4 шага + расписание)');