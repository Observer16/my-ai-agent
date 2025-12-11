// health-module/js/health-ui.js
// ПОЛНЫЙ ФАЙЛ С ВСЕМИ КОМПОНЕНТАМИ INLINE

console.log('🔗 health-ui.js - полная реализация с inline компонентами');

// ========== ВСТРАИВАЕМ ВСЕ КОМПОНЕНТЫ ==========

// 1. Dashboard компонент
const Dashboard = {
    isInitialized: false,

    init() {
        if (this.isInitialized) {
            console.log('⚠️ Dashboard уже инициализирован');
            return;
        }

        this.isInitialized = true;
        console.log('📊 Dashboard.init()');

        this.initMedicationTracker();
        this.initWellnessGrid();
        this.initAddSymptomsButton();
        this.renderSummary();
    },

    initMedicationTracker() {
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
    },

    initWellnessGrid() {
        const gridContainer = document.getElementById('wellness-grid');
        if (!gridContainer) return;

        const state = HealthModule.getState();
        const MOOD_EMOJIS = {
            'радость': '😄', 'удовлетворение': '🙂', 'нейтрально': '😐', 'грусть': '😔',
            'стресс': '😫', 'гнев': '😠', 'беспокойство': '😟', 'усталость': '😴',
            'энергичность': '⚡️', 'спокойствие': '😌'
        };

        const getMoodEmoji = (mood) => MOOD_EMOJIS[mood] || '😐';

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
    },

    initAddSymptomsButton() {
        const button = document.getElementById('add-symptoms-btn');
        if (!button) return;

        button.addEventListener('click', () => {
            window.showSymptomPicker();
        });
    },

    renderSummary() {
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
};

// 2. Diary компонент
const Diary = {
    currentDate: null,

    init() {
        console.log('📓 Diary.init()');
        this.initCalendar();
        this.initTodayButton();
        this.loadToday();
    },

    initCalendar() {
        const calendarContainer = document.getElementById('health-calendar');
        if (!calendarContainer) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        let html = '<div class="calendar-header">';
        html += `<h3>${months[currentMonth]} ${currentYear}</h3>`;
        html += '</div>';

        html += '<div class="calendar-grid">';
        const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        weekDays.forEach(day => {
            html += `<div class="calendar-weekday">${day}</div>`;
        });

        for (let i = 0; i < firstDay.getDay(); i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = day === today.getDate() && currentMonth === today.getMonth();

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}"
                     onclick="Diary.loadDate('${dateStr}')">
                    ${day}
                </div>
            `;
        }

        html += '</div>';
        calendarContainer.innerHTML = html;
    },

    initTodayButton() {
        const todayBtn = document.getElementById('today-btn');
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                this.loadToday();
            });
        }
    },

    loadToday() {
        const today = new Date().toISOString().split('T')[0];
        this.loadDate(today);
    },

    async loadDate(date) {
        this.currentDate = date;

        try {
            const response = await HealthAPI.getEntryByDate(date);

            if (response.success) {
                this.renderEntryForm(date, response.data);
            } else {
                this.renderEntryForm(date, null);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки записи:', error);
            this.renderEntryForm(date, null);
        }
    },

    renderEntryForm(date, entry) {
        const container = document.getElementById('entry-form');
        if (!container) return;

        const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const state = HealthModule.getState();
        const sexualActivityOptions = state.userOptions?.sexual_activity_options || [];

        const sexualActivityOptionsHtml = sexualActivityOptions.map(option => {
            const selected = entry?.sexual_activity === option ? 'selected' : '';
            const label = option.replace(/_/g, ' ');
            return `<option value="${option}" ${selected}>${label}</option>`;
        }).join('');

        const INTENSITY_COLORS = {
            1: '#4CAF50', 2: '#8BC34A', 3: '#FFC107', 4: '#FF9800', 5: '#F44336'
        };

        const renderSymptomsList = (symptoms) => {
            if (symptoms.length === 0) {
                return '<p class="no-symptoms">Симптомы не добавлены</p>';
            }

            let html = '<div class="symptoms-tags">';
            symptoms.forEach(symptom => {
                const color = INTENSITY_COLORS[symptom.intensity] || '#4CAF50';
                html += `
                    <div class="symptom-tag" style="border-color: ${color}">
                        <span class="symptom-name">${symptom.name}</span>
                        <span class="symptom-intensity">${'●'.repeat(symptom.intensity)}</span>
                        <button class="symptom-remove" onclick="removeSymptom('${symptom.id}')">×</button>
                    </div>
                `;
            });
            html += '</div>';
            return html;
        };

        const html = `
            <div class="entry-form">
                <h3>📅 ${formattedDate}</h3>

                <div class="form-section">
                    <label>Настроение</label>
                    <div class="mood-selector">
                        <button class="mood-option" onclick="selectMood('радость')">
                            😄 Радость
                        </button>
                        <button class="mood-option" onclick="selectMood('удовлетворение')">
                            🙂 Удовлетворение
                        </button>
                        <button class="mood-option" onclick="selectMood('нейтрально')">
                            😐 Нейтрально
                        </button>
                        <button class="mood-option" onclick="selectMood('грусть')">
                            😔 Грусть
                        </button>
                    </div>
                </div>

                <div class="form-section">
                    <label>Сон (часы)</label>
                    <input type="number" id="sleep-input" min="0" max="24" step="0.5"
                           value="${entry?.sleep_hours || ''}"
                           placeholder="Например: 7.5">
                </div>

                <div class="form-section">
                    <label>Вес (кг)</label>
                    <input type="number" id="weight-input" min="0" max="500" step="0.1"
                           value="${entry?.weight || ''}"
                           placeholder="Например: 70.5">
                </div>

                <div class="form-section">
                    <label>
                        🔒 Сексуальная активность (приватно)
                        <span style="font-size: 12px; color: var(--health-text-light); margin-left: 8px;">
                            Только для вас
                        </span>
                    </label>
                    <select id="sexual-activity-input" class="modal-input">
                        <option value="">Не указано</option>
                        ${sexualActivityOptionsHtml}
                    </select>
                </div>

                <div class="form-section">
                    <label>Симптомы</label>
                    <div id="symptoms-list">
                        ${renderSymptomsList(entry?.symptoms || [])}
                    </div>
                    <button class="btn-secondary" onclick="showSymptomPicker()">
                        + Добавить симптом
                    </button>
                </div>

                <div class="form-section">
                    <label>Заметки</label>
                    <textarea id="notes-input" rows="4"
                              placeholder="Как вы себя чувствовали сегодня?">${entry?.notes || ''}</textarea>
                </div>

                <div class="form-actions">
                    <button class="btn-primary" onclick="saveEntry('${date}')">
                        💾 Сохранить запись
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
};

// 3. Medications компонент (упрощенный)
const Medications = {
    showArchived: false,

    init() {
        console.log('💊 Medications.init()');
        this.renderMedicationsList();
    },

    renderMedicationsList() {
        const container = document.getElementById('medications-list');
        if (!container) return;

        const state = HealthModule.getState();
        const medications = state.medications || [];

        if (medications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💊</div>
                    <h3>Аптечка пуста</h3>
                    <p>Добавьте лекарства, которые вы принимаете регулярно</p>
                    <button class="btn-primary" onclick="showMedicationForm()">
                        Добавить первое лекарство
                    </button>
                </div>
            `;
            return;
        }

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
                        <button class="btn-icon" onclick="editMedication('${med.id}')" title="Редактировать">
                            ✏️
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteMedication('${med.id}')" title="Удалить">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    },

    getNextSchedule(medication) {
        if (!medication.schedules || medication.schedules.length === 0) {
            return null;
        }

        const now = new Date();
        const today = now.getDay();

        for (const schedule of medication.schedules) {
            const days = schedule.days_of_week || [];
            const time = schedule.time_of_day;

            if (days.includes(today)) {
                return time.substring(0, 5);
            }
        }

        return 'Завтра';
    }
};

// 4. Stats компонент (упрощенный)
const Stats = {
    init() {
        console.log('📈 Stats.init()');
        this.renderStats();
    },

    renderStats() {
        const container = document.getElementById('stats-content');
        if (!container) return;

        const state = HealthModule.getState();

        if (!state.stats) {
            container.innerHTML = '<p>Загрузка статистики...</p>';
            return;
        }

        const adherence = state.stats.medication_adherence || 0;
        const remaining = 100 - adherence;

        html = `
            <div class="stats-section">
                <h3>💊 Приверженность лечению</h3>
                <div class="adherence-chart">
                    <div class="chart-container">
                        <div class="pie-chart" style="--percentage: ${adherence}%"></div>
                        <div class="chart-center">${Math.round(adherence)}%</div>
                    </div>
                    <div class="chart-legend">
                        <div class="legend-item">
                            <span class="legend-color" style="background-color: #4CAF50"></span>
                            <span>Принято вовремя: ${adherence.toFixed(1)}%</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background-color: #e0e0e0"></span>
                            <span>Пропущено: ${remaining.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
};

// 5. Onboarding компонент (упрощенный)
const Onboarding = {
    init() {
        console.log('🎯 Onboarding.init()');
        this.initGenderButtons();
    },

    initGenderButtons() {
        const genderContainer = document.getElementById('gender-options');
        if (!genderContainer) return;

        const GENDER_OPTIONS = [
            { value: 'male', label: 'Мужской', icon: '👨', description: 'Стандартные рекомендации для мужчин' },
            { value: 'female', label: 'Женский', icon: '👩', description: 'Включая женское здоровье' },
            { value: 'other', label: 'Другой', icon: '🧑', description: 'Общие рекомендации' },
            { value: 'prefer_not_to_say', label: 'Не указывать', icon: '🙅', description: 'Общие настройки' }
        ];

        GENDER_OPTIONS.forEach(option => {
            const button = document.createElement('button');
            button.className = 'gender-option';
            button.setAttribute('data-gender', option.value);

            button.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 16px;">${option.icon}</div>
                <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">${option.label}</div>
                <div style="font-size: 14px; color: #666;">${option.description}</div>
            `;

            button.addEventListener('click', () => {
                console.log('Выбран гендер:', option.value);
                // Простая реализация
                HealthModule.setUserGender(option.value);
            });

            genderContainer.appendChild(button);
        });
    }
};

// ========== ОСНОВНОЙ HealthUI ИНТЕРФЕЙС ==========

const HealthUILegacy = (function() {

    /**
     * Инициализация компонентов главной панели
     */
    function initDashboardComponents() {
        console.log('📊 HealthUI.initDashboardComponents()');
        return Dashboard.init();
    }

    /**
     * Показать тост-уведомление
     */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `health-toast toast-${type}`;
        toast.innerHTML = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // === ГЛОБАЛЬНЫЕ ФУНКЦИИ ===

    window.markMedicationTaken = async function(medicationId) {
        const success = await HealthModule.logMedication(medicationId, 'taken');
        if (success) {
            showToast('✅ Лекарство отмечено как принятое', 'success');
            HealthModule.refreshData();
        }
    };

    window.markMedicationSkipped = async function(medicationId) {
        const success = await HealthModule.logMedication(medicationId, 'skipped');
        if (success) {
            showToast('⏭ Лекарство пропущено', 'info');
            HealthModule.refreshData();
        }
    };

    window.showMoodPicker = function() {
        showModal('mood-picker');
    };

    window.showSleepInput = function() {
        showModal('sleep-input');
    };

    window.showWeightInput = function() {
        showModal('weight-input');
    };

    window.showSymptomPicker = function() {
        showModal('symptom-picker');
    };

    window.showMedicationForm = function() {
        showModal('medication-form');
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

    window.toggleArchiveView = function() {};
    window.editMedication = function(id) {};
    window.deleteMedication = function(id) {};
    window.removeSymptom = function(id) {};

    // === ПУБЛИЧНЫЙ ИНТЕРФЕЙС ===

    return {
        // Основные методы
        initDashboardComponents,
        initMedicationsComponents: function() {
            console.log('💊 HealthUI.initMedicationsComponents()');
            return Medications.init();
        },
        initDiaryComponents: function() {
            console.log('📓 HealthUI.initDiaryComponents()');
            return Diary.init();
        },
        initStatsComponents: function() {
            console.log('📈 HealthUI.initStatsComponents()');
            return Stats.init();
        },
        initOnboardingComponents: function() {
            console.log('🎯 HealthUI.initOnboardingComponents()');
            return Onboarding.init();
        },

        // Вспомогательные методы
        showToast,
        showModal: function(modalType, data = {}) {
            console.log(`📱 HealthUI.showModal(${modalType})`);
            // Простая реализация
            showToast(`Модальное окно: ${modalType}`, 'info');
        },
        closeModal: function() {
            console.log('❌ HealthUI.closeModal()');
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

        // Маркер
        __isLegacyImplementation: true
    };
})();

// ========== ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ==========

if (typeof window !== 'undefined') {
    // Экспортируем компоненты
    window.Dashboard = Dashboard;
    window.Diary = Diary;
    window.Medications = Medications;
    window.Stats = Stats;
    window.Onboarding = Onboarding;

    // Экспортируем основной интерфейс
    window.HealthUI = HealthUILegacy;

    console.log('✅ HealthUI с inline компонентами загружен');
}

// Если нужно, main.js может перезаписать эти компоненты
Object.defineProperty(window, 'HealthUIMain', {
    set: function(value) {
        console.log('✅ HealthUIMain установлен');
        window.__HealthUIMain = value;
    },
    get: function() {
        return window.__HealthUIMain;
    }
});