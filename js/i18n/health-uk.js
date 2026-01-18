// js/i18n/health-uk.js - Українські переклади модуля здоров'я

registerTranslations('health', {
    uk: {
        // Навігація (вкладки)
        tabs: {
            dashboard: 'Сьогодні',
            medications: 'Аптечка',
            diary: 'Щоденник',
            stats: 'Статистика',
            settings: 'Налаштування'
        },

        // Настрої
        moods: {
            joy: 'радість',
            satisfaction: 'задоволення',
            neutral: 'нейтрально',
            sadness: 'грусть',
            stress: 'стрес',
            irritability: 'дратівливість',
            anxiety: 'тривога',
            fatigue: 'втома',
            energy: 'енергія',
            calm: 'спокій'
        },

        // Опції гендеру
        genders: {
            male: { label: 'Чоловік', description: 'Стандартні рекомендації для чоловіків' },
            female: { label: 'Жінка', description: 'Включаючи жіноче здоров\'я' },
            other: { label: 'Інше', description: 'Загальні рекомендації' },
            prefer_not_to_say: { label: 'Не вказувати', description: 'Загальні налаштування' }
        },

        // Форми ліків
        medicationForms: {
            tablet: 'Таблетки',
            capsule: 'Капсули',
            syrup: 'Сироп',
            solution: 'Розчин',
            ointment: 'Мазь',
            cream: 'Крем',
            drops: 'Краплі',
            spray: 'Спрей',
            powder: 'Порошок',
            other: 'Інше'
        },

        // Загальні елементи UI
        common: {
            save: 'Зберегти',
            cancel: 'Скасувати',
            delete: 'Видалити',
            add: 'Додати',
            edit: 'Редагувати',
            loading: 'Завантаження...',
            loading_module: 'Завантаження модуля здоров\'я...',
            today: 'Сьогодні',
            yesterday: 'Вчора',
            days_ago: '{count} днів тому',
            error: 'Помилка',
            success: 'Успішно',
            reload: 'Перезавантажити',
            module_load_error: 'Помилка завантаження модуля',
            no_data: 'Немає даних',
            not_specified: 'Не вказано'
        },

        // Компонент Dashboard
        dashboard: {
            greeting_morning: '👋 Доброго ранку!',
            greeting_afternoon: '👋 Добрий день!',
            greeting_evening: '👋 Доброго вечора!',
            weekly_summary: 'Тижневий звіт',
            loading_stats: 'Завантаження статистики...',
            wellness_check: 'Як ви себе почуваєте?',
            todays_plan: 'План на сьогодні',
            todays_medications: 'Ліки на сьогодні',
            no_medications_today: 'На сьогодні ліків немає',
            mood: 'Настрій',
            sleep: 'Сон',
            symptoms: 'Симптоми',
            intimacy: 'Інтимна активність',
            specified: 'Вказано',
            take_medication: '✅ Прийняти',
            skip_medication: '⏭ Пропустити',
            medication_taken: '✅ Прийнято',
            reminder_at: '🔔 Нагадування через'
        },

        // Компонент Ліки
        medications: {
            title: '💊 Аптечка',
            archive: 'Архів',
            add_medication: '+ Додати',
            loading_medications: 'Завантаження ліків...',
            empty_medications: 'Аптечка пуста',
            add_first_medication: 'Додайте ліки, які ви приймаєте регулярно',
            add_first_medication_btn: 'Додати перший ліки',
            form_label: 'Форма:',
            next_intake: 'Наступний прийом:',
            instructions: 'Інструкція:',
            default_dosage: 'одна таблетка',
            form_not_specified: 'Не вказана',
            default_name: 'Ліки',
            no_medications_today: 'На сьогодні ліків немає',
            add_medications_prompt: 'Додайте ліки в розділі "Аптечка"',
            go_to_medications: 'Перейти в аптечку',
            how_it_works: '💡 Як це працює?'
        },

        // Компонент Щоденник
        diary: {
            title: 'Щоденник здоров\'я',
            calendar: 'Календар',
            entries: 'Записи',
            no_entry: 'Не вказано',
            weekdays_short: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
            weekdays_full: ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця', 'Субота', 'Неділя'],
            sleep_label: 'Сон (години)',
            sleep_placeholder: 'Приклад: 7.5',
            sexual_activity_note: 'Тільки для вас',
            add_symptom_btn: '+ Додати симптом',
            notes_label: 'Примітки',
            notes_placeholder: 'Як ви себе почували сьогодні?',
            save_btn: '💾 Зберегти запис',
            no_symptoms: 'Симптоми не додані'
        },

        // Компонент Статистика
        stats: {
            title: '📊 Статистика',
            loading: 'Завантаження статистики...',
            loading_for_days: 'Завантаження статистики за {days} днів...',
            loaded_for_days: 'Статистика за {days} днів завантажена',
            error_load: 'Не вдалося завантажити статистику',
            error_load_message: 'Помилка завантаження статистики',
            try_again: 'Спробувати ще раз',
            adherence_title: '💊 Прихильність до лікування',
            adherence_taken: 'Прийнято вчасно',
            adherence_missed: 'Пропущено',
            mood_title: '😊 Настрій',
            mood_no_data: 'Немає даних про настрій',
            mood_predominant: 'Переважаючий настрій у вибраний період',
            symptoms_title: '⚠️ Частопоширені симптоми',
            symptoms_no_data: 'Немає даних про симптоми',
            sleep_title: '💤 Статистика сну',
            sleep_average: 'Середнє',
            sleep_hours_unit: 'г',
            sleep_entries: 'Записи',
            sleep_period: 'Період',
            sleep_days_unit: 'днів'
        },

        // Компонент Налаштування
        settings: {
            title: 'Налаштування здоров\'я',
            profile_section: 'Профіль та антропометричні дані',
            loading_profile: 'Завантаження профілю...',
            profile_title: 'Профіль користувача',
            profile_subtitle: 'Основні дані для аналізу здоров\'я',
            gender: 'Стать',
            gender_not_specified: 'Не вказана',
            birth_date: 'Дата народження',
            language: 'Мова інтерфейсу',
            language_changed: '✅ Мова змінена',
            language_change_error: '❌ Не вдалося змінити мову'
        },

        // Компонент Онбординг
        onboarding: {
            title: 'Давайте познайомимось',
            subtitle: 'Щоб надати вам персоналізовані рекомендації, вкажіть основну інформацію про своє здоров\'я',
            important_label: 'Важливо',
            privacy_note: 'Усі дані про здоров\'я зберігаються конфіденційно',
            saving: 'Збереження...',
            saved: 'Збережено!',
            error_save: 'Помилка збереження. Спробуйте ще раз.'
        },

        // Модальні вікна
        modals: {
            mood: {
                title: '😊 Як ви себе почуваєте?',
                save_success: '✅ Настрій збережено',
                save_error: '❌ Не вдалося зберегти настрій'
            },

            weight: {
                title: '⚖️ Вага',
                field_weight: 'Ваша вага (кг)',
                field_weight_placeholder: 'Наприклад: 70.5',
                hint: '💡 Для точного відстеження рекомендується зважуватися вранці перед їжею',
                btn_cancel: 'Скасувати',
                btn_save: '💾 Зберегти',
                error_empty: '⚠️ Введіть вашу вагу',
                error_invalid: '❌ Невірне значення ваги (0-500 кг)',
                save_success: '✅ Вага збережена',
                save_error: '❌ Не вдалося зберегти вагу'
            },

            symptom: {
                title: '🤕 Додати симптом',
                field_category: 'Категорія',
                field_category_placeholder: 'Виберіть категорію',
                field_symptom: 'Симптом',
                field_symptom_placeholder_empty: 'Виберіть симптом',
                field_symptom_placeholder_select: 'Спочатку виберіть категорію',
                field_symptom_not_found: 'Симптоми не знайдені',
                field_intensity: 'Інтенсивність',
                intensity_low: 'Слабка',
                intensity_medium: 'Середня',
                intensity_high: 'Сильна',
                btn_cancel: 'Скасувати',
                btn_save: 'Додати симптом',
                error_select: '⚠️ Виберіть категорію та симптом',
                error_date: '❌ Дата не вказана',
                error_intensity: '❌ Невірна інтенсивність',
                save_success: '✅ Симптом додано',
                save_error: '❌ Не вдалося додати симптом'
            },

            sexual: {
                title: '🔒 Інтимне життя',
                loading: 'Завантаження опцій...',
                privacy_notice: '🔒 Приватна інформація',
                privacy_description: 'Ці дані видні лише вам і захищені шифруванням. Використовуються для аналізу здоров\'я та самопочуття.',
                select_activity: 'Виберіть активність на сьогодні',
                btn_clear: '🗑️ Очистити',
                btn_cancel: 'Скасувати',
                error_no_options: '⚠️ Немає доступних опцій',
                error_load_options: '❌ Не вдалося завантажити опції',
                error_load: '❌ Помилка завантаження',
                error_save: '❌ Не вдалося зберегти',
                save_success: '✅ Інформація збережена',
                confirm_delete: 'Видалити запис про інтимну активність на сьогодні?',
                options: {
                    no: 'Активності не було',
                    protected_sex: 'Захищений секс',
                    unprotected_sex: 'Незахищений секс',
                    solo: 'Самостійно',
                    with_toy: 'З іграшкою',
                    active_role: 'Активна роль',
                    passive_role: 'Пасивна роль',
                    ovulation: 'Під час овуляції',
                    during_period: 'Під час менструації'
                }
            },

            medication: {
                title_add: '💊 Додати ліки',
                title_edit: '✏️ Редагувати ліки',
                step_basic: 'Основне',
                step_intake_type: 'Тип прийому',
                step_stocks: 'Залишки',
                step_schedule: 'Розклад',
                field_name: 'Назва ліків',
                field_name_placeholder: 'Наприклад: Аспірин',
                field_dosage: 'Дозування',
                field_dosage_hint: 'Вкажіть дозування однієї одиниці',
                field_form: 'Форма випуску',
                field_instructions: 'Інструкція з застосування',
                field_instructions_hint: 'Як правильно приймати ці ліки',
                field_intake_type: 'Тип прийому',
                intake_continuous: 'Постійно',
                intake_course: 'Курсом',
                field_start_date: 'Дата початку',
                field_end_date: 'Дата завершення',
                field_quantity_unit: 'Одиниця виміру',
                field_quantity_available: 'Доступна кількість',
                field_quantity_available_hint: 'Скільки у вас є зараз',
                field_quantity_threshold: 'Повідомити про покупку коли залишиться',
                field_schedule: 'Розклад прийому',
                btn_cancel: 'Скасувати',
                btn_next: 'Далі →',
                btn_back: '← Назад',
                btn_save: '💾 Зберегти',
                btn_add_time: '➕ Додати час прийому',
                btn_add_schedule: '✓ Додати',
                error_name_required: '⚠️ Вкажіть назву ліків',
                error_end_date_required: '⚠️ Вкажіть дату завершення курсу',
                error_end_date_after_start: '⚠️ Дата завершення повинна бути пізнішою за дату початку',
                error_quantity_negative: '⚠️ Кількість не може бути від\'ємною',
                error_schedule_required: '⚠️ Додайте хоча б один час прийому',
                stock_ok: 'Запас в нормі',
                stock_ok_detail: 'Залишилось {diff} до повідомлення',
                stock_warning: 'Час поповнити',
                stock_warning_detail: 'Порог повідомлення досягнутий',
                stock_low: 'Низький залишок!',
                stock_low_detail: 'На {diff} нижче порога',
                toast_loaded: '✅ Дані ліків завантажені',
                toast_error_load: '❌ Помилка завантаження ліків',
                toast_error_load_detail: '❌ Не вдалося завантажити дані: ',
                toast_schedule_updated: '✅ Розклад оновлено',
                toast_schedule_added: '✅ Час прийому додано',
                toast_schedule_deleted: '🗑️ Розклад видалено',
                toast_success_add: '✅ Ліки додано',
                toast_success_update: '✅ Ліки оновлено',
                toast_warning_schedules: '⚠️ Ліки оновлено, але є проблеми з розкладом',
                toast_error_save: '❌ Не вдалося зберегти: '
            },

            simple: {
                symptom_title: '🤕 Додати симптом',
                symptom_category_general: 'Загальне',
                symptom_category_head: 'Голова',
                symptom_category_belly: 'Живіт',
                symptom_category_other: 'Інше',
                symptom_category_gynecology: 'Гінекологія',
                symptom_category_urology: 'Урологія',
                error_intensity: '❌ Невірна інтенсивність',
                error_symptom_add: '❌ Помилка додавання симптому',
                toast_symptom_added: '✅ Симптом додано',
                toast_unknown_modal: '⚠️ Функція в розробці',
                toast_form_not_loaded: '⚠️ Форма не завантажена'
            }
        },

        // Валідатори
        validators: {
            name_required: 'Назва обов\'язкова',
            name_too_long: 'Назва занадто довга'
        },

        // Інтенсивність
        intensity: {
            low: 'Слабка',
            medium: 'Середня',
            high: 'Сильна'
        }
    }
});

console.log('✅ i18n/health-uk.js завантажено');
