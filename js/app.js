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
    
    // ✅ ВАЖНО: Сначала обновляем информацию о пользователе
    await updateUserOnFirstLogin();

    // Затем проверяем приглашения
    await checkPendingInvites();

    // Затем загружаем данные
    await loadDashboardData();

    console.log('✅ Приложение готово');
});

/**
 * Обновить информацию о пользователе при первом входе
 */
async function updateUserOnFirstLogin() {
    const user = tg.initDataUnsafe?.user;
    if (!user) {
        console.warn('Нет данных пользователя из Telegram');
        return;
    }

    console.log('📝 Обновление данных пользователя:', {
        id: user.id,
        first_name: user.first_name,
        username: user.username,
        last_name: user.last_name
    });

    try {
        // Всегда отправляем данные из Telegram
        const result = await API.updateUserInfo({
            first_name: user.first_name || `User${user.id}`,
            username: user.username || null,
            last_name: user.last_name || null
        });

        console.log('✅ Информация пользователя обновлена:', result);
        return result;
    } catch (error) {
        console.error('❌ Ошибка обновления пользователя:', error);
        // Не прерываем работу приложения при ошибке обновления пользователя
        return null;
    }
}

/**
 * Показать приветствие пользователю
 */
function showGreeting() {
    const user = tg.initDataUnsafe?.user;
    const greetingEl = document.getElementById('greeting');
    const userInfoEl = document.getElementById('user-info');

    if (!greetingEl || !userInfoEl) return;

    if (user) {
        const hour = new Date().getHours();
        let greeting = 'Добрый день';
        if (hour < 6) greeting = 'Доброй ночи';
        else if (hour < 12) greeting = 'Доброе утро';
        else if (hour < 18) greeting = 'Добрый день';
        else greeting = 'Добрый вечер';

        greetingEl.textContent = `${greeting}, ${user.first_name}! 👋`;
        userInfoEl.textContent = user.username ? `@${user.username}` : 'Telegram Mini App';
    } else {
        greetingEl.textContent = 'Добро пожаловать! 👋';
        userInfoEl.textContent = 'Telegram Mini App';
    }
}

/**
 * Загрузить данные для dashboard
 */
async function loadDashboardData() {
    // Загружаем информацию о семье
    await loadFamilyInfo();

    // Загрузка месячной статистики
    await loadMonthlyStats();

    // Бюджет
    try {
        const stats = await API.getStatistics();
        safeSetText('budget-total', formatCurrency(stats.total_spent));
        safeSetText('budget-purchases', stats.total_purchases || 0);
    } catch (error) {
        console.error('Ошибка загрузки бюджета:', error);
        safeSetText('budget-total', 'Ошибка');
        safeSetText('budget-purchases', '-');
    }

    // Товары и категории
    try {
        const [products, categories] = await Promise.all([
            API.getProducts(null, null, 1),
            API.getCategories()
        ]);

        // Для получения общего количества товаров делаем отдельный запрос
        const allProducts = await API.getProducts(null, null, 500);

        safeSetText('products-total', allProducts.length || 0);
        safeSetText('categories-total', categories.length || 0);
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        safeSetText('products-total', '-');
        safeSetText('categories-total', '-');
    }

    // Здоровье (заглушка)
    safeSetText('health-today', '😊');
    safeSetText('health-week', '4.2/5');

    // Активность (заглушка)
    safeSetText('activity-steps', '8.5K');
    safeSetText('activity-workouts', '3');
}

/**
 * Загрузка месячной статистики
 */
async function loadMonthlyStats() {
    try {
        const stats = await API.getMonthlyStatistics();

        // Форматируем сумму
        safeSetText('monthly-total', formatCurrency(stats.summary.total_spent));

        // Период
        const now = new Date();
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                           'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        safeSetText('monthly-period', monthNames[now.getMonth()]);

        // Количество покупок
        safeSetText('monthly-purchases', stats.summary.total_purchases);

    } catch (error) {
        console.error('Ошибка загрузки месячной статистики:', error);
        safeSetText('monthly-total', 'Ошибка');
        safeSetText('monthly-period', '-');
        safeSetText('monthly-purchases', '-');
    }
}

/**
 * ЗАГРУЗИТЬ ИНФОРМАЦИЮ О СЕМЬЕ
 */
async function loadFamilyInfo() {
    try {
        const family = await API.getFamilyInfo();
        const container = document.getElementById('family-indicator');

        if (!container) return;

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

    const inviteTextEl = document.getElementById('invite-text');
    const messageEl = document.getElementById('invite-message');
    const expiryEl = document.getElementById('invite-expiry');
    const modalEl = document.getElementById('invite-modal');

    if (!inviteTextEl || !messageEl || !expiryEl || !modalEl) return;

    inviteTextEl.innerHTML = `
        <strong>${inviterName}</strong> приглашает вас<br>
        в семью "<strong>${familyName}</strong>"
    `;

    if (invite.message) {
        messageEl.textContent = `💬 "${invite.message}"`;
        messageEl.style.display = 'block';
    } else {
        messageEl.style.display = 'none';
    }

    expiryEl.textContent = `⏳ Приглашение действительно ещё ${hoursLeft} ч.`;

    modalEl.classList.add('active');
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

        const modalEl = document.getElementById('invite-modal');
        if (modalEl) modalEl.classList.remove('active');

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

        const modalEl = document.getElementById('invite-modal');
        if (modalEl) modalEl.classList.remove('active');

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
    if (amount === null || amount === undefined || isNaN(amount)) return '0 ₲';

    const numAmount = Number(amount);
    if (numAmount === 0) return '0 ₲';

    // Убираем округление для сумм < 1000
    if (Math.abs(numAmount) < 1000) {
        // Для целых чисел убираем дробную часть
        if (Number.isInteger(numAmount)) {
            return `${numAmount.toLocaleString('ru-RU')} ₲`;
        }
        // Для дробных чисел показываем 1 знак после запятой
        return `${numAmount.toLocaleString('ru-RU', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        })} ₲`;
    }

    // Для сумм >= 1 000 000 (миллион)
    if (Math.abs(numAmount) >= 1000000) {
        const millions = (numAmount / 10000);
        // Показываем 1 знак после запятой только если есть дробная часть
        const formatted = millions % 1 === 0 ?
            millions.toLocaleString('ru-RU') :
            millions.toLocaleString('ru-RU', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            });
        return `${formatted}M ₲`;
    }
    // Для сумм >= 1 000 (тысяча)
    else if (Math.abs(numAmount) >= 1000) {
        const thousands = (numAmount / 1000);
        // Показываем 1 знак после запятой только если есть дробная часть
        const formatted = thousands % 1 === 0 ?
            thousands.toLocaleString('ru-RU') :
            thousands.toLocaleString('ru-RU', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            });
        return `${formatted}K ₲`;
    }
}

/**
 * ОТКРЫТЬ УПРАВЛЕНИЕ СЕМЬЁЙ
 */
function openFamily() {
    tg.HapticFeedback.impactOccurred('light');
    window.location.href = 'pages/family.html';
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

/**
 * Безопасно установить текст в элемент
 */
function safeSetText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = text;
    }
}

console.log('✅ App.js загружен');