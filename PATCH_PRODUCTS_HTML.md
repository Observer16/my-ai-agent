# ПАТЧ ДЛЯ products.html

Файл содержит встроенный JavaScript. Необходимо:

1. Подключить скрипты currency.js и api-extensions.js
2. Добавить инициализацию валюты
3. Заменить жёстко заданные символы валюты

## Изменение 1: Подключить скрипты (строка ~285)

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

**Найти функцию init() (строка ~298):**
```javascript
function init() {
    tg.expand();
    tg.BackButton.show();
    tg.BackButton.onClick(() => window.location.href = '../index.html');

    loadData();
    updateButtonsVisibility();
}
```

**Заменить на:**
```javascript
async function init() {
    // 🆕 Инициализация валюты
    await initCurrency();
    
    tg.expand();
    tg.BackButton.show();
    tg.BackButton.onClick(() => window.location.href = '../index.html');

    loadData();
    updateButtonsVisibility();
}
```

## Изменение 3: Символы валюты в renderProducts (строки ~554, 565, 571)

**Найти (3 вхождения):**
```javascript
<strong>${minPrice} ₲</strong>
<strong>${avgPrice} ₲</strong>
<strong>${maxPrice} ₲</strong>
```

**Заменить соответственно на:**
```javascript
<strong>${minPrice} ${getCurrencySymbol()}</strong>
<strong>${avgPrice} ${getCurrencySymbol()}</strong>
<strong>${maxPrice} ${getCurrencySymbol()}</strong>
```

## Итого: 6 изменений

- 2 строки скриптов
- 1 строка async + 1 строка initCurrency
- 3 замены символа валюты
