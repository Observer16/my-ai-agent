// js/products/products-render.js - Рендеринг списков

// Рендеринг фильтров категорий
function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    const mainCategories = allCategories.filter(c => !c.parent_id);

    const html = `
        <div class="category-chip ${!currentCategoryFilter ? 'active' : ''}"
             onclick="filterByCategory(null)">
            ${t('products.all')}
        </div>
        ${mainCategories.map(cat => `
            <div class="category-chip ${currentCategoryFilter === cat.id ? 'active' : ''}"
                 onclick="filterByCategory(${cat.id})">
                ${escapeHtml(cat.name)} (${cat.products_count || 0})
            </div>
        `).join('')}
    `;

    container.innerHTML = html;
}

// Рендеринг товаров
function renderProducts(products) {
    const container = document.getElementById('products-list');

    if (!products || products.length === 0) {
        container.innerHTML = `<div class="empty">📦 ${t('products.noProductsFound')}</div>`;
        return;
    }

    const html = products.map(p => {
        const name = escapeHtml(p.name);
        const categoryName = p.category_name ? escapeHtml(p.category_name) : '';
        const brand = p.brand ? escapeHtml(p.brand) : '';

        let pricesHtml = '';
        if (p.min_price) {
            const minPrice = p.min_price.toFixed(0);
            const maxPrice = p.max_price.toFixed(0);
            const avgPrice = p.avg_price ? p.avg_price.toFixed(0) : null;

            if (minPrice === maxPrice) {
                pricesHtml = `
                    <div class="product-prices">
                        <div class="price-badge price-single">
                            <strong>${minPrice} ${getCurrencySymbol()}</strong>
                        </div>
                    </div>
                `;
            } else {
                pricesHtml = `
                    <div class="product-prices">
                        <div class="price-badge price-min">
                            <strong>${minPrice} ${getCurrencySymbol()}</strong>
                        </div>
                        ${avgPrice && avgPrice !== minPrice && avgPrice !== maxPrice ? `
                            <div class="price-badge price-avg">
                                <strong>${avgPrice} ${getCurrencySymbol()}</strong>
                            </div>
                        ` : ''}
                        <div class="price-badge price-max">
                            <strong>${maxPrice} ${getCurrencySymbol()}</strong>
                        </div>
                    </div>
                `;
            }
        }

        return `
        <div class="product-card" onclick="showEditProductModal('${p.id}', '${name}', ${p.category_id || 'null'})">
            <div class="product-header">
                <div class="product-name">${name}</div>
                ${categoryName ? `
                    <div class="product-category">${categoryName}</div>
                ` : ''}
            </div>
            <div class="product-info">
                ${brand ? `<span>🏷️ ${brand}</span>` : ''}
                ${p.stores_count ? `<span>🏪 ${p.stores_count} ${t('products.stores')}</span>` : ''}
                ${p.last_purchase_date ? `<span>📅 ${formatDate(p.last_purchase_date)}</span>` : ''}
            </div>
            ${pricesHtml}
        </div>
    `}).join('');

    container.innerHTML = html;
}

// Рендеринг списка категорий
function renderCategoriesList() {
    const container = document.getElementById('categories-list');

    if (!allCategories || allCategories.length === 0) {
        container.innerHTML = `<div class="empty">📂 ${t('products.noCategoriesFound')}</div>`;
        return;
    }

    const html = allCategories.map(cat => {
        const name = escapeHtml(cat.name);
        const parentName = cat.parent_name ? escapeHtml(cat.parent_name) : '';
        const description = cat.description ? escapeHtml(cat.description) : '';
        const isSystem = cat.is_system || false;
        const needsTranslation = cat.needs_translation || false;

        return `
        <div class="category-card ${isSystem ? 'system-category' : ''}">
            <div class="category-header">
                <div class="category-name">
                    ${isSystem ? '🔒 ' : ''}${name}
                    ${needsTranslation ? ' <span style="color: orange;">⚠️</span>' : ''}
                    ${parentName ? `<div style="font-size:11px;opacity:0.6;margin-top:2px;">↳ ${parentName}</div>` : ''}
                </div>
                <div class="category-count">${cat.products_count || 0}</div>
            </div>
            ${description ? `
                <div class="category-description">${description}</div>
            ` : ''}
            <div class="category-actions">
                <button class="category-btn edit" onclick="filterByCategory(${cat.id}); switchTab('products')">
                    👁️ ${t('products.viewProducts')}
                </button>
                ${!isSystem ? `
                    <button class="category-btn edit" onclick="showEditCategoryModal(${cat.id})">
                        ✏️ ${t('products.edit')}
                    </button>
                ` : ''}
                ${!isSystem && (cat.products_count || 0) === 0 ? `
                    <button class="category-btn delete" onclick="deleteCategory(${cat.id}, '${name.replace(/'/g, "\\'")}')">
                        🗑️ ${t('products.delete')}
                    </button>
                ` : ''}
            </div>
        </div>
    `}).join('');

    container.innerHTML = html;
}

// Рендеринг списка магазинов
function renderStoresList() {
    const container = document.getElementById('stores-list');

    if (!allStores || allStores.length === 0) {
        container.innerHTML = `<div class="empty">🏪 ${t('products.noRecipientsFound')}</div>`;
        return;
    }

    const html = allStores.map(store => {
        const name = escapeHtml(store.name);
        const storeType = store.store_type ? escapeHtml(store.store_type) : t('products.supermarket');
        const ruc = store.ruc ? escapeHtml(store.ruc) : '';
        const address = store.address ? escapeHtml(store.address) : '';

        return `
        <div class="category-card">
            <div class="category-header">
                <div class="category-name">${name}</div>
                <div class="product-category" style="background: var(--tg-theme-button-color, #3390ec);">${storeType}</div>
            </div>
            ${ruc ? `<div class="category-description">📄 RUC: ${ruc}</div>` : ''}
            ${address ? `<div class="category-description">📍 ${address}</div>` : ''}
        </div>
    `}).join('');

    container.innerHTML = html;
}

// Заполнение селектов категорий
function populateCategorySelects() {
    const mainCategories = allCategories.filter(c => !c.parent_id);

    const parentSelect = document.getElementById('new-category-parent');
    parentSelect.innerHTML = `<option value="">${t('products.noParent')}</option>` +
        mainCategories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');

    const editParentSelect = document.getElementById('edit-category-parent');
    editParentSelect.innerHTML = `<option value="">${t('products.noParent')}</option>` +
        mainCategories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');

    const productCategorySelect = document.getElementById('new-product-category');
    productCategorySelect.innerHTML = `<option value="">${t('products.uncategorized')}</option>` +
        allCategories.map(cat => `
            <option value="${cat.id}">
                ${cat.parent_name ? '  ↳ ' : ''}${escapeHtml(cat.name)}
            </option>
        `).join('');

    const editSelect = document.getElementById('edit-product-category');
    editSelect.innerHTML = `<option value="">${t('products.uncategorized')}</option>` +
        allCategories.map(cat => `
            <option value="${cat.id}">
                ${cat.parent_name ? '  ↳ ' : ''}${escapeHtml(cat.name)}
            </option>
        `).join('');
}

// Заполнение селекта получателей
function populateStoreSelect() {
    const select = document.getElementById('store-select');
    select.innerHTML = `<option value="">-- ${t('products.selectRecipient')} --</option>` +
        allStores.map(store => `<option value="${store.id}">${escapeHtml(store.name)}</option>`).join('');
}

console.log('✅ products-render.js загружен');