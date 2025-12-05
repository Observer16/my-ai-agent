/**
 * API клиент для модуля "Здоровье"
 * Версия: 2.1.0 - Синхронизация с актуальным OpenAPI
 */

class HealthAPIClient {
    constructor(baseAPI) {
        if (!baseAPI) {
            throw new Error('Требуется базовый API клиент');
        }
        this.api = baseAPI;
        this.initMinimalProfile();
    }

    // ============================================================================
    // ГЕНДЕР (БЕЗ ИЗМЕНЕНИЙ)
    // ============================================================================

    initMinimalProfile() {
        const gender = this.getGender();
        if (!gender) {
            console.log('ℹ️ Гендер не установлен. Пользователь увидит форму выбора.');
        }
    }

    getGender() {
        try {
            return localStorage.getItem('health_gender');
        } catch (error) {
            console.error('Ошибка чтения гендера:', error);
            return null;
        }
    }

    setGender(gender) {
        if (!['male', 'female', 'other'].includes(gender)) {
            console.error('Неверное значение гендера:', gender);
            return false;
        }
        try {
            localStorage.setItem('health_gender', gender);
            console.log('✅ Гендер установлен:', gender);
            return true;
        } catch (error) {
            console.error('❌ Ошибка установки гендера:', error);
            return false;
        }
    }

    isGenderSet() {
        return this.getGender() !== null;
    }

    getGenderIcon(gender) {
        const icons = { 'male': '♂️', 'female': '♀️', 'other': '⚧️' };
        return icons[gender] || '❓';
    }

    getGenderName(gender) {
        const names = { 'male': 'Мужской', 'female': 'Женский', 'other': 'Другой' };
        return names[gender] || 'Не указан';
    }

