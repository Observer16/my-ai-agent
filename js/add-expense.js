const tg = window.Telegram.WebApp;
tg.expand();
tg.BackButton.show();
tg.BackButton.onClick(() => window.history.back());

let stores = [];
let allProducts = [];
let allCategories = []; // Перенесено вверх
let isWeightMode = false;
let currentUnit = 'unidad';
let searchMode = 'name';
let selectedProductHasBarcode = true;

// Переменные сканера (Quagga.js)
let isQuaggaRunning = false;
let lastScannedCode = '';
let scannerTarget = 'search';
let detectionCount = {}; // Счётчик для фильтрации ложных срабатываний

const storeTypeColors = {
    'Супермаркет': { bg: '#10b981', text: 'white' },    // Зелёный
    'Магазин': { bg: '#8b5cf6', text: 'white' },        // Фиолетовый
    'Аптека': { bg: '#ef4444', text: 'white' },         // Красный
    'Транспорт': { bg: '#3b82f6', text: 'white' },      // Синий
    'Разное': { bg: '#6b7280', text: 'white' },         // Серый
    'Ресторан': { bg: '#f59e0b', text: 'white' },       // Оранжевый
    'Заправка': { bg: '#6366f1', text: 'white' },       // Индиго
    'Кафе': { bg: '#f97316', text: 'white' },           // Тёмно-оранжевый
    'Клиника': { bg: '#ec4899', text: 'white' },        // Розовый
    'Для дома': { bg: '#a855f7', text: 'white' },       // Пурпурный
    'Фитнес': { bg: '#14b8a6', text: 'white' },         // Бирюзовый
    'Электроника': { bg: '#06b6d4', text: 'white' },    // Голубой
    'Одежда': { bg: '#d946ef', text: 'white' }          // Маджента
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function init() {
    try {
        stores = await API.getStores();
        renderStoreList();
        document.getElementById('purchase-date').valueAsDate = new Date();
        allProducts = await API.getProducts(null, null, 1000);

        // Загружаем категории
        allCategories = await API.getCategories();
        console.log('✅ Категории загружены:', allCategories.length);

        tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error('Ошибка инициализации:', e);
    }
}

// ==================== ПОИСК ТОВАРОВ ====================
function switchSearchMode(mode, eventElement) {
    searchMode = mode;
    document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
    eventElement.classList.add('active');
    document.getElementById('search-by-name').style.display = mode === 'name' ? 'block' : 'none';
    document.getElementById('search-by-barcode').style.display = mode === 'barcode' ? 'block' : 'none';
    document.getElementById('product-results').classList.remove('active');
}

let searchTimeout;
async function searchProducts(query) {
    clearTimeout(searchTimeout);
    if (query.length < 2) {
        document.getElementById('product-results').classList.remove('active');
        return;
    }
    searchTimeout = setTimeout(async () => {
        const products = await API.getProducts(null, query, 20);
        renderProductResults(products);
    }, 300);
}

async function searchByBarcode(barcode) {
    if (barcode.length < 4) {
        document.getElementById('product-results').classList.remove('active');
        return;
    }
    const localFound = allProducts.filter(p => p.barcode && (p.barcode.includes(barcode) || barcode.includes(p.barcode)));
    if (localFound.length > 0) {
        renderProductResults(localFound, barcode);
        return;
    }
    try {
        const serverProduct = await API.getProductByBarcode(barcode);
        allProducts.push(serverProduct);
        renderProductResults([serverProduct], barcode);
    } catch (error) {
        const container = document.getElementById('product-results');
        const escapedBarcode = escapeHtml(barcode);
        container.innerHTML = `
            <div class="not-found-msg">
                <div>Товар со штрих-кодом</div>
                <div class="barcode-value">${escapedBarcode}</div>
                <div>не найден</div>
                <div style="margin-top: 10px;">
                    <a href="#" onclick="showCreateProductWithBarcode('${escapedBarcode}')" style="color: var(--tg-theme-button-color, #3390ec);">
                        + Создать новый товар
                    </a>
                </div>
            </div>`;
        container.classList.add('active');
    }
}

function renderProductResults(products, searchedBarcode = null) {
    const container = document.getElementById('product-results');
    if (!products?.length) {
        container.innerHTML = '<div class="search-item">Не найдено</div>';
        container.classList.add('active');
        return;
    }

    container.innerHTML = products.map(p => {
        const escapedName = escapeHtml(p.name);
        const escapedCategory = escapeHtml(p.category_name || 'Без категории');
        const escapedBarcode = p.barcode ? escapeHtml(p.barcode) : '';

        return `
            <div class="search-item" onclick="selectProduct('${p.id}','${escapedName.replace(/'/g, "\\'")}','${escapedBarcode}','${p.unit || 'unidad'}')">
                <div class="search-item-name">${escapedName}</div>
                <div class="search-item-info">${escapedCategory}${p.min_price ? ` • ${p.min_price}-${p.max_price} ₲` : ''}</div>
                ${escapedBarcode ? `<div class="search-item-barcode">${escapedBarcode}</div>` : ''}
            </div>
        `;
    }).join('');

    container.classList.add('active');
}

function selectProduct(id, name, barcode, unit) {
    document.getElementById('selected-product-id').value = id;
    document.getElementById('selected-product-name').value = name;
    document.getElementById('selected-product-barcode').value = barcode || '';
    document.getElementById('product-search').value = name;
    document.getElementById('barcode-search').value = barcode || '';
    document.getElementById('product-results').classList.remove('active');
    document.getElementById('selected-product-display-name').textContent = name;
    document.getElementById('selected-product-display-details').textContent = barcode ? `Штрих-код: ${barcode}` : 'Без штрих-кода';
    document.getElementById('selected-product-info').classList.add('active');
    selectedProductHasBarcode = !!barcode;
    document.getElementById('add-barcode-field').classList.toggle('active', !selectedProductHasBarcode);
    if (unit && unit !== 'unidad') setWeightMode(true, unit);
    updateSummary();
    tg.HapticFeedback.impactOccurred('light');
}

function clearSelectedProduct() {
    ['selected-product-id','selected-product-name','selected-product-barcode','product-search','barcode-search'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('selected-product-info').classList.remove('active');
    document.getElementById('add-barcode-field').classList.remove('active');
    updateSummary();
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== СКАНЕР (ZXing) ====================
function openScanner() {
    scannerTarget = 'search';
    showScannerModal();
}

function openScannerForNewBarcode() {
    scannerTarget = 'newBarcode';
    showScannerModal();
}

async function showScannerModal() {
    const modal = document.getElementById('scanner-modal');
    modal.classList.add('active');
    document.getElementById('scanner-result').classList.remove('active');
    document.getElementById('scanner-buttons-found').style.display = 'none';
    document.getElementById('scanner-buttons-default').style.display = 'flex';
    document.getElementById('manual-barcode').value = '';
    document.getElementById('scanner-status').textContent = 'Запуск камеры...';
    tg.HapticFeedback.impactOccurred('medium');
    await startCamera();
}

async function startCamera() {
    const status = document.getElementById('scanner-status');

    try {
        status.textContent = 'Инициализация камеры...';
        console.log('🔍 Запуск Quagga сканера...');

        // Сбрасываем счётчик обнаружений
        detectionCount = {};

        // Конфигурация Quagga
        const config = {
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.getElementById('scanner-video-container'),
                constraints: {
                    facingMode: "environment", // Задняя камера
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 }
                },
                area: { // Область сканирования (% от видео)
                    top: "30%",
                    right: "10%",
                    left: "10%",
                    bottom: "30%"
                }
            },
            decoder: {
                readers: [
                    "ean_reader",       // EAN-13, EAN-8
                    "ean_8_reader",     // EAN-8 специально
                    "code_128_reader",  // CODE-128
                    "code_39_reader",   // CODE-39
                    "upc_reader",       // UPC-A, UPC-E
                    "upc_e_reader"      // UPC-E специально
                ],
                debug: {
                    drawBoundingBox: true,
                    showFrequency: false,
                    drawScanline: true,
                    showPattern: false
                },
                multiple: false  // Ищем только один код за раз
            },
            locate: true,  // Автопоиск штрих-кода в кадре
            frequency: 10  // Частота сканирования (раз в секунду)
        };

        // Инициализируем Quagga
        await new Promise((resolve, reject) => {
            Quagga.init(config, (err) => {
                if (err) {
                    console.error('❌ Quagga init error:', err);
                    reject(err);
                    return;
                }
                resolve();
            });
        });

        // Запускаем сканирование
        Quagga.start();
        isQuaggaRunning = true;

        // Обработчик обнаружения
        Quagga.onDetected((result) => {
            if (!isQuaggaRunning) return;

            const code = result.codeResult.code;

            // Фильтрация: требуем минимум 3 успешных обнаружения одного кода
            if (!detectionCount[code]) {
                detectionCount[code] = 1;
            } else {
                detectionCount[code]++;
            }

            console.log(`📊 Обнаружение ${code}: ${detectionCount[code]} раз`);

            // Подтверждённый код (обнаружен 3+ раз)
            if (detectionCount[code] >= 3) {
                console.log('✅ Код подтверждён:', code);
                onBarcodeDetected(code);
            }
        });

        status.textContent = 'Камера готова. Наведите на штрих-код...';
        console.log('✅ Quagga запущен');

        // Индикация попыток
        let scanAttempts = 0;
        const statusInterval = setInterval(() => {
            if (!isQuaggaRunning) {
                clearInterval(statusInterval);
                return;
            }
            scanAttempts++;
            const totalDetections = Object.values(detectionCount).reduce((a, b) => a + b, 0);
            status.textContent = `Сканирование... (попытка ${scanAttempts}, найдено: ${totalDetections})`;
        }, 2000);

    } catch (err) {
        status.textContent = 'Ошибка доступа к камере';
        console.error('❌ Camera error:', err);

        // Детальные сообщения об ошибках
        const errMsg = err.toString().toLowerCase();
        if (errMsg.includes('notallowed') || errMsg.includes('permission')) {
            tg.showAlert('Разрешите доступ к камере в настройках браузера');
        } else if (errMsg.includes('notfound') || errMsg.includes('device')) {
            tg.showAlert('Камера не найдена на устройстве');
        } else {
            tg.showAlert('Ошибка камеры. Используйте ручной ввод.');
        }
    }
}

function onBarcodeDetected(code) {
    if (!code) {
        console.warn('⚠️ onBarcodeDetected: код пустой');
        return;
    }

    if (code === lastScannedCode) {
        console.log('⚠️ onBarcodeDetected: код уже обработан');
        return;
    }

    console.log('✅ Штрих-код подтверждён:', code);
    lastScannedCode = code;
    console.log('✅ Сохранён в lastScannedCode:', lastScannedCode);

    // Останавливаем сканирование
    stopCamera();

    // Вибрация и звук успеха
    tg.HapticFeedback.notificationOccurred('success');

    // Отображаем результат
    document.getElementById('scanned-code').textContent = code;
    document.getElementById('scanner-result').classList.add('active');
    document.getElementById('scanner-buttons-found').style.display = 'flex';
    document.getElementById('scanner-buttons-default').style.display = 'none';
    document.getElementById('scanner-status').textContent = '✅ Код успешно считан!';

    console.log('✅ UI обновлён, lastScannedCode сейчас:', lastScannedCode);
}

function stopCamera() {
    if (isQuaggaRunning) {
        Quagga.stop();
        isQuaggaRunning = false;
        console.log('🛑 Quagga остановлен');
    }
    // НЕ очищаем lastScannedCode здесь!
    // Код должен сохраниться для кнопки "Использовать"
    detectionCount = {};
}

function closeScanner() {
    stopCamera();
    document.getElementById('scanner-modal').classList.remove('active');
    // Очищаем код только при закрытии модального окна
    lastScannedCode = '';
}

function rescanBarcode() {
    lastScannedCode = '';
    document.getElementById('scanner-result').classList.remove('active');
    document.getElementById('scanner-buttons-found').style.display = 'none';
    document.getElementById('scanner-buttons-default').style.display = 'flex';
    startCamera();
}

function useScannedBarcode() {
    console.log('🔵 Нажата кнопка "Использовать"');
    console.log('🔵 lastScannedCode:', lastScannedCode);
    console.log('🔵 scannerTarget:', scannerTarget);

    if (lastScannedCode) {
        applyBarcode(lastScannedCode);
    } else {
        console.error('❌ lastScannedCode пуст!');
        tg.showAlert('Код не найден. Попробуйте ещё раз.');
    }
}

function useManualBarcode() {
    const code = document.getElementById('manual-barcode').value.trim();
    if (code) applyBarcode(code);
    else tg.showAlert('Введите код');
}

function applyBarcode(code) {
    console.log('🟢 applyBarcode вызван с кодом:', code);
    console.log('🟢 scannerTarget:', scannerTarget);

    if (scannerTarget === 'search') {
        console.log('🟢 Применяю код к полю barcode-search');
        document.getElementById('barcode-search').value = code;
        searchByBarcode(code);
    } else {
        console.log('🟢 Применяю код к полю new-barcode');
        document.getElementById('new-barcode').value = code;
    }

    console.log('🟢 Закрываю сканер');
    closeScanner();
}

// ==================== МАГАЗИНЫ ====================
function renderStoreList() {
    const container = document.getElementById('store-list');
    const grouped = {};

    stores.forEach(s => {
        const type = s.store_type || 'Магазин';
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(s);
    });

    let html = '';

    // Порядок отображения типов
    const typeOrder = ['Супермаркет', 'Магазин', 'Аптека', 'Для дома', 'Транспорт', 'Кафе', 'Заправка', 'Разное'];

    typeOrder.forEach(type => {
        if (!grouped[type]) return;

        // ✅ ЗАЩИТА: используем цвет по умолчанию
        const color = storeTypeColors[type] || { bg: '#6b7280', text: 'white' };

        grouped[type].forEach(store => {
            const escapedName = escapeHtml(store.name);
            const escapedType = escapeHtml(type);
            html += `<div class="store-list-item" onclick="selectStore('${store.id}', '${escapedName.replace(/'/g, "\\'")}', '${escapedType}')">
                <div class="store-type-indicator" style="background: ${color.bg}"></div>
                <span class="store-name">${escapedName}</span>
                <span class="store-type-badge" style="background: ${color.bg}; color: ${color.text}">${escapedType}</span>
            </div>`;
        });
    });

    // Добавляем остальные типы, которых нет в typeOrder
    Object.keys(grouped).forEach(type => {
        if (typeOrder.includes(type)) return;

        const color = storeTypeColors[type] || { bg: '#6b7280', text: 'white' };
        const escapedType = escapeHtml(type);

        grouped[type].forEach(store => {
            const escapedName = escapeHtml(store.name);
            html += `<div class="store-list-item" onclick="selectStore('${store.id}', '${escapedName.replace(/'/g, "\\'")}', '${escapedType}')">
                <div class="store-type-indicator" style="background: ${color.bg}"></div>
                <span class="store-name">${escapedName}</span>
                <span class="store-type-badge" style="background: ${color.bg}; color: ${color.text}">${escapedType}</span>
            </div>`;
        });
    });

    container.innerHTML = html;
}

function toggleStoreList() {
    document.getElementById('store-list').classList.toggle('active');
    tg.HapticFeedback.impactOccurred('light');
}

function selectStore(storeId, storeName, storeType) {
    document.getElementById('selected-store-id').value = storeId;

    // ✅ ЗАЩИТА: используем цвет по умолчанию, если тип не найден
    const color = storeTypeColors[storeType] || { bg: '#6b7280', text: 'white' };

    document.getElementById('store-display-text').innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:8px;">
            <span style="background:${color.bg};width:10px;height:10px;border-radius:50%;"></span>
            ${escapeHtml(storeName)}
        </span>
    `;

    document.getElementById('store-list').classList.remove('active');
    updateSummary();
}

// ==================== ВЕСОВОЙ ТОВАР ====================
function toggleWeightMode() {
    isWeightMode = !isWeightMode;
    setWeightMode(isWeightMode);
}

function setWeightMode(enabled, unit = 'kg') {
    isWeightMode = enabled;
    document.getElementById('weight-toggle').classList.toggle('active', enabled);
    document.getElementById('unit-selector-group').style.display = enabled ? 'block' : 'none';

    const q = document.getElementById('quantity');
    q.step = enabled ? '0.001' : '1';
    q.value = enabled ? '1.000' : '1';

    // Переключаем между "Цена за ед." и "Общая сумма"
    document.getElementById('unit-price-group').style.display = enabled ? 'none' : 'block';
    document.getElementById('total-price-group').style.display = enabled ? 'block' : 'none';

    // Обновляем лейблы
    document.getElementById('quantity-label').textContent = enabled ? 'Вес / Объём *' : 'Количество *';
    document.getElementById('price-label').textContent = enabled ? 'Цена за кг/л *' : 'Цена за ед. *';

    currentUnit = enabled ? unit : 'unidad';

    if (enabled) {
        // Активируем нужную единицу измерения
        document.querySelectorAll('.unit-btn').forEach(b => {
            b.classList.remove('active');
            if ((unit==='kg'&&b.textContent==='кг')||(unit==='g'&&b.textContent==='грамм')||(unit==='l'&&b.textContent==='литр')||(unit==='ml'&&b.textContent==='мл')) {
                b.classList.add('active');
            }
        });

        // Очищаем поля цен
        document.getElementById('unit-price').value = '';
        document.getElementById('total-price').value = '';
    } else {
        // Очищаем поле общей суммы
        document.getElementById('total-price').value = '';
    }

    updateSummary();
}

function selectUnit(unit, el) {
    document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    currentUnit = unit;
    updateSummary();
}

// ==================== ПЕРЕСЧЁТ ЦЕН ====================
// Обновление при изменении цены за единицу (обычный режим)
function updatePriceFromUnit() {
    if (!isWeightMode) {
        updateSummary();
    }
}

// Обновление при изменении общей суммы (весовой товар)
function updatePriceFromTotal() {
    if (isWeightMode) {
        const totalPrice = parseFloat(document.getElementById('total-price').value) || 0;
        const qty = parseFloat(document.getElementById('quantity').value) || 0;

        if (qty > 0 && totalPrice > 0) {
            // Вычисляем цену за единицу
            const unitPrice = totalPrice / qty;
            document.getElementById('unit-price').value = unitPrice.toFixed(2);
        }

        updateSummary();
    }
}

// ==================== ИТОГО ====================
function updateSummary() {
    const store = stores.find(s => s.id === document.getElementById('selected-store-id').value);
    const name = document.getElementById('selected-product-name').value;
    const qty = parseFloat(document.getElementById('quantity').value) || 0;

    let price, totalAmount;

    if (isWeightMode) {
        // Для весовых товаров берём общую сумму
        totalAmount = parseFloat(document.getElementById('total-price').value) || 0;

        // Вычисляем цену за единицу для сохранения в БД
        if (qty > 0 && totalAmount > 0) {
            price = totalAmount / qty;
        } else {
            price = 0;
        }
    } else {
        // Для обычных товаров - стандартный расчёт
        price = parseFloat(document.getElementById('unit-price').value) || 0;
        totalAmount = qty * price;
    }

    document.getElementById('summary-store').textContent = store?.name || '-';
    document.getElementById('summary-product').textContent = name || '-';

    const units = {kg:'кг',g:'г',l:'л',ml:'мл'};
    document.getElementById('summary-quantity').textContent = qty > 0 ?
        (isWeightMode ? `${qty.toFixed(3)} ${units[currentUnit]||currentUnit}` : `${qty} шт.`) : '-';

    document.getElementById('summary-total').textContent = totalAmount > 0 ?
        `${Math.round(totalAmount).toLocaleString('ru-RU')} ₲` : '0 ₲';
}

// ==================== СОЗДАНИЕ ТОВАРА ====================
function showCreateProduct(e) {
    if (e) e.preventDefault();

    // Формируем опции категорий
    const categoryOptions = allCategories
        .map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`)
        .join('');

    const modalHtml = `
        <div id="create-product-name-modal" class="simple-modal" onclick="handleModalBackdropClick(event, 'create-product-name-modal')">
            <div class="simple-modal-content" onclick="event.stopPropagation()">
                <h3>Новый товар</h3>
                <input type="text" id="new-product-name-input"
                       placeholder="Название товара"
                       class="simple-modal-input">

                <!-- ✅ НОВОЕ: Выбор категории -->
                <select id="new-product-category-input" class="simple-modal-input" style="margin-top: 10px;">
                    <option value="">Без категории</option>
                    ${categoryOptions}
                </select>

                <div class="simple-modal-buttons">
                    <button onclick="createProductFromModal()">Создать</button>
                    <button onclick="closeSimpleModal('create-product-name-modal')" class="secondary">Отмена</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Фокус на поле ввода
    setTimeout(() => {
        const input = document.getElementById('new-product-name-input');
        if (input) input.focus();
    }, 100);

    tg.HapticFeedback.impactOccurred('light');
}

function showCreateProductWithBarcode(barcode) {
    // Формируем опции категорий
    const categoryOptions = allCategories
        .map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`)
        .join('');

    const modalHtml = `
        <div id="create-product-barcode-modal" class="simple-modal">
            <div class="simple-modal-content">
                <h3>Новый товар</h3>
                <p class="simple-modal-text">Штрих-код: <strong>${escapeHtml(barcode)}</strong></p>
                <input type="text" id="new-product-barcode-input"
                       placeholder="Название товара"
                       class="simple-modal-input">

                <!-- ✅ НОВОЕ: Выбор категории -->
                <select id="new-product-barcode-category-input" class="simple-modal-input" style="margin-top: 10px;">
                    <option value="">Без категории</option>
                    ${categoryOptions}
                </select>

                <div class="simple-modal-buttons">
                    <button onclick="createProductWithBarcodeFromModal('${escapeHtml(barcode)}')">Создать</button>
                    <button onclick="closeSimpleModal('create-product-barcode-modal')" class="secondary">Отмена</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    setTimeout(() => {
        const input = document.getElementById('new-product-barcode-input');
        if (input) input.focus();
    }, 100);

    tg.HapticFeedback.impactOccurred('light');
}

function createProductFromModal() {
    const input = document.getElementById('new-product-name-input');
    const categorySelect = document.getElementById('new-product-category-input');

    if (input && input.value.trim()) {
        const name = input.value.trim();
        const categoryId = categorySelect?.value || null;
        closeSimpleModal('create-product-name-modal');
        createProduct(name, null, categoryId);
    } else {
        tg.showAlert('Введите название товара');
    }
}

function createProductWithBarcodeFromModal(barcode) {
    const input = document.getElementById('new-product-barcode-input');
    const categorySelect = document.getElementById('new-product-barcode-category-input');

    if (input && input.value.trim()) {
        const name = input.value.trim();
        const categoryId = categorySelect?.value || null;
        closeSimpleModal('create-product-barcode-modal');
        createProduct(name, barcode, categoryId);
    } else {
        tg.showAlert('Введите название товара');
    }
}

async function createProduct(name, barcode = null, categoryId = null) {
    try {
        const bc = barcode || document.getElementById('barcode-search').value || null;

        // ✅ ОБНОВЛЕНО: Добавлен category_id
        const productData = {
            name: name,
            category_id: categoryId ? parseInt(categoryId) : null,
            brand: null,
            unit: isWeightMode ? currentUnit : 'unidad',
            barcode: bc
        };

        console.log('📦 Создаём товар:', productData);

        const r = await API.createProduct(productData);

        // Добавляем в локальный кэш с информацией о категории
        const category = allCategories.find(c => c.id == categoryId);
        allProducts.push({
            id: r.product_id,
            name: name,
            barcode: bc,
            unit: isWeightMode ? currentUnit : 'unidad',
            category_id: categoryId,
            category_name: category ? category.name : null
        });

        selectProduct(r.product_id, name, bc, isWeightMode ? currentUnit : 'unidad');

        tg.showAlert(`✅ Товар "${name}" создан${category ? ' в категории "' + category.name + '"' : ''}`);

        tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error('❌ Ошибка создания товара:', e);
        tg.showAlert('Ошибка создания товара: ' + e.message);
    }
}

// ==================== СОЗДАНИЕ МАГАЗИНА ====================
function showCreateStore(e) {
    if (e) e.preventDefault();

    const modalHtml = `
        <div id="create-store-type-modal" class="simple-modal" onclick="handleModalBackdropClick(event, 'create-store-type-modal')">
            <div class="simple-modal-content" onclick="event.stopPropagation()">
                <h3>Тип магазина</h3>
                <p>Выберите тип:</p>
                <div class="simple-modal-buttons">
                    <button onclick="selectStoreType('Супермаркет')">🛒 Супермаркет</button>
                    <button onclick="selectStoreType('Магазин')">🏪 Магазин</button>
                    <button onclick="selectStoreType('Аптека')">💊 Аптека</button>
                    <button onclick="selectStoreType('Транспорт')">🚗 Транспорт</button>
                    <button onclick="selectStoreType('Разное')">🏬 Разное</button>
                    <button onclick="selectStoreType('Для дома')">🏠 Для дома</button>
                    <button onclick="closeSimpleModal('create-store-type-modal')" class="secondary">❌ Отмена</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    tg.HapticFeedback.impactOccurred('light');
}

