// js/health-debug.js

/**
 * Утилиты отладки для модуля здоровья
 */
const HealthDebug = (function() {

    /**
     * Проверить все эндпоинты API
     */
    async function testAllEndpoints() {
        console.group('🧪 Тестирование API модуля здоровья');

        try {
            // 1. Проверка здоровья API
            console.log('1. Проверка здоровья API...');
            const healthCheck = await fetch(`${CONFIG.API_URL}/health`);
            console.log('✅ Health check:', await healthCheck.json());

            // 2. Получение информации о пользователе
            console.log('2. Получение информации о пользователе...');
            const userInfo = await HealthAPI.getUserInfo();
            console.log('✅ User info:', userInfo);

            // 3. Получение опций пользователя
            console.log('3. Получение опций пользователя...');
            const userOptions = await HealthAPI.getUserOptions();
            console.log('✅ User options:', userOptions);

            // 4. Получение лекарств на сегодня
            console.log('4. Получение лекарств на сегодня...');
            const todayMeds = await HealthAPI.getTodayMedications();
            console.log('✅ Today medications:', todayMeds);

            // 5. Получение всех лекарств
            console.log('5. Получение всех лекарств...');
            const allMeds = await HealthAPI.getMedications();
            console.log('✅ All medications:', allMeds);

            // 6. Получение записи за сегодня
            console.log('6. Получение записи за сегодня...');
            const today = getTodayLocal();
            const todayEntry = await HealthAPI.getEntryByDate(today);
            console.log('✅ Today entry:', todayEntry);

            // 7. Получение статистики
            console.log('7. Получение статистики...');
            const stats = await HealthAPI.getHealthSummary(7);
            console.log('✅ Health stats:', stats);

            console.groupEnd();
            return true;

        } catch (error) {
            console.error('❌ Ошибка тестирования:', error);
            console.groupEnd();
            return false;
        }
    }

    /**
     * Проверить структуру данных
     */
    function validateDataStructure(data, expectedType, context) {
        console.group(`🔍 Проверка структуры данных: ${context}`);

        if (!data) {
            console.warn('⚠️ Данные отсутствуют');
            console.groupEnd();
            return false;
        }

        if (expectedType === 'array' && !Array.isArray(data)) {
            console.warn('⚠️ Ожидался массив, получено:', typeof data, data);
            console.groupEnd();
            return false;
        }

        if (expectedType === 'object' && (typeof data !== 'object' || Array.isArray(data))) {
            console.warn('⚠️ Ожидался объект, получено:', typeof data, data);
            console.groupEnd();
            return false;
        }

        console.log('✅ Структура корректна:', data);
        console.groupEnd();
        return true;
    }

    /**
     * Создать тестовые данные
     */
    function createTestData() {
        return {
            userInfo: {
                id: 1,
                telegram_id: 840987266,
                username: 'test_user',
                first_name: 'Тест',
                gender: 'male'
            },
            todayMedications: [
                {
                    medication_id: 'test-med-1',
                    medication_name: 'Витамин D',
                    dosage: '1000 МЕ',
                    form: 'Капсулы',
                    time_of_day: '08:00:00',
                    status: 'pending'
                },
                {
                    medication_id: 'test-med-2',
                    medication_name: 'Омега-3',
                    dosage: '1000 мг',
                    form: 'Капсулы',
                    time_of_day: '14:00:00',
                    status: 'taken',
                    taken_time: new Date().toISOString()
                }
            ],
            todayEntry: {
                entry_date: new Date().toISOString().split('T')[0],
                mood: 'радость',
                sleep_hours: 7.5,
                weight: 70.5,
                symptoms: [
                    {
                        id: 'symp-1',
                        category: 'общее',
                        name: 'усталость',
                        intensity: 2
                    }
                ],
                notes: 'Хороший день!'
            },
            stats: {
                period_days: 7,
                entries_count: 6,
                average_sleep: 7.2,
                medication_adherence: 85.5,
                mood_distribution: {
                    'радость': 3,
                    'удовлетворение': 2,
                    'нейтрально': 1
                }
            }
        };
    }

    /**
     * Использовать тестовые данные
     */
    function useTestData() {
        console.log('🧪 Использование тестовых данных');
        const testData = createTestData();

        // Обновляем состояние модуля
        const state = HealthModule.getState();
        state.userData = testData.userInfo;
        state.todayMedications = testData.todayMedications;
        state.todayEntry = testData.todayEntry;
        state.stats = testData.stats;

        // Перерисовываем UI
        HealthModule.refreshData();

        return testData;
    }

    /**
     * Показать отладочную панель
     */
    function showDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'health-debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #333;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
            max-height: 400px;
            overflow: auto;
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>🛠 Отладка здоровья</strong>
                <button onclick="this.parentElement.parentElement.remove()" style="background: #666; color: white; border: none; padding: 2px 6px; border-radius: 3px;">✕</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <button onclick="HealthDebug.testAllEndpoints()" style="background: #4CAF50; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer;">🧪 Тест API</button>
                <button onclick="HealthDebug.useTestData()" style="background: #2196F3; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer;">🎮 Тест данные</button>
                <button onclick="console.log('State:', HealthModule.getState())" style="background: #FF9800; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer;">📊 Состояние</button>
                <button onclick="HealthStorage.clearCache()" style="background: #F44336; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer;">🗑 Очистить кэш</button>
            </div>
            <div id="debug-log" style="margin-top: 10px; font-size: 10px; max-height: 200px; overflow-y: auto;"></div>
        `;

        document.body.appendChild(panel);

        // Перехватываем console.log для отображения в панели
        const originalLog = console.log;
        console.log = function(...args) {
            originalLog.apply(console, args);
            const logDiv = document.getElementById('debug-log');
            if (logDiv) {
                const message = args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                logDiv.innerHTML += `<div style="border-bottom: 1px solid #444; padding: 2px 0;">${message}</div>`;
                logDiv.scrollTop = logDiv.scrollHeight;
            }
        };
    }

    // Публичные методы
    return {
        testAllEndpoints,
        validateDataStructure,
        createTestData,
        useTestData,
        showDebugPanel
    };
})();

// Автоматически показываем отладочную панель в режиме разработки
if (window.CONFIG && window.CONFIG.DEBUG) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => HealthDebug.showDebugPanel(), 1000);
    });
}

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.HealthDebug = HealthDebug;
}