const tg = window.Telegram.WebApp;
tg.expand();
tg.BackButton.show();
tg.BackButton.onClick(() => {
    tg.MainButton.hide();
    window.history.back();
});
