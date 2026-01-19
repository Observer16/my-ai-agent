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
    let editingScheduleIndex = null;
    let scheduleTimePicker = null;  // TimePicker для выбора времени приёма

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

    // Маппинг: форма выпуска → единица измерения
    const FORM_TO_UNIT_MAP = {
        'таблетки': 'таблетки',
        'капсулы': 'капсулы',
        'сироп': 'мл',
        'раствор': 'мл',
        'мазь': 'мл',
        'крем': 'мл',
        'капли': 'капли',
        'спрей': 'дозы',
        'порошок': 'штуки',
        'другое': 'штуки'
    };

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

                console.log(' Данные лекарства загружены:', formData);
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
                content = `<p>${t('health.modals.medication.error_unknown_step')}</p>`;
        }

        const title = medicationId ? t('health.modals.medication.edit_title') : t('health.modals.medication.add_title');
        const modalHtml = BaseModal.createModalStructure(title, content, 'large');
        BaseModal.show(modalHtml);

        initStepHandlers(step);
    }

    function renderStepIndicator(currentStep) {
        return `
            <div class="step-indicator">
                ${renderStepItem(1, t('health.modals.medication.step1_title'), currentStep)}
                <div class="step-line"></div>
                ${renderStepItem(2, t('health.modals.medication.step2_title'), currentStep)}
                <div class="step-line"></div>
                ${renderStepItem(3, t('health.modals.medication.step3_title'), currentStep)}
                <div class="step-line"></div>
                ${renderStepItem(4, t('health.modals.medication.step4_title'), currentStep)}
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
                            ${t('health.modals.medication.field_name_label')} <span style="color: var(--health-danger);">*</span>
                        </label>
                        <input
                            type="text"
                            id="medication-name"
                            class="modal-input"
                            value="${formData.name}"
                            placeholder="${t('health.modals.medication.field_name_placeholder')}"
                            required
                            autofocus
                        >
                    </div>
                    <div class="form-group">
                        <label for="medication-dosage">${t('health.modals.medication.field_dosage_label')}</label>
                        <input
                            type="text"
                            id="medication-dosage"
                            class="modal-input"
                            value="${formData.dosage}"
                            placeholder="Например: 1000 МЕ"
                        >
                        <div class="form-hint">${t('health.modals.medication.field_dosage_hint')}</div>
                    </div>
                    <div class="form-group">
                        <label for="medication-form">${t('health.modals.medication.field_form_label')}</label>
                        <select id="medication-form" class="modal-input">
                            ${FORM_OPTIONS.map(option => `
                                <option value="${option}" ${formData.form === option ? 'selected' : ''}>
                                    ${t(`health.medications.forms.${option}`) || option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="medication-instructions">${t('health.modals.medication.field_instructions_label')}</label>
                        <textarea
                            id="medication-instructions"
                            class="modal-input"
                            rows="3"
                            placeholder="Например: Принимать во время еды, запивая водой"
                        >${formData.instructions}</textarea>
                        <div class="form-hint">${t('health.modals.medication.field_instructions_hint')}</div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="MedicationFormModal.close()">
                        ${t('health.common.cancel')}
                    </button>
                    <button class="health-btn btn-primary" onclick="MedicationFormModal.nextStep()">
                        ${t('health.modals.medication.btn_next')}
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
                        <label>${t('health.modals.medication.field_intake_type_label')} <span style="color: var(--health-danger);">*</span></label>
                        <div class="intake-type-selector">
                            <button
                                class="intake-type-btn ${!isCourse ? 'active' : ''}"
                                onclick="MedicationFormModal.selectIntakeType('постоянно')"
                            >
                                <span class="intake-icon">🔄</span>
                                <div class="intake-details">
                                    <div class="intake-label">${t('health.modals.medication.intake_type_continuous')}</div>
                                    <div class="intake-description">Принимаю регулярно</div>
                                </div>
                            </button>
                            <button
                                class="intake-type-btn ${isCourse ? 'active' : ''}"
                                onclick="MedicationFormModal.selectIntakeType('курсом')"
                            >
                                <span class="intake-icon">📅</span>
                                <div class="intake-details">
                                    <div class="intake-label">${t('health.modals.medication.intake_type_course')}</div>
                                    <div class="intake-description">Ограниченный период</div>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="medication-start-date">${t('health.modals.medication.field_start_date_label')}</label>
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
                                ${t('health.modals.medication.field_end_date_label')} <span style="color: var(--health-danger);">*</span>
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
                        ${t('health.modals.medication.btn_back')}
                    </button>
                    <button class="health-btn btn-primary" onclick="MedicationFormModal.nextStep()">
                        ${t('health.modals.medication.btn_next')}
                    </button>
                </div>
            </div>
        `;
    }

    function renderStep3() {
        // Автоматически устанавливаем единицу измерения на основе формы выпуска
        const autoUnit = FORM_TO_UNIT_MAP[formData.form] || 'таблетки';
        formData.quantity_unit = autoUnit;

        const selectedUnit = formData.quantity_unit;
        const unitInfo = QUANTITY_UNITS.find(u => u.value === selectedUnit) || QUANTITY_UNITS[0];

        return `
            <div class="medication-form-step">
                ${renderStepIndicator(3)}
                <div class="form-content">
                    <div class="form-group">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                            <span class="quantity-unit-label" style="font-weight: 600; color: var(--health-text);">
                                ${unitInfo.label}
                            </span>
                            <div class="form-hint" style="margin: 0; text-align: right; flex: 1;">
                                ${t('health.modals.medication.field_quantity_available_hint')}
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="medication-quantity-available">
                            ${t('health.modals.medication.field_quantity_available_label')}
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
                    </div>
                    <div class="form-group">
                        <label for="medication-quantity-threshold">
                            ${t('health.modals.medication.field_quantity_threshold_label')}
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
                                ? '💡 ' + t('health.modals.medication.info_threshold_continuous')
                                : '⚠️ ' + t('health.modals.medication.info_threshold_course_only')}
                        </div>
                    </div>
                    ${formData.intake_type === 'постоянно' && formData.quantity_available > 0 ? `
                        <div class="stock-preview">
                            <div class="stock-preview-header">
                                <span>📊 ${t('health.modals.medication.stock_preview_title')}</span>
                            </div>
                            <div class="stock-preview-body">
                                ${renderStockPreview()}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="MedicationFormModal.prevStep()">
                        ${t('health.modals.medication.btn_back')}
                    </button>
                    <button class="health-btn btn-primary" onclick="MedicationFormModal.nextStep()">
                        ${t('health.modals.medication.btn_next')}
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
                        <label>${t('health.modals.medication.field_schedule_label')}</label>
                        <div class="form-hint">${t('health.modals.medication.field_schedule_hint')}</div>
                    </div>

                    <!-- Контейнер для расписаний и формы -->
                    <div style="position: relative; display: flex; flex-direction: column;">
                        <!-- Список расписаний -->
                        <div id="schedules-list" class="schedules-list">
                            ${formData.schedules.length === 0 ? `
                                <div class="empty-schedules">
                                    <span class="empty-icon">📅</span>
                                    <div class="empty-text">${t('health.modals.medication.empty_schedules_text')}</div>
                                    <div class="empty-hint">${t('health.modals.medication.empty_schedules_hint')}</div>
                                </div>
                            ` : formData.schedules.map((schedule, index) => renderScheduleItem(schedule, index)).join('')}
                        </div>

                        <!-- Кнопка добавления -->
                        <button
                            type="button"
                            class="health-btn btn-secondary add-schedule-btn"
                            onclick="MedicationFormModal.showScheduleForm()"
                        >
                            <span>➕</span> ${t('health.modals.medication.btn_add_time_label')}
                        </button>

                        <!-- Форма добавления (скрыта по умолчанию) -->
                        <div id="schedule-form" class="schedule-form" style="display: none;">
                        <div class="schedule-form-header">
                            <span>➕ ${t('health.modals.medication.schedule_form_header')}</span>
                            <button
                                type="button"
                                class="close-schedule-form-btn"
                                onclick="MedicationFormModal.hideScheduleForm()"
                            >
                                ✕
                            </button>
                        </div>

                        <div class="form-group">
                            <label>${t('health.modals.medication.schedule_days_label')} <span style="color: var(--health-danger);">*</span></label>
                            <div class="days-selector">
                                ${DAYS_OF_WEEK.map(day => `
                                    <button
                                        type="button"
                                        class="day-btn"
                                        data-day="${day.value}"
                                        onclick="MedicationFormModal.toggleDay(${day.value})"
                                    >
                                        ${t(`health.modals.medication.day_${['mon_short', 'tue_short', 'wed_short', 'thu_short', 'fri_short', 'sat_short', 'sun_short'][day.value]}`)}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="quick-select-days">
                                <button type="button" class="quick-btn" onclick="MedicationFormModal.selectAllDays()">${t('health.modals.medication.btn_quick_all_days')}</button>
                                <button type="button" class="quick-btn" onclick="MedicationFormModal.selectWeekdays()">${t('health.modals.medication.btn_quick_weekdays')}</button>
                                <button type="button" class="quick-btn" onclick="MedicationFormModal.selectWeekends()">${t('health.modals.medication.btn_quick_weekends')}</button>
                                <button type="button" class="quick-btn" onclick="MedicationFormModal.clearDays()">${t('health.modals.medication.btn_quick_clear')}</button>
                            </div>
                        </div>

                        <div class="schedule-time-dosage">
                            <div class="form-group">
                                <label>${t('health.modals.medication.schedule_time_label')} <span style="color: var(--health-danger);">*</span></label>
                                <div id="schedule-time-picker-container"></div>
                            </div>
                            <div class="form-group">
                                <label for="schedule-dosage">${t('health.modals.medication.schedule_dosage_label')}</label>
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

                            <!-- Частичный приём лекарства -->
                            <div class="form-group partial-dose-container">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input
                                        type="checkbox"
                                        id="schedule-partial-dose-checkbox"
                                        onchange="MedicationFormModal.togglePartialDose()"
                                        style="width: 18px; height: 18px; cursor: pointer;"
                                    >
                                    <span>${t('health.modals.medication.partial_dose_label')}</span>
                                </label>
                            </div>

                            <!-- Выпадающее меню с вариантами фракций (скрыто по умолчанию) -->
                            <div id="fraction-selector-container" class="fraction-selector" style="display: none;">
                                <label for="schedule-fraction">${t('health.modals.medication.fraction_label')}</label>
                                <select
                                    id="schedule-fraction"
                                    class="modal-input"
                                    onchange="MedicationFormModal.changeFraction(this.value)"
                                >
                                    <option value="0">${t('health.modals.medication.fraction_half')}</option>
                                    <option value="0.33">${t('health.modals.medication.fraction_third')}</option>
                                    <option value="0.25">${t('health.modals.medication.fraction_quarter')}</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="button"
                            class="health-btn btn-primary"
                            onclick="MedicationFormModal.addSchedule()"
                        >
                            ✓ ${t('health.modals.medication.btn_add_schedule')}
                        </button>
                    </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="MedicationFormModal.prevStep()">
                        ${t('health.modals.medication.btn_back')}
                    </button>
                    <button class="health-btn btn-primary" onclick="MedicationFormModal.save()">
                        💾 ${t('health.common.save')}
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
        const reminderText = schedule.reminder_minutes === 0 ? 'без напоминания' : `за ${schedule.reminder_minutes} мин`;

        // Рассчитываем фактическую дозу
        const actualDose = schedule.dosage_amount + (schedule.dosage_fraction || 0.0);
        const dosageDisplay = actualDose === parseInt(actualDose)
            ? actualDose.toFixed(0)
            : actualDose.toFixed(2);

        // Формируем информацию о фракции если она есть
        const fractionInfo = schedule.dosage_fraction ?
            `<div class="schedule-fraction" style="font-size: 12px; color: var(--health-text-light);">
                🔹 ${schedule.dosage_amount} + ${(schedule.dosage_fraction * 100).toFixed(0)}% = ${dosageDisplay} ${unitInfo.label.toLowerCase()}
            </div>` : '';

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
                    ${fractionInfo}
                    <div class="schedule-reminder" style="font-size: 12px; color: var(--health-text-light);">
                        🔔 ${reminderText}
                    </div>
                </div>
                <div class="schedule-item-actions">
                    <button
                        type="button"
                        class="schedule-item-edit"
                        onclick="MedicationFormModal.editSchedule(${index})"
                        title="Редактировать"
                    >
                        ✏️
                    </button>
                    <button
                        type="button"
                        class="schedule-item-delete"
                        onclick="MedicationFormModal.removeSchedule(${index})"
                        title="Удалить"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    function renderStockPreview() {
        const { quantity_available, quantity_threshold, intake_type } = formData;
        const diff = quantity_available - quantity_threshold;

        // ==================== РАСЧЕТ ДНЕЙ REMAINING ====================
        let daysRemainingText = '';

        if (formData.schedules && formData.schedules.length > 0 && intake_type === 'постоянно') {
            // Суммируем среднедневное потребление по всем расписаниям
            const dailyConsumption = formData.schedules.reduce((sum, schedule) => {
                if (schedule.is_active !== false) {
                    const daysPerWeek = schedule.days_of_week.length;
                    const dosePerIntake = (schedule.dosage_amount || 1.0) + (schedule.dosage_fraction || 0.0);
                    return sum + (dosePerIntake * daysPerWeek / 7);
                }
                return sum;
            }, 0);

            if (dailyConsumption > 0) {
                const daysRemaining = Math.floor(quantity_available / dailyConsumption);
                if (daysRemaining > 0) {
                    daysRemainingText = `<div class="stock-days-remaining" style="font-size: 12px; color: var(--health-text-light); margin-top: 6px;">
                        📊 ${t('health.modals.medication.stock_days_remaining', { days: daysRemaining })}
                    </div>`;
                }
            }
        }

        // ==================== КОНЕЦ РАСЧЕТА ====================

        if (diff > 0) {
            return `
                <div class="stock-status stock-ok">
                    <span class="stock-icon">✅</span>
                    <div class="stock-text">
                        <div class="stock-main">Запас в норме</div>
                        <div class="stock-detail">Осталось ${diff} до уведомления</div>
                        ${daysRemainingText}
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
                        ${daysRemainingText}
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
                        ${daysRemainingText}
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
                    showToast(t('health.modals.medication.error_name_required'), 'warning');
                    return false;
                }
                return true;

            case 2:
                const intakeType = formData.intake_type;
                if (intakeType === 'курсом') {
                    const endDate = document.getElementById('medication-end-date')?.value;
                    if (!endDate) {
                        showToast(t('health.modals.medication.error_end_date_required'), 'warning');
                        return false;
                    }

                    const startDate = document.getElementById('medication-start-date')?.value;
                    if (endDate <= startDate) {
                        showToast(t('health.modals.medication.error_end_date_after_start'), 'warning');
                        return false;
                    }
                }
                return true;

            case 3:
                const available = parseInt(document.getElementById('medication-quantity-available')?.value || 0);
                const threshold = parseInt(document.getElementById('medication-quantity-threshold')?.value || 0);

                if (available < 0 || threshold < 0) {
                    showToast(t('health.modals.medication.error_quantity_negative'), 'warning');
                    return false;
                }
                return true;

            case 4:
                if (formData.schedules.length === 0) {
                    showToast(t('health.modals.medication.error_schedule_required'), 'warning');
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
        dosage_fraction: 0.0,
        reminder_minutes: 10
    };

    function editSchedule(index) {
        console.log('✏️ Редактирование расписания:', index);

        editingScheduleIndex = index;
        const schedule = formData.schedules[index];

        // Заполняем форму данными редактируемого расписания
        tempSchedule = {
            days_of_week: [...schedule.days_of_week],
            time_of_day: schedule.time_of_day,
            dosage_amount: schedule.dosage_amount,
            dosage_fraction: schedule.dosage_fraction || 0.0,
            reminder_minutes: schedule.reminder_minutes || 10
        };

        const form = document.getElementById('schedule-form');
        if (form) {
            form.style.display = 'block';

            // Устанавливаем выбранные дни
            document.querySelectorAll('.day-btn').forEach(btn => {
                const day = parseInt(btn.dataset.day);
                if (tempSchedule.days_of_week.includes(day)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Заполняем поля
            document.getElementById('schedule-dosage').value = schedule.dosage_amount;
            document.getElementById('schedule-reminder').value = schedule.reminder_minutes || 10;

            // Устанавливаем частичный приём если есть фракция
            const partialCheckbox = document.getElementById('schedule-partial-dose-checkbox');
            const fractionSelect = document.getElementById('schedule-fraction');
            if (schedule.dosage_fraction && schedule.dosage_fraction > 0) {
                partialCheckbox.checked = true;
                document.getElementById('schedule-dosage').step = '1';
                document.getElementById('schedule-dosage').min = '0';
                if (fractionSelect) {
                    fractionSelect.value = schedule.dosage_fraction.toString();
                    document.getElementById('fraction-selector-container').style.display = 'block';
                }
            } else {
                partialCheckbox.checked = false;
                document.getElementById('schedule-dosage').step = '0.5';
                document.getElementById('schedule-dosage').min = '0.5';
                document.getElementById('fraction-selector-container').style.display = 'none';
            }

            // Инициализируем TimePicker с существующим временем
            const pickerContainer = document.getElementById('schedule-time-picker-container');
            if (pickerContainer && typeof TimePicker !== 'undefined') {
                // Парсим время из schedule.time_of_day (формат "HH:MM")
                const timeParts = schedule.time_of_day.split(':');
                const hours = parseInt(timeParts[0]) || 8;
                const minutes = parseInt(timeParts[1]) || 0;

                // Удаляем старый пикер если существует
                if (scheduleTimePicker) {
                    scheduleTimePicker.destroy();
                }

                // Создаём новый TimePicker с существующим временем
                scheduleTimePicker = new TimePicker(pickerContainer, {
                    initialHours: hours,
                    initialMinutes: minutes,
                    hoursLabel: 'ч',
                    minutesLabel: 'мин',
                    format24h: true,
                    minuteStep: 1,
                    onTimeSelect: (h, m) => {
                        tempSchedule.time_of_day = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    }
                });
            }

            // Меняем текст кнопки
            const addButton = form.querySelector('.health-btn.btn-primary');
            if (addButton) {
                addButton.textContent = '✓ ' + t('health.modals.medication.button_save_changes');
            }
        }
    }

    function showScheduleForm() {
        // Сбрасываем индекс редактирования
        editingScheduleIndex = null;
        tempSchedule = {
            days_of_week: [],
            time_of_day: '08:00',
            dosage_amount: 1.0,
            dosage_fraction: 0.0
        };

        const form = document.getElementById('schedule-form');
        if (form) {
            form.style.display = 'block';

            // Очищаем выбранные дни
            document.querySelectorAll('.day-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Сбрасываем поля
            document.getElementById('schedule-dosage').value = '1';

            // Инициализируем TimePicker
            const pickerContainer = document.getElementById('schedule-time-picker-container');
            if (pickerContainer && typeof TimePicker !== 'undefined') {
                // Удаляем старый пикер если существует
                if (scheduleTimePicker) {
                    scheduleTimePicker.destroy();
                }

                // Создаём новый TimePicker
                scheduleTimePicker = new TimePicker(pickerContainer, {
                    initialHours: 8,
                    initialMinutes: 0,
                    hoursLabel: 'ч',
                    minutesLabel: 'мин',
                    format24h: true,
                    minuteStep: 1,
                    onTimeSelect: (hours, minutes) => {
                        tempSchedule.time_of_day = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                        console.log('⏰ Время выбрано:', tempSchedule.time_of_day);
                    }
                });
            }

            // Меняем текст кнопки на "Добавить время"
            const addButton = form.querySelector('.health-btn.btn-primary');
            if (addButton) {
                addButton.textContent = '➕ ' + t('health.modals.medication.btn_add_time_label');
            }
        }
    }

    function hideScheduleForm() {
        const form = document.getElementById('schedule-form');
        if (form) {
            form.style.display = 'none';

            // Сбрасываем текст кнопки
            const addButton = form.querySelector('.health-btn.btn-primary');
            if (addButton) {
                addButton.textContent = '+ Добавить время';
            }
        }

        // Сбрасываем индекс редактирования
        editingScheduleIndex = null;
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
            showToast(t('health.modals.medication.error_days_required'), 'warning');
            return;
        }

        // Проверяем что время установлено
        if (!tempSchedule.time_of_day || tempSchedule.time_of_day === '') {
            showToast(t('health.modals.medication.error_time_required'), 'warning');
            return;
        }

        const dosageInput = document.getElementById('schedule-dosage');
        const dosage = parseFloat(dosageInput?.value || 1);

        if (dosage <= 0) {
            showToast(t('health.modals.medication.error_quantity_zero'), 'warning');
            return;
        }

        const reminderInput = document.getElementById('schedule-reminder');
        const reminderMinutes = parseInt(reminderInput?.value || 10);

        if (editingScheduleIndex !== null) {
            // РЕДАКТИРОВАНИЕ существующего расписания
            formData.schedules[editingScheduleIndex] = {
                ...formData.schedules[editingScheduleIndex], // Сохраняем id если есть
                days_of_week: [...tempSchedule.days_of_week].sort((a, b) => a - b),
                time_of_day: tempSchedule.time_of_day,
                dosage_amount: dosage,
                dosage_fraction: tempSchedule.dosage_fraction || 0.0,
                reminder_minutes: reminderMinutes,
                is_active: true
            };
            console.log('✅ Расписание обновлено:', formData.schedules[editingScheduleIndex]);
            showToast(t('health.modals.medication.success_schedule_updated'), 'success');
            editingScheduleIndex = null;
        } else {
            // ДОБАВЛЕНИЕ нового расписания
            formData.schedules.push({
                days_of_week: [...tempSchedule.days_of_week].sort((a, b) => a - b),
                time_of_day: tempSchedule.time_of_day,
                dosage_amount: dosage,
                dosage_fraction: tempSchedule.dosage_fraction || 0.0,
                reminder_minutes: reminderMinutes,
                is_active: true
            });
            console.log('➕ Расписание добавлено:', formData.schedules);
            showToast(t('health.modals.medication.success_schedule_added'), 'success');
        }

        // Закрываем форму и обновляем список
        hideScheduleForm();
        renderStep(4);
    }

    function removeSchedule(index) {
        formData.schedules.splice(index, 1);
        renderStep(4);
        showToast(t('health.modals.medication.success_schedule_deleted'), 'info');
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
                    dosage_fraction: s.dosage_fraction || 0.0,
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
                                dosage_fraction: schedule.dosage_fraction || 0.0,
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
                    showToast(t('health.modals.medication.success_update_with_warnings'), 'warning');
                } else {
                    showToast(t('health.modals.medication.success_updated'), 'success');
                }

            } else {
                // СОЗДАНИЕ нового лекарства (с расписаниями)
                result = await HealthAPI.createMedication(medicationData);
                if (result.success) {
                    showToast(t('health.modals.medication.success_created'), 'success');
                }
            }

            if (result.success) {
                close();
                await HealthModule.refreshData();

                if (window.Medications && window.Medications.init) {
                    Medications.init();
                }
            } else {
                throw new Error(result.error || t('health.modals.medication.error_save_generic'));
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения лекарства:', error);
            showToast(t('health.modals.medication.error_save') + error.message, 'error');
        }
    }

    function close() {
        BaseModal.close();
        resetFormData();
        currentStep = 1;
        medicationId = null;
        tempSchedule = { days_of_week: [], time_of_day: '08:00', dosage_amount: 1.0, dosage_fraction: 0.0 };
    }

    // ==================== ЧАСТИЧНЫЙ ПРИЁМ (НОВОЕ) ====================

    function togglePartialDose() {
        const checkbox = document.getElementById('schedule-partial-dose-checkbox');
        const fractionContainer = document.getElementById('fraction-selector-container');
        const dosageInput = document.getElementById('schedule-dosage');

        if (checkbox.checked) {
            // Включаем частичный приём
            fractionContainer.style.display = 'block';
            // Меняем шаг на 1 (только целые числа)
            dosageInput.step = '1';
            dosageInput.min = '0';
            dosageInput.value = Math.max(0, parseInt(dosageInput.value));
            tempSchedule.dosage_fraction = 0.5;  // По умолчанию половина
        } else {
            // Отключаем частичный приём
            fractionContainer.style.display = 'none';
            // Меняем шаг обратно на 0.5 (дробные значения)
            dosageInput.step = '0.5';
            dosageInput.min = '0.5';
            tempSchedule.dosage_fraction = 0.0;
            // Если значение меньше 0.5, устанавливаем 0.5
            if (parseFloat(dosageInput.value) < 0.5) {
                dosageInput.value = 0.5;
            }
        }
    }

    function changeFraction(value) {
        tempSchedule.dosage_fraction = parseFloat(value);
        console.log('✅ Фракция изменена:', tempSchedule.dosage_fraction);
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
        togglePartialDose,
        changeFraction,
        addSchedule,
        editSchedule,
        removeSchedule,
        save
    };
})();

if (typeof window !== 'undefined') {
    window.MedicationFormModal = MedicationFormModal;
}

console.log('✅ MedicationFormModal загружен (4 шага + расписание)');