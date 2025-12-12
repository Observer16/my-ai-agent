// js/components/Dashboard.js
const Dashboard = (function() {

    function init() {
        initMedicationTracker();
        initWellnessGrid();
        initAddSymptomsButton();
        renderSummary();
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

            html += `
                <div class="medication-card ${isTaken ? 'taken' : ''}" data-medication-id="${medicationId}">
                    <div class="medication-time">${time}</div>
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
                            `<button class="health-btn btn-primary" onclick="logMedication('${medicationId}', '${scheduleId}')">
                                ✅ Принять
                            </button>
                            <button class="health-btn btn-secondary" onclick="skipMedication('${medicationId}', '${scheduleId}')">
                                ⏭ Пропустить
                            </button>`
                        }
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
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

    function initWellnessGrid() {
        const gridContainer = document.getElementById('wellness-grid');
        if (!gridContainer) return;

        const state = HealthModule.getState();
        gridContainer.innerHTML = renderWellnessGrid(state.todayEntry);
    }

    function renderWellnessGrid(todayEntry) {
        return `
            <div class="wellness-grid">
                <div class="wellness-item" onclick="showMoodPicker()">
                    <div class="wellness-icon">${HealthFormatters.getMoodEmoji(todayEntry?.mood)}</div>
                    <div class="wellness-label">Настроение</div>
                    <div class="wellness-value">${todayEntry?.mood || 'Добавить'}</div>
                </div>

                <div class="wellness-item" onclick="showSleepInput()">
                    <div class="wellness-icon">🌙</div>
                    <div class="wellness-label">Сон</div>
                    <div class="wellness-value">${todayEntry?.sleep_hours ? `${todayEntry.sleep_hours} ч` : 'Добавить'}</div>
                </div>

                <div class="wellness-item" onclick="showWeightInput()">
                    <div class="wellness-icon">⚖️</div>
                    <div class="wellness-label">Вес</div>
                    <div class="wellness-value">${todayEntry?.weight ? `${todayEntry.weight} кг` : 'Добавить'}</div>
                </div>

                <div class="wellness-item" onclick="HealthModule.switchTab('diary')">
                    <div class="wellness-icon">🤕</div>
                    <div class="wellness-label">Симптомы</div>
                    <div class="wellness-value">${todayEntry?.symptoms?.length || 0}</div>
                </div>
            </div>
        `;
    }

    function initAddSymptomsButton() {
        const button = document.getElementById('add-symptoms-btn');
        if (!button) return;

        button.addEventListener('click', () => {
            if (window.showSymptomPicker) {
                showSymptomPicker();
            }
        });
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
                        <div class="stat-value">${stats.average_sleep ? stats.average_sleep.toFixed(1) : '0'}</div>
                        <div class="stat-label">ч сна в среднем</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-value">${stats.medication_adherence ? Math.round(stats.medication_adherence) : 0}%</div>
                        <div class="stat-label">приверженность лечению</div>
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
                .then(success => {
                    if (success) {
                        showToast('✅ Сон сохранен', 'success');
                        init();
                    }
                });
        }
    }

    function showWeightInput() {
        console.log('⚖️ Открытие ввода веса...');
        const today = new Date().toISOString().split('T')[0];
        const currentWeight = HealthModule.getState().todayEntry?.weight || '';

        const weight = prompt('Введите ваш вес (кг):', currentWeight);
        if (weight !== null && weight !== '') {
            HealthModule.updateHealthEntry(today, 'weight', parseFloat(weight))
                .then(success => {
                    if (success) {
                        showToast('✅ Вес сохранен', 'success');
                        init();
                    }
                });
        }
    }

    async function logMedication(medicationId, scheduleId) {
        console.log('💊 Отметка приема лекарства:', { medicationId, scheduleId });

        try {
            const result = await HealthAPI.logMedicationIntake({
                medication_id: medicationId,
                schedule_id: scheduleId,
                status: 'taken'
            });

            if (result.success) {
                showToast('✅ Лекарство отмечено', 'success');
                await HealthModule.refreshData();
                init();
            } else {
                showToast('❌ Ошибка отметки', 'error');
            }
        } catch (error) {
            console.error('❌ Ошибка логирования:', error);
            showToast('❌ Ошибка отметки', 'error');
        }
    }

    async function skipMedication(medicationId, scheduleId) {
        console.log('⏭ Пропуск лекарства:', { medicationId, scheduleId });

        try {
            const result = await HealthAPI.logMedicationIntake({
                medication_id: medicationId,
                schedule_id: scheduleId,
                status: 'skipped'
            });

            if (result.success) {
                showToast('⏭ Лекарство пропущено', 'info');
                await HealthModule.refreshData();
                init();
            } else {
                showToast('❌ Ошибка отметки', 'error');
            }
        } catch (error) {
            console.error('❌ Ошибка логирования:', error);
            showToast('❌ Ошибка отметки', 'error');
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
        showWeightInput,
        logMedication,
        skipMedication
    };
})(); // ← IIFE ЗАВЕРШЕН, Dashboard создан!

// Экспорт в window (СНАЧАЛА экспортируем сам модуль)
if (typeof window !== 'undefined') {
    window.Dashboard = Dashboard;
}

// Глобальные функции для onclick (ТОЛЬКО после экспорта модуля)
window.showMoodPicker = () => Dashboard.showMoodPicker();
window.showSleepInput = () => Dashboard.showSleepInput();
window.showWeightInput = () => Dashboard.showWeightInput();
window.logMedication = (id, scheduleId) => Dashboard.logMedication(id, scheduleId);
window.skipMedication = (id, scheduleId) => Dashboard.skipMedication(id, scheduleId);