# 🔄 Миграции базы данных

Описание истории изменений схемы БД и процесса миграций.

## Процесс миграций

Миграции управляются из backend проекта `C:\Users\obser\PycharmProjects\FamilyBudgetAnalyzer`.

## Основные миграции

### v1.0 - Инициальная схема
- Создание таблиц: products, product_names, stores, price_history
- Создание таблиц: purchases, purchase_items
- Создание таблиц: families, family_members

### v2.0 - Добавление модуля здоровья
- Создание таблиц: health_profile, medications
- Создание таблиц: health_symptoms, health_logs, health_reminders

### v3.0 - Поддержка семей и пользователей
- Добавление полей `family_id` в таблицы товаров и цен
- Добавление полей `created_by_user_id` для отслеживания пользователя
- Добавление индексов для оптимизации поиска

## Ключевые изменения

### Изоляция данных по семьям
- Все таблицы с данными имеют `family_id` (NULL для личных данных)
- Добавлены индексы на `family_id` для оптимизации
- Фильтрация на уровне API через middleware

### Нормализация названий товаров
- Создана отдельная таблица `product_names` для поддержки многоязычности
- Создано поле `normalized_name` для стандартизации поиска
- Поддержка локалей: es, en, ru, uk

Подробнее см. [SCHEMA.md](./SCHEMA.md) и [OPTIMIZATION.md](./OPTIMIZATION.md)
