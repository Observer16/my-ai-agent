/**
 * Health Forms - Формы создания и редактирования
 * Версия: 3.0.0
 */

window.HealthForms = {
    
    state: {
        editingDate: null,
        selectedMood: null,
        sleepHours: null,
        weight: null,
        selectedActivity: null,
        selectedSymptoms: [],
        notes: ''
    },
    
    // ==================== ОТКРЫТИЕ ФОРМЫ ====================
    
    openDetailedForm() {
        this.resetState();
        
        const today = HealthAPI.getTodayDate();
        this.state.editingDate = today;
        
        document.getElementById('modal-title').textContent = 'Новая запись';
        document.getElementById('entry-date-display').textContent = HealthAPI.formatEntryDate(today);
        
        this.initFormInputs();
        this.loadAvailableOptions();
        
        document.getElementById('detailed-modal').classList.add('active');
        tg.HapticFeedback.impactOccurred('light');
    },
    
    async openEditForm(entryDate, entry) {
        this.resetState();
        
        this.state.editingDate = entryDate;
        
        document.getElementById('modal-title').textContent = 'Редактирование записи';
        document.getElementById('entry-date-display').textContent = HealthAPI.formatEntryDate(entryDate);
        
        // Загружаем существующие значения
        if (entry.mood) this.state.selectedMood = entry.mood;
        if (entry.sleep_hours) this.state.sleepHours = entry.sleep_hours;
        if (entry.weight) this.state.weight = entry.weight;
        if (entry.sexual_activity) this.state.selectedActivity = entry.sexual_activity;
        if (entry.symptoms) this.state.selectedSymptoms = [...entry.symptoms];
        if (entry.notes) this.state.notes = entry.notes;
        
        this.initFormInputs();
        await this.loadAvailableOptions();
        this.fillFormWithData();
        
        document.getElementById('detailed-modal').classList.add('active');
        tg.HapticFeedback.impactOccurred('light');
    },
    
    closeDetailedForm() {
        document.getElementById('detailed-modal').classList.remove('active');
        this.resetState();
    },
    
    resetState() {
        this.state = {
            editingDate: null,
            selectedMood: null,
            sleepHours: null,
            weight: null,
            selectedActivity: null,
            selectedSymptoms: [],
            notes: ''
        };
    },
    
    // ==================== ИНИЦИАЛИЗАЦИЯ ФОРМЫ ====================
    
    initFormInputs() {
        // Настроение
        this.initMoodButtons();
        
        // Сон
        document.getElementById('sleep-input').value = this.state.sleepHours || '';
        document.getElementById('sleep-input').addEventListener('input', (e) => {
            this.state.sleepHours = parseFloat(e.target.value) || null;
        });
        
        // Вес
        document.getElementById('weight-input').value = this.state.weight || '';
        document.getElementById('weight-input').addEventListener('input', (e) => {
            this.state.weight = parseFloat(e.target.value) || null;
        });
        
        // Заметки
        document.getElementById('notes').value = this.state.notes || '';
        document.getElementById('notes').addEventListener('input', (e) => {
            this.state.notes = e.target.value;
            this.updateNotesCounter();
        });
        this.updateNotesCounter();
    },
    
    initMoodButtons() {
        const container = document.getElementById('mood-buttons');
        const moods = [
            { id: 'грусть', emoji: '😢', label: 'Грусть' },
            { id: 'стресс', emoji: '😫', label: 'Стресс' },
            { id: 'релакс', emoji: '😌', label: 'Релакс' },
            { id: 'радость', emoji: '😊', label: 'Радость' },
            { id: 'радостное_волнение', emoji: '🤩', label: 'Восторг' }
        ];
        
        container.innerHTML = moods.map(mood => `
            <button class="mood-chip ${this.state.selectedMood === mood.id ? 'selected' : ''}"
                    onclick="HealthForms.selectMood('${mood.id}')">
                <span class="mood-emoji">${mood.emoji}</span>
                <span class="mood-label">${mood.label}</span>
            </button>
        `).join('');
    },
    
    async loadAvailableOptions() {
        try {
            const options = await HealthAPI.getOptions();
            
            // Сексуальная активность
            this.initActivityButtons(options.sexual_activity_options || []);
            
            // Симптомы
            this.initSymptomSelector(options.symptom_categories || []);
            
        } catch (error) {
            console.error('Ошибка загрузки опций:', error);
            // Используем дефолтные опции
            const defaults = HealthAPI.getDefaultOptions();
            this.initActivityButtons(defaults.sexual_activity_options);
            this.initSymptomSelector(defaults.symptom_categories);
        }
    },
    
    initActivityButtons(activities) {
        const container = document.getElementById('activity-buttons');
        
        container.innerHTML = activities.map(activity => `
            <button class="activity-chip ${this.state.selectedActivity === activity ? 'selected' : ''}"
                    onclick="HealthForms.selectActivity('${activity}')">
                ${activity}
            </button>
        `).join('');
    },
    
    initSymptomSelector(categories) {
        const container = document.getElementById('symptoms-selector');
        
        // Упрощённый селектор симптомов
        // В реальности нужно загружать симптомы по категориям
        const commonSymptoms = [
            { category: 'общее', name: 'усталость' },
            { category: 'голова', name: 'головная_боль' },
            { category: 'живот', name: 'боль_в_животе' },
            { category: 'общее', name: 'температура' }
        ];
        
        container.innerHTML = `
            <div class="symptoms-chips">
                ${commonSymptoms.map(symptom => {
                    const isSelected = this.state.selectedSymptoms.some(
                        s => s.category === symptom.category && s.name === symptom.name
                    );
                    
                    return `
                        <button class="symptom-chip ${isSelected ? 'selected' : ''}"
                                onclick="HealthForms.toggleSymptom('${symptom.category}', '${symptom.name}')">
                            ${symptom.name}
                        </button>
                    `;
                }).join('')}
            </div>
            <div style="margin-top: 10px; font-size: 13px; opacity: 0.7;">
                💡 Нажмите на симптом, чтобы указать интенсивность
            </div>
        `;
    },
    
    fillFormWithData() {
        // Заполняем форму существующими данными
        if (this.state.selectedMood) {
            this.selectMood(this.state.selectedMood);
        }
        
        if (this.state.sleepHours) {
            document.getElementById('sleep-input').value = this.state.sleepHours;
        }
        
        if (this.state.weight) {
            document.getElementById('weight-input').value = this.state.weight;
        }
        
        if (this.state.selectedActivity) {
            this.selectActivity(this.state.selectedActivity);
        }
        
        if (this.state.notes) {
            document.getElementById('notes').value = this.state.notes;
            this.updateNotesCounter();
        }
    },
    
    // ==================== ВЫБОР ЗНАЧЕНИЙ ====================
    
    selectMood(mood) {
        this.state.selectedMood = mood;
        
        document.querySelectorAll('#mood-buttons .mood-chip').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = Array.from(document.querySelectorAll('#mood-buttons .mood-chip'))
            .find(btn => btn.textContent.includes(mood));
        
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        tg.HapticFeedback.impactOccurred('light');
    },
    
    selectActivity(activity) {
        this.state.selectedActivity = activity;
        
        document.querySelectorAll('#activity-buttons .activity-chip').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = Array.from(document.querySelectorAll('#activity-buttons .activity-chip'))
            .find(btn => btn.textContent.trim() === activity);
        
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        tg.HapticFeedback.impactOccurred('light');
    },
    
    toggleSymptom(category, name) {
        const existingIndex = this.state.selectedSymptoms.findIndex(
            s => s.category === category && s.name === name
        );
        
        if (existingIndex > -1) {
            // Удаляем симптом
            this.state.selectedSymptoms.splice(existingIndex, 1);
        } else {
            // Добавляем симптом с интенсивностью по умолчанию
            this.showIntensitySelector(category, name);
        }
        
        this.updateSymptomChips();
        tg.HapticFeedback.impactOccurred('light');
    },
    
    showIntensitySelector(category, name) {
        tg.showPopup({
            title: '📊 Интенсивность симптома',
            message: `Укажите интенсивность "${name}" от 1 до 5`,
            buttons: [
                { id: '1', type: 'default', text: '1 - Слабая' },
                { id: '2', type: 'default', text: '2' },
                { id: '3', type: 'default', text: '3 - Средняя' },
                { id: '4', type: 'default', text: '4' },
                { id: '5', type: 'default', text: '5 - Сильная' }
            ]
        }, (buttonId) => {
            if (buttonId && buttonId !== 'cancel') {
                const intensity = parseInt(buttonId);
                this.state.selectedSymptoms.push({ category, name, intensity });
                this.updateSymptomChips();
            }
        });
    },
    
    updateSymptomChips() {
        const container = document.getElementById('symptoms-selector');
        const chips = container.querySelectorAll('.symptom-chip');
        
        chips.forEach(chip => {
            const symptomName = chip.textContent.trim();
            const isSelected = this.state.selectedSymptoms.some(s => s.name === symptomName);
            
            if (isSelected) {
                chip.classList.add('selected');
            } else {
                chip.classList.remove('selected');
            }
        });
    },
    
    updateNotesCounter() {
        const length = document.getElementById('notes').value.length;
        document.getElementById('notes-counter').textContent = length;
        
        if (length > 1000) {
            document.getElementById('notes-counter').style.color = '#ef4444';
        } else {
            document.getElementById('notes-counter').style.color = '';
        }
    },
    
    // ==================== СОХРАНЕНИЕ ====================
    
    async saveDetailedEntry() {
        const entryDate = this.state.editingDate;
        
        if (!entryDate) {
            tg.showAlert('Ошибка: дата не указана');
            return;
        }
        
        try {
            tg.MainButton.showProgress();
            
            // Сохраняем каждое поле отдельно
            const promises = [];
            
            if (this.state.selectedMood) {
                promises.push(HealthAPI.addMood(entryDate, this.state.selectedMood));
            }
            
            if (this.state.sleepHours) {
                promises.push(HealthAPI.addSleep(entryDate, this.state.sleepHours));
            }
            
            if (this.state.weight) {
                promises.push(HealthAPI.addWeight(entryDate, this.state.weight));
            }
            
            if (this.state.selectedActivity) {
                promises.push(HealthAPI.addSexualActivity(entryDate, this.state.selectedActivity));
            }
            
            if (this.state.selectedSymptoms.length > 0) {
                promises.push(HealthAPI.addSymptoms(entryDate, this.state.selectedSymptoms));
            }
            
            if (this.state.notes && this.state.notes.trim()) {
                promises.push(HealthAPI.addNotes(entryDate, this.state.notes.trim()));
            }
            
            await Promise.all(promises);
            
            tg.MainButton.hideProgress();
            
            tg.showPopup({
                title: '✅ Сохранено',
                message: 'Запись успешно сохранена',
                buttons: [{ type: 'ok' }]
            });
            
            this.closeDetailedForm();
            
            // Обновляем данные
            await init();
            
        } catch (error) {
            tg.MainButton.hideProgress();
            console.error('Ошибка сохранения:', error);
            tg.showAlert('Ошибка: ' + error.message);
        }
    }
};

console.log('✅ Health Forms загружен v3.0.0');