function selectStoreType(type) {
    closeSimpleModal('create-store-type-modal');

    const modalHtml = `
        <div id="create-store-name-modal" class="simple-modal" onclick="handleModalBackdropClick(event, 'create-store-name-modal')">
            <div class="simple-modal-content" onclick="event.stopPropagation()">
                <h3>Новый ${escapeHtml(type.toLowerCase())}</h3>
                <p>Введите название магазина:</p>
                <input type="text" id="new-store-name-input"
                       placeholder="Например: ${escapeHtml(type)} у дома"
                       class="simple-modal-input">
                <div class="simple-modal-buttons">
                    <button onclick="createStoreFromModal('${escapeHtml(type)}')">Создать</button>
                    <button onclick="closeSimpleModal('create-store-name-modal')" class="secondary">Отмена</button>
                </div>
            </div>
        </div>
    `;

    // Задержка перед показом следующего окна
    setTimeout(() => {
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Фокус на поле ввода
        setTimeout(() => {
            const input = document.getElementById('new-store-name-input');
            if (input) input.focus();
        }, 100);
    }, 100);
}

function createStoreFromModal(type) {
    const input = document.getElementById('new-store-name-input');
    if (input && input.value.trim()) {
        const name = input.value.trim();
        closeSimpleModal('create-store-name-modal');
        createStore(name, type);
    } else {
        tg.showAlert('Введите название магазина');
    }
}

