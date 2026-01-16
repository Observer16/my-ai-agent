# 💾 Схема базы данных

Описание структуры основных таблиц PostgreSQL.

## Обзор таблиц

### Public Schema - Основные таблицы приложения

#### Аутентификация и управление пользователями
- **app_users** - учетные записи пользователей (Telegram ID, настройки)
- **families** - семьи для совместного управления бюджетом
- **family_members** - связь пользователи-семьи
- **family_invites** - приглашения в семью с токенами и истечением

#### Товары и каталог
- **products** - товары (штрих-код, категория, бренд, описание)
- **product_names** - многоязычные названия товаров (es, en, ru, uk) с нормализацией
- **product_synonyms** - синонимы товаров для улучшения поиска
- **category_translations** - переводы названий категорий

#### Магазины и расходы
- **stores** - магазины (адрес, RUC, контакты)
- **expense_categories** - категории расходов (иерархические)
- **tag_translations** - переводы тегов

#### Покупки и цены
- **purchases** - документы закупок (счета, QR-коды)
- **purchase_items** - строки товаров в закупке
- **price_history** - история цен товаров по магазинам
- **user_photo_reviews** - отзывы и фото товаров

#### Прочие данные
- **activity_records** - логи активности пользователей
- **health_records** - общие медицинские записи

### Health Schema - Модуль здоровья

#### Основные таблицы
- **user_profiles** - профили здоровья пользователей
- **health_goals** - цели и целевые показатели здоровья
- **entries** - записи дневника здоровья (настроение, сон, вес)
- **symptoms** - симптомы в записях дневника
- **medications** - медикаменты и лекарства
- **medication_schedules** - расписание приема лекарств
- **medication_reminders** - напоминания о приеме лекарств
- **medication_logs** - логи приема лекарств

#### Специализированные таблицы здоровья
- **dental_health** - стоматологические записи
- **immunizations** - прививки и иммунизация
- **medical_measurements** - медицинские измерения (давление, пульс, температура)
- **vision_health** - здоровье зрения
- **menstrual_cycle** - менструальный цикл
- **physical_activity** - физическая активность
- **water_intake** - водный баланс

#### Уведомления и системные
- **notification_logs** - логи отправленных уведомлений
- **user_notification_settings** - настройки уведомлений пользователей

### Parsing Schema - Данные из парсинга

- **offers** - предложения из парсинга (интеграция с внешними источниками)

## Ключевые особенности

### Типы данных
- **UUID** - первичные ключи для большинства таблиц (распределенная система)
- **Int4/Int8** - для user_id (Telegram ID) и числовых полей
- **Timestamptz** - все временные метки в UTC с информацией о часовом поясе
- **Jsonb** - для хранения метаданных (notification_logs, settings)
- **Text/Varchar** - для текстовых полей разной длины

### Общие поля
- **id** - PRIMARY KEY (UUID или SERIAL для legacy таблиц)
- **created_at** - время создания записи (DEFAULT CURRENT_TIMESTAMP)
- **updated_at** - время последнего обновления (с триггером)
- **family_id** - для изоляции данных (NULL для личных, UUID для семейных)
- **created_by_user_id** - автор записи (для аудита)
- **is_active** - флаг активности (для soft delete)

### Безопасность и целостность
- **UNIQUE constraints** - предотвращение дубликатов
- **FOREIGN KEY constraints** - реферциальная целостность
- **CHECK constraints** - валидация данных на уровне БД
- **Row-level security (RLS)** - планируется для изоляции по семьям
- **Triggers** - автоматическое обновление `updated_at`

### Полный SQL код таблиц

-- DROP SCHEMA health;

CREATE SCHEMA health AUTHORIZATION postgres;

COMMENT ON SCHEMA health IS 'Модуль здоровья и дневника здоровья с расширенным функционалом';

-- DROP SEQUENCE health.notification_logs_id_seq;

CREATE SEQUENCE health.notification_logs_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE health.notification_logs_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE health.notification_logs_id_seq TO postgres;
-- health.dental_health определение

-- Drop table

-- DROP TABLE health.dental_health;

CREATE TABLE health.dental_health ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, checkup_date date NOT NULL, dentist_name varchar(200) NULL, clinic_name varchar(200) NULL, next_appointment_date date NULL, procedures_done _text NULL, recommendations text NULL, notes text NULL, xray_images _text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT dental_health_pkey PRIMARY KEY (id));
CREATE INDEX idx_dental_health_next_appointment ON health.dental_health USING btree (next_appointment_date) WHERE (next_appointment_date IS NOT NULL);
CREATE INDEX idx_dental_health_user_date ON health.dental_health USING btree (user_id, checkup_date DESC);
COMMENT ON TABLE health.dental_health IS 'Здоровье зубов и стоматологические записи';

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.dental_health for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.dental_health OWNER TO postgres;
GRANT ALL ON TABLE health.dental_health TO postgres;


-- health.entries определение

-- Drop table

-- DROP TABLE health.entries;

CREATE TABLE health.entries ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, entry_date date NOT NULL, mood varchar(50) NULL, sexual_activity varchar(50) NULL, sleep_hours numeric(3, 1) NULL, weight numeric(5, 2) NULL, notes text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT entries_pkey PRIMARY KEY (id), CONSTRAINT entries_sleep_hours_check CHECK (((sleep_hours >= (0)::numeric) AND (sleep_hours <= (24)::numeric))), CONSTRAINT entries_user_id_entry_date_key UNIQUE (user_id, entry_date), CONSTRAINT entries_weight_check CHECK (((weight > (0)::numeric) AND (weight < (500)::numeric))));
CREATE INDEX idx_entries_date_range ON health.entries USING btree (entry_date DESC, user_id);
CREATE INDEX idx_health_entries_user_date ON health.entries USING btree (user_id, entry_date DESC);

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.entries for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.entries OWNER TO postgres;
GRANT ALL ON TABLE health.entries TO postgres;


-- health.health_goals определение

-- Drop table

-- DROP TABLE health.health_goals;

CREATE TABLE health.health_goals ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, goal_type varchar(50) NOT NULL, target_value numeric(10, 2) NULL, current_value numeric(10, 2) NULL, unit varchar(20) NULL, start_date date NOT NULL, end_date date NULL, is_active bool DEFAULT true NULL, priority int4 DEFAULT 1 NULL, notes text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT health_goals_pkey PRIMARY KEY (id), CONSTRAINT health_goals_priority_check CHECK (((priority >= 1) AND (priority <= 5))));
CREATE INDEX idx_health_goals_type_active ON health.health_goals USING btree (goal_type, is_active) WHERE (is_active = true);
CREATE INDEX idx_health_goals_user_active ON health.health_goals USING btree (user_id, is_active);
COMMENT ON TABLE health.health_goals IS 'Цели здоровья и wellness';

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.health_goals for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.health_goals OWNER TO postgres;
GRANT ALL ON TABLE health.health_goals TO postgres;


-- health.immunizations определение

-- Drop table

-- DROP TABLE health.immunizations;

CREATE TABLE health.immunizations ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, vaccine_name varchar(200) NOT NULL, administration_date date NOT NULL, dose_number int4 NULL, total_doses int4 NULL, manufacturer varchar(100) NULL, lot_number varchar(100) NULL, administering_clinic varchar(200) NULL, next_due_date date NULL, notes text NULL, certificate_url text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT immunizations_pkey PRIMARY KEY (id));
CREATE INDEX idx_immunizations_next_due ON health.immunizations USING btree (next_due_date) WHERE (next_due_date IS NOT NULL);
CREATE INDEX idx_immunizations_user_date ON health.immunizations USING btree (user_id, administration_date DESC);
COMMENT ON TABLE health.immunizations IS 'Записи о прививках и иммунизации';

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.immunizations for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.immunizations OWNER TO postgres;
GRANT ALL ON TABLE health.immunizations TO postgres;


-- health.medical_measurements определение

-- Drop table

-- DROP TABLE health.medical_measurements;

CREATE TABLE health.medical_measurements ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, measurement_date date NOT NULL, measurement_time time NULL, measurement_type varchar(50) NOT NULL, value1 numeric(10, 2) NULL, value2 numeric(10, 2) NULL, value3 numeric(10, 2) NULL, unit varchar(20) NULL, notes text NULL, device_id varchar(100) NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT medical_measurements_pkey PRIMARY KEY (id));
CREATE INDEX idx_medical_measurements_date_user ON health.medical_measurements USING btree (measurement_date, user_id);
CREATE INDEX idx_medical_measurements_user_type_date ON health.medical_measurements USING btree (user_id, measurement_type, measurement_date DESC);
COMMENT ON TABLE health.medical_measurements IS 'Медицинские измерения (давление, глюкоза и др.)';

-- Permissions

ALTER TABLE health.medical_measurements OWNER TO postgres;
GRANT ALL ON TABLE health.medical_measurements TO postgres;


-- health.medication_logs определение

-- Drop table

-- DROP TABLE health.medication_logs;

CREATE TABLE health.medication_logs ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, medication_id uuid NOT NULL, schedule_id uuid NULL, entry_id uuid NULL, scheduled_time timestamp NOT NULL, taken_time timestamp NULL, status varchar(20) DEFAULT 'pending'::character varying NULL, notes text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT now() NULL, CONSTRAINT medication_logs_pkey PRIMARY KEY (id), CONSTRAINT medication_logs_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('notified'::character varying)::text, ('taken'::character varying)::text, ('missed'::character varying)::text, ('skipped'::character varying)::text]))));
CREATE INDEX idx_health_logs_scheduled ON health.medication_logs USING btree (scheduled_time, status) WHERE ((status)::text = 'pending'::text);
CREATE INDEX idx_health_logs_status ON health.medication_logs USING btree (status, scheduled_time);
CREATE INDEX idx_health_logs_user_scheduled ON health.medication_logs USING btree (user_id, scheduled_time);
CREATE INDEX idx_medication_logs_date_range ON health.medication_logs USING btree (health.extract_date_from_timestamp(scheduled_time), user_id);

-- Column comments

COMMENT ON COLUMN health.medication_logs.status IS 'Статусы приема лекарств:
- pending: запланирован, напоминание не отправлено
- notified: напоминание отправлено, ожидает действия пользователя  
- taken: принято
- missed: пропущено
- skipped: пропущено намеренно';

-- Table Triggers

create trigger tr_medication_taken_decrease_stock after
insert
    on
    health.medication_logs for each row
    when (((new.status)::text = 'taken'::text)) execute function health.decrease_medication_stock();

