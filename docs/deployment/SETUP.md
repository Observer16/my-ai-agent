# 🚀 Установка и запуск

Инструкции для локальной разработки и первоначальной установки.

## Локальная разработка

### Frontend

1. Клонируй репозиторий:
```bash
git clone https://github.com/your-repo/my-ai-agent.git
cd my-ai-agent
```

2. Открой `index.html` в браузере или запусти локальный сервер:
```bash
# Python 3
python -m http.server 8080

# Node.js
npx http-server

# Or any static server
```

3. Перейди на `http://localhost:8080`

### Backend

Смотри инструкции в `C:\Users\obser\PycharmProjects\FamilyBudgetAnalyzer\README.md`

1. Установи зависимости:
```bash
pip install -r requirements.txt
```

2. Конфигури БД:
```bash
# Создай .env файл с DATABASE_URL
cp .env.example .env
```

3. Запусти сервер:
```bash
uvicorn main:app --reload --port 8000
```

4. API доступен на `http://localhost:8000`
   - Swagger UI: `http://localhost:8000/docs`

## Требования

### Frontend
- Современный браузер (Chrome, Firefox, Safari, Edge)
- Нет зависимостей, чистый JavaScript

### Backend
- Python 3.10+
- PostgreSQL 12+
- Redis (опционально, для кэширования)

## Конфигурация для разработки

### Frontend (js/config.js)
```javascript
CONFIG.API_URL = 'http://localhost:8000';
CONFIG.DEBUG = true;
```

### Backend (.env)
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/family_budget
API_PORT=8000
DEBUG=true
```

## Тестирование

### Frontend
- Открой консоль браузера (F12)
- Проверь сообщения логирования
- Тестируй функциональность в браузере

### Backend
- Swagger UI: `http://localhost:8000/docs`
- Используй curl или Postman для тестирования API

Подробнее см. [PRODUCTION.md](./PRODUCTION.md)
