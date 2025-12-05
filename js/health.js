/**
 * Дневник здоровья - Полная реализация
 * Версия: 2.0.0
 *
 * Функционал:
 * - CRUD операции с записями
 * - Графики и визуализация трендов
 * - Генерация инсайтов на основе данных
 * - Фильтрация истории
 * - Подсчёт streak (дней подряд)
 * - Редактирование и удаление записей
 */

const tg = window.Telegram.WebApp;
tg.expand();
tg.BackButton.show();
tg.BackButton.onClick(() => window.history.back());

// ==================== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ====================
let currentPeriodDays = 7;
let currentEntryId = null;
let currentViewingEntry = null;
let selectedGenderSetup = null;
let allEntries = [];
let currentFilter = 'all';
let loadedEntriesCount = 20;

// Состояние формы
let currentRatings = {
    overall_feeling: null,
    energy_level: null,
    sleep_quality: null,
    stress_level: null
};
let selectedSymptoms = [];
let isEditMode = false;
let editingEntryId = null;

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function init() {
    try {
        // Проверяем, установлен ли гендер
        if (!HealthAPI.isGenderSet()) {
            console.log('ℹ️ Гендер не установлен, показываем форму выбора');
            showGenderSetup();
            return;
        }

        // Гендер установлен — показываем основной контент
        document.getElementById('main-content').style.display = 'block';

        // Устанавливаем текущую дату
        updateCurrentDate();

        // Проверяем, есть ли запись сегодня
        const hasTodayEntry = await HealthAPI.hasTodayEntry();

        if (hasTodayEntry) {
            document.getElementById('quick-log-section').style.display = 'none';
            await showTodayEntry();
        }

        // Загружаем данные
        await loadAllData();

        tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        tg.showAlert('Ошибка загрузки данных');
    }
}

function updateCurrentDate() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    document.getElementById('current-date').textContent = dateStr;
}

async function loadAllData() {
    await Promise.all([
        loadStatistics(),
        loadHistory(),
        loadTrendChart(),
        loadInsights(),
        loadTopSymptoms()
    ]);
}

// ==================== ВЫБОР ГЕНДЕРА (ПЕРВЫЙ ЗАПУСК) ====================
function showGenderSetup() {
    document.getElementById('gender-setup-modal').classList.add('active');
    document.getElementById('main-content').style.display = 'none';
}

