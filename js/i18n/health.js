// js/i18n/health.js - Оркестратор переводов модуля здоровья

/**
 * Этот файл служит точкой входа для переводов модуля здоровья.
 * Фактические переводы находятся в языковых файлах:
 * - health-ru.js - русские переводы
 * - health-en.js - английские переводы
 * - health-es.js - испанские переводы
 * - health-uk.js - украинские переводы
 */

// Инициализация пустой структуры для секции 'health'
if (typeof registerTranslations === 'function') {
    // Регистрация будет происходить в языковых файлах
    console.log('✅ Health i18n orchestrator loaded');
} else {
    console.error('❌ i18n core not loaded! Load js/i18n/core.js first');
}
