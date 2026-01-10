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
        
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset) queryParams.append('offset', params.offset);
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
    
    /**
     * Получить статистику отзывов пользователя
     * @returns {Promise<Object>} Статистика
     */
    API.getPhotoReviewsStats = async function() {
        return this.get('/photo-reviews/stats');
    };
    
    /**
     * Поиск отзывов по комментариям
     * @param {string} query - Поисковый запрос
     * @param {Object} params - Дополнительные параметры
     * @param {string} params.language - Фильтр по языку
     * @param {number} params.limit - Количество результатов
     * @returns {Promise<Array>} Массив найденных отзывов
     */
    API.searchPhotoReviews = async function(query, params = {}) {
        const queryParams = new URLSearchParams();
        queryParams.append('q', query);
        
        if (params.language) queryParams.append('language', params.language);
        if (params.limit) queryParams.append('limit', params.limit);
        
        return this.get(`/photo-reviews/search?${queryParams.toString()}`);
    };
    
    /**
     * Получить URL фото из Telegram
     * @param {string} fileId - file_id фото из Telegram
     * @returns {string} URL для отображения фото
     */
    API.getTelegramPhotoUrl = function(fileId) {
        // Telegram Bot API не предоставляет прямые ссылки
        // Фото загружается через WebApp API или отображается через data URL
        return `tg://openmessage?file_id=${fileId}`;
    };

     /**
     * Загрузить фото в Telegram через backend
     * @param {File} file - Файл фото для загрузки
     * @returns {Promise<Object>} Результат загрузки с telegram_file_id
     */
    API.uploadPhotoToTelegram = async function(file) {
        const formData = new FormData();
        formData.append('photo', file);

        // Получаем user_id из Telegram WebApp
        const userData = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!userData) {
            throw new Error('User not authenticated');
        }

        // Используем базовый fetch с заголовком аутентификации
        const response = await fetch(`${this.baseURL}/telegram/upload-photo`, {
            method: 'POST',
            body: formData,
            headers: {
                'x-telegram-user-id': userData.id,
                // this.getAuthHeaders() может добавлять другие заголовки
                ...this.getAuthHeaders ? this.getAuthHeaders() : {}
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed (${response.status}): ${errorText}`);
        }

        return await response.json();
    };
    
    console.log('✅ Photo Reviews API методы зарегистрированы');
    
} else {
    console.error('❌ API не найден. Загрузите api.js перед reviews-api.js');
}