-- Permissions

ALTER TABLE health.medication_logs OWNER TO postgres;
GRANT ALL ON TABLE health.medication_logs TO postgres;


-- health.medication_reminders определение

-- Drop table

-- DROP TABLE health.medication_reminders;

CREATE TABLE health.medication_reminders ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, medication_id uuid NOT NULL, schedule_id uuid NULL, reminder_time timestamptz NOT NULL, sent_at timestamptz NULL, reminder_type varchar(20) DEFAULT 'scheduled'::character varying NULL, channel varchar(20) DEFAULT 'telegram'::character varying NULL, status varchar(20) DEFAULT 'pending'::character varying NULL, retry_count int4 DEFAULT 0 NULL, error_message text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT medication_reminders_pkey PRIMARY KEY (id));
CREATE INDEX idx_medication_reminders_medication ON health.medication_reminders USING btree (medication_id, reminder_time DESC);
CREATE INDEX idx_medication_reminders_scheduled ON health.medication_reminders USING btree (reminder_time, status) WHERE ((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('failed'::character varying)::text]));
CREATE INDEX idx_medication_reminders_user_pending ON health.medication_reminders USING btree (user_id, status, reminder_time) WHERE ((status)::text = 'pending'::text);
COMMENT ON TABLE health.medication_reminders IS 'Напоминания о приеме лекарств';

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.medication_reminders for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.medication_reminders OWNER TO postgres;
GRANT ALL ON TABLE health.medication_reminders TO postgres;


-- health.medication_schedules определение

-- Drop table

-- DROP TABLE health.medication_schedules;

CREATE TABLE health.medication_schedules ( id uuid DEFAULT gen_random_uuid() NOT NULL, medication_id uuid NOT NULL, time_of_day time NOT NULL, reminder_minutes int4 DEFAULT 10 NULL, is_active bool DEFAULT true NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, days_of_week _int4 DEFAULT '{0,1,2,3,4,5,6}'::integer[] NULL, dosage_amount numeric(10, 2) DEFAULT 1.0 NULL, CONSTRAINT days_of_week_valid CHECK ((days_of_week <@ ARRAY[0, 1, 2, 3, 4, 5, 6])), CONSTRAINT medication_schedules_pkey PRIMARY KEY (id));
CREATE INDEX idx_health_schedules_active ON health.medication_schedules USING btree (is_active, time_of_day);

-- Column comments

COMMENT ON COLUMN health.medication_schedules.dosage_amount IS 'Количество единиц на один приём';

-- Permissions

ALTER TABLE health.medication_schedules OWNER TO postgres;
GRANT ALL ON TABLE health.medication_schedules TO postgres;


-- health.medications определение

-- Drop table

-- DROP TABLE health.medications;

CREATE TABLE health.medications ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, "name" varchar(200) NOT NULL, dosage varchar(100) NULL, form varchar(100) NULL, instructions text NULL, is_active bool DEFAULT true NULL, start_date date DEFAULT CURRENT_DATE NULL, end_date date NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, quantity_available int4 DEFAULT 0 NULL, quantity_threshold int4 DEFAULT 5 NULL, intake_type varchar(20) DEFAULT 'постоянно'::character varying NULL, quantity_unit varchar(20) DEFAULT 'таблетки'::character varying NULL, CONSTRAINT intake_type_check CHECK (((intake_type)::text = ANY (ARRAY[('постоянно'::character varying)::text, ('курсом'::character varying)::text]))), CONSTRAINT medications_pkey PRIMARY KEY (id));
CREATE INDEX idx_health_medications_user ON health.medications USING btree (user_id, is_active);
CREATE INDEX idx_health_medications_user_active ON health.medications USING btree (user_id, is_active);
CREATE INDEX idx_medications_low_stock ON health.medications USING btree (user_id, is_active) WHERE ((quantity_available <= quantity_threshold) AND (is_active = true));
CREATE INDEX idx_medications_name_active ON health.medications USING btree (name, is_active) WHERE (is_active = true);
CREATE INDEX idx_medications_permanent ON health.medications USING btree (user_id, intake_type) WHERE (((intake_type)::text = 'постоянно'::text) AND (is_active = true));
CREATE INDEX idx_medications_user_active_date ON health.medications USING btree (user_id, is_active, start_date DESC);

-- Column comments

COMMENT ON COLUMN health.medications.quantity_available IS 'Количество в наличии';
COMMENT ON COLUMN health.medications.quantity_threshold IS 'Порог для уведомления о покупке';
COMMENT ON COLUMN health.medications.intake_type IS 'Тип приёма: постоянно или курсом';
COMMENT ON COLUMN health.medications.quantity_unit IS 'Единица измерения: таблетки, мл, доз и т.д.';

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.medications for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.medications OWNER TO postgres;
GRANT ALL ON TABLE health.medications TO postgres;


-- health.menstrual_cycle определение

-- Drop table

-- DROP TABLE health.menstrual_cycle;

CREATE TABLE health.menstrual_cycle ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, cycle_start_date date NOT NULL, cycle_end_date date NULL, cycle_length_days int4 NULL, period_length_days int4 NULL, flow_intensity varchar(20) NULL, symptoms _text NULL, notes text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT menstrual_cycle_dates_check CHECK ((cycle_start_date <= COALESCE(cycle_end_date, cycle_start_date))), CONSTRAINT menstrual_cycle_pkey PRIMARY KEY (id));
CREATE INDEX idx_menstrual_cycle_dates ON health.menstrual_cycle USING btree (cycle_start_date, cycle_end_date) WHERE (cycle_end_date IS NOT NULL);
CREATE INDEX idx_menstrual_cycle_user_date ON health.menstrual_cycle USING btree (user_id, cycle_start_date DESC);
COMMENT ON TABLE health.menstrual_cycle IS 'Отслеживание менструального цикла';

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.menstrual_cycle for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.menstrual_cycle OWNER TO postgres;
GRANT ALL ON TABLE health.menstrual_cycle TO postgres;


-- health.notification_logs определение

-- Drop table

-- DROP TABLE health.notification_logs;

CREATE TABLE health.notification_logs ( id serial4 NOT NULL, user_id int8 NOT NULL, notification_type varchar(50) NOT NULL, channel varchar(20) NOT NULL, medication_id uuid NULL, status varchar(20) NOT NULL, sent_at timestamp DEFAULT now() NOT NULL, metadata jsonb NULL, CONSTRAINT notification_logs_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE health.notification_logs OWNER TO postgres;
GRANT ALL ON TABLE health.notification_logs TO postgres;


-- health.physical_activity определение

-- Drop table

-- DROP TABLE health.physical_activity;

CREATE TABLE health.physical_activity ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, activity_date date NOT NULL, activity_type varchar(100) NOT NULL, duration_minutes int4 NOT NULL, calories_burned int4 NULL, distance_km numeric(6, 2) NULL, intensity varchar(20) NULL, notes text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT physical_activity_duration_check CHECK (((duration_minutes > 0) AND (duration_minutes <= 1440))), CONSTRAINT physical_activity_pkey PRIMARY KEY (id));
CREATE INDEX idx_physical_activity_date_user ON health.physical_activity USING btree (activity_date, user_id);
CREATE INDEX idx_physical_activity_user_date ON health.physical_activity USING btree (user_id, activity_date DESC);
COMMENT ON TABLE health.physical_activity IS 'Записи физической активности';

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.physical_activity for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.physical_activity OWNER TO postgres;
GRANT ALL ON TABLE health.physical_activity TO postgres;


-- health.symptoms определение

-- Drop table

-- DROP TABLE health.symptoms;

CREATE TABLE health.symptoms ( id uuid DEFAULT gen_random_uuid() NOT NULL, entry_id uuid NOT NULL, category varchar(100) NOT NULL, "name" varchar(100) NOT NULL, intensity int4 NULL, notes text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT symptoms_intensity_check CHECK (((intensity >= 1) AND (intensity <= 5))), CONSTRAINT symptoms_pkey PRIMARY KEY (id));
CREATE INDEX idx_health_symptoms_entry ON health.symptoms USING btree (entry_id);
CREATE INDEX idx_symptoms_category_name ON health.symptoms USING btree (category, name);

-- Permissions

ALTER TABLE health.symptoms OWNER TO postgres;
GRANT ALL ON TABLE health.symptoms TO postgres;


-- health.user_notification_settings определение

-- Drop table

-- DROP TABLE health.user_notification_settings;

CREATE TABLE health.user_notification_settings ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, notification_type varchar(50) NOT NULL, enabled bool DEFAULT true NULL, channel varchar(20) DEFAULT 'telegram'::character varying NOT NULL, frequency varchar(20) NULL, preferred_time time NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT unique_user_notification_type UNIQUE (user_id, notification_type), CONSTRAINT user_notification_settings_pkey PRIMARY KEY (id));
CREATE INDEX idx_user_notification_settings_enabled ON health.user_notification_settings USING btree (user_id, enabled) WHERE (enabled = true);
CREATE INDEX idx_user_notification_settings_user ON health.user_notification_settings USING btree (user_id);
COMMENT ON TABLE health.user_notification_settings IS 'Настройки уведомлений пользователя о здоровье';

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.user_notification_settings for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.user_notification_settings OWNER TO postgres;
GRANT ALL ON TABLE health.user_notification_settings TO postgres;


-- health.user_profiles определение

-- Drop table

-- DROP TABLE health.user_profiles;

