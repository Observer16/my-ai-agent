/**
 * Дневник здоровья - Главный файл
 * Версия: 3.0.0
 * 
 * Модульная архитектура:
 * - health.js (этот файл) - инициализация и координация
 * - health-ui.js - UI компоненты и рендеринг
 * - health-stats.js - статистика и аналитика
 * - health-forms.js - формы создания/редактирования
 */

const tg = window.Telegram.WebApp;
tg.expand();
tg.BackButton.show();
tg.BackButton.onClick(() => window.history.back());

// ==================== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ====================
window.HealthApp = {
    state: {
        currentPeriodDays: 7,
        todayEntry: null,
        allEntries: [],
        currentFilter: 'all',
        loadedEntriesCount: 20,
        isEditMode: false,
        editingDate: null,
        selectedGender: null
    },
    
    // Подписка на изменения состояния
    listeners: [],
    
    setState(updates) {
        Object.assign(this.state, updates);
        this.notifyListeners();
    },
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },
    
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function init() {
    try {
        // Проверяем гендер
        if (!HealthAPI.isGenderSet()) {
            console.log('ℹ️ Гендер не установлен, показываем форму выбора');
            HealthUI.showGenderSetup();
            return;
        }

        // Показываем основной контент
        document.getElementById('main-content').style.display = 'block';

        // Устанавливаем текущую дату
        updateCurrentDate();

        // Проверяем запись за сегодня
        const hasTodayEntry = await HealthAPI.hasTodayEntry();
        
        if (hasTodayEntry) {
            document.getElementById('quick-log-section').style.display = 'none';
            await loadTodayEntry();
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
    const endDate = HealthAPI.getTodayDate();
    const startDate = HealthAPI.getDateDaysAgo(HealthApp.state.currentPeriodDays);
    
    await Promise.all([
        loadStatistics(startDate, endDate),
        loadHistory(startDate, endDate)
    ]);
}

// ==================== ГЕНДЕР ====================
async function saveGenderSetup() {
    if (!HealthApp.state.selectedGender) {
        tg.showAlert('Пожалуйста, выберите пол');
        return;
    }

    const success = await HealthAPI.setGender(HealthApp.state.selectedGender);

    if (success) {
        document.getElementById('gender-setup-modal').classList.remove('active');
        document.getElementById('main-content').style.display = 'block';

        tg.showPopup({
            title: '✅ Готово',
            message: 'Профиль настроен! Теперь вы можете вести дневник здоровья.',
            buttons: [{ type: 'ok' }]
        });

        init();
    } else {
        tg.showAlert('Ошибка сохранения. Попробуйте ещё раз.');
    }
}

function selectGenderSetup(gender, element) {
    HealthApp.setState({ selectedGender: gender });

    document.querySelectorAll('#gender-setup-modal .gender-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    element.classList.add('selected');

    document.getElementById('save-gender-btn').disabled = false;
    tg.HapticFeedback.impactOccurred('light');
}

// ==================== БЫСТРАЯ ОЦЕНКА ====================
async function quickLog(mood) {
    try {
        tg.HapticFeedback.impactOccurred('medium');
        
        const today = HealthAPI.getTodayDate();
        await HealthAPI.addMood(today, getMoodByFeeling(mood));

        tg.showPopup({
            title: '✅ Готово',
            message: 'Запись сохранена',
            buttons: [{ type: 'ok' }]
        });

        document.getElementById('quick-log-section').style.display = 'none';
        await loadTodayEntry();
        await loadAllData();

    } catch (error) {
        console.error('Ошибка сохранения:', error);
        tg.showAlert('Ошибка: ' + error.message);
    }
}

function getMoodByFeeling(feeling) {
    const moodMap = {
        1: 'грусть',
        2: 'стресс',
        3: 'релакс',
        4: 'радость',
        5: 'радостное_волнение'
    };
    return moodMap[feeling] || 'релакс';
}

function getFeelingByMood(mood) {
    const feelingMap = {
        'грусть': 1,
        'стресс': 2,
        'тревожность': 2,
        'раздраженность': 2,
        'обидчивость': 2,
        'релакс': 3,
        'радость': 4,
        'радостное_волнение': 5
    };
    return feelingMap[mood] || 3;
}

// ==================== СЕГОДНЯШНЯЯ ЗАПИСЬ ====================
async function loadTodayEntry() {
    try {
        const today = HealthAPI.getTodayDate();
        const entry = await HealthAPI.getEntry(today);
        
        if (!entry) return;

        HealthApp.setState({ todayEntry: entry });
        HealthUI.renderTodayEntry(entry);

    } catch (error) {
        if (!error.message.includes('404')) {
            console.error('Ошибка загрузки сегодняшней записи:', error);
        }
    }
}

async function editTodayEntry() {
    const entry = HealthApp.state.todayEntry;
    if (!entry) return;

    const today = HealthAPI.getTodayDate();
    HealthForms.openEditForm(today, entry);
}

// ==================== СМЕНА ПЕРИОДА ====================
function changePeriod(days, element) {
    HealthApp.setState({ currentPeriodDays: days });

    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    element.classList.add('active');

    loadAllData();
    tg.HapticFeedback.impactOccurred('light');
}

// ==================== СТАТИСТИКА ====================
async function loadStatistics(startDate, endDate) {
    try {
        const stats = await HealthAPI.getStatisticsByDays(HealthApp.state.currentPeriodDays);
        HealthStats.renderStatistics(stats);
        HealthStats.renderTrendChart(stats);
        HealthStats.renderInsights(stats);
        HealthStats.renderTopSymptoms(stats);
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// ==================== ИСТОРИЯ ====================
async function loadHistory(startDate, endDate) {
    try {
        const entries = await HealthAPI.getEntriesByDays(HealthApp.state.currentPeriodDays);
        HealthApp.setState({ allEntries: entries || [] });
        renderHistory();
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
    }
}

function renderHistory() {
    const { allEntries, currentFilter, loadedEntriesCount } = HealthApp.state;
    const container = document.getElementById('entries-list');

    // Фильтрация
    let filteredEntries = allEntries;
    
    if (currentFilter === 'positive') {
        filteredEntries = allEntries.filter(e => {
            const feeling = e.mood ? getFeelingByMood(e.mood) : 3;
            return feeling >= 4;
        });
    } else if (currentFilter === 'neutral') {
        filteredEntries = allEntries.filter(e => {
            const feeling = e.mood ? getFeelingByMood(e.mood) : 3;
            return feeling === 3;
        });
    } else if (currentFilter === 'negative') {
        filteredEntries = allEntries.filter(e => {
            const feeling = e.mood ? getFeelingByMood(e.mood) : 3;
            return feeling <= 2;
        });
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

    const entriesToShow = filteredEntries.slice(0, loadedEntriesCount);
    
    container.innerHTML = entriesToShow.map(entry => {
        const emoji = entry.mood ? HealthAPI.getMoodEmoji(entry.mood) : '😐';
        const dateStr = HealthAPI.formatEntryDate(entry.entry_date);

        let metricsHtml = '';
        if (entry.sleep_hours) metricsHtml += `😴 ${entry.sleep_hours}ч `;
        if (entry.weight) metricsHtml += `⚖️ ${entry.weight}кг`;

        return `
            <div class="entry-card" onclick="viewEntry('${entry.entry_date}')">
                <div class="entry-emoji">${emoji}</div>
                <div class="entry-info">
                    <div class="entry-date">${dateStr}</div>
                    ${metricsHtml ? `<div class="entry-metrics">${metricsHtml}</div>` : ''}
                    ${entry.notes ? `<div class="entry-notes">${escapeHtml(entry.notes.substring(0, 80))}${entry.notes.length > 80 ? '...' : ''}</div>` : ''}
                </div>
                <div class="entry-rating">${entry.mood ? HealthAPI.getMoodDescription(entry.mood) : '-'}</div>
            </div>
        `;
    }).join('');

    // Кнопка "Загрузить ещё"
    if (filteredEntries.length > loadedEntriesCount) {
        document.getElementById('load-more-btn').style.display = 'block';
    } else {
        document.getElementById('load-more-btn').style.display = 'none';
    }
}

function loadMoreEntries() {
    HealthApp.setState({ 
        loadedEntriesCount: HealthApp.state.loadedEntriesCount + 20 
    });
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
    HealthApp.setState({ currentFilter: filter });

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    element.classList.add('active');

    renderHistory();
    tg.HapticFeedback.impactOccurred('light');
}

// ==================== ПРОСМОТР ЗАПИСИ ====================
async function viewEntry(entryDate) {
    try {
        const entry = await HealthAPI.getEntry(entryDate);
        if (!entry) {
            tg.showAlert('Запись не найдена');
            return;
        }

        HealthUI.showViewModal(entry);
        tg.HapticFeedback.impactOccurred('light');

    } catch (error) {
        console.error('Ошибка просмотра записи:', error);
        tg.showAlert('Ошибка загрузки записи: ' + error.message);
    }
}

function closeViewModal() {
    document.getElementById('view-entry-modal').classList.remove('active');
}

async function editCurrentEntry() {
    const modal = document.getElementById('view-entry-modal');
    const entryDate = modal.dataset.entryDate;
    
    if (!entryDate) return;

    try {
        const entry = await HealthAPI.getEntry(entryDate);
        closeViewModal();
        HealthForms.openEditForm(entryDate, entry);
    } catch (error) {
        console.error('Ошибка загрузки записи:', error);
        tg.showAlert('Ошибка загрузки');
    }
}

async function confirmDeleteEntry() {
    const modal = document.getElementById('view-entry-modal');
    const entryDate = modal.dataset.entryDate;
    
    if (!entryDate) return;

    tg.showPopup({
        title: '🗑️ Удалить запись?',
        message: 'Это действие нельзя отменить',
        buttons: [
            { id: 'cancel', type: 'cancel' },
            { id: 'delete', type: 'destructive', text: 'Удалить' }
        ]
    }, async (buttonId) => {
        if (buttonId === 'delete') {
            await deleteEntry(entryDate);
        }
    });
}

async function deleteEntry(entryDate) {
    try {
        tg.MainButton.showProgress();
        await HealthAPI.deleteEntry(entryDate);
        tg.MainButton.hideProgress();
        
        closeViewModal();

        tg.showPopup({
            title: '✅ Удалено',
            message: 'Запись успешно удалена',
            buttons: [{ type: 'ok' }]
        });

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
        message: `${genderIcon} Пол: ${genderName}\n\nВы можете изменить пол в любое время.`,
        buttons: [
            { id: 'change', type: 'default', text: 'Изменить пол' },
            { id: 'close', type: 'close' }
        ]
    }, (buttonId) => {
        if (buttonId === 'change') {
            HealthUI.showGenderChange();
        }
    });
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ====================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== ПОДПИСКА НА ОБНОВЛЕНИЯ ====================
HealthApp.subscribe((state) => {
    // Автоматическое обновление UI при изменении состояния
    if (state.allEntries) {
        renderHistory();
    }
});

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ====================
document.addEventListener('DOMContentLoaded', init);

console.log('✅ Health.js загружен v3.0.0 (модульная архитектура)');
