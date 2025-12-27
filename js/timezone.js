/**
 * Утилиты для работы с временными зонами (Timezone)
 * Версия: 1.0
 */

class TimezoneManager {
    /**
     * Получить автоопределённую timezone устройства
     * @returns {string} Timezone в формате IANA (например, 'America/Asuncion')
     */
    static detectUserTimezone() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log('🌍 Автоопределена timezone:', timezone);
            return timezone;
        } catch (error) {
            console.warn('⚠️ Не удалось определить timezone, используется UTC');
            return 'UTC';
        }
    }

    /**
     * Получить текущую timezone пользователя с сервера
     * @returns {Promise<string>} Timezone пользователя
     */
    static async getUserTimezone() {
        const response = await API.get('/auth/timezone');
        return response.timezone;
    }

    /**
     * Обновить timezone пользователя
     * @param {string} timezone - Новая timezone
     * @returns {Promise<object>} Результат обновления
     */
    static async updateTimezone(timezone) {
        return API.put('/auth/timezone', { timezone });
    }

    /**
     * Автоматическая настройка timezone при первом запуске
     * @returns {Promise<boolean>} True если успешно
     */
    static async autoSetup() {
        try {
            // Проверяем нужно ли настраивать
            const userInfo = await API.getCurrentUserInfo();
            
            // Если timezone уже настроен и не UTC - пропускаем
            if (userInfo.timezone && userInfo.timezone !== 'UTC') {
                console.log('✅ Timezone уже настроен:', userInfo.timezone);
                return true;
            }

            // Определяем timezone устройства
            const detectedTimezone = this.detectUserTimezone();
            
            // Если определили не UTC - обновляем
            if (detectedTimezone !== 'UTC') {
                console.log('🌍 Настраиваем timezone:', detectedTimezone);
                await this.updateTimezone(detectedTimezone);
                console.log('✅ Timezone успешно настроен');
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ Ошибка автонастройки timezone:', error);
            return false;
        }
    }

    /**
     * Проверить нужна ли настройка timezone
     * @returns {Promise<boolean>} True если нужна настройка
     */
    static async needsSetup() {
        // Проверяем localStorage - уже настраивали?
        const timezoneSetup = localStorage.getItem('timezone_setup_done');
        if (timezoneSetup) {
            return false;
        }

        try {
            const userInfo = await API.getCurrentUserInfo();
            return !userInfo.timezone || userInfo.timezone === 'UTC';
        } catch (error) {
            return true;
        }
    }

    /**
     * Инициализация с автоопределением timezone
     * Вызывается автоматически при первом запуске
     */
    static async initialize() {
        if (!API.isAuthenticated()) {
            console.warn('⚠️ Пользователь не аутентифицирован');
            return;
        }

        // Проверяем нужна ли настройка
        const needs = await this.needsSetup();
        if (!needs) {
            console.log('✅ Timezone уже был настроен ранее');
            return;
        }

        // Автонастройка
        const success = await this.autoSetup();
        
        if (success) {
            // Сохраняем флаг что настроили
            localStorage.setItem('timezone_setup_done', 'true');
            console.log('🎉 Timezone успешно инициализирован');
        }
    }

    /**
     * Сбросить флаг настройки (для повторной настройки)
     */
    static resetSetupFlag() {
        localStorage.removeItem('timezone_setup_done');
        console.log('🔄 Флаг настройки timezone сброшен');
    }
}

// Делаем доступным глобально
window.TimezoneManager = TimezoneManager;

console.log('✅ Timezone Manager загружен');
