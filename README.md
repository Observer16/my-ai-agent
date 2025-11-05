# 🤖 Мой AI Агент - Telegram Mini App

Многофункциональное приложение для Telegram с модулями:
- 💰 Семейный бюджет
- 💪 Здоровье
- 🏃 Физическая активность  
- 🩺 AI медицинский консультант

---

## 🚀 Быстрый деплой на GitHub Pages

### Шаг 1: Создай репозиторий

```bash
1. Зайди на https://github.com/new
2. Имя: my-ai-agent
3. Public
4. Create repository
```

### Шаг 2: Загрузи файлы

```bash
# Клонируй репозиторий
git clone https://github.com/твой-username/my-ai-agent
cd my-ai-agent

# Скопируй файлы приложения
# (все файлы из папки miniapp/)

# Закоммить
git add .
git commit -m "Initial commit"
git push
```

### Шаг 3: Включи GitHub Pages

```bash
1. Settings → Pages
2. Source: main branch
3. Save
4. URL будет: https://твой-username.github.io/my-ai-agent
```

### Шаг 4: Настрой API URL

Отредактируй `js/config.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'https://твой-api.ngrok-free.app', // ← ЗАМЕНИ!
    // ...
};
```

### Шаг 5: Подключи к боту

```
1. @BotFather
2. /mybots
3. Выбери @SpyFoxAIagent_bot
4. Bot Settings → Menu Button
5. Configure Menu Button
6. URL: https://твой-username.github.io/my-ai-agent
7. Text: "🏠 Открыть приложение"
```

### ✅ Готово!

Открой бота → кнопка "🏠 Открыть приложение" → Mini App работает!

---

## 📁 Структура проекта

```
my-ai-agent/
├── index.html              # Главная страница (Dashboard)
├── pages/
│   ├── budget.html         # Модуль бюджета
│   ├── health.html         # Модуль здоровья (добавишь)
│   ├── activity.html       # Модуль активности (добавишь)
│   └── doctor.html         # AI консультант (добавишь)
├── js/
│   ├── config.js           # Конфигурация (API URL, настройки)
│   ├── api.js              # API клиент
│   ├── app.js              # Главная логика
│   ├── budget.js           # Логика бюджета (опционально)
│   ├── health.js           # Логика здоровья (добавишь)
│   └── activity.js         # Логика активности (добавишь)
└── README.md               # Этот файл
```

---

## 🔧 Настройка Backend API

### 1. Получи Ngrok Static Domain

```bash
1. https://dashboard.ngrok.com/cloud-edge/domains
2. Create Domain
3. Имя: my-ai-agent-api
4. Получишь: my-ai-agent-api.ngrok-free.app
```

### 2. Обнови ngrok.yml

```yaml
version: "2"
authtoken: YOUR_TOKEN

tunnels:
  n8n:
    proto: http
    addr: 5678
    domain: deciding-dane-slowly.ngrok-free.app
  
  api:
    proto: http
    addr: 8000
    domain: my-ai-agent-api.ngrok-free.app  # ← Твой static domain
```

### 3. Запусти ngrok

```bash
ngrok start --all --config ngrok.yml
```

### 4. Обнови config.js

```javascript
const CONFIG = {
    API_BASE_URL: 'https://my-ai-agent-api.ngrok-free.app',
    // ...
};
```

---

## 🎨 Кастомизация

### Изменить цвета

В `index.html` найди:

```css
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

Замени на свои цвета:

```css
.header {
    background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
}
```

### Добавить модуль

1. Создай файл `pages/new-module.html`
2. Добавь карточку в `index.html`:

```html
<div class="module-card" onclick="openModule('new-module')">
    <div class="module-header">
        <div class="module-icon">🎯</div>
        <div class="module-title">Новый модуль</div>
    </div>
    <div class="module-description">Описание</div>
