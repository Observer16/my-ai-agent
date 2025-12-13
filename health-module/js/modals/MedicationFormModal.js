// js/modals/MedicationFormModal.js
const MedicationFormModal = (function() {
    let currentStep = 1;
    let medicationId = null; // Для редактирования
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

        // Шаг 4 (пока не используется)
        schedules: []
    };

    // Константы
    const TOTAL_STEPS = 3; // Теперь 3 шага
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

    function show(data = {}) {
        console.log('💊 Открытие формы лекарства:', data);

        // Сброс состояния
        currentStep = 1;
        medicationId = data.medicationId || null;

        // Если редактирование - загружаем данные
        if (medicationId) {
            loadMedicationData(medicationId);
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
            // TODO: Загрузка данных лекарства через API
            showToast('⚠️ Редактирование в разработке', 'info');
            close();
        } catch (error) {
            console.error('❌ Ошибка загрузки лекарства:', error);
            showToast('❌ Не удалось загрузить данные', 'error');
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
            default:
                content = '<p>Неизвестный шаг</p>';
        }

        const title = medicationId ? '✏️ Редактировать лекарство' : '💊 Добавить лекарство';
        const modalHtml = BaseModal.createModalStructure(title, content, 'large');
        BaseModal.show(modalHtml);

        // Инициализируем обработчики
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

                <!-- Форма -->
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

                <!-- Действия -->
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

                <!-- Форма -->
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
                        <div class="form-group" id="end-date-group">
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

                <!-- Действия -->
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

                <!-- Форма -->
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

                <!-- Действия -->
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
        // Автофокус на первое поле
        setTimeout(() => {
            const firstInput = document.querySelector('.modal-input');
            if (firstInput && step === 1) {
                firstInput.focus();
            }
        }, 100);
    }

    function nextStep() {
        // Валидация текущего шага
        if (!validateStep(currentStep)) {
            return;
        }

        // Сохраняем данные текущего шага
        saveStepData(currentStep);

        // Переход на следующий шаг
        currentStep++;
        renderStep(currentStep);
    }

    function prevStep() {
        // Сохраняем данные текущего шага (без валидации)
        saveStepData(currentStep);

        // Переход на предыдущий шаг
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
                // Валидация остатков
                const available = parseInt(document.getElementById('medication-quantity-available')?.value || 0);
                const threshold = parseInt(document.getElementById('medication-quantity-threshold')?.value || 0);

                if (available < 0) {
                    showToast('⚠️ Количество не может быть отрицательным', 'warning');
                    return false;
                }

                if (threshold < 0) {
                    showToast('⚠️ Порог не может быть отрицательным', 'warning');
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
        renderStep(2); // Перерисовываем шаг 2
    }

    function selectQuantityUnit(unit) {
        formData.quantity_unit = unit;
        renderStep(3); // Перерисовываем шаг 3
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

        // Обновляем formData
        if (type === 'available') {
            formData.quantity_available = newValue;
        } else {
            formData.quantity_threshold = newValue;
        }

        // Перерисовываем превью если есть
        const previewElement = document.querySelector('.stock-preview-body');
        if (previewElement) {
            previewElement.innerHTML = renderStockPreview();
        }
    }

    async function save() {
        console.log('💾 Сохранение лекарства:', formData);

        // Финальная валидация
        if (!validateStep(currentStep)) {
            return;
        }

        // Сохраняем данные текущего шага
        saveStepData(currentStep);

        try {
            // Формируем данные для API
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
                schedules: [] // Пока пустой массив (Модуль 4)
            };

            console.log('📤 Отправка на сервер:', medicationData);

            const result = await HealthAPI.createMedication(medicationData);

            if (result.success) {
                showToast('✅ Лекарство добавлено', 'success');
                close();

                // Обновляем список лекарств
                await HealthModule.refreshData();

                // Перезагружаем вкладку "Аптечка" если она открыта
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
        save
    };
})();

// Экспорт в window
if (typeof window !== 'undefined') {
    window.MedicationFormModal = MedicationFormModal;
}

console.log('✅ MedicationFormModal загружен (3 шага)');