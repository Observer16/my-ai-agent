# 🏗️ Архитектура приложения

Общий обзор архитектуры Telegram Mini App.

## Слои приложения

```
┌─────────────────────────────────────────────────────────┐
│         Telegram Mini App (Frontend)                    │
│  - Pure JavaScript (ES6+), HTML5, CSS3                  │
│  - Vanilla JS, no bundler, no build system              │
└────────────────────┬────────────────────────────────────┘
                     │
                ┌────▼─────────────┐
                │   Telegram Bot   │
                │   WebApp API     │
                └────┬─────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
┌───────▼──────────────────────────▼──────────┐
│        FastAPI Backend (Python)             │
│  - Асинхронные эндпоинты                    │
│  - asyncpg для БД (async)                   │
│  - Telegram Bot интеграция                  │
│  - N8N вебхуки                              │
└────────────────────┬─────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        │                           │
┌───────▼────────────────┐  ┌───────▼─────┐
│   PostgreSQL БД        │  │ Redis Cache │
│  - asyncpg (API)       │  │             │
│  - psycopg2 (parser)   │  └─────────────┘
└────────────────────────┘
```

## Компоненты

### Frontend (это репозиторий)

**Язык:** Vanilla JavaScript (ES6+), HTML5, CSS3

**Структура:**
```
my-ai-agent/
├── index.html              # Main entry
├── pages/                  # Feature pages
│   ├── budget.html
│   ├── family.html
│   ├── products.html
│   └── ...
├── js/
│   ├── config.js           # 1️⃣ Загружается первым
│   ├── api.js              # APIClient для HTTP запросов
│   ├── cache.js            # CacheManager для localStorage
│   ├── app.js              # Main application logic
│   ├── i18n/               # Система переводов (ru, en, es, uk)
│   └── components/         # Переиспользуемые компоненты
├── health-module/          # Отдельный модуль здоровья
│   ├── js/health-module.js # HealthModule facade
│   ├── js/main.js          # HealthUI
│   ├── core/               # StateManager, DomManager, EventManager
│   ├── js/components/      # Dashboard, Diary, etc
│   └── css/                # Стили модуля
└── css/                    # Стили приложения
```

**Паттерны:**
- Global объекты: `window.API`, `window.CONFIG`, `window.Cache`
- Telegram интеграция: `window.Telegram.WebApp`
- Модульная архитектура для health-module

### Backend

**Репозиторий:** `C:\Users\obser\PycharmProjects\FamilyBudgetAnalyzer`

**Язык:** Python 3.10+, FastAPI

**Структура:**
```
FamilyBudgetAnalyzer/
├── api/routes/             # API эндпоинты
│   ├── products.py
│   ├── prices.py
│   ├── health.py
│   └── ...
├── parser/                 # XML парсер для чеков
├── db/                     # Менеджер БД (asyncpg)
└── main.py                 # Entry point
```

### База данных

**СУБД:** PostgreSQL 12+

**Стратегия изоляции данных:**
- `family_id` для разделения семейных/личных данных
- `created_by_user_id` для отслеживания пользователя
- NULL значения для публичных товаров

## Поток данных

Подробнее см. [DATA_FLOW.md](./DATA_FLOW.md)

```
User Action → Frontend UI → API Call → Backend Logic → Database → Response → UI Update
```

## Ключевые решения

### Frontend архитектура
1. **Vanilla JS без bundler** - простота, быстрая загрузка, нет зависимостей
2. **Модульная архитектура** - health-module как отдельный, переиспользуемый модуль
3. **Система переводов (i18n)** - поддержка 4 языков (ru, en, es, uk)
4. **Кэширование в localStorage** - улучшение производительности

### Backend архитектура
1. **FastAPI для асинхронности** - обработка множества запросов
2. **asyncpg для асинхронной БД** - избегание race conditions
3. **Семейные данные** - изоляция данных через family_id
4. **Telegram интеграция** - вебхуки для уведомлений

### БД архитектура
1. **Нормализация** - отдельная таблица product_names для языков
2. **Индексирование** - оптимизация частых запросов
3. **Историчность** - price_history для трендов

Подробнее см. [DATA_FLOW.md](./DATA_FLOW.md), [SCHEMA.md](../database/SCHEMA.md)
