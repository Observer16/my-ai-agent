# 🎡 TimePicker - iOS-Style Wheel Picker

Универсальный компонент для выбора времени (часы и минуты) с iOS-style колесом, инерцией и удобной прокруткой.

## 📱 Особенности

✨ **Основные возможности:**
- ✅ iOS-style wheel picker с плавной прокруткой
- ✅ Инерция при быстром движении (momentum scrolling)
- ✅ Поддержка touch (мобильные) и mouse (ПК)
- ✅ Прокрутка колеса мыши (wheel event)
- ✅ Гладкая привязка к ближайшему элементу
- ✅ Адаптивный дизайн
- ✅ Поддержка 12/24 часового формата
- ✅ Настраиваемый шаг минут (1, 5, 15, 30 мин)
- ✅ Визуальный feedback (приподнимание при зажатии)
- ✅ Доступность (ARIA, клавиатура)

---

## 🚀 Быстрый старт

### Базовый пример

```html
<!-- HTML -->
<div id="my-time-picker"></div>

<!-- JavaScript -->
<script src="health-module/components/TimePicker.js"></script>
<script>
    const picker = new TimePicker(document.getElementById('my-time-picker'), {
        initialHours: 14,
        initialMinutes: 30,
        onTimeSelect: (hours, minutes) => {
            console.log(`Выбрано: ${hours}:${minutes}`);
        }
    });
</script>
```

---

## 📖 API

### Конструктор

```javascript
const picker = new TimePicker(container, options);
```

**Параметры:**
- `container` (HTMLElement) - контейнер для пикера
- `options` (Object) - объект с опциями

### Опции

| Опция | Тип | Описание | По умолчанию |
|-------|-----|---------|-------------|
| `initialHours` | number | Начальные часы [0-23] | 12 |
| `initialMinutes` | number | Начальные минуты [0-59] | 0 |
| `hoursLabel` | string | Текст для часов | 'ч' |
| `minutesLabel` | string | Текст для минут | 'мин' |
| `format24h` | boolean | 24-часовой формат | true |
| `minuteStep` | number | Шаг минут [1, 5, 15, 30] | 1 |
| `onTimeSelect` | function | Колбэк при выборе | `() => {}` |

### Методы

#### `setTime(hours, minutes)`
Установить время программно
```javascript
picker.setTime(14, 30);
```

#### `getTime()`
Получить текущее время
```javascript
const time = picker.getTime();
// Результат: { hours: 14, minutes: 30, formatted: "14:30" }
```

#### `reset()`
Сбросить на начальное время
```javascript
picker.reset();
```

#### `destroy()`
Уничтожить компонент
```javascript
picker.destroy();
```

---

## 💡 Примеры использования

### Пример 1: Выбор времени приема лекарства

```javascript
// В модалке MedicationFormModal
const schedulePicker = new TimePicker(scheduleContainer, {
    initialHours: 9,
    initialMinutes: 0,
    format24h: true,
    minuteStep: 15,
    onTimeSelect: (hours, minutes) => {
        // Сохранить выбранное время
        formData.timeOfDay = `${hours}:${String(minutes).padStart(2, '0')}`;
    }
});

// Позже, когда нужно получить время:
const schedule = schedulePicker.getTime();
console.log(`Время приема: ${schedule.formatted}`);
```

### Пример 2: Выбор времени сна

```javascript
const sleepPicker = new TimePicker(sleepTimeContainer, {
    initialHours: 22,
    initialMinutes: 30,
    hoursLabel: 'часов',
    minutesLabel: 'минут',
    format24h: true,
    onTimeSelect: (hours, minutes) => {
        updateDiaryEntry({
            sleepTime: { hours, minutes }
        });
    }
});
```

### Пример 3: Напоминание перед приемом

