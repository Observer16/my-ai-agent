# ПАТЧ ДЛЯ budget.html

Файл содержит встроенный JavaScript с функциями форматирования. Необходимо:

1. Подключить скрипты currency.js и api-extensions.js
2. Добавить инициализацию валюты
3. Заменить жёстко заданные символы валюты (9 вхождений)

## Изменение 1: Подключить скрипты (строка ~85)

**Найти:**
```html
<script src="../js/config.js"></script>
<script src="../js/cache.js"></script>
<script src="../js/api.js"></script>
<script>
```

**Заменить на:**
```html
<script src="../js/config.js"></script>
<script src="../js/cache.js"></script>
<script src="../js/currency.js"></script>
<script src="../js/api.js"></script>
<script src="../js/api-extensions.js"></script>
<script>
```

## Изменение 2: Инициализация валюты в функции init()

**Найти функцию init() (строка ~96):**
```javascript
async function init() {
    try {
        await loadOverview();
        await loadMonthlyBanner();
```

**Добавить в начало:**
```javascript
async function init() {
    // 🆕 Инициализация валюты
    await initCurrency();
    
    try {
        await loadOverview();
        await loadMonthlyBanner();
```

## Изменение 3: Функция renderTrends (строки 330, 332)

**Найти:**
```javascript
<span class="price-current">${t.current_price.toFixed(0)} ₲</span>
```
**Заменить на:**
```javascript
<span class="price-current">${t.current_price.toFixed(0)} ${getCurrencySymbol()}</span>
```

**Найти:**
```javascript
<span class="price-old">${t.previous_price.toFixed(0)} ₲</span>
```
**Заменить на:**
```javascript
<span class="price-old">${t.previous_price.toFixed(0)} ${getCurrencySymbol()}</span>
```

## Изменение 4: Функция formatPrice (строки 359, 365)

**Найти:**
```javascript
return num.toLocaleString('ru-RU') + ' ₲';
```
**Заменить на:**
```javascript
return num.toLocaleString('ru-RU') + ' ' + getCurrencySymbol();
```

**Найти:**
```javascript
}) + ' ₲';
```
**Заменить на:**
```javascript
}) + ' ' + getCurrencySymbol();
```

## Изменение 5: Функция formatMoney (строки 441, 447, 452, 459, 463)

**Найти 5 вхождений:**
```javascript
return '0 ₲';                                          // строка 441
return `${millions}M ₲`;                               // строка 447
return `${thousands}K ₲`;                              // строка 452
return `${numAmount.toLocaleString('ru-RU')} ₲`;       // строка 459
return `${numAmount.toFixed(2).replace('.', ',')} ₲`;  // строка 463
```

**Заменить соответственно на:**
```javascript
return `0 ${getCurrencySymbol()}`;
return `${millions}M ${getCurrencySymbol()}`;
return `${thousands}K ${getCurrencySymbol()}`;
return `${numAmount.toLocaleString('ru-RU')} ${getCurrencySymbol()}`;
return `${numAmount.toFixed(2).replace('.', ',')} ${getCurrencySymbol()}`;
```

## Итого: 12 изменений

- 2 строки скриптов
- 1 строка await initCurrency()
- 9 замен символа валюты в функциях formatPrice и formatMoney
