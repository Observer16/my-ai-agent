# 📱 Telegram WebApp интеграция

Описание интеграции с Telegram WebApp API.

## Инициализация

Приложение инициализируется через `window.Telegram.WebApp`:

```javascript
const tg = window.Telegram.WebApp;
tg.ready();
```

## Аутентификация

Авторизация использует Telegram User ID из инициализационных данных:

```javascript
const userId = tg.initDataUnsafe.user.id;
const username = tg.initDataUnsafe.user.username;
const firstName = tg.initDataUnsafe.user.first_name;
```

Данные отправляются на backend в заголовке `X-Telegram-User-Id`.

## Доступные функции WebApp

### Навигация и UI
- `tg.showMainButton()` / `tg.hideMainButton()` - главная кнопка
- `tg.onMainButtonClicked` - обработчик клика кнопки
- `tg.showBackButton()` / `tg.hideBackButton()` - кнопка "Назад"
- `tg.onBackButtonClicked` - обработчик клика "Назад"

### Обратная связь
- `tg.HapticFeedback.impactOccurred('light')` - вибрация (light, medium, heavy)
- `tg.HapticFeedback.selectionChanged()` - вибрация выделения
- `tg.HapticFeedback.notificationOccurred('success')` - вибрация уведомления

### Стиль и тема
- `tg.setHeaderColor(color)` - цвет заголовка
- `tg.setBackgroundColor(color)` - цвет фона
- `tg.themeParams` - параметры темы Telegram

### Всплывающие окна
- `tg.showPopup(params)` - всплывающее окно
- `tg.showConfirm(message)` - подтверждение
- `tg.showAlert(message)` - предупреждение

## Интеграция в приложение

### Инициализация пользователя
В `js/app.js` используется Telegram WebApp для:
- Получения ID пользователя
- Установки цвета темы
- Обработки кнопки "Назад"

### Обработчики событий
- Закрытие модальных окон через BackButton
- Haptic feedback на действиях пользователя
- Обновление UI при получении данных

Подробнее см. [Страницы](./PAGES.md) и [Компоненты](./COMPONENTS.md)