CREATE TABLE health.user_profiles ( user_id int4 NOT NULL, gender varchar(30) NULL, birth_date date NULL, height_cm int4 NULL, blood_type varchar(10) NULL, chronic_conditions _text NULL, allergies _text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, emergency_contact_name varchar(200) NULL, emergency_contact_phone varchar(50) NULL, primary_physician_name varchar(200) NULL, primary_physician_phone varchar(50) NULL, insurance_provider varchar(200) NULL, insurance_policy_number varchar(100) NULL, blood_pressure_systolic int4 NULL, blood_pressure_diastolic int4 NULL, resting_heart_rate int4 NULL, fitness_level varchar(50) NULL, activity_level varchar(50) NULL, dietary_restrictions _text NULL, preferred_language_old varchar(10) DEFAULT 'en'::character varying NULL, weight_kg numeric(5, 2) NULL, chest_cm numeric(5, 1) NULL, waist_cm numeric(5, 1) NULL, hips_cm numeric(5, 1) NULL, neck_cm numeric(5, 1) NULL, biceps_cm numeric(5, 1) NULL, CONSTRAINT user_profiles_biceps_cm_check CHECK (((biceps_cm > (0)::numeric) AND (biceps_cm < (100)::numeric))), CONSTRAINT user_profiles_blood_pressure_diastolic_check CHECK (((blood_pressure_diastolic >= 30) AND (blood_pressure_diastolic <= 200))), CONSTRAINT user_profiles_blood_pressure_systolic_check CHECK (((blood_pressure_systolic >= 50) AND (blood_pressure_systolic <= 300))), CONSTRAINT user_profiles_chest_cm_check CHECK (((chest_cm > (0)::numeric) AND (chest_cm < (300)::numeric))), CONSTRAINT user_profiles_gender_check CHECK (((gender)::text = ANY (ARRAY[('male'::character varying)::text, ('female'::character varying)::text, ('other'::character varying)::text, ('prefer_not_to_say'::character varying)::text]))), CONSTRAINT user_profiles_height_cm_check CHECK (((height_cm > 0) AND (height_cm < 300))), CONSTRAINT user_profiles_hips_cm_check CHECK (((hips_cm > (0)::numeric) AND (hips_cm < (300)::numeric))), CONSTRAINT user_profiles_neck_cm_check CHECK (((neck_cm > (0)::numeric) AND (neck_cm < (100)::numeric))), CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id), CONSTRAINT user_profiles_resting_heart_rate_check CHECK (((resting_heart_rate >= 30) AND (resting_heart_rate <= 200))), CONSTRAINT user_profiles_waist_cm_check CHECK (((waist_cm > (0)::numeric) AND (waist_cm < (300)::numeric))), CONSTRAINT user_profiles_weight_kg_check CHECK (((weight_kg > (0)::numeric) AND (weight_kg < (500)::numeric))));
COMMENT ON TABLE health.user_profiles IS 'Расширенный медицинский профиль пользователя';

-- Column comments

COMMENT ON COLUMN health.user_profiles.emergency_contact_name IS 'Имя контакта для экстренной связи';
COMMENT ON COLUMN health.user_profiles.emergency_contact_phone IS 'Телефон для экстренной связи';
COMMENT ON COLUMN health.user_profiles.primary_physician_name IS 'Имя лечащего врача';
COMMENT ON COLUMN health.user_profiles.primary_physician_phone IS 'Телефон лечащего врача';
COMMENT ON COLUMN health.user_profiles.insurance_provider IS 'Страховая компания';
COMMENT ON COLUMN health.user_profiles.insurance_policy_number IS 'Номер страхового полиса';
COMMENT ON COLUMN health.user_profiles.blood_pressure_systolic IS 'Систолическое давление';
COMMENT ON COLUMN health.user_profiles.blood_pressure_diastolic IS 'Диастолическое давление';
COMMENT ON COLUMN health.user_profiles.resting_heart_rate IS 'Пульс в покое';
COMMENT ON COLUMN health.user_profiles.fitness_level IS 'Уровень физической подготовки';
COMMENT ON COLUMN health.user_profiles.activity_level IS 'Уровень активности';
COMMENT ON COLUMN health.user_profiles.dietary_restrictions IS 'Ограничения в питании';
COMMENT ON COLUMN health.user_profiles.preferred_language_old IS 'Предпочитаемый язык для уведомлений
Надо удалить';
COMMENT ON COLUMN health.user_profiles.weight_kg IS 'Вес в килограммах';
COMMENT ON COLUMN health.user_profiles.chest_cm IS 'Обхват груди в сантиметрах';
COMMENT ON COLUMN health.user_profiles.waist_cm IS 'Обхват талии в сантиметрах';
COMMENT ON COLUMN health.user_profiles.hips_cm IS 'Обхват бёдер в сантиметрах';
COMMENT ON COLUMN health.user_profiles.neck_cm IS 'Обхват шеи в сантиметрах';
COMMENT ON COLUMN health.user_profiles.biceps_cm IS 'Обхват бицепса в сантиметрах';

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.user_profiles for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.user_profiles OWNER TO postgres;
GRANT ALL ON TABLE health.user_profiles TO postgres;


-- health.vision_health определение

-- Drop table

-- DROP TABLE health.vision_health;

CREATE TABLE health.vision_health ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, exam_date date NOT NULL, optometrist_name varchar(200) NULL, right_eye_sphere numeric(6, 2) NULL, right_eye_cylinder numeric(6, 2) NULL, right_eye_axis numeric(6, 2) NULL, left_eye_sphere numeric(6, 2) NULL, left_eye_cylinder numeric(6, 2) NULL, left_eye_axis numeric(6, 2) NULL, pupillary_distance numeric(5, 2) NULL, prescription_type varchar(50) NULL, next_exam_date date NULL, notes text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT vision_health_pkey PRIMARY KEY (id));
CREATE INDEX idx_vision_health_user_date ON health.vision_health USING btree (user_id, exam_date DESC);
COMMENT ON TABLE health.vision_health IS 'Здоровье зрения и записи очков/линз';

-- Table Triggers

create trigger tr_update_updated_at before
update
    on
    health.vision_health for each row execute function health.update_updated_at_column();

-- Permissions

ALTER TABLE health.vision_health OWNER TO postgres;
GRANT ALL ON TABLE health.vision_health TO postgres;


-- health.water_intake определение

-- Drop table

-- DROP TABLE health.water_intake;

CREATE TABLE health.water_intake ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, intake_date date NOT NULL, amount_ml int4 NOT NULL, time_of_day time NOT NULL, notes text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT water_intake_amount_check CHECK (((amount_ml > 0) AND (amount_ml <= 5000))), CONSTRAINT water_intake_pkey PRIMARY KEY (id));
CREATE INDEX idx_water_intake_date_user ON health.water_intake USING btree (intake_date, user_id);
CREATE INDEX idx_water_intake_user_date ON health.water_intake USING btree (user_id, intake_date);
COMMENT ON TABLE health.water_intake IS 'Отслеживание потребления воды';

-- Permissions

ALTER TABLE health.water_intake OWNER TO postgres;
GRANT ALL ON TABLE health.water_intake TO postgres;


-- health.dental_health внешние включи

ALTER TABLE health.dental_health ADD CONSTRAINT dental_health_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.entries внешние включи

ALTER TABLE health.entries ADD CONSTRAINT entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.health_goals внешние включи

ALTER TABLE health.health_goals ADD CONSTRAINT health_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.immunizations внешние включи

ALTER TABLE health.immunizations ADD CONSTRAINT immunizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.medical_measurements внешние включи

ALTER TABLE health.medical_measurements ADD CONSTRAINT medical_measurements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.medication_logs внешние включи

ALTER TABLE health.medication_logs ADD CONSTRAINT medication_logs_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES health.entries(id);
ALTER TABLE health.medication_logs ADD CONSTRAINT medication_logs_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES health.medications(id);
ALTER TABLE health.medication_logs ADD CONSTRAINT medication_logs_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES health.medication_schedules(id);
ALTER TABLE health.medication_logs ADD CONSTRAINT medication_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id);


-- health.medication_reminders внешние включи

ALTER TABLE health.medication_reminders ADD CONSTRAINT medication_reminders_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES health.medications(id) ON DELETE CASCADE;
ALTER TABLE health.medication_reminders ADD CONSTRAINT medication_reminders_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES health.medication_schedules(id) ON DELETE SET NULL;
ALTER TABLE health.medication_reminders ADD CONSTRAINT medication_reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.medication_schedules внешние включи

ALTER TABLE health.medication_schedules ADD CONSTRAINT medication_schedules_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES health.medications(id) ON DELETE CASCADE;


-- health.medications внешние включи

ALTER TABLE health.medications ADD CONSTRAINT medications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.menstrual_cycle внешние включи

ALTER TABLE health.menstrual_cycle ADD CONSTRAINT menstrual_cycle_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.notification_logs внешние включи

ALTER TABLE health.notification_logs ADD CONSTRAINT notification_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id);


-- health.physical_activity внешние включи

ALTER TABLE health.physical_activity ADD CONSTRAINT physical_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.symptoms внешние включи

ALTER TABLE health.symptoms ADD CONSTRAINT symptoms_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES health.entries(id) ON DELETE CASCADE;


-- health.user_notification_settings внешние включи

ALTER TABLE health.user_notification_settings ADD CONSTRAINT user_notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.user_profiles внешние включи

ALTER TABLE health.user_profiles ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.vision_health внешние включи

ALTER TABLE health.vision_health ADD CONSTRAINT vision_health_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.water_intake внешние включи

ALTER TABLE health.water_intake ADD CONSTRAINT water_intake_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


-- health.v_health_dashboard исходный текст

CREATE OR REPLACE VIEW health.v_health_dashboard
AS SELECT u.id AS user_id,
    u.telegram_id,
    up.gender,
    up.height_cm,
    up.blood_type,
    ( SELECT count(*) AS count
           FROM health.entries e
          WHERE e.user_id = u.id) AS total_entries,
    ( SELECT count(*) AS count
           FROM health.medications m
          WHERE m.user_id = u.id AND m.is_active = true) AS active_medications,
    ( SELECT max(e.entry_date) AS max
           FROM health.entries e
          WHERE e.user_id = u.id) AS last_entry_date,
    ( SELECT count(DISTINCT health.extract_date_from_timestamp(ml.scheduled_time)) AS count
           FROM health.medication_logs ml
          WHERE ml.user_id = u.id AND ml.status::text = 'taken'::text AND health.extract_date_from_timestamp(ml.scheduled_time) >= (CURRENT_DATE - 30)) AS medication_days_last_30,
    ( SELECT avg(e.sleep_hours) AS avg
           FROM health.entries e
          WHERE e.user_id = u.id AND e.sleep_hours IS NOT NULL AND e.entry_date >= (CURRENT_DATE - 30)) AS avg_sleep_last_30
   FROM app_users u
     LEFT JOIN health.user_profiles up ON u.id = up.user_id
  WHERE u.is_active = true;

-- Permissions

ALTER TABLE health.v_health_dashboard OWNER TO postgres;
GRANT ALL ON TABLE health.v_health_dashboard TO postgres;


-- health.v_low_stock_medications исходный текст

