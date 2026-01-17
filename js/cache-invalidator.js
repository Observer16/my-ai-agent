/**
 * Менеджер инвалидации кэша
 * Очищает кэш после операций (сохранение расходов, платежей и т.д.)
 *
 * Версия: 1.0.0
 */

class CacheInvalidator {
    constructor() {
        this.cache = typeof window.Cache !== 'undefined' ? window.Cache : null;
        console.log('✅ Cache Invalidator инициализирован');
    }

    /**
     * Очистить кэш расходов после сохранения платежа или покупки
     * Удаляет все связанные с расходами и статистикой кэши
     */
    invalidateExpenses() {
        const keysToInvalidate = [
            'statistics/monthly',      // Статистика за месяц
            'statistics',              // Общая статистика
            'prices/trends',           // Тренды цен
            'prices/compare',          // Сравнение цен
            'purchases/recent',        // Недавние покупки
            'products'                 // Список товаров
        ];

        console.log('🗑️ Инвалидируем кэш расходов...');
        keysToInvalidate.forEach(key => this.clearCacheKey(key));
        console.log('✅ Кэш расходов очищен');
    }

    /**
     * Очистить конкретный ключ из кэша
     * @param {string} key - Ключ для удаления из кэша
     */
    clearCacheKey(key) {
        if (!this.cache) {
            console.warn('⚠️ Cache Manager не доступен');
            return;
        }

        // Удаляем все ключи которые содержат этот паттерн
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(storageKey => {
            if (storageKey.includes(this.cache.prefix) && storageKey.includes(key)) {
                localStorage.removeItem(storageKey);
                console.debug(`  🗑️ Удален кэш: ${storageKey}`);
            }
        });
    }

    /**
     * Очистить кэш товаров
     * Используется после добавления нового товара
     */
    invalidateProducts() {
        console.log('🗑️ Инвалидируем кэш товаров...');
        this.clearCacheKey('products');
        console.log('✅ Кэш товаров очищен');
    }

    /**
     * Очистить кэш магазинов
     * Используется после создания нового магазина
     */
    invalidateStores() {
        console.log('🗑️ Инвалидируем кэш магазинов...');
        this.clearCacheKey('stores');
        console.log('✅ Кэш магазинов очищен');
    }

    /**
     * Очистить кэш категорий
     * Используется после изменения категорий
     */
    invalidateCategories() {
        console.log('🗑️ Инвалидируем кэш категорий...');
        this.clearCacheKey('categories');
        console.log('✅ Кэш категорий очищен');
    }

    /**
     * Полная очистка кэша
     * Используется для сброса всех данных
     */
    clearAllCache() {
        console.log('🗑️ Полная очистка кэша...');
        localStorage.clear();
        console.log('✅ Весь кэш очищен');
    }

    /**
     * Очистить кэш отзывов
     * Используется после загрузки новых фото-отзывов
     */
    invalidatePhotoReviews() {
        console.log('🗑️ Инвалидируем кэш фото-отзывов...');
        this.clearCacheKey('photo-reviews');
        console.log('✅ Кэш фото-отзывов очищен');
    }
}

// Создаём глобальный экземпляр
window.CacheInvalidator = new CacheInvalidator();

/**
 * Хелпер функции для быстрой инвалидации кэша
 * Удобно использовать в обработчиках событий
 */

/**
 * Очистить кэш расходов (после добавления платежа, покупки и т.д.)
 */
function invalidateExpensesCache() {
    if (typeof window.CacheInvalidator !== 'undefined') {
        window.CacheInvalidator.invalidateExpenses();
    }
}

/**
 * Очистить кэш товаров (после добавления нового товара)
 */
function invalidateProductsCache() {
    if (typeof window.CacheInvalidator !== 'undefined') {
        window.CacheInvalidator.invalidateProducts();
    }
}

/**
 * Очистить кэш магазинов (после добавления нового магазина)
 */
function invalidateStoresCache() {
    if (typeof window.CacheInvalidator !== 'undefined') {
        window.CacheInvalidator.invalidateStores();
    }
}

/**
 * Очистить весь кэш (ядерный вариант)
 */
function clearAllCache() {
    if (typeof window.CacheInvalidator !== 'undefined') {
        window.CacheInvalidator.clearAllCache();
    }
}
