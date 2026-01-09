/**
 * Компонент кнопки "Назад" для навигации
 */
class BackButtonComponent {
    constructor(options = {}) {
        this.options = {
            // Фолбэк URL если history пустой
            fallbackUrl: '../index.html',
            // Показывать ли стандартную кнопку Telegram
            showTelegramButton: true,
            // Автоматически инициализировать при создании
            autoInit: true,
            // Позиционирование
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            ...options
        };

        this.tg = window.Telegram?.WebApp;
        this.isTelegram = !!this.tg;
        this.buttonElement = null;
        this.containerElement = null;
        this.isInitialized = false;

        // Автоматическая инициализация
        if (this.options.autoInit) {
            this.init();
        }
    }

    /**
     * Инициализация компонента
     */
    init() {
        if (this.isInitialized) {
            console.log('🔙 Компонент уже инициализирован');
            return this;
        }

        console.log('🔙 Инициализация компонента BackButton');

        // Создаем контейнер для кнопки
        this.createContainer();

        // Если в Telegram Web App, используем нативную кнопку
        if (this.isTelegram && this.options.showTelegramButton) {
            this.initTelegramBackButton();
        } else {
            // Иначе создаем кастомную кнопку
            this.createCustomButton();
        }

        this.isInitialized = true;

        // Добавляем обработчик для страницы
        this.addPageUnloadHandler();

        return this;
    }

    /**
     * Создание контейнера для кнопки
     */
    createContainer() {
        // Проверяем, есть ли уже контейнер
        this.containerElement = document.querySelector('.back-button-container');

        if (!this.containerElement) {
            this.containerElement = document.createElement('div');
            this.containerElement.className = 'back-button-container';
            this.containerElement.style.cssText = `
                position: ${this.options.position};
                top: ${this.options.top};
                left: ${this.options.left};
                z-index: ${this.options.zIndex};
            `;

            // Добавляем контейнер в body
            document.body.appendChild(this.containerElement);
        }
    }

    /**
     * Инициализация нативной кнопки Telegram
     */
    initTelegramBackButton() {
        try {
            console.log('🔙 Используем нативную кнопку Telegram Web App');

            // Показываем кнопку "Назад"
            this.tg.BackButton.show();

            // Настраиваем обработчик клика
            this.tg.BackButton.onClick(() => {
                console.log('🔙 Нажата кнопка "Назад" в Telegram Web App');
                this.navigateBack();
            });

            this.logNavigationInfo();
        } catch (error) {
            console.error('🔙 Ошибка инициализации Telegram BackButton:', error);
            this.createCustomButton();
        }
    }

