# Модуль "Фото-отзывы" - Документация

## 📋 Описание
Личный дневник покупок с фотографиями для Telegram Mini App. Пользователи могут фотографировать товары, оценивать их (👍/👎) и добавлять комментарии с тегами.

## ✅ Реализованный функционал (MVP)

### 1. Список отзывов
- ✅ Отображение всех отзывов в виде карточек с фото
- ✅ Фильтрация по оценкам (все/хорошие/плохие)
- ✅ Поиск по комментариям
- ✅ Пагинация и lazy loading
- ✅ Пустое состояние при отсутствии отзывов
- ✅ Адаптивная сетка (2-4 колонки)

### 2. Создание отзыва (3 шага)
- ✅ **Шаг 1: Фото**
  - Съёмка через камеру
  - Выбор из галереи
  - Превью выбранного фото

- ✅ **Шаг 2: Оценка**
  - Кнопки "Хорошо" (👍) / "Плохо" (👎)
  - Визуальная индикация выбора
  - Виброотклик при выборе

- ✅ **Шаг 3: Детали**
  - Комментарий (опционально, до 500 символов)
  - Теги (опционально, до 10 тегов)
  - Счётчик символов

### 3. Просмотр отзыва
- ✅ Полноразмерное фото
- ✅ Оценка, комментарий, теги
- ✅ Дата создания
- ✅ Кнопка удаления с подтверждением

### 4. Интеграция
- ✅ Точка входа из главного меню
- ✅ Полная поддержка i18n (ru, en, es, uk)
- ✅ Интеграция с системой Back Button
- ✅ Telegram WebApp виброотклик
- ✅ API endpoints готовы

## 🗂️ Структура файлов

```
my-ai-agent/
├── pages/
│   └── photo-reviews.html          # Главная страница модуля
├── css/
│   └── photo-reviews.css           # Стили модуля
├── js/
│   ├── photo-reviews/
│   │   ├── reviews-api.js          # API методы
│   │   ├── reviews-list.js         # Список отзывов
│   │   ├── reviews-create.js       # Создание отзыва
│   │   └── reviews-view.js         # Просмотр отзыва
│   └── i18n/
│       └── photo-reviews.js        # Переводы (ru, en, es, uk)
```

## 🔧 API Endpoints

### Получить список отзывов
```javascript
GET /photo-reviews/
Параметры:
  - limit: number (по умолчанию 20)
  - offset: number (по умолчанию 0)
  - rating: 'good' | 'bad' | null
  - language: 'ru' | 'en' | 'es' | 'uk'
```

### Создать отзыв
```javascript
POST /photo-reviews/
Body: {
  telegram_file_id: string,
  telegram_file_unique_id: string,
  rating: 'good' | 'bad',
  language: string,
  comment?: string,
  tags?: string[]
}
```

### Получить отзыв
```javascript
GET /photo-reviews/{review_id}
```

### Удалить отзыв
```javascript
DELETE /photo-reviews/{review_id}
```

### Статистика
```javascript
GET /photo-reviews/stats
Возвращает:
  - total_reviews: number
  - good_reviews: number
  - bad_reviews: number
  - last_review_date: datetime
  - most_used_tags: string[]
```

### Поиск
```javascript
GET /photo-reviews/search?q={query}
Параметры:
  - q: string (поисковый запрос)
  - language?: string
  - limit?: number
```

## 🌍 Интернационализация

Полная поддержка 4 языков:
- 🇷🇺 Русский (ru)
- 🇬🇧 Английский (en)
- 🇪🇸 Испанский (es)
- 🇺🇦 Украинский (uk)

Подробнее см. [BUDGET.md](./BUDGET.md), [HEALTH.md](./HEALTH.md), [PRODUCT_SEARCH.md](./PRODUCT_SEARCH.md)
