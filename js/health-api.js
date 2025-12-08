/**
 * API клиент для модуля "Здоровье"
 * Версия: 3.0.0 - Синхронизация с актуальным OpenAPI бэкенда
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
    // ПРОФИЛЬ И ГЕНДЕР
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

    async setGender(gender) {
        if (!['male', 'female', 'other', 'prefer_not_to_say'].includes(gender)) {
            console.error('Неверное значение гендера:', gender);
            return false;
        }
        try {
            // Сохраняем локально
            localStorage.setItem('health_gender', gender);
            
            // Отправляем на сервер
            await this.api.put('/health/profile/gender', { gender });
            
            console.log('✅ Гендер установлен:', gender);
            return true;
        } catch (error) {
            console.error('❌ Ошибка установки гендера:', error);
            // Все равно сохраняем локально
            return true;
        }
    }

    async getProfile() {
        try {
            return await this.api.get('/health/profile/gender');
        } catch (error) {
            console.error('Ошибка получения профиля:', error);
            return { gender: this.getGender() };
        }
    }

    async getOptions() {
        try {
            return await this.api.get('/health/profile/options');
        } catch (error) {
            console.error('Ошибка получения опций:', error);
            return this.getDefaultOptions();
        }
    }

    getDefaultOptions() {
        const gender = this.getGender();
        
        const baseOptions = {
            mood_options: [
                "радостное_волнение", "радость", "релакс", "обидчивость",
                "тревожность", "раздраженность", "стресс", "грусть"
            ],
            sexual_activity_options: ["нет", "защищенный_секс", "незащищенный_секс", "самостоятельно"],
            symptom_categories: ["общее", "голова", "живот", "гинекология", "урология", "прочее"]
        };

        if (gender === 'female') {
            baseOptions.sexual_activity_options.push(
                "активная_роль", "пассивная_роль", "период_овуляции", "во_время_месячных"
            );
        } else if (gender === 'male') {
            baseOptions.sexual_activity_options.push("активная_роль", "пассивная_роль");
        }

        return baseOptions;
    }

    isGenderSet() {
        return this.getGender() !== null;
    }

    getGenderIcon(gender) {
        const icons = { 'male': '♂️', 'female': '♀️', 'other': '⚧️', 'prefer_not_to_say': '❓' };
        return icons[gender] || '❓';
    }

    getGenderName(gender) {
        const names = { 'male': 'Мужской', 'female': 'Женский', 'other': 'Другой', 'prefer_not_to_say': 'Не указан' };
        return names[gender] || 'Не указан';
    }

    // ============================================================================
    // ЗАПИСИ О ЗДОРОВЬЕ (Health Entries)
    // ============================================================================

    /**
     * Создать/обновить запись за дату (POST /health/entries/{entry_date}/mood и т.д.)
     */
    async addMood(entryDate, mood) {
        console.log(`📝 POST /health/entries/${entryDate}/mood`);
        return this.api.post(`/health/entries/${entryDate}/mood`, { mood });
    }

    async addSleep(entryDate, sleepHours) {
        console.log(`📝 POST /health/entries/${entryDate}/sleep`);
        return this.api.post(`/health/entries/${entryDate}/sleep`, { sleep_hours: sleepHours });
    }

    async addWeight(entryDate, weight) {
        console.log(`📝 POST /health/entries/${entryDate}/weight`);
        return this.api.post(`/health/entries/${entryDate}/weight`, { weight });
    }

    async addSexualActivity(entryDate, activity) {
        console.log(`📝 POST /health/entries/${entryDate}/sexual-activity`);
        return this.api.post(`/health/entries/${entryDate}/sexual-activity`, { sexual_activity: activity });
    }

    async addSymptoms(entryDate, symptoms) {
        console.log(`📝 POST /health/entries/${entryDate}/symptoms`);
        return this.api.post(`/health/entries/${entryDate}/symptoms`, { symptoms });
    }

    async addNotes(entryDate, notes) {
        console.log(`📝 POST /health/entries/${entryDate}/notes`);
        return this.api.post(`/health/entries/${entryDate}/notes`, { notes });
    }

    /**
     * Получить запись за дату
     */
    async getEntry(entryDate) {
        console.log(`🔍 GET /health/entries/${entryDate}`);
        return this.api.get(`/health/entries/${entryDate}`);
    }

    /**
     * Получить записи за период
     */
    async getEntries(startDate, endDate) {
        console.log(`📊 GET /health/entries?start_date=${startDate}&end_date=${endDate}`);
        return this.api.get(`/health/entries?start_date=${startDate}&end_date=${endDate}`);
    }

    /**
     * Удалить запись
     */
    async deleteEntry(entryDate) {
        console.log(`🗑️ DELETE /health/entries/${entryDate}`);
        return this.api.delete(`/health/entries/${entryDate}`);
    }

    /**
     * Получить последнюю запись
     */
    async getLatestEntry() {
        console.log('🔍 GET /health/entries/latest');
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
     * Получить записи за последние N дней
     */
    async getEntriesByDays(days = 7) {
        console.log(`📊 GET /health/entries/by-days?days=${days}`);
        return this.api.get(`/health/entries/by-days?days=${days}`);
    }

    /**
     * Проверить наличие записи за сегодня
     */
    async hasTodayEntry() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const entry = await this.getEntry(today);
            return !!entry;
        } catch (error) {
            if (error.message.includes('404')) {
                return false;
            }
            return false;
        }
    }

    // ============================================================================
    // СТАТИСТИКА
    // ============================================================================

    /**
     * Получить статистику за период
     */
    async getStatistics(startDate, endDate) {
        console.log(`📈 GET /health/statistics?start_date=${startDate}&end_date=${endDate}`);
        return this.api.get(`/health/statistics?start_date=${startDate}&end_date=${endDate}`);
    }

    /**
     * Получить статистику за последние N дней
     */
    async getStatisticsByDays(days = 30) {
        console.log(`📈 GET /health/statistics/by-days?days=${days}`);
        return this.api.get(`/health/statistics/by-days?days=${days}`);
    }

    /**
     * Получить краткую сводку
     */
    async getSummary(days = 30) {
        console.log(`📈 GET /health/statistics/summary?days=${days}`);
        return this.api.get(`/health/statistics/summary?days=${days}`);
    }

    // ============================================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ============================================================================

    getMoodEmoji(mood) {
        const emojis = {
            "радостное_волнение": "🤩",
            "радость": "😊",
            "релакс": "😌",
            "обидчивость": "😒",
            "тревожность": "😰",
            "раздраженность": "😤",
            "стресс": "😫",
            "грусть": "😢"
        };
        return emojis[mood] || "😐";
    }

    getMoodDescription(mood) {
        const descriptions = {
            "радостное_волнение": "Радостное волнение",
            "радость": "Радость",
            "релакс": "Релакс",
            "обидчивость": "Обидчивость",
            "тревожность": "Тревожность",
            "раздраженность": "Раздражённость",
            "стресс": "Стресс",
            "грусть": "Грусть"
        };
        return descriptions[mood] || mood;
    }

    formatEntryDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    getDateDaysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
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

console.log('✅ Health API клиент инициализирован v3.0.0 (синхронизирован с бэкендом)');