async function createStore(name, type) {
    try {
        // Используем правильный формат
        const storeData = {
            name: name,
            store_type: type
        };

        console.log('🏪 Создаём магазин:', storeData);

        const r = await API.createStore(storeData);

        // Обновляем список магазинов
        stores = await API.getStores();
        renderStoreList();

        // Автоматически выбираем созданный магазин
        selectStore(r.store_id, name, type);

        tg.showAlert(`✅ Магазин "${name}" создан`);

        tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error('❌ Ошибка создания магазина:', e);
        tg.showAlert('Ошибка: ' + e.message);
    }
}

// ==================== ОБРАБОТЧИКИ МОДАЛЬНЫХ ОКОН ====================
function handleModalBackdropClick(event, modalId) {
    // Закрываем только если клик был именно на фон, а не на content
    if (event.target.classList.contains('simple-modal')) {
        closeSimpleModal(modalId);
    }
}

function closeSimpleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Добавляем класс для анимации fade-out
        modal.style.opacity = '0';
        const content = modal.querySelector('.simple-modal-content');
        if (content) {
            content.style.transform = 'translateY(20px)';
        }

        // Удаляем модальное окно после анимации
        setTimeout(() => {
            if (document.getElementById(modalId)) {
                modal.remove();
            }
        }, 200);
    }
}

