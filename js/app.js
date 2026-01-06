// Главная логика Mini App
const tg = window.Telegram.WebApp;

// === ИНИЦИАЛИЗАЦИЯ ===

// Текущее приглашение
let currentInvite = null;
let allPendingInvites = [];

// Флаг, что настройка в процессе
let isSettingUp = false;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Загрузка приложения...');

    // 🆕 ИНИЦИАЛИЗАЦИЯ ВАЛЮТЫ
    await initCurrency();

    // Показать приветствие
    showGreeting();

    // ✅ ВАЖНО: Сначала обновляем информацию о пользователе
    await updateUserOnFirstLogin();

    // ✅ НОВОЕ: Проверяем и показываем первоначальную настройку
    // НЕ используем await, чтобы не блокировать загрузку
    checkAndShowInitialSetup();

    // Затем проверяем приглашения
    await checkPendingInvites();

    // Затем загружаем данные
    await loadDashboardData();

    console.log('✅ Приложение готово');
});

/**
 * Проверить и показать окно первоначальной настройки
 */
async function checkAndShowInitialSetup() {
    try {
        console.log('🔧 Проверка необходимости первичной настройки...');

        // 🆕 Логируем язык Telegram для отладки
        const tgUser = tg.initDataUnsafe?.user;
        console.log('🌍 Telegram пользователь:', {
            language: tgUser?.language_code,
            firstName: tgUser?.first_name,
            username: tgUser?.username
        });

        // Проверяем нужна ли первичная настройка
        const needsSetup = await checkInitialSetup();

        if (needsSetup) {
            console.log('📝 Показываем окно первичной настройки');
            isSettingUp = true;

            // Небольшая задержка чтобы интерфейс успел загрузиться
            await new Promise(resolve => setTimeout(resolve, 500));

            await showInitialSetupModal();
        } else {
            console.log('✅ Первичная настройка не требуется');
        }
    } catch (error) {
        console.error('❌ Ошибка проверки первичной настройки:', error);
        // Не блокируем работу приложения при ошибке
    }
}

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

    if (!greetingEl) return;

    if (user) {
        const hour = new Date().getHours();
        let greetingKey = 'greeting.day';
        if (hour < 6) greetingKey = 'greeting.night';
        else if (hour < 12) greetingKey = 'greeting.morning';
        else if (hour < 18) greetingKey = 'greeting.day';
        else greetingKey = 'greeting.evening';

        greetingEl.textContent = `${t(greetingKey)}, ${user.first_name}! 👋`;
    } else {
        greetingEl.textContent = `${t('home.welcome')} 👋`;
    }
}

/**
 * Загрузить данные для dashboard
 */
async function loadDashboardData() {
    // Загружаем информацию о семье
    await loadFamilyInfo();
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
 * Открыть модуль
 */
function openModule(moduleName) {
    tg.HapticFeedback.impactOccurred('light');

    const modulePages = {
        'finance': 'pages/finance.html',
        'budget': 'pages/budget.html',
        'products': 'pages/products.html',
        'add-expense': 'pages/add-expense.html',
        'health': 'health-module/index.html',
        'activity': 'pages/activity.html',
        'doctor': 'pages/doctor.html',
        'instructions': 'pages/instructions.html'
    };

    const page = modulePages[moduleName];
    if (page) {
        window.location.href = page;
    } else {
        tg.showAlert('Модуль в разработке');
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
 * Открыть настройки
 */
function openSettings() {
    tg.HapticFeedback.impactOccurred('light');
    window.location.href = 'pages/settings.html';
}

// ==============================================
// 🆕 ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ ОБНОВЛЕНИЯ ПОСЛЕ НАСТРОЙКИ
// ==============================================

/**
 * Обновить все данные приложения после изменения настроек
 */
window.refreshAppAfterSetup = async function(language, currency) {
    console.log('🔄 Обновление приложения после настройки:', { language, currency });

    try {
        // 1. Устанавливаем новый язык и валюту
        if (language && typeof setLanguage === 'function') {
            setLanguage(language);
        }

        if (currency && typeof setCurrency === 'function') {
            setCurrency(currency);
        }

        // 2. Обновляем переводы интерфейса
        if (typeof window.i18n?.updatePage === 'function') {
            window.i18n.updatePage();
        } else if (typeof updatePageTranslations === 'function') {
            updatePageTranslations();
        }

        // 3. Обновляем приветствие
        showGreeting();

        // 4. Обновляем данные dashboard
        await loadDashboardData();

        // 5. Обновляем информацию о семье
        await loadFamilyInfo();

        console.log('✅ Приложение полностью обновлено после настройки');
        return true;

    } catch (error) {
        console.error('❌ Ошибка обновления приложения:', error);
        return false;
    }
};

/**
 * Показать уведомление об успешной настройке
 */
window.showSetupSuccess = function() {
    tg.showPopup({
        title: '✅',
        message: t('settings.saved') || 'Настройки сохранены!',
        buttons: [{type: 'ok'}]
    });

    tg.HapticFeedback.notificationOccurred('success');
};

console.log('✅ App.js загружен с поддержкой первичной настройки');