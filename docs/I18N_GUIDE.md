# Руководство по добавлению переводов на страницы

## 🌍 Как работает система переводов

Создана универсальная система i18n на базе атрибутов `data-i18n`.

### Файлы системы:
- `js/translations.js` - словарь переводов (ru/en)
- `js/i18n-page-loader.js` - автоматический загрузчик переводов

## 📝 Как добавить переводы на страницу

### Шаг 1: Подключить скрипты

Добавь в `<head>` или перед `</body>`:

```html
<script src="../js/translations.js"></script>
<script src="../js/i18n-page-loader.js"></script>
```

**Важно:** `translations.js` должен загружаться ПЕРЕД `i18n-page-loader.js`

### Шаг 2: Добавить атрибуты data-i18n

Добавь к элементам атрибут `data-i18n` с ключом перевода:

```html
<!-- Было -->
<h1>Настройки</h1>

<!-- Стало -->
<h1 data-i18n="settings.title">Настройки</h1>
```

### Примеры использования:

```html
<!-- Текст элемента (по умолчанию) -->
<div data-i18n="monthly.title">Расходы за текущий месяц</div>

<!-- Placeholder -->
<input data-i18n="common.search" data-i18n-target="placeholder" placeholder="Поиск">

<!-- Title (подсказка) -->
<button data-i18n="common.save" data-i18n-target="title" title="Сохранить">💾</button>

<!-- HTML (если нужны теги внутри) -->
<div data-i18n="actions.title" data-i18n-target="html">Быстрые действия</div>
```

## 🗂️ Структура ключей в translations.js

```javascript
const translations = {
    ru: {
        monthly: {
            title: 'Расходы за текущий месяц',
            period: 'Период',
            purchases: 'покупок'
        },
        modules: {
            health: 'Здоровье',
            healthDesc: 'Ежедневная оценка самочувствия...'
        },
        // ...
    },
    en: {
        monthly: {
            title: 'Expenses for current month',
            period: 'Period',
            purchases: 'purchases'
        },
        // ...
    }
};
```

## 📄 Какие страницы уже готовы:

- ✅ `index.html` - главная (через app-language-integration.js)
- ✅ `pages/settings.html` - настройки (через data-i18n)

## 📋 Какие страницы нужно обновить:

Для каждой страницы:

1. Подключить скрипты `translations.js` и `i18n-page-loader.js`
2. Добавить атрибуты `data-i18n` к элементам
3. При необходимости добавить новые ключи в `translations.js`

### Список страниц для обновления:

- `pages/budget.html`
- `pages/products.html`
- `pages/add-expense.html`
- `pages/monthly-stats.html`
- `pages/family.html`
- Другие страницы в `pages/`

## 🔧 Добавление новых переводов

Если нужен новый текст:

1. Открой `js/translations.js`
2. Добавь ключ в обе секции (ru и en):

```javascript
// В секции ru:
budget: {
    title: 'Бюджет',
    total: 'Всего расходов',
    // новый ключ:
    filters: 'Фильтры'
},

// В секции en:
budget: {
    title: 'Budget',
    total: 'Total expenses',
    // новый ключ:
    filters: 'Filters'
}
```

3. Используй в HTML:

```html
<h3 data-i18n="budget.filters">Фильтры</h3>
```

## 🎯 Примеры для копирования

### Базовая страница с переводами:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title data-i18n="budget.title">Бюджет</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="header">
        <h1 data-i18n="budget.title">Бюджет</h1>
    </div>
    
    <div class="module-card">
        <div class="module-title" data-i18n="budget.total">Всего расходов</div>
        <div class="amount" id="total-amount">0</div>
    </div>

    <script src="../js/config.js"></script>
    <script src="../js/translations.js"></script>
    <script src="../js/i18n-page-loader.js"></script>
    <script src="../js/your-page-logic.js"></script>
</body>
</html>
```

## ⚙️ Автоматическая работа

Файл `i18n-page-loader.js` автоматически:

1. Загружает сохраненный язык пользователя из localStorage
2. Проверяет настройки на сервере
3. Применяет переводы ко всем элементам с `data-i18n`

Не нужно ничего вызывать вручную!

## 🐛 Отладка

Проверь консоль браузера:

```
🌐 Язык из localStorage: en
✅ Применено переводов: 15
✅ i18n инициализирован, текущий язык: en
```

Если переводы не применяются:
1. Проверь порядок загрузки скриптов
2. Проверь правильность ключей в `data-i18n`
3. Убедись что ключ есть в обеих языковых секциях

## 📚 Полный пример обновления страницы

**Было (budget.html):**
```html
<div class="header">
    <h1>📊 Анализ цен</h1>
</div>
```

**Стало:**
```html
<!-- В HEAD добавляем скрипты -->
<script src="../js/translations.js"></script>
<script src="../js/i18n-page-loader.js"></script>

<!-- В BODY обновляем элементы -->
<div class="header">
    <h1>📊 <span data-i18n="actions.priceAnalysis">Анализ цен</span></h1>
</div>
```

**Добавляем в translations.js (если ключа нет):**
```javascript
actions: {
    priceAnalysis: 'Анализ цен',  // ru
    priceAnalysis: 'Price Analysis', // en
}
```

## ✅ Готово!

После этого страница автоматически будет переключать язык при изменении настроек пользователя.
