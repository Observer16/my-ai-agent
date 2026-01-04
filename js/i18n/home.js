// js/i18n/home.js - Переводы главной страницы

registerTranslations('home', {
    ru: {
        title: 'Мой AI Агент',
        subtitle: 'Умный помощник для жизни',
        welcome: 'Добро пожаловать!',
        telegramApp: 'Telegram Mini App'
    },
    en: {
        title: 'My AI Agent',
        subtitle: 'Smart assistant for life',
        welcome: 'Welcome!',
        telegramApp: 'Telegram Mini App'
    }
});

registerTranslations('nav', {
    ru: {
        finance: 'Финансы',
        health: 'Здоровье',
        activity: 'Активность',
        doctor: 'Мед. консультант'
    },
    en: {
        finance: 'Finance',
        health: 'Health',
        activity: 'Activity',
        doctor: 'Medical'
    }
});

registerTranslations('modules', {
    ru: {
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
    en: {
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
    }
});

registerTranslations('actions', {
    ru: {
        title: 'Быстрые действия',
        addExpense: 'Добавить расход',
        management: 'Управление',
        priceAnalysis: 'Анализ цен',
        settings: 'Настройки',
        instructions: 'Инструкции'
    },
    en: {
        title: 'Quick Actions',
        addExpense: 'Add Expense',
        management: 'Management',
        priceAnalysis: 'Price Analysis',
        settings: 'Settings',
        instructions: 'Instructions'
    }
});

console.log('✅ i18n/home.js загружен');
