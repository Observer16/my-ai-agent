/**
 * ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ API.JS
 * Версия 4.0.0 - Система семей
 */

// ============================================================================
// БАЗОВОЕ ИСПОЛЬЗОВАНИЕ
// ============================================================================

// Проверка здоровья API
async function checkHealth() {
    try {
        const health = await API.health();
        console.log('API Status:', health);
    } catch (error) {
        console.error('Ошибка проверки API:', error);
    }
}

// Получение статистики
async function loadStatistics() {
    try {
        const stats = await API.getStatistics();
        console.log('Статистика:', stats);
        
        // Отображение на странице
        document.getElementById('total-purchases').textContent = stats.total_purchases;
        document.getElementById('total-spent').textContent = API.formatCurrency(stats.total_spent);
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// ============================================================================
// РАБОТА С ПРОДУКТАМИ
// ============================================================================

// Получить все продукты
async function loadProducts() {
    try {
        const products = await API.getProducts();
        console.log('Продукты:', products);
        
        // Отображение списка
        const container = document.getElementById('products-list');
        container.innerHTML = products.map(p => `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p>Категория: ${p.category_name || 'Не указана'}</p>
                <p>Средняя цена: ${API.formatCurrency(p.avg_price || 0)}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки продуктов:', error);
    }
}

// Поиск продуктов
async function searchProducts(query) {
    try {
        const products = await API.getProducts(query);
        console.log('Результаты поиска:', products);
        return products;
    } catch (error) {
        console.error('Ошибка поиска:', error);
        return [];
    }
}

// Создать новый продукт
async function createProduct() {
    try {
        const result = await API.createProduct({
            name: 'Молоко',
            category_id: 1,
            brand: 'Lacteos SA',
            unit: 'литр',
            barcode: '1234567890'
        });
        
        console.log('Продукт создан:', result);
        alert('Продукт успешно создан!');
    } catch (error) {
        console.error('Ошибка создания продукта:', error);
        alert('Ошибка: ' + error.message);
    }
}

// ============================================================================
// РАБОТА С МАГАЗИНАМИ
// ============================================================================

// Загрузить магазины
async function loadStores() {
    try {
        const stores = await API.getStores();
        console.log('Магазины:', stores);
        
        // Создать выпадающий список
        const select = document.getElementById('store-select');
        select.innerHTML = '<option value="">Выберите магазин</option>' +
            stores.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    } catch (error) {
        console.error('Ошибка загрузки магазинов:', error);
    }
}

// Создать магазин
async function createStore(name, type = 'Магазин') {
    try {
        const result = await API.createStore({
            name: name,
            store_type: type
        });
        
        console.log('Магазин создан:', result);
        return result;
    } catch (error) {
        console.error('Ошибка создания магазина:', error);
        throw error;
    }
}

// ============================================================================
// РАБОТА С ПОКУПКАМИ
// ============================================================================

// Загрузить последние покупки
async function loadRecentPurchases() {
    try {
        const purchases = await API.getRecentPurchases(10);
        console.log('Последние покупки:', purchases);
        
        // Отобразить список
        const container = document.getElementById('recent-purchases');
        container.innerHTML = purchases.map(p => `
            <div class="purchase-card">
                <div class="purchase-header">
                    <strong>${p.store_name}</strong>
                    <span>${API.formatDate(p.purchase_date)}</span>
                </div>
                <div class="purchase-amount">
                    ${API.formatCurrency(p.total_amount)}
                </div>
                <div class="purchase-items">
                    ${p.items_count} товаров
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки покупок:', error);
    }
}

// Создать расход вручную
async function addManualExpense() {
    try {
        const result = await API.createManualExpense({
            store_id: 'uuid-магазина',
            product_id: 'uuid-продукта',
            quantity: 2,
            unit_price: 15000,
            purchase_date: new Date().toISOString()
        });
        
        console.log('Расход добавлен:', result);
        alert('Расход успешно добавлен!');
    } catch (error) {
        console.error('Ошибка добавления расхода:', error);
        alert('Ошибка: ' + error.message);
    }
}

// ============================================================================
// СЕМЕЙНАЯ СИСТЕМА
// ============================================================================

// Проверить информацию о семье
async function checkFamilyInfo() {
    try {
        const family = await API.getFamilyInfo();
        
        if (family) {
            console.log('Вы в семье:', family);
            document.getElementById('family-name').textContent = family.name;
            document.getElementById('family-members').textContent = family.members_count;
            document.getElementById('family-section').style.display = 'block';
        } else {
            console.log('Вы не состоите в семье');
            document.getElementById('no-family-section').style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка проверки семьи:', error);
    }
}

// Создать семью
async function createFamily() {
    const familyName = prompt('Введите название семьи:', 'Моя семья');
    
    if (!familyName) return;
    
    try {
        const result = await API.createFamily(familyName);
        console.log('Семья создана:', result);
        alert(`Семья "${result.name}" успешно создана!`);
        
        // Перезагрузить информацию
        await checkFamilyInfo();
    } catch (error) {
        console.error('Ошибка создания семьи:', error);
        alert('Ошибка: ' + error.message);
    }
}

// Получить участников семьи
async function loadFamilyMembers() {
    try {
        const members = await API.getFamilyMembers();
        console.log('Участники семьи:', members);
        
        const container = document.getElementById('members-list');
        container.innerHTML = members.map(m => `
            <div class="member-card">
                <div class="member-info">
                    <strong>${m.first_name || m.username || 'Пользователь'}</strong>
                    ${m.is_creator ? '<span class="badge">Создатель</span>' : ''}
                </div>
                <div class="member-actions">
                    ${!m.is_creator ? `
                        <button onclick="removeMember(${m.telegram_id})">
                            Исключить
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки участников:', error);
    }
}

// Пригласить в семью
async function inviteToFamily() {
    const telegramId = prompt('Введите Telegram ID пользователя:');
    const message = prompt('Персональное сообщение (опционально):');
    
    if (!telegramId) return;
    
    try {
        const result = await API.inviteToFamily(parseInt(telegramId), message);
        console.log('Приглашение отправлено:', result);
        alert('Приглашение успешно отправлено!');
    } catch (error) {
        console.error('Ошибка отправки приглашения:', error);
        alert('Ошибка: ' + error.message);
    }
}

// Проверить входящие приглашения
async function checkPendingInvites() {
    try {
        const invites = await API.getPendingInvites();
        
        if (invites && invites.length > 0) {
            console.log(`📬 Найдено приглашений: ${invites.length}`);
            
            // Показать модальное окно с первым приглашением
            showInviteModal(invites[0]);
        }
    } catch (error) {
        console.error('Ошибка проверки приглашений:', error);
    }
}

// Показать модальное окно приглашения
function showInviteModal(invite) {
    const inviterName = invite.invited_by_first_name || invite.invited_by_username || 'Пользователь';
    const familyName = invite.family_name || 'Без названия';
    const hoursLeft = Math.floor(invite.hours_remaining);
    
    // Создать модальное окно
    const modal = document.createElement('div');
    modal.id = 'invite-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-icon">👥</div>
                <h2>Приглашение в семью</h2>
                <p>
                    <strong>${inviterName}</strong> приглашает вас в семью<br>
                    "<strong>${familyName}</strong>"
                </p>
                
                ${invite.message ? `
                    <div class="invite-message">
                        💬 "${invite.message}"
                    </div>
                ` : ''}
                
                <div class="invite-warning">
                    ⚠️ Если вы уже состоите в семье, вы автоматически выйдете из неё
                </div>
                
                <div class="invite-expiry">
                    ⏳ Приглашение действительно ещё ${hoursLeft} ч.
                </div>
                
                <div class="modal-buttons">
                    <button class="btn-secondary" onclick="declineInvite('${invite.invite_token}')">
                        ❌ Отклонить
                    </button>
                    <button class="btn-primary" onclick="acceptInvite('${invite.invite_token}')">
                        ✅ Принять
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Принять приглашение
async function acceptInvite(inviteToken) {
    try {
        const result = await API.acceptInvite(inviteToken);
        console.log('Приглашение принято:', result);
        
        // Закрыть модальное окно
        document.getElementById('invite-modal')?.remove();
        
        alert(`Вы вступили в семью "${result.family_name}"!`);
        
        // Перезагрузить страницу
        window.location.reload();
    } catch (error) {
        console.error('Ошибка принятия приглашения:', error);
        alert('Ошибка: ' + error.message);
    }
}

// Отклонить приглашение
async function declineInvite(inviteToken) {
    try {
        await API.declineInvite(inviteToken);
        console.log('Приглашение отклонено');
        
        // Закрыть модальное окно
        document.getElementById('invite-modal')?.remove();
        
        // Проверить следующее приглашение
        await checkPendingInvites();
    } catch (error) {
        console.error('Ошибка отклонения приглашения:', error);
        alert('Ошибка: ' + error.message);
    }
}

// Выйти из семьи
async function leaveFamily() {
    if (!confirm('Вы уверены что хотите выйти из семьи?')) return;
    
    try {
        const result = await API.leaveFamily();
        console.log('Вышли из семьи:', result);
        alert('Вы вышли из семьи');
        
        // Перезагрузить страницу
        window.location.reload();
    } catch (error) {
        console.error('Ошибка выхода из семьи:', error);
        alert('Ошибка: ' + error.message);
    }
}

// Исключить участника
async function removeMember(telegramId) {
    if (!confirm('Вы уверены что хотите исключить этого участника?')) return;
    
    try {
        await API.removeFamilyMember(telegramId);
        console.log('Участник исключён');
        alert('Участник исключён из семьи');
        
        // Перезагрузить список
        await loadFamilyMembers();
    } catch (error) {
        console.error('Ошибка исключения участника:', error);
        alert('Ошибка: ' + error.message);
    }
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Загрузка приложения...');
    
    // Проверяем авторизацию
    if (!API.isAuthenticated()) {
        console.error('❌ Telegram User ID не найден!');
        alert('Приложение должно быть открыто через Telegram');
        return;
    }
    
    console.log('✅ Telegram User ID:', API.getTelegramUserId());
    
    try {
        // Проверяем входящие приглашения
        await checkPendingInvites();
        
        // Загружаем основные данные
        await loadStatistics();
        await loadRecentPurchases();
        await checkFamilyInfo();
        
        console.log('✅ Приложение готово');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
    }
});

// ============================================================================
// ЭКСПОРТ ФУНКЦИЙ (опционально)
// ============================================================================

if (typeof window !== 'undefined') {
    window.AppFunctions = {
        // Базовые
        loadStatistics,
        checkHealth,
        
        // Продукты
        loadProducts,
        searchProducts,
        createProduct,
        
        // Магазины
        loadStores,
        createStore,
        
        // Покупки
        loadRecentPurchases,
        addManualExpense,
        
        // Семья
        checkFamilyInfo,
        createFamily,
        loadFamilyMembers,
        inviteToFamily,
        checkPendingInvites,
        acceptInvite,
        declineInvite,
        leaveFamily,
        removeMember
    };
}
