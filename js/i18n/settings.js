// js/i18n/settings.js - Переводы настроек

registerTranslations('settings', {
    ru: {
        title: 'Настройки',
        language: 'Язык интерфейса',
        languageDescription: 'Язык интерфейса приложения',
        currency: 'Валюта',
        yourCurrency: 'Ваша валюта',
        currencyDescription: 'Все суммы будут отображаться в выбранной валюте',
        timezone: 'Часовой пояс',
        save: 'Сохранить',
        saved: 'Настройки сохранены',
        savedReload: 'Настройки сохранены. Страница будет обновлена.',
        saveChanges: 'Сохранить изменения',
        profile: 'Профиль',
        name: 'Имя',
        telegramId: 'Telegram ID',
        user: 'Пользователь',
        noFamily: 'Нет семьи',
        members: 'участников',
        
        // Валюты
        'currency.PYG': 'Парагвайский гуарани',
        'currency.USD': 'Доллар США',
        'currency.EUR': 'Евро',
        'currency.RUB': 'Российский рубль',
        'currency.BRL': 'Бразильский реал',
        'currency.UAH': 'Украинская гривна'
    },
    en: {
        title: 'Settings',
        language: 'Interface Language',
        languageDescription: 'Application interface language',
        currency: 'Currency',
        yourCurrency: 'Your currency',
        currencyDescription: 'All amounts will be displayed in selected currency',
        timezone: 'Timezone',
        save: 'Save',
        saved: 'Settings saved',
        savedReload: 'Settings saved. Page will be reloaded.',
        saveChanges: 'Save changes',
        profile: 'Profile',
        name: 'Name',
        telegramId: 'Telegram ID',
        user: 'User',
        noFamily: 'No family',
        members: 'members',
        
        // Currencies
        'currency.PYG': 'Paraguayan Guarani',
        'currency.USD': 'US Dollar',
        'currency.EUR': 'Euro',
        'currency.RUB': 'Russian Ruble',
        'currency.BRL': 'Brazilian Real',
        'currency.UAH': 'Ukrainian Hryvnia'
    }
});

registerTranslations('initialSetup', {
    ru: {
        welcome: 'Добро пожаловать!',
        subtitle: 'Настройте приложение под себя',
        selectLanguage: 'Выберите язык',
        selectCurrency: 'Выберите валюту',
        selectTimezone: 'Выберите часовой пояс',
        continue: 'Продолжить'
    },
    en: {
        welcome: 'Welcome!',
        subtitle: 'Customize the app for yourself',
        selectLanguage: 'Select language',
        selectCurrency: 'Select currency',
        selectTimezone: 'Select timezone',
        continue: 'Continue'
    }
});

console.log('✅ i18n/settings.js загружен');
