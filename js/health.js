const tg = window.Telegram.WebApp;
tg.expand();
tg.BackButton.show();
tg.BackButton.onClick(() => window.history.back());

// Состояние формы
let currentRatings = {
    overall_feeling: null,
    energy_level: null,
    sleep_quality: null,
    stress_level: null
};
let selectedSymptoms = [];

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function init() {
    try {
        // Устанавливаем текущую дату
        document.getElementById('current-date').textContent =
            new Date().toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });

        // ✅ ИСПОЛЬЗУЕМ HealthAPI вместо API
        const hasTodayEntry = await HealthAPI.hasTodayEntry();

        if (hasTodayEntry) {
            // Уже есть запись сегодня - скрываем быструю форму
            document.getElementById('quick-log-section').style.display = 'none';
        }

        // Загружаем статистику
        await loadStatistics();

        // Загружаем историю
        await loadHistory();

        tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        tg.showAlert('Ошибка загрузки данных');
    }
}

// ==================== БЫСТРАЯ ОЦЕНКА ====================
async function quickLog(feeling) {
    try {
        tg.HapticFeedback.impactOccurred('medium');

        // ✅ ИСПОЛЬЗУЕМ HealthAPI
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
        await loadStatistics();
        await loadHistory();

    } catch (error) {
        console.error('Ошибка сохранения:', error);
        tg.showAlert('Ошибка: ' + error.message);
    }
}

// ==================== СТАТИСТИКА ====================
async function loadStatistics() {
    try {
        // ✅ ИСПОЛЬЗУЕМ HealthAPI
        const stats = await HealthAPI.getStatistics(30);

        document.getElementById('avg-feeling').textContent =
            stats.avg_overall_feeling ? stats.avg_overall_feeling.toFixed(1) + '/5' : '-';

        document.getElementById('total-entries').textContent =
            stats.total_entries || 0;

    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// ==================== ИСТОРИЯ ====================
async function loadHistory() {
    try {
        // ✅ ИСПОЛЬЗУЕМ HealthAPI
        const entries = await HealthAPI.getEntries(30, 20);
        const container = document.getElementById('entries-list');

        if (!entries || entries.length === 0) {
            container.innerHTML = '<div class="empty-state">Нет записей</div>';
            return;
        }

        container.innerHTML = entries.map(entry => {
            // ✅ ИСПОЛЬЗУЕМ вспомогательные методы HealthAPI
            const emoji = HealthAPI.getFeelingEmoji(entry.overall_feeling);
            const dateStr = HealthAPI.formatEntryDate(entry.recorded_at, true);

            return `
                <div class="entry-card" onclick="viewEntry(${entry.id})">
                    <div class="entry-emoji">${emoji}</div>
                    <div class="entry-info">
                        <div class="entry-date">${dateStr}</div>
                        ${entry.notes ? `<div class="entry-notes">${escapeHtml(entry.notes)}</div>` : ''}
                    </div>
                    <div class="entry-rating">${entry.overall_feeling}/5</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
    }
}

// ==================== ПОДРОБНАЯ ФОРМА ====================
function openDetailedForm() {
    // Инициализируем рейтинговые шкалы
    initRatingScale('overall-feeling', 'overall_feeling', true);
    initRatingScale('energy-level', 'energy_level', false);
    initRatingScale('sleep-quality', 'sleep_quality', false);
    initRatingScale('stress-level', 'stress_level', false);

    // Инициализируем чипсы симптомов
    initSymptomsChips();

    // Показываем модальное окно
    document.getElementById('detailed-modal').classList.add('active');
    tg.HapticFeedback.impactOccurred('light');
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
    document.getElementById('notes').value = '';
}

function initRatingScale(containerId, ratingKey, required) {
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

    // Визуально выделяем выбранную кнопку
    const container = document.getElementById(containerId);
    container.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.value) === value);
    });

    tg.HapticFeedback.impactOccurred('light');
}

function initSymptomsChips() {
    const container = document.getElementById('symptoms-chips');

    // ✅ ИСПОЛЬЗУЕМ метод из HealthAPI
    const symptoms = HealthAPI.getAvailableSymptoms();

    container.innerHTML = symptoms.map(symptom => {
        return `
            <button class="symptom-chip" onclick="toggleSymptom('${symptom}')">
                ${symptom}
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
    // ✅ ИСПОЛЬЗУЕМ валидацию из HealthAPI
    const entryData = {
        overall_feeling: currentRatings.overall_feeling,
        energy_level: currentRatings.energy_level,
        sleep_quality: currentRatings.sleep_quality,
        stress_level: currentRatings.stress_level,
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : null,
        notes: document.getElementById('notes').value.trim() || null
    };

    const validation = HealthAPI.validateEntry(entryData);

    if (!validation.valid) {
        tg.showAlert(validation.errors.join('\n'));
        return;
    }

    try {
        tg.MainButton.showProgress();

        // ✅ ИСПОЛЬЗУЕМ HealthAPI
        await HealthAPI.createEntry(entryData);

        tg.MainButton.hideProgress();
        closeDetailedForm();

        tg.showPopup({
            title: '✅ Готово',
            message: 'Запись сохранена',
            buttons: [{ type: 'ok' }]
        });

        // Обновляем данные
        await loadStatistics();
        await loadHistory();

    } catch (error) {
        tg.MainButton.hideProgress();
        console.error('Ошибка сохранения:', error);
        tg.showAlert('Ошибка: ' + error.message);
    }
}

// ==================== ПРОСМОТР ЗАПИСИ ====================
function viewEntry(entryId) {
    // TODO: Реализовать просмотр/редактирование записи
    tg.showAlert('Просмотр записи в разработке');
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', init);