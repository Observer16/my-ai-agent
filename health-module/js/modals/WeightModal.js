// js/modals/WeightModal.js
const WeightModal = (function() {

    function show() {
        const state = HealthModule.getState();
        const currentWeight = state.todayEntry?.weight || '';

        const content = `
            <div class="weight-modal-content">
                <div class="form-group">
                    <label for="modal-weight-input">
                        Ваш вес (кг)
                    </label>
                    <input
                        type="number"
                        id="modal-weight-input"
                        class="modal-input"
                        min="0"
                        max="500"
                        step="0.1"
                        value="${currentWeight}"
                        placeholder="Например: 70.5"
                        autofocus
                    >
                    <div style="font-size: 12px; color: var(--health-text-light); margin-top: 8px;">
                        💡 Для точного отслеживания рекомендуется взвешиваться утром до еды
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="WeightModal.close()">
                        Отмена
                    </button>
                    <button class="health-btn btn-primary" onclick="WeightModal.save()">
                        💾 Сохранить
                    </button>
                </div>
            </div>
        `;

        const modalHtml = BaseModal.createModalStructure('⚖️ Вес', content);
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
            showToast('⚠️ Введите вес', 'warning');
            return;
        }

        const weight = parseFloat(input.value);

        // Валидация
        if (isNaN(weight) || weight <= 0 || weight > 500) {
            showToast('❌ Некорректное значение веса (0-500 кг)', 'error');
            return;
        }

        console.log('💾 Сохраняем вес:', weight);

        import { getTodayLocal } from './utils/date-utils.js';
        const today = getTodayLocal();
        const success = await HealthModule.updateHealthEntry(today, 'weight', weight);

        if (success) {
            showToast('✅ Вес сохранён', 'success');
            close();

            // Обновляем данные и перерисовываем Dashboard
            await HealthModule.refreshData();

            if (window.Dashboard && typeof Dashboard.init === 'function') {
                Dashboard.init();
            }
        } else {
            showToast('❌ Не удалось сохранить вес', 'error');
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