```javascript
const reminderPicker = new TimePicker(reminderContainer, {
    initialHours: 0,
    initialMinutes: 15,
    hoursLabel: 'ч',
    minutesLabel: 'мин',
    minuteStep: 5,  // Шаг 5 минут
    onTimeSelect: (hours, minutes) => {
        const totalMinutes = hours * 60 + minutes;
        medication.reminderBefore = totalMinutes;
    }
});
```

---

## 🎨 Стилизация

Компонент использует встроенные стили, которые можно переопределить через CSS:

```css
/* Переопределить цвета */
.time-picker-wheel {
    background: #f5f5f5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.time-picker-item.active {
    color: #007AFF;
}

.time-picker-indicator {
    background: rgba(0, 122, 255, 0.05);
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
    .time-picker-wheel {
        background: #1a1a1a;
        color: #fff;
    }

    .time-picker-item {
        color: #999;
    }

    .time-picker-item.active {
        color: #fff;
    }
}
```

---

## 📱 Платформы

### ✅ Поддерживаемые

- **iOS Safari** - работает отлично, touch-optimized
- **Android Chrome** - работает отлично, touch-optimized
- **Chrome/Edge** - полная поддержка с mouse и wheel
- **Firefox** - полная поддержка с mouse и wheel
- **Safari (macOS)** - полная поддержка

### ⚙️ Поведение

**На мобильных:**
- Touch drag и inertia
- Оптимальный размер (70px x 180px)
- Большие элементы для точного касания

**На ПК:**
- Mouse drag и inertia
- Wheel scroll (колесо мыши)
- Ловля фокуса

---

## 🔧 Интеграция в модуль здоровья

### Добавить в WeightModal

```javascript
// В WeightModal.js
import TimePicker from '../components/TimePicker.js';

// При инициализации модали:
const timePicker = new TimePicker(document.getElementById('time-picker'), {
    initialHours: new Date().getHours(),
    initialMinutes: 0,
    onTimeSelect: (hours, minutes) => {
        this.data.time = { hours, minutes };
    }
});

// При сохранении:
const time = timePicker.getTime();
```

### Добавить в MedicationFormModal

```javascript
// В шаге расписания:
const scheduleTimePicker = new TimePicker(scheduleContainer, {
    initialHours: schedule?.hours || 9,
    initialMinutes: schedule?.minutes || 0,
    minuteStep: 5,
    onTimeSelect: (hours, minutes) => {
        this.scheduleData.time = { hours, minutes };
    }
});
```

---

## 🐛 Отладка

### Включить логирование

```javascript
const picker = new TimePicker(container, {
    onTimeSelect: (hours, minutes) => {
        console.log(`📍 Выбрано: ${hours}:${String(minutes).padStart(2, '0')}`);
    }
});

// В консоли смотреть логи:
// 📍 Выбрано: 14:30
// 📍 Выбрано: 14:31
```

### Проверить текущее время

```javascript
console.log(picker.getTime());
// { hours: 14, minutes: 30, formatted: "14:30" }
```

---

## 📊 Производительность

- **Размер компонента:** ~15 KB (не сжато)
- **Размер CSS:** Встроен в компонент
- **JavaScript:** Без зависимостей
- **Инерция:** Использует requestAnimationFrame для плавности
- **Производительность:** 60 FPS на мобильных

---

## ♿ Доступность

- Семантический HTML
- Поддержка клавиатуры (планируется расширение)
- Поддержка touch и mouse
- Визуальный feedback
- Контраст текста WCAG AA

---

## 📝 Лицензия

Часть модуля здоровья. Используется в проекте без ограничений.

---

## 🤝 Внесение изменений

Если нужно изменить компонент:

1. Отредактируй `health-module/components/TimePicker.js`
2. Протестируй в `TimePicker.example.html`
3. Обнови эту документацию
4. Сделай commit с описанием изменений

---

## 📞 Поддержка

Вопросы? Ошибки? Есть идеи улучшений?
- Проверь примеры в `TimePicker.example.html`
- Посмотри консоль браузера на ошибки
- Прочитай комментарии в исходном коде

Приятного использования! 🎉
