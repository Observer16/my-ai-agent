// js/i18n/common.js - Общие переводы (автозагружаются на всех страницах)

registerTranslations('greeting', {
    ru: {
        night: 'Доброй ночи',
        morning: 'Доброе утро',
        day: 'Добрый день',
        evening: 'Добрый вечер'
    },
    en: {
        night: 'Good night',
        morning: 'Good morning',
        day: 'Good afternoon',
        evening: 'Good evening'
    }
});

registerTranslations('common', {
    ru: {
        loading: 'Загрузка...',
        error: 'Ошибка',
        success: 'Успешно',
        cancel: 'Отмена',
        ok: 'ОК',
        close: 'Закрыть',
        refresh: 'Обновить',
        noData: 'Нет данных',
        inDevelopment: 'В разработке',
        back: 'Назад',
        save: 'Сохранить',
        delete: 'Удалить',
        edit: 'Редактировать',
        add: 'Добавить',
        search: 'Поиск',
        filter: 'Фильтр',
        all: 'Все',
        yes: 'Да',
        no: 'Нет'
    },
    en: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        ok: 'OK',
        close: 'Close',
        refresh: 'Refresh',
        noData: 'No data',
        inDevelopment: 'In development',
        back: 'Back',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        all: 'All',
        yes: 'Yes',
        no: 'No'
    }
});

registerTranslations('months', {
    ru: [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    en: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
});

// Переводы валют
registerTranslations('currency', {
    ru: {
        USD: 'Доллар США',
        EUR: 'Евро',
        PYG: 'Парагвайский гуарани',
        BRL: 'Бразильский реал',
        UAH: 'Украинская гривна',
        RUB: 'Российский рубль'
    },
    en: {
        USD: 'US Dollar',
        EUR: 'Euro',
        PYG: 'Paraguayan Guarani',
        BRL: 'Brazilian Real',
        UAH: 'Ukrainian Hryvnia',
        RUB: 'Russian Ruble',
    }
});

console.log('✅ i18n/common.js загружен');