CREATE OR REPLACE VIEW health.v_low_stock_medications
AS SELECT id,
    user_id,
    name,
    dosage,
    form,
    quantity_available,
    quantity_threshold,
    quantity_unit,
    intake_type,
    quantity_threshold - quantity_available AS deficit,
        CASE
            WHEN quantity_available > 0 THEN floor(quantity_available::numeric / COALESCE(( SELECT sum(medication_schedules.dosage_amount) AS sum
               FROM health.medication_schedules
              WHERE medication_schedules.medication_id = m.id AND medication_schedules.is_active = true), 1::numeric))
            ELSE 0::numeric
        END AS days_remaining
   FROM health.medications m
  WHERE is_active = true AND quantity_available <= quantity_threshold AND intake_type::text = 'постоянно'::text
  ORDER BY quantity_available;

COMMENT ON VIEW health.v_low_stock_medications IS 'Лекарства с низким остатком (только постоянные)';

-- Permissions

ALTER TABLE health.v_low_stock_medications OWNER TO postgres;
GRANT ALL ON TABLE health.v_low_stock_medications TO postgres;


-- health.v_today_medications исходный текст

CREATE OR REPLACE VIEW health.v_today_medications
AS SELECT m.id AS medication_id,
    m.user_id,
    m.name AS medication_name,
    m.dosage,
    m.form,
    ms.time_of_day,
    ms.days_of_week,
    COALESCE(ml.status, 'pending'::character varying) AS status,
    ml.taken_time,
    ml.scheduled_time
   FROM health.medications m
     JOIN health.medication_schedules ms ON m.id = ms.medication_id
     LEFT JOIN health.medication_logs ml ON ms.id = ml.schedule_id AND health.extract_date_from_timestamp(ml.scheduled_time) = CURRENT_DATE
  WHERE m.is_active = true AND ms.is_active = true AND (EXTRACT(dow FROM CURRENT_DATE) = ANY (ms.days_of_week::numeric[])) AND (ml.id IS NULL OR health.extract_date_from_timestamp(ml.scheduled_time) = CURRENT_DATE);

-- Permissions

ALTER TABLE health.v_today_medications OWNER TO postgres;
GRANT ALL ON TABLE health.v_today_medications TO postgres;



-- DROP FUNCTION health.calculate_medication_adherence(int4, date, date);

CREATE OR REPLACE FUNCTION health.calculate_medication_adherence(p_user_id integer, p_start_date date, p_end_date date)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
    total_scheduled INT;
    total_taken INT;
    adherence_rate NUMERIC(5,2);
BEGIN
    -- Подсчет запланированных приемов
    SELECT COUNT(*)
    INTO total_scheduled
    FROM health.medication_logs ml
    JOIN health.medications m ON ml.medication_id = m.id
    WHERE ml.user_id = p_user_id
      AND DATE(ml.scheduled_time) BETWEEN p_start_date AND p_end_date
      AND m.is_active = true;
    
    -- Подсчет принятых лекарств
    SELECT COUNT(*)
    INTO total_taken
    FROM health.medication_logs ml
    JOIN health.medications m ON ml.medication_id = m.id
    WHERE ml.user_id = p_user_id
      AND DATE(ml.scheduled_time) BETWEEN p_start_date AND p_end_date
      AND ml.status = 'taken'
      AND m.is_active = true;
    
    IF total_scheduled > 0 THEN
        adherence_rate := (total_taken::NUMERIC / total_scheduled::NUMERIC) * 100;
    ELSE
        adherence_rate := 0;
    END IF;
    
    RETURN ROUND(adherence_rate, 2);
END;
$function$
;

-- Permissions

ALTER FUNCTION health.calculate_medication_adherence(int4, date, date) OWNER TO postgres;
GRANT ALL ON FUNCTION health.calculate_medication_adherence(int4, date, date) TO postgres;

-- DROP FUNCTION health.decrease_medication_stock();

CREATE OR REPLACE FUNCTION health.decrease_medication_stock()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_dosage_amount DECIMAL(10,2);
BEGIN
    -- Уменьшаем остаток только если лекарство принято
    IF NEW.status = 'taken' THEN
        -- Получаем количество из расписания
        SELECT COALESCE(dosage_amount, 1.0) INTO v_dosage_amount
        FROM health.medication_schedules
        WHERE id = NEW.schedule_id;
        
        -- Если расписание не найдено, используем 1.0
        v_dosage_amount := COALESCE(v_dosage_amount, 1.0);
        
        -- Уменьшаем остаток (не меньше 0)
        UPDATE health.medications
        SET quantity_available = GREATEST(0, quantity_available - v_dosage_amount)
        WHERE id = NEW.medication_id;
        
        -- Логируем уменьшение
        RAISE NOTICE 'Stock decreased for medication % by %', NEW.medication_id, v_dosage_amount;
    END IF;
    
    RETURN NEW;
END;
$function$
;

COMMENT ON FUNCTION health.decrease_medication_stock() IS 'Автоматическое уменьшение остатка при приёме лекарства';

-- Permissions

ALTER FUNCTION health.decrease_medication_stock() OWNER TO postgres;
GRANT ALL ON FUNCTION health.decrease_medication_stock() TO postgres;

-- DROP FUNCTION health.extract_date_from_timestamp(timestamp);

CREATE OR REPLACE FUNCTION health.extract_date_from_timestamp(ts timestamp without time zone)
 RETURNS date
 LANGUAGE sql
 IMMUTABLE
AS $function$
    SELECT DATE(ts);
$function$
;

-- Permissions

ALTER FUNCTION health.extract_date_from_timestamp(timestamp) OWNER TO postgres;
GRANT ALL ON FUNCTION health.extract_date_from_timestamp(timestamp) TO postgres;

-- DROP FUNCTION health.get_health_summary(int4, int4);

