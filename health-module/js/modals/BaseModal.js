// health-module/js/modals/BaseModal.js

/**
 * Базовый класс для модальных окон
 */
class BaseModal {
    constructor() {
        this.modalContainer = document.getElementById('health-modals');
        if (!this.modalContainer) {
            this.modalContainer = document.createElement('div');
            this.modalContainer.id = 'health-modals';
            document.body.appendChild(this.modalContainer);
        }
    }

    /**
     * Показать модальное окно
     */
    show(modalHtml) {
        this.modalContainer.innerHTML = modalHtml;
    }

    /**
     * Закрыть модальное окно
     */
    close() {
        this.modalContainer.innerHTML = '';
    }

    /**
     * Создать базовую структуру модального окна
     */
    createModalStructure(title, content, size = 'normal') {
        return `
            <div class="modal-overlay" onclick="ModalManager.close()">
                <div class="modal-content modal-${size}" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="ModalManager.close()">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Менеджер модальных окон
 */
const ModalManager = {
    currentModal: null,

    show(modalType, data = {}) {
        let modal;

        switch(modalType) {
            case 'mood-picker':
                modal = new MoodModal();
                break;
            case 'symptom-picker':
                modal = new SymptomModal();
                break;
            case 'sleep-input':
                modal = new SleepModal();
                break;
            case 'weight-input':
                modal = new WeightModal();
                break;
            case 'medication-form':
                modal = new MedicationModal();
                break;
            default:
                console.warn('Неизвестный тип модального окна:', modalType);
                return;
        }

        this.currentModal = modal;
        modal.show(data);
    },

    close() {
        if (this.currentModal) {
            this.currentModal.close();
            this.currentModal = null;
        }
    }
};

// Экспорт
if (typeof window !== 'undefined') {
    window.BaseModal = BaseModal;
    window.ModalManager = ModalManager;
}