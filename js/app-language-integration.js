// js/app-language-integration.js
/**
 * Интеграция системы переводов с app.js
 * Загружается ПОСЛЕ app.js и применяет переводы к интерфейсу
 */

/**
 * Применить переводы ко всей странице
 */
function applyTranslations() {
    console.log('🌍 Применяю переводы для языка:', getCurrentLanguage());
    
    // Обновляем приветствие (если уже было установлено)
    const greetingEl = document.getElementById('greeting');
    if (greetingEl && greetingEl.textContent !== 'Загрузка...') {
        const user = tg.initDataUnsafe?.user;
        if (user) {
            const hour = new Date().getHours();
            let greetingKey = 'greeting.day';
            if (hour < 6) greetingKey = 'greeting.night';
            else if (hour < 12) greetingKey = 'greeting.morning';
            else if (hour < 18) greetingKey = 'greeting.day';
            else greetingKey = 'greeting.evening';
            
            greetingEl.textContent = `${t(greetingKey)}, ${user.first_name}! 👋`;
        }
    }
    
    // Обновляем заголовок месячной статистики
    const monthlyHeader = document.querySelector('.monthly-summary-header');
    if (monthlyHeader) {
        monthlyHeader.textContent = `💰 ${t('monthly.title')}`;
    }
    
    // Обновляем модули
    updateModuleCard(0, {
        title: t('modules.health'),
        description: t('modules.healthDesc')
    });
    
    updateModuleCard(1, {
        title: t('modules.activity'),
        description: t('modules.activityDesc')
    });
    
    updateModuleCard(2, {
        title: t('modules.doctor'),
        description: t('modules.doctorDesc')
    });
    
    // Обновляем быстрые действия
    const quickActionsTitle = document.querySelector('.quick-actions h3');
    if (quickActionsTitle) {
        quickActionsTitle.textContent = t('actions.title');
    }
    
    const actionButtons = document.querySelectorAll('.action-btn');
    if (actionButtons.length >= 4) {
        actionButtons[0].innerHTML = `💳 ${t('actions.addExpense')}`;
        actionButtons[1].innerHTML = `📦 ${t('actions.management')}`;
        actionButtons[2].innerHTML = `📊 ${t('actions.priceAnalysis')}`;
        actionButtons[3].innerHTML = `⚙️ ${t('actions.settings')}`;
    }
    
    console.log('✅ Переводы применены');
}

/**
 * Обновить карточку модуля
 */
function updateModuleCard(index, data) {
    const cards = document.querySelectorAll('.module-card');
    if (cards[index]) {
        const titleEl = cards[index].querySelector('.module-title');
        const descEl = cards[index].querySelector('.module-description');
        
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.description;
    }
}

/**
 * Инициализация языка и применение переводов
 */
async function initLanguageIntegration() {
    try {
        // Загружаем настройки пользователя с сервера
        const settings = await API.getUserSettings();
        
        if (settings && settings.preferred_language) {
            // Устанавливаем язык из настроек
            const langSet = setLanguage(settings.preferred_language);
            console.log('🌐 Язык установлен из настроек:', settings.preferred_language, langSet);
        }
        
        // Применяем переводы к интерфейсу
        applyTranslations();
        
    } catch (error) {
        console.error('❌ Ошибка инициализации языка:', error);
        // Если не удалось загрузить настройки, используем язык по умолчанию
        applyTranslations();
    }
}

// Запускаем после полной загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initLanguageIntegration, 500);
    });
} else {
    setTimeout(initLanguageIntegration, 500);
}

console.log('✅ App-language-integration.js загружен');