CREATE OR REPLACE FUNCTION health.get_health_summary(p_user_id integer, p_days integer DEFAULT 30)
 RETURNS TABLE(period_days integer, entries_count bigint, average_sleep numeric, medication_adherence numeric, water_intake_avg integer, activity_days_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH period AS (
        SELECT CURRENT_DATE - (p_days - 1) AS start_date,
               CURRENT_DATE AS end_date
    ),
    sleep_data AS (
        SELECT AVG(sleep_hours) as avg_sleep
        FROM health.entries e, period p
        WHERE e.user_id = p_user_id
          AND e.entry_date BETWEEN p.start_date AND p.end_date
          AND e.sleep_hours IS NOT NULL
    ),
    water_data AS (
        SELECT AVG(w.amount_ml) as avg_water
        FROM health.water_intake w, period p
        WHERE w.user_id = p_user_id
          AND w.intake_date BETWEEN p.start_date AND p.end_date
    ),
    activity_data AS (
        SELECT COUNT(DISTINCT pa.activity_date) as active_days
        FROM health.physical_activity pa, period p
        WHERE pa.user_id = p_user_id
          AND pa.activity_date BETWEEN p.start_date AND p.end_date
    )
    SELECT 
        p_days as period_days,
        (SELECT COUNT(*) FROM health.entries e, period p 
         WHERE e.user_id = p_user_id AND e.entry_date BETWEEN p.start_date AND p.end_date) as entries_count,
        COALESCE(sd.avg_sleep, 0) as average_sleep,
        health.calculate_medication_adherence(p_user_id, 
            (SELECT start_date FROM period), 
            (SELECT end_date FROM period)) as medication_adherence,
        COALESCE(wd.avg_water::INT, 0) as water_intake_avg,
        COALESCE(ad.active_days, 0) as activity_days_count
    FROM period
    CROSS JOIN sleep_data sd
    CROSS JOIN water_data wd
    CROSS JOIN activity_data ad;
END;
$function$
;

-- Permissions

ALTER FUNCTION health.get_health_summary(int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION health.get_health_summary(int4, int4) TO postgres;

-- DROP FUNCTION health.update_updated_at_column();

CREATE OR REPLACE FUNCTION health.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION health.update_updated_at_column() OWNER TO postgres;
GRANT ALL ON FUNCTION health.update_updated_at_column() TO postgres;


-- Permissions

GRANT ALL ON SCHEMA health TO postgres;

-- DROP SCHEMA parsing;

CREATE SCHEMA parsing AUTHORIZATION postgres;

-- DROP SEQUENCE parsing.offers_id_seq;

CREATE SEQUENCE parsing.offers_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE parsing.offers_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE parsing.offers_id_seq TO postgres;
-- parsing.offers определение

-- Drop table

-- DROP TABLE parsing.offers;

CREATE TABLE parsing.offers ( id serial4 NOT NULL, title varchar(255) NOT NULL, link varchar(255) NOT NULL, discount varchar(50) NULL, old_price varchar(50) NULL, new_price varchar(50) NULL, unit varchar(100) NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT offers_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE parsing.offers OWNER TO postgres;
GRANT ALL ON TABLE parsing.offers TO postgres;




-- Permissions

GRANT ALL ON SCHEMA parsing TO postgres;

-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION postgres;

-- DROP SEQUENCE public.app_users_id_seq;

CREATE SEQUENCE public.app_users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.app_users_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.app_users_id_seq TO postgres;

-- DROP SEQUENCE public.category_translations_id_seq;

CREATE SEQUENCE public.category_translations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.category_translations_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.category_translations_id_seq TO postgres;

-- DROP SEQUENCE public.expense_categories_id_seq;

CREATE SEQUENCE public.expense_categories_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.expense_categories_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.expense_categories_id_seq TO postgres;

-- DROP SEQUENCE public.family_invites_id_seq;

CREATE SEQUENCE public.family_invites_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.family_invites_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.family_invites_id_seq TO postgres;

-- DROP SEQUENCE public.family_members_id_seq;

CREATE SEQUENCE public.family_members_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.family_members_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.family_members_id_seq TO postgres;

-- DROP SEQUENCE public.product_names_id_seq;

CREATE SEQUENCE public.product_names_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.product_names_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.product_names_id_seq TO postgres;

-- DROP SEQUENCE public.product_synonyms_id_seq;

CREATE SEQUENCE public.product_synonyms_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.product_synonyms_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.product_synonyms_id_seq TO postgres;

-- DROP SEQUENCE public.tag_translations_id_seq;

CREATE SEQUENCE public.tag_translations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.tag_translations_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.tag_translations_id_seq TO postgres;
-- public.app_users определение

-- Drop table

-- DROP TABLE public.app_users;

CREATE TABLE public.app_users ( id serial4 NOT NULL, telegram_id int8 NOT NULL, username varchar(100) NULL, first_name varchar(100) NULL, last_name varchar(100) NULL, is_active bool DEFAULT true NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, last_login timestamp NULL, gender varchar(18) NULL, link_code varchar(6) NULL, link_code_expires_at timestamp NULL, telegram_linked_at timestamp NULL, timezone varchar(50) DEFAULT 'UTC'::character varying NULL, preferred_currency varchar(3) DEFAULT 'PYG'::character varying NOT NULL, preferred_language varchar(2) DEFAULT 'ru'::character varying NOT NULL, setup_completed bool DEFAULT false NULL, CONSTRAINT app_users_currency_check CHECK (((preferred_currency)::text = ANY (ARRAY[('PYG'::character varying)::text, ('USD'::character varying)::text, ('EUR'::character varying)::text, ('RUB'::character varying)::text, ('BRL'::character varying)::text, ('UAH'::character varying)::text]))), CONSTRAINT app_users_gender_check CHECK (((gender)::text = ANY (ARRAY[('male'::character varying)::text, ('female'::character varying)::text, ('other'::character varying)::text, ('prefer_not_to_say'::character varying)::text]))), CONSTRAINT app_users_language_check CHECK (((preferred_language)::text = ANY (ARRAY[('ru'::character varying)::text, ('en'::character varying)::text, ('es'::character varying)::text, ('uk'::character varying)::text]))), CONSTRAINT app_users_pkey PRIMARY KEY (id), CONSTRAINT app_users_telegram_id_key UNIQUE (telegram_id));
CREATE INDEX idx_app_users_setup_completed ON public.app_users USING btree (setup_completed) WHERE (setup_completed = false);
CREATE INDEX idx_users_currency ON public.app_users USING btree (preferred_currency);
CREATE INDEX idx_users_gender ON public.app_users USING btree (gender);
CREATE INDEX idx_users_language ON public.app_users USING btree (preferred_language);
CREATE INDEX idx_users_link_code ON public.app_users USING btree (link_code) WHERE (link_code IS NOT NULL);
CREATE INDEX idx_users_telegram_id ON public.app_users USING btree (telegram_id);

-- Column comments

COMMENT ON COLUMN public.app_users.gender IS 'Пол пользователя для персонализации опций здоровья';
COMMENT ON COLUMN public.app_users.link_code IS 'Гендер пользователя';
COMMENT ON COLUMN public.app_users.preferred_currency IS 'Предпочитаемая валюта пользователя (PYG, USD, EUR, RUB, BRL, UAH)';
COMMENT ON COLUMN public.app_users.preferred_language IS 'Предпочитаемый язык интерфейса (ru - русский, en - английский, es - испанский, uk - украинский)';
COMMENT ON COLUMN public.app_users.setup_completed IS 'Флаг завершения первичной настройки пользователя';

-- Permissions

ALTER TABLE public.app_users OWNER TO postgres;
GRANT ALL ON TABLE public.app_users TO postgres;


-- public.tag_translations определение

-- Drop table

-- DROP TABLE public.tag_translations;

CREATE TABLE public.tag_translations ( id serial4 NOT NULL, original_tag varchar(100) NOT NULL, "language" varchar(2) NOT NULL, translated_tag varchar(100) NOT NULL, is_verified bool DEFAULT false NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT tag_translations_language_check CHECK (((language)::text = ANY (ARRAY[('en'::character varying)::text, ('es'::character varying)::text, ('ru'::character varying)::text, ('uk'::character varying)::text]))), CONSTRAINT tag_translations_original_tag_language_key UNIQUE (original_tag, language), CONSTRAINT tag_translations_pkey PRIMARY KEY (id));
CREATE INDEX idx_tag_translations_language ON public.tag_translations USING btree (language);
CREATE INDEX idx_tag_translations_original ON public.tag_translations USING btree (original_tag);
COMMENT ON TABLE public.tag_translations IS 'Переводы системных тегов на разные языки проекта (EN, ES, RU, UK)';

-- Permissions

ALTER TABLE public.tag_translations OWNER TO postgres;
GRANT ALL ON TABLE public.tag_translations TO postgres;


-- public.activity_records определение

-- Drop table

-- DROP TABLE public.activity_records;

CREATE TABLE public.activity_records ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, record_date date NOT NULL, steps int4 NULL, workout_type varchar(100) NULL, duration_minutes int4 NULL, calories int4 NULL, distance_km numeric(8, 2) NULL, notes text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT activity_records_pkey PRIMARY KEY (id), CONSTRAINT activity_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE);
CREATE INDEX idx_activity_records_date ON public.activity_records USING btree (record_date DESC);
CREATE INDEX idx_activity_records_user ON public.activity_records USING btree (user_id);
COMMENT ON TABLE public.activity_records IS 'Личные записи о физической активности';

-- Permissions

ALTER TABLE public.activity_records OWNER TO postgres;
GRANT ALL ON TABLE public.activity_records TO postgres;


-- public.families определение

-- Drop table

-- DROP TABLE public.families;

CREATE TABLE public.families ( id uuid DEFAULT gen_random_uuid() NOT NULL, "name" varchar(255) DEFAULT 'Моя семья'::character varying NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, created_by_user_id int4 NULL, is_active bool DEFAULT true NULL, CONSTRAINT families_pkey PRIMARY KEY (id), CONSTRAINT valid_name CHECK ((length(TRIM(BOTH FROM name)) > 0)), CONSTRAINT families_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.app_users(id) ON DELETE SET NULL);
COMMENT ON TABLE public.families IS 'Семьи для совместного ведения бюджета';

-- Column comments

COMMENT ON COLUMN public.families.is_active IS 'false = семья покинута всеми участниками';

-- Permissions

ALTER TABLE public.families OWNER TO postgres;
GRANT ALL ON TABLE public.families TO postgres;


-- public.family_invites определение

-- Drop table

-- DROP TABLE public.family_invites;

CREATE TABLE public.family_invites ( id serial4 NOT NULL, family_id uuid NOT NULL, invited_by_user_id int4 NOT NULL, invited_telegram_id int8 NOT NULL, invite_token uuid DEFAULT gen_random_uuid() NULL, status varchar(20) DEFAULT 'pending'::character varying NULL, message text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, expires_at timestamp DEFAULT (CURRENT_TIMESTAMP + '7 days'::interval) NULL, responded_at timestamp NULL, CONSTRAINT family_invites_invite_token_key UNIQUE (invite_token), CONSTRAINT family_invites_pkey PRIMARY KEY (id), CONSTRAINT valid_invite_status CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('accepted'::character varying)::text, ('declined'::character varying)::text, ('expired'::character varying)::text]))), CONSTRAINT family_invites_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE, CONSTRAINT family_invites_invited_by_user_id_fkey FOREIGN KEY (invited_by_user_id) REFERENCES public.app_users(id) ON DELETE CASCADE);
CREATE INDEX idx_family_invites_status ON public.family_invites USING btree (status) WHERE ((status)::text = 'pending'::text);
CREATE INDEX idx_family_invites_telegram ON public.family_invites USING btree (invited_telegram_id);
CREATE INDEX idx_family_invites_token ON public.family_invites USING btree (invite_token);
COMMENT ON TABLE public.family_invites IS 'Приглашения в семью';

-- Column comments

COMMENT ON COLUMN public.family_invites.invite_token IS 'Уникальный токен для принятия приглашения';

-- Permissions

ALTER TABLE public.family_invites OWNER TO postgres;
GRANT ALL ON TABLE public.family_invites TO postgres;


-- public.family_members определение

-- Drop table

-- DROP TABLE public.family_members;

CREATE TABLE public.family_members ( id serial4 NOT NULL, family_id uuid NOT NULL, user_id int4 NOT NULL, joined_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, is_creator bool DEFAULT false NULL, CONSTRAINT family_members_pkey PRIMARY KEY (id), CONSTRAINT unique_user_family UNIQUE (user_id), CONSTRAINT family_members_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE, CONSTRAINT family_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE);
CREATE INDEX idx_family_members_family ON public.family_members USING btree (family_id);
CREATE INDEX idx_family_members_user ON public.family_members USING btree (user_id);
COMMENT ON TABLE public.family_members IS 'Участники семей (один пользователь = одна семья)';

-- Constraint comments

COMMENT ON CONSTRAINT unique_user_family ON public.family_members IS 'Пользователь может быть только в одной семье';

-- Table Triggers

create trigger trigger_check_family_activity after
delete
    on
    public.family_members for each row execute function check_family_activity();

-- Permissions

ALTER TABLE public.family_members OWNER TO postgres;
GRANT ALL ON TABLE public.family_members TO postgres;


-- public.health_records определение

-- Drop table

-- DROP TABLE public.health_records;

CREATE TABLE public.health_records ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, record_date date NOT NULL, mood varchar(50) NULL, energy_level int4 NULL, symptoms text NULL, notes text NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT health_records_energy_level_check CHECK (((energy_level >= 1) AND (energy_level <= 5))), CONSTRAINT health_records_pkey PRIMARY KEY (id), CONSTRAINT health_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE);
CREATE INDEX idx_health_records_date ON public.health_records USING btree (record_date DESC);
CREATE INDEX idx_health_records_user ON public.health_records USING btree (user_id);
COMMENT ON TABLE public.health_records IS 'Личные записи о здоровье пользователя';

-- Permissions

ALTER TABLE public.health_records OWNER TO postgres;
GRANT ALL ON TABLE public.health_records TO postgres;


-- public.stores определение

-- Drop table

-- DROP TABLE public.stores;

CREATE TABLE public.stores ( id uuid DEFAULT gen_random_uuid() NOT NULL, ruc varchar(20) NULL, "name" varchar(255) NOT NULL, address text NULL, phone varchar(50) NULL, email varchar(100) NULL, store_type varchar(100) NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, family_id uuid NULL, created_by_user_id int4 NULL, CONSTRAINT stores_pkey PRIMARY KEY (id), CONSTRAINT stores_ruc_key UNIQUE (ruc), CONSTRAINT stores_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.app_users(id), CONSTRAINT stores_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id));
CREATE INDEX idx_stores_family ON public.stores USING btree (family_id);

-- Permissions

ALTER TABLE public.stores OWNER TO postgres;
GRANT ALL ON TABLE public.stores TO postgres;


-- public.user_photo_reviews определение

-- Drop table

-- DROP TABLE public.user_photo_reviews;

