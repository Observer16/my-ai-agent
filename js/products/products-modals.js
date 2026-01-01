// js/products/products-modals.js - Управление модальными окнами

// Открыть модальное окно
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

// Закрыть модальное окно
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Показать модальное окно создания категории
function showCreateCategoryModal() {
    document.getElementById('new-category-name').value = '';
    document.getElementById('new-category-description').value = '';
    document.getElementById('new-category-parent').value = '';
    openModal('create-category-modal');
    tg.HapticFeedback.impactOccurred('medium');
}

// Показать модальное окно редактирования категории
function showEditCategoryModal(categoryId) {
    const category = allCategories.find(c => c.id === categoryId);
    if (!category) return;

    currentCategoryEdit = category;
    
    document.getElementById('edit-category-name').value = category.name;
    document.getElementById('edit-category-description').value = category.description || '';
    document.getElementById('edit-category-parent').value = category.parent_id || '';
    
    openModal('edit-category-modal');
    tg.HapticFeedback.impactOccurred('medium');
}

// Показать модальное окно редактирования товара
function showEditProductModal(productId, productName, categoryId) {
    const product = allProducts.find(p => p.id === productId);

    if (!product) {
        tg.showAlert(t('common.error'));
        return;
    }

    currentProductEdit = product;

    document.getElementById('edit-product-name').value = product.name || '';
    document.getElementById('edit-product-brand').value = product.brand || '';
    document.getElementById('edit-product-category').value = product.category_id || '';
    document.getElementById('edit-product-unit').value = product.unit || 'unidad';
    document.getElementById('edit-product-barcode').value = product.barcode || '';

    openModal('edit-product-modal');
    tg.HapticFeedback.impactOccurred('light');
}

// Показать модальное окно редактирования получателя
function showEditStoreModal() {
    if (allStores.length === 0) {
        tg.showAlert(t('products.noNoRecipients'));
        return;
    }
    document.getElementById('store-select').value = '';
    document.getElementById('store-edit-fields').style.display = 'none';
    document.getElementById('save-store-btn').style.display = 'none';
    openModal('edit-store-modal');
    tg.HapticFeedback.impactOccurred('medium');
}

// Загрузка данных получателя для редактирования
function loadStoreData() {
    const storeId = document.getElementById('store-select').value;
    if (!storeId) {
        document.getElementById('store-edit-fields').style.display = 'none';
        document.getElementById('save-store-btn').style.display = 'none';
        return;
    }

    const store = allStores.find(s => s.id === storeId);
    if (!store) return;

    currentStoreEdit = store;
    document.getElementById('store-name').value = store.name;
    document.getElementById('store-type').value = store.store_type || '';
    document.getElementById('store-ruc').value = store.ruc || '';
    document.getElementById('store-address').value = store.address || '';
    document.getElementById('store-edit-fields').style.display = 'block';
    document.getElementById('save-store-btn').style.display = 'block';
}

console.log('✅ products-modals.js загружен');
