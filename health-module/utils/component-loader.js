// utils/component-loader.js
const ComponentLoader = (function() {
    const CACHE = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

    // Загрузить компонент
    async function load(componentName, useCache = true) {
        try {
            // Проверяем кэш
            if (useCache && CACHE.has(componentName)) {
                const cached = CACHE.get(componentName);
                if (Date.now() - cached.timestamp < CACHE_DURATION) {
                    console.log(`📦 Компонент из кэша: ${componentName}`);
                    return cached.html;
                }
            }

            // Загружаем с сервера
            const response = await fetch(`components/${componentName}`);

            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName}`);
            }

            const html = await response.text();

            // Сохраняем в кэш
            if (useCache) {
                CACHE.set(componentName, {
                    html,
                    timestamp: Date.now()
                });
            }

            console.log(`✅ Компонент загружен: ${componentName}`);
            return html;
        } catch (error) {
            console.error('❌ Ошибка загрузки компонента:', error);

            // Возвращаем заглушку
            return `
                <div class="health-error" style="padding: 20px; text-align: center; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                    <h3 style="margin-bottom: 10px;">Не удалось загрузить компонент</h3>
                    <p style="color: #999;">${componentName}</p>
                </div>
            `;
        }
    }

    // Очистить кэш
    function clearCache(componentName = null) {
        if (componentName) {
            CACHE.delete(componentName);
            console.log(`🗑️ Кэш очищен для: ${componentName}`);
        } else {
            CACHE.clear();
            console.log('🗑️ Весь кэш очищен');
        }
    }

    // Предзагрузка компонентов
    async function preload(components) {
        const promises = components.map(component => load(component));
        await Promise.all(promises);
        console.log(`✅ Предзагружено ${components.length} компонентов`);
    }

    return {
        load,
        clearCache,
        preload
    };
})();

if (typeof window !== 'undefined') {
    window.ComponentLoader = ComponentLoader;
}