// ==================== СОХРАНЕНИЕ ====================
async function saveExpense() {
    const storeId = document.getElementById('selected-store-id').value;
    const productId = document.getElementById('selected-product-id').value;
    const qty = parseFloat(document.getElementById('quantity').value);
    const dateInput = document.getElementById('purchase-date').value;
    const newBc = document.getElementById('new-barcode').value;

    // Вычисляем цену за единицу
    let unitPrice;
    if (isWeightMode) {
        const totalPrice = parseFloat(document.getElementById('total-price').value);
        if (!totalPrice || totalPrice <= 0) {
            tg.showAlert('Введите общую сумму');
            return;
        }
        // Вычисляем цену за единицу для сохранения в БД
        unitPrice = totalPrice / qty;
    } else {
        unitPrice = parseFloat(document.getElementById('unit-price').value);
        if (!unitPrice || unitPrice <= 0) {
            tg.showAlert('Введите цену');
            return;
        }
    }

    if (!storeId) { tg.showAlert('Выберите магазин'); return; }
    if (!productId) { tg.showAlert('Выберите товар'); return; }
    if (!qty || qty <= 0) {
        tg.showAlert(isWeightMode ? 'Введите вес/объём' : 'Введите количество');
        return;
    }

    try {
        tg.MainButton.showProgress();

        // Обновляем штрих-код если нужно
        if (!selectedProductHasBarcode && newBc?.trim()) {
            try {
                await API.updateProductBarcode(productId, newBc.trim());
            } catch(e) {
                console.warn('Не удалось обновить штрих-код:', e);
            }
        }

        // ✅ ПРАВИЛЬНАЯ ОБРАБОТКА ДАТЫ С ТАЙМЗОНОЙ
        let purchaseDate = null;

        if (dateInput) {
            // Создаём дату в локальной таймзоне пользователя
            // dateInput.value формата "2025-12-02"
            const localDate = new Date(dateInput + 'T00:00:00');

            // Получаем смещение таймзоны в минутах
            const timezoneOffset = -localDate.getTimezoneOffset();
            const offsetHours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
            const offsetMins = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');
            const sign = timezoneOffset >= 0 ? '+' : '-';

            // Формируем ISO 8601 с локальной таймзоной
            // Например: "2025-12-02T00:00:00-03:00"
            purchaseDate = `${dateInput}T00:00:00${sign}${offsetHours}:${offsetMins}`;

            console.log('📅 Дата для отправки:', purchaseDate);
        }

        // Сохраняем расход с вычисленной ценой за единицу
        await API.createExpense(storeId, productId, qty, unitPrice, purchaseDate);

        tg.MainButton.hideProgress();
        tg.showPopup({
            title:'✅',
            message:'Расход добавлен',
            buttons:[{type:'ok'}]
        }, () => window.location.href = '../index.html');

    } catch (e) {
        tg.MainButton.hideProgress();
        console.error('❌ Ошибка сохранения расхода:', e);
        tg.showAlert('Ошибка: '+e.message);
    }
}

// ==================== ОБРАБОТЧИК СОБЫТИЙ ====================
document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.custom-select-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('store-list').classList.remove('active');
    }
});

// ==================== ЗАПУСК ====================
init();
tg.MainButton.setText('💾 Сохранить расход');
tg.MainButton.show();
tg.MainButton.onClick(saveExpense);