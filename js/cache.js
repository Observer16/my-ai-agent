/**
 * Система кэширования для API
 * Использует localStorage для хранения данных
 * 
 * Версия: 1.0.0
 */

class CacheManager {
    constructor() {
        this.prefix = 'budget_cache_';
        this.enabled = true;
        
        // TTL для разных типов данных (в секундах)
        this.ttls = {
            // Справочники (меняются редко)
            'stores': 3600,           // 1 час
            'categories': 3600,       // 1 час
            'products': 1800,         // 30 минут
            
            // Статистика (можно показать старую)
            'statistics/monthly': 600,  // 10 минут
            'statistics': 300,          // 5 минут
            
            // История и анализ (исторические данные)
            'prices/trends': 3600,    // 1 час
            'prices/compare': 1800,   // 30 минут
            'purchases/recent': 300,  // 5 минут
            
            // Семья (средняя частота изменений)
            'family/members': 600,    // 10 минут
            'family/info': 300        // 5 минут
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