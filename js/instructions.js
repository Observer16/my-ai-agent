/**
 * Логика страницы инструкций
 * Показывает XML инструкцию только для пользователей из Парагвая
 * Для всех остальных - страница "в разработке"
 */

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