# 🌍 Руководство по интеграции мультивалютности

## ✅ Что уже сделано

### Backend (FamilyBudget)
1. ✅ SQL миграция: `migrations/add_user_currency_preference.sql`
2. ✅ Константы валют: `api/utils/currency.py`
3. ✅ Pydantic модели: обновлен `api/models/schemas.py`
4. ✅ API endpoints: `api/routes/users.py`
5. ✅ Роутер подключен в `api/main.py`

### Frontend (my-ai-agent)
1. ✅ Утилиты валют: `js/currency.js`
2. ✅ API расширения: `js/api-extensions.js`
3. ✅ Страница настроек: `pages/settings.html`
4. ✅ Логика настроек: `js/settings.js`
5. ✅ Стили: `css/settings-styles.css`
6. ✅ Кнопка настроек на главной странице

## 📝 Что нужно сделать вручную

### 1. Применить SQL миграцию
```bash
psql -U postgres -d your_database -f migrations/add_user_currency_preference.sql
```

### 2. Интегрировать API расширения
Добавить содержимое `js/api-patch.js` в конец файла `js/api.js` (перед закрывающей скобкой класса).

### 3. Добавить функцию openSettings в app.js
Добавить содержимое `js/app-patch.js` в конец `js/app.js`.

### 4. Подключить стили настроек
Добавить импорт в `css/style.css`:
```css
@import url('settings-styles.css');
```

Или скопировать содержимое `css/settings-styles.css` в конец `css/style.css`.

### 5. Обновить index.html
Убедиться, что загружается `js/currency.js` и `js/api-extensions.js`:
```html
<script src="js/config.js"></script>
<script src="js/cache.js"></script>
<script src="js/api.js"></script>
<script src="js/api-extensions.js"></script>
<script src="js/currency.js"></script>
<script src="js/timezone.js"></script>
<script src="js/timezone-init.js"></script>
<script src="js/app.js"></script>
```

## 🎯 Следующие шаги

### Этап 2: Динамическое отображение валюты
1. Инициализация валюты при загрузке приложения
2. Замена всех `formatCurrency()` на использование `currency.js`
3. Обновление всех страниц для использования динамической валюты

### Этап 3: Тестирование
1. Проверить смену валюты в настройках
2. Проверить сохранение настроек
3. Проверить отображение валюты на всех страницах

## 📦 Поддерживаемые валюты
- PYG (₲) - Парагвайский гуарани (по умолчанию)
- USD ($) - Доллар США
- EUR (€) - Евро
- RUB (₽) - Российский рубль
- BRL (R$) - Бразильский реал
- UAH (₴) - Украинская гривна

## 🔧 API Endpoints

### GET /users/me/settings
Получить настройки пользователя
```json
{
  "telegram_id": 123456789,
  "username": "user",
  "first_name": "John",
  "timezone": "America/Asuncion",
  "preferred_currency": "PYG",
  "currency_info": {
    "code": "PYG",
    "symbol": "₲",
    "name": "Paraguayan Guaraní",
    "name_ru": "Парагвайский гуарани",
    "decimal_places": 0
  }
}
```

### PATCH /users/me/settings
Обновить настройки
```json
{
  "preferred_currency": "USD"
}
```

### GET /users/currencies
Получить список валют
```json
{
  "currencies": [
    {
      "code": "PYG",
      "symbol": "₲",
      "name": "Paraguayan Guaraní",
      "name_ru": "Парагвайский гуарани",
      "decimal_places": 0
    }
  ]
}
```
