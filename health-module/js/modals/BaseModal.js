// js/modals/BaseModal.js
const BaseModal = (function() {

    function getModalContainer() {
        let container = document.getElementById('health-modals');
        if (!container) {
            container = document.createElement('div');
            container.id = 'health-modals';
            document.body.appendChild(container);
        }
        return container;
    }

    function show(modalHtml) {
        const container = getModalContainer();
        container.innerHTML = modalHtml;
    }

    function close() {
        const container = document.getElementById('health-modals');
        if (container) {
            container.innerHTML = '';
        }
    }

    function createModalStructure(title, content, size = 'normal') {
        return `
            <div class="modal-overlay" onclick="BaseModal.close()">
                <div class="modal-content modal-${size}" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="BaseModal.close()">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }

    // Публичный API
    return {
        show,
        close,
        createModalStructure,
        getModalContainer
    };
})();

// Экспорт
if (typeof window !== 'undefined') {
    window.BaseModal = BaseModal;
}