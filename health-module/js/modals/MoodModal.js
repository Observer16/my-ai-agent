// health-module/js/modals/MoodModal.js

import { BaseModal } from './BaseModal.js';
import { MOOD_EMOJIS } from '../utils/constants.js';

/**
 * Модальное окно выбора настроения
 */
class MoodModal extends BaseModal {
    show() {
        const content = `
            <div class="mood-options">
                ${Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => `
                    <button class="mood-btn" onclick="MoodModal.select('${mood}')">
                        <span class="mood-emoji">${emoji}</span>
                        <span class="mood-text">${mood}</span>
                    </button>
                `).join('')}
            </div>
        `;

        const modalHtml = this.createModalStructure('😊 Как настроение?', content);
        super.show(modalHtml);
    }

    static async select(mood) {
        const today = new Date().toISOString().split('T')[0];
        const success = await HealthModule.updateHealthEntry(today, 'mood', mood);

        if (success) {
            HealthUI.showToast('✅ Настроение сохранено', 'success');
            ModalManager.close();

            // Обновляем дашборд
            if (typeof Dashboard !== 'undefined') Dashboard.refresh();
        }
    }
}

// Экспорт
if (typeof window !== 'undefined') {
    window.MoodModal = MoodModal;
}