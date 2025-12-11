// health-module/js/modals/SymptomModal.js

import { BaseModal } from './BaseModal.js';

/**
 * Модальное окно добавления симптомов
 */
class SymptomModal extends BaseModal {
    constructor() {
        super();
        this.selectedCategory = null;
        this.selectedSymptom = null;
        this.intensity = 3;
        this.date = null;
    }

    show(data = {}) {
        this.date = data.date || new Date().toISOString().split('T')[0];

        const state = HealthModule.getState();
        const categories = state.userOptions?.symptom_categories || [];
        const symptomsByCategory = state.userOptions?.symptoms_by_category || {};

        const content = `
            <select id="symptom-category" class="modal-input" onchange="SymptomModal.updateSymptomsList()">
                <option value="">Выберите категорию</option>
                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            </select>
            <select id="symptom-name" class="modal-input" style="margin-top:12px;" disabled>
                <option value="">Сначала выберите категорию</option>
            </select>
            <div style="margin-top:12px;">
                <label>Интенсивность: <span id="intensity-value">3</span>/5</label>
                <input type="range" id="symptom-intensity" min="1" max="5" value="3"
                       oninput="document.getElementById('intensity-value').textContent=this.value; SymptomModal.setIntensity(this.value)">
            </div>
            <button class="health-btn btn-primary" onclick="SymptomModal.save()" style="width:100%; margin-top:16px;">
                Добавить
            </button>
        `;

        const modalHtml = this.createModalStructure('🤕 Добавить симптом', content, 'large');
        super.show(modalHtml);

        // Инициализируем данные
        this.initCategorySelect(categories, symptomsByCategory);
    }

    initCategorySelect(categories, symptomsByCategory) {
        const categorySelect = document.getElementById('symptom-category');
        if (categorySelect && categories.length > 0) {
            categorySelect.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.updateSymptomSelect(symptomsByCategory);
            });
        }
    }

    updateSymptomSelect(symptomsByCategory) {
        const nameSelect = document.getElementById('symptom-name');
        if (!nameSelect || !this.selectedCategory) return;

        const symptoms = symptomsByCategory[this.selectedCategory] || [];
        nameSelect.disabled = false;
        nameSelect.innerHTML = `
            <option value="">Выберите симптом</option>
            ${symptoms.map(s => `<option value="${s}">${s}</option>`).join('')}
        `;

        nameSelect.addEventListener('change', (e) => {
            this.selectedSymptom = e.target.value;
        });
    }

    static updateSymptomsList() {
        // Для обратной совместимости
        const instance = ModalManager.currentModal;
        if (instance && instance.updateSymptomSelect) {
            const state = HealthModule.getState();
            const symptomsByCategory = state.userOptions?.symptoms_by_category || {};
            instance.updateSymptomSelect(symptomsByCategory);
        }
    }

    static setIntensity(value) {
        const instance = ModalManager.currentModal;
        if (instance) {
            instance.intensity = parseInt(value);
        }
    }

    static async save() {
        const instance = ModalManager.currentModal;
        if (!instance) return;

        const category = instance.selectedCategory;
        const name = instance.selectedSymptom;
        const intensity = instance.intensity;

        if (!category || !name) {
            HealthUI.showToast('⚠️ Выберите категорию и симптом', 'warning');
            return;
        }

        const success = await HealthModule.updateHealthEntry(instance.date, 'symptoms', [
            { category, name, intensity }
        ]);

        if (success) {
            HealthUI.showToast('✅ Симптом добавлен', 'success');
            ModalManager.close();
            HealthModule.refreshData();
        }
    }
}

// Экспорт
if (typeof window !== 'undefined') {
    window.SymptomModal = SymptomModal;
}