CREATE TABLE public.user_photo_reviews ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id int4 NOT NULL, telegram_file_id varchar(255) NOT NULL, telegram_file_unique_id varchar(255) NOT NULL, rating varchar(10) NOT NULL, "comment" text NULL, tags _text DEFAULT '{}'::text[] NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, "language" varchar(2) DEFAULT 'ru'::character varying NOT NULL, CONSTRAINT pk_user_photo_reviews PRIMARY KEY (id), CONSTRAINT unique_user_telegram_file UNIQUE (user_id, telegram_file_unique_id), CONSTRAINT user_photo_reviews_language_check CHECK (((language)::text = ANY (ARRAY[('en'::character varying)::text, ('es'::character varying)::text, ('ru'::character varying)::text, ('uk'::character varying)::text]))), CONSTRAINT user_photo_reviews_rating_check CHECK (((rating)::text = ANY (ARRAY[('good'::character varying)::text, ('bad'::character varying)::text]))), CONSTRAINT fk_user_photo_reviews_user FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE);
CREATE INDEX idx_user_photo_reviews_comment_en ON public.user_photo_reviews USING gin (to_tsvector('english'::regconfig, comment)) WHERE ((comment IS NOT NULL) AND ((language)::text = 'en'::text));
CREATE INDEX idx_user_photo_reviews_comment_es ON public.user_photo_reviews USING gin (to_tsvector('spanish'::regconfig, comment)) WHERE ((comment IS NOT NULL) AND ((language)::text = 'es'::text));
CREATE INDEX idx_user_photo_reviews_comment_ru ON public.user_photo_reviews USING gin (to_tsvector('russian'::regconfig, comment)) WHERE ((comment IS NOT NULL) AND ((language)::text = 'ru'::text));
CREATE INDEX idx_user_photo_reviews_comment_uk ON public.user_photo_reviews USING gin (to_tsvector('simple'::regconfig, comment)) WHERE ((comment IS NOT NULL) AND ((language)::text = 'uk'::text));
CREATE INDEX idx_user_photo_reviews_language ON public.user_photo_reviews USING btree (language);
CREATE INDEX idx_user_photo_reviews_tags ON public.user_photo_reviews USING gin (tags);
CREATE INDEX idx_user_photo_reviews_user_created ON public.user_photo_reviews USING btree (user_id, created_at DESC);
CREATE INDEX idx_user_photo_reviews_user_language_date ON public.user_photo_reviews USING btree (user_id, language, created_at DESC);
CREATE INDEX idx_user_photo_reviews_user_rating ON public.user_photo_reviews USING btree (user_id, rating);
COMMENT ON TABLE public.user_photo_reviews IS 'Личные фото-отзывы пользователей о товарах. 
Каждый отзыв ОБЯЗАТЕЛЬНО содержит фото из Telegram Cloud.
Отзывы приватные, видны только владельцу.';

-- Column comments

COMMENT ON COLUMN public.user_photo_reviews.user_id IS 'ID пользователя из таблицы app_users. Владелец отзыва.';
COMMENT ON COLUMN public.user_photo_reviews.telegram_file_id IS 'file_id фото в Telegram Cloud. Используется для получения фото через Bot API.';
COMMENT ON COLUMN public.user_photo_reviews.telegram_file_unique_id IS 'Уникальный file_id для предотвращения дублирования одного фото у пользователя.';
COMMENT ON COLUMN public.user_photo_reviews.rating IS 'Оценка пользователя: "good" (👍) или "bad" (👎).';
COMMENT ON COLUMN public.user_photo_reviews."comment" IS 'Текстовый комментарий пользователя (опционально, максимум 500 символов).';
COMMENT ON COLUMN public.user_photo_reviews.tags IS 'Массив тегов для категоризации и поиска (например: {"сыр", "молочные"}).';
COMMENT ON COLUMN public.user_photo_reviews.created_at IS 'Дата и время создания отзыва (устанавливается автоматически).';
COMMENT ON COLUMN public.user_photo_reviews.updated_at IS 'Дата и время последнего обновления (обновляется триггером при изменениях).';
COMMENT ON COLUMN public.user_photo_reviews."language" IS 'Язык отзыва: en (английский), es (испанский), ru (русский), uk (украинский)';

-- Table Triggers

create trigger trigger_user_photo_reviews_updated_at before
update
    on
    public.user_photo_reviews for each row execute function update_user_photo_reviews_updated_at();

-- Permissions

ALTER TABLE public.user_photo_reviews OWNER TO postgres;
GRANT ALL ON TABLE public.user_photo_reviews TO postgres;


-- public.expense_categories определение

-- Drop table

-- DROP TABLE public.expense_categories;

CREATE TABLE public.expense_categories ( id serial4 NOT NULL, "name" varchar(100) NOT NULL, parent_id int4 NULL, description text NULL, budget_limit numeric(10, 2) NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, family_id uuid NULL, created_by_user_id int4 NULL, is_system bool DEFAULT false NULL, CONSTRAINT expense_categories_name_key UNIQUE (name), CONSTRAINT expense_categories_pkey PRIMARY KEY (id), CONSTRAINT expense_categories_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.app_users(id), CONSTRAINT expense_categories_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id), CONSTRAINT expense_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.expense_categories(id));
CREATE INDEX idx_categories_family ON public.expense_categories USING btree (family_id);
CREATE INDEX idx_categories_system ON public.expense_categories USING btree (is_system) WHERE (is_system = true);

-- Column comments

COMMENT ON COLUMN public.expense_categories.family_id IS 'NULL = глобальные шаблонные категории';
COMMENT ON COLUMN public.expense_categories.is_system IS 'TRUE = системная неизменяемая категория, FALSE = пользовательская';

-- Permissions

ALTER TABLE public.expense_categories OWNER TO postgres;
GRANT ALL ON TABLE public.expense_categories TO postgres;


-- public.products определение

-- Drop table

-- DROP TABLE public.products;

CREATE TABLE public.products ( id uuid DEFAULT gen_random_uuid() NOT NULL, category_id int4 NULL, barcode varchar(50) NOT NULL, brand varchar(100) NULL, unit varchar(20) NULL, description text NULL, is_active bool DEFAULT true NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, internal_code varchar(50) NULL, family_id uuid NULL, created_by_user_id int4 NULL, CONSTRAINT products_barcode_unique UNIQUE (barcode), CONSTRAINT products_pkey PRIMARY KEY (id), CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id), CONSTRAINT products_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.app_users(id), CONSTRAINT products_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id));
CREATE INDEX idx_products_category ON public.products USING btree (category_id);
CREATE INDEX idx_products_family ON public.products USING btree (family_id);
CREATE INDEX idx_products_internal_code ON public.products USING btree (internal_code) WHERE (internal_code IS NOT NULL);

-- Column comments

COMMENT ON COLUMN public.products.barcode IS 'Международный штрих-код (EAN-13, UPC-A, EAN-8 и др.)';

-- Permissions

ALTER TABLE public.products OWNER TO postgres;
GRANT ALL ON TABLE public.products TO postgres;


-- public.purchases определение

-- Drop table

-- DROP TABLE public.purchases;

CREATE TABLE public.purchases ( id uuid DEFAULT gen_random_uuid() NOT NULL, invoice_number varchar(50) NOT NULL, purchase_date timestamptz NOT NULL, store_id uuid NULL, total_amount numeric(10, 2) NOT NULL, total_tax numeric(10, 2) NULL, total_discount numeric(10, 2) NULL, payment_method varchar(50) NULL, notes text NULL, qr_code text NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, family_id uuid NULL, created_by_user_id int4 NULL, CONSTRAINT purchases_invoice_number_key UNIQUE (invoice_number), CONSTRAINT purchases_pkey PRIMARY KEY (id), CONSTRAINT purchases_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.app_users(id), CONSTRAINT purchases_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id), CONSTRAINT purchases_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id));
CREATE INDEX idx_purchases_date ON public.purchases USING btree (purchase_date);
CREATE INDEX idx_purchases_family ON public.purchases USING btree (family_id);
CREATE INDEX idx_purchases_store ON public.purchases USING btree (store_id);

-- Permissions

ALTER TABLE public.purchases OWNER TO postgres;
GRANT ALL ON TABLE public.purchases TO postgres;


-- public.category_translations определение

-- Drop table

-- DROP TABLE public.category_translations;

CREATE TABLE public.category_translations ( id serial4 NOT NULL, category_id int4 NOT NULL, language_code varchar(2) NOT NULL, "name" varchar(100) NOT NULL, description text NULL, is_verified bool DEFAULT false NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT category_translations_language_code_check CHECK (((language_code)::text = ANY (ARRAY[('ru'::character varying)::text, ('en'::character varying)::text, ('es'::character varying)::text]))), CONSTRAINT category_translations_pkey PRIMARY KEY (id), CONSTRAINT unique_category_language UNIQUE (category_id, language_code), CONSTRAINT category_translations_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id) ON DELETE CASCADE);
CREATE INDEX idx_category_translations_category ON public.category_translations USING btree (category_id);
CREATE INDEX idx_category_translations_language ON public.category_translations USING btree (language_code);
CREATE INDEX idx_category_translations_verified ON public.category_translations USING btree (is_verified) WHERE (is_verified = true);
COMMENT ON TABLE public.category_translations IS 'Переводы названий категорий на разные языки';

-- Column comments

COMMENT ON COLUMN public.category_translations.is_verified IS 'TRUE = проверенный перевод (системные категории), FALSE = пользовательский';

-- Permissions

ALTER TABLE public.category_translations OWNER TO postgres;
GRANT ALL ON TABLE public.category_translations TO postgres;


-- public.product_names определение

-- Drop table

-- DROP TABLE public.product_names;

CREATE TABLE public.product_names ( id serial4 NOT NULL, product_id uuid NULL, language_code varchar(5) DEFAULT 'es'::character varying NOT NULL, country_code varchar(2) DEFAULT 'PY'::character varying NULL, "name" varchar(255) NOT NULL, normalized_name varchar(255) NULL, short_name varchar(100) NULL, is_official bool DEFAULT true NULL, usage_count int4 DEFAULT 0 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT product_names_pkey PRIMARY KEY (id), CONSTRAINT product_names_product_id_language_code_country_code_name_key UNIQUE (product_id, language_code, country_code, name), CONSTRAINT product_names_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE);
CREATE INDEX idx_product_names_normalized ON public.product_names USING btree (normalized_name, language_code);
CREATE INDEX idx_product_names_product ON public.product_names USING btree (product_id);
CREATE INDEX idx_product_names_search ON public.product_names USING gin (to_tsvector('spanish'::regconfig, (name)::text));

