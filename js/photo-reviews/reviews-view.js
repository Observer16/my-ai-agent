// js/photo-reviews/reviews-view.js - Просмотр фото-отзыва

/**
 * Модуль просмотра отзыва
 */
const ReviewsView = {
    currentReview: null,

    /**
     * Показать отзыв
     */
    async show(reviewId) {
        try {
            console.log('📖 Загрузка отзыва:', reviewId);

            // Загружаем отзыв
            this.currentReview = await API.getPhotoReview(reviewId);

            // Отображаем
            this.render();

            // Показываем модальное окно
            document.getElementById('viewModal').classList.add('active');

            // ✅ Настраиваем BackButton для закрытия модального окна
            if (window.Telegram?.WebApp?.BackButton) {
                window.Telegram.WebApp.BackButton.onClick(() => this.close());
            }

            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }

        } catch (error) {
            console.error('❌ Ошибка загрузки отзыва:', error);
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.showAlert(error.message || 'Ошибка загрузки');
            }
        }
    },

    /**
     * Закрыть просмотр
     */
    close() {
        document.getElementById('viewModal').classList.remove('active');
        this.currentReview = null;

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    },

    /**
     * Отрисовать отзыв
     */
    render() {
        if (!this.currentReview) return;

        const review = this.currentReview;
        const content = document.getElementById('viewContent');

        const ratingText = review.rating === 'good' 
            ? `👍 ${t('photoReviews.create.good')}`
            : `👎 ${t('photoReviews.create.bad')}`;

        const commentSection = review.comment ? `
            <div class="review-detail">
                <div class="review-detail-label" data-i18n="photoReviews.view.comment">Комментарий</div>
                <div class="review-detail-value">${this.escapeHtml(review.comment)}</div>
            </div>
        ` : '';

        const tagsSection = review.tags && review.tags.length > 0 ? `
            <div class="review-detail">
                <div class="review-detail-label" data-i18n="photoReviews.view.tags">Теги</div>
                <div class="tags-container">
                    ${review.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        ` : '';

        content.innerHTML = `
            <h2 data-i18n="photoReviews.view.title">Отзыв</h2>

            <img 
                src="${this.getPhotoUrl(review.telegram_file_id)}" 
                alt="Review photo" 
                class="view-photo"
            >

            <div class="review-detail">
                <div class="review-detail-label" data-i18n="photoReviews.view.rating">Оценка</div>
                <div class="review-detail-value large">${ratingText}</div>
            </div>

            ${commentSection}

            ${tagsSection}

            <div class="review-detail">
                <div class="review-detail-label" data-i18n="photoReviews.view.created">Создано</div>
                <div class="review-detail-value">${this.formatDateTime(review.created_at)}</div>
            </div>

            <button class="delete-btn" id="deleteReviewBtn">
                🗑️ <span data-i18n="photoReviews.view.delete">Удалить отзыв</span>
            </button>

            <button class="action-btn action-btn-cancel" id="closeViewBtn" style="margin-top: 12px;" data-i18n="common.close">
                Закрыть
            </button>
        `;

        // Обработчики
        document.getElementById('deleteReviewBtn').addEventListener('click', () => this.delete());
        document.getElementById('closeViewBtn').addEventListener('click', () => this.close());

        // Обновляем переводы
        if (typeof window.i18n?.updatePage === 'function') {
            window.i18n.updatePage();
        }
    },

    /**
     * Удалить отзыв
     */
    async delete() {
        if (!this.currentReview) return;

        // Подтверждение
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showConfirm(
                'Удалить этот отзыв?',
                async (confirmed) => {
                    if (!confirmed) return;

                    try {
                        console.log('🗑️ Удаление отзыва:', this.currentReview.id);
                        await API.deletePhotoReview(this.currentReview.id);
                        console.log('✅ Отзыв удалён');

                        this.close();

                        // Показываем уведомление
                        window.Telegram.WebApp.showPopup({
                            title: '✅',
                            message: 'Отзыв удалён',
                            buttons: [{type: 'ok'}]
                        });

                        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');

                        // Обновляем список
                        if (window.ReviewsList) {
                            await window.ReviewsList.refresh();
                        }

                    } catch (error) {
                        console.error('❌ Ошибка удаления отзыва:', error);
                        window.Telegram.WebApp.showAlert('Ошибка удаления: ' + error.message);
                        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                    }
                }
            );
        }
    },

    /**
     * Получить URL фото
     */
    async getPhotoUrl(fileId) {
        try {
            const response = await API.get(`/photo-reviews/photo/${encodeURIComponent(fileId)}`);
            return response.url || this.getPlaceholderImage();
        } catch (error) {
            console.error('Ошибка загрузки фото:', error);
            return this.getPlaceholderImage();
        }
    },

    getPlaceholderImage() {
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="400" fill="#eee"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="48">📷</text>
            </svg>
        `)}`;
    },

    /**
     * Форматировать дату и время
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        const language = getCurrentLanguage();

        return new Intl.DateTimeFormat(language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },

    /**
     * Экранирование HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Экспорт для использования в других модулях
window.ReviewsView = ReviewsView;

console.log('✅ reviews-view.js загружен');
