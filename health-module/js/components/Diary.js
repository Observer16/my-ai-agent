// health-module/js/components/Diary.js


/**
 * Компонент дневника здоровья
 */
const Diary = {
    currentDate: null,

    /**
     * Инициализация компонентов дневника
     */
    init() {
        this.initCalendar();
        this.initTodayButton();
        this.loadToday();
    },

    /**
     * Инициализация календаря
     */
    initCalendar() {
        const calendarContainer = document.getElementById('health-calendar');
        if (!calendarContainer) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        calendarContainer.innerHTML = this.renderCalendar(currentYear, currentMonth, today);
    },

    /**
     * Рендер календаря
     */
    renderCalendar(year, month, today) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let html = '<div class="calendar-header">';
        html += `<h3>${getMonthName(month)} ${year}</h3>`;
        html += '</div>';

        html += '<div class="calendar-grid">';

        // Дни недели
        const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        weekDays.forEach(day => {
            html += `<div class="calendar-weekday">${day}</div>`;
        });

        // Пустые ячейки до первого дня
        for (let i = 0; i < firstDay.getDay(); i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Дни месяца
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = day === today.getDate() && month === today.getMonth();

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}"
                     onclick="Diary.loadDate('${dateStr}')">
                    ${day}
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Инициализация кнопки "Сегодня"
     */
    initTodayButton() {
        const todayBtn = document.getElementById('today-btn');
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                this.loadToday();
            });
        }
    },

    /**
     * Загрузка данных за сегодня
     */
    loadToday() {
        const today = new Date().toISOString().split('T')[0];
        this.loadDate(today);
    },

    /**
     * Загрузить данные за дату
     */
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
            HealthUI.showToast('Ошибка загрузки данных', 'error');
            this.renderEntryForm(date, null);
        }
    },

    /**
     * Отобразить форму записи
     */
    renderEntryForm(date, entry) {
        const container = document.getElementById('entry-form');
        if (!container) return;

        const formattedDate = formatDate(date, { weekday: 'long' });

        container.innerHTML = this.renderEntryFormHtml(date, formattedDate, entry);
    },

    /**
     * Рендер HTML формы записи
     */
    renderEntryFormHtml(date, formattedDate, entry) {
        // Получаем доступные опции для пользователя
        const state = HealthModule.getState();
        const sexualActivityOptions = state.userOptions?.sexual_activity_options || [];

        // Генерируем опции для select
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
                        <button class="mood-option" onclick="Diary.selectMood('${date}', 'радость')">
                            😄 Радость
                        </button>
                        <button class="mood-option" onclick="Diary.selectMood('${date}', 'удовлетворение')">
                            🙂 Удовлетворение
                        </button>
                        <button class="mood-option" onclick="Diary.selectMood('${date}', 'нейтрально')">
                            😐 Нейтрально
                        </button>
                        <button class="mood-option" onclick="Diary.selectMood('${date}', 'грусть')">
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
                        ${this.renderSymptomsList(entry?.symptoms || [])}
                    </div>
                    <button class="btn-secondary" onclick="HealthUI.showModal('symptom-picker', { date: '${date}' })">
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
    },

    /**
     * Отобразить список симптомов
     */
    renderSymptomsList(symptoms) {
        if (symptoms.length === 0) {
            return '<p class="no-symptoms">Симптомы не добавлены</p>';
        }

        let html = '<div class="symptoms-tags">';

        symptoms.forEach(symptom => {
            const color = getIntensityColor(symptom.intensity);

            html += `
                <div class="symptom-tag" style="border-color: ${color}">
                    <span class="symptom-name">${symptom.name}</span>
                    <span class="symptom-intensity">${'●'.repeat(symptom.intensity)}</span>
                    <button class="symptom-remove" onclick="Diary.removeSymptom('${symptom.id}', '${this.currentDate}')">×</button>
                </div>
            `;
        });

        html += '</div>';
        return html;
    },

    /**
     * Выбор настроения
     */
    async selectMood(date, mood) {
        const success = await HealthModule.updateHealthEntry(date, 'mood', mood);
        if (success) {
            HealthUI.showToast('✅ Настроение сохранено', 'success');
            this.loadDate(date); // Перезагружаем форму
        }
    },

    /**
     * Удаление симптома
     */
    async removeSymptom(symptomId, date) {
        // Здесь должна быть реализация удаления симптома
        console.log('Удаление симптома:', symptomId, 'для даты:', date);
        // После удаления перезагружаем форму
        this.loadDate(date);
    },

    /**
     * Сохранение записи
     */
    async saveEntry(date) {
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
            HealthUI.showToast('✅ Сохранено', 'success');
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            HealthUI.showToast('Ошибка сохранения', 'error');
        }
    }
};

// Экспорт компонента
if (typeof window !== 'undefined') {
    window.Diary = Diary;
}