# 💾 Система кэширования

Описание стратегии кэширования на frontend и backend.

## Frontend кэширование (js/cache.js)

### CacheManager класс

```javascript
window.Cache = new CacheManager();
```

Управляет кэшированием в localStorage с TTL на уровень эндпоинта.

### Методы

#### Cache.get(key, defaultValue)
```javascript
const data = window.Cache.get('products_list', null);
```

#### Cache.set(key, value, ttl)
```javascript
window.Cache.set('products_list', data, 6 * 60 * 60 * 1000); // 6 часов
```

#### Cache.clear(pattern)
```javascript
// Очистить все ключи, содержащие 'products'
window.Cache.clear('products');

// Очистить все
window.Cache.clear();
```

#### Cache.has(key)
```javascript
if (window.Cache.has('products_list')) {
  const data = window.Cache.get('products_list');
}
```

### TTL по эндпоинтам

Настраивается в `CONFIG.CACHE_TTL`:

```javascript
CONFIG.CACHE_TTL = {
  USER: 24 * 60 * 60 * 1000,              // 24 часа
  STATISTICS: 60 * 60 * 1000,             // 1 час
  PRODUCTS: 6 * 60 * 60 * 1000,           // 6 часов
  PRICES: 6 * 60 * 60 * 1000,             // 6 часов
  PHOTO_REVIEWS_LIST: 6 * 60 * 60 * 1000, // 6 часов
  PHOTO_REVIEWS_PHOTOS: 24 * 60 * 60 * 1000, // 24 часа
};
```

## API кэширование (APIClient)

Все запросы автоматически кэшируются:

```javascript
// Первый запрос - с API
const products = await window.API.get('/products');

// Второй запрос (пока не истек TTL) - из кэша
const sameProducts = await window.API.get('/products');
```

### Инвалидация кэша

При изменении данных:

```javascript
// После добавления нового товара
await window.API.post('/products', data);
window.Cache.clear('products');  // Очистить кэш

// Загрузить свежие данные
const freshData = await window.API.get('/products', { bust: true });
```

## Стратегия кэширования модулей

### Photo Reviews Module
- **Список отзывов:** 6 часов (стабильный список)
- **Фото товаров:** 24 часа (редко меняются)
- **Добавление отзыва:** добавляется локально БЕЗ API, инвалидирует кэш при синхронизации

```javascript
// Быстрое добавление без API
HealthUI.addNewReview(review);

// Удаление локально
HealthUI.removeReview(reviewId);
```

## Backend кэширование (Redis)

### Кэш результатов запросов
```python
# Кэшировать результаты на 6 часов
cache.set(cache_key, results, ex=6*3600)
```

### Инвалидация
```python
# Инвалидировать кэш при изменении
cache.delete(cache_key_pattern)
```

Подробнее см. [CONFIG.md](./CONFIG.md) и [ENV_VARS.md](./ENV_VARS.md)
