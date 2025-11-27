// Главная логика Mini App
const tg = window.Telegram.WebApp;

// === ИНИЦИАЛИЗАЦИЯ ===

// Текущее приглашение
let currentInvite = null;
let allPendingInvites = [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Загрузка приложения...');
    
    // Показать приветствие
    showGreeting();
    
    // ВАЖНО: Сначала проверяем приглашения
    await checkPendingInvites();
    
    // Затем загружаем данные
    await loadDashboardData();
    
    console.log('✅ Приложение готово');
});

/**
 * Показать приветствие пользователю
 */
function showGreeting() {
    const user = tg.initDataUnsafe?.user;
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
    // Обновляем информацию о пользователе
    const user = tg.initDataUnsafe?.user;
    if (user) {
        try {
            await API.post('/user/update-info', {
                first_name: user.first_name,
                username: user.username
            });
        } catch (error) {
            console.warn('Не удалось обновить информацию:', error);
        }
    }
        
    // Загружаем информацию о семье
    await loadFamilyInfo();
    
    // Загрузка месячной статистики
    await loadMonthlyStats();
    
    // Бюджет
    try {
        const stats = await API.getStatistics();
        document.getElementById('budget-total').textContent = formatCurrency(stats.total_spent);
        document.getElementById('budget-purchases').textContent = stats.total_purchases || 0;
    } catch (error) {
        console.error('Ошибка загрузки бюджета:', error);
        document.getElementById('budget-total').textContent = 'Ошибка';
        document.getElementById('budget-purchases').textContent = '-';
    }
    
    // Товары и категории
    try {
        const [products, categories] = await Promise.all([
            API.getProducts(null, null, 1),
            API.getCategories()
        ]);
        
        // Для получения общего количества товаров делаем отдельный запрос
        const allProducts = await API.getProducts(null, null, 500);
        
        document.getElementById('products-total').textContent = allProducts.length || 0;
        document.getElementById('categories-total').textContent = categories.length || 0;
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        document.getElementById('products-total').textContent = '-';
        document.getElementById('categories-total').textContent = '-';
    }
    
    // Здоровье (заглушка)
    document.getElementById('health-today').textContent = '😊';
    document.getElementById('health-week').textContent = '4.2/5';
    
    // Активность (заглушка)
    document.getElementById('activity-steps').textContent = '8.5K';
    document.getElementById('activity-workouts').textContent = '3';
}

/**
 * Загрузка месячной статистики
 */
async function loadMonthlyStats() {
    try {
        const stats = await API.getMonthlyStatistics();
        
        // Форматируем сумму
        document.getElementById('monthly-total').textContent = formatCurrency(stats.summary.total_spent);
        
        // Период
        const now = new Date();
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                           'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        document.getElementById('monthly-period').textContent = monthNames[now.getMonth()];
        
        // Количество покупок
        document.getElementById('monthly-purchases').textContent = stats.summary.total_purchases;
        
    } catch (error) {
        console.error('Ошибка загрузки месячной статистики:', error);
        document.getElementById('monthly-total').textContent = 'Ошибка';
        document.getElementById('monthly-period').textContent = '-';
        document.getElementById('monthly-purchases').textContent = '-';
    }
}

/**
 * ЗАГРУЗИТЬ ИНФОРМАЦИЮ О СЕМЬЕ
 */
