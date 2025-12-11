// core/event-manager.js
const EventManager = (function() {
    const events = new Map();

    // Подписаться на событие
    function on(eventName, callback) {
        if (!events.has(eventName)) {
            events.set(eventName, []);
        }
        events.get(eventName).push(callback);

        return () => off(eventName, callback);
    }

    // Отписаться от события
    function off(eventName, callback) {
        if (events.has(eventName)) {
            const callbacks = events.get(eventName);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // Вызвать событие
    function emit(eventName, data) {
        if (events.has(eventName)) {
            events.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Ошибка в обработчике события ${eventName}:`, error);
                }
            });
        }
    }

    // Уничтожить все обработчики события
    function destroy(eventName) {
        events.delete(eventName);
    }

    // Уничтожить все события
    function destroyAll() {
        events.clear();
    }

    return {
        on,
        off,
        emit,
        destroy,
        destroyAll
    };
})();

if (typeof window !== 'undefined') {
    window.EventManager = EventManager;
}