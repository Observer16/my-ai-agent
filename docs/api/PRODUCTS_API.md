# 🛍️ Эндпоинты товаров

API эндпоинты для работы с товарами и поиском.

## GET /products

Получение списка товаров.

**Параметры:**
- `limit` (int, default: 20) - количество товаров
- `offset` (int, default: 0) - смещение
- `search` (string) - поиск по названию
- `category` (string) - фильтр по категории
- `family_id` (string) - для семейных данных

**Ответ:**
```json
{
  "items": [
    {
      "id": "123",
      "name": "Молоко",
      "normalized_name": "молоко",
      "barcode": "1234567890",
      "category": "молочные продукты"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

## GET /products/by-code/{barcode}

Поиск товара по штрих-коду.

**Параметры:**
- `barcode` (string) - штрих-код товара
- `family_id` (string, optional) - для семейных данных

**Ответ:**
```json
{
  "id": "123",
  "name": "Молоко",
  "barcode": "1234567890",
  "normalized_name": "молоко",
  "category": "молочные продукты",
  "photo_url": "https://..."
}
```

**Коды ошибок:**
- `404` - товар не найден
- `400` - неверный формат штрих-кода

## Фильтрация по семье

- Если передан `family_id` - возвращаются только товары семьи
- Если не передан и пользователь не в семье - возвращаются личные товары
- Товары без привязки (`family_id IS NULL`, `created_by_user_id IS NULL`) доступны всем

Подробнее см. [API_REFERENCE.md](./API_REFERENCE.md) и [PRICES_API.md](./PRICES_API.md)
