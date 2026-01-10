// js/photo-reviews/reviews-create.js - Создание фото-отзыва

/**
 * Модуль создания фото-отзывов
 */
const ReviewsCreate = {
    currentStep: 1,
    photoFile: null,
    photoFileId: null,
    photoFileUniqueId: null,
    selectedRating: null,
    tg: null,

    /**
     * Инициализация модуля
     */
    init() {
        console.log('🔧 Инициализация создания отзывов...');

        // Получаем объект Telegram WebApp
        this.tg = window.Telegram?.WebApp;

        if (!this.tg) {
            console.warn('⚠️ Telegram WebApp не найден');
            // Создаем заглушку для отладки вне Telegram
            this.tg = {
                HapticFeedback: {
                    impactOccurred: () => {},
                    notificationOccurred: () => {}
                },
                showAlert: (msg) => console.log('Alert:', msg),
                showPopup: (params) => console.log('Popup:', params),
                showConfirm: (msg, callback) => {
                    if (window.confirm(msg)) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }
            };
        }

        // Кнопка открытия модального окна
        const addBtn = document.getElementById('addReviewBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.open());
        }

        // Кнопки загрузки фото
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        const choosePhotoBtn = document.getElementById('choosePhotoBtn');
        if (takePhotoBtn) takePhotoBtn.addEventListener('click', () => this.takePhoto());
        if (choosePhotoBtn) choosePhotoBtn.addEventListener('click', () => this.choosePhoto());

        // Навигация по шагам
        const cancelPhotoBtn = document.getElementById('cancelPhotoBtn');
        const nextToRatingBtn = document.getElementById('nextToRatingBtn');
        const backToPhotoBtn = document.getElementById('backToPhotoBtn');
        const nextToDetailsBtn = document.getElementById('nextToDetailsBtn');
        const backToRatingBtn = document.getElementById('backToRatingBtn');

        if (cancelPhotoBtn) cancelPhotoBtn.addEventListener('click', () => this.close());
        if (nextToRatingBtn) nextToRatingBtn.addEventListener('click', () => this.goToStep(2));
        if (backToPhotoBtn) backToPhotoBtn.addEventListener('click', () => this.goToStep(1));
        if (nextToDetailsBtn) nextToDetailsBtn.addEventListener('click', () => this.goToStep(3));
        if (backToRatingBtn) backToRatingBtn.addEventListener('click', () => this.goToStep(2));

        // Кнопки оценки
        const goodBtn = document.getElementById('goodBtn');
        const badBtn = document.getElementById('badBtn');
        if (goodBtn) goodBtn.addEventListener('click', () => this.selectRating('good'));
        if (badBtn) badBtn.addEventListener('click', () => this.selectRating('bad'));

        // Счётчик символов комментария
        const commentInput = document.getElementById('commentInput');
        if (commentInput) {
            commentInput.addEventListener('input', (e) => {
                const counter = document.getElementById('commentCounter');
                if (counter) counter.textContent = e.target.value.length;
            });
        }

        // Кнопка сохранения
        const saveReviewBtn = document.getElementById('saveReviewBtn');
        if (saveReviewBtn) {
            saveReviewBtn.addEventListener('click', () => this.save());
        }

        console.log('✅ Создание отзывов готово');
    },

    /**
     * Открыть модальное окно
     */
    open() {
        this.reset();
        const modal = document.getElementById('createModal');
        if (modal) {
            modal.classList.add('active');
        }
        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('medium');
        }
    },

    /**
     * Закрыть модальное окно
     */
    close() {
        const modal = document.getElementById('createModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.reset();
        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('light');
        }
    },

    /**
     * Сбросить форму
     */
    reset() {
        this.currentStep = 1;
        this.photoFile = null;
        this.photoFileId = null;
        this.photoFileUniqueId = null;
        this.selectedRating = null;

        // Сброс UI
        const photoPreview = document.getElementById('photoPreview');
        const uploadButtons = document.getElementById('uploadButtons');
        const photoUploadArea = document.getElementById('photoUploadArea');
        const nextToRatingBtn = document.getElementById('nextToRatingBtn');
        const nextToDetailsBtn = document.getElementById('nextToDetailsBtn');
        const commentInput = document.getElementById('commentInput');
        const commentCounter = document.getElementById('commentCounter');
        const tagsInput = document.getElementById('tagsInput');

        if (photoPreview) photoPreview.style.display = 'none';
        if (uploadButtons) uploadButtons.style.display = 'flex';
        if (photoUploadArea) photoUploadArea.classList.remove('has-photo');
        if (nextToRatingBtn) nextToRatingBtn.disabled = true;
        if (nextToDetailsBtn) nextToDetailsBtn.disabled = true;
        if (commentInput) commentInput.value = '';
        if (commentCounter) commentCounter.textContent = '0';
        if (tagsInput) tagsInput.value = '';

        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        this.goToStep(1);
    },

    /**
     * Перейти к шагу
     */
    goToStep(step) {
        this.currentStep = step;

        // Скрыть все шаги
        document.querySelectorAll('.create-step-content').forEach(el => {
            el.style.display = 'none';
        });

        // Сброс индикаторов
        document.querySelectorAll('.create-step').forEach(el => {
            el.classList.remove('active', 'completed');
        });

        // Показать текущий шаг
        if (step === 1) {
            const photoStep = document.getElementById('photoStep');
            const step1Indicator = document.getElementById('step1Indicator');
            if (photoStep) photoStep.style.display = 'block';
            if (step1Indicator) step1Indicator.classList.add('active');
        } else if (step === 2) {
            const ratingStep = document.getElementById('ratingStep');
            const step1Indicator = document.getElementById('step1Indicator');
            const step2Indicator = document.getElementById('step2Indicator');
            if (ratingStep) ratingStep.style.display = 'block';
            if (step1Indicator) step1Indicator.classList.add('completed');
            if (step2Indicator) step2Indicator.classList.add('active');
        } else if (step === 3) {
            const detailsStep = document.getElementById('detailsStep');
            const step1Indicator = document.getElementById('step1Indicator');
            const step2Indicator = document.getElementById('step2Indicator');
            const step3Indicator = document.getElementById('step3Indicator');
            if (detailsStep) detailsStep.style.display = 'block';
            if (step1Indicator) step1Indicator.classList.add('completed');
            if (step2Indicator) step2Indicator.classList.add('completed');
            if (step3Indicator) step3Indicator.classList.add('active');
        }

        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('light');
        }
    },

    /**
     * Сделать фото через камеру Telegram
     */
    async takePhoto() {
        try {
            // Используем Telegram WebApp для доступа к камере
            if (this.tg && this.tg.showCamera) {
                // Telegram WebApp API для камеры (если доступно)
                this.tg.showCamera({
                    type: 'photo',
                    quality: 'high',
                    successCallback: (data) => {
                        // data содержит file_id и file_unique_id
                        this.handleTelegramPhoto(data);
                    },
                    errorCallback: (error) => {
                        console.error('Camera error:', error);
                        this.openPhotoInput();
                    }
                });
            } else {
                // Fallback: обычный input для файлов
                this.openPhotoInput();
            }

            if (this.tg && this.tg.HapticFeedback) {
                this.tg.HapticFeedback.impactOccurred('medium');
            }

        } catch (error) {
            console.error('❌ Ошибка при съёмке фото:', error);
            this.openPhotoInput();
            if (this.tg) {
                this.tg.showAlert(t('photoReviews.errors.photoAccessDenied'));
            }
        }
    },

    /**
     * Выбрать фото из галереи
     */
    choosePhoto() {
        // Используем Telegram WebApp для выбора фото из галереи
        if (this.tg && this.tg.showPhotoPicker) {
            this.tg.showPhotoPicker({
                type: 'photo',
                successCallback: (data) => {
                    this.handleTelegramPhoto(data);
                },
                errorCallback: (error) => {
                    console.error('Photo picker error:', error);
                    this.openPhotoInput();
                }
            });
        } else {
            // Fallback: обычный input для файлов
            this.openPhotoInput();
        }

        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('light');
        }
    },

    /**
     * Обработка фото из Telegram WebApp
     */
    handleTelegramPhoto(data) {
        // data содержит telegram_file_id и telegram_file_unique_id
        this.photoFileId = data.file_id;
        this.photoFileUniqueId = data.file_unique_id;

        // Получаем URL для превью через Telegram Bot API
        this.showTelegramPhotoPreview(data.file_id);

        // Показываем UI
        const uploadButtons = document.getElementById('uploadButtons');
        const photoUploadArea = document.getElementById('photoUploadArea');
        const nextToRatingBtn = document.getElementById('nextToRatingBtn');

        if (uploadButtons) uploadButtons.style.display = 'none';
        if (photoUploadArea) photoUploadArea.classList.add('has-photo');
        if (nextToRatingBtn) nextToRatingBtn.disabled = false;

        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.notificationOccurred('success');
        }
    },

    /**
     * Показать превью фото из Telegram
     */
    async showTelegramPhotoPreview(fileId) {
        try {
            // Получаем URL фото через backend proxy
            const response = await fetch(`${API_BASE_URL}/telegram/photo/${fileId}/preview`);
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                const preview = document.getElementById('photoPreview');
                if (preview) {
                    preview.src = url;
                    preview.style.display = 'block';
                }
            } else {
                // Fallback: показываем placeholder
                this.showPhotoPlaceholder();
            }
        } catch (error) {
            console.error('❌ Ошибка получения превью:', error);
            this.showPhotoPlaceholder();
        }
    },

    /**
     * Показать placeholder для фото
     */
    showPhotoPlaceholder() {
        const preview = document.getElementById('photoPreview');
        if (preview) {
            preview.src = 'data:image/svg+xml,' + encodeURIComponent(`
                <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="200" fill="#4CAF50" opacity="0.1"/>
                    <circle cx="100" cy="80" r="40" fill="#4CAF50" opacity="0.2"/>
                    <rect x="60" y="130" width="80" height="40" rx="5" fill="#4CAF50" opacity="0.2"/>
                    <text x="100" y="100" text-anchor="middle" dy=".3em" fill="#4CAF50" font-size="20">📷</text>
                    <text x="100" y="180" text-anchor="middle" fill="#666" font-size="12">Фото из Telegram</text>
                </svg>
            `);
            preview.style.display = 'block';
        }
    },

    /**
     * Открыть input для выбора файла (fallback)
     */
    openPhotoInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Приоритет камере

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.handleLocalPhotoSelected(file);
            }
        });

        input.click();
    },

    /**
     * Обработка локального фото (fallback)
     */
    async handleLocalPhotoSelected(file) {
        // Проверка размера (макс 20MB)
        if (file.size > 20 * 1024 * 1024) {
            if (this.tg) {
                this.tg.showAlert('Файл слишком большой. Максимум 20MB');
            }
            return;
        }

        this.photoFile = file;

        try {
            // Показываем загрузку
            const nextToRatingBtn = document.getElementById('nextToRatingBtn');
            if (nextToRatingBtn) {
                nextToRatingBtn.disabled = true;
                nextToRatingBtn.textContent = t('common.loading') || 'Загрузка...';
            }

            // Загружаем фото в Telegram через backend ИСПОЛЬЗУЯ API КЛИЕНТ
            console.log('📤 Загрузка фото в Telegram...');
            const uploadResult = await API.uploadPhotoToTelegram(file);

            this.photoFileId = uploadResult.telegram_file_id;
            this.photoFileUniqueId = uploadResult.telegram_file_unique_id;

            console.log('✅ Фото загружено в Telegram:', {
                fileId: this.photoFileId,
                uniqueId: this.photoFileUniqueId,
                message: uploadResult.message
            });

        } catch (uploadError) {
            console.error('❌ Ошибка загрузки фото:', uploadError);

            // ОШИБКА: НЕ СОЗДАВАТЬ ВРЕМЕННЫЕ ID!
            // Если не удалось загрузить в Telegram, НЕЛЬЗЯ создавать отзыв
            if (this.tg) {
                this.tg.showAlert('Ошибка загрузки фото в Telegram. Попробуйте еще раз.');
            }

            // Сбрасываем состояние
            this.photoFile = null;
            this.photoFileId = null;
            this.photoFileUniqueId = null;

            // Восстанавливаем UI
            const uploadButtons = document.getElementById('uploadButtons');
            const photoUploadArea = document.getElementById('photoUploadArea');
            if (uploadButtons) uploadButtons.style.display = 'flex';
            if (photoUploadArea) photoUploadArea.classList.remove('has-photo');

            const nextToRatingBtn = document.getElementById('nextToRatingBtn');
            if (nextToRatingBtn) {
                nextToRatingBtn.disabled = true;
                nextToRatingBtn.textContent = t('common.next') || 'Далее';
            }

            // Скрываем превью
            const preview = document.getElementById('photoPreview');
            if (preview) {
                preview.style.display = 'none';
            }

            return; // Прерываем процесс
        }

        // Если загрузка успешна, показываем превью
        try {
            await this.showTelegramPhotoPreview(this.photoFileId);
        } catch (previewError) {
            console.warn('⚠️ Не удалось загрузить превью, используем placeholder');
            this.showPhotoPlaceholder();
        }

        // Обновляем UI
        const uploadButtons = document.getElementById('uploadButtons');
        const photoUploadArea = document.getElementById('photoUploadArea');
        const nextToRatingBtn = document.getElementById('nextToRatingBtn');

        if (uploadButtons) uploadButtons.style.display = 'none';
        if (photoUploadArea) photoUploadArea.classList.add('has-photo');
        if (nextToRatingBtn) {
            nextToRatingBtn.disabled = false;
            nextToRatingBtn.textContent = t('common.next') || 'Далее';
        }

        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.notificationOccurred('success');
        }
    },

    /**
     * Загрузить фото в Telegram через backend
     */
    async uploadPhotoToTelegram(file) {
        const formData = new FormData();
        formData.append('photo', file);

        // Получаем user_id из Telegram WebApp
        const userData = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!userData) {
            throw new Error('User not authenticated');
        }

        // Загружаем фото в Telegram через backend
        const response = await fetch(`${API_BASE_URL}/telegram/upload-photo`, {
            method: 'POST',
            body: formData,
            headers: {
                'x-telegram-user-id': userData.id
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Telegram upload failed (${response.status}): ${errorText}`);
        }

        return await response.json();
    },

    /**
     * Выбрать оценку
     */
    selectRating(rating) {
        this.selectedRating = rating;

        // Обновить UI
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        const selectedBtn = document.querySelector(`[data-rating="${rating}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }

        const nextToDetailsBtn = document.getElementById('nextToDetailsBtn');
        if (nextToDetailsBtn) {
            nextToDetailsBtn.disabled = false;
        }

        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('medium');
        }
    },

    /**
     * Сохранить отзыв
     */
    async save() {
        const saveBtn = document.getElementById('saveReviewBtn');
        if (!saveBtn) return;

        try {
            // Валидация
            if (!this.photoFileId || !this.selectedRating) {
                if (this.tg) {
                    this.tg.showAlert(t('photoReviews.errors.ratingRequired'));
                }
                return;
            }

            // Отключаем кнопку
            saveBtn.disabled = true;
            saveBtn.textContent = t('photoReviews.create.saving') || 'Сохранение...';

            // Получаем данные
            const commentInput = document.getElementById('commentInput');
            const tagsInput = document.getElementById('tagsInput');
            const comment = commentInput ? commentInput.value.trim() : '';
            const tagsText = tagsInput ? tagsInput.value.trim() : '';
            const tags = tagsText ? tagsText.split(',').map(t => t.trim()).filter(t => t).slice(0, 10) : [];
            const language = getCurrentLanguage ? getCurrentLanguage() : 'ru';

            // Создаём отзыв с реальными Telegram file_id
            const reviewData = {
                telegram_file_id: this.photoFileId,
                telegram_file_unique_id: this.photoFileUniqueId,
                rating: this.selectedRating,
                language: language
            };

            if (comment) reviewData.comment = comment;
            if (tags.length > 0) reviewData.tags = tags;

            console.log('📝 Сохранение отзыва с Telegram фото:', reviewData);

            const result = await API.createPhotoReview(reviewData);

            console.log('✅ Отзыв сохранён в Telegram:', result);

            // Закрываем модальное окно
            this.close();

            // Показываем уведомление
            if (this.tg && this.tg.showPopup) {
                this.tg.showPopup({
                    title: '✅',
                    message: t('photoReviews.create.success') || 'Отзыв успешно сохранён в Telegram!',
                    buttons: [{type: 'ok'}]
                });
            } else if (this.tg && this.tg.showAlert) {
                this.tg.showAlert(t('photoReviews.create.success') || 'Отзыв успешно сохранён в Telegram!');
            }

            if (this.tg && this.tg.HapticFeedback) {
                this.tg.HapticFeedback.notificationOccurred('success');
            }

            // Обновляем список
            if (window.ReviewsList && typeof window.ReviewsList.refresh === 'function') {
                await window.ReviewsList.refresh();
            }

        } catch (error) {
            console.error('❌ Ошибка сохранения отзыва:', error);
            let errorMessage = t('photoReviews.create.error') || 'Ошибка сохранения отзыва';

            if (error.message) {
                if (error.message.includes('Invalid or expired photo file')) {
                    errorMessage = 'Ошибка: Неверный или устаревший файл фото в Telegram. Пожалуйста, загрузите фото заново.';
                } else if (error.message.includes('Photo already exists')) {
                    errorMessage = 'Это фото уже было загружено в Telegram ранее. Каждое фото можно использовать только один раз.';
                } else if (error.message.includes('File too large')) {
                    errorMessage = 'Фото слишком большое. Максимальный размер: 20MB';
                } else if (error.message.includes('Not a photo')) {
                    errorMessage = 'Файл должен быть изображением (JPG, PNG, GIF)';
                } else {
                    errorMessage += ': ' + error.message;
                }
            }

            if (this.tg && this.tg.showAlert) {
                this.tg.showAlert(errorMessage);
            }

            if (this.tg && this.tg.HapticFeedback) {
                this.tg.HapticFeedback.notificationOccurred('error');
            }
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = t('photoReviews.create.save') || 'Сохранить отзыв';
        }
    }
};

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ReviewsCreate.init();
    });
} else {
    ReviewsCreate.init();
}

// Экспорт для использования в других модулях
window.ReviewsCreate = ReviewsCreate;

console.log('✅ reviews-create.js загружен');