    /**
     * Создание кастомной кнопки
     */
    createCustomButton() {
        console.log('🔙 Создаем кастомную кнопку "Назад"');

        this.buttonElement = document.createElement('button');
        this.buttonElement.className = 'back-button-custom';
        this.buttonElement.setAttribute('aria-label', this.getBackText());
        this.buttonElement.setAttribute('title', this.getBackText());

        this.buttonElement.innerHTML = `
            <div class="back-button-icon">←</div>
        `;

        // Основные стили
        this.buttonElement.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.1);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: var(--text-color, #000);
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            padding: 0;
            margin: 0;
            outline: none;
        `;

        // Добавляем обработчик событий
        this.buttonElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.navigateBack();
        });

        // Добавляем эффекты при наведении
        this.buttonElement.addEventListener('mouseenter', () => {
            if (this.buttonElement) {
                this.buttonElement.style.transform = 'scale(1.1)';
                this.buttonElement.style.background = 'rgba(0, 0, 0, 0.15)';
            }
        });

        this.buttonElement.addEventListener('mouseleave', () => {
            if (this.buttonElement) {
                this.buttonElement.style.transform = 'scale(1)';
                this.buttonElement.style.background = 'rgba(0, 0, 0, 0.1)';
            }
        });

        this.buttonElement.addEventListener('mousedown', () => {
            if (this.buttonElement) {
                this.buttonElement.style.transform = 'scale(0.95)';
            }
        });

        this.buttonElement.addEventListener('mouseup', () => {
            if (this.buttonElement) {
                this.buttonElement.style.transform = 'scale(1.1)';
            }
        });

        // Добавляем в контейнер
        this.containerElement.appendChild(this.buttonElement);
        this.logNavigationInfo();
    }

    /**
     * Навигация назад
     */
    navigateBack() {
        console.log('🔙 Навигация назад');

        // Виброотдача если в Telegram
        if (this.isTelegram && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('light');
        }

        // Проверяем историю навигации
        const canGoBack = window.history.length > 1;
        console.log(`🔙 История навигации: ${window.history.length} записей, можно вернуться: ${canGoBack}`);

        if (canGoBack) {
            // Пытаемся вернуться через историю
            try {
                window.history.back();

                // Резервный план на случай если history.back() не сработает
                setTimeout(() => {
                    // Если через 1 секунду мы все еще на этой же странице
                    if (!document.hidden) {
                        console.log('🔙 history.back() не сработал, используем fallback');
                        this.useFallbackNavigation();
                    }
                }, 1000);
            } catch (error) {
                console.error('🔙 Ошибка при history.back():', error);
                this.useFallbackNavigation();
            }
        } else {
            console.log('🔙 Нет истории навигации, используем fallback');
            this.useFallbackNavigation();
        }

        return false;
    }

    /**
     * Резервная навигация
     */
    useFallbackNavigation() {
        console.log(`🔙 Используем fallback URL: ${this.options.fallbackUrl}`);

        // Проверяем referrer
        if (document.referrer && document.referrer !== '' && document.referrer !== window.location.href) {
            console.log(`🔙 Переход по referrer: ${document.referrer}`);
            window.location.href = document.referrer;
        } else {
            // Используем заданный fallback URL
            window.location.href = this.options.fallbackUrl;
        }
    }

    /**
     * Получить текст для кнопки
     */
    getBackText() {
        if (typeof t === 'function') {
            return t('common.back') || 'Назад';
        }
        return 'Назад';
    }

    /**
     * Логирование информации о навигации
     */
    logNavigationInfo() {
        console.log('🔙 Информация о навигации:');
        console.log(`  - История записей: ${window.history.length}`);
        console.log(`  - Referrer: ${document.referrer || 'нет'}`);
        console.log(`  - Fallback URL: ${this.options.fallbackUrl}`);
        console.log(`  - Текущий URL: ${window.location.href}`);
    }

    /**
     * Добавить обработчик выгрузки страницы
     */
    addPageUnloadHandler() {
        window.addEventListener('beforeunload', () => {
            console.log('🔙 Страница выгружается');
        });
    }

    /**
     * Обновление fallback URL
     */
    setFallbackUrl(url) {
        this.options.fallbackUrl = url;
        console.log(`🔙 Установлен новый fallback URL: ${url}`);
        return this;
    }

    /**
     * Обновление позиции
     */
    setPosition(top = '10px', left = '10px') {
        if (this.containerElement) {
            this.containerElement.style.top = top;
            this.containerElement.style.left = left;
        }
        return this;
    }

    /**
     * Показать кнопку
     */
    show() {
        if (this.buttonElement) {
            this.buttonElement.style.display = 'flex';
        }
        if (this.isTelegram && this.tg.BackButton) {
            this.tg.BackButton.show();
        }
        return this;
    }

    /**
     * Скрыть кнопку
     */
    hide() {
        if (this.buttonElement) {
            this.buttonElement.style.display = 'none';
        }
        if (this.isTelegram && this.tg.BackButton) {
            this.tg.BackButton.hide();
        }
        return this;
    }

    /**
     * Уничтожение компонента
     */
    destroy() {
        console.log('🔙 Уничтожение компонента BackButton');

        if (this.buttonElement) {
            this.buttonElement.remove();
            this.buttonElement = null;
        }

        if (this.containerElement) {
            this.containerElement.remove();
            this.containerElement = null;
        }

        if (this.isTelegram && this.tg.BackButton) {
            this.tg.BackButton.offClick(this.navigateBack);
            this.tg.BackButton.hide();
        }

        this.isInitialized = false;
        return this;
    }

    /**
     * Статический метод для быстрого создания
     */
    static create(options = {}) {
        return new BackButtonComponent(options);
    }
}

// Создаем глобальный экземпляр для легкого доступа
if (typeof window !== 'undefined') {
    window.BackButton = BackButtonComponent.create({
        fallbackUrl: '../index.html',
        autoInit: false // Не инициализировать автоматически
    });
}

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackButtonComponent;
}