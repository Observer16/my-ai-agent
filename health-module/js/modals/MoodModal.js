// js/modals/MoodModal.js
const MoodModal = (function() {

    function show(data = {}) {
        const date = data.date || new Date().toISOString().split('T')[0];
        const moods = HealthConstants.MOOD_EMOJIS;

        let content = '<div class="mood-options">';

        for (const [mood, emoji] of Object.entries(moods)) {
            content += `
                <button class="mood-btn" onclick="MoodModal.select('${mood}', '${date}')">
                    <span class="mood-emoji">${emoji}</span>
                    <span class="mood-text">${mood}</span>
                </button>
            `;
        }

        content += '</div>';

        const modalHtml = BaseModal.createModalStructure('😊 Как настроение?', content);
        BaseModal.show(modalHtml);
    }

    async function select(mood, date = null) {
        console.log('😊 Выбрано настроение:', mood, 'для даты:', date);

        const targetDate = date || new Date().toISOString().split('T')[0];
        const success = await HealthModule.updateHealthEntry(targetDate, 'mood', mood);

        if (success) {
            showToast('✅ Настроение сохранено', 'success');
            BaseModal.close();

            // Обновляем Diary если он открыт
            if (window.Diary && typeof Diary.loadDate === 'function') {
                Diary.loadDate(targetDate);
            }

            // Также обновляем Dashboard если он открыт (для совместимости)
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