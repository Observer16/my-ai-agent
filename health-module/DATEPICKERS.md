# 📅 DatePicker & DayPicker - Компоненты для выбора даты

Два универсальных компонента для удобного выбора даты:

1. **DatePicker** - Всплывающий календарь (традиционный способ)
2. **DayPicker** - iOS-style wheel picker с колесиками день/месяц/год

---

## 📱 Особенности

### DatePicker ✨

- ✅ Классический календарь с навигацией по месяцам
- ✅ Селекты для быстрого выбора месяца и года
- ✅ Выделение сегодняшней даты и выбранной даты
- ✅ Ограничение доступных дат (minDate, maxDate)
- ✅ Поддержка всех браузеров
- ✅ Адаптивный дизайн для мобильных
- ✅ Кнопки Отмена и Выбрать

### DayPicker ✨

- ✅ iOS-style wheel picker с инерцией
- ✅ Три независимых колеса: День, Месяц, Год
- ✅ Momentum scrolling с плавной инерцией
- ✅ Поддержка touch (мобильные) и mouse (ПК)
- ✅ Прокрутка колеса мыши (wheel event)
- ✅ Автоматическая корректировка дней при смене месяца
- ✅ 60 FPS производительность
- ✅ Адаптивный размер на мобильных

---

## 🚀 Быстрый старт

### DatePicker - Календарь

```html
<!-- HTML -->
<div id="my-date-picker"></div>

<!-- JavaScript -->
<script src="health-module/components/DatePicker.js"></script>
<script>
    const picker = new DatePicker(document.getElementById('my-date-picker'), {
        initialDate: '2026-01-18',
        minDate: '2020-01-01',
        maxDate: '2030-12-31',
        onDateSelect: (dateString) => {
            console.log(`Выбрана дата: ${dateString}`); // "2026-01-18"
        },
        onCancel: () => {
            console.log('Отменено');
        }
    });
</script>
```

### DayPicker - Колесики

```html
<!-- HTML -->
<div id="my-day-picker"></div>

<!-- JavaScript -->
<script src="health-module/components/DayPicker.js"></script>
<script>
    const picker = new DayPicker(document.getElementById('my-day-picker'), {
        initialDate: '2026-01-18',
        onDateSelect: (dateString) => {
            console.log(`Дата: ${dateString}`); // "2026-01-18"
        }
    });
</script>
```

---

## 📖 API - DatePicker

### Конструктор

```javascript
const picker = new DatePicker(container, options);
```

**Параметры:**
- `container` (HTMLElement) - контейнер для календаря
- `options` (Object) - опции

### Опции DatePicker

| Опция | Тип | Описание | По умолчанию |
|-------|-----|---------|----------------|
| `initialDate` | string | Начальная дата (YYYY-MM-DD) | Сегодня |
| `minDate` | string | Минимальная дата (YYYY-MM-DD) | null |
| `maxDate` | string | Максимальная дата (YYYY-MM-DD) | null |
| `onDateSelect` | function | Колбэк при выборе даты | `() => {}` |
| `onCancel` | function | Колбэк при отмене | `() => {}` |

### Методы DatePicker

#### `setDate(dateString)`
Установить дату программно
```javascript
picker.setDate('2026-01-20');
```

#### `getDate()`
Получить выбранную дату
```javascript
const date = picker.getDate();
// Результат: "2026-01-18"
```

#### `previousMonth()`
Перейти на предыдущий месяц
```javascript
picker.previousMonth();
```

#### `nextMonth()`
Перейти на следующий месяц
```javascript
picker.nextMonth();
```

#### `destroy()`
Уничтожить компонент
```javascript
picker.destroy();
```

---

## 📖 API - DayPicker

### Конструктор

```javascript
const picker = new DayPicker(container, options);
```

**Параметры:**
- `container` (HTMLElement) - контейнер для пикера
- `options` (Object) - опции

### Опции DayPicker

| Опция | Тип | Описание | По умолчанию |
|-------|-----|---------|----------------|
| `initialDate` | string | Начальная дата (YYYY-MM-DD) | Сегодня |
| `onDateSelect` | function | Колбэк при выборе даты | `() => {}` |
| `minDate` | string | Минимальная дата (YYYY-MM-DD) | null |
| `maxDate` | string | Максимальная дата (YYYY-MM-DD) | null |
| `format` | string | Формат даты (не используется пока) | DD.MM.YYYY |

### Методы DayPicker

#### `setDate(dateString)`
Установить дату программно
```javascript
picker.setDate('2026-01-20');
```

#### `getDate()`
Получить текущую дату
```javascript
const date = picker.getDate();
// Результат: "2026-01-18"
```

#### `destroy()`
Уничтожить компонент
```javascript
picker.destroy();
```

---

## 💡 Примеры использования

### Пример 1: Выбор даты начала приёма лекарства (DatePicker)

```javascript
const startDatePicker = new DatePicker(
    document.getElementById('start-date-container'),
    {
        initialDate: new Date().toISOString().split('T')[0],
        minDate: '2020-01-01',
        onDateSelect: (date) => {
            formData.start_date = date;
            console.log('Дата начала:', date);
        }
    }
);
```

### Пример 2: Выбор даты измерения веса (DayPicker)

