// js/photo-reviews/reviews-api.js - API методы для работы с фото-отзывами

/**
 * Расширение API клиента для работы с фото-отзывами
 */
if (typeof API !== 'undefined') {
    
    /**
     * Получить список фото-отзывов пользователя
     * @param {Object} params - Параметры запроса
     * @param {number} params.limit - Количество отзывов (по умолчанию 20)
     * @param {number} params.offset - Смещение для пагинации (по умолчанию 0)
     * @param {string} params.rating - Фильтр по оценке ('good', 'bad' или null для всех)
     * @param {string} params.language - Фильтр по языку ('ru', 'en', 'es', 'uk')
     * @returns {Promise<Array>} Массив отзывов
     */
    API.getPhotoReviews = async function(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.limit) queryParams.append('limit', String(params.limit)); // Преобразуем в строку
        if (params.offset) queryParams.append('offset', String(params.offset));
        if (params.rating) queryParams.append('rating', params.rating);
        if (params.language) queryParams.append('language', params.language);

        const query = queryParams.toString();
        const endpoint = query ? `/photo-reviews/?${query}` : '/photo-reviews/';

        return this.get(endpoint);
    };

    /**
     * Создать новый фото-отзыв
     * @param {Object} reviewData - Данные отзыва
     * @param {string} reviewData.telegram_file_id - file_id фото из Telegram
     * @param {string} reviewData.telegram_file_unique_id - file_unique_id фото
     * @param {string} reviewData.rating - Оценка ('good' или 'bad')
     * @param {string} reviewData.comment - Комментарий (опционально)
     * @param {Array<string>} reviewData.tags - Массив тегов (опционально)
     * @param {string} reviewData.language - Язык отзыва
     * @returns {Promise<Object>} Созданный отзыв
     */
    API.createPhotoReview = async function(reviewData) {
        return this.post('/photo-reviews/', reviewData);
    };

    /**
     * Загрузить фото через n8n вебхук
     * @param {File} file - Файл фото для загрузки
     * @returns {Promise<Object>} Результат загрузки с telegram_file_id
     */
    API.uploadPhotoViaN8N = async function(file) {
        const formData = new FormData();
        formData.append('photo', file);

        // Используем стандартный механизм аутентизации
        const response = await fetch(`${this.baseURL}/telegram/upload-photo`, {
            method: 'POST',
            body: formData,
            headers: {
                // УБЕРИТЕ x-telegram-user-id, если он вызывает проблемы
                ...this.getAuthHeaders ? this.getAuthHeaders() : {}
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            }

            const errorText = await response.text();
            throw new Error(`Upload failed (${response.status}): ${errorText}`);
        }

        return await response.json();
    };

    /**
     * Получить один отзыв по ID
     * @param {string} reviewId - UUID отзыва
     * @returns {Promise<Object>} Отзыв
     */
    API.getPhotoReview = async function(reviewId) {
        return this.get(`/photo-reviews/${reviewId}`);
    };

    /**
     * Удалить отзыв
     * @param {string} reviewId - UUID отзыва
     * @returns {Promise<Object>} Результат удаления
     */
    API.deletePhotoReview = async function(reviewId) {
        return this.delete(`/photo-reviews/${reviewId}`);
    };

    console.log('✅ Photo Reviews API методы зарегистрированы');

} else {
    console.error('❌ API не найден. Загрузите api.js перед reviews-api.js');
}