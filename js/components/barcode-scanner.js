/**
 * BarcodeScanner - Переиспользуемый компонент для сканирования штрих-кодов
 * Использует библиотеку Quagga.js для распознавания штрих-кодов через камеру
 *
 * Требования:
 * - Quagga.js библиотека должна быть подключена на странице
 * - CSS файл barcode-scanner.css должен быть подключен
 *
 * Использование:
 * const scanner = new BarcodeScanner({
 *     onScan: (barcode) => console.log('Отсканирован:', barcode),
 *     onClose: () => console.log('Сканер закрыт')
 * });
 * scanner.open();
 */
class BarcodeScanner {
    constructor(options = {}) {
        this.options = {
            onScan: options.onScan || ((barcode) => console.log('Scanned:', barcode)),
            onClose: options.onClose || (() => {}),
            onError: options.onError || ((error) => console.error('Scanner error:', error)),
            // Настройки Quagga
            minDetections: options.minDetections || 3, // Минимум обнаружений для подтверждения
            scanFrequency: options.scanFrequency || 10, // Частота сканирования (раз в секунду)
            readers: options.readers || [
                "ean_reader",       // EAN-13, EAN-8
                "ean_8_reader",     // EAN-8 специально
                "code_128_reader",  // CODE-128
                "code_39_reader",   // CODE-39
                "upc_reader",       // UPC-A, UPC-E
                "upc_e_reader"      // UPC-E специально
            ]
        };

        this.isQuaggaRunning = false;
        this.lastScannedCode = '';
        this.detectionCount = {};
        this.modalElement = null;
        this.tg = window.Telegram?.WebApp;
    }

