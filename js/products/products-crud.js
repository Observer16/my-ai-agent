// js/products/products-crud.js - CRUD операции (создание, обновление, удаление)

// Создать категорию
async function createCategory() {
    const name = document.getElementById('new-category-name').value.trim();

    if (!name) {
        tg.showAlert(t('products.enterCategoryName'));
        return;
    }

    try {
        const description = document.getElementById('new-category-description').value.trim() || null;
        const parentId = document.getElementById('new-category-parent').value || null;

        await API.createCategory(name, description, parentId ? parseInt(parentId) : null);

        closeModal('create-category-modal');
        await loadCategories();
        switchTab('categories');

        tg.showPopup({
            title: t('common.success'),
            message: `${t('products.categoryCreated')} "${name}"`,
            buttons: [{type: 'ok'}]
        });

        tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error('Ошибка создания категории:', error);
        tg.showAlert(`${t('common.error')}: ${error.message}`);
    }
}

// Обновить категорию
async function updateCategory() {
    if (!currentCategoryEdit) return;

    const name = document.getElementById('edit-category-name').value.trim();

    if (!name) {
        tg.showAlert(t('products.enterCategoryName'));
        return;
    }

    try {
        const description = document.getElementById('edit-category-description').value.trim() || null;
        const parentId = document.getElementById('edit-category-parent').value || null;

        await API.updateCategory(currentCategoryEdit.id, {
            name: name,
            description: description,
            parent_id: parentId ? parseInt(parentId) : null
        });

        closeModal('edit-category-modal');
        await loadCategories();

        tg.showAlert(`✅ ${t('products.categoryUpdated')} "${name}"`);
        tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error('Ошибка обновления категории:', error);
        tg.showAlert(`${t('common.error')}: ${error.message}`);
    }
}

// Удалить категорию
async function deleteCategory(categoryId, categoryName) {
    tg.showConfirm(
        `${t('products.deleteCategory')} "${categoryName}"?`,
        async (confirmed) => {
            if (confirmed) {
                try {
                    await API.deleteCategory(categoryId);
                    await loadCategories();
                    tg.HapticFeedback.notificationOccurred('success');
                } catch (error) {
                    console.error('Ошибка удаления категории:', error);
                    tg.showAlert(`${t('common.error')}: ${error.message}`);
                }
            }
        }
    );
}

// Создать товар
async function createProduct() {
    const name = document.getElementById('new-product-name').value.trim();

    if (!name) {
        tg.showAlert(t('products.enterProductName'));
        return;
    }

    try {
        const brand = document.getElementById('new-product-brand').value.trim() || null;
        const categoryId = document.getElementById('new-product-category').value || null;
        const unit = document.getElementById('new-product-unit').value;
        const barcode = document.getElementById('new-product-barcode').value.trim() || null;

        const productData = {
            name: name,
            category_id: categoryId ? parseInt(categoryId) : null,
            brand: brand,
            unit: unit,
            barcode: barcode
        };

        await API.createProduct(productData);

        closeModal('create-product-modal');
        await loadProducts();
        switchTab('products');

        tg.showAlert(`✅ ${t('products.productCreated')} "${name}"`);
        tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error('Ошибка создания товара:', error);
        tg.showAlert(`${t('common.error')}: ${error.message}`);
    }
}

// Обновить товар
async function updateProduct() {
    if (!currentProductEdit) {
        tg.showAlert(t('common.error'));
        return;
    }

    const name = document.getElementById('edit-product-name').value.trim();

    if (!name) {
        tg.showAlert(t('products.enterProductName'));
        return;
    }

    try {
        const productData = {
            name: name,
            brand: document.getElementById('edit-product-brand').value.trim() || null,
            category_id: document.getElementById('edit-product-category').value ?
                parseInt(document.getElementById('edit-product-category').value) : null,
            unit: document.getElementById('edit-product-unit').value,
            barcode: document.getElementById('edit-product-barcode').value.trim() || null
        };

        await API.updateProduct(currentProductEdit.id, productData);

        closeModal('edit-product-modal');
        await loadProducts(currentCategoryFilter);

        tg.showAlert(`✅ ${t('products.productUpdated')} "${name}"`);
        tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        tg.showAlert(`${t('common.error')}: ${error.message}`);
    }
}

// Обновить получателя
async function updateStore() {
    if (!currentStoreEdit) return;

    const name = document.getElementById('store-name').value.trim();
    if (!name) {
        tg.showAlert(t('products.recipientName'));
        return;
    }

    try {
        const storeData = {
            name: name,
            store_type: document.getElementById('store-type').value.trim() || null,
            ruc: document.getElementById('store-ruc').value.trim() || null,
            address: document.getElementById('store-address').value.trim() || null
        };

        await API.updateStore(currentStoreEdit.id, storeData);
        closeModal('edit-store-modal');
        await loadStores();
        tg.showAlert(`✅ ${t('products.recipientUpdated')} "${name}"`);
        tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error('Ошибка обновления получателя:', error);
        tg.showAlert(`${t('common.error')}: ${error.message}`);
    }
}

console.log('✅ products-crud.js загружен');
