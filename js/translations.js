// js/translations.js - Система переводов

const translations = {
    ru: {
        // Приветствия
        greeting: {
            night: 'Доброй ночи',
            morning: 'Доброе утро',
            day: 'Добрый день',
            evening: 'Добрый вечер'
        },
        
        // Главный экран
        home: {
            title: 'Мой AI Агент',
            subtitle: 'Умный помощник для жизни',
            welcome: 'Добро пожаловать!',
            telegramApp: 'Telegram Mini App'
        },
        
        // Месячная статистика
        monthly: {
            title: 'Статистика за месяц',
            detailedAnalysis: 'Детальный анализ расходов',
            period: 'Период',
            purchases: 'Покупок',
            stores: 'магазинов',
            recipients: 'Получателей',
            items: 'Товаров',
            uniqueProducts: 'Уникальных товаров',
            totalSpent: 'Всего потрачено',
            avgCheck: 'Средний чек',
            expensesByDays: 'Расходы по дням',
            byCategory: 'По категориям',
            byStore: 'По магазинам',
            topCategories: 'Топ категорий',
            topStores: 'Топ магазинов',
            topPurchases: 'Крупнейшие покупки',
            weekdayStats: 'Статистика по дням недели'
        },
        
        // Модули
        modules: {
            health: 'Здоровье',
            healthDesc: 'Ежедневная оценка самочувствия, трекинг симптомов и рекомендации',
            activity: 'Активность',
            activityDesc: 'Трекер тренировок, шагов и калорий с персональными планами',
            doctor: 'Медицинский консультант',
            doctorDesc: 'AI-помощник для консультаций по здоровью и первой помощи',
            available247: 'Доступен 24/7',
            today: 'сегодня',
            week: 'неделя',
            steps: 'шагов',
            workouts: 'тренировок'
        },
        
        // Быстрые действия
        actions: {
            title: 'Быстрые действия',
            addExpense: 'Добавить расход',
            management: 'Управление',
            priceAnalysis: 'Анализ цен',
            settings: 'Настройки'
        },
        
        // Семья
        family: {
            title: 'Моя семья',
            management: 'Управление семейной группой',
            inviteTitle: 'Приглашение в семью',
            invitesYou: 'приглашает вас',
            inFamily: 'в семью',
            warning: '⚠️ Если вы уже состоите в семье, вы автоматически выйдете из неё',
            expiresIn: '⏳ Приглашение действительно ещё',
            hours: 'ч.',
            decline: '❌ Отклонить',
            accept: '✅ Принять',
            success: '✅ Успешно!',
            joined: 'Вы вступили в семью',
            solo: 'Solo',
            members: 'Участники',
            familyMembers: 'Участники семьи',
            familyName: 'Название семьи',
            createFamily: 'Создать семью',
            createNewFamily: 'Создать новую семью',
            inviteMembers: 'Пригласить участников',
            invite: '+ Пригласить',
            inviteToFamily: 'Пригласить в семью',
            inviteMember: 'Пригласить участника',
            leaveFamily: 'Выйти из семьи',
            yourFamily: 'Ваша семья',
            noFamily: 'Нет семьи',
            inviteLink: 'Ссылка-приглашение',
            copyLink: 'Скопировать ссылку-приглашение',
            linkCopied: 'Ссылка скопирована',
            actions: 'Действия',
            created: 'Создана:',
            status: 'Статус:',
            incomingInvites: 'Входящие приглашения',
            sentInvites: 'Отправленные приглашения',
            soloMode: 'Вы работаете в одиночку',
            soloDescription: 'В семейном режиме все участники видят общие покупки, товары и аналитику.',
            checkInvites: 'Проверить приглашения',
            benefits: 'Преимущества семьи:',
            benefit1: '📊 Общая статистика расходов',
            benefit2: '🔄 Синхронизация списка товаров',
            benefit3: '👥 Совместное управление категориями',
            benefit4: '💬 Общие отчёты и аналитика',
            familyNamePlaceholder: 'Например: Семья Ивановых',
            creatorNote: '📝 Вы станете создателем семьи и сможете приглашать других участников.',
            leaveWarning: '⚠️ Если вы уже состоите в семье, вы автоматически выйдете из неё.',
            telegramId: 'Telegram ID пользователя *',
            enterTelegramId: 'Введите Telegram ID',
            telegramIdHint: 'ID можно узнать через бота @userinfobot',
            personalMessage: 'Персональное сообщение (необязательно)',
            writeMessage: 'Напишите приветственное сообщение...',
            inviteValid: '📧 Приглашение будет действовать 7 дней',
            userNotification: '👤 Пользователь получит уведомление в приложении',
            sendInvite: 'Отправить приглашение',
            familyActions: 'Действия с семьей',
            renameFamily: 'Переименовать семью',
            deleteFamily: 'Удалить семью',
            leaveConfirm: '⚠️ Вы уверены, что хотите выйти из семьи?',
            leaveDetail1: '• Вы вернетесь в одиночный режим',
            leaveDetail2: '• Все ваши данные останутся в семье',
            leaveDetail3: '• Вы сможете вступить в другую семью',
            lastMemberWarning: '⚠️ Вы последний участник. Семья будет деактивирована.'
        },
        
        // Настройки
        settings: {
            title: 'Настройки',
            language: 'Язык интерфейса',
            currency: 'Валюта',
            timezone: 'Часовой пояс',
            save: 'Сохранить',
            saved: 'Настройки сохранены',
            savedReload: 'Настройки сохранены. Страница будет обновлена.',
            profile: 'Профиль',
            name: 'Имя',
            telegramId: 'Telegram ID',
            languageDescription: 'Язык интерфейса приложения',
            yourCurrency: 'Ваша валюта',
            currencyDescription: 'Все суммы будут отображаться в выбранной валюте'
        },
        
        // Первичная настройка
        initialSetup: {
            welcome: 'Добро пожаловать!',
            subtitle: 'Настройте приложение под себя',
            selectLanguage: 'Выберите язык',
            selectCurrency: 'Выберите валюту',
            selectTimezone: 'Выберите часовой пояс',
            continue: 'Продолжить'
        },
        
        // Бюджет / Анализ цен
        budget: {
            title: 'Анализ цен',
            compareProducts: 'Сравнение товаров',
            selectProduct: 'Выберите товар',
            priceHistory: 'История цен',
            bestPrice: 'Лучшая цена',
            currentPrice: 'Текущая цена',
            averagePrice: 'Средняя цена',
            priceChange: 'Изменение цены',
            lastUpdate: 'Последнее обновление',
            store: 'Магазин',
            price: 'Цена',
            date: 'Дата',
            noPrices: 'Нет данных о ценах',
            selectToCompare: 'Выберите товар для сравнения цен'
        },
        
        // Товары
        products: {
            title: 'Управление товарами',
            allProducts: 'Все товары',
            categories: 'Категории',
            addProduct: 'Добавить товар',
            editProduct: 'Редактировать товар',
            deleteProduct: 'Удалить товар',
            productName: 'Название товара',
            category: 'Категория',
            search: 'Поиск',
            filter: 'Фильтр',
            noProducts: 'Нет товаров',
            totalProducts: 'Всего товаров',
            addCategory: 'Добавить категорию',
            categoryName: 'Название категории',
            selectCategory: 'Выберите категорию',
            allCategories: 'Все категории',
            priceComparison: 'Сравнение цен',
            viewPrices: 'Посмотреть цены',
            lastPurchase: 'Последняя покупка',
            averagePrice: 'Средняя цена',
            minPrice: 'Мин. цена',
            maxPrice: 'Макс. цена'
        },
        
        // Добавление расхода
        expense: {
            title: 'Добавить расход',
            addExpense: 'Добавить расход',
            store: 'Магазин',
            selectStore: 'Выберите магазин',
            date: 'Дата',
            time: 'Время',
            products: 'Товары',
            addProduct: 'Добавить товар',
            product: 'Товар',
            quantity: 'Количество',
            price: 'Цена',
            total: 'Итого',
            save: 'Сохранить',
            cancel: 'Отмена',
            selectProduct: 'Выберите товар',
            enterPrice: 'Введите цену',
            enterQuantity: 'Введите количество',
            remove: 'Удалить',
            expenseSaved: 'Расход сохранён',
            fillAllFields: 'Заполните все поля',
            totalAmount: 'Общая сумма',
            noProducts: 'Добавьте товары'
        },
        
        // Общие фразы
        common: {
            loading: 'Загрузка...',
            error: 'Ошибка',
            success: 'Успешно',
            cancel: 'Отмена',
            ok: 'ОК',
            close: 'Закрыть',
            refresh: 'Обновить',
            noData: 'Нет данных',
            inDevelopment: 'В разработке',
            back: 'Назад',
            save: 'Сохранить',
            delete: 'Удалить',
            edit: 'Редактировать',
            add: 'Добавить',
            search: 'Поиск',
            filter: 'Фильтр',
            all: 'Все',
            yes: 'Да',
            no: 'Нет'
        },
        
        // Месяцы
        months: [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ]
    },
    
    en: {
        // Greetings
        greeting: {
            night: 'Good night',
            morning: 'Good morning',
            day: 'Good afternoon',
            evening: 'Good evening'
        },
        
        // Home screen
        home: {
            title: 'My AI Agent',
            subtitle: 'Smart assistant for life',
            welcome: 'Welcome!',
            telegramApp: 'Telegram Mini App'
        },
        
        // Monthly statistics
        monthly: {
            title: 'Monthly Statistics',
            detailedAnalysis: 'Detailed expense analysis',
            period: 'Period',
            purchases: 'Purchases',
            stores: 'stores',
            recipients: 'Recipients',
            items: 'Items',
            uniqueProducts: 'Unique products',
            totalSpent: 'Total spent',
            avgCheck: 'Average check',
            expensesByDays: 'Expenses by days',
            byCategory: 'By category',
            byStore: 'By store',
            topCategories: 'Top categories',
            topStores: 'Top stores',
            topPurchases: 'Largest purchases',
            weekdayStats: 'Weekday statistics'
        },
        
        // Modules
        modules: {
            health: 'Health',
            healthDesc: 'Daily wellness tracking, symptom monitoring and recommendations',
            activity: 'Activity',
            activityDesc: 'Track workouts, steps and calories with personalized plans',
            doctor: 'Medical Consultant',
            doctorDesc: 'AI assistant for health consultations and first aid',
            available247: 'Available 24/7',
            today: 'today',
            week: 'week',
            steps: 'steps',
            workouts: 'workouts'
        },
        
        // Quick actions
        actions: {
            title: 'Quick Actions',
            addExpense: 'Add Expense',
            management: 'Management',
            priceAnalysis: 'Price Analysis',
            settings: 'Settings'
        },
        
        // Family
        family: {
            title: 'My Family',
            management: 'Family group management',
            inviteTitle: 'Family Invitation',
            invitesYou: 'invites you',
            inFamily: 'to family',
            warning: '⚠️ If you are already in a family, you will automatically leave it',
            expiresIn: '⏳ Invitation valid for',
            hours: 'h.',
            decline: '❌ Decline',
            accept: '✅ Accept',
            success: '✅ Success!',
            joined: 'You joined the family',
            solo: 'Solo',
            members: 'Members',
            familyMembers: 'Family members',
            familyName: 'Family name',
            createFamily: 'Create family',
            createNewFamily: 'Create new family',
            inviteMembers: 'Invite members',
            invite: '+ Invite',
            inviteToFamily: 'Invite to family',
            inviteMember: 'Invite member',
            leaveFamily: 'Leave family',
            yourFamily: 'Your family',
            noFamily: 'No family',
            inviteLink: 'Invite link',
            copyLink: 'Copy invite link',
            linkCopied: 'Link copied',
            actions: 'Actions',
            created: 'Created:',
            status: 'Status:',
            incomingInvites: 'Incoming invitations',
            sentInvites: 'Sent invitations',
            soloMode: 'You are working solo',
            soloDescription: 'In family mode, all members see shared purchases, products and analytics.',
            checkInvites: 'Check invitations',
            benefits: 'Family benefits:',
            benefit1: '📊 Shared expense statistics',
            benefit2: '🔄 Product list synchronization',
            benefit3: '👥 Joint category management',
            benefit4: '💬 Shared reports and analytics',
            familyNamePlaceholder: 'For example: Smith Family',
            creatorNote: '📝 You will become the family creator and can invite other members.',
            leaveWarning: '⚠️ If you are already in a family, you will automatically leave it.',
            telegramId: 'Telegram ID *',
            enterTelegramId: 'Enter Telegram ID',
            telegramIdHint: 'ID can be found via @userinfobot',
            personalMessage: 'Personal message (optional)',
            writeMessage: 'Write a welcome message...',
            inviteValid: '📧 Invitation will be valid for 7 days',
            userNotification: '👤 User will receive a notification in the app',
            sendInvite: 'Send invitation',
            familyActions: 'Family actions',
            renameFamily: 'Rename family',
            deleteFamily: 'Delete family',
            leaveConfirm: '⚠️ Are you sure you want to leave the family?',
            leaveDetail1: '• You will return to solo mode',
            leaveDetail2: '• All your data will remain in the family',
            leaveDetail3: '• You can join another family',
            lastMemberWarning: '⚠️ You are the last member. The family will be deactivated.'
        },
        
        // Settings
        settings: {
            title: 'Settings',
            language: 'Interface Language',
            currency: 'Currency',
            timezone: 'Timezone',
            save: 'Save',
            saved: 'Settings saved',
            languageDescription: 'Application interface language',
            yourCurrency: 'Your currency',
            currencyDescription: 'All amounts will be displayed in selected currency',
            savedReload: 'Settings saved. Page will be reloaded.',
            profile: 'Profile',
            name: 'Name',
            telegramId: 'Telegram ID'
        },
        
        // Initial setup
        initialSetup: {
            welcome: 'Welcome!',
            subtitle: 'Customize the app for yourself',
            selectLanguage: 'Select language',
            selectCurrency: 'Select currency',
            selectTimezone: 'Select timezone',
            continue: 'Continue'
        },
        
        // Budget / Price analysis
        budget: {
            title: 'Price Analysis',
            compareProducts: 'Compare products',
            selectProduct: 'Select product',
            priceHistory: 'Price history',
            bestPrice: 'Best price',
            currentPrice: 'Current price',
            averagePrice: 'Average price',
            priceChange: 'Price change',
            lastUpdate: 'Last update',
            store: 'Store',
            price: 'Price',
            date: 'Date',
            noPrices: 'No price data',
            selectToCompare: 'Select product to compare prices'
        },
        
        // Products
        products: {
            title: 'Product Management',
            allProducts: 'All products',
            categories: 'Categories',
            addProduct: 'Add product',
            editProduct: 'Edit product',
            deleteProduct: 'Delete product',
            productName: 'Product name',
            category: 'Category',
            search: 'Search',
            filter: 'Filter',
            noProducts: 'No products',
            totalProducts: 'Total products',
            addCategory: 'Add category',
            categoryName: 'Category name',
            selectCategory: 'Select category',
            allCategories: 'All categories',
            priceComparison: 'Price comparison',
            viewPrices: 'View prices',
            lastPurchase: 'Last purchase',
            averagePrice: 'Average price',
            minPrice: 'Min price',
            maxPrice: 'Max price'
        },
        
        // Add expense
        expense: {
            title: 'Add Expense',
            addExpense: 'Add expense',
            store: 'Store',
            selectStore: 'Select store',
            date: 'Date',
            time: 'Time',
            products: 'Products',
            addProduct: 'Add product',
            product: 'Product',
            quantity: 'Quantity',
            price: 'Price',
            total: 'Total',
            save: 'Save',
            cancel: 'Cancel',
            selectProduct: 'Select product',
            enterPrice: 'Enter price',
            enterQuantity: 'Enter quantity',
            remove: 'Remove',
            expenseSaved: 'Expense saved',
            fillAllFields: 'Fill all fields',
            totalAmount: 'Total amount',
            noProducts: 'Add products'
        },
        
        // Common phrases
        common: {
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            ok: 'OK',
            close: 'Close',
            refresh: 'Refresh',
            noData: 'No data',
            inDevelopment: 'In development',
            back: 'Back',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            search: 'Search',
            filter: 'Filter',
            all: 'All',
            yes: 'Yes',
            no: 'No'
        },
        
        // Months
        months: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
    },

    es: {
        // Saludos
        greeting: {
            night: 'Buenas noches',
            morning: 'Buenos días',
            day: 'Buenas tardes',
            evening: 'Buenas tardes'
        },

        // Pantalla principal
        home: {
            title: 'Mi Agente AI',
            subtitle: 'Asistente inteligente para la vida',
            welcome: '¡Bienvenido!',
            telegramApp: 'Telegram Mini App'
        },

        // Estadísticas mensuales
        monthly: {
            title: 'Estadísticas Mensuales',
            detailedAnalysis: 'Análisis detallado de gastos',
            period: 'Período',
            purchases: 'Compras',
            stores: 'tiendas',
            recipients: 'Destinatarios',
            items: 'Artículos',
            uniqueProducts: 'Productos únicos',
            totalSpent: 'Total gastado',
            avgCheck: 'Recibo promedio',
            expensesByDays: 'Gastos por días',
            byCategory: 'Por categoría',
            byStore: 'Por tienda',
            topCategories: 'Categorías principales',
            topStores: 'Tiendas principales',
            topPurchases: 'Compras más grandes',
            weekdayStats: 'Estadísticas por día de semana'
        },

        // Módulos
        modules: {
            health: 'Salud',
            healthDesc: 'Seguimiento diario del bienestar, monitoreo de síntomas y recomendaciones',
            activity: 'Actividad',
            activityDesc: 'Seguimiento de entrenamientos, pasos y calorías con planes personalizados',
            doctor: 'Consultor Médico',
            doctorDesc: 'Asistente AI para consultas de salud y primeros auxilios',
            available247: 'Disponible 24/7',
            today: 'hoy',
            week: 'semana',
            steps: 'pasos',
            workouts: 'entrenamientos'
        },

        // Acciones rápidas
        actions: {
            title: 'Acciones Rápidas',
            addExpense: 'Agregar Gasto',
            management: 'Gestión',
            priceAnalysis: 'Análisis de Precios',
            settings: 'Configuración'
        },

        // Familia
        family: {
            title: 'Mi Familia',
            management: 'Gestión del grupo familiar',
            inviteTitle: 'Invitación Familiar',
            invitesYou: 'te invita',
            inFamily: 'a la familia',
            warning: '⚠️ Si ya estás en una familia, automáticamente saldrás de ella',
            expiresIn: '⏳ Invitación válida por',
            hours: 'h.',
            decline: '❌ Rechazar',
            accept: '✅ Aceptar',
            success: '✅ ¡Éxito!',
            joined: 'Te uniste a la familia',
            solo: 'Solo',
            members: 'Miembros',
            familyMembers: 'Miembros de la familia',
            familyName: 'Nombre de la familia',
            createFamily: 'Crear familia',
            createNewFamily: 'Crear nueva familia',
            inviteMembers: 'Invitar miembros',
            invite: '+ Invitar',
            inviteToFamily: 'Invitar a la familia',
            inviteMember: 'Invitar miembro',
            leaveFamily: 'Salir de la familia',
            yourFamily: 'Tu familia',
            noFamily: 'Sin familia',
            inviteLink: 'Enlace de invitación',
            copyLink: 'Copiar enlace de invitación',
            linkCopied: 'Enlace copiado',
            actions: 'Acciones',
            created: 'Creada:',
            status: 'Estado:',
            incomingInvites: 'Invitaciones entrantes',
            sentInvites: 'Invitaciones enviadas',
            soloMode: 'Estás trabajando solo',
            soloDescription: 'En modo familiar, todos los miembros ven compras, productos y análisis compartidos.',
            checkInvites: 'Verificar invitaciones',
            benefits: 'Beneficios de la familia:',
            benefit1: '📊 Estadísticas de gastos compartidas',
            benefit2: '🔄 Sincronización de lista de productos',
            benefit3: '👥 Gestión conjunta de categorías',
            benefit4: '💬 Informes y análisis compartidos',
            familyNamePlaceholder: 'Por ejemplo: Familia García',
            creatorNote: '📝 Te convertirás en el creador de la familia y podrás invitar a otros miembros.',
            leaveWarning: '⚠️ Si ya estás en una familia, automáticamente saldrás de ella.',
            telegramId: 'ID de Telegram *',
            enterTelegramId: 'Ingrese ID de Telegram',
            telegramIdHint: 'El ID se puede encontrar a través de @userinfobot',
            personalMessage: 'Mensaje personal (opcional)',
            writeMessage: 'Escribe un mensaje de bienvenida...',
            inviteValid: '📧 La invitación será válida por 7 días',
            userNotification: '👤 El usuario recibirá una notificación en la aplicación',
            sendInvite: 'Enviar invitación',
            familyActions: 'Acciones familiares',
            renameFamily: 'Renombrar familia',
            deleteFamily: 'Eliminar familia',
            leaveConfirm: '⚠️ ¿Estás seguro de que quieres salir de la familia?',
            leaveDetail1: '• Volverás al modo individual',
            leaveDetail2: '• Todos tus datos permanecerán en la familia',
            leaveDetail3: '• Podrás unirte a otra familia',
            lastMemberWarning: '⚠️ Eres el último miembro. La familia será desactivada.'
        },

        // Configuración
        settings: {
            title: 'Configuración',
            language: 'Idioma de la interfaz',
            currency: 'Moneda',
            timezone: 'Zona horaria',
            save: 'Guardar',
            saved: 'Configuración guardada',
            savedReload: 'Configuración guardada. La página se recargará.',
            profile: 'Perfil',
            name: 'Nombre',
            telegramId: 'ID de Telegram',
            languageDescription: 'Idioma de la interfaz de la aplicación',
            yourCurrency: 'Tu moneda',
            currencyDescription: 'Todas las cantidades se mostrarán en la moneda seleccionada'
        },

        // Configuración inicial
        initialSetup: {
            welcome: '¡Bienvenido!',
            subtitle: 'Personaliza la aplicación para ti',
            selectLanguage: 'Seleccionar idioma',
            selectCurrency: 'Seleccionar moneda',
            selectTimezone: 'Seleccionar zona horaria',
            continue: 'Continuar'
        },

        // Presupuesto / Análisis de precios
        budget: {
            title: 'Análisis de Precios',
            compareProducts: 'Comparar productos',
            selectProduct: 'Seleccionar producto',
            priceHistory: 'Historial de precios',
            bestPrice: 'Mejor precio',
            currentPrice: 'Precio actual',
            averagePrice: 'Precio promedio',
            priceChange: 'Cambio de precio',
            lastUpdate: 'Última actualización',
            store: 'Tienda',
            price: 'Precio',
            date: 'Fecha',
            noPrices: 'Sin datos de precios',
            selectToCompare: 'Seleccionar producto para comparar precios'
        },

        // Productos
        products: {
            title: 'Gestión de Productos',
            allProducts: 'Todos los productos',
            categories: 'Categorías',
            addProduct: 'Agregar producto',
            editProduct: 'Editar producto',
            deleteProduct: 'Eliminar producto',
            productName: 'Nombre del producto',
            category: 'Categoría',
            search: 'Buscar',
            filter: 'Filtrar',
            noProducts: 'Sin productos',
            totalProducts: 'Total de productos',
            addCategory: 'Agregar categoría',
            categoryName: 'Nombre de categoría',
            selectCategory: 'Seleccionar categoría',
            allCategories: 'Todas las categorías',
            priceComparison: 'Comparación de precios',
            viewPrices: 'Ver precios',
            lastPurchase: 'Última compra',
            averagePrice: 'Precio promedio',
            minPrice: 'Precio mínimo',
            maxPrice: 'Precio máximo'
        },

        // Agregar gasto
        expense: {
            title: 'Agregar Gasto',
            addExpense: 'Agregar gasto',
            store: 'Tienda',
            selectStore: 'Seleccionar tienda',
            date: 'Fecha',
            time: 'Hora',
            products: 'Productos',
            addProduct: 'Agregar producto',
            product: 'Producto',
            quantity: 'Cantidad',
            price: 'Precio',
            total: 'Total',
            save: 'Guardar',
            cancel: 'Cancelar',
            selectProduct: 'Seleccionar producto',
            enterPrice: 'Ingresar precio',
            enterQuantity: 'Ingresar cantidad',
            remove: 'Eliminar',
            expenseSaved: 'Gasto guardado',
            fillAllFields: 'Completar todos los campos',
            totalAmount: 'Monto total',
            noProducts: 'Agregar productos'
        },

        // Frases comunes
        common: {
            loading: 'Cargando...',
            error: 'Error',
            success: 'Éxito',
            cancel: 'Cancelar',
            ok: 'OK',
            close: 'Cerrar',
            refresh: 'Actualizar',
            noData: 'Sin datos',
            inDevelopment: 'En desarrollo',
            back: 'Atrás',
            save: 'Guardar',
            delete: 'Eliminar',
            edit: 'Editar',
            add: 'Agregar',
            search: 'Buscar',
            filter: 'Filtrar',
            all: 'Todos',
            yes: 'Sí',
            no: 'No'
        },

        // Meses
        months: [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
    },

    uk: {
        // Вітання
        greeting: {
            night: 'Доброї ночі',
            morning: 'Доброго ранку',
            day: 'Доброго дня',
            evening: 'Доброго вечора'
        },

        // Головний екран
        home: {
            title: 'Мій AI Агент',
            subtitle: 'Розумний помічник для життя',
            welcome: 'Ласкаво просимо!',
            telegramApp: 'Telegram Mini App'
        },

        // Місячна статистика
        monthly: {
            title: 'Статистика за місяць',
            detailedAnalysis: 'Детальний аналіз витрат',
            period: 'Період',
            purchases: 'Покупок',
            stores: 'магазинів',
            recipients: 'Отримувачів',
            items: 'Товарів',
            uniqueProducts: 'Унікальних товарів',
            totalSpent: 'Всього витрачено',
            avgCheck: 'Середній чек',
            expensesByDays: 'Витрати по днях',
            byCategory: 'За категоріями',
            byStore: 'За магазинами',
            topCategories: 'Топ категорій',
            topStores: 'Топ магазинів',
            topPurchases: 'Найбільші покупки',
            weekdayStats: 'Статистика за днями тижня'
        },

        // Модулі
        modules: {
            health: 'Здоров\'я',
            healthDesc: 'Щоденна оцінка самопочуття, відстеження симптомів та рекомендації',
            activity: 'Активність',
            activityDesc: 'Трекер тренувань, кроків та калорій з персональними планами',
            doctor: 'Медичний консультант',
            doctorDesc: 'AI-помічник для консультацій зі здоров\'я та першої допомоги',
            available247: 'Доступний 24/7',
            today: 'сьогодні',
            week: 'тиждень',
            steps: 'кроків',
            workouts: 'тренувань'
        },

        // Швидкі дії
        actions: {
            title: 'Швидкі дії',
            addExpense: 'Додати витрату',
            management: 'Управління',
            priceAnalysis: 'Аналіз цін',
            settings: 'Налаштування'
        },

        // Сім'я
        family: {
            title: 'Моя сім\'я',
            management: 'Управління сімейною групою',
            inviteTitle: 'Запрошення до сім\'ї',
            invitesYou: 'запрошує вас',
            inFamily: 'до сім\'ї',
            warning: '⚠️ Якщо ви вже перебуваєте в сім\'ї, ви автоматично вийдете з неї',
            expiresIn: '⏳ Запрошення дійсне ще',
            hours: 'год.',
            decline: '❌ Відхилити',
            accept: '✅ Прийняти',
            success: '✅ Успішно!',
            joined: 'Ви вступили до сім\'ї',
            solo: 'Solo',
            members: 'Учасники',
            familyMembers: 'Учасники сім\'ї',
            familyName: 'Назва сім\'ї',
            createFamily: 'Створити сім\'ю',
            createNewFamily: 'Створити нову сім\'ю',
            inviteMembers: 'Запросити учасників',
            invite: '+ Запросити',
            inviteToFamily: 'Запросити до сім\'ї',
            inviteMember: 'Запросити учасника',
            leaveFamily: 'Вийти з сім\'ї',
            yourFamily: 'Ваша сім\'я',
            noFamily: 'Немає сім\'ї',
            inviteLink: 'Посилання-запрошення',
            copyLink: 'Скопіювати посилання-запрошення',
            linkCopied: 'Посилання скопійовано',
            actions: 'Дії',
            created: 'Створена:',
            status: 'Статус:',
            incomingInvites: 'Вхідні запрошення',
            sentInvites: 'Відправлені запрошення',
            soloMode: 'Ви працюєте самостійно',
            soloDescription: 'У сімейному режимі всі учасники бачать спільні покупки, товари та аналітику.',
            checkInvites: 'Перевірити запрошення',
            benefits: 'Переваги сім\'ї:',
            benefit1: '📊 Спільна статистика витрат',
            benefit2: '🔄 Синхронізація списку товарів',
            benefit3: '👥 Спільне управління категоріями',
            benefit4: '💬 Спільні звіти та аналітика',
            familyNamePlaceholder: 'Наприклад: Сім\'я Петренків',
            creatorNote: '📝 Ви станете творцем сім\'ї і зможете запрошувати інших учасників.',
            leaveWarning: '⚠️ Якщо ви вже перебуваєте в сім\'ї, ви автоматично вийдете з неї.',
            telegramId: 'Telegram ID користувача *',
            enterTelegramId: 'Введіть Telegram ID',
            telegramIdHint: 'ID можна дізнатися через бота @userinfobot',
            personalMessage: 'Персональне повідомлення (необов\'язково)',
            writeMessage: 'Напишіть вітальне повідомлення...',
            inviteValid: '📧 Запрошення буде дійсне 7 днів',
            userNotification: '👤 Користувач отримає сповіщення в додатку',
            sendInvite: 'Відправити запрошення',
            familyActions: 'Дії з сім\'єю',
            renameFamily: 'Перейменувати сім\'ю',
            deleteFamily: 'Видалити сім\'ю',
            leaveConfirm: '⚠️ Ви впевнені, що хочете вийти з сім\'ї?',
            leaveDetail1: '• Ви повернетеся в одиночний режим',
            leaveDetail2: '• Всі ваші дані залишаться в сім\'ї',
            leaveDetail3: '• Ви зможете вступити в іншу сім\'ю',
            lastMemberWarning: '⚠️ Ви останній учасник. Сім\'я буде деактивована.'
        },

        // Налаштування
        settings: {
            title: 'Налаштування',
            language: 'Мова інтерфейсу',
            currency: 'Валюта',
            timezone: 'Часовий пояс',
            save: 'Зберегти',
            saved: 'Налаштування збережено',
            savedReload: 'Налаштування збережено. Сторінка буде перезавантажена.',
            profile: 'Профіль',
            name: "Ім'я",
            telegramId: 'Telegram ID',
            languageDescription: 'Мова інтерфейсу програми',
            yourCurrency: 'Ваша валюта',
            currencyDescription: 'Всі суми будуть відображатися у вибраній валюті'
        },

        // Початкове налаштування
        initialSetup: {
            welcome: 'Ласкаво просимо!',
            subtitle: 'Налаштуйте програму для себе',
            selectLanguage: 'Виберіть мову',
            selectCurrency: 'Виберіть валюту',
            selectTimezone: 'Виберіть часовий пояс',
            continue: 'Продовжити'
        },

        // Бюджет / Аналіз цін
        budget: {
            title: 'Аналіз цін',
            compareProducts: 'Порівняння товарів',
            selectProduct: 'Виберіть товар',
            priceHistory: 'Історія цін',
            bestPrice: 'Найкраща ціна',
            currentPrice: 'Поточна ціна',
            averagePrice: 'Середня ціна',
            priceChange: 'Зміна ціни',
            lastUpdate: 'Останнє оновлення',
            store: 'Магазин',
            price: 'Ціна',
            date: 'Дата',
            noPrices: 'Немає даних про ціни',
            selectToCompare: 'Виберіть товар для порівняння цін'
        },

        // Товари
        products: {
            title: 'Управління товарами',
            allProducts: 'Всі товари',
            categories: 'Категорії',
            addProduct: 'Додати товар',
            editProduct: 'Редагувати товар',
            deleteProduct: 'Видалити товар',
            productName: 'Назва товару',
            category: 'Категорія',
            search: 'Пошук',
            filter: 'Фільтр',
            noProducts: 'Немає товарів',
            totalProducts: 'Всього товарів',
            addCategory: 'Додати категорію',
            categoryName: 'Назва категорії',
            selectCategory: 'Виберіть категорію',
            allCategories: 'Всі категорії',
            priceComparison: 'Порівняння цін',
            viewPrices: 'Переглянути ціни',
            lastPurchase: 'Остання покупка',
            averagePrice: 'Середня ціна',
            minPrice: 'Мін. ціна',
            maxPrice: 'Макс. ціна'
        },

        // Додавання витрати
        expense: {
            title: 'Додати витрату',
            addExpense: 'Додати витрату',
            store: 'Магазин',
            selectStore: 'Виберіть магазин',
            date: 'Дата',
            time: 'Час',
            products: 'Товари',
            addProduct: 'Додати товар',
            product: 'Товар',
            quantity: 'Кількість',
            price: 'Ціна',
            total: 'Разом',
            save: 'Зберегти',
            cancel: 'Скасувати',
            selectProduct: 'Виберіть товар',
            enterPrice: 'Введіть ціну',
            enterQuantity: 'Введіть кількість',
            remove: 'Видалити',
            expenseSaved: 'Витрату збережено',
            fillAllFields: 'Заповніть усі поля',
            totalAmount: 'Загальна сума',
            noProducts: 'Додайте товари'
        },

        // Загальні фрази
        common: {
            loading: 'Завантаження...',
            error: 'Помилка',
            success: 'Успішно',
            cancel: 'Скасувати',
            ok: 'OK',
            close: 'Закрити',
            refresh: 'Оновити',
            noData: 'Немає даних',
            inDevelopment: 'У розробці',
            back: 'Назад',
            save: 'Зберегти',
            delete: 'Видалити',
            edit: 'Редагувати',
            add: 'Додати',
            search: 'Пошук',
            filter: 'Фільтр',
            all: 'Всі',
            yes: 'Так',
            no: 'Ні'
        },

        // Місяці
        months: [
            'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
            'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
        ]
    }
};

// Текущий язык (по умолчанию русский)
let currentLanguage = 'ru';

/**
 * Инициализация языка из localStorage или настроек пользователя
 */
function initLanguage() {
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    }
}

/**
 * Установить текущий язык
 */
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('preferred_language', lang);
        return true;
    }
    return false;
}

/**
 * Получить текущий язык
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Получить перевод по ключу
 * @param {string} key - Ключ перевода в формате "section.subsection.key"
 * @param {object} params - Параметры для подстановки
 */
function t(key, params = {}) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    // Проходим по вложенным ключам
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            // Если ключ не найден, возвращаем ключ как есть
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
    }
    
    // Если значение - массив, возвращаем его
    if (Array.isArray(value)) {
        return value;
    }
    
    // Если значение не строка, возвращаем ключ
    if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
    }
    
    // Подставляем параметры в строку
    let result = value;
    for (const [param, val] of Object.entries(params)) {
        result = result.replace(`{${param}}`, val);
    }
    
    return result;
}

/**
 * Получить название месяца
 */
function getMonthName(monthIndex) {
    const months = t('months');
    return months[monthIndex] || '';
}

// Инициализируем язык при загрузке
initLanguage();

console.log('✅ Translations.js загружен, текущий язык:', currentLanguage);