    getGenderSpecificSymptoms() {
        const gender = this.getGender();

        const commonSymptoms = [
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

        if (gender === 'female') {
            return [
                ...commonSymptoms,
                'Менструальные боли',
                'ПМС',
                'Нерегулярный цикл',
                'Тяжесть в груди',
                'Приливы',
                'Перепады настроения'
            ];
        } else if (gender === 'male') {
            return [...commonSymptoms, 'Боль в области паха'];
        }

        return commonSymptoms;
    }

    // ============================================================================
    // ЗАГЛУШКА ДЛЯ БУДУЩЕГО API ПРОФИЛЯ
    // ============================================================================

    async getFullProfile() {
        console.warn('⚠️ ЗАГЛУШКА: API для полного профиля ещё не реализован');
        return {
            gender: this.getGender(),
            message: 'Полный профиль будет доступен после добавления API endpoint'
        };
    }

    async updateFullProfile(profileData) {
        console.warn('⚠️ ЗАГЛУШКА: API для обновления профиля ещё не реализован');
        if (profileData.gender) {
            this.setGender(profileData.gender);
        }
        return {
            success: true,
            message: 'Гендер сохранён локально. Полный профиль будет доступен после добавления API'
        };
    }

    // ============================================================================
    // ЗАПИСИ О ЗДОРОВЬЕ (ОБНОВЛЕНО СОГЛАСНО OpenAPI)
    // ============================================================================

    /**
     * Создать запись о здоровье
     * @param {Object} entryData - HealthEntryCreate
     * @returns {Promise<HealthEntry>}
     */
    async createEntry(entryData) {
        // Валидация согласно HealthEntryCreate
        if (!entryData.overall_feeling ||
            entryData.overall_feeling < 1 ||
            entryData.overall_feeling > 5) {
            throw new Error('Поле overall_feeling обязательно и должно быть от 1 до 5');
        }

        // Формируем payload согласно схеме
        const payload = {
            overall_feeling: entryData.overall_feeling,
            energy_level: entryData.energy_level !== undefined ? entryData.energy_level : null,
            sleep_quality: entryData.sleep_quality !== undefined ? entryData.sleep_quality : null,
            stress_level: entryData.stress_level !== undefined ? entryData.stress_level : null,
            symptoms: entryData.symptoms && entryData.symptoms.length > 0 ? entryData.symptoms : null,
            notes: entryData.notes?.trim() || null,
            recorded_at: entryData.recorded_at || null  // Если null, сервер установит текущее время
        };

        console.log('📝 POST /health/entries:', payload);
        return this.api.post('/health/entries', payload);
    }

    /**
     * Получить историю записей
     * @param {number} days - Количество дней (default: 30)
     * @param {number} limit - Максимум записей (default: 100)
     * @returns {Promise<HealthEntry[]>}
     */
    async getEntries(days = 30, limit = 100) {
        const endpoint = `/health/entries?days=${days}&limit=${limit}`;
        console.log(`📊 GET ${endpoint}`);
        return this.api.get(endpoint);
    }

    /**
     * ✅ НОВОЕ: Получить одну запись по ID
     * @param {number} entryId - ID записи
     * @returns {Promise<HealthEntry>}
     */
    async getEntry(entryId) {
        if (!entryId) {
            throw new Error('ID записи обязателен');
        }
        console.log(`🔍 GET /health/entries/${entryId}`);
        return this.api.get(`/health/entries/${entryId}`);
    }

    /**
     * Получить последнюю запись
     * @returns {Promise<HealthEntry | null>}
     */
    async getLatestEntry() {
        console.log('🔍 GET /health/entries/latest');
        try {
            const result = await this.api.get('/health/entries/latest');
            // Если записей нет, сервер может вернуть null или пустой объект
            return result || null;
        } catch (error) {
            if (error.message.includes('404') || error.message.includes('not found')) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Получить статистику
     * @param {number} days - Период в днях (default: 30)
     * @returns {Promise<HealthStatistics>}
     */
    async getStatistics(days = 30) {
        const endpoint = `/health/statistics?days=${days}`;
        console.log(`📈 GET ${endpoint}`);
        return this.api.get(endpoint);
    }

    /**
     * Обновить запись
     * @param {number} entryId - ID записи
     * @param {Object} updates - HealthEntryUpdate (все поля опциональны)
     * @returns {Promise<HealthEntry>}
     */
    async updateEntry(entryId, updates) {
        if (!entryId) {
            throw new Error('ID записи обязателен');
        }

        // Формируем payload согласно HealthEntryUpdate
        const payload = {};

        if (updates.overall_feeling !== undefined) {
            payload.overall_feeling = updates.overall_feeling;
        }
        if (updates.energy_level !== undefined) {
            payload.energy_level = updates.energy_level;
        }
        if (updates.sleep_quality !== undefined) {
            payload.sleep_quality = updates.sleep_quality;
        }
        if (updates.stress_level !== undefined) {
            payload.stress_level = updates.stress_level;
        }
        if (updates.symptoms !== undefined) {
            payload.symptoms = updates.symptoms && updates.symptoms.length > 0 ? updates.symptoms : null;
        }
        if (updates.notes !== undefined) {
            payload.notes = updates.notes?.trim() || null;
        }
        if (updates.recorded_at !== undefined) {
            payload.recorded_at = updates.recorded_at;
        }

        console.log(`✏️ PUT /health/entries/${entryId}:`, payload);
        return this.api.put(`/health/entries/${entryId}`, payload);
    }

    /**
     * Удалить запись
     * @param {number} entryId - ID записи
     * @returns {Promise<Object>}
     */
    async deleteEntry(entryId) {
        if (!entryId) {
            throw new Error('ID записи обязателен');
        }
        console.log(`🗑️ DELETE /health/entries/${entryId}`);
        return this.api.delete(`/health/entries/${entryId}`);
    }

    /**
     * Проверить наличие записи за сегодня
     * @returns {Promise<boolean>}
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

    // ============================================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ (БЕЗ ИЗМЕНЕНИЙ)
    // ============================================================================

    getFeelingEmoji(feeling) {
        const emojis = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😊' };
        return emojis[feeling] || '❓';
    }

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

    validateEntry(entryData) {
        const errors = [];

        // overall_feeling обязателен только при создании
        if (entryData.overall_feeling !== undefined && entryData.overall_feeling !== null) {
            if (entryData.overall_feeling < 1 || entryData.overall_feeling > 5) {
                errors.push('Оценка самочувствия должна быть от 1 до 5');
            }
        }

        // Валидация опциональных полей
        ['energy_level', 'sleep_quality', 'stress_level'].forEach(field => {
            const value = entryData[field];
            if (value !== null && value !== undefined && (value < 1 || value > 5)) {
                errors.push(`${field} должен быть от 1 до 5 или null`);
            }
        });

        if (entryData.symptoms && !Array.isArray(entryData.symptoms)) {
            errors.push('Симптомы должны быть массивом строк');
        }

        if (entryData.notes && entryData.notes.length > 1000) {
            errors.push('Заметки не должны превышать 1000 символов');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    getAvailableSymptoms() {
        return this.getGenderSpecificSymptoms();
    }
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================

if (typeof API === 'undefined') {
    console.error('❌ Базовый API не загружен! Загрузите api.js перед health-api.js');
    throw new Error('Базовый API не найден');
}

const HealthAPI = new HealthAPIClient(API);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthAPI;
}

window.HealthAPI = HealthAPI;

console.log('✅ Health API клиент инициализирован v2.1.0 (синхронизирован с OpenAPI)');