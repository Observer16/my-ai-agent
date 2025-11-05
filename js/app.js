// Главная логика Mini App
const tg = window.Telegram.WebApp;

// === ИНИЦИАЛИЗАЦИЯ ===

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Загрузка приложения...');
    
    // Показать приветствие
    showGreeting();
    
    // Загрузить данные
    await loadDashboardData();
    
    console.log('✅ Приложение готово');
});

/**
 * Показать приветствие пользователю
 */
function showGreeting() {
    const user = CONFIG.TELEGRAM.user;
    const greetingEl = document.getElementById('greeting');
    const userInfoEl = document.getElementById('user-info');
    
    if (user) {
        const hour = new Date().getHours();
        let greeting = 'Добрый день';
        if (hour < 6) greeting = 'Доброй ночи';
        else if (hour < 12) greeting = 'Доброе утро';
        else if (hour < 18) greeting = 'Добрый день';
        else greeting = 'Добрый вечер';
        
        greetingEl.textContent = `${greeting}, ${user.first_name}! 👋`;
        userInfoEl.textContent = `@${user.username || 'user'}`;
    } else {
        greetingEl.textContent = 'Добро пожаловать! 👋';
        userInfoEl.textContent = 'Telegram Mini App';
    }
}

/**
 * Загрузить данные для dashboard
 */
async function loadDashboardData() {
    // Загрузить данные бюджета
    try {
        const stats = await API.getStatistics();
        document.getElementById('budget-total').textContent = 
            formatCurrency(stats.total_spent);
        document.getElementById('budget-purchases').textContent = 
            stats.total_purchases;
    } catch (error) {
        console.error('Ошибка загрузки бюджета:', error);
        document.getElementById('budget-total').textContent = 'Ошибка';
        document.getElementById('budget-purchases').textContent = '-';
    }
    
    // Загрузить данные здоровья (заглушка)
    document.getElementById('health-today').textContent = '😊 Хорошо';
    document.getElementById('health-week').textContent = '4.2/5';
    
    // Загрузить данные активности (заглушка)
    document.getElementById('activity-steps').textContent = '8,542';
    document.getElementById('activity-workouts').textContent = '3';
}

/**
 * Открыть модуль
 */
function openModule(moduleName) {
    tg.HapticFeedback.impactOccurred('light');
    
    const modulePages = {
        'budget': 'pages/budget.html',
        'health': 'pages/health.html',
        'activity': 'pages/activity.html',
        'doctor': 'pages/doctor.html'
    };
    
    const page = modulePages[moduleName];
    if (page) {
        window.location.href = page;
    } else {
        tg.showAlert('Модуль в разработке');
    }
}

/**
 * Быстрое действие
 */
function quickAction(action) {
    tg.HapticFeedback.impactOccurred('medium');
    
    const actions = {
        'log-expense': () => {
            // Открыть форму добавления расхода
            tg.showPopup({
                title: 'Добавить расход',
                message: 'Функция в разработке',
                buttons: [{type: 'ok'}]
            });
        },
        'log-health': () => {
            // Открыть форму оценки самочувствия
            window.location.href = 'pages/health.html?action=log';
        },
        'log-activity': () => {
            // Открыть форму записи тренировки
            window.location.href = 'pages/activity.html?action=log';
        },
        'ask-doctor': () => {
            // Открыть чат с AI доктором
            window.location.href = 'pages/doctor.html';
        }
    };
    
    const actionFn = actions[action];
    if (actionFn) {
        actionFn();
    } else {
        tg.showAlert('Функция в разработке');
    }
}

/**
 * Форматировать валюту
 */
function formatCurrency(amount) {
    if (!amount) return '0 ₲';
    
    const formatted = Math.round(amount).toLocaleString('ru-RU');
    
    // Сократить большие числа
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M ₲`;
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K ₲`;
    }
    
    return `${formatted} ₲`;
}

/**
 * Форматировать дату
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString(CONFIG.LOCALE, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Показать loading
 */
function showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
    }
}

/**
 * Показать ошибку
 */
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = `<div class="error">❌ ${message}</div>`;
    }
}

console.log('✅ App.js загружен');
