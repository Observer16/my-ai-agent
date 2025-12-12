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
            container.innerHTML = '<p>Загрузка статистики...</p>';
            return;
        }

        container.innerHTML = renderStatsContent(state.stats);
    }

    function renderStatsContent(stats) {
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
                <h3>😊 Распределение настроений</h3>
                <div class="mood-stats">
                    ${renderMoodDistribution(stats.mood_distribution || {})}
                </div>
            </div>

            <div class="stats-section">
                <h3>⚠️ Частые симптомы</h3>
                <div class="symptoms-stats">
                    ${renderTopSymptoms(stats.symptom_frequency || {})}
                </div>
            </div>

            <div class="stats-section">
                <h3>📈 Статистика сна</h3>
                <div class="sleep-stats">
                    ${renderSleepStats(stats.sleep_statistics || {})}
                </div>
            </div>
        `;
    }

    function renderMoodDistribution(distribution) {
        if (Object.keys(distribution).length === 0) {
            return '<p>Нет данных о настроениях</p>';
        }

        let html = '<div class="mood-bars">';
        const total = Object.values(distribution).reduce((a, b) => a + b, 0);

        for (const [mood, count] of Object.entries(distribution)) {
            const percentage = total > 0 ? (count / total * 100) : 0;

            html += `
                <div class="mood-bar-item">
                    <div class="mood-label">
                        ${HealthFormatters.getMoodEmoji(mood)} ${mood}
                        <span class="mood-count">${count}</span>
                    </div>
                    <div class="mood-bar">
                        <div class="mood-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="mood-percentage">${percentage.toFixed(1)}%</div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    function renderTopSymptoms(frequency) {
        if (Object.keys(frequency).length === 0) {
            return '<p>Нет данных о симптомах</p>';
        }

        const sorted = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        let html = '<div class="top-symptoms">';

        sorted.forEach(([symptom, count]) => {
            const symptomName = symptom.includes(':') ? symptom.split(':')[1] : symptom;

            html += `
                <div class="top-symptom-item">
                    <div class="symptom-name">${symptomName}</div>
                    <div class="symptom-bar">
                        <div class="symptom-bar-fill" style="width: ${Math.min(count * 10, 100)}%"></div>
                    </div>
                    <div class="symptom-count">${count}</div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    function renderSleepStats(sleepStats) {
        return `
            <div class="sleep-stats">
                <div class="stat-item">
                    <div class="stat-label">Среднее</div>
                    <div class="stat-value">${sleepStats.average?.toFixed(1) || '0'} ч</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Минимум</div>
                    <div class="stat-value">${sleepStats.min?.toFixed(1) || '0'} ч</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Максимум</div>
                    <div class="stat-value">${sleepStats.max?.toFixed(1) || '0'} ч</div>
                </div>
            </div>
        `;
    }

    async function loadStats(days) {
        currentPeriod = days;

        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.getAttribute('data-days')) === days);
        });

        try {
            // TODO: Запрос к API за статистикой за период
            showToast('⚠️ Загрузка статистики за период в разработке', 'info');
        } catch (error) {
            console.error('❌ Ошибка загрузки статистики:', error);
            showToast('❌ Ошибка загрузки статистики', 'error');
        }
    }

    // Публичный API
    return {
        init,
        loadStats
    };
})();

// Экспорт
if (typeof window !== 'undefined') {
    window.Stats = Stats;
}