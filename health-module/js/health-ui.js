// health-module/js/health-ui.js
// ПОЛНАЯ РЕАЛИЗАЦИЯ для обратной совместимости

console.log('🔗 health-ui.js - полная реализация (совместимость)');

const HealthUILegacy = (function() {
    // Эмодзи для настроения (из оригинала)
    const MOOD_EMOJIS = {
        'радость': '😄',
        'удовлетворение': '🙂',
        'нейтрально': '😐',
        'грусть': '😔',
        'стресс': '😫',
        'гнев': '😠',
        'беспокойство': '😟',
        'усталость': '😴',
        'энергичность': '⚡️',
        'спокойствие': '😌'
    };

    // Цвета для интенсивности симптомов (из оригинала)
    const INTENSITY_COLORS = {
        1: '#4CAF50',
        2: '#8BC34A',
        3: '#FFC107',
        4: '#FF9800',
        5: '#F44336'
    };

    // === РЕАЛЬНАЯ РЕАЛИЗАЦИЯ КАК В ИСХОДНОМ ФАЙЛЕ ===

    /**
     * Инициализация компонентов главной панели
     */
    function initDashboardComponents() {
        console.log('📊 HealthUI.initDashboardComponents() вызван');

        // Пробуем использовать декомпозированные компоненты
        if (window.Dashboard && window.Dashboard.init) {
            console.log('✅ Использую Dashboard.init()');
            return window.Dashboard.init();
        }

        // Если компоненты не загружены, используем локальную реализацию
        console.log('⚠️ Dashboard не найден, использую локальную реализацию');
        initMedicationTracker();
        initWellnessGrid();
        initAddSymptomsButton();
        renderSummary();
    }

    /**
     * Инициализация трекера лекарств (из оригинала)
     */
    function initMedicationTracker() {
        const trackerContainer = document.getElementById('medication-tracker');
        if (!trackerContainer) {
            console.warn('⚠️ Контейнер medication-tracker не найден');
            return;
        }

        const state = HealthModule.getState();
        const medications = Array.isArray(state.todayMedications)
            ? state.todayMedications
            : [];

        console.log('💊 Загружено лекарств:', medications.length);

        if (medications.length === 0) {
            trackerContainer.innerHTML = `
                <div class="no-medications">
                    <div class="no-meds-icon">💊</div>
                    <p>На сегодня нет запланированных лекарств</p>
                    <button class="health-btn btn-secondary" onclick="HealthModule.switchTab('medications')">
                        Добавить лекарство
                    </button>
                </div>
            `;
            return;
        }

        let html = '<div class="medication-list">';

        medications.forEach(med => {
            const medicationId = med.medication_id || med.id || '';
            const time = med.time_of_day ?
                (typeof med.time_of_day === 'string' ? med.time_of_day.substring(0, 5) : '--:--')
                : '--:--';
            const status = med.status || 'pending';
            const isTaken = status === 'taken';
            const takenTime = med.taken_time ?
                `в ${new Date(med.taken_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
                : '';

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
                            `<button class="health-btn btn-primary" onclick="markMedicationTaken('${medicationId}')">
                                ✅ Принять
                            </button>
                            <button class="health-btn btn-secondary" onclick="markMedicationSkipped('${medicationId}')">
                                ⏭ Пропустить
                            </button>`
                        }
                    </div>
                </div>
            `;
        });

        html += '</div>';
        trackerContainer.innerHTML = html;
    }

    /**
     * Инициализация грида самочувствия (из оригинала)
     */
    function initWellnessGrid() {
        const gridContainer = document.getElementById('wellness-grid');
        if (!gridContainer) return;

        const state = HealthModule.getState();

        html = `
            <div class="wellness-grid">
                <div class="wellness-item" onclick="showMoodPicker()">
                    <div class="wellness-icon">${getMoodEmoji(state.todayEntry?.mood)}</div>
                    <div class="wellness-label">Настроение</div>
                    <div class="wellness-value">${state.todayEntry?.mood || 'Добавить'}</div>
                </div>

                <div class="wellness-item" onclick="showSleepInput()">
                    <div class="wellness-icon">🌙</div>
                    <div class="wellness-label">Сон</div>
                    <div class="wellness-value">${state.todayEntry?.sleep_hours ? `${state.todayEntry.sleep_hours} ч` : 'Добавить'}</div>
                </div>

                <div class="wellness-item" onclick="showWeightInput()">
                    <div class="wellness-icon">⚖️</div>
                    <div class="wellness-label">Вес</div>
                    <div class="wellness-value">${state.todayEntry?.weight ? `${state.todayEntry.weight} кг` : 'Добавить'}</div>
                </div>

                <div class="wellness-item" onclick="HealthModule.switchTab('diary')">
                    <div class="wellness-icon">🤕</div>
                    <div class="wellness-label">Симптомы</div>
                    <div class="wellness-value">${state.todayEntry?.symptoms?.length || 0}</div>
                </div>
            </div>
        `;

        gridContainer.innerHTML = html;
    }

    /**
     * Инициализация кнопки добавления симптомов (из оригинала)
     */
    function initAddSymptomsButton() {
        const button = document.getElementById('add-symptoms-btn');
        if (!button) return;

        button.addEventListener('click', () => {
            showSymptomPicker();
        });
    }

    /**
     * Отобразить сводку (из оригинала)
     */
    function renderSummary() {
        const summaryContainer = document.getElementById('health-summary');
        if (!summaryContainer) return;

        const state = HealthModule.getState();

        if (!state.stats) {
            summaryContainer.innerHTML = '<p>Загрузка сводки...</p>';
            return;
        }

        html = `
            <div class="summary-card">
                <h3>📊 За последние 7 дней</h3>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <div class="stat-value">${state.stats.entries_count || 0}</div>
                        <div class="stat-label">записей</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-value">${state.stats.average_sleep ? state.stats.average_sleep.toFixed(1) : '0'}</div>
                        <div class="stat-label">ч сна в среднем</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-value">${state.stats.medication_adherence ? Math.round(state.stats.medication_adherence) : 0}%</div>
                        <div class="stat-label">приверженность лечению</div>
                    </div>
                </div>
            </div>
        `;

        summaryContainer.innerHTML = html;
    }

    /**
     * Получить эмодзи для настроения (из оригинала)
     */
    function getMoodEmoji(mood) {
        return MOOD_EMOJIS[mood] || '😐';
    }

    // === ПРОКСИ-МЕТОДЫ ДЛЯ ОСТАЛЬНЫХ ФУНКЦИЙ ===

    /**
     * Показать тост-уведомление
     */
    function showToast(message, type = 'info') {
        if (window.HealthUI && window.HealthUI.showToast) {
            HealthUI.showToast(message, type);
        } else {
            // Fallback
            console.log(`[${type.toUpperCase()}] ${message}`);
            alert(message);
        }
    }

    // Глобальные функции для onclick из HTML

    window.markMedicationTaken = async function(medicationId) {
        try {
            const success = await HealthModule.logMedication(medicationId, 'taken');

            if (success) {
                HealthUI.showToast('✅ Лекарство отмечено как принятое', 'success');
                await HealthModule.refreshData();
            } else {
                HealthUI.showToast('❌ Не удалось отметить прием', 'error');
            }
        } catch (error) {
            console.error('❌ Error marking medication as taken:', error);
            HealthUI.showToast('❌ Ошибка отметки приема', 'error');
        }
    };

    window.markMedicationSkipped = async function(medicationId) {
        try {
            const success = await HealthModule.logMedication(medicationId, 'skipped');

            if (success) {
                HealthUI.showToast('⏭ Лекарство пропущено', 'info');
                await HealthModule.refreshData();
            } else {
                HealthUI.showToast('❌ Не удалось отметить пропуск', 'error');
            }
        } catch (error) {
            console.error('❌ Error marking medication as skipped:', error);
            HealthUI.showToast('❌ Ошибка отметки пропуска', 'error');
        }
    };

    window.showMoodPicker = function() {
        if (window.HealthUI && window.HealthUI.showModal) {
            HealthUI.showModal('mood-picker');
        } else if (window.ModalManager) {
            ModalManager.show('mood-picker');
        } else {
            console.error('❌ Modal system not loaded');
            showToast('⚠️ Функция временно недоступна', 'warning');
        }
    };

    window.showSleepInput = function() {
        if (window.HealthUI && window.HealthUI.showModal) {
            HealthUI.showModal('sleep-input');
        } else if (window.ModalManager) {
            ModalManager.show('sleep-input');
        } else {
            console.error('❌ Modal system not loaded');
            showToast('⚠️ Функция временно недоступна', 'warning');
        }
    };

    window.showWeightInput = function() {
        if (window.HealthUI && window.HealthUI.showModal) {
            HealthUI.showModal('weight-input');
        } else if (window.ModalManager) {
            ModalManager.show('weight-input');
        } else {
            console.error('❌ Modal system not loaded');
            showToast('⚠️ Функция временно недоступна', 'warning');
        }
    };

    window.showSymptomPicker = function() {
        if (window.HealthUI && window.HealthUI.showModal) {
            HealthUI.showModal('symptom-picker');
        } else if (window.ModalManager) {
            ModalManager.show('symptom-picker');
        } else {
            console.error('❌ Modal system not loaded');
            showToast('⚠️ Функция временно недоступна', 'warning');
        }
    };

    window.showMedicationForm = function() {
        if (window.HealthUI && window.HealthUI.showModal) {
            HealthUI.showModal('medication-form');
        } else if (window.ModalManager) {
            ModalManager.show('medication-form');
        } else {
            console.error('❌ Modal system not loaded');
            showToast('⚠️ Функция временно недоступна', 'warning');
        }
    };

    window.selectMood = function(mood) {
        const today = new Date().toISOString().split('T')[0];
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
        showToast('✅ Сохранено', 'success');
    };

    window.toggleArchiveView = function() {
        console.log('toggleArchiveView - заглушка');
    };

    window.editMedication = function(id) {
        console.log('editMedication - заглушка', id);
    };

    window.deleteMedication = function(id) {
        console.log('deleteMedication - заглушка', id);
    };

    window.removeSymptom = function(id) {
        console.log('removeSymptom - заглушка', id);
    };

    // === ПУБЛИЧНЫЙ ИНТЕРФЕЙС ===

    return {
        // Основные методы
        initDashboardComponents,
        initMedicationsComponents: function() {
            console.log('💊 HealthUI.initMedicationsComponents()');
            if (window.Medications && window.Medications.init) {
                return window.Medications.init();
            }
            console.warn('Medications не загружен');
        },
        initDiaryComponents: function() {
            console.log('📓 HealthUI.initDiaryComponents()');
            if (window.Diary && window.Diary.init) {
                return window.Diary.init();
            }
            console.warn('Diary не загружен');
        },
        initStatsComponents: function() {
            console.log('📈 HealthUI.initStatsComponents()');
            if (window.Stats && window.Stats.init) {
                return window.Stats.init();
            }
            console.warn('Stats не загружен');
        },
        initOnboardingComponents: function() {
            console.log('🎯 HealthUI.initOnboardingComponents()');
            if (window.Onboarding && window.Onboarding.init) {
                return window.Onboarding.init();
            }
            console.warn('Onboarding не загружен');
        },

        // Вспомогательные методы
        showToast,
        showModal: function(modalType, data = {}) {
            console.log(`📱 HealthUI.showModal(${modalType})`);
            // Простая реализация или делегирование
            if (window.ModalManager) {
                window.ModalManager.show(modalType, data);
            } else {
                console.warn('ModalManager не загружен');
            }
        },
        closeModal: function() {
            console.log('❌ HealthUI.closeModal()');
            if (window.ModalManager) {
                window.ModalManager.close();
            }
        },

        // Методы для обратной совместимости
        selectMood: async function(mood) {
            const today = new Date().toISOString().split('T')[0];
            const success = await HealthModule.updateHealthEntry(today, 'mood', mood);
            if (success) {
                showToast('✅ Настроение сохранено', 'success');
                HealthModule.refreshData();
            }
        },
        saveSleep: async function() {
            const input = document.getElementById('modal-sleep-input');
            if (!input || !input.value) return;
            const today = new Date().toISOString().split('T')[0];
            const success = await HealthModule.updateHealthEntry(today, 'sleep', parseFloat(input.value));
            if (success) {
                showToast('✅ Сон сохранён', 'success');
                HealthModule.refreshData();
            }
        },
        saveWeight: async function() {
            const input = document.getElementById('modal-weight-input');
            if (!input || !input.value) return;
            const today = new Date().toISOString().split('T')[0];
            const success = await HealthModule.updateHealthEntry(today, 'weight', parseFloat(input.value));
            if (success) {
                showToast('✅ Вес сохранён', 'success');
                HealthModule.refreshData();
            }
        },
        updateSymptomsList: function() {
            console.log('🔄 HealthUI.updateSymptomsList()');
        },
        saveSymptom: async function() {
            console.log('💾 HealthUI.saveSymptom()');
            return false;
        },

        // Маркер для обратной совместимости
        __isLegacyImplementation: true
    };
})();

// Экспорт в глобальную область
if (typeof window !== 'undefined') {
    window.HealthUI = HealthUILegacy;
    console.log('✅ HealthUI (legacy) загружен');
}

// Если main.js загрузится позже, он может перезаписать HealthUI
Object.defineProperty(window, 'HealthUIMain', {
    set: function(value) {
        console.log('✅ HealthUIMain установлен (main.js загружен)');
        window.__HealthUIMain = value;
        // НЕ перезаписываем HealthUI, чтобы старый код работал
    },
    get: function() {
        return window.__HealthUIMain;
    }
});