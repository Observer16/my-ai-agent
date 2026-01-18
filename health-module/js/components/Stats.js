// js/components/Stats.js
const Stats = (function() {
    let currentPeriod = 30;

    function init() {
        console.log('📈 Инициализация компонента Stats');
        initPeriodButtons();
        renderStats();
    }

    function initPeriodButtons() {
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const days = parseInt(this.getAttribute('data-days'));
                loadStats(days);
            });
        });
    }

    function renderStats() {
        const container = document.getElementById('stats-content');
        if (!container) {
            console.warn('⚠️ Контейнер stats-content не найден');
            return;
        }

        const state = HealthModule.getState();

        if (!state.stats) {
            const loadingText = typeof t === 'function' ? t('health.stats.loading') : 'Загрузка статистики...';
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 16px; color: var(--health-text-light);">
                        ${loadingText}
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = renderStatsContent(state.stats);
    }

    function renderStatsContent(stats) {
        console.log('📊 Рендеринг статистики:', stats);

        const adherence = stats.medication_adherence || 0;
        const remaining = 100 - adherence;

        const adherenceTitle = typeof t === 'function' ? t('health.stats.adherence_title') : '💊 Приверженность лечению';
        const adherenceTaken = typeof t === 'function' ? t('health.stats.adherence_taken') : 'Принято вовремя';
        const adherenceMissed = typeof t === 'function' ? t('health.stats.adherence_missed') : 'Пропущено';
        const moodTitle = typeof t === 'function' ? t('health.stats.mood_title') : '😊 Настроение';
        const symptomsTitle = typeof t === 'function' ? t('health.stats.symptoms_title') : '⚠️ Частые симптомы';
        const sleepTitle = typeof t === 'function' ? t('health.stats.sleep_title') : '💤 Статистика сна';

        return `
            <div class="stats-section">
                <h3>${adherenceTitle}</h3>
                <div class="adherence-chart">
                    <div class="chart-container">
                        <div class="pie-chart" style="--percentage: ${adherence}%"></div>
                        <div class="chart-center">${Math.round(adherence)}%</div>
                    </div>
                    <div class="chart-legend">
                        <div class="legend-item">
                            <span class="legend-color" style="background-color: #4CAF50"></span>
                            <span>${adherenceTaken}: ${adherence.toFixed(1)}%</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background-color: #e0e0e0"></span>
                            <span>${adherenceMissed}: ${remaining.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="stats-section">
                <h3>${moodTitle}</h3>
                <div class="mood-trend">
                    ${renderMoodTrend(stats.mood_trend)}
                </div>
            </div>

            <div class="stats-section">
                <h3>${symptomsTitle}</h3>
                <div class="symptoms-stats">
                    ${renderTopSymptoms(stats.top_symptoms || [])}
                </div>
            </div>

            <div class="stats-section">
                <h3>${sleepTitle}</h3>
                <div class="sleep-stats">
                    ${renderSleepStats(stats)}
                </div>
            </div>
        `;
    }

    function renderMoodTrend(moodTrend) {
        const noMoodDataText = typeof t === 'function' ? t('health.stats.mood_no_data') : 'Нет данных о настроении';

        if (!moodTrend) {
            return `<p style="color: var(--health-text-light);">${noMoodDataText}</p>`;
        }

        const moodEmojis = {
            'отличное': '😄',
            'хорошее': '🙂',
            'нормальное': '😐',
            'плохое': '😔',
            'ужасное': '😭'
        };

        const emoji = moodEmojis[moodTrend] || '😐';
        const predominantText = typeof t === 'function' ? t('health.stats.mood_predominant') : 'Преобладающее настроение в выбранный период';

        return `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 64px; margin-bottom: 12px;">${emoji}</div>
                <div style="font-size: 20px; font-weight: 600; color: var(--health-text);">
                    ${moodTrend.charAt(0).toUpperCase() + moodTrend.slice(1)}
                </div>
                <div style="font-size: 14px; color: var(--health-text-light); margin-top: 8px;">
                    ${predominantText}
                </div>
            </div>
        `;
    }

    function renderTopSymptoms(symptoms) {
        const noSymptomsDataText = typeof t === 'function' ? t('health.stats.symptoms_no_data') : 'Нет данных о симптомах';

        if (!symptoms || symptoms.length === 0) {
            return `<p style="color: var(--health-text-light);">${noSymptomsDataText}</p>`;
        }

        let html = '<div class="top-symptoms">';

        // Находим максимальное количество для масштабирования прогресс-баров
        const maxCount = Math.max(...symptoms.map(s => s.count));

        symptoms.forEach(symptom => {
            const symptomName = symptom.name.replace(/_/g, ' ');
            const percentage = maxCount > 0 ? (symptom.count / maxCount * 100) : 0;

            html += `
                <div class="top-symptom-item">
                    <div class="symptom-name">${symptomName}</div>
                    <div class="symptom-bar">
                        <div class="symptom-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="symptom-count">${symptom.count}</div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    function renderSleepStats(stats) {
        const avgSleep = stats.average_sleep || 0;
        const entriesCount = stats.entries_count || 0;

        const avgLabel = typeof t === 'function' ? t('health.stats.sleep_average') : 'Среднее';
        const hoursUnit = typeof t === 'function' ? t('health.stats.sleep_hours_unit') : 'ч';
        const entriesLabel = typeof t === 'function' ? t('health.stats.sleep_entries') : 'Записей';
        const periodLabel = typeof t === 'function' ? t('health.stats.sleep_period') : 'Период';
        const daysUnit = typeof t === 'function' ? t('health.stats.sleep_days_unit') : 'дн';

        return `
            <div class="sleep-stats">
                <div class="stat-item">
                    <div class="stat-label">${avgLabel}</div>
                    <div class="stat-value">${avgSleep.toFixed(1)} ${hoursUnit}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">${entriesLabel}</div>
                    <div class="stat-value">${entriesCount}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">${periodLabel}</div>
                    <div class="stat-value">${stats.period_days || 0} ${daysUnit}</div>
                </div>
            </div>
        `;
    }

    async function loadStats(days) {
        currentPeriod = days;

        // Обновляем активную кнопку
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.getAttribute('data-days')) === days);
        });

        // Показываем загрузку
        const container = document.getElementById('stats-content');
        if (container) {
            let loadingMessage = `Загрузка статистики за ${days} дней...`;
            if (typeof t === 'function') {
                loadingMessage = t('health.stats.loading_for_days', { days: days });
            }

            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 16px; color: var(--health-text-light);">
                        ${loadingMessage}
                    </p>
                </div>
            `;
        }

        try {
            const response = await HealthAPI.getHealthSummary(days);

            if (response.success) {
                console.log('✅ Статистика загружена:', response.data);

                // Обновляем state
                StateManager.updateState({ stats: response.data });

                // Перерисовываем статистику
                renderStats();

                let successMessage = `✅ Статистика за ${days} дней загружена`;
                if (typeof t === 'function') {
                    successMessage = '✅ ' + t('health.stats.loaded_for_days', { days: days });
                }
                showToast(successMessage, 'success');
            } else {
                throw new Error(response.error || 'Ошибка загрузки статистики');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки статистики:', error);

            const errorTitle = typeof t === 'function' ? t('health.stats.error_load') : 'Не удалось загрузить статистику';
            const tryAgainBtn = typeof t === 'function' ? t('health.stats.try_again') : 'Попробовать снова';

            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <h3>${errorTitle}</h3>
                        <p style="color: var(--health-text-light); margin: 16px 0;">
                            ${error.message || 'Попробуйте позже'}
                        </p>
                        <button class="health-btn btn-primary" onclick="Stats.loadStats(${days})">
                            ${tryAgainBtn}
                        </button>
                    </div>
                `;
            }

            const errorMessage = typeof t === 'function' ? t('health.stats.error_load_message') : 'Ошибка загрузки статистики';
            showToast(`❌ ${errorMessage}`, 'error');
        }
    }

    // Публичный API
    return {
        init,
        loadStats
    };
})();

// Экспорт в window
if (typeof window !== 'undefined') {
    window.Stats = Stats;
}