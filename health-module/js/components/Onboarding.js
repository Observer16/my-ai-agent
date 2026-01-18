// js/components/Onboarding.js
const Onboarding = (function() {

    function init() {
        console.log('🎯 Инициализация компонента Onboarding');
        initGenderButtons();
    }

    function initGenderButtons() {
        const genderOptions = document.querySelectorAll('.gender-option');

        if (!genderOptions || genderOptions.length === 0) {
            console.warn('⚠️ Кнопки выбора гендера не найдены');
            return;
        }

        genderOptions.forEach(option => {
            option.addEventListener('click', function() {
                const gender = this.getAttribute('data-gender');
                handleGenderSelect(gender, this);
            });
        });

        console.log(`✅ Инициализировано ${genderOptions.length} кнопок выбора гендера`);
    }

    async function handleGenderSelect(gender, button) {
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
        const savingText = typeof t === 'function' ? t('health.onboarding.saving') : 'Сохранение...';
        button.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <div class="loading-spinner-small" style="margin: 0 auto 10px;"></div>
                <div style="font-size: 12px; color: #666;">${savingText}</div>
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
            const savedText = typeof t === 'function' ? t('health.onboarding.saved') : 'Сохранено!';
            button.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 32px; color: #4CAF50; margin-bottom: 10px;">✓</div>
                    <div style="font-size: 14px; color: #4CAF50;">${savedText}</div>
                </div>
            `;

            // 5. Завершаем онбординг через 1 секунду
            setTimeout(async () => {
                console.log('🔄 Завершаем онбординг...');
                if (window.OnboardingManager) {
                    await OnboardingManager.complete();
                }
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

            const errorMsg = typeof t === 'function'
                ? t('health.onboarding.error_save')
                : 'Ошибка сохранения. Попробуйте еще раз.';

            if (window.ErrorHandler) {
                ErrorHandler.show(errorMsg, { type: 'error' });
            } else {
                alert(errorMsg);
            }
        }
    }

    // Публичный API
    return {
        init,
        handleGenderSelect
    };
})();

// Экспорт в window
if (typeof window !== 'undefined') {
    window.Onboarding = Onboarding;
}