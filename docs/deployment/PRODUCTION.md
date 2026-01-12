# 📦 Production готовность

Контрольный список и рекомендации для развёртывания в production.

## Развёртывание Frontend

### GitHub Pages (текущая стратегия)

Автоматическое развёртывание при push на `main` через `.github/workflows/static.yml`:

```yaml
# .github/workflows/static.yml
- Триггер: push на main
- Действие: GitHub Pages deployment
- Результат: приложение доступно по URL GitHub Pages
```

### Конфигурация Production

В `js/config.js` для production:

```javascript
CONFIG.API_URL = 'https://api.smartsaving.fun';
CONFIG.DEBUG = false;
```

### Оптимизация

1. Минификация JavaScript (опционально с bundler)
2. Кэширование в браузере через HTTP headers
3. Сжатие CSS и HTML
4. CDN для статических файлов

## Развёртывание Backend

### Docker контейнеризация

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment переменные

Для production установи переменные на хостинге:

```bash
DATABASE_URL=postgresql://user:password@prod-db:5432/family_budget
API_URL=https://api.smartsaving.fun
TELEGRAM_BOT_TOKEN=prod_token
```

### Базовые данные

Выполни миграции в production БД:

```bash
# На хосте
python -m alembic upgrade head
```

## Безопасность

### HTTPS

- Frontend развёртывается на HTTPS через GitHub Pages
- Backend должен быть на HTTPS (используй Let's Encrypt)

### API аутентификация

- Используется Telegram User ID
- Валидация на backend через middleware

### CORS

Настрой CORS на backend для production URL:

```python
origins = [
    "https://your-username.github.io",
    "https://api.smartsaving.fun"
]
```

## Мониторинг

### Frontend

- Мониторь консоль браузера на ошибки
- Используй Google Analytics для статистики

### Backend

- Логирование всех ошибок
- Health check эндпоинт: `GET /health`
- Мониторь производительность БД

## Масштабирование

### Кэширование

- Redis для кэширования результатов API
- TTL стратегия в `CONFIG.CACHE_TTL`

### БД оптимизация

- Индексы для частых запросов
- Архивирование старых данных
- Мониторь размер таблиц

## Откат

При проблемах:

1. Frontend: откатись на предыдущий коммит в GitHub
2. Backend: переключись на предыдущую версию контейнера
3. БД: используй резервные копии

Подробнее см. [SETUP.md](./SETUP.md) и [CONFIG.md](../config/CONFIG.md)
