// js/modals/SexualActivityModal.js
const SexualActivityModal = (function() {

    // Проверяем что OptionsCache доступен
    if (typeof OptionsCache === 'undefined') {
        console.error('❌ OptionsCache не найден!');
        // Fallback - загружаем напрямую из API
        const fallbackGetUserOptions = async () => {
            return await HealthAPI.getUserOptions();
        };
        // Создаем временный объект
        window.OptionsCache = {
            getUserOptions: fallbackGetUserOptions,
            invalidate: () => console.log('Кэш не доступен'),
            getCurrentCache: () => null
        };
    }

    // Карта иконок и описаний
    const OPTION_MAP = {
        'нет': {
            label: 'Не было',
            icon: '⭕',
            description: 'Нет активности'
        },
        'защищенный секс': {
            label: 'Защищенный секс',
            icon: '🛡️',
            description: 'С использованием контрацепции'
        },
        'незащищенный секс': {
            label: 'Незащищенный секс',
            icon: '⚠️',
            description: 'Без контрацепции'
        },
        'самостоятельно': {
            label: 'Самостоятельно',
            icon: '💭',
            description: ''
        },
        'с игрушкой': {
            label: 'С игрушкой',
            icon: '🎮',
            description: ''
        },
        'активная роль': {
            label: 'Активная роль',
            icon: '🎭',
            description: ''
        },
        'пассивная роль': {
            label: 'Пассивная роль',
            icon: '🎭',
            description: ''
        },
        'период овуляции': {
            label: 'В период овуляции',
            icon: '🌸',
            description: 'Повышенная фертильность'
        },
        'во время месячных': {
            label: 'Во время месячных',
            icon: '🩸',
            description: ''
        }
    };

    async function show() {
        const state = HealthModule.getState();
        const currentActivity = state.todayEntry?.sexual_activity || '';

        // Показываем loader
        const loaderHtml = `
            <div style="padding: 40px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 16px;">⏳</div>
                <div>Загружаем опции...</div>
            </div>
        `;
        const modalHtml = BaseModal.createModalStructure('🔒 Интимная жизнь', loaderHtml, 'large');
        BaseModal.show(modalHtml);

        try {
            // ПРАВИЛЬНО: Используем OptionsCache который сам проверит TTL и кэш
            const optionsResponse = await OptionsCache.getUserOptions();

            if (!optionsResponse.success) {
                BaseModal.close();
                showToast('❌ Не удалось загрузить опции', 'error');
                console.error('Ошибка загрузки опций:', optionsResponse.error);
                return;
            }

            const serverOptions = optionsResponse.data?.sexual_activity_options || [];

            if (HealthConfig.DEBUG) {
                console.log('⚡ Загруженные опции:', {
                    source: optionsResponse.source,
                    count: serverOptions.length,
                    options: serverOptions,
                    hasCurrent: currentActivity,
                    currentInOptions: serverOptions.includes(currentActivity)
                });
            }

            if (serverOptions.length === 0) {
                BaseModal.close();
                showToast('⚠️ Нет доступных опций', 'warning');
                return;
            }

            // Генерируем контент с опциями
            let content = `
                <div class="sexual-activity-modal-content">
                    <div style="background: rgba(0, 150, 136, 0.1); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 20px;">🔒</span>
                            <strong style="color: var(--health-primary);">Приватная информация</strong>
                        </div>
                        <p style="font-size: 13px; color: var(--health-text-light); margin: 0;">
                            Эти данные видны только вам и защищены шифрованием.
                            Используются для анализа здоровья и самочувствия.
                        </p>
                    </div>

                    <div class="form-group">
                        <label>Выберите активность за сегодня</label>
                        <div class="activity-options" style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
            `;

            serverOptions.forEach(optionValue => {
                const option = OPTION_MAP[optionValue] || {
                    label: optionValue,
                    icon: '🔘',
                    description: ''
                };
                const isSelected = currentActivity === optionValue;

                content += `
                    <button
                        class="activity-option ${isSelected ? 'active' : ''}"
                        onclick="SexualActivityModal.select('${optionValue}')"
                        style="
                            padding: 12px 16px;
                            border: 2px solid ${isSelected ? 'var(--health-primary)' : 'var(--health-border)'};
                            border-radius: 8px;
                            background: ${isSelected ? 'rgba(0, 150, 136, 0.1)' : 'var(--health-card-bg)'};
                            cursor: pointer;
                            transition: all 0.2s ease;
                            text-align: left;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        "
                    >
                        <span style="font-size: 20px;">${option.icon}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--health-text); margin-bottom: 2px;">
                                ${option.label}
                            </div>
                            ${option.description ? `
                                <div style="font-size: 12px; color: var(--health-text-light);">
                                    ${option.description}
                                </div>
                            ` : ''}
                        </div>
                        ${isSelected ? '<span style="color: var(--health-primary); font-size: 20px;">✓</span>' : ''}
                    </button>
                `;
            });

            content += `
                        </div>
                    </div>

                    <div class="modal-actions" style="margin-top: 20px; display: flex; gap: 8px; justify-content: flex-end;">
                        ${currentActivity ? `
                            <button class="health-btn btn-danger" onclick="SexualActivityModal.clear()">
                                🗑️ Очистить
                            </button>
                        ` : ''}
                        <button class="health-btn btn-secondary" onclick="SexualActivityModal.close()">
                            Отмена
                        </button>
                    </div>
                </div>
            `;

            // Обновляем модальное окно
            const modal = document.querySelector('.base-modal-content');
            if (modal) {
                modal.innerHTML = content;
            }

        } catch (error) {
            console.error('❌ Ошибка в show модалки:', error);
            BaseModal.close();
            showToast('❌ Ошибка загрузки', 'error');
        }
    }

    async function select(activity) {
        console.log('🔒 Выбрана активность:', activity);

        const today = new Date().toISOString().split('T')[0];

        try {
            const response = await HealthAPI.addSexualActivity(today, activity);

            if (response.success) {
                showToast('✅ Информация сохранена', 'success');
                close();

                // Обновляем данные и перерисовываем Dashboard
                await HealthModule.refreshData();

                if (window.Dashboard && typeof Dashboard.init === 'function') {
                    Dashboard.init();
                }
            } else {
                throw new Error(response.error || 'Ошибка сохранения');
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения активности:', error);
            showToast('❌ Не удалось сохранить', 'error');
        }
    }

    async function clear() {
        if (!confirm('Удалить запись об интимной активности за сегодня?')) {
            return;
        }

        await select('нет');
    }

    function close() {
        BaseModal.close();
    }

    return {
        show,
        select,
        clear,
        close
    };
})();

// Экспорт в window
if (typeof window !== 'undefined') {
    window.SexualActivityModal = SexualActivityModal;
}
