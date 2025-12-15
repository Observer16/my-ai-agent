// js/components/Dashboard.js
const Dashboard = (function() {

    function init() {
        initMedicationTracker();
        initWellnessGrid();
        renderSummary();
        setupEventDelegation();
    }

    function initMedicationTracker() {
        const trackerContainer = document.getElementById('medication-tracker');
        if (!trackerContainer) {
            console.warn('⚠️ Контейнер medication-tracker не найден');
            return;
        }

        const state = HealthModule.getState();
        const medications = Array.isArray(state.todayMedications) ? state.todayMedications : [];

        console.log('💊 Загружено лекарств:', medications.length, medications);

        if (medications.length === 0) {
            trackerContainer.innerHTML = renderNoMedications();
            return;
        }

        trackerContainer.innerHTML = renderMedicationList(medications);
    }

    function renderMedicationList(medications) {
        let html = '<div class="medication-list">';

        medications.forEach(med => {
            // Используем medication_id из API ответа
            const medicationId = med.medication_id || med.id || '';
            const scheduleId = med.schedule_id || '';
            const time = HealthFormatters.formatTime(med.time_of_day);
            const status = med.status || 'pending';
            const isTaken = status === 'taken';
            const takenTime = med.taken_time ?
                `в ${new Date(med.taken_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` : '';

            const medicationName = med.medication_name || med.name || 'Лекарство';
            const dosage = med.dosage || '';
            const form = med.form || '';

            console.log('📝 Данные для рендеринга:', {
                name: medicationName,
                medicationId: medicationId,
                isValidId: medicationId && medicationId.length > 0
            });

            // Создаем безопасные строки для data-атрибутов
            const safeMedicationId = medicationId ? String(medicationId).replace(/"/g, '&quot;') : '';
            const safeScheduleId = scheduleId ? String(scheduleId).replace(/"/g, '&quot;') : '';

            html += `
                <div class="medication-card ${isTaken ? 'taken' : ''}"
                     data-medication-id="${safeMedicationId}"
                     data-schedule-id="${safeScheduleId}">
                    <div class="medication-time">${time}</div>
                    <div class="medication-details">
                        <div class="medication-info">
                            <div class="medication-name">${medicationName}</div>
                            ${dosage ? `<div class="medication-dosage">${dosage}</div>` : ''}
                            ${form ? `<div class="medication-form">${form}</div>` : ''}
                        </div>
                        <div class="medication-actions">
                            ${isTaken ?
                                `<button class="health-btn btn-success" disabled>
                                    ✅ Принято ${takenTime}
                                </button>` :
                                `<button class="health-btn btn-primary" data-action="take">
                                    ✅ Принять
                                </button>
                                <button class="health-btn btn-secondary" data-action="skip">
                                    ⏭ Пропустить
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    function setupEventDelegation() {
        // Используем делегирование событий для всего документа
        document.addEventListener('click', function(e) {
            const button = e.target.closest('.health-btn[data-action]');
            if (!button) return;

            const medicationCard = button.closest('.medication-card');
            if (!medicationCard) return;

            // Получаем данные из data-атрибутов
            const medicationId = medicationCard.getAttribute('data-medication-id');
            const scheduleId = medicationCard.getAttribute('data-schedule-id') || null;

            console.log('🖱️ Клик по кнопке:', {
                action: button.dataset.action,
                medicationId: medicationId,
                scheduleId: scheduleId,
                element: medicationCard
            });

            if (!medicationId) {
                console.error('❌ Не найден medicationId в data-атрибутах');
                console.log('💾 Проверка data-атрибутов карточки:', {
                    dataset: medicationCard.dataset,
                    attributes: medicationCard.attributes
                });
                showToast('❌ Ошибка: не указано лекарство', 'error');
                return;
            }

            const action = button.dataset.action;
            e.preventDefault();

            if (action === 'take') {
                logMedication(medicationId, scheduleId);
            } else if (action === 'skip') {
                skipMedication(medicationId, scheduleId);
            }
        });
    }

    function initWellnessGrid() {
        const gridContainer = document.getElementById('wellness-grid');
        if (!gridContainer) return;

        const state = HealthModule.getState();
        gridContainer.innerHTML = renderWellnessGrid(state.todayEntry);
    }

    function renderWellnessGrid(todayEntry) {
        // Подсчитываем симптомы за сегодня
        const symptomsCount = todayEntry?.symptoms?.length || 0;

        return `
            <div class="wellness-grid">
                <div class="wellness-item" onclick="Dashboard.showMoodPicker()">
                    <div class="wellness-icon">${HealthFormatters.getMoodEmoji(todayEntry?.mood)}</div>
                    <div class="wellness-label">Настроение</div>
                    <div class="wellness-value">${todayEntry?.mood || 'Добавить'}</div>
                </div>

                <div class="wellness-item" onclick="Dashboard.showSleepInput()">
                    <div class="wellness-icon">🌙</div>
                    <div class="wellness-label">Сон</div>
                    <div class="wellness-value">${todayEntry?.sleep_hours ? `${todayEntry.sleep_hours} ч` : 'Добавить'}</div>
                </div>

                <div class="wellness-item" onclick="Dashboard.showSymptomPicker()">
                    <div class="wellness-icon">🤕</div>
                    <div class="wellness-label">Симптомы</div>
                    <div class="wellness-value">${symptomsCount > 0 ? `${symptomsCount} шт` : 'Добавить'}</div>
                </div>

                <div class="wellness-item" onclick="Dashboard.showSexualActivityPicker()">
                    <div class="wellness-icon">🔒</div>
                    <div class="wellness-label">Интимность</div>
                    <div class="wellness-value">${todayEntry?.sexual_activity ? 'Указано' : 'Добавить'}</div>
                </div>
            </div>
        `;
    }

    function renderSummary() {
        const summaryContainer = document.getElementById('health-summary');
        if (!summaryContainer) return;

        const state = HealthModule.getState();

        if (!state.stats) {
            summaryContainer.innerHTML = '<p>Загрузка сводки...</p>';
            return;
        }

        summaryContainer.innerHTML = renderSummaryCard(state.stats);
    }

    function renderSummaryCard(stats) {
        return `
            <div class="summary-card">
                <h3>📊 За последние 7 дней</h3>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <div class="stat-value">${stats.entries_count || 0}</div>
                        <div class="stat-label">записей</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-value">${stats.average_sleep ? stats.average_sleep.toFixed(1) : '0'} ч.</div>
                        <div class="stat-label">сна в среднем</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-value">${stats.medication_adherence ? Math.round(stats.medication_adherence) : 0}%</div>
                        <div class="stat-label">Соблюдение принятия лекарств</div>
                    </div>
                </div>
            </div>
        `;
    }

    function showMoodPicker() {
        console.log('😊 Открытие выбора настроения...');
        if (window.MoodModal) {
            MoodModal.show();
        } else if (window.SimpleModalManager) {
            SimpleModalManager.show('mood-picker');
        } else {
            showToast('⚠️ Функция в разработке', 'info');
        }
    }

    function showSleepInput() {
        console.log('🌙 Открытие ввода сна...');
        const today = new Date().toISOString().split('T')[0];
        const currentSleep = HealthModule.getState().todayEntry?.sleep_hours || '';

        const hours = prompt('Сколько часов вы спали?', currentSleep);
        if (hours !== null && hours !== '') {
            HealthModule.updateHealthEntry(today, 'sleep', parseFloat(hours))
                .then(async (success) => {
                    if (success) {
                        showToast('✅ Сон сохранен', 'success');
                        await HealthModule.refreshData();
                        init();
                    }
                });
        }
    }

    function showSymptomPicker() {
        console.log('🤕 Открытие выбора симптомов...');
        const today = new Date().toISOString().split('T')[0];

        if (window.SymptomModal) {
            SymptomModal.show({ date: today });
        } else if (window.SimpleModalManager) {
            SimpleModalManager.show('symptom-picker', { date: today });
        } else {
            showToast('⚠️ Функция в разработке', 'info');
        }
    }

    function showSexualActivityPicker() {
        console.log('🔒 Открытие выбора интимности...');
        if (window.SexualActivityModal) {
            SexualActivityModal.show();
        } else {
            showToast('⚠️ Функция в разработке', 'info');
        }
    }

    function renderNoMedications() {
        return `
            <div class="no-medications">
                <div class="no-meds-icon">💊</div>
                <p>На сегодня нет запланированных лекарств</p>
                <button class="health-btn btn-secondary" onclick="HealthModule.switchTab('medications')">
                    Добавить лекарство
                </button>
            </div>
        `;
    }

    async function logMedication(medicationId, scheduleId) {
        console.log('💊 logMedication вызван:', {
            medicationId,
            scheduleId,
            typeMedId: typeof medicationId,
            typeScheduleId: typeof scheduleId
        });

        // Валидация
        if (!medicationId || medicationId.trim() === '' || medicationId === 'undefined') {
            console.error('❌ Ошибка: medicationId невалидный:', medicationId);
            showToast('❌ Ошибка: не указано лекарство', 'error');
            return;
        }

        // Убираем возможные кавычки
        const cleanMedicationId = medicationId.replace(/['"]/g, '');
        const cleanScheduleId = scheduleId ? scheduleId.replace(/['"]/g, '') : null;

        console.log('🔧 Очищенные ID:', {
            cleanMedicationId,
            cleanScheduleId
        });

        try {
            const result = await HealthAPI.logMedicationIntake({
                medication_id: cleanMedicationId,
                schedule_id: cleanScheduleId,
                status: 'taken',
                notes: ''
            });

            if (result.success) {
                showToast('✅ Лекарство отмечено', 'success');
                await HealthModule.refreshData();
                init();
            } else {
                console.error('❌ Ошибка API:', result);
                showToast(`❌ Ошибка: ${result.error || 'не удалось отметить прием'}`, 'error');
            }
        } catch (error) {
            console.error('❌ Ошибка логирования:', error);
            showToast('❌ Ошибка сервера', 'error');
        }
    }

    async function skipMedication(medicationId, scheduleId) {
        console.log('⏭ skipMedication вызван:', { medicationId, scheduleId });

        // Валидация
        if (!medicationId || medicationId.trim() === '' || medicationId === 'undefined') {
            console.error('❌ Ошибка: medicationId невалидный:', medicationId);
            showToast('❌ Ошибка: не указано лекарство', 'error');
            return;
        }

        // Убираем возможные кавычки
        const cleanMedicationId = medicationId.replace(/['"]/g, '');
        const cleanScheduleId = scheduleId ? scheduleId.replace(/['"]/g, '') : null;

        try {
            const result = await HealthAPI.logMedicationIntake({
                medication_id: cleanMedicationId,
                schedule_id: cleanScheduleId,
                status: 'skipped',
                notes: ''
            });

            if (result.success) {
                showToast('⏭ Лекарство пропущено', 'info');
                await HealthModule.refreshData();
                init();
            } else {
                console.error('❌ Ошибка API:', result);
                showToast(`❌ Ошибка: ${result.error || 'не удалось отметить пропуск'}`, 'error');
            }
        } catch (error) {
            console.error('❌ Ошибка логирования:', error);
            showToast('❌ Ошибка сервера', 'error');
        }
    }

    function refresh() {
        init();
    }

    // Публичный API
    return {
        init,
        refresh,
        showMoodPicker,
        showSleepInput,
        showSymptomPicker,
        showSexualActivityPicker,
        logMedication,
        skipMedication
    };
})();

// Экспорт в window
if (typeof window !== 'undefined') {
    window.Dashboard = Dashboard;
}

// Глобальные функции для онкликов в wellness grid
window.showMoodPicker = () => Dashboard.showMoodPicker();
window.showSleepInput = () => Dashboard.showSleepInput();
window.showSymptomPicker = () => Dashboard.showSymptomPicker();
window.showSexualActivityPicker = () => Dashboard.showSexualActivityPicker();