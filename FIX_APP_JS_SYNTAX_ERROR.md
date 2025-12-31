# ⚠️ КРИТИЧЕСКАЯ ОШИБКА В app.js

## Проблема
В файле `js/app.js` есть дублирование кода в функции `formatCurrency()`.

## Решение
Открой `js/app.js` и **удали строки 476-491**:

```javascript
    // Для сумм < 1000
    else {
        if (Number.isInteger(numAmount)) {
            return `${sign}${Math.abs(numAmount).toLocaleString('ru-RU')} ₲`;
        } else {
            // Для дробных чисел показываем 1 знак после запятой
            const absNum = Math.abs(numAmount);
            const formatted = absNum.toLocaleString('ru-RU', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            });
            return `${sign}${formatted} ₲`;
        }
    }
}
```

## Где находится
После функции `formatCurrency()` - это старый код, который должен был быть удалён.

## Правильная структура
Функция `formatCurrency()` должна заканчиваться на строке 474 закрывающей скобкой `}`.

После удаления этих строк файл загрузится без ошибок!
