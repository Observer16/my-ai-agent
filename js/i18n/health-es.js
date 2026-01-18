// js/i18n/health-es.js - Traducciones al español del módulo de Salud

registerTranslations('health', {
    es: {
        // Navegación (pestañas)
        tabs: {
            dashboard: 'Hoy',
            medications: 'Botiquín',
            diary: 'Diario',
            stats: 'Estadísticas',
            settings: 'Configuración'
        },

        // Estados de ánimo
        moods: {
            joy: 'alegría',
            satisfaction: 'satisfacción',
            neutral: 'neutral',
            sadness: 'tristeza',
            stress: 'estrés',
            irritability: 'irritabilidad',
            anxiety: 'ansiedad',
            fatigue: 'cansancio',
            energy: 'energía',
            calm: 'calma'
        },

        // Opciones de género
        genders: {
            male: { label: 'Masculino', description: 'Recomendaciones estándar para hombres' },
            female: { label: 'Femenino', description: 'Incluyendo salud femenina' },
            other: { label: 'Otro', description: 'Recomendaciones generales' },
            prefer_not_to_say: { label: 'Prefiero no especificar', description: 'Configuración general' }
        },

        // Formas de medicamentos
        medicationForms: {
            tablet: 'Tabletas',
            capsule: 'Cápsulas',
            syrup: 'Jarabe',
            solution: 'Solución',
            ointment: 'Pomada',
            cream: 'Crema',
            drops: 'Gotas',
            spray: 'Aerosol',
            powder: 'Polvo',
            other: 'Otro'
        },

        // Elementos comunes de UI
        common: {
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            add: 'Añadir',
            edit: 'Editar',
            loading: 'Cargando...',
            loading_module: 'Cargando módulo de salud...',
            today: 'Hoy',
            yesterday: 'Ayer',
            days_ago: 'hace {count} días',
            error: 'Error',
            success: 'Éxito',
            reload: 'Recargar',
            module_load_error: 'Error al cargar el módulo',
            no_data: 'Sin datos',
            not_specified: 'No especificado'
        },

        // Componente Dashboard
        dashboard: {
            greeting_morning: '👋 ¡Buenos días!',
            greeting_afternoon: '👋 ¡Buenas tardes!',
            greeting_evening: '👋 ¡Buenas noches!',
            weekly_summary: 'Resumen semanal',
            loading_stats: 'Cargando estadísticas...',
            wellness_check: '¿Cómo te sientes?',
            todays_plan: 'Plan de hoy',
            todays_medications: 'Medicamentos para hoy',
            no_medications_today: 'Sin medicamentos para hoy',
            mood: 'Estado de ánimo',
            sleep: 'Sueño',
            symptoms: 'Síntomas',
            intimacy: 'Actividad íntima',
            specified: 'Especificado',
            take_medication: '✅ Tomar',
            skip_medication: '⏭ Omitir',
            medication_taken: '✅ Tomado',
            reminder_at: '🔔 Recordatorio en'
        },

        // Componente Medicamentos
        medications: {
            title: '💊 Botiquín',
            archive: 'Archivo',
            add_medication: '+ Añadir',
            loading_medications: 'Cargando medicamentos...',
            empty_medications: 'Botiquín vacío',
            add_first_medication: 'Añada los medicamentos que toma regularmente',
            add_first_medication_btn: 'Añadir primer medicamento',
            form_label: 'Forma:',
            next_intake: 'Próxima toma:',
            instructions: 'Instrucciones:',
            default_dosage: 'una tableta',
            form_not_specified: 'No especificada',
            default_name: 'Medicamento',
            no_medications_today: 'Sin medicamentos para hoy',
            add_medications_prompt: 'Añada medicamentos en la sección "Botiquín"',
            go_to_medications: 'Ir al botiquín',
            how_it_works: '💡 ¿Cómo funciona?'
        },

        // Componente Diario
        diary: {
            title: 'Diario de Salud',
            calendar: 'Calendario',
            entries: 'Entradas',
            no_entry: 'No especificado',
            weekdays_short: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            weekdays_full: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
            sleep_label: 'Sueño (horas)',
            sleep_placeholder: 'Ejemplo: 7.5',
            sexual_activity_note: 'Solo para ti',
            add_symptom_btn: '+ Agregar síntoma',
            notes_label: 'Notas',
            notes_placeholder: '¿Cómo te sentiste hoy?',
            save_btn: '💾 Guardar entrada',
            no_symptoms: 'Sin síntomas agregados'
        },

        // Componente Estadísticas
        stats: {
            title: '📊 Estadísticas',
            loading: 'Cargando estadísticas...',
            loading_for_days: 'Cargando estadísticas para {days} días...',
            loaded_for_days: 'Estadísticas para {days} días cargadas',
            error_load: 'No se pudieron cargar las estadísticas',
            error_load_message: 'Error al cargar las estadísticas',
            try_again: 'Intentar de nuevo',
            adherence_title: '💊 Cumplimiento de la medicación',
            adherence_taken: 'Tomado a tiempo',
            adherence_missed: 'Omitido',
            mood_title: '😊 Estado de ánimo',
            mood_no_data: 'Sin datos de estado de ánimo',
            mood_predominant: 'Estado de ánimo predominante en el período seleccionado',
            symptoms_title: '⚠️ Síntomas frecuentes',
            symptoms_no_data: 'Sin datos de síntomas',
            sleep_title: '💤 Estadísticas de sueño',
            sleep_average: 'Promedio',
            sleep_hours_unit: 'h',
            sleep_entries: 'Entradas',
            sleep_period: 'Período',
            sleep_days_unit: 'días'
        },

        // Componente Configuración
        settings: {
            title: 'Configuración de Salud',
            profile_section: 'Perfil y datos antropométricos',
            loading_profile: 'Cargando perfil...',
            profile_title: 'Perfil de Usuario',
            profile_subtitle: 'Datos básicos para el análisis de salud',
            gender: 'Género',
            gender_not_specified: 'No especificado',
            birth_date: 'Fecha de nacimiento',
            language: 'Idioma de la interfaz',
            language_changed: '✅ Idioma cambiado',
            language_change_error: '❌ No se pudo cambiar el idioma'
        },

        // Componente Onboarding
        onboarding: {
            title: 'Conozcámonos',
            subtitle: 'Para proporcionarle recomendaciones personalizadas, proporcione su información básica de salud',
            important_label: 'Importante',
            privacy_note: 'Todos los datos de salud se almacenan de forma confidencial',
            saving: 'Guardando...',
            saved: '¡Guardado!',
            error_save: 'Error al guardar. Por favor, inténtelo de nuevo.'
        },

        // Ventanas modales
        modals: {
            mood: {
                title: '😊 ¿Cómo te sientes?',
                save_success: '✅ Estado de ánimo guardado',
                save_error: '❌ No se pudo guardar el estado de ánimo'
            },

            weight: {
                title: '⚖️ Peso',
                field_weight: 'Tu peso (kg)',
                field_weight_placeholder: 'Por ejemplo: 70.5',
                hint: '💡 Para un seguimiento preciso, se recomienda pesarse por la mañana antes de comer',
                btn_cancel: 'Cancelar',
                btn_save: '💾 Guardar',
                error_empty: '⚠️ Ingrese su peso',
                error_invalid: '❌ Valor de peso inválido (0-500 kg)',
                save_success: '✅ Peso guardado',
                save_error: '❌ No se pudo guardar el peso'
            },

            symptom: {
                title: '🤕 Agregar síntoma',
                field_category: 'Categoría',
                field_category_placeholder: 'Seleccione categoría',
                field_symptom: 'Síntoma',
                field_symptom_placeholder_empty: 'Seleccione síntoma',
                field_symptom_placeholder_select: 'Primero seleccione una categoría',
                field_symptom_not_found: 'Síntomas no encontrados',
                field_intensity: 'Intensidad',
                intensity_low: 'Baja',
                intensity_medium: 'Media',
                intensity_high: 'Alta',
                btn_cancel: 'Cancelar',
                btn_save: 'Agregar síntoma',
                error_select: '⚠️ Seleccione categoría y síntoma',
                error_date: '❌ Fecha no especificada',
                error_intensity: '❌ Intensidad inválida',
                save_success: '✅ Síntoma agregado',
                save_error: '❌ No se pudo agregar el síntoma'
            },

            sexual: {
                title: '🔒 Vida íntima',
                loading: 'Cargando opciones...',
                privacy_notice: '🔒 Información privada',
                privacy_description: 'Estos datos son visibles solo para usted y están protegidos por cifrado. Se utilizan para el análisis de la salud y el bienestar.',
                select_activity: 'Seleccione actividad de hoy',
                btn_clear: '🗑️ Limpiar',
                btn_cancel: 'Cancelar',
                error_no_options: '⚠️ Sin opciones disponibles',
                error_load_options: '❌ No se pudieron cargar las opciones',
                error_load: '❌ Error al cargar',
                error_save: '❌ No se pudo guardar',
                save_success: '✅ Información guardada',
                confirm_delete: '¿Eliminar registro de actividad íntima para hoy?',
                options: {
                    no: 'Sin actividad',
                    protected_sex: 'Sexo protegido',
                    unprotected_sex: 'Sexo sin protección',
                    solo: 'Solo',
                    with_toy: 'Con juguete',
                    active_role: 'Rol activo',
                    passive_role: 'Rol pasivo',
                    ovulation: 'Durante la ovulación',
                    during_period: 'Durante el período'
                }
            },

            medication: {
                title_add: '💊 Agregar medicamento',
                title_edit: '✏️ Editar medicamento',
                step_basic: 'Básico',
                step_intake_type: 'Tipo de ingesta',
                step_stocks: 'Niveles de stock',
                step_schedule: 'Horario',
                field_name: 'Nombre del medicamento',
                field_name_placeholder: 'Por ejemplo: Aspirina',
                field_dosage: 'Dosis',
                field_dosage_hint: 'Especifique la dosis de una unidad',
                field_form: 'Forma de dosificación',
                field_instructions: 'Instrucciones de uso',
                field_instructions_hint: 'Cómo tomar este medicamento correctamente',
                field_intake_type: 'Tipo de ingesta',
                intake_continuous: 'Continuo',
                intake_course: 'Curso',
                field_start_date: 'Fecha de inicio',
                field_end_date: 'Fecha de finalización',
                field_quantity_unit: 'Unidad de medida',
                field_quantity_available: 'Cantidad disponible',
                field_quantity_available_hint: 'Cuánto tienes ahora',
                field_quantity_threshold: 'Notificarme comprar cuando quede',
                field_schedule: 'Horario de ingesta',
                btn_cancel: 'Cancelar',
                btn_next: 'Siguiente →',
                btn_back: '← Atrás',
                btn_save: '💾 Guardar',
                btn_add_time: '➕ Agregar hora de ingesta',
                btn_add_schedule: '✓ Agregar',
                error_name_required: '⚠️ Ingrese nombre del medicamento',
                error_end_date_required: '⚠️ Especifique fecha de finalización del curso',
                error_end_date_after_start: '⚠️ La fecha de finalización debe ser posterior a la fecha de inicio',
                error_quantity_negative: '⚠️ La cantidad no puede ser negativa',
                error_schedule_required: '⚠️ Agregue al menos una hora de ingesta',
                stock_ok: 'Stock normal',
                stock_ok_detail: '{diff} restante hasta notificación',
                stock_warning: 'Hora de reabastecer',
                stock_warning_detail: 'Umbral de notificación alcanzado',
                stock_low: '¡Stock bajo!',
                stock_low_detail: '{diff} por debajo del umbral',
                toast_loaded: '✅ Datos del medicamento cargados',
                toast_error_load: '❌ Error al cargar el medicamento',
                toast_error_load_detail: '❌ No se pudieron cargar los datos: ',
                toast_schedule_updated: '✅ Horario actualizado',
                toast_schedule_added: '✅ Hora de ingesta agregada',
                toast_schedule_deleted: '🗑️ Horario eliminado',
                toast_success_add: '✅ Medicamento agregado',
                toast_success_update: '✅ Medicamento actualizado',
                toast_warning_schedules: '⚠️ Medicamento actualizado pero hay problemas de horario',
                toast_error_save: '❌ No se pudo guardar: '
            },

            simple: {
                symptom_title: '🤕 Agregar síntoma',
                symptom_category_general: 'General',
                symptom_category_head: 'Cabeza',
                symptom_category_belly: 'Vientre',
                symptom_category_other: 'Otro',
                symptom_category_gynecology: 'Ginecología',
                symptom_category_urology: 'Urología',
                error_intensity: '❌ Intensidad inválida',
                error_symptom_add: '❌ Error al agregar síntoma',
                toast_symptom_added: '✅ Síntoma agregado',
                toast_unknown_modal: '⚠️ Función en desarrollo',
                toast_form_not_loaded: '⚠️ Formulario no cargado'
            }
        },

        // Validadores
        validators: {
            name_required: 'El nombre es obligatorio',
            name_too_long: 'El nombre es demasiado largo'
        },

        // Intensidad
        intensity: {
            low: 'Baja',
            medium: 'Media',
            high: 'Alta'
        }
    }
});

console.log('✅ i18n/health-es.js cargado');
