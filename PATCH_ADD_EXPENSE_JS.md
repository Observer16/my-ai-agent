# ПАТЧ ДЛЯ add-expense.js

Необходимо заменить жёстко заданные символы валюты на динамические.

## Изменение 1: Добавить инициализацию валюты

**Найти функцию `init()` (строка ~35):**
```javascript
async function init() {
    try {
        stores = await API.getStores();
```

**Добавить в начало функции:**
```javascript
async function init() {
    // 🆕 Инициализация валюты
    await initCurrency();
    
    try {
        stores = await API.getStores();
```

## Изменение 2: Функция renderProductResults (строка ~131)

**Найти:**
```javascript
${p.min_price ? ` • ${p.min_price}-${p.max_price} ₲` : ''}
```

**Заменить на:**
```javascript
${p.min_price ? ` • ${p.min_price}-${p.max_price} ${getCurrencySymbol()}` : ''}
```

## Изменение 3: Функция updateSummary (строки ~724-727)

**Найти:**
```javascript
document.getElementById('summary-total').textContent = totalAmount > 0 ?
    `${Math.round(totalAmount).toLocaleString('ru-RU')} ₲` : '0 ₲';
```

**Заменить на:**
```javascript
document.getElementById('summary-total').textContent = totalAmount > 0 ?
    `${Math.round(totalAmount).toLocaleString('ru-RU')} ${getCurrencySymbol()}` : `0 ${getCurrencySymbol()}`;
```

## Итого: 3 изменения

После применения патча валюта на странице "Добавить расход" будет динамической!
