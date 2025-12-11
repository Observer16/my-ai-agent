// health-module/js/health-ui.js
// Redirect обёртка для обратной совместимости

console.log('⚠️ health-ui.js теперь обёртка. Используйте main.js для новой логики.');

// Импорт главного модуля (в реальном проекте используйте модули ES6)
// import { HealthUI } from './main.js';

// Реэкспорт всех публичных методов через обёртку
const HealthUILegacy = (function() {
    // Ленивая загрузка main.js если он ещё не загружен
    let mainModule = null;

    function getMainModule() {
        if (!mainModule && window.HealthUI) {
            mainModule = window.HealthUI;
        }
        return mainModule;
    }

    return {
        initDashboardComponents: function() {
            const module = getMainModule();
            return module ? module.initDashboardComponents() :
                console.error('Main module not loaded');
        },

        initMedicationsComponents: function() {
            const module = getMainModule();
            return module ? module.initMedicationsComponents() :
                console.error('Main module not loaded');
        },

        initDiaryComponents: function() {
            const module = getMainModule();
            return module ? module.initDiaryComponents() :
                console.error('Main module not loaded');
        },

        initStatsComponents: function() {
            const module = getMainModule();
            return module ? module.initStatsComponents() :
                console.error('Main module not loaded');
        },

        initOnboardingComponents: function() {
            const module = getMainModule();
            return module ? module.initOnboardingComponents() :
                console.error('Main module not loaded');
        },

        showToast: function(message, type) {
            const module = getMainModule();
            return module ? module.showToast(message, type) :
                console.error('Main module not loaded');
        },

        showModal: function(modalType, data) {
            const module = getMainModule();
            return module ? module.showModal(modalType, data) :
                console.error('Main module not loaded');
        },

        closeModal: function() {
            const module = getMainModule();
            return module ? module.closeModal() :
                console.error('Main module not loaded');
        },

        selectMood: function(mood) {
            const module = getMainModule();
            return module ? module.selectMood(mood) :
                console.error('Main module not loaded');
        },

        saveSleep: function() {
            const module = getMainModule();
            return module ? module.saveSleep() :
                console.error('Main module not loaded');
        },

        saveWeight: function() {
            const module = getMainModule();
            return module ? module.saveWeight() :
                console.error('Main module not loaded');
        },

        updateSymptomsList: function() {
            const module = getMainModule();
            return module ? module.updateSymptomsList() :
                console.error('Main module not loaded');
        },

        saveSymptom: function() {
            const module = getMainModule();
            return module ? module.saveSymptom() :
                console.error('Main module not loaded');
        }
    };
})();

// Экспорт для глобального доступа
if (typeof window !== 'undefined') {
    window.HealthUI = HealthUILegacy;
}

// Автоматическая загрузка main.js если он не загружен
if (typeof window !== 'undefined' && !window.HealthUI) {
    // В реальном проекте здесь должен быть динамический import
    console.log('🔗 health-ui.js: загружаю main.js для обратной совместимости');

    // Для совместимости в обычной среде
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.loadHealthModule === 'function') {
            window.loadHealthModule();
        }
    });
}