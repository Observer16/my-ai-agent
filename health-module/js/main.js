// health-module/js/main.js

/**
 * Главный файл инициализации UI модуля здоровья
 * Версия 2.0 (декомпозированная)
 */


// Импорт компонентов (в реальном проекте используйте модули ES6)
// import { Dashboard } from './components/Dashboard.js';
// import { Diary } from './components/Diary.js';
// import { Medications } from './components/Medications.js';
// import { Stats } from './components/Stats.js';
// import { Onboarding } from './components/Onboarding.js';
// import { ModalManager } from './modals/BaseModal.js';

// Маркер для загрузчика совместимости
window.HealthUI = window.HealthUI || {};
window.HealthUI.__isMainModule = true;

// Глобальные функции для HTML onclick
window.markMedicationTaken = async function(medicationId) {
    const success = await HealthModule.logMedication(medicationId, 'taken');
    if (success) {
        HealthUI.showToast('✅ Лекарство отмечено как принятое', 'success');
        HealthModule.refreshData();
    }
};

window.markMedicationSkipped = async function(medicationId) {
    const success = await HealthModule.logMedication(medicationId, 'skipped');
    if (success) {
        HealthUI.showToast('⏭ Лекарство пропущено', 'info');
        HealthModule.refreshData();
    }
};

window.showMoodPicker = function() {
    ModalManager.show('mood-picker');
};

window.showSleepInput = function() {
    ModalManager.show('sleep-input');
};

window.showWeightInput = function() {
    ModalManager.show('weight-input');
};

window.showSymptomPicker = function() {
    ModalManager.show('symptom-picker');
};

window.showMedicationForm = function() {
    ModalManager.show('medication-form');
};

window.selectMood = function(mood) {
    import { getTodayLocal } from './utils/date-utils.js';
    const today = getTodayLocal();
    HealthModule.updateHealthEntry(today, 'mood', mood);
};

window.saveEntry = async function(date) {
    const sleep = document.getElementById('sleep-input')?.value;
    const weight = document.getElementById('weight-input')?.value;
    const notes = document.getElementById('notes-input')?.value;
    const sexualActivity = document.getElementById('sexual-activity-input')?.value;

    const promises = [];

    if (sleep) promises.push(HealthModule.updateHealthEntry(date, 'sleep', parseFloat(sleep)));
    if (weight) promises.push(HealthModule.updateHealthEntry(date, 'weight', parseFloat(weight)));
    if (notes) promises.push(HealthModule.updateHealthEntry(date, 'notes', notes));
    if (sexualActivity) promises.push(HealthModule.updateHealthEntry(date, 'sexual_activity', sexualActivity));

    await Promise.all(promises);
    HealthUI.showToast('✅ Сохранено', 'success');
};

// Фасад для HealthUI (для обратной совместимости)
const HealthUI = (function() {
    return {
        // Инициализация компонентов
        initDashboardComponents: function() {
            if (typeof Dashboard !== 'undefined') Dashboard.init();
        },

        initMedicationsComponents: function() {
            if (typeof Medications !== 'undefined') Medications.init();
        },

        initDiaryComponents: function() {
            if (typeof Diary !== 'undefined') Diary.init();
        },

        initStatsComponents: function() {
            if (typeof Stats !== 'undefined') Stats.init();
        },

        initOnboardingComponents: function() {
            if (typeof Onboarding !== 'undefined') Onboarding.init();
        },

        // Вспомогательные методы
        showToast: function(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `health-toast toast-${type}`;
            toast.innerHTML = message;

            document.body.appendChild(toast);

            setTimeout(() => toast.classList.add('show'), 10);

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        showModal: function(modalType, data = {}) {
            ModalManager.show(modalType, data);
        },

        closeModal: function() {
            ModalManager.close();
        },

        // Методы для модальных окон (для обратной совместимости)
        selectMood: async function(mood) {
            import { getTodayLocal } from './utils/date-utils.js';
            const today = getTodayLocal();
            const success = await HealthModule.updateHealthEntry(today, 'mood', mood);
            if (success) {
                this.showToast('✅ Настроение сохранено', 'success');
                this.closeModal();
                HealthModule.refreshData();
            }
        },

        saveSleep: async function() {
            const input = document.getElementById('modal-sleep-input');
            if (!input || !input.value) return;

            import { getTodayLocal } from './utils/date-utils.js';
            const today = getTodayLocal();
            const success = await HealthModule.updateHealthEntry(today, 'sleep', parseFloat(input.value));
            if (success) {
                this.showToast('✅ Сон сохранён', 'success');
                this.closeModal();
                HealthModule.refreshData();
            }
        },

        saveWeight: async function() {
            const input = document.getElementById('modal-weight-input');
            if (!input || !input.value) return;

            import { getTodayLocal } from './utils/date-utils.js';
            const today = getTodayLocal();
            const success = await HealthModule.updateHealthEntry(today, 'weight', parseFloat(input.value));
            if (success) {
                this.showToast('✅ Вес сохранён', 'success');
                this.closeModal();
                HealthModule.refreshData();
            }
        },

        updateSymptomsList: function() {
            // Делегируем компоненту SymptomModal
            if (typeof SymptomModal !== 'undefined') {
                SymptomModal.updateSymptomsList();
            }
        },

        saveSymptom: async function() {
            // Делегируем компоненту SymptomModal
            if (typeof SymptomModal !== 'undefined') {
                await SymptomModal.save();
            }
        }
    };
})();

// Экспорт
if (typeof window !== 'undefined') {
    window.HealthUI = HealthUI;

    // Для обратной совместимости
    window.toggleArchiveView = function() {
        if (typeof Medications !== 'undefined') Medications.toggleArchiveView();
    };

    window.editMedication = function(id) {
        if (typeof Medications !== 'undefined') Medications.editMedication(id);
    };

    window.deleteMedication = function(id) {
        if (typeof Medications !== 'undefined') Medications.deleteMedication(id);
    };

    window.removeSymptom = function(id) {
        if (typeof Diary !== 'undefined') Diary.removeSymptom(id);
    };
}

console.log('✅ Health UI модуль инициализирован');

if (typeof window !== 'undefined') {
    // Сохраняем реальную реализацию
    window.HealthUIMain = HealthUI;

    // Перезаписываем глобальную переменную
    window.HealthUI = HealthUI;

    console.log('✅ Main.js HealthUI установлен');
}