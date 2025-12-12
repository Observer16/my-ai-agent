// health-module/js/components/Stats.js

import { getMoodEmoji } from 'health-module/js/utils/formatters.js';

/**
 * Компонент статистики здоровья
 */
const Stats = {
    currentPeriod: 30, // дней по умолчанию

    /**
     * Инициализация компонентов статистики
     */
    init() {
        this.renderStats();
        this.initPeriodButtons();
    },

    /**
     * Отобразить статистику
     */
    renderStats() {
        const container = document.getElementById('stats-content');
        if (!container) return;

        const state = HealthModule.getState();

        if (!state.stats) {
            container.innerHTML = '<p>Загрузка статистики...</p>';
            return;
        }

        container.innerHTML = this.renderStatsContent(state.stats);
    },

    /**
     * Рендер контента статистики
     */
    renderStatsContent(stats) {
        // Отображаем круговую диаграмму приверженности
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
                    ${this.renderMoodDistribution(stats.mood_distribution || {})}
                </div>
            </div>

            <div class="stats-section">
                <h3>⚠️ Частые симптомы</h3>
                <div class="symptoms-stats">
                    ${this.renderTopSymptoms(stats.symptom_frequency || {})}
                </div>
            </div>

            <div class="stats-section">
                <h3>📈 Статистика сна</h3>
                <div class="sleep-stats">
                    ${this.renderSleepStats(stats.sleep_statistics || {})}
                </div>
            </div>
        `;
    },

    /**
     * Отобразить распределение настроений
     */
    renderMoodDistribution(distribution) {
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
                        ${getMoodEmoji(mood)} ${mood}
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
    },

    /**
     * Отобразить топ симптомов
     */
    renderTopSymptoms(frequency) {
        if (Object.keys(frequency).length === 0) {
            return '<p>Нет данных о симптомах</p>';
        }

        // Сортируем по частоте
        const sorted = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        let html = '<div class="top-symptoms">';

        sorted.forEach(([symptom, count]) => {
            // Извлекаем название симптома из ключа (формат "категория:симптом")
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
    },

    /**
     * Рендер статистики сна
     */
    renderSleepStats(sleepStats) {
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
    },

    /**
     * Инициализация кнопок периода
     */
    initPeriodButtons() {
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const days = parseInt(this.getAttribute('data-days'));
                Stats.loadStats(days);
            });
        });
    },

    /**
     * Загрузка статистики за период
     */
    async loadStats(days) {
        this.currentPeriod = days;

        // Обновляем активную кнопку
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.getAttribute('data-days')) === days);
        });

        try {
            // Здесь должен быть запрос к API за статистикой за указанный период
            const response = await HealthAPI.getStats(days);
            if (response.success) {
                // Обновляем статистику в HealthModule
                HealthModule.setState({ stats: response.data });
                this.renderStats();
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки статистики:', error);
            HealthUI.showToast('Ошибка загрузки статистики', 'error');
        }
    }
};

// Экспорт компонента
if (typeof window !== 'undefined') {
    window.Stats = Stats;
}