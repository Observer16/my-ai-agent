// js/i18n/health-en.js - English translations for Health module

registerTranslations('health', {
    en: {
        // Navigation (tabs)
        tabs: {
            dashboard: 'Today',
            medications: 'Medicine Cabinet',
            diary: 'Diary',
            stats: 'Statistics',
            settings: 'Settings'
        },

        // Moods
        moods: {
            joy: 'joy',
            satisfaction: 'satisfaction',
            neutral: 'neutral',
            sadness: 'sadness',
            stress: 'stress',
            irritability: 'irritability',
            anxiety: 'anxiety',
            fatigue: 'fatigue',
            energy: 'energy',
            calm: 'calm'
        },

        // Gender options
        genders: {
            male: { label: 'Male', description: 'Standard recommendations for men' },
            female: { label: 'Female', description: 'Including women\'s health' },
            other: { label: 'Other', description: 'General recommendations' },
            prefer_not_to_say: { label: 'Prefer not to say', description: 'General settings' }
        },

        // Medication forms
        medicationForms: {
            tablet: 'Tablets',
            capsule: 'Capsules',
            syrup: 'Syrup',
            solution: 'Solution',
            ointment: 'Ointment',
            cream: 'Cream',
            drops: 'Drops',
            spray: 'Spray',
            powder: 'Powder',
            other: 'Other'
        },

        // Common UI elements
        common: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            add: 'Add',
            edit: 'Edit',
            loading: 'Loading...',
            loading_module: 'Loading health module...',
            today: 'Today',
            yesterday: 'Yesterday',
            days_ago: '{count} days ago',
            error: 'Error',
            success: 'Success',
            reload: 'Reload',
            module_load_error: 'Module loading error',
            no_data: 'No data',
            not_specified: 'Not specified'
        },

        // Dashboard component
        dashboard: {
            greeting_morning: '👋 Good morning!',
            greeting_afternoon: '👋 Good afternoon!',
            greeting_evening: '👋 Good evening!',
            weekly_summary: 'Weekly summary',
            loading_stats: 'Loading statistics...',
            wellness_check: 'How are you feeling?',
            todays_plan: 'Today\'s plan',
            todays_medications: 'Medications for today',
            no_medications_today: 'No medications for today',
            mood: 'Mood',
            sleep: 'Sleep',
            symptoms: 'Symptoms',
            intimacy: 'Intimacy',
            specified: 'Specified',
            take_medication: '✅ Take',
            skip_medication: '⏭ Skip',
            medication_taken: '✅ Taken',
            reminder_at: '🔔 Reminder in'
        },

        // Medications component
        medications: {
            title: '💊 Medicine Cabinet',
            archive: 'Archive',
            add_medication: '+ Add',
            loading_medications: 'Loading medications...',
            empty_medications: 'Medicine cabinet is empty',
            add_first_medication: 'Add medications you take regularly',
            add_first_medication_btn: 'Add first medication',
            form_label: 'Form:',
            next_intake: 'Next intake:',
            instructions: 'Instructions:',
            default_dosage: 'one tablet',
            form_not_specified: 'Not specified',
            default_name: 'Medication',
            no_medications_today: 'No medications for today',
            add_medications_prompt: 'Add medications in the "Medicine Cabinet" section',
            go_to_medications: 'Go to medicine cabinet',
            how_it_works: '💡 How it works?'
        },

        // Diary component
        diary: {
            title: 'Health Diary',
            calendar: 'Calendar',
            entries: 'Entries',
            no_entry: 'Not specified',
            weekdays_short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            weekdays_full: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            sleep_label: 'Sleep (hours)',
            sleep_placeholder: 'Example: 7.5',
            sexual_activity_note: 'Only for you',
            add_symptom_btn: '+ Add symptom',
            notes_label: 'Notes',
            notes_placeholder: 'How did you feel today?',
            save_btn: '💾 Save entry',
            no_symptoms: 'No symptoms added'
        },

        // Stats component
        stats: {
            title: '📊 Statistics',
            loading: 'Loading statistics...',
            loading_for_days: 'Loading statistics for {days} days...',
            loaded_for_days: 'Statistics for {days} days loaded',
            error_load: 'Could not load statistics',
            error_load_message: 'Error loading statistics',
            try_again: 'Try again',
            adherence_title: '💊 Medication Adherence',
            adherence_taken: 'Taken on time',
            adherence_missed: 'Missed',
            mood_title: '😊 Mood',
            mood_no_data: 'No mood data',
            mood_predominant: 'Predominant mood in selected period',
            symptoms_title: '⚠️ Frequent Symptoms',
            symptoms_no_data: 'No symptoms data',
            sleep_title: '💤 Sleep Statistics',
            sleep_average: 'Average',
            sleep_hours_unit: 'h',
            sleep_entries: 'Entries',
            sleep_period: 'Period',
            sleep_days_unit: 'days'
        },

        // Settings component
        settings: {
            title: 'Health Settings',
            profile_section: 'Profile and anthropometric data',
            loading_profile: 'Loading profile...',
            profile_title: 'User Profile',
            profile_subtitle: 'Basic data for health analysis',
            gender: 'Gender',
            gender_not_specified: 'Not specified',
            birth_date: 'Birth date',
            language: 'Interface language',
            language_changed: '✅ Language changed',
            language_change_error: '❌ Failed to change language'
        },

        // Onboarding component
        onboarding: {
            title: 'Let\'s get to know you',
            subtitle: 'To provide personalized recommendations, please provide your basic health information',
            important_label: 'Important',
            privacy_note: 'All health data is stored confidentially',
            saving: 'Saving...',
            saved: 'Saved!',
            error_save: 'Save error. Please try again.'
        },

        // Modals
        modals: {
            mood: {
                title: '😊 How are you feeling?',
                save_success: '✅ Mood saved',
                save_error: '❌ Failed to save mood'
            },

            weight: {
                title: '⚖️ Weight',
                field_weight: 'Your weight (kg)',
                field_weight_placeholder: 'For example: 70.5',
                hint: '💡 For accurate tracking, it is recommended to weigh yourself in the morning before eating',
                btn_cancel: 'Cancel',
                btn_save: '💾 Save',
                error_empty: '⚠️ Enter your weight',
                error_invalid: '❌ Invalid weight value (0-500 kg)',
                save_success: '✅ Weight saved',
                save_error: '❌ Failed to save weight'
            },

            symptom: {
                title: '🤕 Add symptom',
                field_category: 'Category',
                field_category_placeholder: 'Select category',
                field_symptom: 'Symptom',
                field_symptom_placeholder_empty: 'Select symptom',
                field_symptom_placeholder_select: 'First select a category',
                field_symptom_not_found: 'Symptoms not found',
                field_intensity: 'Intensity',
                intensity_low: 'Low',
                intensity_medium: 'Medium',
                intensity_high: 'High',
                btn_cancel: 'Cancel',
                btn_save: 'Add symptom',
                error_select: '⚠️ Select category and symptom',
                error_date: '❌ Date not specified',
                error_intensity: '❌ Invalid intensity',
                save_success: '✅ Symptom added',
                save_error: '❌ Failed to add symptom'
            },

            sexual: {
                title: '🔒 Intimate life',
                loading: 'Loading options...',
                privacy_notice: '🔒 Private information',
                privacy_description: 'This data is visible only to you and protected by encryption. Used for health and wellness analysis.',
                select_activity: 'Select activity for today',
                btn_clear: '🗑️ Clear',
                btn_cancel: 'Cancel',
                error_no_options: '⚠️ No available options',
                error_load_options: '❌ Failed to load options',
                error_load: '❌ Loading error',
                error_save: '❌ Failed to save',
                save_success: '✅ Information saved',
                confirm_delete: 'Delete intimate activity record for today?',
                options: {
                    no: 'No activity',
                    protected_sex: 'Protected sex',
                    unprotected_sex: 'Unprotected sex',
                    solo: 'Solo',
                    with_toy: 'With toy',
                    active_role: 'Active role',
                    passive_role: 'Passive role',
                    ovulation: 'During ovulation',
                    during_period: 'During period'
                }
            },

            medication: {
                title_add: '💊 Add medication',
                title_edit: '✏️ Edit medication',
                step_basic: 'Basic',
                step_intake_type: 'Intake type',
                step_stocks: 'Stock levels',
                step_schedule: 'Schedule',
                field_name: 'Medication name',
                field_name_placeholder: 'For example: Aspirin',
                field_dosage: 'Dosage',
                field_dosage_hint: 'Specify dosage of one unit',
                field_form: 'Dosage form',
                field_instructions: 'Instructions for use',
                field_instructions_hint: 'How to take this medication correctly',
                field_intake_type: 'Intake type',
                intake_continuous: 'Continuous',
                intake_course: 'Course',
                field_start_date: 'Start date',
                field_end_date: 'End date',
                field_quantity_unit: 'Unit of measurement',
                field_quantity_available: 'Quantity available',
                field_quantity_available_hint: 'How much you have now',
                field_quantity_threshold: 'Notify me to buy when remaining',
                field_schedule: 'Intake schedule',
                btn_cancel: 'Cancel',
                btn_next: 'Next →',
                btn_back: '← Back',
                btn_save: '💾 Save',
                btn_add_time: '➕ Add intake time',
                btn_add_schedule: '✓ Add',
                error_name_required: '⚠️ Enter medication name',
                error_end_date_required: '⚠️ Specify course end date',
                error_end_date_after_start: '⚠️ End date must be after start date',
                error_quantity_negative: '⚠️ Quantity cannot be negative',
                error_schedule_required: '⚠️ Add at least one intake time',
                stock_ok: 'Stock is normal',
                stock_ok_detail: '{diff} remaining until notification',
                stock_warning: 'Time to refill',
                stock_warning_detail: 'Notification threshold reached',
                stock_low: 'Low stock!',
                stock_low_detail: '{diff} below threshold',
                toast_loaded: '✅ Medication data loaded',
                toast_error_load: '❌ Error loading medication',
                toast_error_load_detail: '❌ Failed to load data: ',
                toast_schedule_updated: '✅ Schedule updated',
                toast_schedule_added: '✅ Intake time added',
                toast_schedule_deleted: '🗑️ Schedule deleted',
                toast_success_add: '✅ Medication added',
                toast_success_update: '✅ Medication updated',
                toast_warning_schedules: '⚠️ Medication updated but there are schedule issues',
                toast_error_save: '❌ Failed to save: '
            },

            simple: {
                symptom_title: '🤕 Add symptom',
                symptom_category_general: 'General',
                symptom_category_head: 'Head',
                symptom_category_belly: 'Belly',
                symptom_category_other: 'Other',
                symptom_category_gynecology: 'Gynecology',
                symptom_category_urology: 'Urology',
                error_intensity: '❌ Invalid intensity',
                error_symptom_add: '❌ Error adding symptom',
                toast_symptom_added: '✅ Symptom added',
                toast_unknown_modal: '⚠️ Feature in development',
                toast_form_not_loaded: '⚠️ Form not loaded'
            }
        },

        // Validators
        validators: {
            name_required: 'Name is required',
            name_too_long: 'Name is too long'
        },

        // Intensity
        intensity: {
            low: 'Low',
            medium: 'Medium',
            high: 'High'
        }
    }
});

console.log('✅ i18n/health-en.js loaded');
