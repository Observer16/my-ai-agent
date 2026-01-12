# 💊 Эндпоинты здоровья

API эндпоинты для модуля здоровья: лекарства, симптомы, логи, напоминания.

## GET /health/profile

Получение профиля здоровья пользователя.

**Ответ:**
```json
{
  "user_id": 123456,
  "health_data": {
    "birthday": "1990-01-15",
    "gender": "M",
    "height": 180,
    "weight": 75,
    "blood_type": "O+"
  },
  "last_updated": "2025-01-10T12:00:00Z"
}
```

## GET /health/medications

Получение списка лекарств пользователя.

**Параметры:**
- `active_only` (bool, default: true) - только активные лекарства
- `limit` (int, default: 50) - количество результатов

**Ответ:**
```json
{
  "items": [
    {
      "id": "med_123",
      "name": "Aspirin",
      "dosage": "500mg",
      "frequency": "twice daily",
      "start_date": "2025-01-01",
      "end_date": null,
      "notes": "For headaches"
    }
  ]
}
```

## GET /health/entries

Получение записей о здоровье (симптомы, настроение, etc).

**Параметры:**
- `days` (int, default: 30) - количество дней
- `type` (string, optional) - тип записи

**Ответ:**
```json
{
  "items": [
    {
      "id": "entry_123",
      "date": "2025-01-10",
      "type": "symptom",
      "symptom": "Headache",
      "severity": 5,
      "notes": "Morning headache"
    }
  ]
}
```

## GET /health/logs

Получение логов здоровья (история приема лекарств, etc).

**Параметры:**
- `days` (int, default: 7) - количество дней
- `medication_id` (string, optional) - фильтр по лекарству

## POST /health/reminder

Добавление напоминания о приеме лекарства.

**Параметры:**
- `medication_id` (string) - ID лекарства
- `time` (string) - время напоминания (HH:MM)
- `days_of_week` (array) - дни недели (1-7, где 1=Пн, 7=Вс)

**Ответ:**
```json
{
  "id": "reminder_123",
  "medication_id": "med_123",
  "time": "08:00",
  "days_of_week": [1, 2, 3, 4, 5, 6, 7],
  "created_at": "2025-01-10T12:00:00Z"
}
```

Подробнее см. [API_REFERENCE.md](./API_REFERENCE.md)
