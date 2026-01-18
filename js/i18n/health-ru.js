// js/i18n/health-ru.js - Русские переводы модуля здоровья

registerTranslations('health', {
    ru: {
        // Навигация (табы)
        tabs: {
            dashboard: 'Сегодня',
            medications: 'Аптечка',
            diary: 'Дневник',
            stats: 'Статистика',
            settings: 'Настройки'
        },

        // Настроения (используем английские ключи)
        moods: {
            joy: 'радость',
            satisfaction: 'удовлетворение',
            neutral: 'нейтрально',
            sadness: 'грусть',
            stress: 'стресс',
            irritability: 'раздражительность',
            anxiety: 'беспокойство',
            fatigue: 'усталость',
            energy: 'энергичность',
            calm: 'спокойствие'
        },

        // Гендерные опции
        genders: {
            male: { label: 'Мужской', description: 'Стандартные рекомендации для мужчин' },
            female: { label: 'Женский', description: 'Включая женское здоровье' },
            other: { label: 'Другой', description: 'Общие рекомендации' },
            prefer_not_to_say: { label: 'Не указывать', description: 'Общие настройки' }
        },

        // Формы выпуска лекарств
        medicationForms: {
            tablet: 'Таблетки',
            capsule: 'Капсулы',
            syrup: 'Сироп',
            solution: 'Раствор',
            ointment: 'Мазь',
            cream: 'Крем',
            drops: 'Капли',
            spray: 'Спрей',
            powder: 'Порошок',
            other: 'Другое'
        },

        // Общие элементы UI
        common: {
            save: 'Сохранить',
            cancel: 'Отмена',
            delete: 'Удалить',
            add: 'Добавить',
            edit: 'Редактировать',
            loading: 'Загрузка...',
            loading_module: 'Загрузка модуля здоровья...',
            today: 'Сегодня',
            yesterday: 'Вчера',
            days_ago: '{count} дн. назад',
            error: 'Ошибка',
            success: 'Успешно',
            reload: 'Перезагрузить',
            module_load_error: 'Ошибка загрузки модуля',
            no_data: 'Нет данных',
            not_specified: 'Не указано'
        },

        // Dashboard компонент
        dashboard: {
            greeting_morning: '👋 Доброе утро!',
            greeting_afternoon: '👋 Добрый день!',
            greeting_evening: '👋 Добрый вечер!',
            weekly_summary: 'Сводка за неделю',
            loading_stats: 'Загрузка статистики...',
            wellness_check: 'Как самочувствие?',
            todays_plan: 'План на сегодня',
            todays_medications: 'Лекарства на сегодня',
            no_medications_today: 'На сегодня лекарств нет',
            mood: 'Настроение',
            sleep: 'Сон',
            symptoms: 'Симптомы',
            intimacy: 'Интимность',
            specified: 'Указано',
            take_medication: '✅ Принять',
            skip_medication: '⏭ Пропустить',
            medication_taken: '✅ Принято',
            reminder_at: '🔔 Напоминание появится в'
        },

        // Medications компонент
        medications: {
            title: '💊 Аптечка',
            archive: 'Архив',
            add_medication: '+ Добавить',
            loading_medications: 'Загрузка лекарств...',
            empty_medications: 'Аптечка пуста',
            add_first_medication: 'Добавьте лекарства, которые вы принимаете регулярно',
            add_first_medication_btn: 'Добавить первое лекарство',
            form_label: 'Форма:',
            next_intake: 'Следующий прием:',
            instructions: 'Инструкция:',
            default_dosage: 'одна шт.',
            form_not_specified: 'Не указана',
            default_name: 'Лекарство',
            no_medications_today: 'На сегодня лекарств нет',
            add_medications_prompt: 'Добавьте лекарства в разделе "Аптечка"',
            go_to_medications: 'Перейти в аптечку',
            how_it_works: '💡 Как это работает?'
        },

        // Diary компонент
        diary: {
            title: 'Дневник здоровья',
            calendar: 'Календарь',
            entries: 'Записи',
            no_entry: 'Не указано',
            weekdays_short: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            weekdays_full: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
            sleep_label: 'Сон (часы)',
            sleep_placeholder: 'Например: 7.5',
            sexual_activity_note: 'Только для вас',
            add_symptom_btn: '+ Добавить симптом',
            notes_label: 'Заметки',
            notes_placeholder: 'Как вы себя чувствовали сегодня?',
            save_btn: '💾 Сохранить запись',
            no_symptoms: 'Симптомы не добавлены'
        },

        // Stats компонент
        stats: {
            title: '📊 Статистика',
            loading: 'Загрузка статистики...',
            loading_for_days: 'Загрузка статистики за {days} дней...',
            loaded_for_days: 'Статистика за {days} дней загружена',
            error_load: 'Не удалось загрузить статистику',
            error_load_message: 'Ошибка загрузки статистики',
            try_again: 'Попробовать снова',
            adherence_title: '💊 Приверженность лечению',
            adherence_taken: 'Принято вовремя',
            adherence_missed: 'Пропущено',
            mood_title: '😊 Настроение',
            mood_no_data: 'Нет данных о настроении',
            mood_predominant: 'Преобладающее настроение в выбранный период',
            symptoms_title: '⚠️ Частые симптомы',
            symptoms_no_data: 'Нет данных о симптомах',
            sleep_title: '💤 Статистика сна',
            sleep_average: 'Среднее',
            sleep_hours_unit: 'ч',
            sleep_entries: 'Записей',
            sleep_period: 'Период',
            sleep_days_unit: 'дн'
        },

        // Settings компонент
        settings: {
            title: 'Настройки здоровья',
            profile_section: 'Профиль и антропометрические данные',
            loading_profile: 'Загрузка профиля...',
            profile_title: 'Профиль пользователя',
            profile_subtitle: 'Основные данные для анализа здоровья',
            gender: 'Пол',
            gender_not_specified: 'Не указан',
            birth_date: 'Дата рождения',
            language: 'Язык интерфейса',
            language_changed: '✅ Язык изменён',
            language_change_error: '❌ Не удалось изменить язык'
        },

        // Onboarding компонент
        onboarding: {
            title: 'Давайте познакомимся',
            subtitle: 'Чтобы предоставить вам персонализированные рекомендации, укажите основные данные о себе',
            important_label: 'Важно',
            privacy_note: 'Все данные о здоровье хранятся конфиденциально',
            saving: 'Сохранение...',
            saved: 'Сохранено!',
            error_save: 'Ошибка сохранения. Попробуйте еще раз.'
        },

        // Модальные окна
        modals: {
            // Настроение
            mood: {
                title: '😊 Как настроение?',
                save_success: '✅ Настроение сохранено',
                save_error: '❌ Не удалось сохранить настроение'
            },

            // Вес
            weight: {
                title: '⚖️ Вес',
                field_weight: 'Ваш вес (кг)',
                field_weight_placeholder: 'Например: 70.5',
                hint: '💡 Для точного отслеживания рекомендуется взвешиваться утром до еды',
                btn_cancel: 'Отмена',
                btn_save: '💾 Сохранить',
                error_empty: '⚠️ Введите вес',
                error_invalid: '❌ Некорректное значение веса (0-500 кг)',
                save_success: '✅ Вес сохранён',
                save_error: '❌ Не удалось сохранить вес'
            },

            // Симптомы
            symptom: {
                title: '🤕 Добавить симптом',
                field_category: 'Категория',
                field_category_placeholder: 'Выберите категорию',
                field_symptom: 'Симптом',
                field_symptom_placeholder_empty: 'Выберите симптом',
                field_symptom_placeholder_select: 'Сначала выберите категорию',
                field_symptom_not_found: 'Симптомы не найдены',
                field_intensity: 'Интенсивность',
                intensity_low: 'Слабо',
                intensity_medium: 'Средне',
                intensity_high: 'Сильно',
                btn_cancel: 'Отмена',
                btn_save: 'Добавить симптом',
                error_select: '⚠️ Выберите категорию и симптом',
                error_date: '❌ Дата не указана',
                error_intensity: '❌ Некорректная интенсивность',
                save_success: '✅ Симптом добавлен',
                save_error: '❌ Ошибка добавления симптома'
            },

            // Интимная активность
            sexual: {
                title: '🔒 Интимная жизнь',
                loading: 'Загружаем опции...',
                privacy_notice: '🔒 Приватная информация',
                privacy_description: 'Эти данные видны только вам и защищены шифрованием. Используются для анализа здоровья и самочувствия.',
                select_activity: 'Выберите активность за сегодня',
                btn_clear: '🗑️ Очистить',
                btn_cancel: 'Отмена',
                error_no_options: '⚠️ Нет доступных опций',
                error_load_options: '❌ Не удалось загрузить опции',
                error_load: '❌ Ошибка загрузки',
                error_save: '❌ Не удалось сохранить',
                save_success: '✅ Информация сохранена',
                confirm_delete: 'Удалить запись об интимной активности за сегодня?',
                options: {
                    no: 'Не было',
                    protected_sex: 'Защищенный секс',
                    unprotected_sex: 'Незащищенный секс',
                    solo: 'Самостоятельно',
                    with_toy: 'С игрушкой',
                    active_role: 'Активная роль',
                    passive_role: 'Пассивная роль',
                    ovulation: 'В период овуляции',
                    during_period: 'Во время месячных'
                }
            },

            // Лекарства (MedicationFormModal)
            medication: {
                title_add: '💊 Добавить лекарство',
                title_edit: '✏️ Редактировать лекарство',
                step_basic: 'Основное',
                step_intake_type: 'Тип приёма',
                step_stocks: 'Остатки',
                step_schedule: 'Расписание',
                field_name: 'Название лекарства',
                field_name_placeholder: 'Например: Аспирин',
                field_dosage: 'Дозировка',
                field_dosage_hint: 'Укажите дозировку одной единицы',
                field_form: 'Форма выпуска',
                field_instructions: 'Инструкция по применению',
                field_instructions_hint: 'Как правильно принимать это лекарство',
                field_intake_type: 'Тип приёма',
                intake_continuous: 'Постоянно',
                intake_course: 'Курсом',
                field_start_date: 'Начало приёма',
                field_end_date: 'Окончание приёма',
                field_quantity_unit: 'Единица измерения',
                field_quantity_available: 'Количество в наличии',
                field_quantity_available_hint: 'Сколько у вас есть сейчас',
                field_quantity_threshold: 'Уведомить о покупке когда остаётся',
                field_schedule: 'Расписание приёма',
                btn_cancel: 'Отмена',
                btn_next: 'Далее →',
                btn_back: '← Назад',
                btn_save: '💾 Сохранить',
                btn_add_time: '➕ Добавить время приёма',
                btn_add_schedule: '✓ Добавить',
                error_name_required: '⚠️ Укажите название лекарства',
                error_end_date_required: '⚠️ Укажите дату окончания курса',
                error_end_date_after_start: '⚠️ Дата окончания должна быть позже начала',
                error_quantity_negative: '⚠️ Количество не может быть отрицательным',
                error_schedule_required: '⚠️ Добавьте хотя бы одно время приёма',
                stock_ok: 'Запас в норме',
                stock_ok_detail: 'Осталось {diff} до уведомления',
                stock_warning: 'Пора пополнить',
                stock_warning_detail: 'Достигнут порог уведомления',
                stock_low: 'Низкий остаток!',
                stock_low_detail: 'Ниже порога на {diff}',
                toast_loaded: '✅ Данные лекарства загружены',
                toast_error_load: '❌ Ошибка загрузки лекарства',
                toast_error_load_detail: '❌ Не удалось загрузить данные: ',
                toast_schedule_updated: '✅ Расписание обновлено',
                toast_schedule_added: '✅ Время приёма добавлено',
                toast_schedule_deleted: '🗑️ Расписание удалено',
                toast_success_add: '✅ Лекарство добавлено',
                toast_success_update: '✅ Лекарство обновлено',
                toast_warning_schedules: '⚠️ Лекарство обновлено, но есть проблемы с расписаниями',
                toast_error_save: '❌ Не удалось сохранить: '
            },

            // Простые модали (SimpleModalManager)
            simple: {
                symptom_title: '🤕 Добавить симптом',
                symptom_category_general: 'Общее',
                symptom_category_head: 'Голова',
                symptom_category_belly: 'Живот',
                symptom_category_other: 'Прочее',
                symptom_category_gynecology: 'Гинекология',
                symptom_category_urology: 'Урология',
                error_intensity: '❌ Некорректная интенсивность',
                error_symptom_add: '❌ Ошибка добавления симптома',
                toast_symptom_added: '✅ Симптом добавлен',
                toast_unknown_modal: '⚠️ Функция в разработке',
                toast_form_not_loaded: '⚠️ Форма не загружена'
            }
        },

        // Валидаторы
        validators: {
            name_required: 'Название обязательно',
            name_too_long: 'Название слишком длинное'
        },

        // Интенсивность
        intensity: {
            low: 'Слабо',
            medium: 'Средне',
            high: 'Сильно'
        }
    }
});

console.log('✅ i18n/health-ru.js загружен');
