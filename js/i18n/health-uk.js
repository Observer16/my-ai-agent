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
            module_title: 'Здоров\'я',
            today: 'Сьогодні',
            yesterday: 'Вчора',
            tomorrow: 'Завтра',
            just_now: 'щойно',
            minutes_ago: '{count} хв тому',
            hours_ago: '{count} г тому',
            days_ago: '{count} днів тому',
            error: 'Помилка',
            warning: 'Попередження',
            success: 'Успішно',
            info: 'Інформація',
            reload: 'Перезавантажити',
            module_load_error: 'Помилка завантаження модуля',
            feature_in_development: 'Ця функція в розробці',
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
            reminder_at: '🔔 Нагадування через',
            error_medication_not_specified: '❌ Помилка: ліки не вказані'
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
            how_it_works: '💡 Як це працює?',
            show_active: 'Показати активні',
            show_archive: 'Показати архівовані',
            confirm_delete_medication: 'Ви впевнені, що хочете видалити цей ліки?'
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
                    no_desc: 'Немає сексуальної активності',
                    protected_sex: 'Захищений секс',
                    protected_sex_desc: 'Використання контрацепції',
                    unprotected_sex: 'Незахищений секс',
                    unprotected_sex_desc: 'Без контрацепції',
                    solo: 'Самостійно',
                    solo_desc: 'Мастурбація',
                    with_toy: 'З іграшкою',
                    with_toy_desc: 'Використання іграшок',
                    active_role: 'Активна роль',
                    active_role_desc: 'Активна роль партнера',
                    passive_role: 'Пасивна роль',
                    passive_role_desc: 'Пасивна роль партнера',
                    ovulation: 'Під час овуляції',
                    ovulation_desc: 'Період фертильності',
                    during_period: 'Під час менструації',
                    during_period_desc: 'Під час менструального циклу'
                }
            },

            medication: {
                // Titles (new keys)
                add_title: '💊 Додати Ліки',
                edit_title: '✏️ Редагувати Ліки',
                // Step titles
                step1_title: 'Основна Інформація',
                step2_title: 'Тип Прийому',
                step3_title: 'Рівні Запасів',
                step4_title: 'Розклад',
                // Legacy keys (for backward compatibility)
                title_add: '💊 Додати ліки',
                title_edit: '✏️ Редагувати ліки',
                step_basic: 'Основне',
                step_intake_type: 'Тип прийому',
                step_stocks: 'Залишки',
                step_schedule: 'Розклад',

                // Step 1: Basic Info
                field_name_label: 'Назва Ліків',
                field_name_placeholder: 'Наприклад: Аспірин',
                field_dosage_label: 'Дозування',
                field_dosage_hint: 'Вкажіть дозування однієї одиниці',
                field_form_label: 'Форма Випуску',
                field_instructions_label: 'Інструкція',
                field_instructions_hint: 'Як правильно приймати ці ліки',
                // Legacy
                field_name: 'Назва ліків',
                field_dosage: 'Дозування',
                field_form: 'Форма випуску',
                field_instructions: 'Інструкція з застосування',

                // Step 2: Intake Type
                field_intake_type_label: 'Тип Прийому',
                intake_type_continuous: 'Постійно',
                intake_type_course: 'Курсом',
                field_start_date_label: 'Дата Початку',
                field_end_date_label: 'Дата Завершення',
                // Legacy
                field_intake_type: 'Тип прийому',
                intake_continuous: 'Постійно',
                intake_course: 'Курсом',
                field_start_date: 'Дата початку',
                field_end_date: 'Дата завершення',

                // Step 3: Stock Levels
                field_quantity_unit_label: 'Одиниця Виміру',
                field_quantity_available_label: 'Доступна Кількість',
                field_quantity_available_hint: 'Скільки у вас є зараз',
                field_quantity_threshold_label: 'Повідомити про покупку коли залишиться',
                info_threshold_continuous: '💡 Ви отримаєте сповіщення коли запас буде ≤ цього значення',
                info_threshold_course_only: '⚠️ Сповіщення працюють лише для постійних ліків',
                stock_preview_title: 'Прогноз',
                // Legacy
                field_quantity_unit: 'Одиниця виміру',
                field_quantity_available: 'Доступна кількість',
                field_quantity_threshold: 'Повідомити про покупку коли залишиться',

                // Step 4: Schedule
                field_schedule_label: 'Розклад Прийому',
                field_schedule_hint: 'Додайте часи та дні для прийому ліків',
                btn_add_time_label: '➕ Додати Час Прийому',
                btn_quick_all_days: 'Кожен День',
                btn_quick_weekdays: 'У Робочі Дні',
                btn_quick_weekends: 'На Вихідні',
                btn_quick_clear: 'Очистити',
                empty_schedules_text: 'Розклад не додано',
                empty_schedules_hint: 'Ви можете зберегти без розкладу і додати його пізніше',
                schedule_form_header: '➕ Новий Час Прийому',
                schedule_days_label: 'Дні Тижня',
                schedule_time_label: 'Час',
                schedule_dosage_label: 'Кількість',
                btn_add_schedule: '✓ Додати',
                // Legacy
                field_schedule: 'Розклад прийому',
                btn_add_time: '➕ Додати час прийому',

                // Units
                unit_tablets: 'Таблетки',
                unit_capsules: 'Капсули',
                unit_milliliters: 'мл',
                unit_drops: 'Краплі',
                unit_doses: 'Дози',
                unit_pieces: 'Штуки',

                // Days (short)
                day_mon_short: 'Пн',
                day_tue_short: 'Вт',
                day_wed_short: 'Ср',
                day_thu_short: 'Чт',
                day_fri_short: 'Пт',
                day_sat_short: 'Сб',
                day_sun_short: 'Нд',

                // Days (full)
                day_monday: 'Понеділок',
                day_tuesday: 'Вівторок',
                day_wednesday: 'Середа',
                day_thursday: 'Четвер',
                day_friday: 'Пʼятниця',
                day_saturday: 'Субота',
                day_sunday: 'Неділя',

                // Errors
                error_name_required: '⚠️ Вкажіть назву ліків',
                error_name_too_long: '⚠️ Назва ліків занадто довга',
                error_dosage_required: '⚠️ Введіть дозування',
                error_form_required: '⚠️ Виберіть форму випуску',
                error_start_date_required: '⚠️ Вкажіть дату початку',
                error_end_date_required: '⚠️ Вкажіть дату завершення курсу',
                error_end_date_after_start: '⚠️ Дата завершення повинна бути пізнішою за дату початку',
                error_quantity_invalid: '⚠️ Неправильна кількість',
                error_quantity_negative: '⚠️ Кількість не може бути від\'ємною',
                error_schedule_required: '⚠️ Додайте хоча б один час прийому',
                error_schedule_overlap: '⚠️ Часи прийому накладаються',
                error_invalid_time: '⚠️ Неправильний формат часу',
                error_days_required: '⚠️ Виберіть хоча б один день тижня',
                error_time_required: '⚠️ Вкажіть час прийому',
                error_quantity_zero: '⚠️ Кількість повинна бути більше нуля',
                error_save_generic: 'Помилка збереження',
                error_save: '❌ Не вдалося зберегти: ',

                // Success & Status
                success_created: '✅ Ліки додано',
                success_updated: '✅ Ліки оновлено',
                success_deleted: '✅ Ліки видалено',
                success_schedule_updated: '✅ Розклад оновлено',
                success_schedule_added: '✅ Час прийому додано',
                success_schedule_deleted: '✅ Розклад видалено',
                success_update_with_warnings: '✅ Ліки оновлено, але є проблеми з розкладом',

                // Stock Status
                stock_ok: 'Запас в нормі',
                stock_ok_detail: 'Залишилось {diff} до повідомлення',
                stock_warning: 'Час поповнити',
                stock_warning_detail: 'Порог повідомлення досягнутий',
                stock_low: 'Низький залишок!',
                stock_low_detail: 'На {diff} нижче порога',

                // Toast Messages
                toast_loaded: '✅ Дані ліків завантажені',
                toast_error_load: '❌ Помилка завантаження ліків',
                toast_error_load_detail: '❌ Не вдалося завантажити дані: ',
                toast_schedule_updated: '✅ Розклад оновлено',
                toast_schedule_added: '✅ Час прийому додано',
                toast_schedule_deleted: '✅ Розклад видалено',
                toast_success_add: '✅ Ліки додано',
                toast_success_update: '✅ Ліки оновлено',
                toast_success_delete: '✅ Ліки видалено',
                toast_warning_schedules: '⚠️ Ліки оновлено, але є проблеми з розкладом',
                toast_error_save: '❌ Не вдалося зберегти: ',

                // Button keys
                btn_next: 'Далі →',
                btn_back: '← Назад',
                btn_cancel: 'Скасувати',
                btn_save: '💾 Зберегти',
                btn_add_schedule: '✓ Додати',
                error_unknown_step: 'Невідомий крок',

                // Legacy keys
                btn_cancel: 'Скасувати'
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
