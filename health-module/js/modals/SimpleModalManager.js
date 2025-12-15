// js/modals/SimpleModalManager.js
const SimpleModalManager = (function() {

    function show(modalType, data = {}) {
        console.log('🔲 Открытие модального окна:', modalType, data);

        switch(modalType) {
            case 'symptom-picker':
                if (window.SymptomModal) {
                    SymptomModal.show(data);
                } else {
                    console.warn('⚠️ SymptomModal не загружен, используем fallback');
                    showSymptomPicker(data);
                }
                break;
            case 'medication-form':
                showMedicationForm(data);
                break;
            case 'mood-picker':
                if (window.MoodModal) {
                    MoodModal.show(data);
                }
                break;
            default:
                console.warn('⚠️ Неизвестный тип модального окна:', modalType);
                showToast('⚠️ Функция в разработке', 'info');
        }
    }

    function close() {
        const container = document.getElementById('health-modals');
        if (container) {
            container.innerHTML = '';
        }
    }

    function showSymptomPicker(data = {}) {
        const state = HealthModule.getState();
        const userGender = state.userGender || 'other';
        const currentDate = data.date || new Date().toISOString().split('T')[0];

        // Базовые категории симптомов
        const symptomCategories = {
            "общее": ["усталость", "слабость", "температура", "озноб", "потливость", "бессонница", "сонливость"],
            "голова": ["головная боль", "головокружение", "мигрень", "давление", "гул", "потрескивание"],
            "живот": ["боль в животе", "тошнота", "рвота", "диарея", "запор", "вздутие", "изжога"],
            "прочее": ["боль в спине", "боль в груди", "кашель", "насморк", "боль в горле"]
        };

        // Добавляем гендер-специфичные симптомы
        if (userGender === 'female') {
            symptomCategories["гинекология"] = [
                "менструальная боль", "задержка месячных", "обильные месячные",
                "скудные месячные", "нерегулярный цикл", "ПМС", "овуляторная боль",
                "выделения", "зуд", "боль в груди", "набухание груди"
            ];
        } else if (userGender === 'male') {
            symptomCategories["урология"] = [
                "дискомфорт в паху", "боль при мочеиспускании",
                "частое мочеиспускание", "проблемы с эрекцией"
            ];
        }

        // Генерируем HTML
        let html = '<div class="symptom-picker-modal">';
        html += '<div class="modal-overlay" onclick="SimpleModalManager.close()"></div>';
        html += '<div class="modal-content modal-large">';
        html += '<div class="modal-header">';
        html += '<h3>🤕 Добавить симптом</h3>';
        html += '<button class="modal-close" onclick="SimpleModalManager.close()">×</button>';
        html += '</div>';
        html += '<div class="modal-body">';

        for (const [category, symptoms] of Object.entries(symptomCategories)) {
            html += `<div class="symptom-category">`;
            html += `<h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>`;
            html += `<div class="symptom-buttons">`;

            symptoms.forEach(symptom => {
                const label = symptom.replace(/_/g, ' ');
                html += `
                    <button class="symptom-btn" onclick="SimpleModalManager.selectSymptom('${category}', '${symptom}', '${currentDate}')">
                        ${label}
                    </button>
                `;
            });

            html += '</div></div>';
        }

        html += '</div></div></div>';

        // Вставляем в DOM
        const container = document.getElementById('health-modals');
        if (container) {
            container.innerHTML = html;
        }
    }

    async function selectSymptom(category, symptom, date) {
        console.log('✅ Выбран симптом:', { category, symptom, date });

        // Запрашиваем интенсивность
        const intensity = prompt('Оцените интенсивность от 1 до 5:', '3');
        if (!intensity || intensity < 1 || intensity > 5) {
            showToast('❌ Некорректная интенсивность', 'error');
            return;
        }

        try {
            const result = await HealthAPI.addSymptom(date, {
                category: category,
                name: symptom,
                intensity: parseInt(intensity)
            });

            if (result.success) {
                showToast('✅ Симптом добавлен', 'success');
                close();

                // Обновляем данные и перезагружаем форму дневника
                await HealthModule.refreshData();
                if (window.Diary && window.Diary.loadDate) {
                    Diary.loadDate(date);
                }
            } else {
                showToast('❌ Ошибка добавления симптома', 'error');
            }
        } catch (error) {
            console.error('❌ Ошибка добавления симптома:', error);
            showToast('❌ Ошибка добавления симптома', 'error');
        }
    }

    function showMedicationForm(data = {}) {
        console.log('💊 Открытие формы лекарства:', data);
        if (window.MedicationFormModal) {
            MedicationFormModal.show(data);
        } else {
            showToast('⚠️ Форма не загружена', 'error');
        }
    }

    // Публичный API
    return {
        show,
        close,
        selectSymptom,
        showSymptomPicker,
        showMedicationForm
    };
})();

// Экспорт в window
if (typeof window !== 'undefined') {
    window.SimpleModalManager = SimpleModalManager;
}

console.log('✅ SimpleModalManager загружен');