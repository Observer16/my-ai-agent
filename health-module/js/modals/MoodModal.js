// js/modals/MoodModal.js
const MoodModal = (function() {

    function show(data = {}) {
        const date = data.date || new Date().toISOString().split('T')[0];
        const moods = HealthConstants.MOOD_EMOJIS;

        let content = '<div class="mood-options">';

        // Английские ключи: joy, satisfaction, neutral, sadness, stress, etc.
        for (const [moodKey, emoji] of Object.entries(moods)) {
            // Получаем локализованный ярлык настроения
            const moodLabel = typeof HealthConstants.getMoodLabel === 'function'
                ? HealthConstants.getMoodLabel(moodKey)
                : moodKey;

            content += `
                <button class="mood-btn" onclick="MoodModal.select('${moodKey}', '${date}')" type="button">
                    <span class="mood-emoji">${emoji}</span>
                    <span class="mood-text">${moodLabel}</span>
                </button>
            `;
        }

        content += '</div>';

        const title = typeof t === 'function' ? t('health.modals.mood.title') : '😊 Как настроение?';
        const modalHtml = BaseModal.createModalStructure(title, content);
        BaseModal.show(modalHtml);
    }

    async function select(mood, date = null) {
        console.log('😊 Выбрано настроение:', mood, 'для даты:', date);

        const targetDate = date || new Date().toISOString().split('T')[0];
        const success = await HealthModule.updateHealthEntry(targetDate, 'mood', mood);

        if (success) {
            const successMsg = typeof t === 'function' ? t('health.modals.mood.save_success') : '✅ Настроение сохранено';
            showToast(successMsg, 'success');
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
            const errorMsg = typeof t === 'function' ? t('health.modals.mood.save_error') : '❌ Не удалось сохранить настроение';
            showToast(errorMsg, 'error');
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