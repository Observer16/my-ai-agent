// js/translations.js - Система переводов

const translations = {
    ru: {
        // Приветствия
        greeting: {
            night: 'Доброй ночи',
            morning: 'Доброе утро',
            day: 'Добрый день',
            evening: 'Добрый вечер'
        },
        
        // Главный экран
        home: {
            title: 'Мой AI Агент',
            subtitle: 'Умный помощник для жизни',
            welcome: 'Добро пожаловать!',
            telegramApp: 'Telegram Mini App'
        },
        
        // Месячная статистика
        monthly: {
            title: 'Расходы за текущий месяц',
            period: 'Период',
            purchases: 'покупок',
            stores: 'магазинов',
            totalSpent: 'Всего потрачено',
            byCategory: 'По категориям',
            byStore: 'По магазинам',
            topCategories: 'Топ категорий',
            topStores: 'Топ магазинов'
        },
        
        // Модули
        modules: {
            health: 'Здоровье',
            healthDesc: 'Ежедневная оценка самочувствия, трекинг симптомов и рекомендации',
            activity: 'Активность',
            activityDesc: 'Трекер тренировок, шагов и калорий с персональными планами',
            doctor: 'Медицинский консультант',
            doctorDesc: 'AI-помощник для консультаций по здоровью и первой помощи',
            available247: 'Доступен 24/7',
            today: 'сегодня',
            week: 'неделя',
            steps: 'шагов',
            workouts: 'тренировок'
        },
        
        // Быстрые действия
        actions: {
            title: 'Быстрые действия',
            addExpense: 'Добавить расход',
            management: 'Управление',
            priceAnalysis: 'Анализ цен',
            settings: 'Настройки'
        },
        
        // Семья
        family: {
            title: 'Моя семья',
            inviteTitle: 'Приглашение в семью',
            invitesYou: 'приглашает вас',
            inFamily: 'в семью',
            warning: '⚠️ Если вы уже состоите в семье, вы автоматически выйдете из неё',
            expiresIn: '⏳ Приглашение действительно ещё',
            hours: 'ч.',
            decline: '❌ Отклонить',
            accept: '✅ Принять',
            success: '✅ Успешно!',
            joined: 'Вы вступили в семью',
            solo: 'Solo',
            members: 'участников',
            familyName: 'Название семьи',
            createFamily: 'Создать семью',
            inviteMembers: 'Пригласить участников',
            leaveFamily: 'Покинуть семью',
            yourFamily: 'Ваша семья',
            noFamily: 'Нет семьи',
            inviteLink: 'Ссылка-приглашение',
            copyLink: 'Скопировать ссылку',
            linkCopied: 'Ссылка скопирована'
        },
        
        // Настройки
        settings: {
            title: 'Настройки',
            language: 'Язык интерфейса',
            currency: 'Валюта',
            timezone: 'Часовой пояс',
            save: 'Сохранить',
            saved: 'Настройки сохранены',
            profile: 'Профиль',
            name: 'Имя',
            telegramId: 'Telegram ID'
        },
        
        // Первичная настройка
        initialSetup: {
            welcome: 'Добро пожаловать!',
            subtitle: 'Настройте приложение под себя',
            selectLanguage: 'Выберите язык',
            selectCurrency: 'Выберите валюту',
            selectTimezone: 'Выберите часовой пояс',
            continue: 'Продолжить'
        },
        
        // Бюджет / Анализ цен
        budget: {
            title: 'Анализ цен',
            compareProducts: 'Сравнение товаров',
            selectProduct: 'Выберите товар',
            priceHistory: 'История цен',
            bestPrice: 'Лучшая цена',
            currentPrice: 'Текущая цена',
            averagePrice: 'Средняя цена',
            priceChange: 'Изменение цены',
            lastUpdate: 'Последнее обновление',
            store: 'Магазин',
            price: 'Цена',
            date: 'Дата',
            noPrices: 'Нет данных о ценах',
            selectToCompare: 'Выберите товар для сравнения цен'
        },
        
        // Товары
        products: {
            title: 'Управление товарами',
            allProducts: 'Все товары',
            categories: 'Категории',
            addProduct: 'Добавить товар',
            editProduct: 'Редактировать товар',
            deleteProduct: 'Удалить товар',
            productName: 'Название товара',
            category: 'Категория',
            search: 'Поиск',
            filter: 'Фильтр',
            noProducts: 'Нет товаров',
            totalProducts: 'Всего товаров',
            addCategory: 'Добавить категорию',
            categoryName: 'Название категории',
            selectCategory: 'Выберите категорию',
            allCategories: 'Все категории',
            priceComparison: 'Сравнение цен',
            viewPrices: 'Посмотреть цены',
            lastPurchase: 'Последняя покупка',
            averagePrice: 'Средняя цена',
            minPrice: 'Мин. цена',
            maxPrice: 'Макс. цена'
        },
        
        // Добавление расхода
        expense: {
            title: 'Добавить расход',
            addExpense: 'Добавить расход',
            store: 'Магазин',
            selectStore: 'Выберите магазин',
            date: 'Дата',
            time: 'Время',
            products: 'Товары',
            addProduct: 'Добавить товар',
            product: 'Товар',
            quantity: 'Количество',
            price: 'Цена',
            total: 'Итого',
            save: 'Сохранить',
            cancel: 'Отмена',
            selectProduct: 'Выберите товар',
            enterPrice: 'Введите цену',
            enterQuantity: 'Введите количество',
            remove: 'Удалить',
            expenseSaved: 'Расход сохранён',
            fillAllFields: 'Заполните все поля',
            totalAmount: 'Общая сумма',
            noProducts: 'Добавьте товары'
        },
        
        // Общие фразы
        common: {
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
        
        // Месяцы
        months: [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ]
    },
    
    en: {
        // Greetings
        greeting: {
            night: 'Good night',
            morning: 'Good morning',
            day: 'Good afternoon',
            evening: 'Good evening'
        },
        
        // Home screen
        home: {
            title: 'My AI Agent',
            subtitle: 'Smart assistant for life',
            welcome: 'Welcome!',
            telegramApp: 'Telegram Mini App'
        },
        
        // Monthly statistics
        monthly: {
            title: 'Expenses for current month',
            period: 'Period',
            purchases: 'purchases',
            stores: 'stores',
            totalSpent: 'Total spent',
            byCategory: 'By category',
            byStore: 'By store',
            topCategories: 'Top categories',
            topStores: 'Top stores'
        },
        
        // Modules
        modules: {
            health: 'Health',
            healthDesc: 'Daily wellness tracking, symptom monitoring and recommendations',
            activity: 'Activity',
            activityDesc: 'Track workouts, steps and calories with personalized plans',
            doctor: 'Medical Consultant',
            doctorDesc: 'AI assistant for health consultations and first aid',
            available247: 'Available 24/7',
            today: 'today',
            week: 'week',
            steps: 'steps',
            workouts: 'workouts'
        },
        
        // Quick actions
        actions: {
            title: 'Quick Actions',
            addExpense: 'Add Expense',
            management: 'Management',
            priceAnalysis: 'Price Analysis',
            settings: 'Settings'
        },
        
        // Family
        family: {
            title: 'My Family',
            inviteTitle: 'Family Invitation',
            invitesYou: 'invites you',
            inFamily: 'to family',
            warning: '⚠️ If you are already in a family, you will automatically leave it',
            expiresIn: '⏳ Invitation valid for',
            hours: 'h.',
            decline: '❌ Decline',
            accept: '✅ Accept',
            success: '✅ Success!',
            joined: 'You joined the family',
            solo: 'Solo',
            members: 'members',
            familyName: 'Family name',
            createFamily: 'Create family',
            inviteMembers: 'Invite members',
            leaveFamily: 'Leave family',
            yourFamily: 'Your family',
            noFamily: 'No family',
            inviteLink: 'Invite link',
            copyLink: 'Copy link',
            linkCopied: 'Link copied'
        },
        
        // Settings
        settings: {
            title: 'Settings',
            language: 'Interface Language',
            currency: 'Currency',
            timezone: 'Timezone',
            save: 'Save',
            saved: 'Settings saved',
            profile: 'Profile',
            name: 'Name',
            telegramId: 'Telegram ID'
        },
        
        // Initial setup
        initialSetup: {
            welcome: 'Welcome!',
            subtitle: 'Customize the app for yourself',
            selectLanguage: 'Select language',
            selectCurrency: 'Select currency',
            selectTimezone: 'Select timezone',
            continue: 'Continue'
        },
        
        // Budget / Price analysis
        budget: {
            title: 'Price Analysis',
            compareProducts: 'Compare products',
            selectProduct: 'Select product',
            priceHistory: 'Price history',
            bestPrice: 'Best price',
            currentPrice: 'Current price',
            averagePrice: 'Average price',
            priceChange: 'Price change',
            lastUpdate: 'Last update',
            store: 'Store',
            price: 'Price',
            date: 'Date',
            noPrices: 'No price data',
            selectToCompare: 'Select product to compare prices'
        },
        
        // Products
        products: {
            title: 'Product Management',
            allProducts: 'All products',
            categories: 'Categories',
            addProduct: 'Add product',
            editProduct: 'Edit product',
            deleteProduct: 'Delete product',
            productName: 'Product name',
            category: 'Category',
            search: 'Search',
            filter: 'Filter',
            noProducts: 'No products',
            totalProducts: 'Total products',
            addCategory: 'Add category',
            categoryName: 'Category name',
            selectCategory: 'Select category',
            allCategories: 'All categories',
            priceComparison: 'Price comparison',
            viewPrices: 'View prices',
            lastPurchase: 'Last purchase',
            averagePrice: 'Average price',
            minPrice: 'Min price',
            maxPrice: 'Max price'
        },
        
        // Add expense
        expense: {
            title: 'Add Expense',
            addExpense: 'Add expense',
            store: 'Store',
            selectStore: 'Select store',
            date: 'Date',
            time: 'Time',
            products: 'Products',
            addProduct: 'Add product',
            product: 'Product',
            quantity: 'Quantity',
            price: 'Price',
            total: 'Total',
            save: 'Save',
            cancel: 'Cancel',
            selectProduct: 'Select product',
            enterPrice: 'Enter price',
            enterQuantity: 'Enter quantity',
            remove: 'Remove',
            expenseSaved: 'Expense saved',
            fillAllFields: 'Fill all fields',
            totalAmount: 'Total amount',
            noProducts: 'Add products'
        },
        
        // Common phrases
        common: {
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
        },
        
        // Months
        months: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
    }
};

// Текущий язык (по умолчанию русский)
let currentLanguage = 'ru';

/**
 * Инициализация языка из localStorage или настроек пользователя
 */
function initLanguage() {
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    }
}

/**
 * Установить текущий язык
 */
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('preferred_language', lang);
        return true;
    }
    return false;
}

/**
 * Получить текущий язык
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Получить перевод по ключу
 * @param {string} key - Ключ перевода в формате "section.subsection.key"
 * @param {object} params - Параметры для подстановки
 */
function t(key, params = {}) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    // Проходим по вложенным ключам
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            // Если ключ не найден, возвращаем ключ как есть
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
    }
    
    // Если значение - массив, возвращаем его
    if (Array.isArray(value)) {
        return value;
    }
    
    // Если значение не строка, возвращаем ключ
    if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
    }
    
    // Подставляем параметры в строку
    let result = value;
    for (const [param, val] of Object.entries(params)) {
        result = result.replace(`{${param}}`, val);
    }
    
    return result;
}

/**
 * Получить название месяца
 */
function getMonthName(monthIndex) {
    const months = t('months');
    return months[monthIndex] || '';
}

// Инициализируем язык при загрузке
initLanguage();

console.log('✅ Translations.js загружен, текущий язык:', currentLanguage);
