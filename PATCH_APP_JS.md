# ИНСТРУКЦИЯ ПО ПРИМЕНЕНИЮ ПАТЧА К app.js

## Изменение 1: Добавить инициализацию валюты

**Найти строку 11:**
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Загрузка приложения...');
    
    // Показать приветствие
    showGreeting();
```

**Заменить на:**
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Загрузка приложения...');
    
    // 🆕 ИНИЦИАЛИЗАЦИЯ ВАЛЮТЫ
    await initCurrency();
    
    // Показать приветствие
    showGreeting();
```

## Изменение 2: Обновить функцию formatCurrency

**Найти функцию (строка ~441):**
```javascript
function formatCurrency(amount) {
    if (amount == null || isNaN(amount)) return '0 ₲';
```

**Заменить ВСЮ функцию на:**
```javascript
function formatCurrency(amount) {
    if (amount == null || isNaN(amount)) {
        return `0 ${getCurrencySymbol()}`;
    }

    const numAmount = Number(amount);
    if (numAmount === 0) {
        return `0 ${getCurrencySymbol()}`;
    }

    const absAmount = Math.abs(numAmount);
    const sign = numAmount < 0 ? '-' : '';

    // Для сумм >= 1000 всегда используем K (тысячи)
    if (absAmount >= 1000) {
        const thousands = numAmount / 1000;

        if (Math.abs(thousands) % 1 === 0) {
            const integerThousands = Math.abs(thousands);
            const formatted = formatNumberWithSpaces(integerThousands);
            return `${sign}${formatted}K ${getCurrencySymbol()}`;
        } else {
            const rounded = Math.round(thousands * 10) / 10;
            const absRounded = Math.abs(rounded);
            const integerPart = Math.floor(absRounded);
            const fractionalPart = Math.round((absRounded - integerPart) * 10);
            const formattedInteger = formatNumberWithSpaces(integerPart);
            return `${sign}${formattedInteger}.${fractionalPart}K ${getCurrencySymbol()}`;
        }
    } else {
        if (Number.isInteger(numAmount)) {
            return `${sign}${Math.abs(numAmount).toLocaleString('ru-RU')} ${getCurrencySymbol()}`;
        } else {
            const absNum = Math.abs(numAmount);
            const formatted = absNum.toLocaleString('ru-RU', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            });
            return `${sign}${formatted} ${getCurrencySymbol()}`;
        }
    }
}
```

## Что изменилось:
1. Добавлена строка `await initCurrency();` для загрузки валюты при старте
2. Все `₲` заменены на `${getCurrencySymbol()}` - теперь символ валюты динамический

После применения изменений приложение будет использовать валюту из настроек!
