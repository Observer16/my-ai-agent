// utils/error-handler.js
const ErrorHandler = (function() {
    // Показать ошибку
    function show(message, options = {}) {
        const {
            type = 'error',
            duration = 5000,
            position = 'top-right'
        } = options;

        console.error(`❌ ${type.toUpperCase()}: ${message}`);

        // Создаем элемент ошибки
        const errorDiv = document.createElement('div');
        errorDiv.className = `health-error-message health-${type}`;
        errorDiv.style.cssText = `
            position: fixed;
            ${getPositionStyles(position)};
            background: ${getBackgroundColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            max-width: 400px;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        errorDiv.innerHTML = `
            <div style="font-size: 20px;">${getIcon(type)}</div>
            <div style="flex: 1;">
                <strong style="display: block; margin-bottom: 4px;">
                    ${getTitle(type)}
                </strong>
                <div style="font-size: 14px; opacity: 0.9;">${message}</div>
            </div>
        `;

        document.body.appendChild(errorDiv);

        // Автоматическое скрытие
        if (duration > 0) {
            setTimeout(() => {
                hide(errorDiv);
            }, duration);
        }

        // Клик для закрытия
        errorDiv.addEventListener('click', () => hide(errorDiv));

        EventManager.emit('error:shown', { message, type, duration, position });

        return errorDiv;
    }

    // Скрыть ошибку
    function hide(errorElement) {
        if (errorElement && errorElement.parentNode) {
            errorElement.style.opacity = '0';
            errorElement.style.transform = 'translateY(-20px)';
            errorElement.style.transition = 'all 0.3s ease';

            setTimeout(() => {
                if (errorElement.parentNode) {
                    errorElement.parentNode.removeChild(errorElement);
                }
            }, 300);
        }
    }

    // Стили позиционирования
    function getPositionStyles(position) {
        const positions = {
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
            'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
        };

        return positions[position] || positions['top-right'];
    }

    // Цвет фона по типу
    function getBackgroundColor(type) {
        const colors = {
            error: '#e74c3c',
            warning: '#f39c12',
            success: '#27ae60',
            info: '#3498db'
        };

        return colors[type] || colors.error;
    }

    // Иконка по типу
    function getIcon(type) {
        const icons = {
            error: '❌',
            warning: '⚠️',
            success: '✅',
            info: 'ℹ️'
        };

        return icons[type] || icons.error;
    }

    // Заголовок по типу
    function getTitle(type) {
        const getTitles = () => ({
            error: typeof t === 'function' ? t('health.common.error') : 'Ошибка',
            warning: typeof t === 'function' ? t('health.common.warning') : 'Предупреждение',
            success: typeof t === 'function' ? t('health.common.success') : 'Успешно',
            info: typeof t === 'function' ? t('health.common.info') : 'Информация'
        });

        const titles = getTitles();
        return titles[type] || titles.error;
    }

    // Логировать ошибку
    function log(error, context = {}) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context
        };

        console.error('📝 Логирование ошибки:', errorData);
        EventManager.emit('error:logged', errorData);

        // Можно добавить отправку на сервер
        // sendToErrorTrackingService(errorData);
    }

    // Обработчик глобальных ошибок
    function setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            log(event.error, { type: 'global', filename: event.filename });
        });

        window.addEventListener('unhandledrejection', (event) => {
            log(event.reason, { type: 'promise' });
        });

        console.log('✅ Глобальная обработка ошибок настроена');
    }

    return {
        show,
        hide,
        log,
        setupGlobalErrorHandling
    };
})();

if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
}