# 📊 Поток данных

Описание того, как данные проходят через систему от пользователя к БД и обратно.

## Основной поток

```
┌──────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vanilla JS)                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 1. User Action (click, input, scroll)                      │ │
│  │    ↓                                                        │ │
│  │ 2. Event Handler → JS function                             │ │
│  │    ↓                                                        │ │
│  │ 3. API Call: window.API.get/post/put/delete()             │ │
│  │    ↓                                                        │ │
│  │ 4. Check Cache (window.Cache)                             │ │
│  │    → If cached: return cached data                        │ │
│  │    → If not: make HTTP request                            │ │
│  └─────────────────────┬──────────────────────────────────────┘ │
└──────────────────────┬─────────────────────────────────────────┘
                       │ HTTP Request
                       │ Header: X-Telegram-User-Id
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│                    BACKEND (FastAPI)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 5. Middleware: Extract User ID from header                │ │
│  │    ↓                                                       │ │
│  │ 6. Route Handler: /products, /prices, etc                 │ │
│  │    ↓                                                       │ │
│  │ 7. Business Logic: filter, process, aggregate             │ │
│  │    ↓                                                       │ │
│  │ 8. Database Query: asyncpg → PostgreSQL                   │ │
│  └─────────────────────┬──────────────────────────────────────┘ │
└──────────────────────┬─────────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 9. Execute SQL Query                                      │ │
│  │    ↓                                                       │ │
│  │ 10. Filter by:                                            │ │
│  │     - family_id (family data vs personal)                 │ │
│  │     - created_by_user_id (user ownership)                 │ │
│  │    ↓                                                       │ │
│  │ 11. Return results to backend                             │ │
│  └─────────────────────┬──────────────────────────────────────┘ │
└──────────────────────┬─────────────────────────────────────────┘
                       │ JSON Response
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│                    BACKEND (FastAPI)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 12. Cache response (optional Redis)                        │ │
│  │     ↓                                                       │ │
│  │ 13. Return JSON response                                   │ │
│  └─────────────────────┬──────────────────────────────────────┘ │
└──────────────────────┬─────────────────────────────────────────┘
                       │ HTTP Response (JSON)
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│                     FRONTEND (Vanilla JS)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 14. Parse JSON response                                    │ │
│  │     ↓                                                       │ │
│  │ 15. Cache in localStorage (window.Cache.set)              │ │
│  │     ↓                                                       │ │
│  │ 16. Update UI:                                             │ │
│  │     - Clear loading spinner                                │ │
│  │     - Render data (HTML generation)                        │ │
│  │     - Apply translations (i18n)                            │ │
│  │     - Haptic feedback (Telegram)                           │ │
│  │     ↓                                                       │ │
│  │ 17. User sees updated content                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Примеры потоков для конкретных сценариев

### Сценарий 1: Поиск товара по штрих-коду

```javascript
// 1. User вводит штрих-код и нажимает Enter
// 2. Frontend вызывает:
const product = await window.API.get('/products/by-code/784150303152');

// 3. Backend выполняет SQL:
// SELECT p.id, pn.name, ...
// FROM products p
// LEFT JOIN product_names pn ON ...
// WHERE p.barcode = $1 AND (
//   p.family_id = $2 OR
//   (p.family_id IS NULL AND p.created_by_user_id = $3) OR
//   (p.family_id IS NULL AND p.created_by_user_id IS NULL)
// )

// 4. Frontend показывает модальное окно товара
```

### Сценарий 2: Получение трендов цен

```javascript
// 1. Frontend вызывает:
const trends = await window.API.get('/prices/trends', {
  days: 90,
  product_name: 'молоко',
  family_id: 'family_123'
});

// 2. Backend выполняет сложный CTE запрос:
// - Получает последние цены по магазинам
// - Вычисляет тренды и процент изменения
// - Фильтрует по семье

// 3. Frontend кэширует результат на 6 часов
// 4. Показывает графики и тренды
```

### Сценарий 3: Сравнение цен в магазинах

```javascript
// 1. Frontend показывает фильтры и нажимает "Получить данные"
// 2. Вызывает:
const comparison = await window.API.get('/prices/compare', {
  family_id: 'family_123'
});

// 3. Backend находит товары, куплены в разных магазинах:
// - Исключает товары с кодом 'MANUAL'
// - Требует наличие QR-кода (qr_code IS NOT NULL)
// - Группирует по товару и магазину

// 4. Frontend показывает сравнение: где дешевле
```

## Кэширование и инвалидация

### Frontend localStorage cache

```javascript
// Cache key: 'api_request_GET_/products_{"limit":20}'
// TTL: 6 часов (CONFIG.CACHE_TTL.PRODUCTS)

// При изменении:
await window.API.post('/products', newData);
window.Cache.clear('products');  // Инвалидация
const fresh = await window.API.get('/products');  // Новый запрос
```

### Backend Redis cache

```python
# Кэш результатов на 6 часов
cache.set('price_trends_family_123_90days', results, ex=6*3600)

# Инвалидация при изменении данных
cache.delete('price_trends_family_123_*')
```

## Изоляция данных по семьям

### Solo режим (личные данные)
```sql
WHERE created_by_user_id = 123 AND family_id IS NULL
```

### Family режим
```sql
WHERE family_id = 'family_abc123'
```

### Публичные данные
```sql
WHERE created_by_user_id IS NULL AND family_id IS NULL
```

Подробнее см. [OVERVIEW.md](./OVERVIEW.md), [SCHEMA.md](../database/SCHEMA.md)
