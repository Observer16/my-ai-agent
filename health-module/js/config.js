// health-module/js/config.js

/**
 * Конфигурация модуля здоровья
 */
const HealthConfig = (function() {
    // Пытаемся получить данные из localStorage (переданные из основного приложения)
    let savedConfig = {};
    try {
        const saved = localStorage.getItem('health_config');
        if (saved) {
            savedConfig = JSON.parse(saved);
            console.log('📂 Конфигурация загружена из localStorage:', savedConfig);
        }
    } catch (error) {
        console.warn('❌ Ошибка чтения конфигурации:', error);
    }

    // Пытаемся получить данные из основного приложения
    let parentConfig = {};
    if (window.parent && window.parent !== window) {
        try {
            if (window.parent.CONFIG) {
                parentConfig = window.parent.CONFIG;
                console.log('📂 Конфигурация загружена из родительского окна');
            }
        } catch (error) {
            console.warn('⚠️ Не удалось получить конфигурацию из родительского окна:', error);
        }
    }

    const config = {
        // API URL в порядке приоритета:
        // 1. Из localStorage (основное приложение)
        // 2. Из родительского окна
        // 3. Значение по умолчанию
        API_URL: savedConfig.API_URL ||
                parentConfig.API_URL ||
                'https://279c938840ad.ngrok-free.app',

        // Режим отладки
        DEBUG: savedConfig.DEBUG ||
               parentConfig.DEBUG ||
               window.location.search.includes('debug=true') ||
               false,

        // Версия
        VERSION: savedConfig.VERSION || parentConfig.VERSION || '1.0.0',

        // Заголовки для ngrok
        NGROK_HEADERS: savedConfig.NGROK_HEADERS || {
            'ngrok-skip-browser-warning': 'true'
        },

        // Telegram данные
        TELEGRAM_DATA: '',
        TELEGRAM_USER: null,

        // Инициализация
        init: function() {
            console.log('⚙️ Инициализация конфигурации модуля здоровья...');

            // Пробуем получить данные Telegram
            this.loadTelegramData();

            // Логируем конфигурацию
            console.log('📋 Конфигурация модуля здоровья:', {
                apiUrl: this.API_URL,
                debug: this.DEBUG,
                hasTelegramUser: !!this.TELEGRAM_USER,
                telegramUserId: this.TELEGRAM_USER?.id,
                ngrokHeaders: this.NGROK_HEADERS
            });

            return this;
        },

        // Загрузка данных Telegram
        loadTelegramData: function() {
            // Сначала пробуем использовать Telegram WebApp если доступен
            if (window.Telegram?.WebApp) {
                this.TELEGRAM_DATA = window.Telegram.WebApp.initData;
                this.TELEGRAM_USER = window.Telegram.WebApp.initDataUnsafe?.user;

                if (this.TELEGRAM_USER) {
                    console.log('✅ Telegram данные загружены из WebApp:', this.TELEGRAM_USER.id);
                    return;
                }
            }

            // Если нет WebApp, пробуем получить из localStorage
            try {
                const savedUser = localStorage.getItem('health_telegram_user');
                const savedData = localStorage.getItem('health_telegram_data');

                if (savedUser) {
                    this.TELEGRAM_USER = JSON.parse(savedUser);
                    this.TELEGRAM_DATA = savedData;
                    console.log('✅ Telegram данные загружены из localStorage:', this.TELEGRAM_USER.id);
                } else {
                    console.warn('⚠️ Telegram данные не найдены');
                }
            } catch (error) {
                console.error('❌ Ошибка загрузки Telegram данных:', error);
            }
        },

        // Получить все заголовки для запросов
        getAllHeaders: function() {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            };

            if (this.TELEGRAM_USER?.id) {
                headers['X-Telegram-User-Id'] = this.TELEGRAM_USER.id.toString();
            }

            if (this.TELEGRAM_DATA) {
                headers['X-Telegram-Init-Data'] = this.TELEGRAM_DATA;
            }

            return headers;
        },

        // Проверка конфигурации
        validate: function() {
            const errors = [];

            if (!this.API_URL) {
                errors.push('Не указан API_URL');
            }

            if (!this.TELEGRAM_USER?.id) {
                errors.push('Не найден Telegram User ID');
            }

            if (errors.length > 0) {
                console.warn('⚠️ Проблемы конфигурации:', errors);
                return false;
            }

            return true;
        }
    };

    return config.init();
})();

// Экспорт
if (typeof window !== 'undefined') {
    window.HealthConfig = HealthConfig;
}

console.log('✅ Конфигурация модуля здоровья загружена');