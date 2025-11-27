// Главная логика Mini App

// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let tg = null;
let currentInvite = null;
let allPendingInvites = [];

// === ИНИЦИАЛИЗАЦИЯ ===

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Загрузка приложения...');
    
    try {
        // Инициализация Telegram WebApp
        if (!CONFIG.initTelegram()) {
            // Если не в Telegram, создаем заглушку
            tg = {
                HapticFeedback: {
                    impactOccurred: () => {},
                    notificationOccurred: () => {}
                },
                showAlert: (msg) => alert(msg),
                showPopup: (options, callback) => {
                    alert(options.message);
                    if (callback) callback();
                },
                BackButton: {
                    hide: () => {},
                    show: () => {}
                }
            };
        } else {
            tg = CONFIG.TELEGRAM.tg;
        }
        
        // Показать приветствие
        showGreeting();
        
        // Проверить подключение к API
        const isConnected = await API.testConnection();
        if (!isConnected) {
            showError('connection', 'Не удалось подключиться к серверу. Проверьте подключение к интернету.');
            return;
        }
        
        // Обновить информацию пользователя
        await updateUserInfo();
        
        // Проверить приглашения в семью
        await checkPendingInvites();
        
        // Загрузить основные данные
        await loadDashboardData();
        
        console.log('✅ Приложение готово');
        
    } catch (error) {
        console.error('❌ Критическая ошибка инициализации:', error);
        showError('main', `Ошибка загрузки: ${error.message}`);
    }
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
 * Обновить информацию пользователя на сервере
 */
async function updateUserInfo() {
    const user = CONFIG.TELEGRAM.user;
    
    if (!user) {
        CONFIG.log('warn', '⚠️ Нет данных пользователя для обновления');
        return;
    }
    
    try {
        const result = await API.post('/user/update-info', {
            first_name: user.first_name,
            username: user.username,
            language_code: user.language_code
        });
        
        CONFIG.log('info', '✅ Информация пользователя обновлена:', result);
        return result;
        
    } catch (error) {
        CONFIG.log('error', '❌ Ошибка обновления информации:', error);
        // Не блокируем приложение при этой ошибке
    }
}

/**
 * Загрузить данные для dashboard
 */
async function loadDashboardData() {
    CONFIG.log('info', '📊 Загрузка данных dashboard...');
    
    // Показать индикаторы загрузки
    showLoadingStates();
    
    try {
        // Загрузить информацию о семье
        await loadFamilyInfo();
        
        // Загрузить месячную статистику
        await loadMonthlyStats();
        
        // Загрузить данные модулей параллельно
        await Promise.all([
            loadBudgetData(),
            loadProductsData(),
            loadHealthData(),
            loadActivityData()
        ]);
        
        CONFIG.log('info', '✅ Все данные dashboard загружены');
        
    } catch (error) {
        CONFIG.log('error', '❌ Ошибка загрузки dashboard:', error);
        showError('dashboard', 'Не удалось загрузить некоторые данные');
    }
}

/**
 * Показать состояния загрузки
 */
function showLoadingStates() {
    const loadingElements = [
        'monthly-total', 'monthly-period', 'monthly-purchases',
        'budget-total', 'budget-purchases',
        'products-total', 'categories-total',
        'health-today', 'health-week',
        'activity-steps', 'activity-workouts'
    ];
    
    loadingElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '...';
    });
}

/**
 * Загрузить информацию о семье
 */
async function loadFamilyInfo() {
    try {
        const family = await API.getFamilyInfo();
        const container = document.getElementById('family-indicator');
        
        if (!container) {
            CONFIG.log('warn', '⚠️ Контейнер индикатора семьи не найден');
            return;
        }
        
        if (family && family.name) {
            container.innerHTML = `
                <div class="family-indicator" onclick="openFamily()">
                    👥 ${family.name} (${family.members_count || 1})
                </div>
            `;
            CONFIG.log('info', '✅ Информация о семье загружена:', family.name);
        } else {
            container.innerHTML = `
                <div class="family-indicator solo" onclick="openFamily()">
                    👤 Solo
                </div>
            `;
            CONFIG.log('info', '✅ Пользователь не в семье (Solo режим)');
        }
    } catch (error) {
        CONFIG.log('error', '❌ Ошибка загрузки информации о семье:', error);
        const container = document.getElementById('family-indicator');
        if (container) {
            container.innerHTML = `
                <div class="family-indicator solo" onclick="openFamily()">
                    👤 Ошибка
                </div>
            `;
        }
    }
}

/**
 * Загрузить месячную статистику
 */
async function loadMonthlyStats() {
    try {
        const stats = await API.getMonthlyStatistics();
        
        // Форматируем сумму
        const totalElement = document.getElementById('monthly-total');
        if (totalElement) {
            totalElement.textContent = formatCurrency(stats.summary.total_spent);
        }
        
        // Период
        const periodElement = document.getElementById('monthly-period');
        if (periodElement) {
            const now = new Date();
            const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                               'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
            periodElement.textContent = monthNames[now.getMonth()];
        }
        
        // Количество покупок
        const purchasesElement = document.getElementById('monthly-purchases');
        if (purchasesElement) {
            purchasesElement.textContent = stats.summary.total_purchases || 0;
        }
        
        CONFIG.log('info', '✅ Месячная статистика загружена');
        
    } catch (error) {
        CONFIG.log('error', '❌ Ошибка загрузки месячной статистики:', error);
        const totalElement = document.getElementById('monthly-total');
        if (totalElement) totalElement.textContent = 'Ошибка';
    }
}

