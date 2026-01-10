/**
 * Система кэширования для API
 * Использует localStorage для хранения данных
 * 
 * Версия: 1.2.0
 */

class CacheManager {
    constructor() {
        this.prefix = 'budget_cache_';
        this.enabled = true;
        
        // TTL для разных типов данных (в секундах)
        this.ttls = {
            // Справочники (меняются редко)
            'stores': 21600,           // 6 часов
            'categories': 21600,       // 6 часов
            'products': 1800,         // 30 минут

            // Статистика (можно показать старую)
            'statistics/monthly': 21600,  // 6 часов
            'statistics': 1800,          // 30 минут

            // История и анализ (исторические данные)
            'prices/trends': 3600,    // 1 час
            'prices/compare': 1800,   // 30 минут
            'purchases/recent': 1800,  // 30 минут

            // Семья (средняя частота изменений)
            'family/members': 3600,    // 1 час
            'family/info': 3600,       // 1 час

            // ✅ ДОБАВЬ ЭТО - Фото-отзывы
            'photo-reviews': 21600,           // 6 часов - список отзывов
            'photo-reviews/photo': 86400     // 24 часа - фото (меняются редко)
        };
        
        // Не кэшировать эти endpoints
        this.nocache = [
            '/family/invites/pending',  // Нужна актуальность
            '/auth/me',                 // Может измениться
            '/auth/update-info'         // POST запрос
        ];
        
        console.log('✅ Cache Manager инициализирован');
    }
    
    /**
     * Проверить, нужно ли кэшировать endpoint
     */
    shouldCache(endpoint) {
        if (!this.enabled) return false;
        
        // Не кэшируем запрещённые endpoints
        for (const pattern of this.nocache) {
            if (endpoint.includes(pattern)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Получить TTL для endpoint
     */
    getTTL(endpoint) {
        for (const [pattern, ttl] of Object.entries(this.ttls)) {
            if (endpoint.includes(pattern)) {
                return ttl;
            }
        }
        return 300; // По умолчанию 5 минут
    }
    
    /**
     * Создать ключ кэша
     */
    createKey(endpoint, params = null) {
        let key = endpoint;
        
        // Добавляем параметры в ключ
        if (params) {
            const sortedParams = Object.keys(params)
                .sort()
                .map(k => `${k}=${params[k]}`)
                .join('&');
            key += `?${sortedParams}`;
        }
        
        return this.prefix + key;
    }
    
    /**
     * Получить данные из кэша
     */
    get(endpoint, params = null) {
        if (!this.shouldCache(endpoint)) {
            return null;
        }
        
        try {
            const key = this.createKey(endpoint, params);
            const item = localStorage.getItem(key);
            
            if (!item) {
                return null;
            }
            
            const {data, expires, cached_at} = JSON.parse(item);
            
            // Проверяем срок действия
            if (Date.now() > expires) {
                localStorage.removeItem(key);
                console.log('⏰ Кэш устарел:', endpoint);
                return null;
            }
            
            const age = Math.round((Date.now() - new Date(cached_at).getTime()) / 1000);
            console.log(`💾 Из кэша (${age}с):`, endpoint);
            
            return data;
            
        } catch (error) {
            console.error('❌ Ошибка чтения кэша:', error);
            return null;
        }
    }
    
    /**
     * Сохранить данные в кэш
     */
    set(endpoint, data, params = null, customTTL = null) {
        if (!this.shouldCache(endpoint)) {
            return false;
        }
        
        try {
            const key = this.createKey(endpoint, params);
            const ttl = customTTL || this.getTTL(endpoint);
            
            const item = {
                data,
                expires: Date.now() + (ttl * 1000),
                cached_at: new Date().toISOString(),
                endpoint,
                ttl
            };
            
            localStorage.setItem(key, JSON.stringify(item));
            console.log(`💾 В кэш (${ttl}с):`, endpoint);
            
            return true;
            
        } catch (error) {
            // localStorage переполнен - очищаем старые записи
            if (error.name === 'QuotaExceededError') {
                console.warn('⚠️ localStorage переполнен, очищаем...');
                this.cleanup();
                
                // Пробуем ещё раз
                try {
                    const key = this.createKey(endpoint, params);
                    const ttl = customTTL || this.getTTL(endpoint);
                    
                    const item = {
                        data,
                        expires: Date.now() + (ttl * 1000),
                        cached_at: new Date().toISOString(),
                        endpoint,
                        ttl
                    };
                    
                    localStorage.setItem(key, JSON.stringify(item));
                    return true;
                } catch (e) {
                    console.error('❌ Не удалось сохранить в кэш после очистки');
                    return false;
                }
            }
            
            console.error('❌ Ошибка сохранения в кэш:', error);
            return false;
        }
    }
    
    /**
     * Удалить из кэша
     */
    remove(endpoint, params = null) {
        try {
            const key = this.createKey(endpoint, params);
            localStorage.removeItem(key);
            console.log('🗑️ Удалено из кэша:', endpoint);
            return true;
        } catch (error) {
            console.error('❌ Ошибка удаления из кэша:', error);
            return false;
        }
    }
    
    /**
     * Очистить кэш по паттерну
     */
    clear(pattern = null) {
        try {
            const keys = Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix));
            
            let removed = 0;
            
            for (const key of keys) {
                if (!pattern || key.includes(pattern)) {
                    localStorage.removeItem(key);
                    removed++;
                }
            }
            
            console.log(`🗑️ Очищено записей: ${removed}`, pattern ? `(паттерн: ${pattern})` : '');
            return removed;
            
        } catch (error) {
            console.error('❌ Ошибка очистки кэша:', error);
            return 0;
        }
    }
    
    /**
     * Очистить устаревшие записи
     */
    cleanup() {
        try {
            const keys = Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix));
            
            let removed = 0;
            
            for (const key of keys) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    
                    // Удаляем устаревшие
                    if (Date.now() > item.expires) {
                        localStorage.removeItem(key);
                        removed++;
                    }
                } catch (e) {
                    // Битая запись - удаляем
                    localStorage.removeItem(key);
                    removed++;
                }
            }
            
            console.log(`🧹 Очищено устаревших записей: ${removed}`);
            return removed;
            
        } catch (error) {
            console.error('❌ Ошибка cleanup:', error);
            return 0;
        }
    }
    
    /**
     * Получить статистику кэша
     */
    getStats() {
        try {
            const keys = Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix));
            
            let totalSize = 0;
            let validCount = 0;
            let expiredCount = 0;
            
            for (const key of keys) {
                try {
                    const value = localStorage.getItem(key);
                    totalSize += value.length;
                    
                    const item = JSON.parse(value);
                    if (Date.now() > item.expires) {
                        expiredCount++;
                    } else {
                        validCount++;
                    }
                } catch (e) {
                    expiredCount++;
                }
            }
            
            return {
                total: keys.length,
                valid: validCount,
                expired: expiredCount,
                size_kb: Math.round(totalSize / 1024),
                enabled: this.enabled
            };
            
        } catch (error) {
            console.error('❌ Ошибка получения статистики:', error);
            return null;
        }
    }
    
    /**
     * Включить/выключить кэширование
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(enabled ? '✅ Кэширование включено' : '⛔ Кэширование выключено');
    }
    
    /**
     * Проверить доступность localStorage
     */
    isAvailable() {
        try {
            const test = '__cache_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Создаём глобальный экземпляр
const Cache = new CacheManager();

// Автоочистка при загрузке
Cache.cleanup();

// Экспортируем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cache;
}

window.Cache = Cache;

console.log('✅ Cache Manager готов', Cache.getStats());
