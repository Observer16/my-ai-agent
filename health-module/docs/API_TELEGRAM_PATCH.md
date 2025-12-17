# Патч для health-api.js

## Добавить эти методы в `return` секцию в конце файла:

Найди в файле `health-module/js/health-api.js` строку:

```javascript
// Публичные методы
return {
    getUserInfo,
    getUserGender,
    // ... остальные методы
};
```

И добавь перед закрывающей скобкой `};` следующие методы:

```javascript
/**
 * Получить статус Telegram привязки
 */
async function getTelegramStatus() {
    try {
        const response = await fetch(`${BASE_URL}/health/telegram/status`, {
            method: 'GET',
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('❌ Ошибка получения статуса Telegram:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Генерация кода привязки
 */
async function generateLinkCode() {
    try {
        const response = await fetch(`${BASE_URL}/health/telegram/generate-link-code`, {
            method: 'POST',
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('❌ Ошибка генерации кода:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Отвязать Telegram аккаунт
 */
async function unlinkTelegram() {
    try {
        const response = await fetch(`${BASE_URL}/health/telegram/unlink`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('❌ Ошибка отвязки Telegram:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Получить настройки уведомлений
 */
async function getNotificationSettings() {
    try {
        const response = await fetch(`${BASE_URL}/health/telegram/notification-settings`, {
            method: 'GET',
            headers: getHeaders()
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('❌ Ошибка получения настроек:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Обновить настройки уведомлений
 */
async function updateNotificationSettings(settings) {
    try {
        const response = await fetch(`${BASE_URL}/health/telegram/notification-settings`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(settings)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('❌ Ошибка обновления настроек:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
```

## И добавь эти методы в return:

```javascript
return {
    // ... существующие методы
    
    // 🆕 Telegram методы
    getTelegramStatus,
    generateLinkCode,
    unlinkTelegram,
    getNotificationSettings,
    updateNotificationSettings
};
```

## Полный список в return должен быть:

```javascript
return {
    getUserInfo,
    getUserGender,
    getUserOptions,
    updateUserGender,
    getTodayMedications,
    getMedications,
    logMedicationIntake,
    getEntryByDate,
    addMood,
    addSleep,
    addWeight,
    addSymptoms,
    addNotes,
    addSexualActivity,
    getHealthSummary,
    getHealthStatistics,
    createMedication,
    updateMedicationStock,
    getLowStockMedications,
    checkLowStock,
    deactivateMedication,
    getMedication,
    // 🆕 Telegram API
    getTelegramStatus,
    generateLinkCode,
    unlinkTelegram,
    getNotificationSettings,
    updateNotificationSettings
};
```

---

## Готово!

После применения патча API будет готово для работы с Telegram уведомлениями.
