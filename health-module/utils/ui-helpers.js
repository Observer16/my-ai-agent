// utils/ui-helpers.js
const UIHelpers = (function() {
    // Создать спиннер загрузки
    function createSpinner(options = {}) {
        const {
            size = 40,
            color = '#3498db',
            thickness = 4
        } = options;

        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border: ${thickness}px solid #f3f3f3;
            border-top: ${thickness}px solid ${color};
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;

        return spinner;
    }

    // Создать карточку
    function createCard(content, options = {}) {
        const {
            title = '',
            subtitle = '',
            icon = '',
            actions = [],
            className = ''
        } = options;

        const card = document.createElement('div');
        card.className = `health-card ${className}`;
        card.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 16px;
        `;

        let headerHTML = '';
        if (title || icon) {
            headerHTML = `
                <div class="card-header" style="display: flex; align-items: center; margin-bottom: 12px;">
                    ${icon ? `<div class="card-icon" style="margin-right: 10px;">${icon}</div>` : ''}
                    <div>
                        ${title ? `<h3 style="margin: 0; font-size: 18px; color: #333;">${title}</h3>` : ''}
                        ${subtitle ? `<p style="margin: 4px 0 0; font-size: 14px; color: #666;">${subtitle}</p>` : ''}
                    </div>
                </div>
            `;
        }

        let actionsHTML = '';
        if (actions.length > 0) {
            actionsHTML = `
                <div class="card-actions" style="margin-top: 16px; display: flex; gap: 8px;">
                    ${actions.map(action => `
                        <button class="btn ${action.className || ''}"
                                style="padding: 6px 12px; border: none; border-radius: 6px; background: ${action.color || '#3498db'}; color: white; cursor: pointer;">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        card.innerHTML = `
            ${headerHTML}
            <div class="card-content">
                ${content}
            </div>
            ${actionsHTML}
        `;

        return card;
    }

    // Создать пустое состояние
    function createEmptyState(message, options = {}) {
        const {
            icon = '📋',
            buttonText = '',
            buttonAction = null,
            className = ''
        } = options;

        const emptyState = document.createElement('div');
        emptyState.className = `empty-state ${className}`;
        emptyState.style.cssText = `
            text-align: center;
            padding: 60px 20px;
            color: #666;
        `;

        let buttonHTML = '';
        if (buttonText && buttonAction) {
            buttonHTML = `
                <button class="empty-state-btn"
                        style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    ${buttonText}
                </button>
            `;
        }

        const emptyTitle = message.title || (typeof t === 'function' ? t('health.common.no_data') : 'Нет данных');

        emptyState.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;">${icon}</div>
            <h3 style="margin-bottom: 10px; color: #444;">${emptyTitle}</h3>
            <p style="color: #999; max-width: 400px; margin: 0 auto;">${message.description || ''}</p>
            ${buttonHTML}
        `;

        if (buttonAction) {
            const button = emptyState.querySelector('.empty-state-btn');
            if (button) {
                button.addEventListener('click', buttonAction);
            }
        }

        return emptyState;
    }

    // Показать контекстное меню
    function showContextMenu(items, position, options = {}) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${position.y}px;
            left: ${position.x}px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            min-width: 200px;
            overflow: hidden;
        `;

        const itemsHTML = items.map(item => `
            <div class="menu-item"
                 data-action="${item.action}"
                 style="padding: 12px 16px; cursor: pointer; transition: background 0.2s;
                        ${item.danger ? 'color: #e74c3c;' : 'color: #333;'}
                        ${item.disabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                ${item.icon ? `<span style="margin-right: 8px;">${item.icon}</span>` : ''}
                ${item.text}
            </div>
        `).join('');

        menu.innerHTML = itemsHTML;
        document.body.appendChild(menu);

        // Обработчики кликов
        menu.querySelectorAll('.menu-item:not([style*="cursor: not-allowed"])').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.getAttribute('data-action');
                const itemObj = items.find(i => i.action === action);

                if (itemObj && itemObj.onClick) {
                    itemObj.onClick();
                }

                hideContextMenu(menu);
                e.stopPropagation();
            });
        });

        // Закрытие при клике вне меню
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    hideContextMenu(menu);
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);

        // Закрытие при скролле
        const closeOnScroll = () => hideContextMenu(menu);
        window.addEventListener('scroll', closeOnScroll);

        menu._closeListeners = { scroll: closeOnScroll };

        EventManager.emit('ui:contextMenuShown', { menu, items });

        return menu;
    }

    // Скрыть контекстное меню
    function hideContextMenu(menu) {
        if (menu && menu.parentNode) {
            if (menu._closeListeners) {
                window.removeEventListener('scroll', menu._closeListeners.scroll);
            }

            menu.style.opacity = '0';
            menu.style.transform = 'scale(0.95)';
            menu.style.transition = 'all 0.2s ease';

            setTimeout(() => {
                if (menu.parentNode) {
                    menu.parentNode.removeChild(menu);
                }
            }, 200);

            EventManager.emit('ui:contextMenuHidden');
        }
    }

    // Форматирование даты
    function formatDate(date, format = 'full') {
        const d = new Date(date);

        const formats = {
            short: d.toLocaleDateString('ru-RU'),
            full: d.toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: d.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            relative: getRelativeTime(d)
        };

        return formats[format] || formats.short;
    }

    // Относительное время
    function getRelativeTime(date) {
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) {
            return typeof t === 'function' ? t('health.common.just_now') : 'только что';
        }
        if (minutes < 60) {
            return typeof t === 'function'
                ? t('health.common.minutes_ago', { count: minutes })
                : `${minutes} мин. назад`;
        }
        if (hours < 24) {
            return typeof t === 'function'
                ? t('health.common.hours_ago', { count: hours })
                : `${hours} ч. назад`;
        }
        if (days < 7) {
            return typeof t === 'function'
                ? t('health.common.days_ago', { count: days })
                : `${days} дн. назад`;
        }

        return formatDate(date, 'short');
    }

    // Анимация появления
    function fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    // Анимация исчезновения
    function fadeOut(element, duration = 300) {
        return new Promise(resolve => {
            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms ease`;

            requestAnimationFrame(() => {
                element.style.opacity = '0';
                setTimeout(() => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                    resolve();
                }, duration);
            });
        });
    }

    // Копировать в буфер обмена
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            EventManager.emit('ui:copied', text);
            return true;
        } catch (error) {
            console.error('❌ Ошибка копирования:', error);

            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();

            try {
                document.execCommand('copy');
                EventManager.emit('ui:copied', text);
                return true;
            } catch (err) {
                console.error('❌ Ошибка fallback копирования:', err);
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    return {
        createSpinner,
        createCard,
        createEmptyState,
        showContextMenu,
        hideContextMenu,
        formatDate,
        getRelativeTime,
        fadeIn,
        fadeOut,
        copyToClipboard
    };
})();

if (typeof window !== 'undefined') {
    window.UIHelpers = UIHelpers;
}