// js/modals/SymptomModal.js
const SymptomModal = (function() {
    let selectedCategory = null;
    let selectedSymptom = null;
    let intensity = 3;
    let currentDate = null;

    function show(data = {}) {
        currentDate = data.date || new Date().toISOString().split('T')[0];
        console.log('🤕 Открытие модального окна симптомов для даты:', currentDate);

        const state = HealthModule.getState();
        const categories = state.userOptions?.symptom_categories || [];
        const symptomsByCategory = state.userOptions?.symptoms_by_category || {};

        // Если нет данных, используем базовые категории
        const finalCategories = categories.length > 0 ? categories : getDefaultCategories();
        const finalSymptomsByCategory = Object.keys(symptomsByCategory).length > 0
            ? symptomsByCategory
            : getDefaultSymptomsByCategory();

        const content = renderModalContent(finalCategories);
        const modalHtml = BaseModal.createModalStructure('🤕 Добавить симптом', content, 'large');

        BaseModal.show(modalHtml);

        // Инициализируем обработчики ПОСЛЕ вставки в DOM
        setTimeout(() => {
            initEventHandlers(finalCategories, finalSymptomsByCategory);
        }, 10);
    }

    function getDefaultCategories() {
        const state = HealthModule.getState();
        const userGender = state.userGender || 'other';

        const baseCategories = ['общее', 'голова', 'живот', 'прочее'];

        if (userGender === 'female') {
            return [...baseCategories, 'гинекология'];
        } else if (userGender === 'male') {
            return [...baseCategories, 'урология'];
        }

        return baseCategories;
    }

    function getDefaultSymptomsByCategory() {
        const state = HealthModule.getState();
        const userGender = state.userGender || 'other';

        const symptoms = {
            "общее": ["усталость", "слабость", "температура", "озноб", "потливость", "бессонница", "сонливость"],
            "голова": ["головная_боль", "головокружение", "мигрень", "давление"],
            "живот": ["боль_в_животе", "тошнота", "рвота", "диарея", "запор", "вздутие", "изжога"],
            "прочее": ["боль_в_спине", "боль_в_груди", "кашель", "насморк", "боль_в_горле"]
        };

        if (userGender === 'female') {
            symptoms["гинекология"] = [
                "менструальная_боль", "задержка_месячных", "обильные_месячные",
                "скудные_месячные", "нерегулярный_цикл", "ПМС", "овуляторная_боль",
                "выделения", "зуд", "боль_в_груди", "набухание_груди"
            ];
        } else if (userGender === 'male') {
            symptoms["урология"] = [
                "дискомфорт_в_паху", "боль_при_мочеиспускании",
                "частое_мочеиспускание", "проблемы_с_эрекцией"
            ];
        }

        return symptoms;
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

        // Сбрасываем выбранный симптом
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
            // Формируем данные симптома
            const symptomData = {
                category: selectedCategory,
                name: selectedSymptom,
                intensity: intensity
            };

            console.log('📤 Отправка данных симптома:', symptomData);

            // Используем правильный API endpoint
            const result = await HealthAPI.addSymptoms(currentDate, {
                symptoms: [symptomData]
            });

            console.log('📥 Результат API:', result);

            if (result && result.success) {
                showToast('✅ Симптом добавлен', 'success');
                close();

                // Обновляем данные
                await HealthModule.refreshData();

                // Перезагружаем дневник если он открыт
                if (window.Diary && window.Diary.loadDate) {
                    Diary.loadDate(currentDate);
                }
            } else {
                throw new Error(result?.message || 'Ошибка добавления симптома');
            }
        } catch (error) {
            console.error('❌ Ошибка добавления симптома:', error);

            // Более детальная обработка ошибок
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
        // Сброс состояния
        selectedCategory = null;
        selectedSymptom = null;
        intensity = 3;
        currentDate = null;
    }

    // Публичный API
    return {
        show,
        save,
        close
    };
})();

// Экспорт в window
if (typeof window !== 'undefined') {
    window.SymptomModal = SymptomModal;
}

console.log('✅ SymptomModal загружен');