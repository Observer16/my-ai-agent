// health-module/js/options-cache.js
/**
 * Кэш опций пользователя с TTL (время жизни)
 */
const OptionsCache = (function() {
    const CACHE_KEY = 'health_user_options_cache';
    const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 неделя в миллисекундах

    /**
     * Сохранить опции в localStorage
     */
    function save(options) {
        const cacheData = {
            data: options,
            timestamp: Date.now(),
            ttl: CACHE_TTL_MS
        };

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            if (HealthConfig.DEBUG) {
                console.log('💾 Опции сохранены в кэш:', {
                    hasData: !!options,
                    timestamp: new Date(cacheData.timestamp).toLocaleString(),
                    ttlDays: CACHE_TTL_MS / (24 * 60 * 60 * 1000)
                });
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения в кэш:', error);
        }
    }

    /**
     * Получить опции из кэша
     */
    function get() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) {
                return null;
            }

            const cacheData = JSON.parse(cached);
            const now = Date.now();
            const isExpired = (now - cacheData.timestamp) > cacheData.ttl;

            if (isExpired) {
                if (HealthConfig.DEBUG) {
                    console.log('⏰ Кэш опций устарел:', {
                        stored: new Date(cacheData.timestamp).toLocaleString(),
                        now: new Date(now).toLocaleString(),
                        ageHours: ((now - cacheData.timestamp) / (60 * 60 * 1000)).toFixed(1)
                    });
                }
                localStorage.removeItem(CACHE_KEY);
                return null;
            }

            if (HealthConfig.DEBUG) {
                console.log('💾 Загружены опции из кэша:', {
                    timestamp: new Date(cacheData.timestamp).toLocaleString(),
                    ageHours: ((now - cacheData.timestamp) / (60 * 60 * 1000)).toFixed(1),
                    hasSexualOptions: !!cacheData.data?.sexual_activity_options
                });
            }

            return cacheData.data;
        } catch (error) {
            console.error('❌ Ошибка чтения кэша:', error);
            return null;
        }
    }

    /**
     * Очистить кэш
     */
    function clear() {
        try {
            localStorage.removeItem(CACHE_KEY);
            if (HealthConfig.DEBUG) {
                console.log('🗑️ Кэш опций очищен');
            }
        } catch (error) {
            console.error('❌ Ошибка очистки кэша:', error);
        }
    }

    /**
     * Получить опции с приоритетом кэша
     */
    async function getUserOptions() {
        // Пытаемся получить из кэша
        const cached = get();
        if (cached) {
            return {
                success: true,
                data: cached,
                source: 'cache'
            };
        }

        // Если нет в кэше или устарел - запрашиваем с сервера
        if (HealthConfig.DEBUG) {
            console.log('📡 Запрашиваем опции с сервера...');
        }

        const response = await HealthAPI.getUserOptions();

        if (response.success && response.data) {
            // Сохраняем в кэш
            save(response.data);
            response.source = 'api';
        }

        return response;
    }

    /**
     * Инвалидировать кэш (например, при смене пола)
     */
    function invalidate() {
        clear();
        if (HealthConfig.DEBUG) {
            console.log('🔄 Кэш опций инвалидирован');
        }
    }

    /**
     * Инвалидировать кэш и перезагрузить UI
     */
    async function invalidateAndReload() {
        invalidate();

        // Если Dashboard активен - перезагрузим его
        if (window.Dashboard && typeof Dashboard.init === 'function') {
            console.log('🔄 Перезагружаем Dashboard после инвалидации кэша');
            await Dashboard.init();
        }
    }

    return {
        getUserOptions,
        clear,
        invalidate,
        invalidateAndReload,
        getCurrentCache: get
    };
})();

// Экспорт
if (typeof window !== 'undefined') {
    window.OptionsCache = OptionsCache;
}