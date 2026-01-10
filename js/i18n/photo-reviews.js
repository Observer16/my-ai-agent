// js/i18n/photo-reviews.js - Переводы модуля фото-отзывов

const photoReviewsTranslations = {
    ru: {
        title: 'Мои предпочтения',
        subtitle: 'Личный дневник покупок с фото',
        addNew: 'Добавить отзыв',
        noReviews: 'У вас пока нет отзывов',
        noReviewsHint: 'Нажмите «Добавить отзыв» для создания',

        // Создание отзыва
        create: {
            title: 'Новый отзыв',
            step1: 'Шаг 1: Фото',
            step2: 'Шаг 2: Оценка',
            step3: 'Шаг 3: Детали',
            takePhoto: '📷 Сделать фото',
            choosePhoto: '🖼️ Выбрать из галереи',
            photoRequired: 'Фото обязательно',
            rateProduct: 'Оцените товар',
            good: '👍 Хорошо',
            bad: '👎 Плохо',
            addComment: 'Комментарий (опционально)',
            commentPlaceholder: 'Что вам понравилось или не понравилось?',
            addTags: 'Теги (опционально)',
            tagsPlaceholder: 'Например: молоко, сыр',
            tagsHint: 'До 10 тегов через запятую',
            save: 'Сохранить отзыв',
            saving: 'Сохранение...',
            success: 'Отзыв успешно добавлен!',
            error: 'Ошибка при сохранении отзыва'
        },

        // Список отзывов
        list: {
            all: 'Все отзывы',
            good: 'Хорошие',
            bad: 'Плохие',
            search: 'Поиск по комментариям...',
            searchByTag: 'Поиск по тегу',
            noResults: 'Ничего не найдено',
            loading: 'Загрузка...',
            loadMore: 'Загрузить ещё'
        },

        // Просмотр отзыва
        view: {
            title: 'Отзыв',
            rating: 'Оценка',
            comment: 'Комментарий',
            tags: 'Теги',
            created: 'Создано',
            delete: 'Удалить отзыв',
            deleteConfirm: 'Удалить этот отзыв?',
            deleteSuccess: 'Отзыв удалён',
            deleteError: 'Ошибка при удалении'
        },

        // Статистика
        stats: {
            total: 'Всего отзывов',
            good: 'Хороших',
            bad: 'Плохих',
            lastReview: 'Последний отзыв',
            popularTags: 'Популярные теги'
        },

        // Ошибки
        errors: {
            photoRequired: 'Необходимо добавить фото',
            ratingRequired: 'Выберите оценку',
            loadFailed: 'Ошибка загрузки отзывов',
            saveFailed: 'Ошибка сохранения',
            deleteFailed: 'Ошибка удаления',
            photoAccessDenied: 'Нет доступа к камере'
        }
    },

    en: {
        title: 'Photo Reviews',
        subtitle: 'Personal shopping diary with photos',
        addNew: 'Add Review',
        noReviews: 'You have no reviews yet',
        noReviewsHint: 'Tap "Add Review" to create one',

        create: {
            title: 'New Review',
            step1: 'Step 1: Photo',
            step2: 'Step 2: Rating',
            step3: 'Step 3: Details',
            takePhoto: '📷 Take Photo',
            choosePhoto: '🖼️ Choose from Gallery',
            photoRequired: 'Photo is required',
            rateProduct: 'Rate the product',
            good: '👍 Good',
            bad: '👎 Bad',
            addComment: 'Comment (optional)',
            commentPlaceholder: 'What did you like or dislike?',
            addTags: 'Tags (optional)',
            tagsPlaceholder: 'E.g.: milk, cheese',
            tagsHint: 'Up to 10 tags separated by commas',
            save: 'Save Review',
            saving: 'Saving...',
            success: 'Review added successfully!',
            error: 'Error saving review'
        },

        list: {
            all: 'All Reviews',
            good: 'Good',
            bad: 'Bad',
            search: 'Search comments...',
            searchByTag: 'Search by tag',
            noResults: 'Nothing found',
            loading: 'Loading...',
            loadMore: 'Load More'
        },

        view: {
            title: 'Review',
            rating: 'Rating',
            comment: 'Comment',
            tags: 'Tags',
            created: 'Created',
            delete: 'Delete Review',
            deleteConfirm: 'Delete this review?',
            deleteSuccess: 'Review deleted',
            deleteError: 'Error deleting'
        },

        stats: {
            total: 'Total Reviews',
            good: 'Good',
            bad: 'Bad',
            lastReview: 'Last Review',
            popularTags: 'Popular Tags'
        },

        errors: {
            photoRequired: 'Photo is required',
            ratingRequired: 'Select a rating',
            loadFailed: 'Failed to load reviews',
            saveFailed: 'Failed to save',
            deleteFailed: 'Failed to delete',
            photoAccessDenied: 'Camera access denied'
        }
    },

    es: {
        title: 'Reseñas con Fotos',
        subtitle: 'Diario personal de compras con fotos',
        addNew: 'Agregar Reseña',
        noReviews: 'Aún no tienes reseñas',
        noReviewsHint: 'Presiona "Agregar Reseña" para crear una',

        create: {
            title: 'Nueva Reseña',
            step1: 'Paso 1: Foto',
            step2: 'Paso 2: Calificación',
            step3: 'Paso 3: Detalles',
            takePhoto: '📷 Tomar Foto',
            choosePhoto: '🖼️ Elegir de Galería',
            photoRequired: 'La foto es obligatoria',
            rateProduct: 'Califica el producto',
            good: '👍 Bueno',
            bad: '👎 Malo',
            addComment: 'Comentario (opcional)',
            commentPlaceholder: '¿Qué te gustó o disgustó?',
            addTags: 'Etiquetas (opcional)',
            tagsPlaceholder: 'Ej.: leche, queso',
            tagsHint: 'Hasta 10 etiquetas separadas por comas',
            save: 'Guardar Reseña',
            saving: 'Guardando...',
            success: '¡Reseña agregada exitosamente!',
            error: 'Error al guardar reseña'
        },

        list: {
            all: 'Todas las Reseñas',
            good: 'Buenas',
            bad: 'Malas',
            search: 'Buscar en comentarios...',
            searchByTag: 'Buscar por etiqueta',
            noResults: 'No se encontró nada',
            loading: 'Cargando...',
            loadMore: 'Cargar Más'
        },

        view: {
            title: 'Reseña',
            rating: 'Calificación',
            comment: 'Comentario',
            tags: 'Etiquetas',
            created: 'Creado',
            delete: 'Eliminar Reseña',
            deleteConfirm: '¿Eliminar esta reseña?',
            deleteSuccess: 'Reseña eliminada',
            deleteError: 'Error al eliminar'
        },

        stats: {
            total: 'Total de Reseñas',
            good: 'Buenas',
            bad: 'Malas',
            lastReview: 'Última Reseña',
            popularTags: 'Etiquetas Populares'
        },

        errors: {
            photoRequired: 'Se requiere foto',
            ratingRequired: 'Selecciona una calificación',
            loadFailed: 'Error al cargar reseñas',
            saveFailed: 'Error al guardar',
            deleteFailed: 'Error al eliminar',
            photoAccessDenied: 'Acceso a cámara denegado'
        }
    },

    uk: {
        title: 'Мої уподобання',
        subtitle: 'Особистий щоденник покупок з фото',
        addNew: 'Додати відгук',
        noReviews: 'У вас поки немає відгуків',
        noReviewsHint: 'Натисніть «Додати відгук» для створення',

        create: {
            title: 'Новий відгук',
            step1: 'Крок 1: Фото',
            step2: 'Крок 2: Оцінка',
            step3: 'Крок 3: Деталі',
            takePhoto: '📷 Зробити фото',
            choosePhoto: '🖼️ Вибрати з галереї',
            photoRequired: 'Фото обов\'язкове',
            rateProduct: 'Оцініть товар',
            good: '👍 Добре',
            bad: '👎 Погано',
            addComment: 'Коментар (опціонально)',
            commentPlaceholder: 'Що вам сподобалось або не сподобалось?',
            addTags: 'Теги (опціонально)',
            tagsPlaceholder: 'Наприклад: молоко, сир',
            tagsHint: 'До 10 тегів через кому',
            save: 'Зберегти відгук',
            saving: 'Збереження...',
            success: 'Відгук успішно додано!',
            error: 'Помилка при збереженні відгуку'
        },

        list: {
            all: 'Всі відгуки',
            good: 'Хороші',
            bad: 'Погані',
            search: 'Пошук в коментарях...',
            searchByTag: 'Пошук за тегом',
            noResults: 'Нічого не знайдено',
            loading: 'Завантаження...',
            loadMore: 'Завантажити ще'
        },

        view: {
            title: 'Відгук',
            rating: 'Оцінка',
            comment: 'Коментар',
            tags: 'Теги',
            created: 'Створено',
            delete: 'Видалити відгук',
            deleteConfirm: 'Видалити цей відгук?',
            deleteSuccess: 'Відгук видалено',
            deleteError: 'Помилка при видаленні'
        },

        stats: {
            total: 'Всього відгуків',
            good: 'Хороших',
            bad: 'Поганих',
            lastReview: 'Останній відгук',
            popularTags: 'Популярні теги'
        },

        errors: {
            photoRequired: 'Необхідно додати фото',
            ratingRequired: 'Виберіть оцінку',
            loadFailed: 'Помилка завантаження відгуків',
            saveFailed: 'Помилка збереження',
            deleteFailed: 'Помилка видалення',
            photoAccessDenied: 'Немає доступу до камери'
        }
    }
};

// Регистрируем переводы
if (typeof registerTranslations === 'function') {
    registerTranslations('photoReviews', photoReviewsTranslations);
    console.log('✅ Переводы photo-reviews зарегистрированы');
} else {
    console.error('❌ registerTranslations не найдена');
}