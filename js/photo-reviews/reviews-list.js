// js/photo-reviews/reviews-list.js - Управление списком отзывов

/**
 * Модуль управления списком фото-отзывов
 */
const ReviewsList = {
    currentFilter: 'all',
    currentSearch: '',
    reviews: [],
    isLoading: false,

    /**
     * Инициализация модуля
     */
    async init() {
        console.log('🔧 Инициализация списка отзывов...');
        
        // Настройка фильтров
        this.setupFilters();
        
        // Настройка поиска
        this.setupSearch();
        
        // Временно показываем пустое состояние вместо загрузки с API
        this.showEmptyState();
        
        console.log('✅ Список отзывов готов');
    },

    /**
     * Настройка фильтров
     */
    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                
                // Обновляем активный фильтр
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Применяем фильтр
                this.currentFilter = filter;
                this.applyFilters();
                
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
            });
        });
    },

    /**
     * Настройка поиска
     */
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                this.currentSearch = e.target.value.trim();
                this.applyFilters();
            }, 500);
        });
    },

    /**
     * Загрузка отзывов с сервера
     */
    async loadReviews() {
        try {
            console.log('📥 Загрузка отзывов...');

            const language = await Utils.getLanguage();
            const response = await API.getPhotoReviews({
                limit: 100,
                language: language
            });

            // ✅ ИСПРАВЛЕНИЕ: API возвращает {data: [], pagination: {}}
            this.reviews = response.data || [];
            this.pagination = response.pagination || {};

            console.log('✅ Загружено отзывов:', this.reviews.length);

            this.applyFilters();
            this.render();

        } catch (error) {
            console.error('❌ Ошибка загрузки отзывов:', error);
            this.showError(await i18n.t('reviews.errors.loadFailed'));
        }
    },

    /**
     * Применить фильтры и отобразить отзывы
     */
    applyFilters() {
        let filtered = [...this.reviews];

        // Фильтр по оценке
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(r => r.rating === this.currentFilter);
        }

        // Поиск по комментариям
        if (this.currentSearch) {
            const searchLower = this.currentSearch.toLowerCase();
            filtered = filtered.filter(r => {
                return r.comment && r.comment.toLowerCase().includes(searchLower);
            });
        }

        this.renderReviews(filtered);
    },

    /**
     * Отобразить список отзывов
     */
    renderReviews(reviews) {
        const container = document.getElementById('reviewsList');

        if (reviews.length === 0) {
            this.showEmptyState();
            return;
        }

        container.innerHTML = `
            <div class="reviews-list">
                ${reviews.map(review => this.renderReviewCard(review)).join('')}
            </div>
        `;

        // Добавляем обработчики клика
        reviews.forEach(review => {
            const card = container.querySelector(`[data-review-id="${review.id}"]`);
            if (card) {
                card.addEventListener('click', () => {
                    window.ReviewsView.show(review.id);
                    if (window.Telegram?.WebApp) {
                        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                });
            }
        });
    },

    /**
     * Отрисовать карточку отзыва
     */
    renderReviewCard(review) {
        const ratingEmoji = review.rating === 'good' ? '👍' : '👎';
        const date = this.formatDate(review.created_at);
        const commentPreview = review.comment ? 
            `<div class="review-comment-preview">${this.escapeHtml(review.comment)}</div>` : '';

        return `
            <div class="review-card" data-review-id="${review.id}">
                <img 
                    src="${this.getPhotoUrl(review.telegram_file_id)}" 
                    alt="Review photo" 
                    class="review-photo"
                    loading="lazy"
                >
                <div class="review-info">
                    <div class="review-rating">${ratingEmoji}</div>
                    ${commentPreview}
                    <div class="review-date">${date}</div>
                </div>
            </div>
        `;
    },

    /**
     * Получить URL фото
     */
    getPhotoUrl(fileId) {
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#eee"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="24">📷</text>
            </svg>
        `)}`;
    },

    /**
     * Форматировать дату
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return t('common.today') || 'Сегодня';
        } else if (diffDays === 1) {
            return t('common.yesterday') || 'Вчера';
        } else if (diffDays < 7) {
            return `${diffDays} ${this.getDaysWord(diffDays)}`;
        } else {
            return new Intl.DateTimeFormat(getCurrentLanguage(), {
                day: 'numeric',
                month: 'short'
            }).format(date);
        }
    },

    /**
     * Получить правильное склонение слова "день"
     */
    getDaysWord(days) {
        const lang = getCurrentLanguage();
        
        if (lang === 'en') return days === 1 ? 'day ago' : 'days ago';
        if (lang === 'es') return days === 1 ? 'día' : 'días';
        if (lang === 'ru' || lang === 'uk') {
            const lastDigit = days % 10;
            const lastTwoDigits = days % 100;
            
            if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней';
            if (lastDigit === 1) return 'день';
            if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
            return 'дней';
        }
        
        return 'days';
    },

    /**
     * Экранирование HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Показать загрузку
     */
    showLoading() {
        const container = document.getElementById('reviewsList');
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
        `;
    },

    /**
     * Показать пустое состояние
     */
    showEmptyState() {
        const container = document.getElementById('reviewsList');
        
        let message, hint;
        if (this.currentSearch) {
            message = t('photoReviews.list.noResults');
            hint = '';
        } else {
            message = t('photoReviews.noReviews');
            hint = t('photoReviews.noReviewsHint');
        }

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📸</div>
                <h3>${message}</h3>
                ${hint ? `<p>${hint}</p>` : ''}
            </div>
        `;
    },

    /**
     * Показать ошибку
     */
    showError() {
        const container = document.getElementById('reviewsList');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>${t('photoReviews.errors.loadFailed')}</h3>
                <button class="add-review-btn" onclick="ReviewsList.loadReviews()">
                    ${t('common.retry')}
                </button>
            </div>
        `;
    },

    /**
     * Обновить список после добавления/удаления отзыва
     */
    async refresh() {
        await this.loadReviews();
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    ReviewsList.init();
});

// Экспорт для использования в других модулях
window.ReviewsList = ReviewsList;

console.log('✅ reviews-list.js загружен');