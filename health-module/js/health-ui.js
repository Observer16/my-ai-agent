// health-module/js/health-ui.js

/**
 * UI компоненты модуля здоровья
 */
const HealthUI = (function() {
    // Эмодзи для настроения
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

    // Цвета для интенсивности симптомов
    const INTENSITY_COLORS = {
        1: '#4CAF50', // Зеленый (низкая)
        2: '#8BC34A',
        3: '#FFC107', // Желтый (средняя)
        4: '#FF9800',
        5: '#F44336'  // Красный (высокая)
    };

    /**
     * Инициализация компонентов главной панели
     */
    function initDashboardComponents() {
        // Инициализируем трекер лекарств
        initMedicationTracker();

        // Инициализируем грид самочувствия
        initWellnessGrid();

        // Инициализируем кнопку добавления симптомов
        initAddSymptomsButton();

        // Отображаем сводку
        renderSummary();
    }

    /**
     * Инициализация трекера лекарств
     */
    function initMedicationTracker() {
        const trackerContainer = document.getElementById('medication-tracker');
        if (!trackerContainer) {
            console.warn('⚠️ Контейнер medication-tracker не найден');
            return;
        }

        const state = HealthModule.getState();

        // ГАРАНТИРУЕМ, что todayMedications - массив
        const medications = Array.isArray(state.todayMedications)
            ? state.todayMedications
            : [];

        console.log('💊 Загружено лекарств:', medications.length, medications);

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
            // БЕЗОПАСНОЕ извлечение данных
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
     * Инициализация грида самочувствия
     */
    function initWellnessGrid() {
        const gridContainer = document.getElementById('wellness-grid');
        if (!gridContainer) return;

        const state = HealthModule.getState();
        const today = new Date().toISOString().split('T')[0];

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
     * Инициализация кнопки добавления симптомов
     */
    function initAddSymptomsButton() {
        const button = document.getElementById('add-symptoms-btn');
        if (!button) return;

        button.addEventListener('click', () => {
            showSymptomPicker();
        });
    }

    /**
     * Отобразить сводку
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
     * Инициализация компонентов аптечки
     */
    function initMedicationsComponents() {
        renderMedicationsList();

        // Инициализируем кнопку добавления
        const addBtn = document.getElementById('add-medication-btn');
        if (addBtn) {
            addBtn.addEventListener('click', showMedicationForm);
        }

        // Инициализируем переключатель активных/архивных
        const toggleBtn = document.getElementById('toggle-archive');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleArchiveView);
        }
    }

    /**
     * Отобразить список лекарств
     */
    function renderMedicationsList() {
        const container = document.getElementById('medications-list');
        if (!container) return;

        const state = HealthModule.getState();

        if (state.medications.length === 0) {
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

        state.medications.forEach(med => {
            const nextSchedule = getNextSchedule(med);

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
    }

    /**
     * Инициализация компонентов дневника
     */
    function initDiaryComponents() {
        // Инициализируем календарь
        initCalendar();

        // Инициализируем кнопку сегодня
        const todayBtn = document.getElementById('today-btn');
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                loadDate(new Date().toISOString().split('T')[0]);
            });
        }

        // Загружаем данные за сегодня
        loadDate(new Date().toISOString().split('T')[0]);
    }

    /**
     * Инициализация календаря
     */
    function initCalendar() {
        const calendarContainer = document.getElementById('health-calendar');
        if (!calendarContainer) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Создаем простой календарь на текущий месяц
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        let html = '<div class="calendar-header">';
        html += `<h3>${getMonthName(currentMonth)} ${currentYear}</h3>`;
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
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = day === today.getDate() && currentMonth === today.getMonth();

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}"
                     onclick="loadDate('${dateStr}')">
                    ${day}
                </div>
            `;
        }

        html += '</div>';
        calendarContainer.innerHTML = html;
    }

    /**
     * Загрузить данные за дату
     */
    async function loadDate(date) {
        const response = await HealthAPI.getEntryByDate(date);

        if (response.success) {
            renderEntryForm(date, response.data);
        } else {
            // Создаем новую запись
            renderEntryForm(date, null);
        }
    }

    /**
     * Отобразить форму записи
     */
    function renderEntryForm(date, entry) {
        const container = document.getElementById('entry-form');
        if (!container) return;

        const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

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
                        <option value="yes" ${entry?.sexual_activity === 'yes' ? 'selected' : ''}>Да</option>
                        <option value="no" ${entry?.sexual_activity === 'no' ? 'selected' : ''}>Нет</option>
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

    /**
     * Инициализация компонентов статистики
     */
    function initStatsComponents() {
        renderStats();

        // Инициализируем переключатель периода
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const days = parseInt(this.getAttribute('data-days'));
                loadStats(days);
            });
        });
    }

    /**
     * Отобразить статистику
     */
    function renderStats() {
        const container = document.getElementById('stats-content');
        if (!container) return;

        const state = HealthModule.getState();

        if (!state.stats) {
            container.innerHTML = '<p>Загрузка статистики...</p>';
            return;
        }

        // Отображаем круговую диаграмму приверженности
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

            <div class="stats-section">
                <h3>😊 Распределение настроений</h3>
                <div class="mood-stats">
                    ${renderMoodDistribution(state.stats.mood_distribution || {})}
                </div>
            </div>

            <div class="stats-section">
                <h3>⚠️ Частые симптомы</h3>
                <div class="symptoms-stats">
                    ${renderTopSymptoms(state.stats.symptom_frequency || {})}
                </div>
            </div>

            <div class="stats-section">
                <h3>📈 Статистика сна</h3>
                <div class="sleep-stats">
                    <div class="stat-item">
                        <div class="stat-label">Среднее</div>
                        <div class="stat-value">${state.stats.sleep_statistics?.average?.toFixed(1) || '0'} ч</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Минимум</div>
                        <div class="stat-value">${state.stats.sleep_statistics?.min?.toFixed(1) || '0'} ч</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Максимум</div>
                        <div class="stat-value">${state.stats.sleep_statistics?.max?.toFixed(1) || '0'} ч</div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Инициализация компонентов онбординга
     */
    function initOnboardingComponents() {
        console.log('🎯 Инициализация компонентов онбординга');

        const genderBtns = document.querySelectorAll('.gender-option');
        const container = document.getElementById('health-container');

        genderBtns.forEach(btn => {
            btn.addEventListener('click', async function() {
                const gender = this.getAttribute('data-gender');
                console.log('👤 Пользователь выбрал гендер:', gender);

                // 1. Блокируем ВСЕ кнопки
                genderBtns.forEach(b => {
                    b.style.pointerEvents = 'none';
                    b.style.opacity = '0.5';
                    b.style.cursor = 'not-allowed';
                });

                // 2. Показываем загрузку
                this.classList.add('loading');
                const originalHTML = this.innerHTML;
                this.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <div class="loading-spinner-small" style="margin: 0 auto 10px;"></div>
                        <div style="font-size: 12px; color: #666;">Сохранение...</div>
                    </div>
                `;

                try {
                    // 3. Сохраняем гендер
                    console.log('📤 Отправляем запрос на сохранение гендера...');
                    const success = await HealthModule.setUserGender(gender);

                    if (!success) {
                        throw new Error('API вернул ошибку');
                    }

                    console.log('✅ Гендер успешно сохранен');

                    // 4. Показываем успех
                    this.classList.remove('loading');
                    this.classList.add('selected');
                    this.innerHTML = `
                        <div style="padding: 20px; text-align: center;">
                            <div style="font-size: 32px; color: #4CAF50; margin-bottom: 10px;">✓</div>
                            <div style="font-size: 14px; color: #4CAF50;">Сохранено!</div>
                        </div>
                    `;

                    // 5. Завершаем онбординг (БЕЗ RESTART - просто переходим на dashboard)
                    setTimeout(async () => {
                        console.log('🔄 Завершаем онбординг...');
                        await OnboardingManager.complete();
                    }, 1000);

                } catch (error) {
                    console.error('❌ Ошибка в процессе онбординга:', error);

                    // Восстанавливаем кнопки
                    genderBtns.forEach(b => {
                        b.style.pointerEvents = 'auto';
                        b.style.opacity = '1';
                        b.style.cursor = 'pointer';
                        b.classList.remove('loading', 'selected');
                    });

                    this.innerHTML = originalHTML;
                    ErrorHandler.show('Ошибка сохранения. Попробуйте еще раз.', { type: 'error' });
                }
            });
        });

        console.log(`✅ Инициализировано ${genderBtns.length} кнопок онбординга`);
    }

    // Вспомогательные функции для получения текста кнопок
    function getGenderIcon(gender) {
        const icons = {
            male: '👨',
            female: '👩',
            other: '🧑',
            prefer_not_to_say: '🙅'
        };
        return icons[gender] || '🙅';
    }

    function getGenderLabel(gender) {
        const labels = {
            male: 'Мужской',
            female: 'Женский',
            other: 'Другой',
            prefer_not_to_say: 'Не указывать'
        };
        return labels[gender] || 'Не указывать';
    }

    function getGenderDescription(gender) {
        const descriptions = {
            male: 'Стандартные рекомендации для мужчин',
            female: 'Включая женское здоровье',
            other: 'Общие рекомендации',
            prefer_not_to_say: 'Общие настройки'
        };
        return descriptions[gender] || 'Общие настройки';
    }

    // Вспомогательные функции

    /**
     * Получить эмодзи для настроения
     */
    function getMoodEmoji(mood) {
        return MOOD_EMOJIS[mood] || '😐';
    }

    /**
     * Получить следующий график приема
     */
    function getNextSchedule(medication) {
        if (!medication.schedules || medication.schedules.length === 0) {
            return null;
        }

        // Ищем ближайший прием
        const now = new Date();
        const today = now.getDay(); // 0 - воскресенье, 1 - понедельник и т.д.

        for (const schedule of medication.schedules) {
            const days = schedule.days_of_week || [];
            const time = schedule.time_of_day;

            if (days.includes(today)) {
                return time.substring(0, 5);
            }
        }

        return 'Завтра';
    }

    /**
     * Получить название месяца
     */
    function getMonthName(monthIndex) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[monthIndex];
    }

    /**
     * Отобразить список симптомов
     */
    function renderSymptomsList(symptoms) {
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
    }

    /**
     * Отобразить распределение настроений
     */
    function renderMoodDistribution(distribution) {
        if (Object.keys(distribution).length === 0) {
            return '<p>Нет данных о настроениях</p>';
        }

        let html = '<div class="mood-bars">';
        const total = Object.values(distribution).reduce((a, b) => a + b, 0);

        for (const [mood, count] of Object.entries(distribution)) {
            const percentage = total > 0 ? (count / total * 100) : 0;

            html += `
                <div class="mood-bar-item">
                    <div class="mood-label">
                        ${getMoodEmoji(mood)} ${mood}
                        <span class="mood-count">${count}</span>
                    </div>
                    <div class="mood-bar">
                        <div class="mood-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="mood-percentage">${percentage.toFixed(1)}%</div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    /**
     * Отобразить топ симптомов
     */
    function renderTopSymptoms(frequency) {
        if (Object.keys(frequency).length === 0) {
            return '<p>Нет данных о симптомах</p>';
        }

        // Сортируем по частоте
        const sorted = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        let html = '<div class="top-symptoms">';

        sorted.forEach(([symptom, count]) => {
            // Извлекаем название симптома из ключа (формат "категория:симптом")
            const symptomName = symptom.includes(':') ? symptom.split(':')[1] : symptom;

            html += `
                <div class="top-symptom-item">
                    <div class="symptom-name">${symptomName}</div>
                    <div class="symptom-bar">
                        <div class="symptom-bar-fill" style="width: ${Math.min(count * 10, 100)}%"></div>
                    </div>
                    <div class="symptom-count">${count}</div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    // Глобальные функции для использования в onclick
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
        // Реализация выбора настроения
        HealthUI.showModal('mood-picker');
    };

    window.showSleepInput = function() {
        // Реализация ввода сна
        HealthUI.showModal('sleep-input');
    };

    window.showWeightInput = function() {
        // Реализация ввода веса
        HealthUI.showModal('weight-input');
    };

    window.showSymptomPicker = function() {
        HealthUI.showModal('symptom-picker');
    };

    window.showMedicationForm = function() {
        HealthUI.showModal('medication-form');
    };

    // Публичные методы
    return {
        initDashboardComponents,
        initMedicationsComponents,
        initDiaryComponents,
        initStatsComponents,
        initOnboardingComponents,

        /**
         * Показать тост-уведомление
         */
        showToast: function(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `health-toast toast-${type}`;
            toast.innerHTML = message;

            document.body.appendChild(toast);

            // Анимация появления
            setTimeout(() => toast.classList.add('show'), 10);

            // Автоматическое скрытие
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        /**
         * Показать модальное окно
         */
        showModal: function(modalType, data = {}) {
            const modalsContainer = document.getElementById('health-modals');
            if (!modalsContainer) return;

            let modalHtml = '';

            switch(modalType) {
                case 'mood-picker':
                    modalHtml = `
                        <div class="modal-overlay" onclick="HealthUI.closeModal()">
                            <div class="modal-content" onclick="event.stopPropagation()">
                                <div class="modal-header">
                                    <h3>😊 Как настроение?</h3>
                                    <button class="modal-close" onclick="HealthUI.closeModal()">×</button>
                                </div>
                                <div class="modal-body">
                                    <div class="mood-options">
                                        ${Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => `
                                            <button class="mood-btn" onclick="HealthUI.selectMood('${mood}')">
                                                <span class="mood-emoji">${emoji}</span>
                                                <span class="mood-text">${mood}</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                case 'sleep-input':
                    modalHtml = `
                        <div class="modal-overlay" onclick="HealthUI.closeModal()">
                            <div class="modal-content" onclick="event.stopPropagation()">
                                <div class="modal-header">
                                    <h3>🌙 Сколько спали?</h3>
                                    <button class="modal-close" onclick="HealthUI.closeModal()">×</button>
                                </div>
                                <div class="modal-body">
                                    <input type="number" id="modal-sleep-input" min="0" max="24" step="0.5"
                                           placeholder="Часов сна" class="modal-input">
                                    <button class="health-btn btn-primary" onclick="HealthUI.saveSleep()" style="width:100%; margin-top:16px;">
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                case 'weight-input':
                    modalHtml = `
                        <div class="modal-overlay" onclick="HealthUI.closeModal()">
                            <div class="modal-content" onclick="event.stopPropagation()">
                                <div class="modal-header">
                                    <h3>⚖️ Ваш вес</h3>
                                    <button class="modal-close" onclick="HealthUI.closeModal()">×</button>
                                </div>
                                <div class="modal-body">
                                    <input type="number" id="modal-weight-input" min="30" max="300" step="0.1"
                                           placeholder="Вес в кг" class="modal-input">
                                    <button class="health-btn btn-primary" onclick="HealthUI.saveWeight()" style="width:100%; margin-top:16px;">
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                case 'symptom-picker':
                    const state = HealthModule.getState();
                    const categories = state.userOptions?.symptom_categories || [];
                    const symptomsByCategory = state.userOptions?.symptoms_by_category || {};

                    modalHtml = `
                        <div class="modal-overlay" onclick="HealthUI.closeModal()">
                            <div class="modal-content modal-large" onclick="event.stopPropagation()">
                                <div class="modal-header">
                                    <h3>🤕 Добавить симптом</h3>
                                    <button class="modal-close" onclick="HealthUI.closeModal()">×</button>
                                </div>
                                <div class="modal-body">
                                    <select id="symptom-category" class="modal-input" onchange="HealthUI.updateSymptomsList()">
                                        <option value="">Выберите категорию</option>
                                        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                    </select>
                                    <select id="symptom-name" class="modal-input" style="margin-top:12px;" disabled>
                                        <option value="">Сначала выберите категорию</option>
                                    </select>
                                    <div style="margin-top:12px;">
                                        <label>Интенсивность: <span id="intensity-value">3</span>/5</label>
                                        <input type="range" id="symptom-intensity" min="1" max="5" value="3"
                                               oninput="document.getElementById('intensity-value').textContent=this.value">
                                    </div>
                                    <button class="health-btn btn-primary" onclick="HealthUI.saveSymptom()" style="width:100%; margin-top:16px;">
                                        Добавить
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                default:
                    console.warn('Неизвестный тип модального окна:', modalType);
                    return;
            }

            modalsContainer.innerHTML = modalHtml;
        },

        closeModal: function() {
            const modalsContainer = document.getElementById('health-modals');
            if (modalsContainer) {
                modalsContainer.innerHTML = '';
            }
        },

        selectMood: async function(mood) {
            const today = new Date().toISOString().split('T')[0];
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

            const today = new Date().toISOString().split('T')[0];
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

            const today = new Date().toISOString().split('T')[0];
            const success = await HealthModule.updateHealthEntry(today, 'weight', parseFloat(input.value));
            if (success) {
                this.showToast('✅ Вес сохранён', 'success');
                this.closeModal();
                HealthModule.refreshData();
            }
        },

        updateSymptomsList: function() {
            const categorySelect = document.getElementById('symptom-category');
            const nameSelect = document.getElementById('symptom-name');
            const state = HealthModule.getState();
            const symptomsByCategory = state.userOptions?.symptoms_by_category || {};

            const category = categorySelect.value;
            if (!category) {
                nameSelect.disabled = true;
                nameSelect.innerHTML = '<option value="">Сначала выберите категорию</option>';
                return;
            }

            const symptoms = symptomsByCategory[category] || [];
            nameSelect.disabled = false;
            nameSelect.innerHTML = `
                <option value="">Выберите симптом</option>
                ${symptoms.map(s => `<option value="${s}">${s}</option>`).join('')}
            `;
        },

        saveSymptom: async function() {
            const category = document.getElementById('symptom-category')?.value;
            const name = document.getElementById('symptom-name')?.value;
            const intensity = parseInt(document.getElementById('symptom-intensity')?.value || '3');

            if (!category || !name) {
                this.showToast('⚠️ Выберите категорию и симптом', 'warning');
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const success = await HealthModule.updateHealthEntry(today, 'symptoms', [
                { category, name, intensity }
            ]);

            if (success) {
                this.showToast('✅ Симптом добавлен', 'success');
                this.closeModal();
                HealthModule.refreshData();
            }
        }
    };
})();

// Глобальные функции для HTML onclick
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

    if (typeof HealthUI !== 'undefined') {
        HealthUI.showToast('✅ Сохранено', 'success');
    }
};

window.toggleArchiveView = function() {};
window.editMedication = function(id) {};
window.deleteMedication = function(id) {};
window.removeSymptom = function(id) {};

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.HealthUI = HealthUI;
}