/**
 * Загрузить данные бюджета
 */
async function loadBudgetData() {
    try {
        const stats = await API.getStatistics();
        document.getElementById('budget-total').textContent = formatCurrency(stats.total_spent);
        document.getElementById('budget-purchases').textContent = stats.total_purchases || 0;
        CONFIG.log('info', '✅ Данные бюджета загружены');
    } catch (error) {
        CONFIG.log('error', '❌ Ошибка загрузки бюджета:', error);
        document.getElementById('budget-total').textContent = 'Ошибка';
        document.getElementById('budget-purchases').textContent = '-';
    }
}

/**
 * Загрузить данные товаров
 */
async function loadProductsData() {
    try {
        const [products, categories] = await Promise.all([
            API.getProducts(null, null, 1), // Только для подсчета
            API.getCategories()
        ]);
        
        // Для получения общего количества товаров делаем отдельный запрос
        const allProducts = await API.getProducts(null, null, 500);
        
        document.getElementById('products-total').textContent = allProducts.length || 0;
        document.getElementById('categories-total').textContent = categories.length || 0;
        CONFIG.log('info', '✅ Данные товаров загружены');
    } catch (error) {
        CONFIG.log('error', '❌ Ошибка загрузки товаров:', error);
        document.getElementById('products-total').textContent = '-';
        document.getElementById('categories-total').textContent = '-';
    }
}

/**
 * Загрузить данные здоровья (заглушка)
 */
async function loadHealthData() {
    // Заглушка - в реальном приложении здесь будет API вызов
    document.getElementById('health-today').textContent = '😊';
    document.getElementById('health-week').textContent = '4.2/5';
}

/**
 * Загрузить данные активности (заглушка)
 */
async function loadActivityData() {
    // Заглушка - в реальном приложении здесь будет API вызов
    document.getElementById('activity-steps').textContent = '8.5K';
    document.getElementById('activity-workouts').textContent = '3';
}

// === СИСТЕМА ПРИГЛАШЕНИЙ ===

/**
 * Проверить входящие приглашения
 */
async function checkPendingInvites() {
    try {
        CONFIG.log('info', '📬 Проверка входящих приглашений...');
        const invites = await API.getPendingInvites();
        
        if (invites && invites.length > 0) {
            CONFIG.log('info', `✅ Найдено приглашений: ${invites.length}`);
            allPendingInvites = invites;
            showInviteModal(invites[0]);
        } else {
            CONFIG.log('info', '📭 Нет входящих приглашений');
        }
    } catch (error) {
        CONFIG.log('error', '❌ Ошибка проверки приглашений:', error);
    }
}

/**
 * Показать модальное окно приглашения
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
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

/**
 * Принять текущее приглашение
 */
async function acceptCurrentInvite() {
    if (!currentInvite) return;
    
    try {
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('medium');
        }
        
        const result = await API.acceptInvite(currentInvite.invite_token);
        
        document.getElementById('invite-modal').classList.remove('active');
        
        if (tg) {
            tg.showPopup({
                title: '✅ Успешно!',
                message: `Вы вступили в семью "${result.family_name}"!`,
                buttons: [{type: 'ok'}]
            }, () => {
                window.location.reload();
            });
        } else {
            alert(`Вы вступили в семью "${result.family_name}"!`);
            window.location.reload();
        }
    } catch (error) {
        CONFIG.log('error', '❌ Ошибка принятия приглашения:', error);
        if (tg) {
            tg.showAlert('Ошибка: ' + error.message);
        } else {
            alert('Ошибка: ' + error.message);
        }
    }
}

/**
 * Отклонить текущее приглашение
 */
async function declineCurrentInvite() {
    if (!currentInvite) return;
    
    try {
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
        
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
        CONFIG.log('error', '❌ Ошибка отклонения приглашения:', error);
        if (tg) {
            tg.showAlert('Ошибка: ' + error.message);
        } else {
            alert('Ошибка: ' + error.message);
        }
    }
}

// === ОБРАБОТЧИКИ ИНТЕРФЕЙСА ===

/**
 * Открыть статистику за месяц
 */
function openMonthlyStats() {
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
    window.location.href = 'pages/monthly-stats.html';
}

/**
 * Открыть модуль
 */
function openModule(moduleName) {
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
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
        if (tg) {
            tg.showAlert('Модуль в разработке');
        } else {
            alert('Модуль в разработке');
        }
    }
}

/**
 * Открыть управление семьёй
 */
function openFamily() {
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    if (tg) {
        tg.showAlert('Страница управления семьёй в разработке.\nСоздай pages/family.html для полного функционала.');
    } else {
        alert('Страница управления семьёй в разработке.');
    }
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

/**
 * Форматировать валюту
 */
function formatCurrency(amount) {
    return CONFIG.formatCurrency(amount);
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

/**
 * Быстрое действие
 */
function quickAction(action) {
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    const actions = {
        'log-expense': () => openModule('add-expense'),
        'log-health': () => openModule('health'),
        'log-activity': () => openModule('activity'),
        'ask-doctor': () => openModule('doctor')
    };
    
    const actionFn = actions[action];
    if (actionFn) {
        actionFn();
    } else {
        if (tg) {
            tg.showAlert('Функция в разработке');
        } else {
            alert('Функция в разработке');
        }
    }
}

CONFIG.log('info', '✅ App.js загружен');