async function loadFamilyInfo() {
    try {
        const family = await API.getFamilyInfo();
        const container = document.getElementById('family-indicator');
        
        if (family) {
            container.innerHTML = `
                <div class="family-indicator" onclick="openFamily()">
                    👥 ${family.name} (${family.members_count})
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="family-indicator solo" onclick="openFamily()">
                    👤 Solo
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка загрузки информации о семье:', error);
    }
}

/**
 * ПРОВЕРКА ПРИГЛАШЕНИЙ
 */
async function checkPendingInvites() {
    try {
        console.log('📬 Проверка входящих приглашений...');
        const invites = await API.getPendingInvites();
        
        if (invites && invites.length > 0) {
            console.log(`✅ Найдено приглашений: ${invites.length}`);
            allPendingInvites = invites;
            showInviteModal(invites[0]);
        } else {
            console.log('📭 Нет входящих приглашений');
        }
    } catch (error) {
        console.error('❌ Ошибка проверки приглашений:', error);
    }
}

/**
 * ПОКАЗАТЬ МОДАЛЬНОЕ ОКНО ПРИГЛАШЕНИЯ
 */
function showInviteModal(invite) {
    currentInvite = invite;
    
    const inviterName = invite.invited_by_first_name || invite.invited_by_username || 'Пользователь';
    const familyName = invite.family_name || 'Без названия';
    const hoursLeft = Math.floor(invite.hours_remaining);
    
    document.getElementById('invite-text').innerHTML = `
        <strong>${inviterName}</strong> приглашает вас<br>
        в семью "<strong>${familyName}</strong>"
    `;
    
    const messageEl = document.getElementById('invite-message');
    if (invite.message) {
        messageEl.textContent = `💬 "${invite.message}"`;
        messageEl.style.display = 'block';
    } else {
        messageEl.style.display = 'none';
    }
    
    document.getElementById('invite-expiry').textContent = 
        `⏳ Приглашение действительно ещё ${hoursLeft} ч.`;
    
    document.getElementById('invite-modal').classList.add('active');
    tg.HapticFeedback.notificationOccurred('success');
}

/**
 * ПРИНЯТЬ ПРИГЛАШЕНИЕ
 */
async function acceptCurrentInvite() {
    if (!currentInvite) return;
    
    try {
        tg.HapticFeedback.impactOccurred('medium');
        const result = await API.acceptInvite(currentInvite.invite_token);
        
        document.getElementById('invite-modal').classList.remove('active');
        
        tg.showPopup({
            title: '✅ Успешно!',
            message: `Вы вступили в семью "${result.family_name}"!`,
            buttons: [{type: 'ok'}]
        }, () => {
            window.location.reload();
        });
    } catch (error) {
        console.error('❌ Ошибка принятия приглашения:', error);
        tg.showAlert('Ошибка: ' + error.message);
    }
}

/**
 * ОТКЛОНИТЬ ПРИГЛАШЕНИЕ
 */
async function declineCurrentInvite() {
    if (!currentInvite) return;
    
    try {
        tg.HapticFeedback.impactOccurred('light');
        await API.declineInvite(currentInvite.invite_token);
        
        document.getElementById('invite-modal').classList.remove('active');
        
        allPendingInvites = allPendingInvites.filter(
            inv => inv.invite_token !== currentInvite.invite_token
        );
        
        if (allPendingInvites.length > 0) {
            setTimeout(() => {
                showInviteModal(allPendingInvites[0]);
            }, 300);
        }
    } catch (error) {
        console.error('❌ Ошибка отклонения приглашения:', error);
        tg.showAlert('Ошибка: ' + error.message);
    }
}

/**
 * Добавление пользователя
 */
async function updateUserInfo() {
    const user = window.Telegram.WebApp.initDataUnsafe?.user;
    
    if (!user) {
        console.error('Нет данных пользователя');
        return;
    }
    
    try {
        const result = await API.post('/user/update-info', {
            first_name: user.first_name,
            username: user.username
        });
        
        console.log('✅ Информация обновлена:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Ошибка обновления:', error);
        throw error;
    }
}

/**
 * Открыть статистику за месяц
 */
function openMonthlyStats() {
    tg.HapticFeedback.impactOccurred('medium');
    window.location.href = 'pages/monthly-stats.html';
}

/**
 * Открыть модуль
 */
function openModule(moduleName) {
    tg.HapticFeedback.impactOccurred('light');
    
    const modulePages = {
        'budget': 'pages/budget.html',
        'products': 'pages/products.html',
        'add-expense': 'pages/add-expense.html',
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
 * Форматировать валюту
 */
function formatCurrency(amount) {
    if (!amount || amount === 0) return '0 ₲';
    
    const rounded = Math.round(amount);
    
    // Для сумм >= 1 000 000 (миллион)
    if (rounded >= 1000000) {
        const thousands = Math.round(rounded / 1000);
        return `${thousands.toLocaleString('ru-RU')}K ₲`;
    } 
    // Для сумм >= 1 000 (тысяча)
    else if (rounded >= 1000) {
        const thousands = Math.round(rounded / 1000);
        return `${thousands.toLocaleString('ru-RU')}K ₲`;
    }
    // Для сумм < 1 000
    else {
        return `${rounded.toLocaleString('ru-RU')} ₲`;
    }
}

/**
 * ОТКРЫТЬ УПРАВЛЕНИЕ СЕМЬЁЙ
 */
function openFamily() {
    tg.HapticFeedback.impactOccurred('light');
    // Временно показываем alert
    tg.showAlert('Страница управления семьёй в разработке.\nСоздай pages/family.html для полного функционала.');
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
 * Форматировать дату
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('ru-RU', {
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
