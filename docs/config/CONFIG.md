# ⚙️ config.js - Центральная конфигурация

Описание основного файла конфигурации приложения `js/config.js`.

## Назначение

`config.js` содержит все настройки приложения и должен загружаться ПЕРВЫМ перед другими скриптами.

## Основные секции конфигурации

### API URLs
```javascript
CONFIG.API_URL = 'http://localhost:8000';  // development
// или
CONFIG.API_URL = 'https://api.smartsaving.fun';  // production
```

### Эндпоинты
```javascript
CONFIG.ENDPOINTS = {
  GET_USER: '/auth/me',
  GET_STATISTICS: '/statistics',
  GET_PRODUCTS: '/products',
  GET_PRODUCT_BY_CODE: '/products/by-code',
  GET_PRICES_TRENDS: '/prices/trends',
  GET_PRICES_COMPARE: '/prices/compare',
  // ... другие эндпоинты
};
```

### TTL кэширования
```javascript
CONFIG.CACHE_TTL = {
  USER: 24 * 60 * 60 * 1000,        // 24 часа
  STATISTICS: 60 * 60 * 1000,       // 1 час
  PRODUCTS: 6 * 60 * 60 * 1000,     // 6 часов
  PRICES: 6 * 60 * 60 * 1000,       // 6 часов
};
```

### UI настройки
```javascript
CONFIG.UI = {
  ITEMS_PER_PAGE: 20,
  MODAL_ANIMATION_TIME: 300,
  DEBOUNCE_DELAY: 300,
  SEARCH_MIN_CHARS: 2,
};
```

### Telegram WebApp
```javascript
CONFIG.TELEGRAM = {
  REQUEST_TIMEOUT: 5000,
  HAPTIC_FEEDBACK: true,
};
```

## Переменные окружения

Конфигурация может перекрываться переменными окружения:
```javascript
CONFIG.API_URL = process.env.API_URL || CONFIG.API_URL;
CONFIG.DEBUG = process.env.DEBUG === 'true';
```

## Использование конфигурации

В других скриптах используется как `window.CONFIG`:

```javascript
const apiUrl = window.CONFIG.API_URL;
const endpoint = window.CONFIG.ENDPOINTS.GET_USER;
const ttl = window.CONFIG.CACHE_TTL.PRODUCTS;
```

Подробнее см. [ENV_VARS.md](./ENV_VARS.md) и [CACHING.md](./CACHING.md)
