// js/components/Diary.js
const Diary = (function() {
    let currentDate = null;

    function init() {
        console.log('📔 Инициализация компонента Diary');
        initCalendar();
        initTodayButton();
        loadToday();
    }

    function initCalendar() {
        const calendarContainer = document.getElementById('health-calendar');
        if (!calendarContainer) {
            console.warn('⚠️ Контейнер health-calendar не найден');
            return;
        }

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        calendarContainer.innerHTML = renderCalendar(currentYear, currentMonth, today);
    }

    function renderCalendar(year, month, today) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let html = '<div class="calendar-header">';
        html += `<h3>${HealthFormatters.getMonthName(month)} ${year}</h3>`;
        html += '</div>';

        html += '<div class="calendar-grid">';

        // Дни недели
        const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        weekDays.forEach(day => {
            html += `<div class="calendar-weekday">${day}</div>`;
        });

        // Пустые ячейки до первого дня
        const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = 0; i < firstDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Дни месяца
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}"
                     onclick="Diary.loadDate('${dateStr}')">
                    ${day}
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    function initTodayButton() {
        const todayBtn = document.getElementById('today-btn');
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                loadToday();
            });
        }
    }

    function loadToday() {
        const today = new Date().toISOString().split('T')[0];
        loadDate(today);
    }

    async function loadDate(date) {
        currentDate = date;
        console.log('📅 Загрузка записи за дату:', date);

        try {
            const response = await HealthAPI.getEntryByDate(date);

            if (response.success) {
                renderEntryForm(date, response.data);
            } else {
                renderEntryForm(date, null);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки записи:', error);
            renderEntryForm(date, null);
        }
    }

    function renderEntryForm(date, entry) {
        const container = document.getElementById('entry-form');
        if (!container) {
            console.warn('⚠️ Контейнер entry-form не найден');
            return;
        }

        const formattedDate = HealthFormatters.formatDate(date, { weekday: 'long' });

        container.innerHTML = renderEntryFormHtml(date, formattedDate, entry);
    }

    function renderEntryFormHtml(date, formattedDate, entry) {
        const state = HealthModule.getState();
        const sexualActivityOptions = state.userOptions?.sexual_activity_options || [];

        const sexualActivityOptionsHtml = sexualActivityOptions.map(option => {
            const selected = entry?.sexual_activity === option ? 'selected' : '';
            const label = option.replace(/_/g, ' ');
            return `<option value="${option}" ${selected}>${label}</option>`;
        }).join('');

        return `
            <div class="entry-form">
                <h3>📅 ${formattedDate}</h3>

                <div class="form-section">
                    <label>Настроение</label>
                    <div class="mood-selector">
                        ${renderMoodOptions(entry?.mood)}
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
                    <button class="btn-secondary" onclick="Diary.showSymptomPicker()">
                        + Добавить симптом
                    </button>
                </div>

                <div class="form-section">
                    <label>Заметки</label>
                    <textarea id="notes-input" rows="4"
                              placeholder="Как вы себя чувствовали сегодня?">${entry?.notes || ''}</textarea>
                </div>

                <div class="form-actions">
                    <button class="btn-primary" onclick="Diary.saveEntry('${date}')">
                        💾 Сохранить запись
                    </button>
                </div>
            </div>
        `;
    }

    function renderMoodOptions(currentMood) {
        const moods = [
            { value: 'радость', emoji: '😄' },
            { value: 'удовлетворение', emoji: '🙂' },
            { value: 'нейтрально', emoji: '😐' },
            { value: 'грусть', emoji: '😔' }
        ];

        return moods.map(mood => {
            const active = currentMood === mood.value ? 'active' : '';
            return `
                <button class="mood-option ${active}"
                        onclick="Diary.selectMood('${currentDate}', '${mood.value}')">
                    ${mood.emoji} ${mood.value}
                </button>
            `;
        }).join('');
    }

    function renderSymptomsList(symptoms) {
        if (!symptoms || symptoms.length === 0) {
            return '<p class="no-symptoms">Симптомы не добавлены</p>';
        }

        let html = '<div class="symptoms-tags">';

        symptoms.forEach(symptom => {
            const color = HealthFormatters.getIntensityColor(symptom.intensity);

            html += `
                <div class="symptom-tag" style="border-color: ${color}">
                    <span class="symptom-name">${symptom.name}</span>
                    <span class="symptom-intensity">${'●'.repeat(symptom.intensity)}</span>
                    <button class="symptom-remove" onclick="Diary.removeSymptom('${symptom.id}', '${currentDate}')">×</button>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    async function selectMood(date, mood) {
        console.log('😊 Выбор настроения:', mood, 'для даты:', date);

        const success = await HealthModule.updateHealthEntry(date, 'mood', mood);
        if (success) {
            showToast('✅ Настроение сохранено', 'success');
            loadDate(date);
        }
    }

    async function removeSymptom(symptomId, date) {
        console.log('🗑️ Удаление симптома:', symptomId, 'для даты:', date);
        // TODO: Реализовать удаление симптома через API
        showToast('⚠️ Функция в разработке', 'info');
    }

    async function saveEntry(date) {
        console.log('💾 Сохранение записи за дату:', date);

        const sleep = document.getElementById('sleep-input')?.value;
        const weight = document.getElementById('weight-input')?.value;
        const notes = document.getElementById('notes-input')?.value;
        const sexualActivity = document.getElementById('sexual-activity-input')?.value;

        const promises = [];

        if (sleep) promises.push(HealthModule.updateHealthEntry(date, 'sleep', parseFloat(sleep)));
        if (weight) promises.push(HealthModule.updateHealthEntry(date, 'weight', parseFloat(weight)));
        if (notes) promises.push(HealthModule.updateHealthEntry(date, 'notes', notes));
        if (sexualActivity) promises.push(HealthModule.updateHealthEntry(date, 'sexual_activity', sexualActivity));

        try {
            await Promise.all(promises);
            showToast('✅ Запись сохранена', 'success');
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            showToast('❌ Ошибка сохранения', 'error');
        }
    }

    function showSymptomPicker() {
        console.log('🔍 Открытие выбора симптомов...');
        if (window.SimpleModalManager) {
            SimpleModalManager.show('symptom-picker');
        } else {
            showToast('⚠️ Функция в разработке', 'info');
        }
    }

    // Публичный API
    return {
        init,
        loadDate,
        selectMood,
        removeSymptom,
        saveEntry,
        showSymptomPicker
    };
})();

// Глобальная функция для onclick
window.showSymptomPicker = () => Diary.showSymptomPicker();

// Экспорт
if (typeof window !== 'undefined') {
    window.Diary = Diary;
}