-- Permissions

ALTER TABLE public.product_names OWNER TO postgres;
GRANT ALL ON TABLE public.product_names TO postgres;


-- public.product_synonyms определение

-- Drop table

-- DROP TABLE public.product_synonyms;

CREATE TABLE public.product_synonyms ( id serial4 NOT NULL, product_id uuid NULL, synonym varchar(255) NOT NULL, confidence numeric(3, 2) DEFAULT 1.0 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, family_id uuid NULL, created_by_user_id int4 NULL, CONSTRAINT product_synonyms_pkey PRIMARY KEY (id), CONSTRAINT product_synonyms_synonym_product_id_key UNIQUE (synonym, product_id), CONSTRAINT product_synonyms_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.app_users(id), CONSTRAINT product_synonyms_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id), CONSTRAINT product_synonyms_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE);
CREATE INDEX idx_product_synonyms_family ON public.product_synonyms USING btree (family_id);
CREATE INDEX idx_product_synonyms_user ON public.product_synonyms USING btree (created_by_user_id);
CREATE INDEX idx_synonyms_search ON public.product_synonyms USING gin (to_tsvector('spanish'::regconfig, (synonym)::text));

-- Permissions

ALTER TABLE public.product_synonyms OWNER TO postgres;
GRANT ALL ON TABLE public.product_synonyms TO postgres;


-- public.purchase_items определение

-- Drop table

-- DROP TABLE public.purchase_items;

CREATE TABLE public.purchase_items ( id uuid DEFAULT gen_random_uuid() NOT NULL, purchase_id uuid NULL, product_id uuid NULL, original_product_code varchar(50) NULL, original_product_name text NOT NULL, quantity numeric(8, 3) NOT NULL, unit varchar(20) NULL, unit_price numeric(10, 2) NOT NULL, total_price numeric(10, 2) NOT NULL, discount numeric(8, 2) DEFAULT 0 NULL, tax_rate int4 DEFAULT 0 NULL, tax_amount numeric(8, 2) DEFAULT 0 NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, family_id uuid NULL, created_by_user_id int4 NULL, CONSTRAINT purchase_items_pkey PRIMARY KEY (id), CONSTRAINT purchase_items_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.app_users(id), CONSTRAINT purchase_items_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id), CONSTRAINT purchase_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id), CONSTRAINT purchase_items_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON DELETE CASCADE);
CREATE INDEX idx_items_original_name ON public.purchase_items USING gin (to_tsvector('spanish'::regconfig, original_product_name));
CREATE INDEX idx_items_product ON public.purchase_items USING btree (product_id);
CREATE INDEX idx_items_purchase ON public.purchase_items USING btree (purchase_id);
CREATE INDEX idx_purchase_items_family ON public.purchase_items USING btree (family_id);
CREATE INDEX idx_purchase_items_user ON public.purchase_items USING btree (created_by_user_id);

-- Permissions

ALTER TABLE public.purchase_items OWNER TO postgres;
GRANT ALL ON TABLE public.purchase_items TO postgres;


-- public.price_history определение

-- Drop table

-- DROP TABLE public.price_history;

CREATE TABLE public.price_history ( id uuid DEFAULT gen_random_uuid() NOT NULL, product_id uuid NULL, store_id uuid NULL, price numeric(10, 2) NOT NULL, unit varchar(20) NULL, purchase_date date NOT NULL, purchase_item_id uuid NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, family_id uuid NULL, created_by_user_id int4 NULL, currency varchar(3) DEFAULT 'PYG'::character varying NULL, CONSTRAINT price_history_pkey PRIMARY KEY (id), CONSTRAINT price_history_unique_per_user_idx UNIQUE (product_id, store_id, purchase_date, unit, created_by_user_id), CONSTRAINT price_history_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.app_users(id), CONSTRAINT price_history_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id), CONSTRAINT price_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE, CONSTRAINT price_history_purchase_item_id_fkey FOREIGN KEY (purchase_item_id) REFERENCES public.purchase_items(id), CONSTRAINT price_history_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id));
CREATE INDEX idx_price_history_family ON public.price_history USING btree (family_id);
CREATE INDEX idx_price_history_product_date ON public.price_history USING btree (product_id, purchase_date);
CREATE INDEX idx_price_history_store_date ON public.price_history USING btree (store_id, purchase_date);
CREATE INDEX idx_price_history_user ON public.price_history USING btree (created_by_user_id);

-- Permissions

ALTER TABLE public.price_history OWNER TO postgres;
GRANT ALL ON TABLE public.price_history TO postgres;


-- public.active_invites исходный текст

CREATE OR REPLACE VIEW public.active_invites
AS SELECT fi.id,
    fi.invite_token,
    fi.family_id,
    f.name AS family_name,
    fi.invited_by_user_id,
    au.username AS invited_by_username,
    au.first_name AS invited_by_first_name,
    fi.invited_telegram_id,
    fi.message,
    fi.status,
    fi.created_at,
    fi.expires_at,
    fi.responded_at,
    EXTRACT(epoch FROM fi.expires_at::timestamp with time zone - CURRENT_TIMESTAMP) / 3600::numeric AS hours_remaining
   FROM family_invites fi
     JOIN families f ON fi.family_id = f.id
     JOIN app_users au ON fi.invited_by_user_id = au.id
  WHERE fi.status::text = 'pending'::text AND fi.expires_at > CURRENT_TIMESTAMP;

-- Permissions

ALTER TABLE public.active_invites OWNER TO postgres;
GRANT ALL ON TABLE public.active_invites TO postgres;


-- public.user_family_info исходный текст

CREATE OR REPLACE VIEW public.user_family_info
AS SELECT u.id AS user_id,
    u.telegram_id,
    u.username,
    u.first_name,
    u.last_name,
    fm.family_id,
    f.name AS family_name,
    f.is_active AS family_is_active,
    fm.joined_at AS family_joined_at,
    f.created_by_user_id = u.id AS is_family_creator,
    ( SELECT count(*) AS count
           FROM family_members fm2
          WHERE fm2.family_id = fm.family_id) AS family_members_count
   FROM app_users u
     LEFT JOIN family_members fm ON u.id = fm.user_id
     LEFT JOIN families f ON fm.family_id = f.id;

COMMENT ON VIEW public.user_family_info IS 'Удобный view для получения информации о пользователе и его семье';

-- Permissions

ALTER TABLE public.user_family_info OWNER TO postgres;
GRANT ALL ON TABLE public.user_family_info TO postgres;


-- public.v_user_photo_reviews исходный текст

CREATE OR REPLACE VIEW public.v_user_photo_reviews
AS SELECT upr.id AS review_id,
    upr.telegram_file_id,
    upr.telegram_file_unique_id,
    upr.rating,
    upr.comment,
    upr.tags,
    upr.created_at,
    upr.updated_at,
    upr.language,
    au.id AS user_id,
    au.telegram_id,
    au.first_name,
    au.username,
    au.preferred_language AS user_preferred_language,
        CASE
            WHEN upr.rating::text = 'good'::text THEN
            CASE upr.language
                WHEN 'en'::text THEN '👍 Good'::text
                WHEN 'es'::text THEN '👍 Bueno'::text
                WHEN 'ru'::text THEN '👍 Хорошо'::text
                WHEN 'uk'::text THEN '👍 Добре'::text
                ELSE NULL::text
            END
            WHEN upr.rating::text = 'bad'::text THEN
            CASE upr.language
                WHEN 'en'::text THEN '👎 Bad'::text
                WHEN 'es'::text THEN '👎 Malo'::text
                WHEN 'ru'::text THEN '👎 Плохо'::text
                WHEN 'uk'::text THEN '👎 Погано'::text
                ELSE NULL::text
            END
            ELSE NULL::text
        END AS rating_display,
        CASE upr.language
            WHEN 'en'::text THEN to_char(upr.created_at, 'MM/DD/YYYY HH24:MI'::text)
            WHEN 'es'::text THEN to_char(upr.created_at, 'DD/MM/YYYY HH24:MI'::text)
            WHEN 'ru'::text THEN to_char(upr.created_at, 'DD.MM.YYYY HH24:MI'::text)
            WHEN 'uk'::text THEN to_char(upr.created_at, 'DD.MM.YYYY HH24:MI'::text)
            ELSE NULL::text
        END AS formatted_date,
    array_length(upr.tags, 1) AS tags_count,
        CASE upr.language
            WHEN 'en'::text THEN 'English'::text
            WHEN 'es'::text THEN 'Español'::text
            WHEN 'ru'::text THEN 'Русский'::text
            WHEN 'uk'::text THEN 'Українська'::text
            ELSE NULL::text
        END AS language_display
   FROM user_photo_reviews upr
     JOIN app_users au ON upr.user_id = au.id
  WHERE au.is_active = true;

-- Permissions

ALTER TABLE public.v_user_photo_reviews OWNER TO postgres;
GRANT ALL ON TABLE public.v_user_photo_reviews TO postgres;



-- DROP FUNCTION public.add_user_photo_review(int4, varchar, varchar, varchar, text, _text);

