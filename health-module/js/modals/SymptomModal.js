// js/modals/SymptomModal.js
const SymptomModal = (function() {
    let selectedCategory = null;
    let selectedSymptom = null;
    let intensity = 3;
    let currentDate = null;

    async function show(data = {}) {
        currentDate = data.date || new Date().toISOString().split('T')[0];
        console.log('🤕 Открытие модального окна симптомов для даты:', currentDate);

        // Проверяем что функция t доступна для переводов
        if (typeof t !== 'function') {
            console.warn('⚠️ Функция t() не доступна, переводы не будут применены');
        }

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
            console.warn('⚠️ OptionsCache недоступен, используем state');
            const state = HealthModule.getState();
            categories = state.userOptions?.symptom_categories || [];
            symptomsByCategory = state.userOptions?.symptoms_by_category || {};
        }

        if (categories.length === 0) {
            console.error('❌ Опции симптомов пустые');
            showToast('❌ Не удалось загрузить список симптомов', 'error');
            return;
        }

        const content = renderModalContent(categories);
        const modalTitle = typeof t === 'function' ? t('health.modals.symptom.title') : '🤕 Добавить симптом';
        const modalHtml = BaseModal.createModalStructure(modalTitle, content, 'large');

        BaseModal.show(modalHtml);

        setTimeout(() => {
            initEventHandlers(categories, symptomsByCategory);
        }, 10);
    }

    function renderModalContent(categories) {
        return `
            <div class="symptom-modal-content">
                <div class="form-group">
                    <label for="symptom-category">${t('health.modals.symptom.field_category')}</label>
                    <select id="symptom-category" class="modal-input">
                        <option value="">${t('health.modals.symptom.field_category_placeholder')}</option>
                        ${categories.map(cat => {
                            const displayName = cat.charAt(0).toUpperCase() + cat.slice(1);
                            return `<option value="${cat}">${displayName}</option>`;
                        }).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="symptom-name">${t('health.modals.symptom.field_symptom')}</label>
                    <select id="symptom-name" class="modal-input" disabled>
                        <option value="">${t('health.modals.symptom.field_symptom_placeholder_select')}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>
                        ${t('health.modals.symptom.field_intensity')}: <span id="intensity-value" class="intensity-badge">${intensity}</span>/5
                    </label>
                    <input type="range" id="symptom-intensity" class="intensity-slider"
                           min="1" max="5" value="${intensity}">
                    <div class="intensity-labels">
                        <span>${t('health.modals.symptom.intensity_low')}</span>
                        <span>${t('health.modals.symptom.intensity_medium')}</span>
                        <span>${t('health.modals.symptom.intensity_high')}</span>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="health-btn btn-secondary" onclick="SymptomModal.close()">
                        ${t('health.modals.symptom.btn_cancel')}
                    </button>
                    <button class="health-btn btn-primary" onclick="SymptomModal.save()">
                        ${t('health.modals.symptom.btn_save')}
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
            const notFoundText = typeof t === 'function' ? t('health.modals.symptom.field_symptom_not_found') : 'Симптомы не найдены';
            nameSelect.innerHTML = `<option value="">${notFoundText}</option>`;
            return;
        }

        nameSelect.disabled = false;
        const placeholder = typeof t === 'function' ? t('health.modals.symptom.field_symptom_placeholder_empty') : 'Выберите симптом';
        nameSelect.innerHTML = `
            <option value="">${placeholder}</option>
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
            const errorMsg = typeof t === 'function' ? t('health.modals.symptom.error_select') : '⚠️ Выберите категорию и симптом';
            showToast(errorMsg, 'warning');
            return;
        }

        if (!currentDate) {
            const errorMsg = typeof t === 'function' ? t('health.modals.symptom.error_date') : '❌ Дата не указана';
            showToast(errorMsg, 'error');
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
                const successMsg = typeof t === 'function' ? t('health.modals.symptom.save_success') : '✅ Симптом добавлен';
                showToast(successMsg, 'success');
                close();

                // ВАЖНО: Сначала обновляем данные модуля
                await HealthModule.refreshData();

                // Затем обновляем Diary компонент с await
                if (window.Diary && window.Diary.loadDate) {
                    await Diary.loadDate(currentDate);
                }

                // И Dashboard
                if (window.Dashboard && window.Dashboard.init) {
                    Dashboard.init();
                }
                
                // Генерируем событие для других компонентов
                window.dispatchEvent(new CustomEvent('symptom-added', {
                    detail: { date: currentDate }
                }));
            } else {
                throw new Error(result?.message || 'Ошибка добавления симптома');
            }
        } catch (error) {
            console.error('❌ Ошибка добавления симптома:', error);

            let errorMessage = typeof t === 'function' ? t('health.modals.symptom.save_error') : '❌ Не удалось добавить симптом';

            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }

            showToast(errorMessage, 'error');
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
