// js/photo-reviews/reviews-create.js - Создание фото-отзыва с n8n

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
                this.tg.showCamera({
                    type: 'photo',
                    quality: 'high',
                    successCallback: (data) => {
                        // data содержит file_id и file_unique_id (если доступно)
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
                    this.openGalleryInput();
                }
            });
        } else {
            // Fallback: обычный input для файлов (БЕЗ камеры)
            this.openGalleryInput();
        }

        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('light');
        }
    },

    /**
     * Обработка фото из Telegram WebApp
     */
    async handleTelegramPhoto(data) {
        try {
            // Если у нас есть прямой file_id из Telegram WebApp
            if (data.file_id) {
                this.photoFileId = data.file_id;
                this.photoFileUniqueId = data.file_unique_id || data.file_id;

                // Показываем успешную загрузку
                this.showPhotoSuccess();

            } else {
                // Если нет file_id, используем файл
                await this.processPhotoFile(data.file || data);
            }

        } catch (error) {
            console.error('❌ Ошибка обработки фото Telegram:', error);
            this.openPhotoInput();
        }
    },

    /**
     * Показать успешную загрузку фото
     */
    showPhotoSuccess() {
        // Обновляем UI
        const uploadButtons = document.getElementById('uploadButtons');
        const photoUploadArea = document.getElementById('photoUploadArea');
        const nextToRatingBtn = document.getElementById('nextToRatingBtn');

        if (uploadButtons) uploadButtons.style.display = 'none';
        if (photoUploadArea) photoUploadArea.classList.add('has-photo');
        if (nextToRatingBtn) nextToRatingBtn.disabled = false;

        // Показываем placeholder (реальное фото будет доступно после сохранения)
        this.showPhotoPlaceholder();

        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.notificationOccurred('success');
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
                    <text x="100" y="180" text-anchor="middle" fill="#666" font-size="12">Фото готово к загрузке</text>
                </svg>
            `);
            preview.style.display = 'block';
        }
    },

    /**
     * Открыть input для выбора файла с КАМЕРЫ (fallback)
     */
    openPhotoInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Приоритет камере

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.processPhotoFile(file);
            }
        });

        input.click();
    },

    /**
     * Открыть input для выбора из ГАЛЕРЕИ (fallback)
     */
    openGalleryInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        // НЕ указываем capture - это позволит выбирать из галереи

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.processPhotoFile(file);
            }
        });

        input.click();
    },

    /**
     * Обработка файла фото
     */
    async processPhotoFile(file) {
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

            // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Используем новый метод API для загрузки через n8n
            console.log('📤 Загрузка фото через n8n...');
            const uploadResult = await API.uploadPhotoViaN8N(file);

            this.photoFileId = uploadResult.telegram_file_id;
            this.photoFileUniqueId = uploadResult.telegram_file_unique_id;

            console.log('✅ Фото загружено через n8н:', {
                fileId: this.photoFileId,
                uniqueId: this.photoFileUniqueId,
                message: uploadResult.message
            });

            // Показываем превью из загруженного файла
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('photoPreview');
                if (preview) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);

            // Обновляем UI
            this.showPhotoSuccess();

        } catch (uploadError) {
            console.error('❌ Ошибка загрузки фото:', uploadError);

            // ОШИБКА: Не создавать временные ID!
            if (this.tg) {
                let errorMessage = 'Ошибка загрузки фото. Попробуйте еще раз.';

                if (uploadError.message.includes('chat not found')) {
                    errorMessage = 'Ошибка: Не удалось отправить фото в Telegram. Убедитесь, что вы начали диалог с ботом.';
                } else if (uploadError.message.includes('File too large')) {
                    errorMessage = 'Фото слишком большое. Максимальный размер: 20MB';
                }

                this.tg.showAlert(errorMessage);
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
            // Валидация - ТОЛЬКО РЕАЛЬНЫЕ telegram_file_id!
            if (!this.photoFileId || !this.selectedRating) {
                if (this.tg) {
                    this.tg.showAlert(t('photoReviews.errors.ratingRequired') || 'Выберите фото и оценку');
                }
                return;
            }

            // Проверяем, что file_id выглядит как Telegram file_id
            // Telegram file_id обычно начинается с определенных префиксов
            if (this.photoFileId.startsWith('local_') || this.photoFileId.startsWith('temp_')) {
                if (this.tg) {
                    this.tg.showAlert('Ошибка: Фото не было загружено. Пожалуйста, загрузите фото заново.');
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

            // Создаём отзыв с РЕАЛЬНЫМИ Telegram file_id из n8n
            const reviewData = {
                telegram_file_id: this.photoFileId,
                telegram_file_unique_id: this.photoFileUniqueId || this.photoFileId,
                rating: this.selectedRating,
                language: language
            };

            if (comment) reviewData.comment = comment;
            if (tags.length > 0) reviewData.tags = tags;

            console.log('📝 Сохранение отзыва с фото из n8n:', reviewData);

            const result = await API.createPhotoReview(reviewData);

            console.log('✅ Отзыв сохранён:', result);

            // Очищаем кеш списка отзывов, чтобы загрузить свежие данные
            if (window.Cache && typeof window.Cache.clear === 'function') {
                window.Cache.clear('photo-reviews');
                console.log('🗑️ Кеш фото-отзывов очищен');
            }

            // Закрываем модальное окно
            this.close();

            // Показываем уведомление
            if (this.tg && this.tg.showPopup) {
                this.tg.showPopup({
                    title: '✅',
                    message: t('photoReviews.create.success') || 'Отзыв успешно сохранён!',
                    buttons: [{type: 'ok'}]
                });
            } else if (this.tg && this.tg.showAlert) {
                this.tg.showAlert(t('photoReviews.create.success') || 'Отзыв успешно сохранён!');
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
                    errorMessage = 'Это фото уже было загружено ранее. Каждое фото можно использовать только один раз.';
                } else if (error.message.includes('File too large')) {
                    errorMessage = 'Фото слишком большое. Максимальный размер: 20MB';
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