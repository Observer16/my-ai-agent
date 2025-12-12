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
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 16px; color: var(--health-text-light);">
                        Загрузка статистики...
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

        return `
            <div class="stats-section">
                <h3>💊 Приверженность лечению</h3>
                <div class="adherence-chart">
                    <div class="chart-container">
                        <div class="pie-chart" style="--percentage: ${adherence}%"></div>
                        <div class="chart-center">${Math.round(adherence)}%</div>
                    </div>
                    <div class="chart-legend">
                        <div class="legend-item">
                            <span class="legend-color" style="background-color: #4CAF50"></span>
                            <span>Принято вовремя: ${adherence.toFixed(1)}%</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background-color: #e0e0e0"></span>
                            <span>Пропущено: ${remaining.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="stats-section">
                <h3>😊 Настроение</h3>
                <div class="mood-trend">
                    ${renderMoodTrend(stats.mood_trend)}
                </div>
            </div>

            <div class="stats-section">
                <h3>⚠️ Частые симптомы</h3>
                <div class="symptoms-stats">
                    ${renderTopSymptoms(stats.top_symptoms || [])}
                </div>
            </div>

            <div class="stats-section">
                <h3>💤 Статистика сна</h3>
                <div class="sleep-stats">
                    ${renderSleepStats(stats)}
                </div>
            </div>
        `;
    }

    function renderMoodTrend(moodTrend) {
        if (!moodTrend) {
            return '<p style="color: var(--health-text-light);">Нет данных о настроении</p>';
        }

        const moodEmojis = {
            'отличное': '😄',
            'хорошее': '🙂',
            'нормальное': '😐',
            'плохое': '😔',
            'ужасное': '😭'
        };

        const emoji = moodEmojis[moodTrend] || '😐';

        return `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 64px; margin-bottom: 12px;">${emoji}</div>
                <div style="font-size: 20px; font-weight: 600; color: var(--health-text);">
                    ${moodTrend.charAt(0).toUpperCase() + moodTrend.slice(1)}
                </div>
                <div style="font-size: 14px; color: var(--health-text-light); margin-top: 8px;">
                    Преобладающее настроение в выбранный период
                </div>
            </div>
        `;
    }

    function renderTopSymptoms(symptoms) {
        if (!symptoms || symptoms.length === 0) {
            return '<p style="color: var(--health-text-light);">Нет данных о симптомах</p>';
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

        return `
            <div class="sleep-stats">
                <div class="stat-item">
                    <div class="stat-label">Среднее</div>
                    <div class="stat-value">${avgSleep.toFixed(1)} ч</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Записей</div>
                    <div class="stat-value">${entriesCount}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Период</div>
                    <div class="stat-value">${stats.period_days || 0} дн</div>
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
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 16px; color: var(--health-text-light);">
                        Загрузка статистики за ${days} дней...
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

                showToast(`✅ Статистика за ${days} дней загружена`, 'success');
            } else {
                throw new Error(response.error || 'Ошибка загрузки статистики');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки статистики:', error);

            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <h3>Не удалось загрузить статистику</h3>
                        <p style="color: var(--health-text-light); margin: 16px 0;">
                            ${error.message || 'Попробуйте позже'}
                        </p>
                        <button class="health-btn btn-primary" onclick="Stats.loadStats(${days})">
                            Попробовать снова
                        </button>
                    </div>
                `;
            }

            showToast('❌ Ошибка загрузки статистики', 'error');
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