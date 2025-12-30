/**
 * Компонент "Настройки здоровья"
 * Управление профилем пользователя (рост, вес, мерки тела)
 */

const SettingsComponent = {
    /**
     * Состояние компонента
     */
    state: {
        profile: null,
        loading: false,
        saving: false,
        genderOptions: [
            { value: 'male', label: 'Мужской' },
            { value: 'female', label: 'Женский' },
            { value: 'other', label: 'Другой' },
            { value: 'prefer_not_to_say', label: 'Не указывать' }
        ]
    },

    /**
     * Рендер главного контейнера
     */
    render() {
        return `
            <div class="settings-container">
                <div class="settings-header">
                    <h1 class="settings-title">
                        <span class="settings-icon">⚙️</span>
                        Настройки здоровья
                    </h1>
                    <p class="settings-subtitle">
                        Профиль и антропометрические данные
                    </p>
                </div>

                <div id="settings-error" class="settings-error" style="display: none;"></div>
                <div id="settings-success" class="settings-success" style="display: none;"></div>

                <div class="settings-content">
                    ${this.renderProfileSection()}
                </div>
            </div>
        `;
    },

    /**
     * Рендер секции профиля
     */
    renderProfileSection() {
        if (this.state.loading) {
            return `
                <div class="settings-section">
                    <div class="loading-spinner"></div>
                    <p>Загрузка профиля...</p>
                </div>
            `;
        }

        const profile = this.state.profile || {};

        return `
            <div class="settings-section profile-section">
                <div class="section-header">
                    <div class="section-icon">👤</div>
                    <div class="section-info">
                        <h2 class="section-title">Профиль пользователя</h2>
                        <p class="section-description">
                            Основные данные для анализа здоровья
                        </p>
                    </div>
                </div>

                <form id="profile-form" class="profile-form">
                    <!-- Пол -->
                    <div class="form-group">
                        <label class="form-label">
                            <span>Пол</span>
                        </label>
                        <select 
                            id="gender"
                            name="gender"
                            class="form-input form-select"
                        >
                            <option value="">Не указан</option>
                            ${this.state.genderOptions.map(opt => `
                                <option 
                                    value="${opt.value}" 
                                    ${profile.gender === opt.value ? 'selected' : ''}
                                >
                                    ${opt.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <!-- Дата рождения -->
                    <div class="form-group">
                        <label class="form-label">
                            <span>Дата рождения</span>
                            ${profile.age ? `<span class="form-hint">Возраст: ${profile.age} лет</span>` : ''}
                        </label>
                        <input 
                            type="date" 
                            id="birth_date"
                            name="birth_date"
                            class="form-input form-input-compact" 
                            value="${profile.birth_date || ''}"
                        />
                    </div>

                    <!-- Рост -->
                    <div class="form-group">
                        <label class="form-label">
                            <span>Рост</span>
                            <span class="form-hint">в сантиметрах</span>
                        </label>
                        <input 
                            type="number" 
                            id="height_cm"
                            name="height_cm"
                            class="form-input form-input-compact" 
                            min="50"
                            max="250"
                            step="1"
                            placeholder=""
                            value="${profile.height_cm || ''}"
                        />
                    </div>

                    <!-- Вес -->
                    <div class="form-group">
                        <label class="form-label">
                            <span>Вес</span>
                            <span class="form-hint">в килограммах</span>
                        </label>
                        <input 
                            type="number" 
                            id="weight_kg"
                            name="weight_kg"
                            class="form-input form-input-compact" 
                            min="20"
                            max="300"
                            step="0.1"
                            placeholder=""
                            value="${profile.weight_kg || ''}"
                        />
                    </div>

                    <div class="form-divider">
                        <span>Мерки тела</span>
                    </div>

                    <!-- Обхват груди -->
                    <div class="form-group">
                        <label class="form-label">
                            <span>Обхват груди</span>
                            <span class="form-hint">в сантиметрах</span>
                        </label>
                        <input 
                            type="number" 
                            id="chest_cm"
                            name="chest_cm"
                            class="form-input form-input-compact" 
                            min="50"
                            max="200"
                            step="0.5"
                            placeholder=""
                            value="${profile.chest_cm || ''}"
                        />
                    </div>

                    <!-- Обхват талии -->
                    <div class="form-group">
                        <label class="form-label">
                            <span>Обхват талии</span>
                            <span class="form-hint">в сантиметрах</span>
                        </label>
                        <input 
                            type="number" 
                            id="waist_cm"
                            name="waist_cm"
                            class="form-input form-input-compact" 
                            min="40"
                            max="200"
                            step="0.5"
                            placeholder=""
                            value="${profile.waist_cm || ''}"
                        />
                    </div>

                    <!-- Обхват бёдер -->
                    <div class="form-group">
                        <label class="form-label">
                            <span>Обхват бёдер</span>
                            <span class="form-hint">в сантиметрах</span>
                        </label>
                        <input 
                            type="number" 
                            id="hips_cm"
                            name="hips_cm"
                            class="form-input form-input-compact" 
                            min="50"
                            max="200"
                            step="0.5"
                            placeholder=""
                            value="${profile.hips_cm || ''}"
                        />
                    </div>

                    <!-- Обхват шеи -->
                    <div class="form-group">
                        <label class="form-label">
                            <span>Обхват шеи</span>
                            <span class="form-hint">в сантиметрах</span>
                        </label>
                        <input 
                            type="number" 
                            id="neck_cm"
                            name="neck_cm"
                            class="form-input form-input-compact" 
                            min="20"
                            max="60"
                            step="0.5"
                            placeholder=""
                            value="${profile.neck_cm || ''}"
                        />
                    </div>

                    <!-- Обхват бицепса -->
                    <div class="form-group">
                        <label class="form-label">
                            <span>Обхват бицепса</span>
                            <span class="form-hint">в сантиметрах</span>
                        </label>
                        <input 
                            type="number" 
                            id="biceps_cm"
                            name="biceps_cm"
                            class="form-input form-input-compact" 
                            min="15"
                            max="60"
                            step="0.5"
                            placeholder=""
                            value="${profile.biceps_cm || ''}"
                        />
                    </div>

                    <!-- Кнопки -->
                    <div class="form-actions">
                        <button 
                            type="submit" 
                            class="btn btn-primary btn-block"
                            ${this.state.saving ? 'disabled' : ''}
                        >
                            ${this.state.saving ? `
                                <div class="loading-spinner-small"></div>
                                <span>Сохранение...</span>
                            ` : `
                                <span>💾</span>
                                <span>Сохранить</span>
                            `}
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Инициализация компонента
     */
    async init() {
        await this.loadProfile();
        this.attachEventListeners();
    },

    /**
     * Загрузка профиля
     */
    async loadProfile() {
        this.state.loading = true;
        this.updateView();

        try {
            const response = await HealthAPI.getUserProfile();
            
            if (response.success) {
                this.state.profile = response.data;
                console.log('✅ Profile loaded:', this.state.profile);
            } else {
                this.showError('Ошибка загрузки профиля');
            }
        } catch (error) {
            console.error('❌ Error loading profile:', error);
            this.showError('Не удалось загрузить профиль');
        } finally {
            this.state.loading = false;
            this.updateView();
        }
    },

    /**
     * Привязка обработчиков событий
     */
    attachEventListeners() {
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const genderSelect = document.getElementById('gender');
        if (genderSelect) {
            genderSelect.addEventListener('change', (e) => this.handleGenderChange(e));
        }
    },

    /**
     * Обработка изменения пола через централизованный HealthModule
     */
    async handleGenderChange(event) {
        const newGender = event.target.value;
        
        if (!newGender) return;

        try {
            console.log('⚧️ Обновление пола через Settings:', newGender);

            // Используем централизованный метод через HealthModule
            const result = await HealthModule.updateGender(newGender);

            if (result.success) {
                this.state.profile.gender = newGender;
                this.showSuccess('✅ Пол обновлён. Опции обновлены.');
                
                console.log('✅ Пол обновлён, другие компоненты обновятся автоматически');
            } else {
                this.showError(result.error || 'Ошибка обновления пола');
                event.target.value = this.state.profile.gender || '';
            }
        } catch (error) {
            console.error('❌ Error updating gender:', error);
            this.showError('Не удалось обновить пол');
            event.target.value = this.state.profile.gender || '';
        }
    },

    /**
     * Обработка отправки формы
     */
    async handleSubmit(event) {
        event.preventDefault();

        if (this.state.saving) return;

        this.state.saving = true;
        this.updateView();

        try {
            const formData = new FormData(event.target);
            const data = {};

            for (const [key, value] of formData.entries()) {
                if (key === 'gender') continue;
                
                if (value && value.trim() !== '') {
                    if (key !== 'birth_date') {
                        data[key] = parseFloat(value);
                    } else {
                        data[key] = value;
                    }
                }
            }

            if (Object.keys(data).length === 0) {
                this.showError('Нет данных для сохранения');
                return;
            }

            console.log('📤 Saving profile:', data);

            const response = await HealthAPI.updateUserProfile(data);

            if (response.success) {
                this.state.profile = response.data;
                this.showSuccess('✅ Профиль успешно обновлён');
                this.updateView();
            } else {
                this.showError(response.error || 'Ошибка сохранения профиля');
            }
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            this.showError('Не удалось сохранить профиль');
        } finally {
            this.state.saving = false;
            this.updateView();
        }
    },

    /**
     * Обновление вида
     */
    updateView() {
        const container = document.getElementById('health-container');
        if (container) {
            container.innerHTML = this.render();
            this.attachEventListeners();
        }
    },

    /**
     * Показать ошибку
     */
    showError(message) {
        const errorEl = document.getElementById('settings-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
    },

    /**
     * Показать успех
     */
    showSuccess(message) {
        const successEl = document.getElementById('settings-success');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 3000);
        }
    }
};

window.SettingsComponent = SettingsComponent;
