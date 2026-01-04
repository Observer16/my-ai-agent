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
        currentTimezone: 'Текущий часовой пояс',
        changeTimezone: '🔄 Изменить часовой пояс',
        timezoneDescription: 'Используется для правильного отображения дат и времени',
        timezoneChanged: 'Часовой пояс изменен',
        selectNewTimezone: 'Выберите новый часовой пояс',
        save: 'Сохранить',
        saved: 'Настройки сохранены',
        savedReload: 'Настройки сохранены. Страница будет обновлена.',
        saveChanges: 'Сохранить изменения',
        profile: 'Профиль',
        name: 'Имя',
        telegramId: 'Telegram ID',
        user: 'Пользователь',
        noFamily: 'Нет семьи',
        members: 'участников'
    },
    en: {
        title: 'Settings',
        language: 'Interface Language',
        languageDescription: 'Application interface language',
        currency: 'Currency',
        yourCurrency: 'Your currency',
        currencyDescription: 'All amounts will be displayed in selected currency',
        timezone: 'Timezone',
        currentTimezone: 'Current timezone',
        changeTimezone: '🔄 Change timezone',
        timezoneDescription: 'Used for correct display of dates and times',
        timezoneChanged: 'Timezone changed',
        selectNewTimezone: 'Select new timezone',
        save: 'Save',
        saved: 'Settings saved',
        savedReload: 'Settings saved. Page will be reloaded.',
        saveChanges: 'Save changes',
        profile: 'Profile',
        name: 'Name',
        telegramId: 'Telegram ID',
        user: 'User',
        noFamily: 'No family',
        members: 'members'
    },
    es: {
        title: 'Configuración',
        language: 'Idioma de la interfaz',
        languageDescription: 'Idioma de la interfaz de la aplicación',
        currency: 'Moneda',
        yourCurrency: 'Tu moneda',
        currencyDescription: 'Todas las cantidades se mostrarán en la moneda seleccionada',
        timezone: 'Zona horaria',
        currentTimezone: 'Zona horaria actual',
        changeTimezone: '🔄 Cambiar zona horaria',
        timezoneDescription: 'Se utiliza para mostrar correctamente fechas y horas',
        timezoneChanged: 'Zona horaria cambiada',
        selectNewTimezone: 'Seleccionar nueva zona horaria',
        save: 'Guardar',
        saved: 'Configuración guardada',
        savedReload: 'Configuración guardada. La página se recargará.',
        saveChanges: 'Guardar cambios',
        profile: 'Perfil',
        name: 'Nombre',
        telegramId: 'ID de Telegram',
        user: 'Usuario',
        noFamily: 'Sin familia',
        members: 'miembros'
    },
    uk: {
        title: 'Налаштування',
        language: 'Мова інтерфейсу',
        languageDescription: 'Мова інтерфейсу програми',
        currency: 'Валюта',
        yourCurrency: 'Ваша валюта',
        currencyDescription: 'Всі суми будуть відображатися у вибраній валюті',
        timezone: 'Часовий пояс',
        currentTimezone: 'Поточний часовий пояс',
        changeTimezone: '🔄 Змінити часовий пояс',
        timezoneDescription: 'Використовується для правильного відображення дат та часу',
        timezoneChanged: 'Часовий пояс змінено',
        selectNewTimezone: 'Виберіть новий часовий пояс',
        save: 'Зберегти',
        saved: 'Налаштування збережено',
        savedReload: 'Налаштування збережено. Сторінка буде перезавантажена.',
        saveChanges: 'Зберегти зміни',
        profile: 'Профіль',
        name: "Ім'я",
        telegramId: 'Telegram ID',
        user: 'Користувач',
        noFamily: 'Немає сім\'ї',
        members: 'учасників'
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
    },
    es: {
        welcome: '¡Bienvenido!',
        subtitle: 'Personaliza la aplicación para ti',
        selectLanguage: 'Seleccionar idioma',
        selectCurrency: 'Seleccionar moneda',
        selectTimezone: 'Seleccionar zona horaria',
        continue: 'Continuar'
    },
    uk: {
        welcome: 'Ласкаво просимо!',
        subtitle: 'Налаштуйте програму для себе',
        selectLanguage: 'Виберіть мову',
        selectCurrency: 'Виберіть валюту',
        selectTimezone: 'Виберіть часовий пояс',
        continue: 'Продовжити'
    }
});

console.log('✅ i18n/settings.js загружен');