```javascript
const weightDatePicker = new DayPicker(
    document.getElementById('weight-date-container'),
    {
        initialDate: '2026-01-18',
        onDateSelect: (date) => {
            formData.measurement_date = date;
            console.log('Дата измерения:', date);
        }
    }
);
```

### Пример 3: Выбор диапазона дат (две DatePicker)

```javascript
const fromDatePicker = new DatePicker(
    document.getElementById('from-date'),
    {
        initialDate: '2026-01-01',
        onDateSelect: (date) => {
            filterData.fromDate = date;
            updateChart();
        }
    }
);

const toDatePicker = new DatePicker(
    document.getElementById('to-date'),
    {
        initialDate: '2026-01-31',
        onDateSelect: (date) => {
            filterData.toDate = date;
            updateChart();
        }
    }
);
```

---

## 🎨 Стилизация

Оба компонента используют встроенные стили, которые можно переопределить через CSS:

### DatePicker

```css
/* Переопределить цвета календаря */
.date-picker-wrapper {
    background: white;
    border-radius: 16px;
}

.date-day.selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.date-day.today {
    border: 2px solid #007AFF;
    color: #007AFF;
}

.date-day:hover:not(.disabled):not(.other-month) {
    background: #f0f0f0;
    border-color: #007AFF;
}
```

### DayPicker

```css
/* Переопределить цвета колесиков */
.day-picker-wheel {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.day-picker-item.active {
    color: #333;
    font-weight: 700;
}

.day-picker-indicator {
    background: rgba(52, 152, 219, 0.05);
}
```

---

## 📱 Платформы

### DatePicker ✅

- iOS Safari - работает отлично
- Android Chrome - работает отлично
- Chrome/Edge - полная поддержка
- Firefox - полная поддержка
- Safari (macOS) - полная поддержка

### DayPicker ✅

- **На мобильных:**
  - Touch drag и inertia
  - Оптимальный размер (70px x 180px)
  - Отличная производительность 60 FPS

- **На ПК:**
  - Mouse drag и inertia
  - Wheel scroll (колесо мыши)
  - Ловля фокуса

---

## 🔧 Интеграция в модуль здоровья

### Использовать DatePicker для start_date/end_date

```javascript
// В MedicationFormModal.js
const startDatePicker = new DatePicker(
    document.getElementById('start-date-picker'),
    {
        initialDate: formData.start_date,
        onDateSelect: (date) => {
            formData.start_date = date;
        }
    }
);
```

### Использовать DayPicker в WeightModal

```javascript
// В WeightModal.js
const weightDatePicker = new DayPicker(
    document.getElementById('weight-date-picker'),
    {
        initialDate: new Date().toISOString().split('T')[0],
        onDateSelect: (date) => {
            formData.measurement_date = date;
        }
    }
);
```

---

## 🐛 Отладка

### Включить логирование

```javascript
const picker = new DatePicker(container, {
    onDateSelect: (date) => {
        console.log(`📅 Дата выбрана: ${date}`);
    }
});

// Или для DayPicker
const dayPicker = new DayPicker(container, {
    onDateSelect: (date) => {
        console.log(`📅 День выбран: ${date}`);
    }
});
```

### Проверить текущую дату

```javascript
console.log(picker.getDate());
// DatePicker: "2026-01-18"

console.log(dayPicker.getDate());
// DayPicker: "2026-01-18"
```

### Установить дату программно

```javascript
// DatePicker
picker.setDate('2026-02-15');

// DayPicker
dayPicker.setDate('2026-02-15');
```

---

## 📊 Производительность

- **Размер DatePicker:** ~12 KB (не сжато)
- **Размер DayPicker:** ~18 KB (не сжато)
- **CSS:** Встроены в компоненты
- **JavaScript:** Без зависимостей
- **DayPicker инерция:** Использует requestAnimationFrame
- **Производительность:** 60 FPS на мобильных

---

## ♿ Доступность

- Семантический HTML
- Кнопки навигации (DatePicker)
- Поддержка touch и mouse
- Визуальный feedback
- Контраст текста WCAG AA

---

## 🤝 Сравнение

| Фиче | DatePicker | DayPicker |
|------|-----------|----------|
| Тип выбора | Календарь | Колесики |
| Навигация по месяцам | ✅ | ❌ |
| Кнопки действия | ✅ | ❌ |
| Инерция скролла | ❌ | ✅ |
| Touch drag | ❌ | ✅ |
| Wheel scroll | ❌ | ✅ |
| Размер на мобильных | Большой | Компактный |
| Удобство | Знакомый интерфейс | Быстрый выбор |

---

## 📝 Лицензия

Часть модуля здоровья. Используется в проекте без ограничений.

---

## 🤝 Внесение изменений

Если нужно изменить компоненты:

1. Отредактируй `health-module/components/DatePicker.js` или `DayPicker.js`
2. Протестируй в `DatePicker.example.html` или `DayPicker.example.html` (см. примеры ниже)
3. Обнови эту документацию
4. Сделай commit с описанием изменений

---

## 📞 Поддержка

Вопросы? Ошибки? Есть идеи улучшений?
- Проверь консоль браузера на ошибки
- Смотри примеры использования выше
- Читай комментарии в исходном коде
- Проверь что оба компонента загружены в index.html

Приятного использования! 📅