    /**
     * Создает HTML разметку модального окна сканера
     */
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'barcode-scanner-modal';
        modal.id = 'barcode-scanner-modal';
        modal.innerHTML = `
            <div class="barcode-scanner-header">
                <h3 data-i18n="expense.scanner">Сканер штрих-кода</h3>
                <button class="barcode-scanner-close" aria-label="Закрыть">✕</button>
            </div>

            <div class="barcode-scanner-body">
                <!-- Контейнер для Quagga.js -->
                <div id="barcode-scanner-video-container"></div>

                <!-- Визуальная подсказка -->
                <div class="barcode-scanner-guide">
                    <div class="barcode-scanner-frame-guide"></div>
                    <div class="barcode-scanner-hint-text" data-i18n="expense.aimAtBarcode">Наведите на штрих-код</div>
                </div>
            </div>

            <div class="barcode-scanner-bottom">
                <div class="barcode-scanner-result" id="barcode-scanner-result">
                    <div data-i18n="expense.codeFound">Найден код:</div>
                    <div class="barcode-scanner-result-code" id="barcode-scanned-code">-</div>
                </div>

                <div class="barcode-scanner-buttons" id="barcode-scanner-buttons-found" style="display: none;">
                    <button class="barcode-scanner-btn secondary" data-i18n="expense.tryAgain">Ещё раз</button>
                    <button class="barcode-scanner-btn primary" data-i18n="expense.use">Использовать</button>
                </div>

                <div class="barcode-scanner-buttons" id="barcode-scanner-buttons-default">
                    <button class="barcode-scanner-btn secondary" data-i18n="common.cancel">Отмена</button>
                </div>

                <div class="barcode-scanner-manual">
                    <input type="text" id="barcode-manual-input"
                           data-i18n-target="placeholder" data-i18n="expense.orEnterManually"
                           placeholder="Или введите вручную..."
                           inputmode="numeric">
                    <button>OK</button>
                </div>

                <div class="barcode-scanner-status" id="barcode-scanner-status" data-i18n="expense.initializing">Инициализация...</div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalElement = modal;

        // Привязываем обработчики событий
        this.bindEvents();

        return modal;
    }

    /**
     * Привязывает обработчики событий к элементам модального окна
     */
    bindEvents() {
        const closeBtn = this.modalElement.querySelector('.barcode-scanner-close');
        const cancelBtn = this.modalElement.querySelector('#barcode-scanner-buttons-default .secondary');
        const rescanBtn = this.modalElement.querySelector('#barcode-scanner-buttons-found .secondary');
        const useBtn = this.modalElement.querySelector('#barcode-scanner-buttons-found .primary');
        const manualInput = this.modalElement.querySelector('#barcode-manual-input');
        const manualOkBtn = this.modalElement.querySelector('.barcode-scanner-manual button');

        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        rescanBtn.addEventListener('click', () => this.rescan());
        useBtn.addEventListener('click', () => this.useScannedBarcode());
        manualOkBtn.addEventListener('click', () => this.useManualBarcode());

        // Enter на ручном вводе
        manualInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.useManualBarcode();
        });
    }

    /**
     * Открывает модальное окно сканера и запускает камеру
     */
    async open() {
        if (!this.modalElement) {
            this.createModal();
        }

        this.modalElement.classList.add('active');
        this.resetUI();

        if (this.tg) {
            this.tg.HapticFeedback.impactOccurred('medium');
        }

        await this.startCamera();
    }

    /**
     * Закрывает модальное окно и останавливает камеру
     */
    close() {
        this.stopCamera();
        if (this.modalElement) {
            this.modalElement.classList.remove('active');
        }
        this.lastScannedCode = '';

        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    /**
     * Сбрасывает UI к начальному состоянию
     */
    resetUI() {
        const result = this.modalElement.querySelector('#barcode-scanner-result');
        const buttonsFound = this.modalElement.querySelector('#barcode-scanner-buttons-found');
        const buttonsDefault = this.modalElement.querySelector('#barcode-scanner-buttons-default');
        const manualInput = this.modalElement.querySelector('#barcode-manual-input');
        const status = this.modalElement.querySelector('#barcode-scanner-status');

        result.classList.remove('active');
        buttonsFound.style.display = 'none';
        buttonsDefault.style.display = 'flex';
        manualInput.value = '';
        status.textContent = 'Запуск камеры...';
    }

    /**
     * Запускает камеру и инициализирует Quagga
     */
    async startCamera() {
        const status = this.modalElement.querySelector('#barcode-scanner-status');

        try {
            status.textContent = 'Инициализация камеры...';
            console.log('🔍 Запуск Quagga сканера...');

            // Сбрасываем счётчик обнаружений
            this.detectionCount = {};

            // Конфигурация Quagga
            const config = {
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: this.modalElement.querySelector('#barcode-scanner-video-container'),
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
                    readers: this.options.readers,
                    debug: {
                        drawBoundingBox: true,
                        showFrequency: false,
                        drawScanline: true,
                        showPattern: false
                    },
                    multiple: false  // Ищем только один код за раз
                },
                locate: true,  // Автопоиск штрих-кода в кадре
                frequency: this.options.scanFrequency
            };

            // Инициализируем Quagga
            await new Promise((resolve, reject) => {
                if (typeof Quagga === 'undefined') {
                    reject(new Error('Quagga.js не загружен. Подключите библиотеку на странице.'));
                    return;
                }

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
            this.isQuaggaRunning = true;

            // Обработчик обнаружения
            Quagga.onDetected((result) => {
                if (!this.isQuaggaRunning) return;

                const code = result.codeResult.code;

                // Фильтрация: требуем минимум N успешных обнаружений одного кода
                if (!this.detectionCount[code]) {
                    this.detectionCount[code] = 1;
                } else {
                    this.detectionCount[code]++;
                }

                console.log(`📊 Обнаружение ${code}: ${this.detectionCount[code]} раз`);

                // Подтверждённый код
                if (this.detectionCount[code] >= this.options.minDetections) {
                    console.log('✅ Код подтверждён:', code);
                    this.onBarcodeDetected(code);
                }
            });

            status.textContent = 'Камера готова. Наведите на штрих-код...';
            console.log('✅ Quagga запущен');

            // Индикация попыток
            let scanAttempts = 0;
            this.statusInterval = setInterval(() => {
                if (!this.isQuaggaRunning) {
                    clearInterval(this.statusInterval);
                    return;
                }
                scanAttempts++;
                const totalDetections = Object.values(this.detectionCount).reduce((a, b) => a + b, 0);
                status.textContent = `Сканирование... (попытка ${scanAttempts}, найдено: ${totalDetections})`;
            }, 2000);

        } catch (err) {
            status.textContent = 'Ошибка доступа к камере';
            console.error('❌ Camera error:', err);

            // Детальные сообщения об ошибках
            const errMsg = err.toString().toLowerCase();
            let userMessage = 'Ошибка камеры. Используйте ручной ввод.';

            if (errMsg.includes('notallowed') || errMsg.includes('permission')) {
                userMessage = 'Разрешите доступ к камере в настройках браузера';
            } else if (errMsg.includes('notfound') || errMsg.includes('device')) {
                userMessage = 'Камера не найдена на устройстве';
            }

            if (this.tg && this.tg.showAlert) {
                this.tg.showAlert(userMessage);
            } else {
                alert(userMessage);
            }

            if (this.options.onError) {
                this.options.onError(err);
            }
        }
    }

    /**
     * Останавливает камеру и Quagga
     */
    stopCamera() {
        if (this.isQuaggaRunning && typeof Quagga !== 'undefined') {
            Quagga.stop();
            this.isQuaggaRunning = false;
            console.log('🛑 Quagga остановлен');
        }

        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }

        this.detectionCount = {};
    }

    /**
     * Обработчик обнаружения штрих-кода
     */
    onBarcodeDetected(code) {
        if (!code) {
            console.warn('⚠️ onBarcodeDetected: код пустой');
            return;
        }

        if (code === this.lastScannedCode) {
            console.log('⚠️ onBarcodeDetected: код уже обработан');
            return;
        }

        console.log('✅ Штрих-код подтверждён:', code);
        this.lastScannedCode = code;

        // Останавливаем сканирование
        this.stopCamera();

        // Вибрация и звук успеха
        if (this.tg) {
            this.tg.HapticFeedback.notificationOccurred('success');
        }

        // Отображаем результат
        const scannedCodeEl = this.modalElement.querySelector('#barcode-scanned-code');
        const result = this.modalElement.querySelector('#barcode-scanner-result');
        const buttonsFound = this.modalElement.querySelector('#barcode-scanner-buttons-found');
        const buttonsDefault = this.modalElement.querySelector('#barcode-scanner-buttons-default');
        const status = this.modalElement.querySelector('#barcode-scanner-status');

        scannedCodeEl.textContent = code;
        result.classList.add('active');
        buttonsFound.style.display = 'flex';
        buttonsDefault.style.display = 'none';
        status.textContent = '✅ Код успешно считан!';
    }

    /**
     * Повторное сканирование
     */
    rescan() {
        this.lastScannedCode = '';
        this.resetUI();
        this.startCamera();
    }

    /**
     * Использовать отсканированный код
     */
    useScannedBarcode() {
        console.log('🔵 Использование отсканированного кода:', this.lastScannedCode);

        if (this.lastScannedCode) {
            if (this.options.onScan) {
                this.options.onScan(this.lastScannedCode);
            }
            this.close();
        } else {
            console.error('❌ lastScannedCode пуст!');
            const message = 'Код не найден. Попробуйте ещё раз.';

            if (this.tg && this.tg.showAlert) {
                this.tg.showAlert(message);
            } else {
                alert(message);
            }
        }
    }

    /**
     * Использовать код, введённый вручную
     */
    useManualBarcode() {
        const manualInput = this.modalElement.querySelector('#barcode-manual-input');
        const code = manualInput.value.trim();

        if (code) {
            if (this.options.onScan) {
                this.options.onScan(code);
            }
            this.close();
        } else {
            const message = 'Введите код';

            if (this.tg && this.tg.showAlert) {
                this.tg.showAlert(message);
            } else {
                alert(message);
            }
        }
    }

    /**
     * Уничтожает экземпляр сканера
     */
    destroy() {
        this.stopCamera();
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
        }
        this.modalElement = null;
    }
}

// Экспортируем для использования в других модулях
if (typeof window !== 'undefined') {
    window.BarcodeScanner = BarcodeScanner;
}
