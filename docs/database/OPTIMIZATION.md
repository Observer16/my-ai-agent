# ⚡ Индексы и оптимизация БД

Описание стратегии оптимизации и индексирования базы данных.

## Индексы по таблицам

### Public Schema - Основные индексы

#### Пользователи и семьи
```sql
-- app_users: минимальные индексы (обычно используются по ID)
-- families
CREATE INDEX idx_families_created_by ON public.families(created_by_user_id);
-- family_invites
CREATE INDEX idx_family_invites_family ON public.family_invites(family_id);
CREATE INDEX idx_family_invites_token ON public.family_invites(invite_token);
CREATE INDEX idx_family_invites_status ON public.family_invites(status);
-- family_members
CREATE INDEX idx_family_members_family ON public.family_members(family_id);
CREATE INDEX idx_family_members_user ON public.family_members(user_id);
```

#### Товары и каталог
```sql
-- products
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_products_family_id ON public.products(family_id);
CREATE INDEX idx_products_created_by ON public.products(created_by_user_id);
CREATE INDEX idx_products_category ON public.products(category_id);
-- product_names
CREATE INDEX idx_product_names_normalized ON public.product_names(normalized_name);
CREATE INDEX idx_product_names_product ON public.product_names(product_id);
CREATE INDEX idx_product_names_language ON public.product_names(language_code);
-- product_synonyms
CREATE INDEX idx_product_synonyms_product ON public.product_synonyms(product_id);
CREATE INDEX idx_product_synonyms_synonym ON public.product_synonyms(synonym);
```

#### Магазины и категории
```sql
-- stores
CREATE INDEX idx_stores_family ON public.stores(family_id);
CREATE INDEX idx_stores_created_by ON public.stores(created_by_user_id);
CREATE INDEX idx_stores_ruc ON public.stores(ruc);
-- expense_categories
CREATE INDEX idx_categories_family ON public.expense_categories(family_id);
CREATE INDEX idx_categories_created_by ON public.expense_categories(created_by_user_id);
CREATE INDEX idx_categories_parent ON public.expense_categories(parent_id);
```

#### Покупки
```sql
-- purchases
CREATE INDEX idx_purchases_family ON public.purchases(family_id);
CREATE INDEX idx_purchases_created_by ON public.purchases(created_by_user_id);
CREATE INDEX idx_purchases_date ON public.purchases(purchase_date DESC);
CREATE INDEX idx_purchases_store ON public.purchases(store_id);
-- purchase_items
CREATE INDEX idx_purchase_items_purchase ON public.purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product ON public.purchase_items(product_id);
CREATE INDEX idx_purchase_items_code ON public.purchase_items(original_product_code);
CREATE INDEX idx_purchase_items_family ON public.purchase_items(family_id);
```

#### История цен
```sql
-- price_history
CREATE INDEX idx_price_history_product ON public.price_history(product_id);
CREATE INDEX idx_price_history_store ON public.price_history(store_id);
CREATE INDEX idx_price_history_date ON public.price_history(purchase_date DESC);
CREATE INDEX idx_price_history_family ON public.price_history(family_id);
CREATE INDEX idx_price_history_user ON public.price_history(created_by_user_id);
-- Composite индекс для обычных запросов
CREATE INDEX idx_price_history_product_store_date
  ON public.price_history(product_id, store_id, purchase_date DESC);
```

#### Другие таблицы
```sql
-- user_photo_reviews
CREATE INDEX idx_photo_reviews_product ON public.user_photo_reviews(product_id);
CREATE INDEX idx_photo_reviews_user ON public.user_photo_reviews(created_by_user_id);
-- activity_records
CREATE INDEX idx_activity_user_date ON public.activity_records(created_by_user_id, created_at DESC);
-- health_records
CREATE INDEX idx_health_records_user ON public.health_records(created_by_user_id);
CREATE INDEX idx_health_records_date ON public.health_records(created_at DESC);
```

### Health Schema - Индексы здоровья

