// js/components/Diary.js
const Diary = (function() {
    let currentDate = null;

    function init() {
        if (typeof HealthConstants === 'undefined') {
            console.error('❌ HealthConstants не загружен!');
            return;
        }

        console.log('📔 Инициализация компонента Diary');
        initCalendar();
        initTodayButton();
        loadToday();

        console.log('✅ Diary module loaded');
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

        // Получаем дни недели из переводов
        const weekDays = typeof t === 'function'
            ? t('health.diary.weekdays_short')
            : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        weekDays.forEach(day => {
            html += `<div class="calendar-weekday">${day}</div>`;
        });

        const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = 0; i < firstDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

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
        const today = getTodayLocal();
        loadDate(today);
    }

    async function loadDate(date) {
        currentDate = date;
        console.log('📅 Загрузка записи за дату:', date);

        try {
            const response = await HealthAPI.getEntryByDate(date);

            if (response.success) {
                await renderEntryForm(date, response.data);
            } else {
                await renderEntryForm(date, null);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки записи:', error);
            await renderEntryForm(date, null);
        }
    }

    async function renderEntryForm(date, entry) {
        const container = document.getElementById('entry-form');
        if (!container) {
            console.warn('⚠️ Контейнер entry-form не найден');
            return;
        }

        const formattedDate = HealthFormatters.formatDate(date, { weekday: 'long' });

        let sexualActivityOptions = [];

        if (typeof OptionsCache !== 'undefined' && OptionsCache.getUserOptions) {
            try {
                const optionsResult = await OptionsCache.getUserOptions();

                if (optionsResult.success && optionsResult.data) {
                    sexualActivityOptions = optionsResult.data.sexual_activity_options || [];

                    if (HealthConfig.DEBUG) {
                        console.log('✅ Опции для Diary загружены:', {
                            source: optionsResult.source,
                            optionsCount: sexualActivityOptions.length,
                            options: sexualActivityOptions
                        });
                    }
                } else {
                    console.warn('⚠️ Не удалось загрузить опции:', optionsResult.error);
                }
            } catch (error) {
                console.error('❌ Ошибка загрузки опций для Diary:', error);
            }
        } else {
            console.warn('⚠️ OptionsCache недоступен, используем state.userOptions');
            const state = HealthModule.getState();
            sexualActivityOptions = state.userOptions?.sexual_activity_options || [];
        }

        container.innerHTML = renderEntryFormHtml(date, formattedDate, entry, sexualActivityOptions);
    }

    function renderEntryFormHtml(date, formattedDate, entry, sexualActivityOptions) {
        const sexualActivityOptionsHtml = sexualActivityOptions.map(option => {
            const selected = entry?.sexual_activity === option ? 'selected' : '';
            const label = option.replace(/_/g, ' ');
            return `<option value="${option}" ${selected}>${label}</option>`;
        }).join('');

        const notSpecified = typeof t === 'function' ? t('health.diary.no_entry') : 'Не указано';
        let moodOptions = [{ value: '', label: notSpecified }];

        if (typeof HealthConstants !== 'undefined' && HealthConstants.getMoodsWithEmojis) {
            const moods = HealthConstants.getMoodsWithEmojis();
            moodOptions = [
                { value: '', label: notSpecified },
                ...moods.map(mood => ({
                    value: mood.value,
                    label: mood.label
                }))
            ];
        } else {
            console.warn('⚠️ HealthConstants недоступен, используем fallback настроения');
            moodOptions = [
                { value: '', label: notSpecified },
                { value: 'joy', label: typeof t === 'function' ? t('health.moods.joy') : 'Радость' },
                { value: 'satisfaction', label: typeof t === 'function' ? t('health.moods.satisfaction') : 'Удовлетворение' },
                { value: 'neutral', label: typeof t === 'function' ? t('health.moods.neutral') : 'Нейтрально' },
                { value: 'sadness', label: typeof t === 'function' ? t('health.moods.sadness') : 'Грусть' }
            ];
        }

        const moodOptionsHtml = moodOptions.map(option => {
            const selected = entry?.mood === option.value ? 'selected' : '';
            return `<option value="${option.value}" ${selected}>${option.label}</option>`;
        }).join('');

        const moodLabel = typeof t === 'function' ? t('health.dashboard.mood') : 'Настроение';
        const sleepLabel = typeof t === 'function' ? t('health.diary.sleep_label') : 'Сон (часы)';
        const sleepPlaceholder = typeof t === 'function' ? t('health.diary.sleep_placeholder') : 'Например: 7.5';
        const sexualActivityLabel = typeof t === 'function' ? t('health.dashboard.intimacy') : '🔒 Сексуальная активность (приватно)';
        const sexualActivityNote = typeof t === 'function' ? t('health.diary.sexual_activity_note') : 'Только для вас';
        const symptomsLabel = typeof t === 'function' ? t('health.dashboard.symptoms') : 'Симптомы';
        const addSymptomBtn = typeof t === 'function' ? t('health.diary.add_symptom_btn') : '+ Добавить симптом';
        const notesLabel = typeof t === 'function' ? t('health.diary.notes_label') : 'Заметки';
        const notesPlaceholder = typeof t === 'function' ? t('health.diary.notes_placeholder') : 'Как вы себя чувствовали сегодня?';
        const saveBtn = typeof t === 'function' ? t('health.diary.save_btn') : '💾 Сохранить запись';

        return `
            <div class="entry-form">
                <h3>📅 ${formattedDate}</h3>

                <div class="form-section">
                    <label>${moodLabel}</label>
                    <select id="mood-input" class="modal-input">
                        ${moodOptionsHtml}
                    </select>
                </div>

                <div class="form-section">
                    <label>${sleepLabel}</label>
                    <input type="number" id="sleep-input" min="0" max="24" step="0.5"
                           value="${entry?.sleep_hours || ''}"
                           placeholder="${sleepPlaceholder}">
                </div>

                <div class="form-section">
                    <label>
                        🔒 ${sexualActivityLabel}
                        <span style="font-size: 12px; color: var(--health-text-light); margin-left: 8px;">
                            ${sexualActivityNote}
                        </span>
                    </label>
                    <select id="sexual-activity-input" class="modal-input">
                        <option value="">${notSpecified}</option>
                        ${sexualActivityOptionsHtml}
                    </select>
                </div>

                <div class="form-section">
                    <label>${symptomsLabel}</label>
                    <div id="symptoms-list">
                        ${renderSymptomsList(entry?.symptoms || [])}
                    </div>
                    <button class="btn-secondary" onclick="Diary.showSymptomPicker()">
                        ${addSymptomBtn}
                    </button>
                </div>

                <div class="form-section">
                    <label>${notesLabel}</label>
                    <textarea id="notes-input" rows="4"
                              placeholder="${notesPlaceholder}">${entry?.notes || ''}</textarea>
                </div>

                <div class="form-actions">
                    <button class="btn-primary" onclick="Diary.saveEntry('${date}')">
                        ${saveBtn}
                    </button>
                </div>
            </div>
        `;
    }

    function renderSymptomsList(symptoms) {
        if (!symptoms || symptoms.length === 0) {
            const noSymptomsText = typeof t === 'function' ? t('health.diary.no_symptoms') : 'Симптомы не добавлены';
            return `<p class="no-symptoms">${noSymptomsText}</p>`;
        }

        let html = '<div class="symptoms-tags" style="display: flex; flex-direction: column; gap: 12px;">';

        symptoms.forEach(symptom => {
            const color = HealthFormatters.getIntensityColor(symptom.intensity);

            html += `
                <div class="symptom-tag" style="
                    display: flex;
                    flex-direction: column;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 2px solid ${color};
                    width: calc(100% - 32px);
                    position: relative;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <span class="symptom-name" style="flex: 1; font-size: 16px; font-weight: 500;">${symptom.name}</span>
                        <button class="symptom-remove"
                                onclick="Diary.removeSymptom('${symptom.id}', '${currentDate}')"
                                style="
                                    background: none;
                                    border: none;
                                    color: var(--health-text-light);
                                    font-size: 24px;
                                    cursor: pointer;
                                    padding: 0;
                                    width: 24px;
                                    height: 24px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">×</button>
                    </div>
                    <div style="display: flex; justify-content: center;">
                        <span class="symptom-intensity" style="color: ${color}; font-size: 18px;">${'●'.repeat(symptom.intensity)}</span>
                    </div>
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
        showToast('⚠️ Функция в разработке', 'info');
    }

    async function addSymptom(symptomData) {
        console.log('➕ Добавление симптома:', symptomData);

        try {
            const response = await HealthAPI.addSymptom(currentDate, symptomData);

            if (response.success) {
                showToast('✅ Симптом добавлен', 'success');

                // Перезагрузить данные чтобы симптомы отобразились сразу
                await loadDate(currentDate);
            } else {
                showToast('❌ Ошибка добавления симптома', 'error');
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            showToast('❌ Ошибка добавления симптома', 'error');
        }
    }

    async function saveEntry(date) {
        console.log('💾 Сохранение записи за дату:', date);

        const sleep = document.getElementById('sleep-input')?.value;
        const mood = document.getElementById('mood-input')?.value;
        const notes = document.getElementById('notes-input')?.value;
        const sexualActivity = document.getElementById('sexual-activity-input')?.value;

        const promises = [];

        if (sleep) promises.push(HealthModule.updateHealthEntry(date, 'sleep', parseFloat(sleep)));
        if (mood) promises.push(HealthModule.updateHealthEntry(date, 'mood', mood));
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

    function showMoodPicker(date) {
        console.log('😊 Открытие выбора настроения для даты:', date);
        if (window.SimpleModalManager) {
            SimpleModalManager.show('mood-picker', { date });
        } else {
            showToast('⚠️ Функция в разработке', 'info');
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

    function getTodayLocal() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return {
        init,
        loadDate,
        selectMood,
        removeSymptom,
        addSymptom,
        saveEntry,
        showMoodPicker,
        showSymptomPicker
    };
})();

if (typeof window !== 'undefined') {
    window.Diary = Diary;
}

window.showSymptomPicker = () => Diary.showSymptomPicker();