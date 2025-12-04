/**
 * API клиент для модуля "Здоровье"
 * Версия: 1.0.0
 *
 * Зависимости: config.js, api.js (базовый клиент)
 */

class HealthAPIClient {
    constructor(baseAPI) {
        if (!baseAPI) {
            throw new Error('Требуется базовый API клиент');
        }
        this.api = baseAPI;
    }

    // ============================================================================
    // ЗАПИСИ О ЗДОРОВЬЕ
    // ============================================================================

    /**
     * Создать запись о здоровье
     * @param {Object} entryData - Данные записи
     * @param {number} entryData.overall_feeling - Общее самочувствие (1-5) *обязательно*
     * @param {number|null} entryData.energy_level - Уровень энергии (1-5)
     * @param {number|null} entryData.sleep_quality - Качество сна (1-5)
     * @param {number|null} entryData.stress_level - Уровень стресса (1-5)
     * @param {string[]|null} entryData.symptoms - Массив симптомов
     * @param {string|null} entryData.notes - Заметки
     * @param {string|null} entryData.recorded_at - Дата записи (ISO 8601)
     * @returns {Promise<Object>} Созданная запись
     *
     * @example
     * const entry = await HealthAPI.createEntry({
     *   overall_feeling: 4,
     *   energy_level: 3,
     *   symptoms: ['Головная боль'],
     *   notes: 'Хороший день'
     * });
     */
    async createEntry(entryData) {
        // Валидация обязательных полей
        if (!entryData.overall_feeling || entryData.overall_feeling < 1 || entryData.overall_feeling > 5) {
            throw new Error('Поле overall_feeling обязательно и должно быть от 1 до 5');
        }

        // Формируем данные для отправки
        const payload = {
            overall_feeling: entryData.overall_feeling,
            energy_level: entryData.energy_level || null,
            sleep_quality: entryData.sleep_quality || null,
            stress_level: entryData.stress_level || null,
            symptoms: entryData.symptoms || null,
            notes: entryData.notes?.trim() || null,
            recorded_at: entryData.recorded_at || new Date().toISOString()
        };

        console.log('📝 Создание записи о здоровье:', payload);

        return this.api.post('/health/entries', payload);
    }

    /**
     * Получить историю записей о здоровье
     * @param {number} days - Количество дней для выборки (по умолчанию 30)
     * @param {number} limit - Максимальное количество записей (по умолчанию 100)
     * @returns {Promise<Array>} Массив записей
     *
     * @example
     * const entries = await HealthAPI.getEntries(7, 20); // Последние 7 дней, до 20 записей
     */
    async getEntries(days = 30, limit = 100) {
        const endpoint = `/health/entries?days=${days}&limit=${limit}`;
        console.log(`📊 Получение истории записей: ${endpoint}`);

        return this.api.get(endpoint);
    }

