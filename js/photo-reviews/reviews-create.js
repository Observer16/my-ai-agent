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
                showPopup: (params) => console.log('Popup:', params)
            };
        }

        // Кнопка открытия модального окна
        const addBtn = document.getElementById('addReviewBtn');
        addBtn.addEventListener('click', () => this.open());

        // Кнопки загрузки фото
        document.getElementById('takePhotoBtn').addEventListener('click', () => this.takePhoto());
        document.getElementById('choosePhotoBtn').addEventListener('click', () => this.choosePhoto());

        // Навигация по шагам
        document.getElementById('cancelPhotoBtn').addEventListener('click', () => this.close());
        document.getElementById('nextToRatingBtn').addEventListener('click', () => this.goToStep(2));
        document.getElementById('backToPhotoBtn').addEventListener('click', () => this.goToStep(1));
        document.getElementById('nextToDetailsBtn').addEventListener('click', () => this.goToStep(3));
        document.getElementById('backToRatingBtn').addEventListener('click', () => this.goToStep(2));

        // Кнопки оценки
        document.getElementById('goodBtn').addEventListener('click', () => this.selectRating('good'));
        document.getElementById('badBtn').addEventListener('click', () => this.selectRating('bad'));

        // Счётчик символов комментария
        const commentInput = document.getElementById('commentInput');
        commentInput.addEventListener('input', (e) => {
            document.getElementById('commentCounter').textContent = e.target.value.length;
        });

        // Кнопка сохранения
        document.getElementById('saveReviewBtn').addEventListener('click', () => this.save());

        console.log('✅ Создание отзывов готово');
    },

    /**
     * Открыть модальное окно
     */
    open() {
        this.reset();
        document.getElementById('createModal').classList.add('active');
        this.tg.HapticFeedback.impactOccurred('medium');
    },

    /**
     * Закрыть модальное окно
     */
    close() {
        document.getElementById('createModal').classList.remove('active');
        this.reset();
        this.tg.HapticFeedback.impactOccurred('light');
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
        document.getElementById('photoPreview').style.display = 'none';
        document.getElementById('uploadButtons').style.display = 'flex';
        document.getElementById('photoUploadArea').classList.remove('has-photo');
        document.getElementById('nextToRatingBtn').disabled = true;
        document.getElementById('nextToDetailsBtn').disabled = true;
        document.getElementById('commentInput').value = '';
        document.getElementById('commentCounter').textContent = '0';
        document.getElementById('tagsInput').value = '';

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
            document.getElementById('photoStep').style.display = 'block';
            document.getElementById('step1Indicator').classList.add('active');
        } else if (step === 2) {
            document.getElementById('ratingStep').style.display = 'block';
            document.getElementById('step1Indicator').classList.add('completed');
            document.getElementById('step2Indicator').classList.add('active');
        } else if (step === 3) {
            document.getElementById('detailsStep').style.display = 'block';
            document.getElementById('step1Indicator').classList.add('completed');
            document.getElementById('step2Indicator').classList.add('completed');
            document.getElementById('step3Indicator').classList.add('active');
        }

        this.tg.HapticFeedback.impactOccurred('light');
    },

    /**
     * Сделать фото через камеру Telegram
     */
    async takePhoto() {
        try {
            // Проверка поддержки Telegram WebApp API
            if (!this.tg.requestContact) {
                this.tg.showAlert(t('photoReviews.errors.photoAccessDenied'));
                return;
            }

            // ВАЖНО: Telegram WebApp пока не поддерживает прямой доступ к камере
            // Используем обходной путь через input file
            this.openPhotoInput();

            this.tg.HapticFeedback.impactOccurred('medium');

        } catch (error) {
            console.error('❌ Ошибка при съёмке фото:', error);
            this.tg.showAlert(t('photoReviews.errors.photoAccessDenied'));
        }
    },

    /**
     * Выбрать фото из галереи
     */
    choosePhoto() {
        this.openPhotoInput();
        this.tg.HapticFeedback.impactOccurred('light');
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
     * Обработка выбранного фото
     */
    async handlePhotoSelected(file) {
        // Проверка размера (макс 20MB)
        if (file.size > 20 * 1024 * 1024) {
            this.tg.showAlert('Файл слишком большой. Максимум 20MB');
            return;
        }

        this.photoFile = file;

        // Генерируем временные ID (в реальности будут получены от Telegram Bot)
        this.photoFileId = `temp_${Date.now()}`;
        this.photoFileUniqueId = `unique_${Date.now()}`;

        // Показываем превью
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photoPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';

            document.getElementById('uploadButtons').style.display = 'none';
            document.getElementById('photoUploadArea').classList.add('has-photo');
            document.getElementById('nextToRatingBtn').disabled = false;
        };
        reader.readAsDataURL(file);

        this.tg.HapticFeedback.notificationOccurred('success');
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
        selectedBtn.classList.add('selected');

        document.getElementById('nextToDetailsBtn').disabled = false;

        this.tg.HapticFeedback.impactOccurred('medium');
    },

    /**
     * Сохранить отзыв
     */
    async save() {
        const saveBtn = document.getElementById('saveReviewBtn');

        try {
            // Валидация
            if (!this.photoFileId || !this.selectedRating) {
                this.tg.showAlert(t('photoReviews.errors.ratingRequired'));
                return;
            }

            // Отключаем кнопку
            saveBtn.disabled = true;
            saveBtn.textContent = t('photoReviews.create.saving');

            // Получаем данные
            const comment = document.getElementById('commentInput').value.trim();
            const tagsInput = document.getElementById('tagsInput').value.trim();
            const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t).slice(0, 10) : [];
            const language = getCurrentLanguage();

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
            this.tg.showPopup({
                title: '✅',
                message: t('photoReviews.create.success'),
                buttons: [{type: 'ok'}]
            });

            this.tg.HapticFeedback.notificationOccurred('success');

            // Обновляем список
            if (window.ReviewsList) {
                await window.ReviewsList.refresh();
            }

        } catch (error) {
            console.error('❌ Ошибка сохранения отзыва:', error);
            this.tg.showAlert(t('photoReviews.create.error') + ': ' + error.message);
            this.tg.HapticFeedback.notificationOccurred('error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = t('photoReviews.create.save');
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    ReviewsCreate.init();
});

// Экспорт для использования в других модулях
window.ReviewsCreate = ReviewsCreate;

console.log('✅ reviews-create.js загружен');