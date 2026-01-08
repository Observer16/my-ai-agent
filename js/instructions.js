/**
 * Логика страницы инструкций
 * Показывает XML инструкцию только для пользователей из Парагвая
 * Для всех остальных - страница "в разработке"
 */

// Настройка Telegram WebApp кнопки "Назад"
function setupTelegramBackButton() {
    if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
        console.log('Telegram WebApp не обнаружен');
        return;
    }

    console.log('🔙 Настройка кнопки "Назад" Telegram WebApp');

    // Показываем кнопку "Назад"
    Telegram.WebApp.BackButton.show();

    // Устанавливаем обработчик для кнопки "Назад"
    Telegram.WebApp.BackButton.onClick(function() {
        console.log('🔙 Кнопка "Назад" нажата');
        // Возвращаемся на предыдущую страницу или в историю
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Если нет истории, перенаправляем на главную
            window.location.href = '../index.html';
        }
    });

    // Меняем цвет кнопки "Назад" (опционально)
    Telegram.WebApp.BackButton.setColor('#ffffff');
}

// Убираем кнопку "Назад" при выходе со страницы
function cleanupTelegramBackButton() {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        // Удаляем обработчики
        Telegram.WebApp.BackButton.offClick();
        // Скрываем кнопку (она скроется автоматически при переходе, но на всякий случай)
        Telegram.WebApp.BackButton.hide();
    }
}

// Получаем информацию о пользователе с сервера
async function getUserInfo() {
    try {
        if (typeof API !== 'undefined' && API.getUserSettings) {
            const settings = await API.getUserSettings();
            return {
                timezone: settings?.timezone || 'UTC',
                preferred_language: settings?.preferred_language || 'ru',
                preferred_currency: settings?.preferred_currency || 'PYG'
            };
        }
        return {
            timezone: 'UTC',
            preferred_language: 'ru',
            preferred_currency: 'PYG'
        };
    } catch (error) {
        console.error('Ошибка получения информации о пользователе:', error);
        return {
            timezone: 'UTC',
            preferred_language: 'ru',
            preferred_currency: 'PYG'
        };
    }
}

// Проверяем, является ли пользователь из Парагвая
async function isParaguayUser() {
    try {
        const userInfo = await getUserInfo();
        console.log('👤 Информация о пользователе:', userInfo);

        // Основная проверка - часовой пояс из БД
        const userTimezone = userInfo.timezone;
        if (userTimezone === 'America/Asuncion') {
            console.log('✅ Пользователь из Парагвая (часовой пояс America/Asuncion)');
            return true;
        }

        // Дополнительные признаки Парагвая
        const isParaguay = (
            userTimezone.includes('Paraguay') ||
            userTimezone === 'PYT' ||
            userTimezone === 'PYST' ||
            userInfo.preferred_currency === 'PYG'
        );

        if (isParaguay) {
            console.log('✅ Пользователь из Парагвая (по дополнительным признакам)');
            return true;
        }

        console.log('❌ Пользователь не из Парагвая:', {
            timezone: userTimezone,
            currency: userInfo.preferred_currency,
            language: userInfo.preferred_language
        });
        return false;
    } catch (error) {
        console.error('Ошибка проверки пользователя:', error);
        return false;
    }
}

// Показываем соответствующий контент
async function showAppropriateContent() {
    try {
        const isParaguay = await isParaguayUser();

        if (isParaguay) {
            // Показываем инструкцию для Парагвая
            showParaguayInstructions();
        } else {
            // Для всех остальных - страница "в разработке"
            showInDevelopmentPage();
        }
    } catch (error) {
        console.error('Ошибка при определении контента:', error);
        // При ошибке показываем страницу "в разработке"
        showInDevelopmentPage();
    }
}

// Показываем инструкцию для Парагвая
function showParaguayInstructions() {
    const xmlInstructions = document.getElementById('xml-instructions');
    const inDevelopmentSection = document.querySelector('.in-development-section');
    const qrFlowSection = document.getElementById('qr-flow');

    if (xmlInstructions) {
        xmlInstructions.style.display = 'block';
    }
    if (inDevelopmentSection) {
        inDevelopmentSection.style.display = 'none';
    }
    if (qrFlowSection) {
        qrFlowSection.style.display = 'block';
    }

    console.log('📋 Показана инструкция для Парагвая');
}

// Показываем страницу "в разработке"
function showInDevelopmentPage() {
    const xmlInstructions = document.getElementById('xml-instructions');
    const inDevelopmentSection = document.querySelector('.in-development-section');
    const qrFlowSection = document.getElementById('qr-flow');

    // Скрываем XML инструкцию
    if (xmlInstructions) {
        xmlInstructions.style.display = 'none';
    }

    // Скрываем раздел QR-инструкции
    if (qrFlowSection) {
        qrFlowSection.style.display = 'none';
    }

    // Показываем раздел "в разработке"
    if (inDevelopmentSection) {
        inDevelopmentSection.style.display = 'block';
    }

    console.log('🚧 Показана страница "в разработке"');
}

// Инициализация страницы
async function initInstructionsPage() {
    console.log('📋 Инициализация страницы инструкций...');

    try {
        // Настраиваем кнопку "Назад" в Telegram WebApp
        setupTelegramBackButton();

        // Ждем загрузки i18n если он есть
        if (typeof initPageI18n === 'function') {
            await initPageI18n();
        }

        // Показываем соответствующий контент
        await showAppropriateContent();

        console.log('✅ Страница инструкций инициализирована');
    } catch (error) {
        console.error('❌ Ошибка инициализации страницы инструкций:', error);
        // В случае ошибки показываем страницу "в разработке"
        showInDevelopmentPage();
    }
}

// Очистка при уходе со страницы
window.addEventListener('beforeunload', function() {
    cleanupTelegramBackButton();
});

// Экспорт функций
if (typeof window !== 'undefined') {
    window.initInstructionsPage = initInstructionsPage;
    window.isParaguayUser = isParaguayUser;
    window.showAppropriateContent = showAppropriateContent;
}

console.log('✅ instructions.js загружен');

// Автоматическая инициализация после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initInstructionsPage, 100);
    });
} else {
    setTimeout(initInstructionsPage, 100);
}