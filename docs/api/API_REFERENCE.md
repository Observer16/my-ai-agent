# 🔌 API справочник

Общий справочник по API backend приложения.

## Базовая информация

**Base URL (production):** `https://api.smartsaving.fun`
**Base URL (development):** `http://localhost:8000`

**Аутентификация:** Header `X-Telegram-User-Id` с Telegram User ID

## Категории эндпоинтов

### Аутентификация и профиль
- `GET /auth/me` - информация о пользователе

Подробнее см. [HEALTH_API.md](./HEALTH_API.md)

### Товары и цены
- `GET /products` - список товаров
- `GET /products/by-code/{barcode}` - поиск товара по штрих-коду
- `GET /prices/trends` - тренды цен
- `GET /prices/compare` - сравнение цен в магазинах

Подробнее см. [PRODUCTS_API.md](./PRODUCTS_API.md) и [PRICES_API.md](./PRICES_API.md)

### Семья
- `GET /families` - список семей
- `POST /families` - создание семьи
- `GET /families/{id}` - информация о семье
- `POST /families/{id}/invite` - приглашение в семью
- `PUT /families/{id}/members` - управление членами

### Здоровье
- `GET /health/profile` - профиль здоровья
- `GET /health/medications` - лекарства
- `GET /health/entries` - записи о здоровье
- `GET /health/logs` - логи здоровья
- `POST /health/reminder` - добавление напоминания

Подробнее см. [HEALTH_API.md](./HEALTH_API.md)

### Загрузка и обработка
- `POST /upload/xml` - загрузка XML чека
- `POST /photo-reviews` - загрузка фото отзыва

## Обработка ошибок

API возвращает стандартные HTTP коды:
- `200 OK` - успешный запрос
- `400 Bad Request` - ошибка в параметрах
- `401 Unauthorized` - ошибка аутентификации
- `404 Not Found` - ресурс не найден
- `500 Internal Server Error` - ошибка сервера

## Rate Limiting

Все запросы ограничены по частоте. Лимиты отправляются в заголовках:
- `X-RateLimit-Limit` - максимум запросов
- `X-RateLimit-Remaining` - оставшееся количество
- `X-RateLimit-Reset` - время сброса

Подробнее см. [PRODUCTS_API.md](./PRODUCTS_API.md), [PRICES_API.md](./PRICES_API.md), [HEALTH_API.md](./HEALTH_API.md)
