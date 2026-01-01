// js/products/products-utils.js - Вспомогательные функции

// Форматирование даты
function formatDate(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('products.today');
    if (diffDays === 1) return t('products.yesterday');
    if (diffDays < 7) return `${diffDays} ${t('products.daysAgo')}`;

    return date.toLocaleDateString(getCurrentLanguage() === 'ru' ? 'ru-RU' : 'en-US', { 
        day: 'numeric', 
        month: 'short' 
    });
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Показать загрузку
function showLoading(id) {
    const container = document.getElementById(id);
    if (container) {
        container.innerHTML = `<div class="loading">⏳ ${t('products.loading')}</div>`;
    }
}

// Показать ошибку
function showError(id, msg) {
    const container = document.getElementById(id);
    if (container) {
        container.innerHTML = `<div class="error">❌ ${escapeHtml(msg)}</div>`;
    }
}

console.log('✅ products-utils.js загружен');
