// js/components/cache-refresh.js

/**
 * Компонент кнопки принудительного обновления кэша фото
 */
const CacheRefreshButton = {
    /**
     * Инициализирует кнопку обновления кэша
     * @param {string} buttonId - ID кнопки (по умолчанию 'refreshCacheBtn')
     * @param {string} reviewsListModule - Имя модуля списка отзывов (по умолчанию 'ReviewsList')
     */
    init(buttonId = 'refreshCacheBtn', reviewsListModule = 'ReviewsList') {
        const refreshBtn = document.getElementById(buttonId);
        if (!refreshBtn) {
            console.warn(`❌ Кнопка обновления кэша с ID "${buttonId}" не найдена`);
            return;
        }

        refreshBtn.addEventListener('click', async () => {
            await this.refreshPhotoCache(reviewsListModule);
        });

        console.log('✅ CacheRefreshButton инициализирован');
    },

    /**
     * Функция принудительного обновления кэша фото
     * @param {string} reviewsListModule - Имя модуля списка отзывов
     */
    async refreshPhotoCache(reviewsListModule) {
        const refreshBtn = document.getElementById('refreshCacheBtn');
        if (!refreshBtn) return;

        // Получаем объект Telegram WebApp для вибрации
        const tg = window.Telegram?.WebApp;

        try {
            // Блокируем кнопку во время обновления
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '⏳';

            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }

            console.log('🔄 Начало обновления кэша фото...');

            // 1. Получаем все отзывы пользователя
            const reviews = await API.getPhotoReviews({ limit: 1000 });
            const photoReviews = Array.isArray(reviews) ? reviews : [];

            console.log(`📊 Найдено ${photoReviews.length} отзывов для обновления кэша`);

            // 2. Извлекаем все уникальные file_id
            const fileIds = [];
            const fileIdMap = new Map();

            photoReviews.forEach(review => {
                if (review.telegram_file_id && !fileIdMap.has(review.telegram_file_id)) {
                    fileIds.push(review.telegram_file_id);
                    fileIdMap.set(review.telegram_file_id, review.id);
                }
            });

            console.log(`🖼️ Уникальных фото для обновления: ${fileIds.length}`);

            if (fileIds.length === 0) {
                if (tg && tg.showAlert) {
                    tg.showAlert('Нет фото для обновления кэша');
                }
                refreshBtn.innerHTML = '🔄';
                refreshBtn.disabled = false;
                return;
            }

            // 3. Очищаем кэш для этих file_id
            let clearedCount = 0;
            for (const fileId of fileIds) {
                const cacheKey = `telegram_photo_${fileId}`;
                if (window.localStorage) {
                    localStorage.removeItem(cacheKey);
                    clearedCount++;
                }
            }

            console.log(`🧹 Очищено ${clearedCount} записей из кэша`);

            // 4. Показываем алерт через Telegram
            if (tg && tg.showAlert) {
                tg.showAlert(`Кэш обновлен: ${clearedCount} фото`);
            }

            // 5. Принудительно перезагружаем список отзывов
            const reviewsList = window[reviewsListModule];
            if (reviewsList && typeof reviewsList.refresh === 'function') {
                console.log('🔄 Принудительная перезагрузка списка отзывов');
                await reviewsList.refresh(true); // true = force refresh
            }

            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }

        } catch (error) {
            console.error('❌ Ошибка при обновлении кэша:', error);

            if (tg && tg.showAlert) {
                tg.showAlert('Ошибка при обновлении кэша');
            }

            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
        } finally {
            // Восстанавливаем кнопку
            refreshBtn.innerHTML = '🔄';
            refreshBtn.disabled = false;
        }
    }
};

// Экспорт для использования в других модулях
window.CacheRefreshButton = CacheRefreshButton;

console.log('✅ CacheRefreshButton компонент загружен');