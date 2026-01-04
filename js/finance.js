// Страница Финансы
const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('💰 Загрузка страницы финансов...');
    
    tg.ready();
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        window.location.href = '../index.html';
    });

    await initCurrency();
    await loadMonthlyStats();
});

/**
 * Загрузка месячной статистики
 */
async function loadMonthlyStats() {
    try {
        const stats = await API.getMonthlyStatistics();

        safeSetText('monthly-total', formatCurrency(stats.summary.total_spent));

        const now = new Date();
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                           'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        safeSetText('monthly-period', monthNames[now.getMonth()]);

        safeSetText('monthly-purchases', stats.summary.total_purchases);

    } catch (error) {
        console.error('Ошибка загрузки месячной статистики:', error);
        safeSetText('monthly-total', 'Ошибка');
        safeSetText('monthly-period', '-');
        safeSetText('monthly-purchases', '-');
    }
}

/**
 * Открыть модуль
 */
function openModule(moduleName) {
    tg.HapticFeedback.impactOccurred('light');

    const modulePages = {
        'budget': 'budget.html',
        'products': 'products.html',
        'add-expense': 'add-expense.html'
    };

    const page = modulePages[moduleName];
    if (page) {
        window.location.href = page;
    } else {
        tg.showAlert('Модуль в разработке');
    }
}

/**
 * Форматировать валюту
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

function formatNumberWithSpaces(number) {
    if (number == null || isNaN(number)) return '0';

    const numStr = Math.abs(Math.floor(number)).toString();
    let result = '';

    for (let i = numStr.length - 1, count = 0; i >= 0; i--) {
        result = numStr[i] + result;
        count++;

        if (count % 3 === 0 && i !== 0) {
            result = ' ' + result;
        }
    }

    return number < 0 ? '-' + result : result;
}

function safeSetText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = text;
    }
}

console.log('✅ Finance.js загружен');
