/**
 * Health Stats - Статистика и аналитика
 * Версия: 3.0.0
 */

window.HealthStats = {
    
    // ==================== ОСНОВНАЯ СТАТИСТИКА ====================
    
    renderStatistics(stats) {
        // Средняя оценка настроения
        const avgFeeling = stats.mood_distribution 
            ? this.calculateAverageMoodFeeling(stats.mood_distribution)
            : 0;
        
        document.getElementById('avg-feeling').textContent = 
            avgFeeling > 0 ? `${avgFeeling.toFixed(1)}/5` : '-';
        
        // Средний сон
        const avgSleep = stats.sleep_statistics?.average || 0;
        document.getElementById('avg-sleep').textContent = 
            avgSleep > 0 ? `${avgSleep.toFixed(1)}ч` : '-';
        
        // Количество записей
        document.getElementById('total-entries').textContent = 
            stats.total_entries || 0;
        
        // Streak (дни подряд) - вычисляем отдельно
        this.calculateAndDisplayStreak();
    },
    
    calculateAverageMoodFeeling(moodDistribution) {
        const feelingMap = {
            'грусть': 1,
            'стресс': 2,
            'тревожность': 2,
            'раздраженность': 2,
            'обидчивость': 2,
            'релакс': 3,
            'радость': 4,
            'радостное_волнение': 5
        };
        
        let total = 0;
        let count = 0;
        
        Object.entries(moodDistribution).forEach(([mood, freq]) => {
            const feeling = feelingMap[mood] || 3;
            total += feeling * freq;
            count += freq;
        });
        
        return count > 0 ? total / count : 0;
    },
    
    async calculateAndDisplayStreak() {
        try {
            const entries = await HealthAPI.getEntriesByDays(365);
            if (!entries || entries.length === 0) {
                document.getElementById('streak').textContent = '0';
                return;
            }
            
            // Сортируем по дате (новые первыми)
            entries.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
            
            let streak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            for (let i = 0; i < entries.length; i++) {
                const entryDate = new Date(entries[i].entry_date);
                entryDate.setHours(0, 0, 0, 0);
                
                const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === streak) {
                    streak++;
                } else if (diffDays > streak) {
                    break;
                }
            }
            
            document.getElementById('streak').textContent = streak;
            
        } catch (error) {
            console.error('Ошибка подсчёта streak:', error);
            document.getElementById('streak').textContent = '0';
        }
    },
    
    // ==================== ГРАФИК ТРЕНДОВ ====================
    
    renderTrendChart(stats) {
        const container = document.getElementById('trend-chart');
        
        if (!stats.daily_summary || stats.daily_summary.length === 0) {
            container.innerHTML = '<div class="empty-state">Недостаточно данных для графика</div>';
            return;
        }
        
        // Берём последние 14 дней
        const last14Days = stats.daily_summary.slice(-14);
        
        container.innerHTML = last14Days.map(day => {
            const date = new Date(day.entry_date);
            const dayStr = date.getDate();
            const monthStr = date.toLocaleDateString('ru-RU', { month: 'short' });
            const dateLabel = `${dayStr} ${monthStr}`;
            
            // Вычисляем feeling из mood
            const feeling = day.mood ? getFeelingByMood(day.mood) : 3;
            const percent = (feeling / 5) * 100;
            const feelingClass = `feeling-${feeling}`;
            const emoji = day.mood ? HealthAPI.getMoodEmoji(day.mood) : '😐';
            
            return `
                <div class="chart-row">
                    <div class="chart-date">${dateLabel}</div>
                    <div class="chart-bar-container">
                        <div class="chart-bar ${feelingClass}" style="width: ${percent}%">
                            ${emoji}
                        </div>
                    </div>
                    <div class="chart-value">${feeling}/5</div>
                </div>
            `;
        }).join('');
    },
    
    // ==================== ИНСАЙТЫ ====================
    
    renderInsights(stats) {
        const container = document.getElementById('insights-list');
        const section = document.getElementById('insights-section');
        
        if (!stats.total_entries || stats.total_entries < 3) {
            section.style.display = 'none';
            return;
        }
        
        const insights = this.generateInsights(stats);
        
        if (insights.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        container.innerHTML = insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <div class="insight-text">${insight.text}</div>
            </div>
        `).join('');
    },
    
    generateInsights(stats) {
        const insights = [];
        
        // Анализ настроения
        if (stats.mood_distribution) {
            const avgFeeling = this.calculateAverageMoodFeeling(stats.mood_distribution);
            
            if (avgFeeling >= 4) {
                insights.push({
                    type: 'positive',
                    text: `✨ Отличный период! Ваше среднее настроение — ${avgFeeling.toFixed(1)}/5. Продолжайте в том же духе!`
                });
            } else if (avgFeeling < 2.5) {
                insights.push({
                    type: 'negative',
                    text: `😔 Настроение ниже обычного (${avgFeeling.toFixed(1)}/5). Возможно, стоит больше отдыхать и обратить внимание на здоровье.`
                });
            }
        }
        
        // Анализ сна
        if (stats.sleep_statistics && stats.sleep_statistics.average) {
            const avgSleep = stats.sleep_statistics.average;
            
            if (avgSleep < 6) {
                insights.push({
                    type: 'warning',
                    text: `😴 Недостаточно сна (${avgSleep.toFixed(1)} часов в среднем). Хороший сон — основа хорошего самочувствия.`
                });
            } else if (avgSleep >= 7 && avgSleep <= 9) {
                insights.push({
                    type: 'positive',
                    text: `💤 Отличный режим сна! ${avgSleep.toFixed(1)} часов — это оптимально для здоровья.`
                });
            }
        }
        
        // Регулярность записей
        if (stats.total_entries >= HealthApp.state.currentPeriodDays * 0.8) {
            insights.push({
                type: 'positive',
                text: `🔥 Отличная регулярность! Вы ведёте дневник ${stats.total_entries} из ${HealthApp.state.currentPeriodDays} дней.`
            });
        }
        
        // Приверженность к лечению
        if (stats.medication_adherence && stats.medication_adherence > 0) {
            if (stats.medication_adherence >= 85) {
                insights.push({
                    type: 'positive',
                    text: `💊 Отличная приверженность к лечению: ${stats.medication_adherence.toFixed(1)}%!`
                });
            } else if (stats.medication_adherence < 60) {
                insights.push({
                    type: 'warning',
                    text: `⚠️ Приверженность к лечению низкая: ${stats.medication_adherence.toFixed(1)}%. Не забывайте принимать лекарства!`
                });
            }
        }
        
        return insights;
    },
    
    // ==================== ТОП СИМПТОМОВ ====================
    
    renderTopSymptoms(stats) {
        const container = document.getElementById('symptoms-cloud');
        const section = document.getElementById('symptoms-section');
        
        if (!stats.symptom_frequency || Object.keys(stats.symptom_frequency).length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        
        // Сортируем симптомы по частоте
        const sortedSymptoms = Object.entries(stats.symptom_frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Топ-10
        
        container.innerHTML = sortedSymptoms.map(([symptom, count]) => {
            // Формат: "категория:название"
            const [category, name] = symptom.split(':');
            
            return `
                <div class="symptom-badge">
                    <span>${name || symptom}</span>
                    <span class="symptom-count">${count}</span>
                </div>
            `;
        }).join('');
    }
};

console.log('✅ Health Stats загружен v3.0.0');
