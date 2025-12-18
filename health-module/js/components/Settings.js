/**
 * Компонент "Настройки"
 * Управление Telegram уведомлениями и настройками модуля здоровья
 */

const SettingsComponent = {
    /**
     * Состояние компонента
     */
    state: {
        telegramStatus: null,
        linkCode: null,
        notifications: null,
        loading: false,
        countdown: 0,
        countdownTimer: null
    },

    /**
     * Рендер главного контейнера
     */
    render() {
        return `
            <div class="settings-container">
                <div class="settings-header">
                    <h1 class="settings-title">
                        <span class="settings-icon">⚙️</span>
                        Настройки здоровья
                    </h1>
                    <p class="settings-subtitle">
                        Управление уведомлениями и интеграциями
                    </p>
                </div>

                <div id="settings-error" class="settings-error" style="display: none;"></div>

                <div class="settings-content">
                    ${this.renderTelegramSection()}
                </div>
            </div>
        `;
    },

    /**
     * Рендер секции Telegram
     */
    renderTelegramSection() {
        return `
            <div class="settings-section telegram-section">
                <div class="section-header">
                    <div class="section-icon">🔗</div>
                    <div class="section-info">
                        <h2 class="section-title">Telegram Уведомления</h2>
                        <p class="section-description">
                            Получай напоминания о приёме лекарств
                        </p>
                    </div>
                </div>

                <div id="telegram-status-container">
                    ${this.renderTelegramStatus()}
                </div>

                <div id="telegram-link-code-container">
                    ${this.renderLinkCodeSection()}
                </div>
            </div>
        `;
    },

    /**
     * Рендер статуса привязки
     */
    renderTelegramStatus() {
        if (!this.state.telegramStatus) {
            return `
                <div class="status-card status-loading">
                    <div class="loading-spinner-small"></div>
                    <p>Загрузка статуса...</p>
                </div>
            `;
        }

        if (this.state.telegramStatus.is_linked) {
            // Проверяем статус уведомлений
            const notifEnabled = this.state.notifications?.enabled ?? true;

            return `
                <div class="status-card status-linked">
                    <div class="status-content">
                        <div class="status-icon">✅</div>
                        <div class="status-text">
                            <p class="status-title">Аккаунт привязан</p>
                            <p class="status-info">
                                @${this.state.telegramStatus.username || 'пользователь'}
                                ${this.state.telegramStatus.telegram_id ? `(ID: ${this.state.telegramStatus.telegram_id})` : ''}
                            </p>
                            ${this.state.telegramStatus.linked_at ? `
                                <p class="status-date">
                                    Привязан: ${new Date(this.state.telegramStatus.linked_at).toLocaleString('ru-RU')}
                                </p>
                            ` : ''}
                        </div>
                    </div>

                    <div class="notification-status ${notifEnabled ? 'enabled' : 'disabled'}">
                        <span class="status-icon">${notifEnabled ? '🔔' : '🔕'}</span>
                        <span class="status-text">
                            Уведомления ${notifEnabled ? 'включены' : 'отключены'}
                        </span>
                    </div>

                    <div class="button-center">
                        <button
                            onclick="SettingsComponent.toggleNotifications(${!notifEnabled})"
                            class="btn ${notifEnabled ? 'btn-secondary' : 'btn-primary'}"
                            ${this.state.loading ? 'disabled' : ''}
                        >
                            ${notifEnabled ? '🔕 Отключить уведомления' : '🔔 Включить уведомления'}
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="status-card status-not-linked">
                    <div class="status-icon">ℹ️</div>
                    <div class="status-text">
                        <p class="status-title">Аккаунт не привязан</p>
                        <p class="status-info">
                            Привяжи Telegram для получения уведомлений о приёме лекарств
                        </p>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Рендер секции с кодом привязки
     */
    renderLinkCodeSection() {
        // Если аккаунт уже привязан - не показываем
        if (this.state.telegramStatus?.is_linked) {
            return '';
        }

        // Если нет кода - показываем кнопку
        if (!this.state.linkCode) {
            return `
                <button
                    onclick="SettingsComponent.generateLinkCode()"
                    class="btn btn-primary btn-block"
                    ${this.state.loading ? 'disabled' : ''}
                >
                    ${this.state.loading ? `
                        <div class="loading-spinner-small"></div>
                        <span>Генерация...</span>
                    ` : `
                        <span>🔗</span>
                        <span>Получить код привязки</span>
                    `}
                </button>
            `;
        }

        // Показываем инструкцию с кодом
        return `
            <div class="link-code-instructions">
                <div class="instructions-header">
                    <span class="instructions-icon">⏱️</span>
                    <div>
                        <h3 class="instructions-title">Инструкция по привязке</h3>
                        <p class="countdown-text">
                            Код действителен ${this.formatCountdown(this.state.countdown)}
                        </p>
                    </div>
                </div>

                <ol class="instructions-list">
                    <li>Открой Telegram</li>
                    <li>Найди бота <code>@YourHealthBot</code></li>
                    <li>Отправь команду:</li>
                </ol>

                <div class="code-input-group">
                    <input
                        type="text"
                        readonly
                        value="/link ${this.state.linkCode.link_code}"
                        class="code-input"
                        id="link-code-input"
                    />
                    <button
                        onclick="SettingsComponent.copyCode()"
                        class="btn btn-copy"
                        title="Скопировать"
                    >
                        📋
                    </button>
                </div>

                <button
                    onclick="SettingsComponent.clearLinkCode()"
                    class="btn btn-link btn-sm"
                >
                    Сгенерировать новый код
                </button>
            </div>
        `;
    },

    /**
     * Инициализация компонента
     */
    async init() {
        await this.loadAllData();
    },

    /**
     * Загрузка всех данных
     */
    async loadAllData() {
        await Promise.all([
            this.loadTelegramStatus(),
            this.loadNotificationSettings()
        ]);
    },

    /**
     * Загрузка статуса Telegram
     */
    async loadTelegramStatus() {
        try {
            const response = await HealthAPI.getTelegramStatus();
            if (response.success) {
                this.state.telegramStatus = response.data;
                this.updateView();
            }
        } catch (error) {
            console.error('Ошибка загрузки статуса Telegram:', error);
        }
    },

    /**
     * Загрузка настроек уведомлений
     */
    async loadNotificationSettings() {
        try {
            const response = await HealthAPI.getNotificationSettings();
            if (response.success) {
                this.state.notifications = response.data;
                this.updateView();
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        }
    },

    /**
     * Генерация кода привязки
     */
    async generateLinkCode() {
        this.state.loading = true;
        this.updateView();

        try {
            const response = await HealthAPI.generateLinkCode();
            if (response.success) {
                this.state.linkCode = response.data;
                this.startCountdown();
                this.updateView();
            } else {
                this.showError(response.error || 'Ошибка генерации кода');
            }
        } catch (error) {
            console.error('Ошибка генерации кода:', error);
            this.showError('Не удалось сгенерировать код');
        } finally {
            this.state.loading = false;
            this.updateView();
        }
    },

    /**
     * Переключение уведомлений
     */
    async toggleNotifications(enabled) {
        this.state.loading = true;
        this.updateView();

        try {
            let response;

            if (enabled) {
                // Включаем уведомления
                response = await HealthAPI.updateNotificationSettings({ enabled: true });
            } else {
                // Отключаем через unlinkTelegram (который теперь только отключает уведомления)
                response = await HealthAPI.unlinkTelegram();
            }

            if (response.success) {
                await this.loadAllData();
                this.showSuccess(enabled ? '✅ Уведомления включены' : '✅ Уведомления отключены');
            } else {
                this.showError('❌ Ошибка изменения настроек');
                // Восстанавливаем состояние
                await this.loadNotificationSettings();
            }
        } catch (error) {
            console.error('Ошибка переключения уведомлений:', error);
            this.showError('❌ Не удалось изменить настройки');
            // Восстанавливаем состояние
            await this.loadNotificationSettings();
        } finally {
            this.state.loading = false;
            this.updateView();
        }
    },

    /**
     * Копирование кода
     */
    copyCode() {
        const input = document.getElementById('link-code-input');
        if (input) {
            input.select();
            document.execCommand('copy');
            this.showSuccess('Команда скопирована!');
        }
    },

    /**
     * Очистка кода привязки
     */
    clearLinkCode() {
        this.stopCountdown();
        this.state.linkCode = null;
        this.state.countdown = 0;
        this.updateView();
    },

    /**
     * Запуск обратного отсчёта
     */
    startCountdown() {
        if (!this.state.linkCode) return;

        this.stopCountdown();

        const expiresAt = new Date(this.state.linkCode.expires_at).getTime();

        this.state.countdownTimer = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

            this.state.countdown = remaining;

            if (remaining === 0) {
                this.clearLinkCode();
            } else {
                this.updateCountdownDisplay();
            }
        }, 1000);

        // Первый запуск сразу
        const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        this.state.countdown = remaining;
        this.updateCountdownDisplay();
    },

    /**
     * Остановка обратного отсчёта
     */
    stopCountdown() {
        if (this.state.countdownTimer) {
            clearInterval(this.state.countdownTimer);
            this.state.countdownTimer = null;
        }
    },

    /**
     * Форматирование времени
     */
    formatCountdown(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Обновление отображения таймера
     */
    updateCountdownDisplay() {
        const countdownEl = document.querySelector('.countdown-text');
        if (countdownEl) {
            countdownEl.textContent = `Код действителен ${this.formatCountdown(this.state.countdown)}`;
        }
    },

    /**
     * Обновление вида
     */
    updateView() {
        // Обновляем статус
        const statusContainer = document.getElementById('telegram-status-container');
        if (statusContainer) {
            statusContainer.innerHTML = this.renderTelegramStatus();
        }

        // Обновляем код привязки
        const linkCodeContainer = document.getElementById('telegram-link-code-container');
        if (linkCodeContainer) {
            linkCodeContainer.innerHTML = this.renderLinkCodeSection();
        }
    },

    /**
     * Показать ошибку
     */
    showError(message) {
        const errorEl = document.getElementById('settings-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
    },

    /**
     * Показать успех
     */
    showSuccess(message) {
        if (typeof toast !== 'undefined') {
            toast.success(message);
        } else {
            alert(message);
        }
    }
};

// Экспорт для использования
window.SettingsComponent = SettingsComponent;