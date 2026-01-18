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

    // Функция для получения карты опций с поддержкой переводов
    function getOptionMap() {
        const isFunctionAvailable = typeof t === 'function';

        return {
            'нет': {
                label: isFunctionAvailable ? t('health.modals.sexual.options.no') : 'Не было',
                icon: '⭕',
                description: isFunctionAvailable ? t('health.modals.sexual.options.no_desc') : 'Нет активности'
            },
            'защищенный секс': {
                label: isFunctionAvailable ? t('health.modals.sexual.options.protected_sex') : 'Защищенный секс',
                icon: '🛡️',
                description: isFunctionAvailable ? t('health.modals.sexual.options.protected_sex_desc') : 'С использованием контрацепции'
            },
            'незащищенный секс': {
                label: isFunctionAvailable ? t('health.modals.sexual.options.unprotected_sex') : 'Незащищенный секс',
                icon: '⚠️',
                description: isFunctionAvailable ? t('health.modals.sexual.options.unprotected_sex_desc') : 'Без контрацепции'
            },
            'самостоятельно': {
                label: isFunctionAvailable ? t('health.modals.sexual.options.solo') : 'Самостоятельно',
                icon: '💭',
                description: isFunctionAvailable ? t('health.modals.sexual.options.solo_desc') : ''
            },
            'с игрушкой': {
                label: isFunctionAvailable ? t('health.modals.sexual.options.with_toy') : 'С игрушкой',
                icon: '🎮',
                description: isFunctionAvailable ? t('health.modals.sexual.options.with_toy_desc') : ''
            },
            'активная роль': {
                label: isFunctionAvailable ? t('health.modals.sexual.options.active_role') : 'Активная роль',
                icon: '🎭',
                description: isFunctionAvailable ? t('health.modals.sexual.options.active_role_desc') : ''
            },
            'пассивная роль': {
                label: isFunctionAvailable ? t('health.modals.sexual.options.passive_role') : 'Пассивная роль',
                icon: '🎭',
                description: isFunctionAvailable ? t('health.modals.sexual.options.passive_role_desc') : ''
            },
            'период овуляции': {
                label: isFunctionAvailable ? t('health.modals.sexual.options.ovulation') : 'В период овуляции',
                icon: '🌸',
                description: isFunctionAvailable ? t('health.modals.sexual.options.ovulation_desc') : 'Повышенная фертильность'
            },
            'во время месячных': {
                label: isFunctionAvailable ? t('health.modals.sexual.options.during_period') : 'Во время месячных',
                icon: '🩸',
                description: isFunctionAvailable ? t('health.modals.sexual.options.during_period_desc') : ''
            }
        };
    }

    // Кеш для OPTION_MAP
    let OPTION_MAP = getOptionMap();

    async function show() {
        const state = HealthModule.getState();
        const currentActivity = state.todayEntry?.sexual_activity || '';

        console.log('🔒 SexualActivityModal.show() вызван');

        // Показываем loader
        const loadingText = typeof t === 'function' ? t('health.modals.sexual.loading') : 'Загружаем опции...';
        const loaderHtml = `
            <div style="padding: 40px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 16px;">⏳</div>
                <div>${loadingText}</div>
            </div>
        `;
        const modalTitle = typeof t === 'function' ? t('health.modals.sexual.title') : '🔒 Интимная жизнь';
        const modalHtml = BaseModal.createModalStructure(modalTitle, loaderHtml, 'large');
        BaseModal.show(modalHtml);

        try {
            console.log('📡 Вызываем OptionsCache.getUserOptions()...');
            
            // Используем OptionsCache который сам проверит TTL и кэш
            const optionsResponse = await OptionsCache.getUserOptions();

            console.log('📥 Ответ от OptionsCache:', {
                success: optionsResponse.success,
                source: optionsResponse.source,
                hasData: !!optionsResponse.data,
                dataKeys: optionsResponse.data ? Object.keys(optionsResponse.data) : [],
                fullResponse: optionsResponse
            });

            if (!optionsResponse.success) {
                console.error('❌ OptionsCache вернул ошибку:', optionsResponse);
                BaseModal.close();
                const errorMsg = typeof t === 'function' ? t('health.modals.sexual.error_load_options') : '❌ Не удалось загрузить опции';
                showToast(errorMsg, 'error');
                return;
            }

            const serverOptions = optionsResponse.data?.sexual_activity_options || [];

            console.log('🔍 Опции сексуальной активности:', {
                source: optionsResponse.source,
                count: serverOptions.length,
                options: serverOptions,
                hasCurrent: !!currentActivity,
                currentInOptions: serverOptions.includes(currentActivity),
                rawData: optionsResponse.data
            });

            if (serverOptions.length === 0) {
                console.warn('⚠️ Массив sexual_activity_options пустой!');
                BaseModal.close();
                const errorMsg = typeof t === 'function' ? t('health.modals.sexual.error_no_options') : '⚠️ Нет доступных опций';
                showToast(errorMsg, 'warning');
                return;
            }

            // Генерируем контент с опциями
            const privacyNotice = typeof t === 'function' ? t('health.modals.sexual.privacy_notice') : '🔒 Приватная информация';
            const privacyDesc = typeof t === 'function' ? t('health.modals.sexual.privacy_description') : 'Эти данные видны только вам и защищены шифрованием. Используются для анализа здоровья и самочувствия.';
            const selectLabel = typeof t === 'function' ? t('health.modals.sexual.select_activity') : 'Выберите активность за сегодня';

            let content = `
                <div class="sexual-activity-modal-content">
                    <div style="background: rgba(0, 150, 136, 0.1); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 20px;">🔒</span>
                            <strong style="color: var(--health-primary);">${privacyNotice}</strong>
                        </div>
                        <p style="font-size: 13px; color: var(--health-text-light); margin: 0;">
                            ${privacyDesc}
                        </p>
                    </div>

                    <div class="form-group">
                        <label>${selectLabel}</label>
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

            const btnClear = typeof t === 'function' ? t('health.modals.sexual.btn_clear') : '🗑️ Очистить';
            const btnCancel = typeof t === 'function' ? t('health.modals.sexual.btn_cancel') : 'Отмена';

            content += `
                        </div>
                    </div>

                    <div class="modal-actions" style="margin-top: 20px; display: flex; gap: 8px; justify-content: flex-end;">
                        ${currentActivity ? `
                            <button class="health-btn btn-danger" onclick="SexualActivityModal.clear()">
                                ${btnClear}
                            </button>
                        ` : ''}
                        <button class="health-btn btn-secondary" onclick="SexualActivityModal.close()">
                            ${btnCancel}
                        </button>
                    </div>
                </div>
            `;

            console.log('✅ Контент сгенерирован, обновляем модальное окно');

            // Обновляем модальное окно (правильный селектор!)
            const modal = document.querySelector('.modal-body');
            if (modal) {
                modal.innerHTML = content;
                console.log('✅ Модальное окно обновлено');
            } else {
                console.error('❌ Не найден элемент .modal-body');
            }

        } catch (error) {
            console.error('❌ Ошибка в show модалки:', error);
            BaseModal.close();
            const errorMsg = typeof t === 'function' ? t('health.modals.sexual.error_load') : '❌ Ошибка загрузки';
            showToast(errorMsg, 'error');
        }
    }

    async function select(activity) {
        console.log('🔒 Выбрана активность:', activity);
        const today = getTodayLocal();

        try {
            const response = await HealthAPI.addSexualActivity(today, activity);

            if (response.success) {
                const successMsg = typeof t === 'function' ? t('health.modals.sexual.save_success') : '✅ Информация сохранена';
                showToast(successMsg, 'success');
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
            const errorMsg = typeof t === 'function' ? t('health.modals.sexual.error_save') : '❌ Не удалось сохранить';
            showToast(errorMsg, 'error');
        }
    }

    async function clear() {
        const confirmMsg = typeof t === 'function' ? t('health.modals.sexual.confirm_delete') : 'Удалить запись об интимной активности за сегодня?';
        if (!confirm(confirmMsg)) {
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
