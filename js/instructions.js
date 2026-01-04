// Страница Инструкции
const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📖 Загрузка страницы инструкций...');
    
    tg.ready();
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        window.location.href = '../index.html';
    });
});

console.log('✅ instructions.js загружен');
