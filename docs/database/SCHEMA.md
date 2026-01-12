# 💾 Схема базы данных

Описание структуры основных таблиц PostgreSQL.

## Таблицы товаров

### products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  barcode VARCHAR(100),
  category VARCHAR(100),
  family_id VARCHAR(255),           -- NULL для личных товаров
  created_by_user_id INTEGER,       -- NULL для публичных товаров
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### product_names
```sql
CREATE TABLE product_names (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  language_code VARCHAR(5),  -- 'es', 'en', 'ru', 'uk'
  country_code VARCHAR(5),   -- 'PY', 'US', etc
  name VARCHAR(255),
  normalized_name VARCHAR(255),
  UNIQUE(product_id, language_code, country_code)
);
```

## Таблицы цен

### stores
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  country VARCHAR(100),
  created_at TIMESTAMP
);
```

### price_history
```sql
CREATE TABLE price_history (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  store_id UUID REFERENCES stores(id),
  price DECIMAL(10, 2),
  unit VARCHAR(50),
  purchase_date DATE,
  purchase_item_id UUID,
  family_id VARCHAR(255),
  created_by_user_id INTEGER,
  created_at TIMESTAMP
);
```

## Таблицы покупок

### purchases
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  purchase_date TIMESTAMP,
  qr_code TEXT,
  family_id VARCHAR(255),
  created_by_user_id INTEGER,
  created_at TIMESTAMP
);
```

### purchase_items
```sql
CREATE TABLE purchase_items (
  id UUID PRIMARY KEY,
  purchase_id UUID REFERENCES purchases(id),
  product_id UUID,
  original_product_code VARCHAR(100),
  original_product_name VARCHAR(255),
  unit_price DECIMAL(10, 2),
  quantity DECIMAL(10, 2),
  unit VARCHAR(50),
  created_at TIMESTAMP
);
```

## Таблицы семей

### families
```sql
CREATE TABLE families (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  created_by_user_id INTEGER,
  created_at TIMESTAMP
);
```

### family_members
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY,
  family_id VARCHAR(255) REFERENCES families(id),
  user_id INTEGER,
  role VARCHAR(50),  -- 'admin', 'member'
  joined_at TIMESTAMP
);
```

## Таблицы здоровья

### health_profile
```sql
CREATE TABLE health_profile (
  id UUID PRIMARY KEY,
  user_id INTEGER,
  birthday DATE,
  gender VARCHAR(10),
  height INTEGER,
  weight DECIMAL(5, 2),
  blood_type VARCHAR(5),
  created_at TIMESTAMP
);
```

### medications
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY,
  user_id INTEGER,
  name VARCHAR(255),
  dosage VARCHAR(100),
  frequency VARCHAR(255),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP
);
```

Подробнее см. [MIGRATIONS.md](./MIGRATIONS.md) и [OPTIMIZATION.md](./OPTIMIZATION.md)
