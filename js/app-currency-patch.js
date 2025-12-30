// app.js - ПАТЧ для инициализации валюты
// Добавить в начало DOMContentLoaded (после строки console.log('🚀 Загрузка приложения...'))

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Загрузка приложения...');
    
    // 🆕 ИНИЦИАЛИЗАЦИЯ ВАЛЮТЫ
    await initCurrency();
    
    // Показать приветствие
    showGreeting();
    
    // ✅ ВАЖНО: Сначала обновляем информацию о пользователе
    await updateUserOnFirstLogin();
    // ... остальной код без изменений
});

// ============================================================================
// 🆕 ЗАМЕНИТЬ функцию formatCurrency() на эту версию:
// ============================================================================

/**
 * Форматировать валюту (использует динамическую валюту из currency.js)
 */
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

        // Проверяем, является ли число тысяч целым
        if (Math.abs(thousands) % 1 === 0) {
            // Целые тысячи: 1 551 000 → 1 551K
            const integerThousands = Math.abs(thousands);
            const formatted = formatNumberWithSpaces(integerThousands);
            return `${sign}${formatted}K ${getCurrencySymbol()}`;
        } else {
            // Дробные тысячи: 1 551 234 → 1 551.2K
            // Округляем до одного знака после запятой
            const rounded = Math.round(thousands * 10) / 10;

            // Разделяем на целую и дробную части
            const absRounded = Math.abs(rounded);
            const integerPart = Math.floor(absRounded);
            const fractionalPart = Math.round((absRounded - integerPart) * 10);

            const formattedInteger = formatNumberWithSpaces(integerPart);

            return `${sign}${formattedInteger}.${fractionalPart}K ${getCurrencySymbol()}`;
        }
    }
    // Для сумм < 1000
    else {
        if (Number.isInteger(numAmount)) {
            return `${sign}${Math.abs(numAmount).toLocaleString('ru-RU')} ${getCurrencySymbol()}`;
        } else {
            // Для дробных чисел показываем 1 знак после запятой
            const absNum = Math.abs(numAmount);
            const formatted = absNum.toLocaleString('ru-RU', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            });
            return `${sign}${formatted} ${getCurrencySymbol()}`;
        }
    }
}
