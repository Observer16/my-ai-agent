// health-ui.js - ТОЛЬКО оркестрация
const HealthUI = (function() {
    return {
        initDashboardComponents: function() {
            console.log('📊 HealthUI.initDashboardComponents()');
            if (window.Dashboard) {
                Dashboard.init();
            } else {
                console.warn('⚠️ Dashboard module not loaded');
            }
        },

        initMedicationsComponents: function() {
            console.log('💊 HealthUI.initMedicationsComponents()');
            if (window.Medications) {
                Medications.init();
            } else {
                console.warn('⚠️ Medications module not loaded');
            }
        },

        initDiaryComponents: function() {
            console.log('📓 HealthUI.initDiaryComponents()');
            if (window.Diary) {
                Diary.init();
            } else {
                console.warn('⚠️ Diary module not loaded');
            }
        },

        initStatsComponents: function() {
            console.log('📈 HealthUI.initStatsComponents()');
            if (window.Stats) {
                Stats.init();
            } else {
                console.warn('⚠️ Stats module not loaded');
            }
        },

        initOnboardingComponents: function() {
            console.log('🎯 HealthUI.initOnboardingComponents()');
            if (window.Onboarding) {
                Onboarding.init();
            } else {
                console.warn('⚠️ Onboarding module not loaded');
            }
        },

        showToast: function(message, type = 'info') {
            // Реализация toast
        },

        showModal: function(modalType, data = {}) {
            if (window.SimpleModalManager) {
                SimpleModalManager.show(modalType, data);
            }
        },

        closeModal: function() {
            if (window.SimpleModalManager) {
                SimpleModalManager.close();
            }
        }
    };
})();

if (typeof window !== 'undefined') {
    window.HealthUI = HealthUI;
}