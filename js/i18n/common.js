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
    },
    es: {
        night: 'Buenas noches',
        morning: 'Buenos días',
        day: 'Buenas tardes',
        evening: 'Buenas tardes'
    },
    uk: {
        night: 'Доброї ночі',
        morning: 'Доброго ранку',
        day: 'Доброго дня',
        evening: 'Доброго вечора'
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
        no: 'Нет',
        today: 'Сегодня',
        yesterday: 'Вчера',
        next: 'Далее',
        retry: 'Повторить'
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
        no: 'No',
        today: 'Today',
        yesterday: 'Yesterday',
        next: 'Next',
        retry: 'Retry'
    },
    es: {
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        cancel: 'Cancelar',
        ok: 'OK',
        close: 'Cerrar',
        refresh: 'Actualizar',
        noData: 'Sin datos',
        inDevelopment: 'En desarrollo',
        back: 'Atrás',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        add: 'Agregar',
        search: 'Buscar',
        filter: 'Filtrar',
        all: 'Todos',
        yes: 'Sí',
        no: 'No',
        today: 'Hoy',
        yesterday: 'Ayer',
        next: 'Siguiente',
        retry: 'Reintentar'
    },
    uk: {
        loading: 'Завантаження...',
        error: 'Помилка',
        success: 'Успішно',
        cancel: 'Скасувати',
        ok: 'OK',
        close: 'Закрити',
        refresh: 'Оновити',
        noData: 'Немає даних',
        inDevelopment: 'У розробці',
        back: 'Назад',
        save: 'Зберегти',
        delete: 'Видалити',
        edit: 'Редагувати',
        add: 'Додати',
        search: 'Пошук',
        filter: 'Фільтр',
        all: 'Всі',
        yes: 'Так',
        no: 'Ні',
        today: 'Сьогодні',
        yesterday: 'Вчора',
        next: 'Далі',
        retry: 'Повторити'
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
    ],
    es: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    uk: [
        'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
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
    },
    es: {
        USD: 'Dólar Estadounidense',
        EUR: 'Euro',
        PYG: 'Guaraní Paraguayo',
        BRL: 'Real Brasileño',
        UAH: 'Grivna Ucraniana',
        RUB: 'Rublo Ruso',
    },
    uk: {
        USD: 'Долар США',
        EUR: 'Євро',
        PYG: 'Парагвайський гуарані',
        BRL: 'Бразильський реал',
        UAH: 'Українська гривня',
        RUB: 'Російський рубль'
    }
});

console.log('✅ i18n/common.js загружен');
