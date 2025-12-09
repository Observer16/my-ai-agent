// js/health-storage.js

/**
 * Модуль для локального хранения данных здоровья
 */
const HealthStorage = (function() {
    const STORAGE_PREFIX = 'health_';
    const CACHE_TTL = 5 * 60 * 1000; // 5 минут

    /**
     * Получить ключ хранилища
     */
    function getKey(key) {
        return `${STORAGE_PREFIX}${key}`;
    }

    /**
     * Сохранить данные с timestamp
     */
    function saveWithTimestamp(key, data) {
        const storageItem = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(getKey(key), JSON.stringify(storageItem));
    }

    /**
     * Получить данные с проверкой срока
     */
    function getWithTimestamp(key) {
        const item = localStorage.getItem(getKey(key));
        if (!item) return null;

        try {
            const parsed = JSON.parse(item);

            // Проверяем срок действия
            if (Date.now() - parsed.timestamp > CACHE_TTL) {
                localStorage.removeItem(getKey(key));
                return null;
            }

            return parsed.data;
        } catch (error) {
            console.error('❌ Ошибка чтения из хранилища:', error);
            return null;
        }
    }

    // Публичные методы
    return {
        /**
         * Сохранить опции пользователя
         */
        saveUserOptions: function(options) {
            saveWithTimestamp('user_options', options);
        },

        /**
         * Получить опции пользователя
         */
        getUserOptions: function() {
            return getWithTimestamp('user_options');
        },

        /**
         * Сохранить лекарства
         */
        saveMedications: function(medications) {
            saveWithTimestamp('medications', medications);
        },

        /**
         * Получить лекарства
         */
        getMedications: function() {
            return getWithTimestamp('medications');
        },

        /**
         * Сохранить запись за дату
         */
        saveEntry: function(date, entry) {
            const key = `entry_${date}`;
            saveWithTimestamp(key, entry);
        },

        /**
         * Получить запись за дату
         */
        getEntry: function(date) {
            const key = `entry_${date}`;
            return getWithTimestamp(key);
        },

        /**
         * Сохранить статистику
         */
        saveStats: function(days, stats) {
            const key = `stats_${days}`;
            saveWithTimestamp(key, stats);
        },

        /**
         * Получить статистику
         */
        getStats: function(days) {
            const key = `stats_${days}`;
            return getWithTimestamp(key);
        },

        /**
         * Очистить кэш
         */
        clearCache: function() {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        },

        /**
         * Получить пол пользователя
         */
        getUserGender: function() {
            const item = localStorage.getItem(getKey('user_gender'));
            return item ? JSON.parse(item) : null;
        },

        /**
         * Сохранить пол пользователя
         */
        saveUserGender: function(gender) {
            localStorage.setItem(getKey('user_gender'), JSON.stringify(gender));
        },

        /**
         * Проверить, прошел ли онбординг
         */
        hasOnboardingCompleted: function() {
            return !!this.getUserGender();
        }
    };
})();

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.HealthStorage = HealthStorage;
}