CREATE OR REPLACE FUNCTION public.add_user_photo_review(p_user_id integer, p_telegram_file_id character varying, p_telegram_file_unique_id character varying, p_rating character varying, p_comment text DEFAULT NULL::text, p_tags text[] DEFAULT NULL::text[])
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_review_id UUID;
BEGIN
    -- Проверяем, нет ли уже такого фото у пользователя
    IF EXISTS (
        SELECT 1 
        FROM user_photo_reviews 
        WHERE user_id = p_user_id 
          AND telegram_file_unique_id = p_telegram_file_unique_id
    ) THEN
        RAISE EXCEPTION 'Photo already exists for this user';
    END IF;
    
    -- Проверяем валидность оценки
    IF p_rating NOT IN ('good', 'bad') THEN
        RAISE EXCEPTION 'Invalid rating value: %', p_rating;
    END IF;
    
    -- Вставляем новый отзыв
    INSERT INTO user_photo_reviews (
        user_id,
        telegram_file_id,
        telegram_file_unique_id,
        rating,
        comment,
        tags,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_telegram_file_id,
        p_telegram_file_unique_id,
        p_rating,
        p_comment,
        COALESCE(p_tags, '{}'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_review_id;
    
    RETURN v_review_id;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.add_user_photo_review(int4, varchar, varchar, varchar, text, _text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.add_user_photo_review(int4, varchar, varchar, varchar, text, _text) TO postgres;

-- DROP FUNCTION public.add_user_photo_review(int4, varchar, varchar, varchar, varchar, text, _text);

CREATE OR REPLACE FUNCTION public.add_user_photo_review(p_user_id integer, p_telegram_file_id character varying, p_telegram_file_unique_id character varying, p_rating character varying, p_language character varying DEFAULT 'ru'::character varying, p_comment text DEFAULT NULL::text, p_tags text[] DEFAULT NULL::text[])
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_review_id UUID;
    v_user_language VARCHAR(2);
BEGIN
    -- Проверяем, нет ли уже такого фото у пользователя
    IF EXISTS (
        SELECT 1 
        FROM user_photo_reviews 
        WHERE user_id = p_user_id 
          AND telegram_file_unique_id = p_telegram_file_unique_id
    ) THEN
        RAISE EXCEPTION 'Photo already exists for this user';
    END IF;
    
    -- Проверяем валидность оценки
    IF p_rating NOT IN ('good', 'bad') THEN
        RAISE EXCEPTION 'Invalid rating value: %', p_rating;
    END IF;
    
    -- Проверяем валидность языка
    IF p_language NOT IN ('en', 'es', 'ru', 'uk') THEN
        -- Получаем язык пользователя из app_users как fallback
        SELECT preferred_language INTO v_user_language
        FROM app_users WHERE id = p_user_id;
        
        IF v_user_language NOT IN ('en', 'es', 'ru', 'uk') THEN
            v_user_language := 'ru'; -- fallback на русский
        END IF;
    ELSE
        v_user_language := p_language;
    END IF;
    
    -- Вставляем новый отзыв
    INSERT INTO user_photo_reviews (
        user_id,
        telegram_file_id,
        telegram_file_unique_id,
        rating,
        language,
        comment,
        tags,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_telegram_file_id,
        p_telegram_file_unique_id,
        p_rating,
        v_user_language,
        p_comment,
        COALESCE(p_tags, '{}'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_review_id;
    
    RETURN v_review_id;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.add_user_photo_review(int4, varchar, varchar, varchar, varchar, text, _text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.add_user_photo_review(int4, varchar, varchar, varchar, varchar, text, _text) TO postgres;

-- DROP FUNCTION public.check_family_access(int4, uuid);

CREATE OR REPLACE FUNCTION public.check_family_access(p_user_id integer, p_resource_family_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    v_user_family_id UUID;
BEGIN
    -- Получаем семью пользователя
    v_user_family_id := get_user_family_id(p_user_id);
    
    -- Solo пользователь: доступ только к своим данным (family_id = NULL)
    IF v_user_family_id IS NULL THEN
        RETURN p_resource_family_id IS NULL;
    END IF;
    
    -- Пользователь в семье: доступ к данным своей семьи
    RETURN p_resource_family_id = v_user_family_id;
END;
$function$
;

COMMENT ON FUNCTION public.check_family_access(int4, uuid) IS 'Проверка доступа к семейному ресурсу';

-- Permissions

ALTER FUNCTION public.check_family_access(int4, uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.check_family_access(int4, uuid) TO postgres;

-- DROP FUNCTION public.check_family_activity();

CREATE OR REPLACE FUNCTION public.check_family_activity()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Если удален последний участник, помечаем семью как неактивную
    IF (SELECT COUNT(*) FROM family_members WHERE family_id = OLD.family_id) = 0 THEN
        UPDATE families SET is_active = false WHERE id = OLD.family_id;
    END IF;
    RETURN OLD;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.check_family_activity() OWNER TO postgres;
GRANT ALL ON FUNCTION public.check_family_activity() TO postgres;

-- DROP FUNCTION public.expire_old_invites();

CREATE OR REPLACE FUNCTION public.expire_old_invites()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE family_invites 
    SET status = 'expired' 
    WHERE status = 'pending' 
    AND expires_at < CURRENT_TIMESTAMP;
END;
$function$
;

COMMENT ON FUNCTION public.expire_old_invites() IS 'Автоматически помечает просроченные приглашения';

-- Permissions

ALTER FUNCTION public.expire_old_invites() OWNER TO postgres;
GRANT ALL ON FUNCTION public.expire_old_invites() TO postgres;

-- DROP FUNCTION public.get_user_family_id(int4);

CREATE OR REPLACE FUNCTION public.get_user_family_id(p_user_id integer)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    v_family_id UUID;
BEGIN
    SELECT family_id INTO v_family_id
    FROM family_members
    WHERE user_id = p_user_id;
    
    RETURN v_family_id;
END;
$function$
;

COMMENT ON FUNCTION public.get_user_family_id(int4) IS 'Получить family_id пользователя (NULL если solo)';

-- Permissions

ALTER FUNCTION public.get_user_family_id(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_user_family_id(int4) TO postgres;

-- DROP FUNCTION public.get_user_reviews_by_language(int4, varchar, int4, int4);

CREATE OR REPLACE FUNCTION public.get_user_reviews_by_language(p_user_id integer, p_language character varying DEFAULT NULL::character varying, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS TABLE(review_id uuid, telegram_file_id character varying, rating character varying, comment text, tags text[], created_at timestamp with time zone, language character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        upr.id as review_id,
        upr.telegram_file_id,
        upr.rating,
        upr.comment,
        upr.tags,
        upr.created_at,
        upr.language
    FROM user_photo_reviews upr
    WHERE upr.user_id = p_user_id
      AND (p_language IS NULL OR upr.language = p_language)
    ORDER BY upr.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.get_user_reviews_by_language(int4, varchar, int4, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_user_reviews_by_language(int4, varchar, int4, int4) TO postgres;

-- DROP FUNCTION public.get_user_reviews_stats(int4);

CREATE OR REPLACE FUNCTION public.get_user_reviews_stats(p_user_id integer)
 RETURNS TABLE(total_reviews bigint, good_reviews bigint, bad_reviews bigint, last_review_date timestamp with time zone, most_used_tags text[])
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reviews,
        COUNT(*) FILTER (WHERE rating = 'good') as good_reviews,
        COUNT(*) FILTER (WHERE rating = 'bad') as bad_reviews,
        MAX(created_at) as last_review_date,
        -- Исправленный запрос для most_used_tags
        COALESCE(
            ARRAY(
                SELECT unnest_tags
                FROM (
                    SELECT unnest_tags, COUNT(*) as tag_count
                    FROM user_photo_reviews, unnest(tags) as unnest_tags
                    WHERE user_id = p_user_id
                    GROUP BY unnest_tags
                    ORDER BY tag_count DESC
                    LIMIT 5
                ) as tag_stats
            ),
            ARRAY[]::text[]
        ) as most_used_tags
    FROM user_photo_reviews
    WHERE user_id = p_user_id;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.get_user_reviews_stats(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_user_reviews_stats(int4) TO postgres;

-- DROP FUNCTION public.search_reviews_by_tag(int4, text);

CREATE OR REPLACE FUNCTION public.search_reviews_by_tag(p_user_id integer, p_tag text)
 RETURNS SETOF user_photo_reviews
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT *
    FROM user_photo_reviews
    WHERE user_id = p_user_id
      AND p_tag = ANY(tags)
    ORDER BY created_at DESC;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.search_reviews_by_tag(int4, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.search_reviews_by_tag(int4, text) TO postgres;

-- DROP FUNCTION public.search_reviews_multilingual(int4, text, varchar);

CREATE OR REPLACE FUNCTION public.search_reviews_multilingual(p_user_id integer, p_search_query text, p_language character varying DEFAULT NULL::character varying)
 RETURNS TABLE(review_id uuid, telegram_file_id character varying, rating character varying, comment text, tags text[], created_at timestamp with time zone, language character varying, relevance real)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        upr.id as review_id,
        upr.telegram_file_id,
        upr.rating,
        upr.comment,
        upr.tags,
        upr.created_at,
        upr.language,
        -- Релевантность поиска в зависимости от языка
        CASE upr.language
            WHEN 'en' THEN ts_rank(to_tsvector('english', upr.comment), plainto_tsquery('english', p_search_query))
            WHEN 'es' THEN ts_rank(to_tsvector('spanish', upr.comment), plainto_tsquery('spanish', p_search_query))
            WHEN 'ru' THEN ts_rank(to_tsvector('russian', upr.comment), plainto_tsquery('russian', p_search_query))
            WHEN 'uk' THEN ts_rank(to_tsvector('simple', upr.comment), plainto_tsquery('simple', p_search_query))
        END as relevance
    FROM user_photo_reviews upr
    WHERE upr.user_id = p_user_id
      AND (p_language IS NULL OR upr.language = p_language)
      AND (
          -- Поиск в зависимости от языка
          (upr.language = 'en' AND to_tsvector('english', upr.comment) @@ plainto_tsquery('english', p_search_query))
          OR (upr.language = 'es' AND to_tsvector('spanish', upr.comment) @@ plainto_tsquery('spanish', p_search_query))
          OR (upr.language = 'ru' AND to_tsvector('russian', upr.comment) @@ plainto_tsquery('russian', p_search_query))
          OR (upr.language = 'uk' AND to_tsvector('simple', upr.comment) @@ plainto_tsquery('simple', p_search_query))
      )
    ORDER BY 
        CASE 
            WHEN p_language IS NOT NULL THEN 1
            ELSE 
                CASE upr.language
                    -- Приоритет языков при поиске без указания языка
                    WHEN 'ru' THEN 1
                    WHEN 'en' THEN 2
                    WHEN 'es' THEN 3
                    WHEN 'uk' THEN 4
                END
        END,
        relevance DESC,
        upr.created_at DESC;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.search_reviews_multilingual(int4, text, varchar) OWNER TO postgres;
GRANT ALL ON FUNCTION public.search_reviews_multilingual(int4, text, varchar) TO postgres;

-- DROP FUNCTION public.update_user_photo_reviews_updated_at();

CREATE OR REPLACE FUNCTION public.update_user_photo_reviews_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_user_photo_reviews_updated_at() OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_user_photo_reviews_updated_at() TO postgres;


-- Permissions

GRANT ALL ON SCHEMA public TO postgres;

Подробнее см. [MIGRATIONS.md](./MIGRATIONS.md) и [OPTIMIZATION.md](./OPTIMIZATION.md)
