// js/modals/MoodModal.js
const MoodModal = (function() {

    function show() {
        const moods = HealthConstants.MOOD_EMOJIS;

        let content = '<div class="mood-options">';

        for (const [mood, emoji] of Object.entries(moods)) {
            content += `
                <button class="mood-btn" onclick="MoodModal.select('${mood}')">
                    <span class="mood-emoji">${emoji}</span>
                    <span class="mood-text">${mood}</span>
                </button>
            `;
        }

        content += '</div>';

        const modalHtml = BaseModal.createModalStructure('😊 Как настроение?', content);
        BaseModal.show(modalHtml);
    }

    async function select(mood) {
        console.log('😊 Выбрано настроение:', mood);

        const today = new Date().toISOString().split('T')[0];
        const success = await HealthModule.updateHealthEntry(today, 'mood', mood);

        if (success) {
            showToast('✅ Настроение сохранено', 'success');
            BaseModal.close();

            // КРИТИЧНО: Обновляем данные и перерисовываем Dashboard
            await HealthModule.refreshData();

            // Перерисовываем Dashboard если он открыт
            if (window.Dashboard && typeof Dashboard.init === 'function') {
                Dashboard.init();
            }
        } else {
            showToast('❌ Не удалось сохранить настроение', 'error');
        }
    }

    // Публичный API
    return {
        show,
        select
    };
})();

// Экспорт в window
if (typeof window !== 'undefined') {
    window.MoodModal = MoodModal;
}

console.log('✅ MoodModal загружен');