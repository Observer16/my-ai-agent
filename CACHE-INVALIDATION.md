# Система инвалидации кэша

## Описание

Система автоматической очистки кэша при добавлении расходов, платежей и других операций.

## Файлы

- `js/cache-invalidator.js` - Основной класс и хелпер функции
- `js/cache.js` - Существующий менеджер кэша (используется в фоне)

## Использование

### 1. Очистить кэш расходов (Самый частый случай)

После добавления платежа, покупки или расхода:

```javascript
invalidateExpensesCache();
```

Это очистит:
- Статистику за месяц (`statistics/monthly`)
- Общую статистику (`statistics`)
- Тренды цен (`prices/trends`)
- Сравнение цен (`prices/compare`)
- Недавние покупки (`purchases/recent`)
- Список товаров (`products`)

### 2. Очистить кэш товаров

После добавления нового товара:

```javascript
invalidateProductsCache();
```

### 3. Очистить кэш магазинов

После создания нового магазина:

```javascript
invalidateStoresCache();
```

### 4. Полная очистка кэша

Ядерный вариант - очистить все:

```javascript
clearAllCache();
```

## Примеры интеграции

### В модали добавления расходов

```javascript
async function saveExpense() {
    try {
        const result = await API.saveExpense(expenseData);

        // После успешного сохранения - очищаем кэш
        invalidateExpensesCache();

        showSuccessMessage('Расход сохранён');
        closeModal();
    } catch (error) {
        showErrorMessage('Ошибка: ' + error.message);
    }
}
```

### В обработчике платежа

```javascript
async function handlePaymentSaved(paymentData) {
    console.log('Платеж сохранён:', paymentData);

    // Очищаем кэш расходов для обновления статистики
    invalidateExpensesCache();

    // Если создан новый магазин - очищаем кэш магазинов
    if (paymentData.newStoreCreated) {
        invalidateStoresCache();
    }
}
```

### При загрузке страницы бюджета

**Уже интегрировано в `budget.js`** - инвалидация происходит автоматически:

```javascript
// В функции init() автоматически вызывается:
if (typeof window.CacheInvalidator !== 'undefined') {
    window.CacheInvalidator.invalidateExpenses();
}
```

### При нажатии кнопки Refresh

**Уже интегрировано в `budget.js`** - при нажатии кнопки 🔄:

```javascript
// В setupMainButton() автоматически вызывается:
window.CacheInvalidator.invalidateExpenses();
```

## Когда вызывается инвалидация

| Операция | Функция | Место |
|----------|---------|-------|
| Загрузка страницы бюджета | `invalidateExpensesCache()` | `budget.js:init()` |
| Нажатие кнопки Refresh | `invalidateExpensesCache()` | `budget.js:setupMainButton()` |
| Добавление товара | `invalidateProductsCache()` | Можно добавить в модаль товара |
| Создание магазина | `invalidateStoresCache()` | Уже добавлено в `payments.py` |

## Логирование

Все операции логируются в консоль браузера:

```
🗑️ Инвалидируем кэш расходов...
  🗑️ Удален кэш: budget_cache_statistics/monthly
  🗑️ Удален кэш: budget_cache_statistics
  🗑️ Удален кэш: budget_cache_prices/trends
  ...
✅ Кэш расходов очищен
```

## Почему это важно?

Кэш имеет TTL (время жизни):
- `statistics/monthly`: 6 часов
- `statistics`: 30 минут
- `prices/trends`: 1 час

Без инвалидации пользователь видит старые данные до истечения TTL!

## Альтернатива

Если нужно обновить данные вручную - используйте в консоли браузера:

```javascript
// Очистить кэш расходов
invalidateExpensesCache();

// Или полная очистка
clearAllCache();
```

## Платежи из N8N

Платежи добавляются асинхронно через N8N, поэтому фронтенд не знает об этом сразу.

**Решение:** Кэш очищается при открытии страницы, поэтому:

1. Платеж добавляется через OCR/N8N в БД
2. Пользователь открывает страницу "Бюджет"
3. `init()` вызывает `invalidateExpensesCache()`
4. Кэш очищается → загружаются **свежие данные**
5. Платеж **видно на странице** ✅

---

## Тестирование

### Вариант 1: Добавить платеж через OCR

1. Отправьте платеж через OCR в Telegram
2. Откройте (или обновите) страницу "Бюджет"
3. Проверьте браузерную консоль (F12 → Console)
4. Должны увидеть логи: `🗑️ Инвалидируем кэш расходов...` и `✅ Кэш расходов очищен`
5. Платеж должен появиться в "Статистике за месяц" 🎉

### Вариант 2: Нажать кнопку Refresh

Нажмите кнопку 🔄 "Refresh" в приложении - кэш очистится сразу

### Вариант 3: Вручную очистить кэш

```javascript
// В консоли браузера (F12 → Console):
invalidateExpensesCache();
```
