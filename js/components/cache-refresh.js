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
            refreshBtn.classList.add('rotating');

            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }

            console.log('🔄 Начало обновления кэша фото...');

            // 1. Получаем все отзывы пользователя по частям (пагинация)
            const allReviews = [];
            let offset = 0;
            const limit = 50; // Используем значение меньше MAX_PAGE_SIZE (100)
            let totalReviews = 0;
            let hasMore = true;

            try {
                // Сначала получим первую страницу, чтобы узнать общее количество
                const firstPage = await API.getPhotoReviews({
                    limit: limit,
                    offset: 0
                });

                if (firstPage && firstPage.data && Array.isArray(firstPage.data)) {
                    allReviews.push(...firstPage.data);
                    totalReviews = firstPage.pagination?.total || 0;

                    console.log(`📊 Всего отзывов: ${totalReviews}, загружено: ${firstPage.data.length}`);

                    // Если отзывов больше, чем на первой странице, загружаем остальные
                    if (totalReviews > firstPage.data.length) {
                        // Вычисляем сколько еще страниц нужно загрузить
                        const totalPages = Math.ceil(totalReviews / limit);

                        // Загружаем остальные страницы (начиная со 2й)
                        for (let page = 2; page <= totalPages; page++) {
                            offset = (page - 1) * limit;

                            const pageResult = await API.getPhotoReviews({
                                limit: limit,
                                offset: offset
                            });

                            if (pageResult && pageResult.data && Array.isArray(pageResult.data)) {
                                allReviews.push(...pageResult.data);
                                console.log(`📄 Страница ${page}/${totalPages}: загружено ${pageResult.data.length} отзывов`);
                            }

                            // Небольшая задержка между запросами
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }
                } else {
                    console.warn('❌ Неожиданный формат ответа от API');
                    if (tg && tg.showAlert) {
                        tg.showAlert('Ошибка получения отзывов');
                    }
                    return;
                }

            } catch (error) {
                console.error('❌ Ошибка при загрузке отзывов:', error);
                if (tg && tg.showAlert) {
                    tg.showAlert('Ошибка при загрузке отзывов');
                }
                throw error;
            }

            const photoReviews = allReviews;
            console.log(`📊 Всего загружено ${photoReviews.length} отзывов для обновления кэша`);

            if (photoReviews.length === 0) {
                if (tg && tg.showAlert) {
                    tg.showAlert('Нет фото для обновления кэша');
                }
                refreshBtn.classList.remove('rotating');
                refreshBtn.disabled = false;
                return;
            }

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

            let errorMessage = 'Ошибка при обновлении кэша';
            if (error.message && error.message.includes('422')) {
                errorMessage = 'Ошибка API: некорректные параметры запроса';
            } else if (error.message && error.message.includes('limit')) {
                errorMessage = 'Ошибка API: превышен лимит запроса';
            }

            if (tg && tg.showAlert) {
                tg.showAlert(errorMessage);
            }

            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
        } finally {
            // Восстанавливаем кнопку
            refreshBtn.classList.remove('rotating');
            refreshBtn.disabled = false;
        }
    }
};

// Экспорт для использования в других модулях
window.CacheRefreshButton = CacheRefreshButton;

console.log('✅ CacheRefreshButton компонент загружен');