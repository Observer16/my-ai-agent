// js/i18n-page-loader.js
/**
 * Универсальный загрузчик переводов для всех страниц
 * Автоматически загружает язык пользователя и применяет data-i18n атрибуты
 */

/**
 * Загрузить и применить язык пользователя
 */
async function loadUserLanguage() {
    try {
        // Сначала проверяем localStorage
        const cachedLang = localStorage.getItem('preferred_language');
        if (cachedLang && translations[cachedLang]) {
            setLanguage(cachedLang);
            console.log('🌐 Язык из localStorage:', cachedLang);
        }
        
        // Затем загружаем с сервера для синхронизации
        if (typeof API !== 'undefined' && API.getUserSettings) {
            const settings = await API.getUserSettings();
            if (settings && settings.preferred_language) {
                setLanguage(settings.preferred_language);
                console.log('🌐 Язык из API:', settings.preferred_language);
            }
        }
    } catch (error) {
        console.warn('⚠️ Не удалось загрузить язык с сервера, используем текущий:', getCurrentLanguage());
    }
}

/**
 * Применить переводы ко всем элементам с data-i18n
 */
function applyDataI18n() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        
        // Определяем куда вставлять перевод
        const target = el.getAttribute('data-i18n-target') || 'text';
        
        switch(target) {
            case 'text':
                el.textContent = translation;
                break;
            case 'html':
                el.innerHTML = translation;
                break;
            case 'placeholder':
                el.placeholder = translation;
                break;
            case 'value':
                el.value = translation;
                break;
            case 'title':
                el.title = translation;
                break;
            default:
                el.textContent = translation;
        }
    });
    
    console.log(`✅ Применено переводов: ${elements.length}`);
}

/**
 * Показать страницу после применения переводов
 */
function showPage() {
    document.body.classList.add('i18n-ready');
}

/**
 * Инициализация i18n для страницы
 */
async function initPageI18n() {
    console.log('🌍 Инициализация i18n для страницы...');
    
    // Загружаем язык пользователя
    await loadUserLanguage();
    
    // Применяем переводы
    applyDataI18n();
    
    // Показываем страницу
    showPage();
    
    console.log('✅ i18n инициализирован, текущий язык:', getCurrentLanguage());
}

// Автоматическая инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initPageI18n, 0);
    });
} else {
    setTimeout(initPageI18n, 0);
}

console.log('✅ i18n-page-loader.js загружен');
