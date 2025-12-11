// core/state-manager.js
const StateManager = (function() {
    let state = {
        currentTab: 'dashboard',
        userData: null,
        userGender: null,
        userOptions: null,
        medications: [],
        todayMedications: [],
        todayEntry: null,
        stats: null,
        isLoading: true,
        isOnboarding: false
    };

    const listeners = [];

    // Получить текущее состояние
    function getState() {
        return { ...state };
    }

    // Обновить состояние
    function updateState(updates) {
        const oldState = { ...state };
        state = { ...state, ...updates };

        // Уведомляем слушателей об изменениях
        notifyListeners(oldState, state, updates);

        console.log('🔄 Состояние обновлено:', updates);
        return state;
    }

    // Подписаться на изменения состояния
    function subscribe(callback) {
        listeners.push(callback);
        return () => {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
        };
    }

    // Уведомить слушателей
    function notifyListeners(oldState, newState, updates) {
        listeners.forEach(callback => {
            try {
                callback(oldState, newState, updates);
            } catch (error) {
                console.error('❌ Ошибка в слушателе состояния:', error);
            }
        });
    }

    // Сброс состояния
    function reset() {
        const oldState = { ...state };
        state = {
            currentTab: 'dashboard',
            userData: null,
            userGender: null,
            userOptions: null,
            medications: [],
            todayMedications: [],
            todayEntry: null,
            stats: null,
            isLoading: true,
            isOnboarding: false
        };
        notifyListeners(oldState, state, { reset: true });
    }

    return {
        getState,
        updateState,
        subscribe,
        reset
    };
})();

if (typeof window !== 'undefined') {
    window.StateManager = StateManager;
}