```sql
-- user_profiles
CREATE INDEX idx_health_user_profiles_user ON health.user_profiles(user_id);

-- health_goals
CREATE INDEX idx_health_goals_user ON health.health_goals(user_id);
CREATE INDEX idx_health_goals_type_active ON health.health_goals(goal_type, is_active);

-- entries (дневник)
CREATE INDEX idx_entries_user_date ON health.entries(user_id, entry_date DESC);

-- symptoms
CREATE INDEX idx_symptoms_entry ON health.symptoms(entry_id);

-- medications
CREATE INDEX idx_medications_user ON health.medications(user_id);
CREATE INDEX idx_medications_active ON health.medications(user_id, is_active);

-- medication_schedules
CREATE INDEX idx_med_schedules_medication ON health.medication_schedules(medication_id);

-- medication_reminders
CREATE INDEX idx_med_reminders_user_date ON health.medication_reminders(user_id, reminder_date);

-- medication_logs
CREATE INDEX idx_med_logs_user_date ON health.medication_logs(user_id, log_date DESC);

-- Специализированные таблицы здоровья
CREATE INDEX idx_dental_health_user_date ON health.dental_health(user_id, checkup_date DESC);
CREATE INDEX idx_immunizations_user ON health.immunizations(user_id);
CREATE INDEX idx_medical_measurements_user_date ON health.medical_measurements(user_id, measurement_date DESC);
CREATE INDEX idx_vision_health_user ON health.vision_health(user_id);
CREATE INDEX idx_menstrual_user_date ON health.menstrual_cycle(user_id, cycle_date DESC);
CREATE INDEX idx_activity_user_date ON health.physical_activity(user_id, activity_date DESC);
CREATE INDEX idx_water_user_date ON health.water_intake(user_id, intake_date DESC);

-- notification_logs
CREATE INDEX idx_notification_logs_user ON health.notification_logs(user_id);
CREATE INDEX idx_notification_logs_sent ON health.notification_logs(sent_at DESC);
```

## Оптимизация запросов

### Кэширование на frontend
- Результаты API кэшируются в localStorage с `CacheManager`
- Период кэширования (TTL) настраивается на уровень эндпоинта
- Ключи кэша включают query параметры для правильной инвалидации
- `Cache.clear(pattern)` для инвалидации по шаблону

**TTL по эндпоинтам:**
- Список товаров: 6 часов
- Фото товаров: 24 часа
- История цен: 2 часа
- Профиль пользователя: 1 час

### Кэширование на backend
- Redis для кэширования результатов запросов
- TTL: 6 часов для списков товаров, 24 часа для фото
- Кэш инвалидируется при INSERT/UPDATE/DELETE операциях

### Оптимизированные паттерны запросов

#### Поиск товара по штрих-коду
- Параметризованные запросы (`$1, $2`) защита от SQL injection
- Индекс на `barcode` для быстрого поиска (O(log n))
- JOIN с `product_names` для локализованных названий
- Кэширование результата на frontend (2 часа)

#### Сравнение цен
- CTE (Common Table Expression) для многоэтапного вычисления
- Фильтрация по `family_id` и `store_id` перед JOIN
- Исключение MANUAL записей из анализа
- Composite индекс на (product_id, store_id, purchase_date)

#### Фильтрация по семьям (SOLO vs FAMILY режимы)
```sql
-- SOLO режим: family_id IS NULL AND created_by_user_id = ?
-- FAMILY режим: family_id = ? (все члены семьи видят данные)
```

#### Запросы здоровья
- Индекс на (user_id, date) для временных срезов
- Separate таблицы для разных типов здоровья (разделение забот)
- Быстрый доступ к последним записям (DESC сортировка в индексе)

## Производительность

### Текущие показатели

| Операция | Время | Примечание |
|----------|-------|-----------|
| Поиск по штрих-коду | < 1ms | С индексом на barcode |
| Список товаров | < 100ms | С кэшированием |
| История цен | < 50ms | Composite индекс |
| Запись в дневник | < 10ms | INSERT + триггер |

### Рекомендации по оптимизации

1. **Мониторинг**
   - Регулярно запускать `EXPLAIN ANALYZE` на медленных запросах
   - Отслеживать размер таблиц через `pg_stat_user_tables`
   - Мониторить кэш-хиты через `pg_stat_user_indexes`

2. **Техническое обслуживание**
   - `VACUUM ANALYZE` еженедельно на продакшене
   - Пересоздание фрагментированных индексов (`REINDEX`)
   - Мониторинг размера логов (`pg_wal/`)

3. **Масштабирование**
   - При > 1GB на таблице: рассмотреть партицирование по user_id
   - При > 10M записей price_history: партицирование по месяцам
   - Health таблицы отделены в отдельную схему для лучшей изоляции

4. **Запросы**
   - Использовать prepared statements (asyncpg поддерживает автоматически)
   - Batch операции где возможно (INSERT... VALUES multiple rows)
   - Избегать N+1 проблем через JOIN вместо loop запросов

### Известные узкие места

- **product_names**: может расти быстро при синхронизации с внешними источниками
- **price_history**: таблица с наибольшим объемом - требует регулярной очистки старых данных
- **health.medication_logs**: логирует каждый прием - требует архивирования старых записей

Подробнее см. [SCHEMA.md](./SCHEMA.md) и [MIGRATIONS.md](./MIGRATIONS.md)