</div>
```

3. Добавь в `js/app.js`:

```javascript
const modulePages = {
    // ...
    'new-module': 'pages/new-module.html'
};
```

---

## 📡 API Endpoints

### Существующие (Бюджет):

```
GET /statistics           - Общая статистика
GET /prices/trends        - Тренды цен
GET /prices/compare       - Сравнение цен по магазинам
```

### Нужно добавить (Здоровье):

```
POST /health/log          - Записать самочувствие
GET  /health/stats        - Статистика здоровья
```

### Нужно добавить (Активность):

```
POST /activity/log        - Записать тренировку
GET  /activity/stats      - Статистика активности
```

### Нужно добавить (AI Доктор):

```
POST /doctor/chat         - Отправить вопрос
```

---

## 🔐 Безопасность

### Проверка данных от Telegram

На backend добавь:

```python
from fastapi import Header, HTTPException
import hmac
import hashlib

def verify_telegram_data(init_data: str, bot_token: str):
    # Парсинг initData
    data = dict(x.split('=') for x in init_data.split('&'))
    
    # Проверка hash
    data_check = '\n'.join([f"{k}={v}" for k, v in sorted(data.items()) if k != 'hash'])
    secret = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret, data_check.encode(), hashlib.sha256).hexdigest()
    
    return calculated_hash == data.get('hash')

@app.get("/statistics")
async def get_statistics(x_telegram_init_data: str = Header(None)):
    if not verify_telegram_data(x_telegram_init_data, BOT_TOKEN):
        raise HTTPException(401, "Invalid auth")
    # ...
```

---

## 🎁 Полезные функции

### Показать уведомление

```javascript
tg.showAlert('Данные сохранены!');
```

### Показать подтверждение

```javascript
tg.showConfirm('Удалить запись?', (confirmed) => {
    if (confirmed) {
        // Удалить
    }
});
```

### Вибрация

```javascript
tg.HapticFeedback.impactOccurred('light');   // Лёгкая
tg.HapticFeedback.impactOccurred('medium');  // Средняя
tg.HapticFeedback.impactOccurred('heavy');   // Сильная
```

### Main Button

```javascript
tg.MainButton.setText('Сохранить');
tg.MainButton.show();
tg.MainButton.onClick(() => {
    console.log('Кнопка нажата');
});
```

### Открыть ссылку

```javascript
tg.openLink('https://google.com');
```

### Закрыть Mini App

```javascript
tg.close();
```

---

## 📱 Тестирование

### Локально

```bash
# Запусти локальный сервер
python -m http.server 8080

# Открой в браузере
http://localhost:8080
```

⚠️ Telegram API будет работать только внутри Telegram!

### В Telegram

```bash
1. Задеплой на GitHub Pages
2. Обнови URL в @BotFather
3. Открой бота
4. Кликни "🏠 Открыть приложение"
```

---

## 🐛 Troubleshooting

### Mini App не открывается

```
1. Проверь URL в @BotFather
2. Убедись что GitHub Pages включён
3. URL должен быть HTTPS
4. Проверь что файл index.html существует
```

### API не отвечает

```
1. Проверь что API запущен (FastAPI)
2. Проверь что ngrok запущен
3. Проверь API_BASE_URL в config.js
4. Проверь CORS на backend
```

### Данные не загружаются

```
1. Открой DevTools в Telegram Desktop
2. Посмотри Console на ошибки
3. Проверь Network вкладку
4. Убедись что endpoint существует
```

### Кнопки не работают

```
1. Проверь что config.js загружен
2. Проверь что app.js загружен
3. Посмотри Console на ошибки JavaScript
```

---

## 📚 Дополнительные ресурсы

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Ngrok Docs](https://ngrok.com/docs)

---

## ✅ Чеклист готовности

- [ ] Файлы загружены на GitHub
- [ ] GitHub Pages включён
- [ ] API URL настроен в config.js
- [ ] Ngrok static domain получен
- [ ] Backend API запущен
- [ ] Бот настроен в @BotFather
- [ ] Mini App открывается в боте
- [ ] Данные загружаются
- [ ] Все модули работают

---

## 🎉 Готово!

Теперь у тебя есть полнофункциональное Telegram Mini App!

**Следующие шаги:**
1. Добавь модули Здоровье, Активность, AI Доктор
2. Настрой дизайн под себя
3. Добавь больше функций
4. Расскажи друзьям! 🚀
