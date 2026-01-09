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
            // Проверка поддержки Telegram WebApp API
            if (this.tg && !this.tg.requestContact) {
                this.tg.showAlert(t('photoReviews.errors.photoAccessDenied'));
                return;
            }

            // ВАЖНО: Telegram WebApp пока не поддерживает прямой доступ к камере
            // Используем обходной путь через input file
            this.openPhotoInput();

            if (this.tg && this.tg.HapticFeedback) {
                this.tg.HapticFeedback.impactOccurred('medium');
            }

        } catch (error) {
            console.error('❌ Ошибка при съёмке фото:', error);
            if (this.tg) {
                this.tg.showAlert(t('photoReviews.errors.photoAccessDenied'));
            }
        }
    },

    /**
     * Выбрать фото из галереи
     */
    choosePhoto() {
        this.openPhotoInput();
        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('light');
        }
    },

    /**
     * Открыть input для выбора файла
     */
    openPhotoInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Приоритет камере

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handlePhotoSelected(file);
            }
        });

        input.click();
    },

    /**
     * Загрузить фото на сервер
     */
    async uploadPhotoToServer(file) {
        try {
            // Используем FormData для загрузки файла
            const formData = new FormData();
            formData.append('photo', file);

            // Получаем user_id из Telegram WebApp
            const userData = window.Telegram?.WebApp?.initDataUnsafe?.user;
            if (!userData) {
                throw new Error('User not authenticated');
            }

            // Загружаем фото на сервер
            const response = await fetch(`${API_BASE_URL}/upload/photo`, {
                method: 'POST',
                body: formData,
                headers: {
                    'x-telegram-user-id': userData.id
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return {
                telegram_file_id: data.telegram_file_id,
                telegram_file_unique_id: data.telegram_file_unique_id,
                photo_url: data.photo_url || ''
            };

        } catch (error) {
            console.error('❌ Ошибка загрузки фото:', error);

            // Fallback: если endpoint не существует, генерируем временные ID
            // (Временное решение до реализации backend upload endpoint)
            console.warn('⚠️ Upload endpoint not available, using fallback');
            return {
                telegram_file_id: `temp_${Date.now()}`,
                telegram_file_unique_id: `unique_${Date.now()}`,
                photo_url: ''
            };
        }
    },

    /**
     * Обработка выбранного фото
     */
    async handlePhotoSelected(file) {
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

            // Загружаем фото на сервер
            console.log('📤 Загрузка фото на сервер...');
            const uploadResult = await this.uploadPhotoToServer(file);

            this.photoFileId = uploadResult.telegram_file_id;
            this.photoFileUniqueId = uploadResult.telegram_file_unique_id;

            console.log('✅ Фото загружено:', {
                fileId: this.photoFileId,
                uniqueId: this.photoFileUniqueId
            });

        } catch (uploadError) {
            console.error('❌ Ошибка загрузки фото на сервер:', uploadError);
            if (this.tg) {
                this.tg.showAlert('Ошибка загрузки фото. Пожалуйста, попробуйте еще раз.');
            }
            return;
        }

        // Показываем превью
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photoPreview');
            const uploadButtons = document.getElementById('uploadButtons');
            const photoUploadArea = document.getElementById('photoUploadArea');
            const nextToRatingBtn = document.getElementById('nextToRatingBtn');

            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }

            if (uploadButtons) uploadButtons.style.display = 'none';
            if (photoUploadArea) photoUploadArea.classList.add('has-photo');
            if (nextToRatingBtn) {
                nextToRatingBtn.disabled = false;
                nextToRatingBtn.textContent = t('common.next') || 'Далее';
            }
        };
        reader.readAsDataURL(file);

        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.notificationOccurred('success');
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

            // Создаём отзыв
            const reviewData = {
                telegram_file_id: this.photoFileId,
                telegram_file_unique_id: this.photoFileUniqueId,
                rating: this.selectedRating,
                language: language
            };

            if (comment) reviewData.comment = comment;
            if (tags.length > 0) reviewData.tags = tags;

            console.log('📝 Сохранение отзыва:', reviewData);

            const result = await API.createPhotoReview(reviewData);

            console.log('✅ Отзыв сохранён:', result);

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
                    errorMessage = 'Ошибка: Неверный или устаревший файл фото. Пожалуйста, загрузите фото заново.';
                } else if (error.message.includes('Photo already exists')) {
                    errorMessage = 'Это фото уже было загружено ранее. Каждое фото можно использовать только один раз.';
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