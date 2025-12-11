// utils/storage-helper.js
const StorageHelper = (function() {
    const PREFIX = 'health_';
    const KEYS = {
        USER_GENDER: 'user_gender',
        USER_OPTIONS: 'user_options',
        LAST_SYNC: 'last_sync',
        CACHE: 'cache_'
    };

    // Получить полное имя ключа
    function getFullKey(key) {
        return `${PREFIX}${key}`;
    }

    // Сохранить данные
    function save(key, data, options = {}) {
        try {
            const fullKey = getFullKey(key);
            const value = {
                data,
                timestamp: Date.now(),
                expires: options.expires ? Date.now() + options.expires : null,
                version: options.version || '1.0'
            };

            localStorage.setItem(fullKey, JSON.stringify(value));

            console.log(`💾 Сохранено в localStorage: ${key}`);
            EventManager.emit('storage:saved', { key, data });

            return true;
        } catch (error) {
            console.error(`❌ Ошибка сохранения ${key}:`, error);
            return false;
        }
    }

    // Загрузить данные
    function load(key) {
        try {
            const fullKey = getFullKey(key);
            const item = localStorage.getItem(fullKey);

            if (!item) {
                return null;
            }

            const parsed = JSON.parse(item);

            // Проверяем срок годности
            if (parsed.expires && Date.now() > parsed.expires) {
                console.log(`🗑️ Данные устарели: ${key}`);
                localStorage.removeItem(fullKey);
                return null;
            }

            console.log(`📂 Загружено из localStorage: ${key}`);
            EventManager.emit('storage:loaded', { key, data: parsed.data });

            return parsed.data;
        } catch (error) {
            console.error(`❌ Ошибка загрузки ${key}:`, error);
            return null;
        }
    }

    // Удалить данные
    function remove(key) {
        try {
            const fullKey = getFullKey(key);
            localStorage.removeItem(fullKey);

            console.log(`🗑️ Удалено из localStorage: ${key}`);
            EventManager.emit('storage:removed', { key });

            return true;
        } catch (error) {
            console.error(`❌ Ошибка удаления ${key}:`, error);
            return false;
        }
    }

    // Очистить все данные модуля
    function clearAll() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(PREFIX)) {
                    localStorage.removeItem(key);
                }
            });

            console.log('🗑️ Все данные модуля удалены из localStorage');
            EventManager.emit('storage:cleared');

            return true;
        } catch (error) {
            console.error('❌ Ошибка очистки localStorage:', error);
            return false;
        }
    }

    // Проверить наличие данных
    function has(key) {
        const fullKey = getFullKey(key);
        return localStorage.getItem(fullKey) !== null;
    }

    // Получить все данные модуля
    function getAll() {
        const data = {};

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(PREFIX)) {
                const itemKey = key.replace(PREFIX, '');
                data[itemKey] = load(itemKey);
            }
        });

        return data;
    }

    // Сохранить опции пользователя
    async function saveUserOptions(options) {
        return save(KEYS.USER_OPTIONS, options, { expires: 24 * 60 * 60 * 1000 }); // 24 часа
    }

    // Загрузить опции пользователя
    async function getUserOptions() {
        return load(KEYS.USER_OPTIONS);
    }

    // Сохранить кэшированные данные
    async function saveCache(key, data, ttl = 5 * 60 * 1000) { // 5 минут по умолчанию
        const cacheKey = `${KEYS.CACHE}${key}`;
        return save(cacheKey, data, { expires: ttl });
    }

    // Загрузить кэшированные данные
    async function loadCache(key) {
        const cacheKey = `${KEYS.CACHE}${key}`;
        return load(cacheKey);
    }

    // Очистить кэш
    async function clearCache() {
        Object.keys(localStorage).forEach(key => {
            if (key.includes(KEYS.CACHE)) {
                localStorage.removeItem(key);
            }
        });

        console.log('🗑️ Кэш очищен');
        EventManager.emit('storage:cacheCleared');
    }

    return {
        save,
        load,
        remove,
        clearAll,
        has,
        getAll,

        saveUserOptions,
        getUserOptions,
        saveCache,
        loadCache,
        clearCache
    };
})();

if (typeof window !== 'undefined') {
    window.StorageHelper = StorageHelper;
}