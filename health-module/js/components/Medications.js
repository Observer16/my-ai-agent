// js/components/Medications.js

const Medications = (function() {
    let showArchived = false;

    function init() {
        console.log('💊 Инициализация компонента Medications');
        renderMedicationsList();
        initAddButton();
        initArchiveToggle();
    }

    function shouldShowActions(timeOfDay, reminderMinutes) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // текущее время в минутах

        const [hours, minutes] = timeOfDay.split(':').map(Number);
        const scheduleTime = hours * 60 + minutes; // время приема в минутах
        const reminderTime = scheduleTime - (reminderMinutes || 0); // время напоминания

        return currentTime >= reminderTime;
    }

    function renderMedicationsList() {
        const container = document.getElementById('medications-list');
        if (!container) {
            console.warn('⚠️ Контейнер medications-list не найден');
            return;
        }

        const state = HealthModule.getState();
        const medications = (state.medications || []).filter(med =>
            showArchived ? !med.is_active : med.is_active
        );

        if (medications.length === 0) {
            container.innerHTML = renderEmptyState();
            return;
        }

        container.innerHTML = renderMedicationsGrid(medications);
    }

    function renderMedicationsGrid(medications) {
        let html = '<div class="medications-grid">';

        medications.forEach(med => {
            const nextSchedule = getNextSchedule(med);

            html += `
                <div class="medication-item" data-medication-id="${med.id}">
                    <div class="medication-header">
                        <div class="medication-icon">💊</div>
                        <div class="medication-title">
                            <h4>${med.name}</h4>
                            ${med.dosage && med.dosage !== 'string' ? `<span class="medication-subtitle">${med.dosage}</span>` : ''}
                        </div>
                    </div>

                    ${med.form && med.form !== 'string' ? `<div class="medication-detail"><strong>${typeof t === 'function' ? t('health.medications.form_label') : 'Форма:'}</strong> ${med.form}</div>` : ''}

                    ${nextSchedule ? `
                        <div class="medication-detail">
                            <strong>${typeof t === 'function' ? t('health.medications.next_intake') : 'Следующий прием:'}</strong> ${nextSchedule}
                        </div>
                    ` : ''}

                    ${med.instructions && med.instructions !== 'string' ? `
                        <div class="medication-detail">
                            <strong>${typeof t === 'function' ? t('health.medications.instructions') : 'Инструкция:'}</strong> ${med.instructions.substring(0, 50)}${med.instructions.length > 50 ? '...' : ''}
                        </div>
                    ` : ''}

                    <div class="medication-actions">
                        <button class="btn-icon" onclick="Medications.editMedication('${med.id}')" title="Редактировать">
                            ✏️
                        </button>
                        <button class="btn-icon btn-danger" onclick="Medications.deleteMedication('${med.id}')" title="Удалить">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    function renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">💊</div>
                <h3>${typeof t === 'function' ? t('health.medications.empty_medications') : 'Аптечка пуста'}</h3>
                <p>${typeof t === 'function' ? t('health.medications.add_first_medication') : 'Добавьте лекарства, которые вы принимаете регулярно'}</p>
                <button class="btn-primary" onclick="showMedicationForm()">
                    ${typeof t === 'function' ? t('health.medications.add_first_medication_btn') : 'Добавить первое лекарство'}
                </button>
            </div>
        `;
    }

    function getNextSchedule(medication) {
        if (!medication.schedules || medication.schedules.length === 0) {
            return null;
        }

        const now = new Date();
        const today = now.getDay();

        for (const schedule of medication.schedules) {
            const days = schedule.days_of_week || [];
            const time = schedule.time_of_day;

            if (days.includes(today)) {
                return HealthFormatters.formatTime(time);
            }
        }

        return 'Завтра'; // TODO: translate "Tomorrow" when needed
    }

    function initAddButton() {
        const addBtn = document.getElementById('add-medication-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                showMedicationForm();
            });
        }
    }

    function initArchiveToggle() {
        const toggleBtn = document.getElementById('toggle-archive');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                toggleArchiveView();
            });
        }
    }

    function toggleArchiveView() {
        showArchived = !showArchived;
        renderMedicationsList();

        const toggleBtn = document.getElementById('toggle-archive');
        if (toggleBtn) {
            // TODO: add translation keys for "Show active" and "Show archived"
            toggleBtn.textContent = showArchived ? 'Показать активные' : 'Показать архивные';
        }
    }

    function editMedication(id) {
        console.log('✏️ Редактирование лекарства:', id);
        if (window.SimpleModalManager) {
            SimpleModalManager.show('medication-form', { medicationId: id });
        } else {
            alert('Функция редактирования в разработке');
        }
    }

    async function deleteMedication(id) {
        if (!confirm('Вы уверены, что хотите удалить это лекарство?')) {
            return;
        }

        try {
            const response = await HealthAPI.deactivateMedication(id);

            if (response && response.success) {
                showToast(' Лекарство удалено', 'success');
                await HealthModule.refreshData();
                renderMedicationsList();
            } else {
                showToast('❌ Не удалось удалить лекарство', 'error');
            }
        } catch (error) {
            console.error('❌ Ошибка удаления лекарства:', error);
            showToast('❌ Ошибка удаления', 'error');
        }
    }

    function showMedicationForm(medicationId = null) {
        console.log('💊 Открытие формы лекарства:', medicationId);
        if (window.MedicationFormModal) {
            MedicationFormModal.show({ medicationId });
        } else {
            showToast('⚠️ Форма не загружена', 'error');
        }
    }

    // Публичный API
    return {
        init,
        editMedication,
        deleteMedication,
        toggleArchiveView,
        showMedicationForm
    };
})();

// Экспорт в window
if (typeof window !== 'undefined') {
    window.Medications = Medications;
}

// Глобальная функция для onclick (просто делегирует в модуль)
window.showMedicationForm = (medicationId = null) => Medications.showMedicationForm(medicationId);