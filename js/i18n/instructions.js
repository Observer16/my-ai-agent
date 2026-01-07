// js/i18n/instructions.js - Переводы страницы инструкций

registerTranslations('instructions', {
    ru: {
        title: 'Инструкции',
        subtitle: 'Руководство пользователя',
        qrFlowTitle: 'Автоматический учет расходов по QR-чеку (Парагвай)',
        qrFlowDescription: 'Следуй этой инструкции, чтобы бот автоматически добавил покупку в нужную категорию расходов.',
        
        step1Title: 'Найди QR-код на чеке',
        step1Content: 'В нижней части бумажного чека из магазина в Парагвае расположен QR-код.',
        step1NoteTitle: 'Доступно в крупных магазинах:',
        step1Examples: 'Supermercados Stock, Unión, Shopping del Sol, Gran Vía, и других сетевых магазинах',
        
        step2Title: 'Отсканируй QR-код',
        step2Content: 'Используй камеру телефона. Способ зависит от типа устройства:',
        
        iphoneHeader: 'iPhone',
        iphoneMethod: 'Приложение «Камера»',
        iphoneInstructions: 'Просто открой приложение Камера и наведи на QR-код. Ссылка появится автоматически.',
        iphoneNote: 'Убедись, что в Настройках → Камера включена функция «Сканировать QR-коды»',
        
        androidHeader: 'Android',
        androidMethod: 'Встроенные приложения',
        androidInstructions: 'Используй приложение Камера или Google Объектив.',
        androidNote: 'Также можно использовать приложение «Сканер QR-кодов» от Google',
        
        step3Title: 'Перейди по ссылке',
        step3Content: 'Нажми на уведомление или ссылку после сканирования. Откроется сайт:',
        
        step4Title: 'Пройди проверку (капчу)',
        step4Content: 'На сайте поставь галочку в квадрате «Я не робот» (reCAPTCHA).',
        
        step5Title: 'Нажми зеленую кнопку «Consultar»',
        step5Content: 'После прохождения капчи нажми зеленую кнопку «Consultar» для загрузки данных чека.',
        
        step6Title: 'Скачай файл счета (XML)',
        step6Content: 'В открывшейся фактуре найди и нажми кнопку «Descargar XML».',
        step6Note: 'Файл сохранится в телефон с названием из цифр, например:',
        
        step7Title: 'Отправь файл боту',
        step7Content: 'Перейди в чат с ботом @HealthWealthBot и отправь ему скачанный XML-файл как документ.',
        step7Note: 'Важно: отправляй именно файл, а не скриншот или текст!',
        
        quickGuideTitle: 'Короткая инструкция',
        quickGuideSteps: 'QR → Ссылка → Капча → Consultar → Descargar XML → Отправить файл боту',
        quickGuideNote: 'Бот пришлет уведомление о результате обработки',
        
        faqTitle: 'Частые вопросы',
        faq1Question: 'Что делать, если не сканируется QR-код?',
        faq1Answer: '1. Увеличить яркость экрана\n2. Поднести камеру ближе/дальше\n3. Использовать приложение «QR Code Reader»',
        
        faq2Question: 'Файл не отправляется боту',
        faq2Answer: '• Файл имеет расширение .xml\n• Отправляешь его как документ (не как фото)\n• Размер файла не превышает 20 МБ',
        
        faq3Question: 'Не появляется кнопка «Descargar XML»',
        faq3Answer: 'Обнови страницу и повтори шаги 3-5. Убедись, что интернет-соединение стабильное.',
        
        faq4Question: 'В магазине нет QR-кода на чеке',
        faq4Answer: 'Не все магазины предоставляют QR-коды. В этом случае добавь расход вручную через команду /add в боте.',
        
        navQRFlow: '📱 Учет по QR-чеку',
        navFAQ: '❓ Частые вопросы'
    },
    en: {
        title: 'Instructions',
        subtitle: 'User Guide',
        qrFlowTitle: 'Automatic expense tracking via QR receipt (Paraguay)',
        qrFlowDescription: 'Follow this guide to automatically add purchases to the correct expense category.',
        
        step1Title: 'Find the QR code on the receipt',
        step1Content: 'The QR code is located at the bottom of the paper receipt from any store in Paraguay.',
        step1NoteTitle: 'Available in major stores:',
        step1Examples: 'Supermercados Stock, Unión, Shopping del Sol, Gran Vía, and other chain stores',
        
        step2Title: 'Scan the QR code',
        step2Content: 'Use your phone camera. The method depends on your device type:',
        
        iphoneHeader: 'iPhone',
        iphoneMethod: 'Camera app',
        iphoneInstructions: 'Simply open the Camera app and point it at the QR code. The link will appear automatically.',
        iphoneNote: 'Make sure "Scan QR Codes" is enabled in Settings → Camera',
        
        androidHeader: 'Android',
        androidMethod: 'Built-in apps',
        androidInstructions: 'Use the Camera app or Google Lens.',
        androidNote: 'You can also use the "QR Code Scanner" app from Google',
        
        step3Title: 'Follow the link',
        step3Content: 'Tap the notification or link after scanning. The following website will open:',
        
        step4Title: 'Complete the verification (captcha)',
        step4Content: 'Check the box "I\'m not a robot" on the website.',
        
        step5Title: 'Click the green "Consultar" button',
        step5Content: 'After completing the captcha, click the green "Consultar" button to load receipt data.',
        
        step6Title: 'Download the invoice file (XML)',
        step6Content: 'In the opened invoice, find and click the "Descargar XML" button.',
        step6Note: 'The file will be saved to your phone with a numeric name, for example:',
        
        step7Title: 'Send the file to the bot',
        step7Content: 'Go to the chat with bot @HealthWealthBot and send the downloaded XML file as a document.',
        step7Note: 'Important: send the actual file, not a screenshot or text!',
        
        quickGuideTitle: 'Quick guide',
        quickGuideSteps: 'QR → Link → Captcha → Consultar → Descargar XML → Send file to bot',
        quickGuideNote: 'The bot will send a notification about the processing result',
        
        faqTitle: 'Frequently asked questions',
        faq1Question: 'What to do if the QR code doesn\'t scan?',
        faq1Answer: '1. Increase screen brightness\n2. Move camera closer/further\n3. Use "QR Code Reader" app',
        
        faq2Question: 'File won\'t send to the bot',
        faq2Answer: '• File has .xml extension\n• Send it as a document (not as photo)\n• File size doesn\'t exceed 20 MB',
        
        faq3Question: '"Descargar XML" button doesn\'t appear',
        faq3Answer: 'Refresh the page and repeat steps 3-5. Make sure you have stable internet connection.',
        
        faq4Question: 'Store receipt doesn\'t have QR code',
        faq4Answer: 'Not all stores provide QR codes. In this case, add the expense manually using /add command in the bot.',
        
        navQRFlow: '📱 QR receipt tracking',
        navFAQ: '❓ FAQ'
    },
    es: {
        title: 'Instrucciones',
        subtitle: 'Guía del Usuario',
        qrFlowTitle: 'Registro automático de gastos con código QR (Paraguay)',
        qrFlowDescription: 'Sigue esta guía para que el bot agregue automáticamente las compras a la categoría correcta.',
        
        step1Title: 'Encuentra el código QR en el recibo',
        step1Content: 'El código QR se encuentra en la parte inferior del recibo de papel de cualquier tienda en Paraguay.',
        step1NoteTitle: 'Disponible en tiendas importantes:',
        step1Examples: 'Supermercados Stock, Unión, Shopping del Sol, Gran Vía, y otras tiendas de cadena',
        
        step2Title: 'Escanear el código QR',
        step2Content: 'Usa la cámara de tu teléfono. El método depende del tipo de dispositivo:',
        
        iphoneHeader: 'iPhone',
        iphoneMethod: 'Aplicación Cámara',
        iphoneInstructions: 'Simplemente abre la aplicación Cámara y apunta al código QR. El enlace aparecerá automáticamente.',
        iphoneNote: 'Asegúrate de que "Escanear códigos QR" esté activado en Ajustes → Cámara',
        
        androidHeader: 'Android',
        androidMethod: 'Aplicaciones integradas',
        androidInstructions: 'Usa la aplicación Cámara o Google Lens.',
        androidNote: 'También puedes usar la aplicación "Escáner de códigos QR" de Google',
        
        step3Title: 'Sigue el enlace',
        step3Content: 'Toca la notificación o el enlace después de escanear. Se abrirá el siguiente sitio web:',
        
        step4Title: 'Completa la verificación (captcha)',
        step4Content: 'Marca la casilla "No soy un robot" en el sitio web.',
        
        step5Title: 'Haz clic en el botón verde "Consultar"',
        step5Content: 'Después de completar el captcha, haz clic en el botón verde "Consultar" para cargar los datos del recibo.',
        
        step6Title: 'Descarga el archivo de factura (XML)',
        step6Content: 'En la factura abierta, encuentra y haz clic en el botón "Descargar XML".',
        step6Note: 'El archivo se guardará en tu teléfono con un nombre numérico, por ejemplo:',
        
        step7Title: 'Envía el archivo al bot',
        step7Content: 'Ve al chat con el bot @HealthWealthBot y envía el archivo XML descargado como documento.',
        step7Note: 'Importante: ¡envía el archivo real, no una captura de pantalla o texto!',
        
        quickGuideTitle: 'Guía rápida',
        quickGuideSteps: 'QR → Enlace → Captcha → Consultar → Descargar XML → Enviar archivo al bot',
        quickGuideNote: 'El bot enviará una notificación sobre el resultado del procesamiento',
        
        faqTitle: 'Preguntas frecuentes',
        faq1Question: '¿Qué hacer si el código QR no se escanea?',
        faq1Answer: '1. Aumentar el brillo de la pantalla\n2. Acercar/alejar la cámara\n3. Usar la aplicación "QR Code Reader"',
        
        faq2Question: 'El archivo no se envía al bot',
        faq2Answer: '• El archivo tiene extensión .xml\n• Envíalo como documento (no como foto)\n• El tamaño del archivo no excede 20 MB',
        
        faq3Question: 'No aparece el botón "Descargar XML"',
        faq3Answer: 'Actualiza la página y repite los pasos 3-5. Asegúrate de tener conexión a Internet estable.',
        
        faq4Question: 'El recibo de la tienda no tiene código QR',
        faq4Answer: 'No todas las tiendas proporcionan códigos QR. En este caso, agrega el gasto manualmente usando el comando /add en el bot.',
        
        navQRFlow: '📱 Seguimiento con QR',
        navFAQ: '❓ Preguntas frecuentes'
    },
    uk: {
        title: 'Інструкції',
        subtitle: 'Керівництво користувача',
        qrFlowTitle: 'Автоматичний облік витрат за QR-чеком (Парагвай)',
        qrFlowDescription: 'Дотримуйся цієї інструкції, щоб бот автоматично додав покупку до потрібної категорії витрат.',
        
        step1Title: 'Знайди QR-код на чеку',
        step1Content: 'У нижній частині паперового чека з магазину в Парагваї розташований QR-код.',
        step1NoteTitle: 'Доступно у великих магазинах:',
        step1Examples: 'Supermercados Stock, Unión, Shopping del Sol, Gran Vía, та інших мережевих магазинах',
        
        step2Title: 'Відскануй QR-код',
        step2Content: 'Використовуй камеру телефону. Спосіб залежить від типу пристрою:',
        
        iphoneHeader: 'iPhone',
        iphoneMethod: 'Додаток «Камера»',
        iphoneInstructions: 'Просто відкрий додаток Камера та наведи на QR-код. Посилання з\'явиться автоматично.',
        iphoneNote: 'Переконайся, що в Налаштуваннях → Камера увімкнено функцію «Сканувати QR-коди»',
        
        androidHeader: 'Android',
        androidMethod: 'Вбудовані додатки',
        androidInstructions: 'Використовуй додаток Камера або Google Об\'єктив.',
        androidNote: 'Також можна використовувати додаток «Сканер QR-кодів» від Google',
        
        step3Title: 'Перейди за посиланням',
        step3Content: 'Натисни на сповіщення або посилання після сканування. Відкриється сайт:',
        
        step4Title: 'Пройди перевірку (капчу)',
        step4Content: 'На сайті постав галочку в квадраті «Я не робот» (reCAPTCHA).',
        
        step5Title: 'Натисни зелену кнопку «Consultar»',
        step5Content: 'Після проходження капчі натисни зелену кнопку «Consultar» для завантаження даних чека.',
        
        step6Title: 'Завантаж файл рахунку (XML)',
        step6Content: 'У відкритій фактурі знайди та натисни кнопку «Descargar XML».',
        step6Note: 'Файл збережеться в телефон з назвою з цифр, наприклад:',
        
        step7Title: 'Надішли файл боту',
        step7Content: 'Перейди в чат з ботом @HealthWealthBot і надішли йому завантажений XML-файл як документ.',
        step7Note: 'Важливо: надсилай саме файл, а не скріншот чи текст!',
        
        quickGuideTitle: 'Коротка інструкція',
        quickGuideSteps: 'QR → Посилання → Капча → Consultar → Descargar XML → Надіслати файл боту',
        quickGuideNote: 'Бот надішле сповіщення про результат обробки',
        
        faqTitle: 'Часті запитання',
        faq1Question: 'Що робити, якщо не сканується QR-код?',
        faq1Answer: '1. Збільшити яскравість екрану\n2. Піднести камеру ближче/далі\n3. Використовувати додаток «QR Code Reader»',
        
        faq2Question: 'Файл не надсилається боту',
        faq2Answer: '• Файл має розширення .xml\n• Надсилаєш його як документ (не як фото)\n• Розмір файлу не перевищує 20 МБ',
        
        faq3Question: 'Не з\'являється кнопка «Descargar XML»',
        faq3Answer: 'Онови сторінку та повтори кроки 3-5. Переконайся, що інтернет-з\'єднання стабільне.',
        
        faq4Question: 'У магазині немає QR-кода на чеку',
        faq4Answer: 'Не всі магазини надають QR-коди. У цьому випадку додай витрату вручну через команду /add в боті.',
        
        navQRFlow: '📱 Облік за QR-чеком',
        navFAQ: '❓ Часті запитання'
    }
});

console.log('✅ i18n/instructions.js загружен');
