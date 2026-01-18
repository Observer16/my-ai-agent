// js/modals/WeightModal.js
const WeightModal = (function() {

    function show() {
        const state = HealthModule.getState();
        const currentWeight = state.todayEntry?.weight || '';

        const content = `
            <div class="weight-modal-content">
                <div class="form-group">
                    <label for="modal-weight-input">
                        ${t('health.modals.weight.field_weight')}
                    </label>
                    <input
                        type="number"
                        id="modal-weight-input"
                        class="modal-input"
                        min="0"
                        max="500"
                        step="0.1"
                        value="${currentWeight}"
                        placeholder="${t('health.modals.weight.field_weight_placeholder')}"
                        autofocus
                    >
                    <div style="font-size: 12px; color: var(--health-text-light); margin-top: 8px;">
                        ${t('health.modals.weight.hint')}
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="WeightModal.close()">
                        ${t('health.modals.weight.btn_cancel')}
                    </button>
                    <button class="health-btn btn-primary" onclick="WeightModal.save()">
                        ${t('health.modals.weight.btn_save')}
                    </button>
                </div>
            </div>
        `;

        const modalHtml = BaseModal.createModalStructure(t('health.modals.weight.title'), content);
        BaseModal.show(modalHtml);

        // Фокус на поле ввода
        setTimeout(() => {
            const input = document.getElementById('modal-weight-input');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);

        // Enter для сохранения
        const input = document.getElementById('modal-weight-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    save();
                }
            });
        }
    }

    async function save() {
        const input = document.getElementById('modal-weight-input');

        if (!input || !input.value) {
            showToast(t('health.modals.weight.error_empty'), 'warning');
            return;
        }

        const weight = parseFloat(input.value);

        // Валидация
        if (isNaN(weight) || weight <= 0 || weight > 500) {
            showToast(t('health.modals.weight.error_invalid'), 'error');
            return;
        }

        console.log('💾 Сохраняем вес:', weight);

        const today = getTodayLocal();
        const success = await HealthModule.updateHealthEntry(today, 'weight', weight);

        if (success) {
            showToast(t('health.modals.weight.save_success'), 'success');
            close();

            // Обновляем данные и перерисовываем Dashboard
            await HealthModule.refreshData();

            if (window.Dashboard && typeof Dashboard.init === 'function') {
                Dashboard.init();
            }
        } else {
            showToast(t('health.modals.weight.save_error'), 'error');
        }
    }

    function close() {
        BaseModal.close();
    }

    // Публичный API
    return {
        show,
        save,
        close
    };
})();

// Экспорт в window
if (typeof window !== 'undefined') {
    window.WeightModal = WeightModal;
}

console.log('✅ WeightModal загружен');