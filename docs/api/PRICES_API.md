# 💰 Эндпоинты цен

API эндпоинты для анализа и сравнения цен.

## GET /prices/trends

Получение трендов цен товаров.

**Параметры:**
- `days` (int, default: 90) - период в днях
- `product_name` (string, optional) - поиск по названию
- `limit` (int, default: 50) - количество результатов
- `family_id` (string, optional) - для семейных данных

**Ответ:**
```json
{
  "items": [
    {
      "product_name": "Молоко",
      "store_name": "Carrefour",
      "purchase_date": "2025-01-10",
      "price": 15000.00,
      "previous_price": 14500.00,
      "percent_change": 3.4,
      "trend_direction": "up",
      "avg_price": 14800.00,
      "observation_count": 5
    }
  ],
  "total": 25
}
```

**Поля ответа:**
- `trend_direction` - направление тренда: "up" (вверх), "down" (вниз), "same" (без изменений), "new" (новый товар)
- `percent_change` - процент изменения цены
- `avg_price` - средняя цена за период
- `observation_count` - количество наблюдений

## GET /prices/compare

Сравнение цен товара в разных магазинах.

**Параметры:**
- `product_name` (string, optional) - поиск по названию
- `limit` (int, default: 50) - количество результатов
- `family_id` (string, optional) - для семейных данных

**Ответ:**
```json
{
  "items": [
    {
      "product_code": "1234567890",
      "product_name": "Молоко",
      "store_name": "Carrefour",
      "current_price": 15000.00,
      "last_purchase_date": "2025-01-10",
      "store_count": 3,
      "price_status": "active"
    }
  ]
}
```

**Правила:**
- Показываются только товары, купленные в разных магазинах (store_count >= 2)
- Исключаются товары с кодом "MANUAL" (вручную введенные)
- Фильтруются только товары с QR-кодом чека

## Фильтрация по семье

- Если передан `family_id` - возвращаются только данные семьи
- Если не передан - возвращаются личные данные пользователя
- Период времени не ограничивается (получение за весь доступный период)

Подробнее см. [API_REFERENCE.md](./API_REFERENCE.md) и [PRODUCTS_API.md](./PRODUCTS_API.md)
