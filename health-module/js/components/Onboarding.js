// health-module/js/components/Onboarding.js

import { GENDER_OPTIONS } from 'health-module/js/utils/formatters.js';

/**
 * Компонент онбординга
 */
const Onboarding = {
    /**
     * Инициализация компонентов онбординга
     */
    init() {
        console.log('🎯 Инициализация компонентов онбординга');
        this.initGenderButtons();
    },

    /**
     * Инициализация кнопок выбора гендера
     */
    initGenderButtons() {
        const genderContainer = document.getElementById('gender-options');
        if (!genderContainer) return;

        // Очищаем контейнер
        genderContainer.innerHTML = '';

        // Создаем кнопки для каждого варианта гендера
        GENDER_OPTIONS.forEach(option => {
            const button = document.createElement('button');
            button.className = 'gender-option';
            button.setAttribute('data-gender', option.value);

            button.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 16px;">${option.icon}</div>
                <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">${option.label}</div>
                <div style="font-size: 14px; color: #666;">${option.description}</div>
            `;

            button.addEventListener('click', () => this.handleGenderSelect(option.value, button));
            genderContainer.appendChild(button);
        });

        console.log(`✅ Инициализировано ${GENDER_OPTIONS.length} кнопок онбординга`);
    },

    /**
     * Обработка выбора гендера
     */
    async handleGenderSelect(gender, button) {
        console.log('👤 Пользователь выбрал гендер:', gender);

        // 1. Блокируем ВСЕ кнопки
        const allButtons = document.querySelectorAll('.gender-option');
        allButtons.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });

        // 2. Показываем загрузку
        button.classList.add('loading');
        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <div class="loading-spinner-small" style="margin: 0 auto 10px;"></div>
                <div style="font-size: 12px; color: #666;">Сохранение...</div>
            </div>
        `;

        try {
            // 3. Сохраняем гендер
            console.log('📤 Отправляем запрос на сохранение гендера...');
            const success = await HealthModule.setUserGender(gender);

            if (!success) {
                throw new Error('API вернул ошибку');
            }

            console.log('✅ Гендер успешно сохранен');

            // 4. Показываем успех
            button.classList.remove('loading');
            button.classList.add('selected');
            button.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 32px; color: #4CAF50; margin-bottom: 10px;">✓</div>
                    <div style="font-size: 14px; color: #4CAF50;">Сохранено!</div>
                </div>
            `;

            // 5. Завершаем онбординг
            setTimeout(async () => {
                console.log('🔄 Завершаем онбординг...');
                await OnboardingManager.complete();
            }, 1000);

        } catch (error) {
            console.error('❌ Ошибка в процессе онбординга:', error);

            // Восстанавливаем кнопки
            allButtons.forEach(btn => {
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.classList.remove('loading', 'selected');
            });

            button.innerHTML = originalHTML;
            ErrorHandler.show('Ошибка сохранения. Попробуйте еще раз.', { type: 'error' });
        }
    },

    /**
     * Обновление доступных симптомов после выбора гендера
     */
    async updateSymptomsAfterGenderSelection() {
        // После установки гендера загружаем обновленные опции
        await HealthModule.loadUserOptions();

        // Обновляем UI компоненты, которые зависят от гендера
        if (typeof Dashboard !== 'undefined') Dashboard.refresh();
        if (typeof Diary !== 'undefined') Diary.loadToday();
    }
};

// Экспорт компонента
if (typeof window !== 'undefined') {
    window.Onboarding = Onboarding;
}