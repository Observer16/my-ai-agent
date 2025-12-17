# 🎨 Frontend: Telegram Уведомления

> Готовые компоненты для интеграции Telegram уведомлений в модуль здоровья

---

## ✅ Что добавлено

| Компонент | Файл | Описание |
|-----------|------|----------|
| **Кнопка настроек** | `src/components/HealthSettingsButton.tsx` | Кнопка в правом верхнем углу |
| **Страница настроек** | `src/pages/HealthSettings.tsx` | Полная страница с Telegram |

---

## 🚀 Быстрый старт (3 шага)

### Шаг 1: Добавь кнопку на главную страницу

В твою главную страницу модуля здоровья:

```tsx
import { HealthSettingsButton } from '@/components/HealthSettingsButton';

export const HealthPage = () => {
  return (
    <div className="p-6">
      {/* Шапка */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Здоровье</h1>
        
        {/* 🆕 Кнопка настроек */}
        <HealthSettingsButton />
      </div>

      {/* Остальной контент */}
    </div>
  );
};
```

### Шаг 2: Настрой роутинг

```tsx
import { HealthSettingsPage } from '@/pages/HealthSettings';

<Routes>
  <Route path="/health/settings" element={<HealthSettingsPage />} />
</Routes>
```

### Шаг 3: Готово! 🎉

Кнопка автоматически навигирует на страницу настроек с полным функционалом Telegram.

---

## 🎨 Превью

### Кнопка настроек:
```
┌─────────────────┐
│ ⚙️  Настройки  │  ← При hover: поворот иконки
└─────────────────┘
```

### Страница настроек:

```
╔══════════════════════════════════╗
║ ⚙️ Настройки здоровья            ║
╠══════════════════════════════════╣
║                                  ║
║ 🔗 Telegram Уведомления          ║
║                                  ║
║ ┌──────────────────────────────┐ ║
║ │ ✅ Аккаунт привязан          │ ║
║ │ @username (ID: 123456789)    │ ║
║ │                  [Отвязать]  │ ║
║ └──────────────────────────────┘ ║
║                                  ║
║ 🔔 Настройки уведомлений         ║
║                                  ║
║ ┌──────────────────────────────┐ ║
║ │ Telegram уведомления         │ ║
║ │ Уведомления включены    [●]  │ ║
║ └──────────────────────────────┘ ║
╚══════════════════════════════════╝
```

---

## 📋 Функционал страницы настроек

### 1. **Привязка Telegram**
- ✅ Генерация 6-значного кода
- ✅ Обратный отсчёт (10 минут)
- ✅ Копирование команды одной кнопкой
- ✅ Инструкция по привязке

### 2. **Статус привязки**
- ✅ Показ telegram_id и username
- ✅ Дата привязки
- ✅ Кнопка "Отвязать"

### 3. **Управление уведомлениями**
- ✅ Включение/отключение
- ✅ Toggle switch
- ✅ Визуальная индикация

---

## 🎯 API Endpoints (используются)

Страница автоматически работает с этими endpoints:

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `POST` | `/api/health/telegram/generate-link-code` | Генерация кода |
| `GET` | `/api/health/telegram/status` | Статус привязки |
| `DELETE` | `/api/health/telegram/unlink` | Отвязка |
| `GET` | `/api/health/telegram/notification-settings` | Настройки |
| `PUT` | `/api/health/telegram/notification-settings` | Обновление |

---

## 🔧 Кастомизация

### Изменить стиль кнопки

Отредактируй `src/components/HealthSettingsButton.tsx`:

```tsx
// Минималистичная версия
<button className="p-2 hover:bg-gray-100 rounded-lg">
  <Settings className="w-6 h-6" />
</button>

// Цветная версия
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
  <Settings className="w-5 h-5" />
  Настройки
</button>
```

### Изменить позицию кнопки

```tsx
// Фиксированная (правый верхний угол)
<div className="fixed top-4 right-4 z-50">
  <HealthSettingsButton />
</div>

// В шапке
<div className="flex justify-between">
  <h1>Здоровье</h1>
  <HealthSettingsButton />
</div>
```

---

## 🧪 Тестирование

### 1. Проверь навигацию

Нажми кнопку → должен открыться `/health/settings`

### 2. Проверь генерацию кода

1. Нажми "Получить код привязки"
2. Должен появиться 6-значный код
3. Таймер должен отсчитывать 10 минут

### 3. Проверь привязку

1. Скопируй команду
2. Отправь боту в Telegram
3. Статус должен измениться на "✅ Аккаунт привязан"

---

## 📚 Документация

- **[HEALTH_SETTINGS_BUTTON.md](docs/HEALTH_SETTINGS_BUTTON.md)** - Подробная инструкция
- **Backend API** - см. `FamilyBudget/docs/TELEGRAM_INTEGRATION.md`

---

## ✅ Готово!

Теперь у тебя есть:

- 🔘 Красивая кнопка настроек
- 📄 Полная страница с Telegram
- 🎨 Адаптивный дизайн
- ⚡ Готово к использованию

Просто добавь `<HealthSettingsButton />` на главную страницу! 🚀

---

<div align="center">

**Сделано с ❤️ для FamilyBudget**

</div>