    /**
     * Получить последнюю запись о здоровье
     * @returns {Promise<Object|null>} Последняя запись или null, если записей нет
     *
     * @example
     * const latest = await HealthAPI.getLatestEntry();
     * if (latest) {
     *   console.log('Последняя оценка:', latest.overall_feeling);
     * }
     */
    async getLatestEntry() {
        console.log('🔍 Получение последней записи');

        try {
            return await this.api.get('/health/entries/latest');
        } catch (error) {
            // Если записей нет, API может вернуть 404
            if (error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Получить статистику по здоровью
     * @param {number} days - Период для расчёта статистики (по умолчанию 30)
     * @returns {Promise<Object>} Объект со статистикой
     *
     * Возвращаемые поля:
     * - total_entries: общее количество записей
     * - avg_overall_feeling: средняя оценка самочувствия
     * - avg_energy_level: средний уровень энергии
     * - avg_sleep_quality: среднее качество сна
     * - avg_stress_level: средний уровень стресса
     * - most_common_symptoms: самые частые симптомы
     *
     * @example
     * const stats = await HealthAPI.getStatistics(7);
     * console.log('Средняя оценка за неделю:', stats.avg_overall_feeling);
     */
    async getStatistics(days = 30) {
        const endpoint = `/health/statistics?days=${days}`;
        console.log(`📈 Получение статистики: ${endpoint}`);

        return this.api.get(endpoint);
    }

    /**
     * Обновить запись о здоровье
     * @param {number} entryId - ID записи для обновления
     * @param {Object} updates - Обновляемые поля
     * @returns {Promise<Object>} Обновлённая запись
     *
     * @example
     * await HealthAPI.updateEntry(123, {
     *   overall_feeling: 5,
     *   notes: 'Обновлённые заметки'
     * });
     */
    async updateEntry(entryId, updates) {
        if (!entryId) {
            throw new Error('ID записи обязателен');
        }

        console.log(`✏️ Обновление записи ${entryId}:`, updates);

        return this.api.put(`/health/entries/${entryId}`, updates);
    }

    /**
     * Удалить запись о здоровье
     * @param {number} entryId - ID записи для удаления
     * @returns {Promise<Object>} Результат удаления
     *
     * @example
     * await HealthAPI.deleteEntry(123);
     */
    async deleteEntry(entryId) {
        if (!entryId) {
            throw new Error('ID записи обязателен');
        }

        console.log(`🗑️ Удаление записи ${entryId}`);

        return this.api.delete(`/health/entries/${entryId}`);
    }

    // ============================================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ============================================================================

    /**
     * Проверить, есть ли запись за сегодняшний день
     * @returns {Promise<boolean>} true, если запись сегодня уже есть
     *
     * @example
     * if (await HealthAPI.hasTodayEntry()) {
     *   console.log('Вы уже оценили своё самочувствие сегодня');
     * }
     */
    async hasTodayEntry() {
        try {
            const latest = await this.getLatestEntry();

            if (!latest) return false;

            const today = new Date().toDateString();
            const latestDate = new Date(latest.recorded_at).toDateString();

            return today === latestDate;
        } catch (error) {
            console.error('Ошибка проверки сегодняшней записи:', error);
            return false;
        }
    }

    /**
     * Получить эмодзи для оценки самочувствия
     * @param {number} feeling - Оценка от 1 до 5
     * @returns {string} Эмодзи
     *
     * @example
     * const emoji = HealthAPI.getFeelingEmoji(4); // "🙂"
     */
    getFeelingEmoji(feeling) {
        const emojis = {
            1: '😢',
            2: '😕',
            3: '😐',
            4: '🙂',
            5: '😊'
        };

        return emojis[feeling] || '❓';
    }

    /**
     * Получить текстовое описание оценки
     * @param {number} feeling - Оценка от 1 до 5
     * @returns {string} Описание
     *
     * @example
     * const desc = HealthAPI.getFeelingDescription(4); // "Хорошо"
     */
    getFeelingDescription(feeling) {
        const descriptions = {
            1: 'Очень плохо',
            2: 'Плохо',
            3: 'Нормально',
            4: 'Хорошо',
            5: 'Отлично'
        };

        return descriptions[feeling] || 'Неизвестно';
    }

    /**
     * Форматировать дату записи
     * @param {string} dateString - Дата в формате ISO 8601
     * @param {boolean} includeTime - Включать ли время
     * @returns {string} Отформатированная дата
     *
     * @example
     * const date = HealthAPI.formatEntryDate('2025-12-04T10:30:00Z');
     * // "4 декабря 2025"
     */
    formatEntryDate(dateString, includeTime = false) {
        const date = new Date(dateString);

        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return date.toLocaleDateString('ru-RU', options);
    }

    /**
     * Валидировать данные записи перед отправкой
     * @param {Object} entryData - Данные записи
     * @returns {Object} Результат валидации {valid: boolean, errors: string[]}
     *
     * @example
     * const validation = HealthAPI.validateEntry(data);
     * if (!validation.valid) {
     *   console.error('Ошибки:', validation.errors);
     * }
     */
    validateEntry(entryData) {
        const errors = [];

        // Проверка обязательного поля
        if (!entryData.overall_feeling) {
            errors.push('Укажите общее самочувствие');
        } else if (entryData.overall_feeling < 1 || entryData.overall_feeling > 5) {
            errors.push('Оценка должна быть от 1 до 5');
        }

        // Проверка необязательных полей (если указаны)
        ['energy_level', 'sleep_quality', 'stress_level'].forEach(field => {
            const value = entryData[field];
            if (value !== null && value !== undefined && (value < 1 || value > 5)) {
                errors.push(`${field} должен быть от 1 до 5 или null`);
            }
        });

        // Проверка симптомов
        if (entryData.symptoms && !Array.isArray(entryData.symptoms)) {
            errors.push('Симптомы должны быть массивом строк');
        }

        // Проверка заметок
        if (entryData.notes && entryData.notes.length > 1000) {
            errors.push('Заметки не должны превышать 1000 символов');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Получить список доступных симптомов
     * @returns {string[]} Массив симптомов
     */
    getAvailableSymptoms() {
        return [
            'Головная боль',
            'Усталость',
            'Тошнота',
            'Боль в спине',
            'Бессонница',
            'Беспокойство',
            'Боль в животе',
            'Кашель',
            'Насморк',
            'Температура',
            'Головокружение',
            'Слабость',
            'Боль в мышцах',
            'Потеря аппетита'
        ];
    }
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================

// Проверяем, что базовый API загружен
if (typeof API === 'undefined') {
    console.error('❌ Базовый API не загружен! Загрузите api.js перед health-api.js');
    throw new Error('Базовый API не найден');
}

// Создаём экземпляр Health API
const HealthAPI = new HealthAPIClient(API);

// Экспортируем для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthAPI;
}

// Делаем глобально доступным
window.HealthAPI = HealthAPI;

console.log('✅ Health API клиент инициализирован v1.0.0');