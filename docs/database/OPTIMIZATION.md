# ⚡ Индексы и оптимизация БД

Описание стратегии оптимизации и индексирования базы данных.

## Основные индексы

### Индексы товаров
```sql
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_family_id ON products(family_id);
CREATE INDEX idx_products_created_by ON products(created_by_user_id);
CREATE INDEX idx_product_names_normalized ON product_names(normalized_name);
```

### Индексы цен
```sql
CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_price_history_store ON price_history(store_id);
CREATE INDEX idx_price_history_date ON price_history(purchase_date);
CREATE INDEX idx_price_history_family ON price_history(family_id);
CREATE INDEX idx_price_history_user ON price_history(created_by_user_id);
```

### Индексы покупок
```sql
CREATE INDEX idx_purchases_family ON purchases(family_id);
CREATE INDEX idx_purchases_user ON purchases(created_by_user_id);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);
CREATE INDEX idx_purchase_items_code ON purchase_items(original_product_code);
```

### Индексы семей
```sql
CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);
```

## Оптимизация запросов

### Кэширование на frontend
- Результаты API кэшируются в localStorage
- Период кэширования (TTL) настраивается на уровень эндпоинта
- Кэш инвалидируется при изменениях данных

### Кэширование на backend
- Redis для кэширования результатов запросов
- TTL: 6 часов для списков товаров, 24 часа для фото

### Оптимизированные запросы

#### Поиск товара по штрих-коду
- Использует asyncpg с параметризованными запросами ($1, $2, etc)
- Применяется индекс на `barcode` для быстрого поиска
- JOIN с `product_names` для получения локализованных названий

#### Сравнение цен
- Использует CTE (Common Table Expression) для многоэтапного вычисления
- Фильтрует товары только с несколькими магазинами
- Исключает вручную введенные товары (MANUAL)

## Производительность

### Рекомендации
1. Регулярно анализировать план выполнения запросов (`EXPLAIN ANALYZE`)
2. Мониторить размер таблиц и фрагментацию
3. Обновлять статистику (`ANALYZE`)
4. Рассмотреть партицирование при росте объема данных

Подробнее см. [SCHEMA.md](./SCHEMA.md) и [MIGRATIONS.md](./MIGRATIONS.md)
