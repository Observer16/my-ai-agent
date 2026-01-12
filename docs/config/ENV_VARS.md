# 🔐 Переменные окружения

Описание переменных окружения для разработки и production.

## Frontend переменные

### API подключение
```bash
# Development (локальный backend)
API_URL=http://localhost:8000

# Production (production backend)
API_URL=https://api.smartsaving.fun
```

### Отладка
```bash
# Включить отладочные сообщения в консоли
DEBUG=true

# Уровень логирования (debug, info, warn, error)
LOG_LEVEL=info
```

### Кэширование
```bash
# Отключить кэширование (для разработки)
DISABLE_CACHE=false

# Максимальный размер кэша в localStorage (MB)
CACHE_MAX_SIZE=50
```

### Telegram WebApp
```bash
# Включить Telegram WebApp интеграцию
TELEGRAM_ENABLED=true
```

## Backend переменные

Смотри в проекте `C:\Users\obser\PycharmProjects\FamilyBudgetAnalyzer\.env`:

### Базовые
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/family_budget
API_PORT=8000
API_HOST=0.0.0.0
DEBUG=true
```

### Telegram
```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
```

### N8N вебхуки
```bash
N8N_WEBHOOK_URL=https://n8n.example.com/webhook
N8N_API_KEY=your_n8n_api_key
```

## Файл .env (не коммитится)

Для локальной разработки создай файл `.env` в корне проекта:

```bash
# Frontend (.env в my-ai-agent/)
API_URL=http://localhost:8000
DEBUG=true
DISABLE_CACHE=false
```

```bash
# Backend (.env в FamilyBudgetAnalyzer/)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/family_budget
API_PORT=8000
DEBUG=true
TELEGRAM_BOT_TOKEN=your_token
```

Подробнее см. [CONFIG.md](./CONFIG.md) и [CACHING.md](./CACHING.md)