function selectGenderSetup(gender, element) {
    selectedGenderSetup = gender;

    document.querySelectorAll('#gender-setup-modal .gender-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    element.classList.add('selected');

    document.getElementById('save-gender-btn').disabled = false;

    tg.HapticFeedback.impactOccurred('light');
}

function saveGenderSetup() {
    if (!selectedGenderSetup) {
        tg.showAlert('Пожалуйста, выберите пол');
        return;
    }

    const success = HealthAPI.setGender(selectedGenderSetup);

    if (success) {
        document.getElementById('gender-setup-modal').classList.remove('active');
        document.getElementById('main-content').style.display = 'block';

        tg.showPopup({
            title: '✅ Готово',
            message: 'Профиль настроен! Теперь вы можете вести дневник здоровья.',
            buttons: [{ type: 'ok' }]
        });

        // Инициализируем основной контент
        init();
    } else {
        tg.showAlert('Ошибка сохранения. Попробуйте ещё раз.');
    }
}

// ==================== БЫСТРАЯ ОЦЕНКА ====================
async function quickLog(feeling) {
    try {
        tg.HapticFeedback.impactOccurred('medium');

        await HealthAPI.createEntry({
            overall_feeling: feeling
        });

        tg.showPopup({
            title: '✅ Готово',
            message: 'Запись сохранена',
            buttons: [{ type: 'ok' }]
        });

        // Обновляем данные
        document.getElementById('quick-log-section').style.display = 'none';
        await showTodayEntry();
        await loadAllData();

    } catch (error) {
        console.error('Ошибка сохранения:', error);
        tg.showAlert('Ошибка: ' + error.message);
    }
}

// ==================== СЕГОДНЯШНЯЯ ЗАПИСЬ ====================
async function showTodayEntry() {
    try {
        const entry = await HealthAPI.getLatestEntry();
        if (!entry) return;

        const today = new Date().toDateString();
        const entryDate = new Date(entry.recorded_at).toDateString();

        if (today !== entryDate) return;

        // Формируем HTML
        let html = `
            <div class="entry-detail-row">
                <span class="entry-detail-label">Самочувствие</span>
                <span class="entry-detail-value">${HealthAPI.getFeelingEmoji(entry.overall_feeling)} ${entry.overall_feeling}/5</span>
            </div>
        `;

        if (entry.energy_level) {
            html += `
                <div class="entry-detail-row">
                    <span class="entry-detail-label">Энергия</span>
                    <span class="entry-detail-value">⚡ ${entry.energy_level}/5</span>
                </div>
            `;
        }

        if (entry.sleep_quality) {
            html += `
                <div class="entry-detail-row">
                    <span class="entry-detail-label">Сон</span>
                    <span class="entry-detail-value">😴 ${entry.sleep_quality}/5</span>
                </div>
            `;
        }

        if (entry.stress_level) {
            html += `
                <div class="entry-detail-row">
                    <span class="entry-detail-label">Стресс</span>
                    <span class="entry-detail-value">😰 ${entry.stress_level}/5</span>
                </div>
            `;
        }

        if (entry.symptoms && entry.symptoms.length > 0) {
            html += `
                <div class="entry-detail-row">
                    <span class="entry-detail-label">Симптомы</span>
                    <span class="entry-detail-value">🩺 ${entry.symptoms.join(', ')}</span>
                </div>
            `;
        }

        if (entry.notes) {
            html += `
                <div class="entry-detail-row" style="flex-direction: column; align-items: flex-start;">
                    <span class="entry-detail-label">Заметки</span>
                    <span class="entry-detail-value" style="margin-top: 5px; opacity: 0.8;">${escapeHtml(entry.notes)}</span>
                </div>
            `;
        }

        document.getElementById('today-entry-body').innerHTML = html;
        document.getElementById('today-entry-section').style.display = 'block';

        // Сохраняем ID для редактирования
        currentEntryId = entry.id;

    } catch (error) {
        console.error('Ошибка загрузки сегодняшней записи:', error);
    }
}

async function editTodayEntry() {
    if (!currentEntryId) return;

    try {
        // Загружаем полную запись
        const entries = await HealthAPI.getEntries(1, 1);
        const entry = entries.find(e => e.id === currentEntryId);

        if (!entry) {
            tg.showAlert('Запись не найдена');
            return;
        }

        openEditForm(entry);

    } catch (error) {
        console.error('Ошибка загрузки записи для редактирования:', error);
        tg.showAlert('Ошибка загрузки записи');
    }
}

// ==================== СМЕНА ПЕРИОДА ====================
function changePeriod(days, element) {
    currentPeriodDays = days;

    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    element.classList.add('active');

    loadAllData();
    tg.HapticFeedback.impactOccurred('light');
}

// ==================== СТАТИСТИКА ====================
async function loadStatistics() {
    try {
        const stats = await HealthAPI.getStatistics(currentPeriodDays);

        // Средняя оценка
        const avgFeeling = stats.avg_overall_feeling
            ? stats.avg_overall_feeling.toFixed(1) + '/5'
            : '-';
        document.getElementById('avg-feeling').textContent = avgFeeling;

        // Тренд (сравнение с предыдущим периодом)
        // TODO: Требуется дополнительный запрос для сравнения
        document.getElementById('feeling-trend').textContent = '';

        // Энергия
        document.getElementById('avg-energy').textContent =
            stats.avg_energy_level ? stats.avg_energy_level.toFixed(1) + '/5' : '-';

        // Сон
        document.getElementById('avg-sleep').textContent =
            stats.avg_sleep_quality ? stats.avg_sleep_quality.toFixed(1) + '/5' : '-';

        // Стресс
        document.getElementById('avg-stress').textContent =
            stats.avg_stress_level ? stats.avg_stress_level.toFixed(1) + '/5' : '-';

        // Количество записей
        document.getElementById('total-entries').textContent =
            stats.total_entries || 0;

        // Streak (дни подряд)
        const streak = await calculateStreak();
        document.getElementById('streak').textContent = streak;

    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

async function calculateStreak() {
    try {
        const entries = await HealthAPI.getEntries(365, 365);

        if (!entries || entries.length === 0) return 0;

        // Сортируем по дате (новые первыми)
        entries.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const entry of entries) {
            const entryDate = new Date(entry.recorded_at);
            entryDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

            if (diffDays === streak) {
                streak++;
            } else if (diffDays > streak) {
                break;
            }
        }

        return streak;

    } catch (error) {
        console.error('Ошибка подсчёта streak:', error);
        return 0;
    }
}

// ==================== ГРАФИК ТРЕНДОВ ====================
async function loadTrendChart() {
    try {
        const entries = await HealthAPI.getEntries(currentPeriodDays, 100);
        const container = document.getElementById('trend-chart');

        if (!entries || entries.length === 0) {
            container.innerHTML = '<div class="empty-state">Недостаточно данных для графика</div>';
            return;
        }

        // Группируем по дням
        const entriesByDay = {};

        entries.forEach(entry => {
            const date = new Date(entry.recorded_at);
            const dateKey = date.toISOString().split('T')[0];

            if (!entriesByDay[dateKey]) {
                entriesByDay[dateKey] = [];
            }
            entriesByDay[dateKey].push(entry);
        });

        // Вычисляем средние значения по дням
        const chartData = Object.keys(entriesByDay).map(dateKey => {
            const dayEntries = entriesByDay[dateKey];
            const avgFeeling = dayEntries.reduce((sum, e) => sum + e.overall_feeling, 0) / dayEntries.length;

            return {
                date: dateKey,
                avgFeeling: avgFeeling,
                count: dayEntries.length
            };
        });

        // Сортируем по дате
        chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Берём последние 14 дней
        const last14Days = chartData.slice(-14);

        if (last14Days.length === 0) {
            container.innerHTML = '<div class="empty-state">Недостаточно данных</div>';
            return;
        }

        // Находим максимум для масштабирования
        const maxFeeling = 5; // Всегда 5, так как это максимальная оценка

        // Рендерим график
        container.innerHTML = last14Days.map(day => {
            const date = new Date(day.date);
            const dayStr = date.getDate();
            const monthStr = date.toLocaleDateString('ru-RU', { month: 'short' });
            const dateLabel = `${dayStr} ${monthStr}`;

            const percent = (day.avgFeeling / maxFeeling) * 100;
            const feelingRounded = Math.round(day.avgFeeling * 10) / 10;
            const feelingClass = `feeling-${Math.round(day.avgFeeling)}`;

            return `
                <div class="chart-row">
                    <div class="chart-date">${dateLabel}</div>
                    <div class="chart-bar-container">
                        <div class="chart-bar ${feelingClass}" style="width: ${percent}%">
                            ${HealthAPI.getFeelingEmoji(Math.round(day.avgFeeling))}
                        </div>
                    </div>
                    <div class="chart-value">${feelingRounded}/5</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Ошибка загрузки графика:', error);
    }
}

// ==================== ИНСАЙТЫ ====================
async function loadInsights() {
    try {
        const entries = await HealthAPI.getEntries(currentPeriodDays, 100);
        const container = document.getElementById('insights-list');
        const section = document.getElementById('insights-section');

        if (!entries || entries.length < 3) {
            section.style.display = 'none';
            return;
        }

        const insights = generateInsights(entries);

        if (insights.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <div class="insight-text">${insight.text}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки инсайтов:', error);
    }
}

function generateInsights(entries) {
    const insights = [];

    // Средняя оценка
    const avgFeeling = entries.reduce((sum, e) => sum + e.overall_feeling, 0) / entries.length;

    if (avgFeeling >= 4) {
        insights.push({
            type: 'positive',
            text: `✨ Отличная неделя! Ваше среднее самочувствие — ${avgFeeling.toFixed(1)}/5. Продолжайте в том же духе!`
        });
    } else if (avgFeeling < 3) {
        insights.push({
            type: 'negative',
            text: `😔 Среднее самочувствие ниже обычного (${avgFeeling.toFixed(1)}/5). Возможно, стоит больше отдыхать и обратить внимание на здоровье.`
        });
    }

    // Анализ сна
    const sleepEntries = entries.filter(e => e.sleep_quality !== null);
    if (sleepEntries.length >= 3) {
        const avgSleep = sleepEntries.reduce((sum, e) => sum + e.sleep_quality, 0) / sleepEntries.length;

        if (avgSleep < 3) {
            insights.push({
                type: 'warning',
                text: `😴 Качество сна ниже среднего (${avgSleep.toFixed(1)}/5). Хороший сон — основа хорошего самочувствия. Попробуйте ложиться пораньше.`
            });
        }
    }

    // Анализ стресса
    const stressEntries = entries.filter(e => e.stress_level !== null);
    if (stressEntries.length >= 3) {
        const avgStress = stressEntries.reduce((sum, e) => sum + e.stress_level, 0) / stressEntries.length;

        if (avgStress >= 4) {
            insights.push({
                type: 'warning',
                text: `😰 Высокий уровень стресса (${avgStress.toFixed(1)}/5). Не забывайте про отдых и расслабление. Попробуйте медитацию или прогулки.`
            });
        }
    }

    // Анализ энергии
    const energyEntries = entries.filter(e => e.energy_level !== null);
    if (energyEntries.length >= 3) {
        const avgEnergy = energyEntries.reduce((sum, e) => sum + e.energy_level, 0) / energyEntries.length;

        if (avgEnergy < 3) {
            insights.push({
                type: 'warning',
                text: `⚡ Низкий уровень энергии (${avgEnergy.toFixed(1)}/5). Возможно, стоит добавить больше физической активности и правильного питания.`
            });
        }
    }

    // Паттерн: улучшение
    if (entries.length >= 5) {
        const recentAvg = entries.slice(0, Math.floor(entries.length / 2))
            .reduce((sum, e) => sum + e.overall_feeling, 0) / Math.floor(entries.length / 2);
        const olderAvg = entries.slice(Math.floor(entries.length / 2))
            .reduce((sum, e) => sum + e.overall_feeling, 0) / Math.ceil(entries.length / 2);

        if (recentAvg - olderAvg >= 0.5) {
            insights.push({
                type: 'positive',
                text: `📈 Заметна положительная динамика! Ваше самочувствие улучшилось за последнее время.`
            });
        } else if (olderAvg - recentAvg >= 0.5) {
            insights.push({
                type: 'negative',
                text: `📉 Самочувствие ухудшилось за последнее время. Возможно, стоит обратить внимание на режим дня.`
            });
        }
    }

    // Регулярность
    const daysWithEntries = new Set(
        entries.map(e => new Date(e.recorded_at).toDateString())
    ).size;

    if (daysWithEntries >= currentPeriodDays * 0.8) {
        insights.push({
            type: 'positive',
            text: `🔥 Отличная регулярность! Вы ведёте дневник ${daysWithEntries} из ${currentPeriodDays} дней.`
        });
    }

    return insights;
}

// ==================== ЧАСТЫЕ СИМПТОМЫ ====================
async function loadTopSymptoms() {
    try {
        const stats = await HealthAPI.getStatistics(currentPeriodDays);
        const container = document.getElementById('symptoms-cloud');
        const section = document.getElementById('symptoms-section');

        if (!stats.most_common_symptoms || stats.most_common_symptoms.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        container.innerHTML = stats.most_common_symptoms.map(symptom => `
            <div class="symptom-badge">
                <span>${escapeHtml(symptom.symptom)}</span>
                <span class="symptom-count">${symptom.count}</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки симптомов:', error);
    }
}

// ==================== ИСТОРИЯ ЗАПИСЕЙ ====================
async function loadHistory() {
    try {
        allEntries = await HealthAPI.getEntries(currentPeriodDays, 100);
        renderHistory();

    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
    }
}

function renderHistory() {
    const container = document.getElementById('entries-list');

    // Применяем фильтр
    let filteredEntries = allEntries;

    if (currentFilter !== 'all') {
        if (currentFilter === '1-2') {
            filteredEntries = allEntries.filter(e => e.overall_feeling <= 2);
        } else if (currentFilter === '3') {
            filteredEntries = allEntries.filter(e => e.overall_feeling === 3);
        } else if (currentFilter === '4-5') {
            filteredEntries = allEntries.filter(e => e.overall_feeling >= 4);
        }
    }

    if (filteredEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">Нет записей</div>
            </div>
        `;
        document.getElementById('load-more-btn').style.display = 'none';
        return;
    }

    // Показываем первые N записей
    const entriesToShow = filteredEntries.slice(0, loadedEntriesCount);

    container.innerHTML = entriesToShow.map(entry => {
        const emoji = HealthAPI.getFeelingEmoji(entry.overall_feeling);
        const dateStr = HealthAPI.formatEntryDate(entry.recorded_at, true);

        let metricsHtml = '';
        if (entry.energy_level) metricsHtml += `⚡ ${entry.energy_level}/5 `;
        if (entry.sleep_quality) metricsHtml += `😴 ${entry.sleep_quality}/5 `;
        if (entry.stress_level) metricsHtml += `😰 ${entry.stress_level}/5`;

        return `
            <div class="entry-card" onclick="viewEntry(${entry.id})">
                <div class="entry-emoji">${emoji}</div>
                <div class="entry-info">
                    <div class="entry-date">${dateStr}</div>
                    ${metricsHtml ? `<div class="entry-metrics">${metricsHtml}</div>` : ''}
                    ${entry.notes ? `<div class="entry-notes">${escapeHtml(entry.notes.substring(0, 80))}${entry.notes.length > 80 ? '...' : ''}</div>` : ''}
                </div>
                <div class="entry-rating">${entry.overall_feeling}/5</div>
            </div>
        `;
    }).join('');

    // Показываем/скрываем кнопку "Загрузить ещё"
    if (filteredEntries.length > loadedEntriesCount) {
        document.getElementById('load-more-btn').style.display = 'block';
    } else {
        document.getElementById('load-more-btn').style.display = 'none';
    }
}

function loadMoreEntries() {
    loadedEntriesCount += 20;
    renderHistory();
    tg.HapticFeedback.impactOccurred('light');
}

// ==================== ФИЛЬТРЫ ====================
function toggleHistoryFilters() {
    const filters = document.getElementById('history-filters');
    const isVisible = filters.style.display !== 'none';

    filters.style.display = isVisible ? 'none' : 'block';
    tg.HapticFeedback.impactOccurred('light');
}

function filterByFeeling(filter, element) {
    currentFilter = filter;

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    element.classList.add('active');

    renderHistory();
    tg.HapticFeedback.impactOccurred('light');
}

// ==================== ПОДРОБНАЯ ФОРМА (СОЗДАНИЕ) ====================
function openDetailedForm() {
    isEditMode = false;
    editingEntryId = null;

    document.getElementById('modal-title').textContent = 'Новая запись';

    // Сбрасываем состояние
    currentRatings = {
        overall_feeling: null,
        energy_level: null,
        sleep_quality: null,
        stress_level: null
    };
    selectedSymptoms = [];

    // Инициализируем рейтинговые шкалы
    initRatingScale('overall-feeling', 'overall_feeling');
    initRatingScale('energy-level', 'energy_level');
    initRatingScale('sleep-quality', 'sleep_quality');
    initRatingScale('stress-level', 'stress_level');

    // Инициализируем симптомы
    initSymptomsChips();

    // Устанавливаем текущую дату/время
    const now = new Date();
    const dateTimeString = now.toISOString().slice(0, 16);
    document.getElementById('recorded-at').value = dateTimeString;

    // Очищаем заметки
    document.getElementById('notes').value = '';
    document.getElementById('notes-counter').textContent = '0';

    // Счётчик символов
    document.getElementById('notes').addEventListener('input', updateNotesCounter);

    document.getElementById('detailed-modal').classList.add('active');
    tg.HapticFeedback.impactOccurred('light');
}

function updateNotesCounter() {
    const length = document.getElementById('notes').value.length;
    document.getElementById('notes-counter').textContent = length;

    if (length > 1000) {
        document.getElementById('notes-counter').style.color = '#ef4444';
    } else {
        document.getElementById('notes-counter').style.color = '';
    }
}

function closeDetailedForm() {
    document.getElementById('detailed-modal').classList.remove('active');

    // Сбрасываем состояние
    currentRatings = {
        overall_feeling: null,
        energy_level: null,
        sleep_quality: null,
        stress_level: null
    };
    selectedSymptoms = [];
    isEditMode = false;
    editingEntryId = null;
}

function initRatingScale(containerId, ratingKey) {
    const container = document.getElementById(containerId);
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];

    container.innerHTML = emojis.map((emoji, index) => {
        const value = index + 1;
        return `
            <button class="rating-btn" data-value="${value}"
                    onclick="selectRating('${ratingKey}', ${value}, '${containerId}')">
                ${emoji}
            </button>
        `;
    }).join('');
}

function selectRating(key, value, containerId) {
    currentRatings[key] = value;

    // Визуально выделяем
    const container = document.getElementById(containerId);
    container.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.value) === value);
    });

    // Показываем описание
    const descriptions = {
        1: 'Очень плохо',
        2: 'Плохо',
        3: 'Нормально',
        4: 'Хорошо',
        5: 'Отлично'
    };

    const desc = descriptions[value] || '';
    const descElement = document.getElementById(`${key}-desc`);
    if (descElement) {
        descElement.textContent = desc;
    }

    tg.HapticFeedback.impactOccurred('light');
}

function initSymptomsChips() {
    const container = document.getElementById('symptoms-chips');
    const symptoms = HealthAPI.getAvailableSymptoms();

    container.innerHTML = symptoms.map(symptom => {
        const isSelected = selectedSymptoms.includes(symptom);
        return `
            <button class="symptom-chip ${isSelected ? 'selected' : ''}"
                    onclick="toggleSymptom('${escapeHtml(symptom).replace(/'/g, "\\'")}')">
                ${escapeHtml(symptom)}
            </button>
        `;
    }).join('');
}

function toggleSymptom(symptom) {
    const index = selectedSymptoms.indexOf(symptom);

    if (index > -1) {
        selectedSymptoms.splice(index, 1);
    } else {
        selectedSymptoms.push(symptom);
    }

    // Обновляем визуально
    document.querySelectorAll('.symptom-chip').forEach(chip => {
        if (chip.textContent.trim() === symptom) {
            chip.classList.toggle('selected');
        }
    });

    tg.HapticFeedback.impactOccurred('light');
}

async function saveDetailedEntry() {
    const entryData = {
        overall_feeling: currentRatings.overall_feeling,
        energy_level: currentRatings.energy_level,
        sleep_quality: currentRatings.sleep_quality,
        stress_level: currentRatings.stress_level,
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : null,
        notes: document.getElementById('notes').value.trim() || null,
        recorded_at: document.getElementById('recorded-at').value
            ? new Date(document.getElementById('recorded-at').value).toISOString()
            : new Date().toISOString()
    };

    const validation = HealthAPI.validateEntry(entryData);

    if (!validation.valid) {
        tg.showAlert(validation.errors.join('\n'));
        return;
    }

    try {
        tg.MainButton.showProgress();

        if (isEditMode && editingEntryId) {
            // Режим редактирования
            await HealthAPI.updateEntry(editingEntryId, entryData);

            tg.showPopup({
                title: '✅ Обновлено',
                message: 'Запись успешно обновлена',
                buttons: [{ type: 'ok' }]
            });
        } else {
            // Режим создания
            await HealthAPI.createEntry(entryData);

            tg.showPopup({
                title: '✅ Готово',
                message: 'Запись сохранена',
                buttons: [{ type: 'ok' }]
            });
        }

        tg.MainButton.hideProgress();
        closeDetailedForm();

        // Обновляем данные
        await init();

    } catch (error) {
        tg.MainButton.hideProgress();
        console.error('Ошибка сохранения:', error);
        tg.showAlert('Ошибка: ' + error.message);
    }
}

// ==================== ПРОСМОТР И РЕДАКТИРОВАНИЕ ЗАПИСИ ====================
async function viewEntry(entryId) {
    try {
        // Находим запись в кэше
        currentViewingEntry = allEntries.find(e => e.id === entryId);

        if (!currentViewingEntry) {
            tg.showAlert('Запись не найдена');
            return;
        }

        // Формируем HTML для просмотра
        let html = `
            <div class="view-entry-grid">
                <div class="view-metric">
                    <div class="view-metric-label">Самочувствие</div>
                    <div class="view-metric-value">${HealthAPI.getFeelingEmoji(currentViewingEntry.overall_feeling)} ${currentViewingEntry.overall_feeling}/5</div>
                </div>
        `;

        if (currentViewingEntry.energy_level) {
            html += `
                <div class="view-metric">
                    <div class="view-metric-label">Энергия</div>
                    <div class="view-metric-value">⚡ ${currentViewingEntry.energy_level}/5</div>
                </div>
            `;
        }

        if (currentViewingEntry.sleep_quality) {
            html += `
                <div class="view-metric">
                    <div class="view-metric-label">Сон</div>
                    <div class="view-metric-value">😴 ${currentViewingEntry.sleep_quality}/5</div>
                </div>
            `;
        }

        if (currentViewingEntry.stress_level) {
            html += `
                <div class="view-metric">
                    <div class="view-metric-label">Стресс</div>
                    <div class="view-metric-value">😰 ${currentViewingEntry.stress_level}/5</div>
                </div>
            `;
        }

        html += `</div>`;

        // Дата
        html += `
            <div class="view-date">
                📅 ${HealthAPI.formatEntryDate(currentViewingEntry.recorded_at, true)}
            </div>
        `;

        // Симптомы
        if (currentViewingEntry.symptoms && currentViewingEntry.symptoms.length > 0) {
            html += `
                <div class="view-symptoms">
                    <h4>🩺 Симптомы</h4>
                    <div class="symptoms-chips">
                        ${currentViewingEntry.symptoms.map(s =>
                            `<div class="symptom-chip selected">${escapeHtml(s)}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        // Заметки
        if (currentViewingEntry.notes) {
            html += `
                <div class="view-notes">
                    <h4>📝 Заметки</h4>
                    <div class="view-notes-text">${escapeHtml(currentViewingEntry.notes)}</div>
                </div>
            `;
        }

        document.getElementById('view-entry-body').innerHTML = html;
        document.getElementById('view-entry-modal').classList.add('active');

        tg.HapticFeedback.impactOccurred('light');

    } catch (error) {
        console.error('Ошибка просмотра записи:', error);
        tg.showAlert('Ошибка загрузки записи');
    }
}

function closeViewModal() {
    document.getElementById('view-entry-modal').classList.remove('active');
    currentViewingEntry = null;
}

function editCurrentEntry() {
    if (!currentViewingEntry) return;

    closeViewModal();
    openEditForm(currentViewingEntry);
}

function openEditForm(entry) {
    isEditMode = true;
    editingEntryId = entry.id;

    document.getElementById('modal-title').textContent = 'Редактирование записи';

    // Заполняем текущие значения
    currentRatings = {
        overall_feeling: entry.overall_feeling,
        energy_level: entry.energy_level,
        sleep_quality: entry.sleep_quality,
        stress_level: entry.stress_level
    };

    selectedSymptoms = entry.symptoms ? [...entry.symptoms] : [];

    // Инициализируем формы с текущими значениями
    initRatingScale('overall-feeling', 'overall_feeling');
    initRatingScale('energy-level', 'energy_level');
    initRatingScale('sleep-quality', 'sleep_quality');
    initRatingScale('stress-level', 'stress_level');

    // Выделяем выбранные оценки
    if (entry.overall_feeling) {
        selectRating('overall_feeling', entry.overall_feeling, 'overall-feeling');
    }
    if (entry.energy_level) {
        selectRating('energy_level', entry.energy_level, 'energy-level');
    }
    if (entry.sleep_quality) {
        selectRating('sleep_quality', entry.sleep_quality, 'sleep-quality');
    }
    if (entry.stress_level) {
        selectRating('stress_level', entry.stress_level, 'stress-level');
    }

    // Инициализируем симптомы
    initSymptomsChips();

    // Дата
    const recordedDate = new Date(entry.recorded_at);
    const dateTimeString = recordedDate.toISOString().slice(0, 16);
    document.getElementById('recorded-at').value = dateTimeString;

    // Заметки
    document.getElementById('notes').value = entry.notes || '';
    updateNotesCounter();

    document.getElementById('detailed-modal').classList.add('active');
    tg.HapticFeedback.impactOccurred('light');
}

async function confirmDeleteEntry() {
    if (!currentViewingEntry) return;

    tg.showPopup({
        title: '🗑️ Удалить запись?',
        message: 'Это действие нельзя отменить',
        buttons: [
            { id: 'cancel', type: 'cancel' },
            { id: 'delete', type: 'destructive', text: 'Удалить' }
        ]
    }, async (buttonId) => {
        if (buttonId === 'delete') {
            await deleteEntry(currentViewingEntry.id);
        }
    });
}

async function deleteEntry(entryId) {
    try {
        tg.MainButton.showProgress();

        await HealthAPI.deleteEntry(entryId);

        tg.MainButton.hideProgress();
        closeViewModal();

        tg.showPopup({
            title: '✅ Удалено',
            message: 'Запись успешно удалена',
            buttons: [{ type: 'ok' }]
        });

        // Обновляем данные
        await init();

    } catch (error) {
        tg.MainButton.hideProgress();
        console.error('Ошибка удаления:', error);
        tg.showAlert('Ошибка: ' + error.message);
    }
}

// ==================== НАСТРОЙКИ ====================
function openSettings() {
    const gender = HealthAPI.getGender();
    const genderName = HealthAPI.getGenderName(gender);
    const genderIcon = HealthAPI.getGenderIcon(gender);

    tg.showPopup({
        title: '⚙️ Профиль здоровья',
        message: `${genderIcon} Пол: ${genderName}\n\n🚧 Полный профиль (возраст, вес, рост) будет доступен после добавления API endpoint.\n\nВы можете изменить пол в любое время.`,
        buttons: [
            { id: 'change', type: 'default', text: 'Изменить пол' },
            { id: 'close', type: 'close' }
        ]
    }, (buttonId) => {
        if (buttonId === 'change') {
            showGenderChange();
        }
    });
}

function showGenderChange() {
    // Создаём временное модальное окно для смены пола
    const currentGender = HealthAPI.getGender();

    const modalHtml = `
        <div class="modal active" id="change-gender-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Изменить пол</h2>
                    <button class="modal-close" onclick="closeChangeGenderModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="gender-buttons">
                        <button class="gender-btn ${currentGender === 'male' ? 'selected' : ''}"
                                data-gender="male" onclick="selectNewGender('male', this)">
                            <div class="gender-icon">♂️</div>
                            <div class="gender-label">Мужской</div>
                        </button>
                        <button class="gender-btn ${currentGender === 'female' ? 'selected' : ''}"
                                data-gender="female" onclick="selectNewGender('female', this)">
                            <div class="gender-icon">♀️</div>
                            <div class="gender-label">Женский</div>
                        </button>
                        <button class="gender-btn ${currentGender === 'other' ? 'selected' : ''}"
                                data-gender="other" onclick="selectNewGender('other', this)">
                            <div class="gender-icon">⚧️</div>
                            <div class="gender-label">Другой</div>
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="closeChangeGenderModal()">Отмена</button>
                    <button class="btn-save" onclick="saveNewGender()">Сохранить</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    window.newSelectedGender = currentGender;
}

function selectNewGender(gender, element) {
    window.newSelectedGender = gender;

    document.querySelectorAll('#change-gender-modal .gender-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    element.classList.add('selected');

    tg.HapticFeedback.impactOccurred('light');
}

function saveNewGender() {
    if (window.newSelectedGender) {
        HealthAPI.setGender(window.newSelectedGender);

        tg.showPopup({
            title: '✅ Сохранено',
            message: 'Пол успешно изменён',
            buttons: [{ type: 'ok' }]
        });

        closeChangeGenderModal();

        // Обновляем симптомы если форма открыта
        if (document.getElementById('detailed-modal').classList.contains('active')) {
            initSymptomsChips();
        }
    }
}

function closeChangeGenderModal() {
    const modal = document.getElementById('change-gender-modal');
    if (modal) {
        modal.remove();
    }
    delete window.newSelectedGender;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ====================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ====================
document.addEventListener('DOMContentLoaded', init);

console.log('✅ Health.js загружен - полная версия v2.0.0');