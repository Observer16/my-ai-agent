// health-module/js/components/Medications.js


/**
 * Компонент аптечки
 */
const Medications = {
    showArchived: false,

    /**
     * Инициализация компонентов аптечки
     */
    init() {
        this.renderMedicationsList();
        this.initAddButton();
        this.initArchiveToggle();
    },

    /**
     * Отобразить список лекарств
     */
    renderMedicationsList() {
        const container = document.getElementById('medications-list');
        if (!container) return;

        const state = HealthModule.getState();
        const medications = state.medications.filter(med =>
            this.showArchived ? !med.is_active : med.is_active
        );

        if (medications.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        container.innerHTML = this.renderMedicationsGrid(medications);
    },

    /**
     * Рендер сетки лекарств
     */
    renderMedicationsGrid(medications) {
        let html = '<div class="medications-grid">';

        medications.forEach(med => {
            const nextSchedule = this.getNextSchedule(med);

            html += `
                <div class="medication-item" data-medication-id="${med.id}">
                    <div class="medication-header">
                        <div class="medication-icon">💊</div>
                        <div class="medication-title">
                            <h4>${med.name}</h4>
                            ${med.dosage ? `<span class="medication-subtitle">${med.dosage}</span>` : ''}
                        </div>
                    </div>

                    ${med.form ? `<div class="medication-detail"><strong>Форма:</strong> ${med.form}</div>` : ''}

                    ${nextSchedule ? `
                        <div class="medication-detail">
                            <strong>Следующий прием:</strong> ${nextSchedule}
                        </div>
                    ` : ''}

                    ${med.instructions ? `
                        <div class="medication-detail">
                            <strong>Инструкция:</strong> ${med.instructions.substring(0, 50)}${med.instructions.length > 50 ? '...' : ''}
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
    },

    /**
     * Рендер пустого состояния
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">💊</div>
                <h3>Аптечка пуста</h3>
                <p>Добавьте лекарства, которые вы принимаете регулярно</p>
                <button class="btn-primary" onclick="HealthUI.showModal('medication-form')">
                    Добавить первое лекарство
                </button>
            </div>
        `;
    },

    /**
     * Получить следующий график приема
     */
    getNextSchedule(medication) {
        if (!medication.schedules || medication.schedules.length === 0) {
            return null;
        }

        const now = new Date();
        const today = now.getDay(); // 0 - воскресенье, 1 - понедельник и т.д.

        for (const schedule of medication.schedules) {
            const days = schedule.days_of_week || [];
            const time = schedule.time_of_day;

            if (days.includes(today)) {
                return formatTime(time);
            }
        }

        return 'Завтра';
    },

    /**
     * Инициализация кнопки добавления
     */
    initAddButton() {
        const addBtn = document.getElementById('add-medication-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                HealthUI.showModal('medication-form');
            });
        }
    },

    /**
     * Инициализация переключателя архивных
     */
    initArchiveToggle() {
        const toggleBtn = document.getElementById('toggle-archive');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleArchiveView();
            });
        }
    },

    /**
     * Переключение вида архивных лекарств
     */
    toggleArchiveView() {
        this.showArchived = !this.showArchived;
        this.renderMedicationsList();

        const toggleBtn = document.getElementById('toggle-archive');
        if (toggleBtn) {
            toggleBtn.textContent = this.showArchived ? 'Показать активные' : 'Показать архивные';
        }
    },

    /**
     * Редактирование лекарства
     */
    editMedication(id) {
        // Реализация редактирования
        console.log('Редактирование лекарства:', id);
        HealthUI.showModal('medication-form', { medicationId: id });
    },

    /**
     * Удаление лекарства
     */
    async deleteMedication(id) {
        if (confirm('Вы уверены, что хотите удалить это лекарство?')) {
            const success = await HealthModule.deleteMedication(id);
            if (success) {
                HealthUI.showToast('✅ Лекарство удалено', 'success');
                this.renderMedicationsList();
            }
        }
    }
};

// Экспорт компонента
if (typeof window !== 'undefined') {
    window.Medications = Medications;
}