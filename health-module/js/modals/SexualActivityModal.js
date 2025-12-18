// js/modals/SexualActivityModal.js
const SexualActivityModal = (function() {

    function show() {
        const state = HealthModule.getState();
        const userGender = state.userGender || 'other';
        const currentActivity = state.todayEntry?.sexual_activity || '';

        // Опции в зависимости от гендера
        const options = getOptionsForGender(userGender);

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

        options.forEach(option => {
            const isSelected = currentActivity === option.value;
            content += `
                <button
                    class="activity-option ${isSelected ? 'active' : ''}"
                    onclick="SexualActivityModal.select('${option.value}')"
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

                <div class="modal-actions" style="margin-top: 20px;">
                    <button class="health-btn btn-secondary" onclick="SexualActivityModal.close()">
                        Отмена
                    </button>
                    ${currentActivity ? `
                        <button class="health-btn btn-danger" onclick="SexualActivityModal.clear()">
                            🗑️ Очистить
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        const modalHtml = BaseModal.createModalStructure('🔒 Интимная жизнь', content, 'large');
        BaseModal.show(modalHtml);
    }

    function getOptionsForGender(gender) {
        const baseOptions = [
            {
                value: 'нет',
                label: 'Не было',
                icon: '⭕',
                description: 'Нет активности'
            },
            {
                value: 'защищенный секс',
                label: 'Защищенный секс',
                icon: '🛡️',
                description: 'С использованием контрацепции'
            },
            {
                value: 'незащищенный секс',
                label: 'Незащищенный секс',
                icon: '⚠️',
                description: 'Без контрацепции'
            },
            {
                value: 'самостоятельно',
                label: 'Самостоятельно',
                icon: '💭',
                description: ''
            }
        ];

        if (gender === 'female') {
            return [
                ...baseOptions,
                {
                    value: 'период овуляции',
                    label: 'В период овуляции',
                    icon: '🌸',
                    description: 'Повышенная фертильность'
                },
                {
                    value: 'во время месячных',
                    label: 'Во время месячных',
                    icon: '🩸',
                    description: ''
                }
            ];
        }

        return baseOptions;
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

    // Публичный API
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

console.log('✅ SexualActivityModal загружен');