// js/components/Diary.js
const Diary = (function() {
    let currentDate = null;
    let profileWeight = null; // Вес из профиля

    function init() {
        console.log('📔 Инициализация компонента Diary');
        initCalendar();
        initTodayButton();
        loadProfileWeight(); // Загрузить вес из профиля
        loadToday();
    }

    async function loadProfileWeight() {
        try {
            const result = await HealthAPI.getUserProfile();
            if (result.success && result.data?.weight_kg) {
                profileWeight = result.data.weight_kg;
                console.log('⚖️ Вес из профиля загружен:', profileWeight);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки веса из профиля:', error);
        }
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

        // Загружаем актуальные опции через кэш
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

        // Определяем какой вес показать: из записи, или из профиля
        const displayWeight = entry?.weight_kg || profileWeight || '';

        // Получаем настроения из HealthConstants
        const moodOptions = [
            { value: '', label: 'Не указано' },
            ...HealthConstants.getMoodsWithEmojis().map(mood => ({
                value: mood.value,
                label: mood.label
            }))
        ];

        const moodOptionsHtml = moodOptions.map(option => {
            const selected = entry?.mood === option.value ? 'selected' : '';
            return `<option value="${option.value}" ${selected}>${option.label}</option>`;
        }).join('');

        return `
            <div class="entry-form">
                <h3>📅 ${formattedDate}</h3>

                <div class="form-section">
                    <label>Настроение</label>
                    <select id="mood-input" class="modal-input">
                        ${moodOptionsHtml}
                    </select>
                </div>

                <div class="form-section">
                    <label>Сон (часы)</label>
                    <input type="number" id="sleep-input" min="0" max="24" step="0.5"
                           value="${entry?.sleep_hours || ''}"
                           placeholder="Например: 7.5">
                </div>

                <div class="form-section">
                    <label>Вес (кг)</label>
                    <input type="number" id="weight-input" min="20" max="300" step="0.1"
                           value="${displayWeight}"
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
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    function validateEntry(field, value) {
        switch(field) {
            case 'sleep':
                const sleep = parseFloat(value);
                if (isNaN(sleep) || sleep < 0 || sleep > 24) {
                    return { valid: false, error: 'Сон должен быть от 0 до 24 часов' };
                }
                break;
                
            case 'weight':
                const weight = parseFloat(value);
                if (isNaN(weight) || weight < 20 || weight > 300) {
                    return { valid: false, error: 'Вес должен быть от 20 до 300 кг' };
                }
                break;
                
            case 'notes':
                if (value.length > 1000) {
                    return { valid: false, error: 'Заметки слишком длинные (макс 1000 символов)' };
                }
                break;
        }
        
        return { valid: true };
    }

    async function saveEntry(date) {
        console.log('💾 Сохранение записи за дату:', date);

        const mood = document.getElementById('mood-input')?.value;
        const sleep = document.getElementById('sleep-input')?.value;
        const weight = document.getElementById('weight-input')?.value;
        const notes = document.getElementById('notes-input')?.value;
        const sexualActivity = document.getElementById('sexual-activity-input')?.value;

        const promises = [];
        
        // Сохранение настроения
        if (mood) {
            promises.push(
                HealthAPI.addMood(date, mood)
                    .then(result => ({ field: 'настроение', success: result.success, error: result.error }))
            );
        }
        
        // Валидация и сохранение сна
        if (sleep) {
            const validation = validateEntry('sleep', sleep);
            if (!validation.valid) {
                showToast(`❌ ${validation.error}`, 'error');
                return;
            }
            promises.push(
                HealthAPI.addSleep(date, parseFloat(sleep))
                    .then(result => ({ field: 'сон', success: result.success, error: result.error }))
            );
        }
        
        // Валидация и сохранение веса (и в запись, и в профиль)
        if (weight) {
            const validation = validateEntry('weight', weight);
            if (!validation.valid) {
                showToast(`❌ ${validation.error}`, 'error');
                return;
            }
            const weightValue = parseFloat(weight);
            
            // Сохраняем в запись
            promises.push(
                HealthAPI.addWeight(date, weightValue)
                    .then(result => ({ field: 'вес (запись)', success: result.success, error: result.error }))
            );
            
            // Сохраняем в профиль, если изменился
            if (profileWeight !== weightValue) {
                promises.push(
                    HealthAPI.updateUserProfile({ weight_kg: weightValue })
                        .then(result => {
                            if (result.success) {
                                profileWeight = weightValue; // Обновляем локальное значение
                            }
                            return { field: 'вес (профиль)', success: result.success, error: result.error };
                        })
                );
            }
        }
        
        // Сохранение заметок
        if (notes) {
            const validation = validateEntry('notes', notes);
            if (!validation.valid) {
                showToast(`❌ ${validation.error}`, 'error');
                return;
            }
            promises.push(
                HealthAPI.addNotes(date, notes)
                    .then(result => ({ field: 'заметки', success: result.success, error: result.error }))
            );
        }
        
        // Сохранение сексуальной активности
        if (sexualActivity) {
            promises.push(
                HealthAPI.addSexualActivity(date, sexualActivity)
                    .then(result => ({ field: 'сексуальная активность', success: result.success, error: result.error }))
            );
        }

        if (promises.length === 0) {
            showToast('⚠️ Нет изменений для сохранения', 'info');
            return;
        }

        try {
            const results = await Promise.all(promises);
            
            // Проверяем результаты
            const failed = results.filter(r => !r.success);
            
            if (failed.length === 0) {
                showToast('✅ Запись сохранена', 'success');
                await loadDate(date); // Перезагрузить форму
            } else {
                const errors = failed.map(f => `${f.field}: ${f.error}`).join(', ');\n                showToast(`⚠️ Частично сохранено. Ошибки: ${errors}`, 'warning');
                await loadDate(date); // Всё равно перезагрузить
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            showToast('❌ Ошибка сохранения', 'error');
        }
    }

    function showSymptomPicker() {
        console.log('🔍 Открытие выбора симптомов...');
        if (window.SimpleModalManager) {
            SimpleModalManager.show('symptom-picker', { date: currentDate });
        } else {
            showToast('⚠️ Функция в разработке', 'info');
        }
    }

    return {
        init,
        loadDate,
        saveEntry,
        showSymptomPicker
    };
})();

if (typeof window !== 'undefined') {
    window.Diary = Diary;
}

window.showSymptomPicker = () => Diary.showSymptomPicker();
