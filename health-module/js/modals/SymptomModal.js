// js/modals/SymptomModal.js
const SymptomModal = (function() {
    let selectedCategory = null;
    let selectedSymptom = null;
    let intensity = 3;
    let currentDate = null;

    async function show(data = {}) {
        currentDate = data.date || new Date().toISOString().split('T')[0];
        console.log('🤕 Открытие модального окна симптомов для даты:', currentDate);

        // Загружаем опции через кэш
        let categories = [];
        let symptomsByCategory = {};

        if (typeof OptionsCache !== 'undefined' && OptionsCache.getUserOptions) {
            try {
                const optionsResult = await OptionsCache.getUserOptions();
                
                if (optionsResult.success && optionsResult.data) {
                    categories = optionsResult.data.symptom_categories || [];
                    symptomsByCategory = optionsResult.data.symptoms_by_category || {};
                    
                    console.log('✅ Опции для SymptomModal загружены:', {
                        source: optionsResult.source,
                        categoriesCount: categories.length,
                        categories
                    });
                } else {
                    console.error('❌ Не удалось загрузить опции:', optionsResult.error);
                    showToast('❌ Ошибка загрузки опций симптомов', 'error');
                    return;
                }
            } catch (error) {
                console.error('❌ Ошибка загрузки опций для SymptomModal:', error);
                showToast('❌ Ошибка загрузки опций симптомов', 'error');
                return;
            }
        } else {
            // Fallback на state только если OptionsCache недоступен
            console.warn('⚠️ OptionsCache недоступен, используем state');
            const state = HealthModule.getState();
            categories = state.userOptions?.symptom_categories || [];
            symptomsByCategory = state.userOptions?.symptoms_by_category || {};
        }

        // Если опции пустые - показываем ошибку
        if (categories.length === 0) {
            console.error('❌ Опции симптомов пустые');
            showToast('❌ Не удалось загрузить список симптомов', 'error');
            return;
        }

        const content = renderModalContent(categories);
        const modalHtml = BaseModal.createModalStructure('🤕 Добавить симптом', content, 'large');

        BaseModal.show(modalHtml);

        setTimeout(() => {
            initEventHandlers(categories, symptomsByCategory);
        }, 10);
    }

    function renderModalContent(categories) {
        return `
            <div class="symptom-modal-content">
                <div class="form-group">
                    <label for="symptom-category">Категория</label>
                    <select id="symptom-category" class="modal-input">
                        <option value="">Выберите категорию</option>
                        ${categories.map(cat => {
                            const displayName = cat.charAt(0).toUpperCase() + cat.slice(1);
                            return `<option value="${cat}">${displayName}</option>`;
                        }).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="symptom-name">Симптом</label>
                    <select id="symptom-name" class="modal-input" disabled>
                        <option value="">Сначала выберите категорию</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>
                        Интенсивность: <span id="intensity-value" class="intensity-badge">${intensity}</span>/5
                    </label>
                    <input type="range" id="symptom-intensity" class="intensity-slider"
                           min="1" max="5" value="${intensity}">
                    <div class="intensity-labels">
                        <span>Слабо</span>
                        <span>Средне</span>
                        <span>Сильно</span>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="SymptomModal.close()">
                        Отмена
                    </button>
                    <button class="health-btn btn-primary" onclick="SymptomModal.save()">
                        Добавить симптом
                    </button>
                </div>
            </div>
        `;
    }

    function initEventHandlers(categories, symptomsByCategory) {
        const categorySelect = document.getElementById('symptom-category');
        const nameSelect = document.getElementById('symptom-name');
        const intensitySlider = document.getElementById('symptom-intensity');
        const intensityValue = document.getElementById('intensity-value');

        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                selectedCategory = e.target.value;
                console.log('📂 Выбрана категория:', selectedCategory);
                updateSymptomsList(selectedCategory, symptomsByCategory, nameSelect);
            });
        }

        if (nameSelect) {
            nameSelect.addEventListener('change', (e) => {
                selectedSymptom = e.target.value;
                console.log('🔍 Выбран симптом:', selectedSymptom);
            });
        }

        if (intensitySlider && intensityValue) {
            intensitySlider.addEventListener('input', (e) => {
                intensity = parseInt(e.target.value);
                intensityValue.textContent = intensity;
                intensityValue.className = `intensity-badge intensity-${intensity}`;
            });
        }
    }

    function updateSymptomsList(category, symptomsByCategory, nameSelect) {
        if (!nameSelect || !category) return;

        const symptoms = symptomsByCategory[category] || [];

        if (symptoms.length === 0) {
            nameSelect.disabled = true;
            nameSelect.innerHTML = '<option value="">Симптомы не найдены</option>';
            return;
        }

        nameSelect.disabled = false;
        nameSelect.innerHTML = `
            <option value="">Выберите симптом</option>
            ${symptoms.map(symptom => {
                const displayName = symptom.replace(/_/g, ' ');
                return `<option value="${symptom}">${displayName}</option>`;
            }).join('')}
        `;

        selectedSymptom = null;
    }

    async function save() {
        console.log('💾 Сохранение симптома:', { selectedCategory, selectedSymptom, intensity, currentDate });

        if (!selectedCategory || !selectedSymptom) {
            showToast('⚠️ Выберите категорию и симптом', 'warning');
            return;
        }

        if (!currentDate) {
            showToast('❌ Дата не указана', 'error');
            return;
        }

        try {
            const symptomData = {
                category: selectedCategory,
                name: selectedSymptom,
                intensity: intensity
            };

            console.log('📤 Отправка симптома:', symptomData);

            const result = await HealthAPI.addSymptoms(currentDate, {
                symptoms: [symptomData]
            });

            console.log('📥 Результат API:', result);

            if (result && result.success) {
                showToast('✅ Симптом добавлен', 'success');
                close();

                await HealthModule.refreshData();

                if (window.Diary && window.Diary.loadDate) {
                    Diary.loadDate(currentDate);
                }

                if (window.Dashboard && window.Dashboard.init) {
                    Dashboard.init();
                }
            } else {
                throw new Error(result?.message || 'Ошибка добавления симптома');
            }
        } catch (error) {
            console.error('❌ Ошибка добавления симптома:', error);

            let errorMessage = 'Ошибка добавления симптома';

            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }

            showToast('❌ ' + errorMessage, 'error');
        }
    }

    function close() {
        BaseModal.close();
        selectedCategory = null;
        selectedSymptom = null;
        intensity = 3;
        currentDate = null;
    }

    return {
        show,
        save,
        close
    };
})();

if (typeof window !== 'undefined') {
    window.SymptomModal = SymptomModal;
}

console.log('✅ SymptomModal загружен');
