/**
 * API клиент для модуля "Здоровье"
 * Версия: 2.0.0 - Добавлен гендер (минимальная версия)
 */

class HealthAPIClient {
    constructor(baseAPI) {
        if (!baseAPI) {
            throw new Error('Требуется базовый API клиент');
        }
        this.api = baseAPI;

        // Инициализация минимального профиля
        this.initMinimalProfile();
    }

    // ============================================================================
    // ГЕНДЕР (ЛОКАЛЬНОЕ ХРАНИЛИЩЕ - ВРЕМЕННО)
    // ============================================================================

    /**
     * Инициализировать минимальный профиль
     * @private
     */
    initMinimalProfile() {
        const gender = this.getGender();
        if (!gender) {
            // При первом запуске — гендер не установлен
            console.log('ℹ️ Гендер не установлен. Пользователь увидит форму выбора.');
        }
    }

    /**
     * Получить гендер пользователя
     * @returns {string|null} 'male', 'female', 'other' или null
     */
    getGender() {
        try {
            return localStorage.getItem('health_gender');
        } catch (error) {
            console.error('Ошибка чтения гендера:', error);
            return null;
        }
    }

    /**
     * Установить гендер
     * @param {string} gender - 'male', 'female', 'other'
     * @returns {boolean} Успешность установки
     */
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

    /**
     * Проверить, установлен ли гендер
     * @returns {boolean}
     */
    isGenderSet() {
        return this.getGender() !== null;
    }

    /**
     * Получить иконку гендера
     * @param {string} gender - 'male', 'female', 'other'
     * @returns {string} Эмодзи
     */
    getGenderIcon(gender) {
        const icons = {
            'male': '♂️',
            'female': '♀️',
            'other': '⚧️'
        };
        return icons[gender] || '❓';
    }

    /**
     * Получить название гендера
     * @param {string} gender - 'male', 'female', 'other'
     * @returns {string} Название
     */
    getGenderName(gender) {
        const names = {
            'male': 'Мужской',
            'female': 'Женский',
            'other': 'Другой'
        };
        return names[gender] || 'Не указан';
    }

    /**
     * Получить гендерно-специфичные симптомы
     * @returns {string[]} Массив симптомов
     */
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
            return [
                ...commonSymptoms,
                'Боль в области паха'
            ];
        }

        return commonSymptoms;
    }

    // ============================================================================
    // ЗАГЛУШКА ДЛЯ БУДУЩЕГО API ПРОФИЛЯ
    // ============================================================================

    /**
     * 🚧 ЗАГЛУШКА: Получить полный профиль здоровья
     * TODO: Реализовать после добавления endpoint /users/profile или /health/profile
     * @returns {Promise<Object>} Профиль пользователя
     */
    async getFullProfile() {
        console.warn('⚠️ ЗАГЛУШКА: API для полного профиля ещё не реализован');

        // Временно возвращаем локальные данные
        return {
            gender: this.getGender(),
            message: 'Полный профиль будет доступен после добавления API endpoint'
        };
    }

    /**
     * 🚧 ЗАГЛУШКА: Обновить полный профиль
     * TODO: Реализовать после добавления endpoint
     * @param {Object} profileData - Данные профиля
     * @returns {Promise<Object>}
     */
    async updateFullProfile(profileData) {
        console.warn('⚠️ ЗАГЛУШКА: API для обновления профиля ещё не реализован');

        // Временно сохраняем только гендер
        if (profileData.gender) {
            this.setGender(profileData.gender);
        }

        return {
            success: true,
            message: 'Гендер сохранён локально. Полный профиль будет доступен после добавления API'
        };
    }

    // ============================================================================
    // ЗАПИСИ О ЗДОРОВЬЕ (БЕЗ ИЗМЕНЕНИЙ)
    // ============================================================================

    /**
     * Создать запись о здоровье
     */
    async createEntry(entryData) {
        if (!entryData.overall_feeling || entryData.overall_feeling < 1 || entryData.overall_feeling > 5) {
            throw new Error('Поле overall_feeling обязательно и должно быть от 1 до 5');
        }

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
     * Получить историю записей
     */
    async getEntries(days = 30, limit = 100) {
        const endpoint = `/health/entries?days=${days}&limit=${limit}`;
        console.log(`📊 Получение истории записей: ${endpoint}`);
        return this.api.get(endpoint);
    }

    /**
     * Получить последнюю запись
     */
    async getLatestEntry() {
        console.log('🔍 Получение последней записи');
        try {
            return await this.api.get('/health/entries/latest');
        } catch (error) {
            if (error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Получить статистику
     */
    async getStatistics(days = 30) {
        const endpoint = `/health/statistics?days=${days}`;
        console.log(`📈 Получение статистики: ${endpoint}`);
        return this.api.get(endpoint);
    }

    /**
     * Обновить запись
     */
    async updateEntry(entryId, updates) {
        if (!entryId) {
            throw new Error('ID записи обязателен');
        }
        console.log(`✏️ Обновление записи ${entryId}:`, updates);
        return this.api.put(`/health/entries/${entryId}`, updates);
    }

    /**
     * Удалить запись
     */
    async deleteEntry(entryId) {
        if (!entryId) {
            throw new Error('ID записи обязателен');
        }
        console.log(`🗑️ Удаление записи ${entryId}`);
        return this.api.delete(`/health/entries/${entryId}`);
    }

    /**
     * Проверить наличие записи за сегодня
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
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
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

        if (!entryData.overall_feeling) {
            errors.push('Укажите общее самочувствие');
        } else if (entryData.overall_feeling < 1 || entryData.overall_feeling > 5) {
            errors.push('Оценка должна быть от 1 до 5');
        }

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

    /**
     * Получить список доступных симптомов (с учётом гендера)
     */
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

console.log('✅ Health API клиент инициализирован v2.0.0 (минимальная версия с гендером)');