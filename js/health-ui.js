/**
 * Health UI - Компоненты интерфейса
 * Версия: 3.0.0
 */

window.HealthUI = {
    
    // ==================== ГЕНДЕР ====================
    
    showGenderSetup() {
        document.getElementById('gender-setup-modal').classList.add('active');
        document.getElementById('main-content').style.display = 'none';
    },
    
    showGenderChange() {
        const currentGender = HealthAPI.getGender();
        
        const modalHtml = `
            <div class="modal active" id="change-gender-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Изменить пол</h2>
                        <button class="modal-close" onclick="HealthUI.closeGenderChange()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="gender-buttons">
                            <button class="gender-btn ${currentGender === 'male' ? 'selected' : ''}"
                                    onclick="HealthUI.selectNewGender('male', this)">
                                <div class="gender-icon">♂️</div>
                                <div class="gender-label">Мужской</div>
                            </button>
                            <button class="gender-btn ${currentGender === 'female' ? 'selected' : ''}"
                                    onclick="HealthUI.selectNewGender('female', this)">
                                <div class="gender-icon">♀️</div>
                                <div class="gender-label">Женский</div>
                            </button>
                            <button class="gender-btn ${currentGender === 'other' ? 'selected' : ''}"
                                    onclick="HealthUI.selectNewGender('other', this)">
                                <div class="gender-icon">⚧️</div>
                                <div class="gender-label">Другой</div>
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancel" onclick="HealthUI.closeGenderChange()">Отмена</button>
                        <button class="btn-save" onclick="HealthUI.saveNewGender()">Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        window._newSelectedGender = currentGender;
    },
    
    selectNewGender(gender, element) {
        window._newSelectedGender = gender;
        
        document.querySelectorAll('#change-gender-modal .gender-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        element.classList.add('selected');
        
        tg.HapticFeedback.impactOccurred('light');
    },
    
    async saveNewGender() {
        if (window._newSelectedGender) {
            await HealthAPI.setGender(window._newSelectedGender);
            
            tg.showPopup({
                title: '✅ Сохранено',
                message: 'Пол успешно изменён',
                buttons: [{ type: 'ok' }]
            });
            
            this.closeGenderChange();
        }
    },
    
    closeGenderChange() {
        const modal = document.getElementById('change-gender-modal');
        if (modal) modal.remove();
        delete window._newSelectedGender;
    },
    
    // ==================== СЕГОДНЯШНЯЯ ЗАПИСЬ ====================
    
    renderTodayEntry(entry) {
        let html = '';
        
        if (entry.mood) {
            html += `
                <div class="entry-detail-row">
                    <span class="entry-detail-label">Настроение</span>
                    <span class="entry-detail-value">${HealthAPI.getMoodEmoji(entry.mood)} ${HealthAPI.getMoodDescription(entry.mood)}</span>
                </div>
            `;
        }
        
        if (entry.sleep_hours) {
            html += `
                <div class="entry-detail-row">
                    <span class="entry-detail-label">Сон</span>
                    <span class="entry-detail-value">😴 ${entry.sleep_hours} часов</span>
                </div>
            `;
        }
        
        if (entry.weight) {
            html += `
                <div class="entry-detail-row">
                    <span class="entry-detail-label">Вес</span>
                    <span class="entry-detail-value">⚖️ ${entry.weight} кг</span>
                </div>
            `;
        }
        
        if (entry.sexual_activity) {
            html += `
                <div class="entry-detail-row">
                    <span class="entry-detail-label">Активность</span>
                    <span class="entry-detail-value">💑 ${entry.sexual_activity}</span>
                </div>
            `;
        }
        
        if (entry.symptoms && entry.symptoms.length > 0) {
            const symptomsList = entry.symptoms.map(s => 
                `${s.category}: ${s.name} (${s.intensity}/5)`
            ).join(', ');
            
            html += `
                <div class="entry-detail-row">
                    <span class="entry-detail-label">Симптомы</span>
                    <span class="entry-detail-value">🩺 ${symptomsList}</span>
                </div>
            `;
        }
        
        if (entry.notes) {
            html += `
                <div class="entry-detail-row" style="flex-direction: column; align-items: flex-start;">
                    <span class="entry-detail-label">Заметки</span>
                    <span class="entry-detail-value" style="margin-top: 5px; opacity: 0.8;">${this.escapeHtml(entry.notes)}</span>
                </div>
            `;
        }
        
        document.getElementById('today-entry-body').innerHTML = html;
        document.getElementById('today-entry-section').style.display = 'block';
    },
    
    // ==================== ПРОСМОТР ЗАПИСИ ====================
    
    showViewModal(entry) {
        let html = '<div class="view-entry-grid">';
        
        if (entry.mood) {
            const feeling = getFeelingByMood(entry.mood);
            html += `
                <div class="view-metric">
                    <div class="view-metric-label">Настроение</div>
                    <div class="view-metric-value">${HealthAPI.getMoodEmoji(entry.mood)} ${feeling}/5</div>
                </div>
            `;
        }
        
        if (entry.sleep_hours) {
            html += `
                <div class="view-metric">
                    <div class="view-metric-label">Сон</div>
                    <div class="view-metric-value">😴 ${entry.sleep_hours}ч</div>
                </div>
            `;
        }
        
        if (entry.weight) {
            html += `
                <div class="view-metric">
                    <div class="view-metric-label">Вес</div>
                    <div class="view-metric-value">⚖️ ${entry.weight}кг</div>
                </div>
            `;
        }
        
        if (entry.sexual_activity) {
            html += `
                <div class="view-metric">
                    <div class="view-metric-label">Активность</div>
                    <div class="view-metric-value">💑</div>
                </div>
            `;
        }
        
        html += '</div>';
        
        // Дата
        html += `
            <div class="view-date">
                📅 ${HealthAPI.formatEntryDate(entry.entry_date)}
            </div>
        `;
        
        // Симптомы
        if (entry.symptoms && entry.symptoms.length > 0) {
            html += `
                <div class="view-symptoms">
                    <h4>🩺 Симптомы</h4>
                    <div class="symptoms-chips">
                        ${entry.symptoms.map(s =>
                            `<div class="symptom-chip selected">${this.escapeHtml(s.name)} (${s.intensity}/5)</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        // Заметки
        if (entry.notes) {
            html += `
                <div class="view-notes">
                    <h4>📝 Заметки</h4>
                    <div class="view-notes-text">${this.escapeHtml(entry.notes)}</div>
                </div>
            `;
        }
        
        const modal = document.getElementById('view-entry-modal');
        modal.querySelector('#view-entry-body').innerHTML = html;
        modal.dataset.entryDate = entry.entry_date;
        modal.classList.add('active');
    },
    
    // ==================== ВСПОМОГАТЕЛЬНЫЕ ====================
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

console.log('✅ Health UI загружен v3.0.0');
