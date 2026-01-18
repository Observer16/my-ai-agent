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

        console.log('💊 Данные лекарств из состояния:', medications);

        if (medications.length === 0) {
            trackerContainer.innerHTML = renderNoMedications();
            return;
        }

        trackerContainer.innerHTML = renderMedicationList(medications);
    }

    function renderMedicationList(medications) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        let html = '<div class="medication-list">';

        medications.forEach((med, index) => {
            const medicationId = med.medication_id || '';
            const scheduleId = med.schedule_id || '';
            const time = HealthFormatters.formatTime(med.time_of_day);
            const status = med.status || 'pending';
            const isTaken = status === 'taken';
            const takenTime = med.taken_time ?
                `в ${new Date(med.taken_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` : '';

            const medicationName = med.medication_name || (typeof t === 'function' ? t('health.medications.default_name') : 'Лекарство');

            let dosage = typeof t === 'function' ? t('health.medications.default_dosage') : 'одна шт.';
            if (med.dosage !== null && med.dosage !== undefined && med.dosage !== '') {
                dosage = med.dosage;
            }

            const form = med.form || (typeof t === 'function' ? t('health.medications.form_not_specified') : 'Не указана');

            // Проверяем время напоминания
            const [hours, minutes] = med.time_of_day.split(':').map(Number);
            const scheduleTime = hours * 60 + minutes;
            const reminderMinutes = med.reminder_minutes || 0;
            const reminderTime = scheduleTime - reminderMinutes;

            const showActions = currentTime >= reminderTime;
            const timeUntilReminder = reminderTime - currentTime;

            const safeMedicationId = medicationId || '';
            const safeScheduleId = scheduleId || '';

            let statusClass = 'pending';
            let statusInfo = '';

            if (isTaken) {
                statusClass = 'taken';
            } else if (!showActions) {
                statusClass = 'waiting';
                const hoursUntil = Math.floor(timeUntilReminder / 60);
                const minsUntil = timeUntilReminder % 60;
                const reminderText = typeof t === 'function' ? t('health.dashboard.reminder_at') : '🔔 Напоминание появится в';
                statusInfo = `
                    <div class="medication-reminder-info">
                        ${reminderText} ${String(Math.floor(reminderTime / 60)).padStart(2, '0')}:${String(reminderTime % 60).padStart(2, '0')}
                    </div>
                `;
            }

            html += `
                <div class="medication-card status-${statusClass}"
                     data-medication-id="${safeMedicationId}"
                     data-schedule-id="${safeScheduleId}"
                     id="med-card-${index}">
                    <div class="medication-time">${time}</div>
                    <div class="medication-details">
                        <div class="medication-info">
                            <div class="medication-name">${medicationName}</div>
                            <div class="medication-dosage">${dosage}</div>
                            <div class="medication-form">${form}</div>
                        </div>
                        ${showActions ? `
                            <div class="medication-actions">
                                ${isTaken ?
                                    `<button class="health-btn btn-success" disabled>
                                        ${typeof t === 'function' ? t('health.dashboard.medication_taken') : '✅ Принято'} ${takenTime}
                                    </button>` :
                                    `<button class="health-btn btn-primary" data-action="take">
                                        ${typeof t === 'function' ? t('health.dashboard.take_medication') : '✅ Принять'}
                                    </button>
                                    <button class="health-btn btn-secondary" data-action="skip">
                                        ${typeof t === 'function' ? t('health.dashboard.skip_medication') : '⏭ Пропустить'}
                                    </button>`
                                }
                            </div>
                        ` : statusInfo}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    function setupEventDelegation() {
        // Удаляем старые обработчики если есть
        document.removeEventListener('click', handleMedicationClick);
        document.addEventListener('click', handleMedicationClick);
    }

    function handleMedicationClick(e) {
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
            element: medicationCard,
            cardHTML: medicationCard.outerHTML.substring(0, 300)
        });

        // Если medicationId пустой, проверяем все возможные варианты
        if (!medicationId || medicationId === 'undefined' || medicationId.trim() === '') {
            // Пробуем найти ID другими способами
            const cardId = medicationCard.id;
            const cardIndex = cardId.replace('med-card-', '');
            const allCards = document.querySelectorAll('.medication-card');

            console.log('🔍 Попытка восстановить medicationId:', {
                cardId,
                cardIndex,
                totalCards: allCards.length,
                datasetKeys: Object.keys(medicationCard.dataset),
                innerText: medicationCard.textContent.substring(0, 100)
            });

            // Проверяем состояние модуля
            const state = HealthModule.getState();
            const medications = state.todayMedications || [];
            if (medications[cardIndex]) {
                const medData = medications[cardIndex];
                console.log('📊 Найденные данные в состоянии:', medData);

                // Пробуем использовать данные из состояния
                const fallbackId = medData.medication_id || medData.id;
                if (fallbackId) {
                    console.log('🔄 Используем fallback ID:', fallbackId);
                    const action = button.dataset.action;
                    e.preventDefault();

                    if (action === 'take') {
                        logMedication(fallbackId, scheduleId || medData.schedule_id);
                        return;
                    } else if (action === 'skip') {
                        skipMedication(fallbackId, scheduleId || medData.schedule_id);
                        return;
                    }
                }
            }

            console.error('❌ Не найден medicationId в data-атрибутах');
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
                    <div class="wellness-label">${typeof t === 'function' ? t('health.dashboard.mood') : 'Настроение'}</div>
                    <div class="wellness-value">${todayEntry?.mood || (typeof t === 'function' ? t('health.common.add') : 'Добавить')}</div>
                </div>

                <div class="wellness-item" onclick="Dashboard.showSleepInput()">
                    <div class="wellness-icon">🌙</div>
                    <div class="wellness-label">${typeof t === 'function' ? t('health.dashboard.sleep') : 'Сон'}</div>
                    <div class="wellness-value">${todayEntry?.sleep_hours ? `${todayEntry.sleep_hours} ч` : (typeof t === 'function' ? t('health.common.add') : 'Добавить')}</div>
                </div>

                <div class="wellness-item" onclick="Dashboard.showSymptomPicker()">
                    <div class="wellness-icon">🤕</div>
                    <div class="wellness-label">${typeof t === 'function' ? t('health.dashboard.symptoms') : 'Симптомы'}</div>
                    <div class="wellness-value">${symptomsCount > 0 ? `${symptomsCount} шт` : (typeof t === 'function' ? t('health.common.add') : 'Добавить')}</div>
                </div>

                <div class="wellness-item" onclick="Dashboard.showSexualActivityPicker()">
                    <div class="wellness-icon">🔒</div>
                    <div class="wellness-label">${typeof t === 'function' ? t('health.dashboard.intimacy') : 'Интимность'}</div>
                    <div class="wellness-value">${todayEntry?.sexual_activity ? (typeof t === 'function' ? t('health.dashboard.specified') : 'Указано') : (typeof t === 'function' ? t('health.common.add') : 'Добавить')}</div>
                </div>
            </div>
        `;
    }

    function renderSummary() {
        const summaryContainer = document.getElementById('health-summary');
        if (!summaryContainer) return;

        const state = HealthModule.getState();

        if (!state.stats) {
            const loadingText = typeof t === 'function' ? t('health.common.loading') : 'Загрузка...';
            summaryContainer.innerHTML = `<p>${loadingText}</p>`;
            return;
        }

        summaryContainer.innerHTML = renderSummaryCard(state.stats);
    }

    function renderSummaryCard(stats) {
        return `
            <div class="summary-card">
                <h3>${typeof t === 'function' ? t('health.dashboard.weekly_summary') : '📊 За последние 7 дней'}</h3>
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
        const today = getTodayLocal();
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
        const today = getTodayLocal();

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
        const today = getTodayLocal();
        
        if (window.SexualActivityModal) {
            SexualActivityModal.show({ date: today });
        } else {
            showToast('⚠️ Модальное окно не загружено', 'error');
        }
    }

    function renderNoMedications() {
        return `
            <div class="no-medications">
                <div class="no-meds-icon">💊</div>
                <p>${typeof t === 'function' ? t('health.dashboard.no_medications_today') : 'На сегодня нет запланированных лекарств'}</p>
                <button class="health-btn btn-secondary" onclick="HealthModule.switchTab('medications')">
                    ${typeof t === 'function' ? t('health.medications.add_medication') : 'Добавить лекарство'}
                </button>
            </div>
        `;
    }

    async function logMedication(medicationId, scheduleId) {
        console.log('💊 logMedication вызван:', {
            medicationId,
            scheduleId,
            typeMedId: typeof medicationId,
            lengthMedId: medicationId?.length
        });

        // Валидация
        if (!medicationId || medicationId.trim() === '') {
            console.error('❌ Ошибка: medicationId пустой!', medicationId);
            showToast('❌ Ошибка: не указано лекарство', 'error');
            return;
        }

        // Очищаем ID
        const cleanMedicationId = String(medicationId).trim();
        const cleanScheduleId = scheduleId ? String(scheduleId).trim() : null;

        console.log('🔧 Отправляем данные на сервер:', {
            medication_id: cleanMedicationId,
            schedule_id: cleanScheduleId
        });

        try {
            // ВАЖНО: передаем объект с параметрами
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

                // Показываем понятное сообщение об ошибке
                let errorMessage = 'Не удалось отметить прием';
                if (result.error) {
                    if (Array.isArray(result.error)) {
                        errorMessage = result.error.map(e => e.msg || e).join(', ');
                    } else if (typeof result.error === 'string') {
                        errorMessage = result.error;
                    }
                }

                showToast(`❌ Ошибка: ${errorMessage}`, 'error');
            }
        } catch (error) {
            console.error('❌ Ошибка логирования:', error);
            showToast('❌ Ошибка сервера', 'error');
        }
    }

    async function skipMedication(medicationId, scheduleId) {
        console.log('⏭ skipMedication вызван:', { medicationId, scheduleId });

        // Валидация
        if (!medicationId || medicationId === 'undefined' || medicationId.trim() === '') {
            console.error('❌ Ошибка: medicationId невалидный:', medicationId);
            showToast('❌ Ошибка: не указано лекарство', 'error');
            return;
        }

        // Очищаем ID
        const cleanMedicationId = String(medicationId).trim().replace(/['\"]/g, '');
        const cleanScheduleId = scheduleId ? String(scheduleId).trim().replace(/['\"]/g, '') : null;

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
