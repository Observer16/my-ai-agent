        const tg = window.Telegram.WebApp;
        let currentFamily = null;
        let familyMembers = [];
        let pendingInvites = [];
        let isCreator = false;
        let totalMembers = 0;

        // Инициализация
        document.addEventListener('DOMContentLoaded', async () => {
            // Инициализация Telegram Web App
            tg.expand();

            // Инициализация кнопки "Назад"
            if (tg && tg.BackButton) {
                tg.BackButton.show();
                tg.BackButton.onClick(() => {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        tg.close();
                    }
                });
            }

            await loadFamilyData();

            // Счетчик символов для сообщения
            const messageInput = document.getElementById('invite-message');
            if (messageInput) {
                messageInput.addEventListener('input', () => {
                    document.getElementById('message-chars').textContent = messageInput.value.length;
                });
            }
        });

        // Загрузить данные семьи
        async function loadFamilyData() {
            try {
                // Загружаем информацию о семье
                currentFamily = await API.getFamilyInfo();

                if (currentFamily && currentFamily.id) {
                    // Есть семья - показываем основной контент
                    document.getElementById('family-content').style.display = 'block';
                    document.getElementById('solo-content').style.display = 'none';

                    isCreator = currentFamily.is_creator || false;
                    totalMembers = currentFamily.members_count || 0;

                    // Обновляем информацию
                    updateFamilyInfo();

                    // Загружаем участников
                    await loadFamilyMembers();

                    // Загружаем приглашения (только для создателя)
                    if (isCreator) {
                        await loadCreatedInvites();
                    }

                } else {
                    // Нет семьи - показываем Solo режим
                    document.getElementById('family-content').style.display = 'none';
                    document.getElementById('solo-content').style.display = 'block';

                    // Проверяем входящие приглашения
                    await checkForInvites();
                }

                // Скрываем индикатор загрузки
                document.getElementById('family-status').style.display = 'none';

            } catch (error) {
                console.error('Ошибка загрузки данных семьи:', error);
                showToast('Ошибка загрузки данных', 'error');
                // В случае ошибки показываем Solo режим
                document.getElementById('family-content').style.display = 'none';
                document.getElementById('solo-content').style.display = 'block';
                document.getElementById('family-status').style.display = 'none';
            }
        }

        // Обновить информацию о семье
        function updateFamilyInfo() {
            if (!currentFamily) return;

            document.getElementById('family-name').textContent = currentFamily.name || 'Без названия';

            const createdAt = document.getElementById('family-created-at');
            if (currentFamily.created_at) {
                createdAt.textContent = formatDate(currentFamily.created_at);
            } else {
                createdAt.textContent = 'Не указано';
            }

            const membersCount = document.getElementById('family-members-count');
            if (currentFamily.members_count) {
                const count = currentFamily.members_count;
                let word;
                if (count % 10 === 1 && count % 100 !== 11) {
                    word = 'человек';
                } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
                    word = 'человека';
                } else {
                    word = 'человек';
                }
                membersCount.textContent = `${count} ${word}`;
            } else {
                membersCount.textContent = '0 человек';
            }

            const statusBadge = document.getElementById('family-status-badge');
            if (currentFamily.is_active) {
                statusBadge.innerHTML = '<span class="badge active">Активна</span>';
            } else {
                statusBadge.innerHTML = '<span class="badge inactive">Неактивна</span>';
            }

            // Показываем/скрываем кнопку удаления
            const deleteBtn = document.getElementById('delete-family-btn');
            if (deleteBtn) {
                deleteBtn.style.display = isCreator ? 'block' : 'none';
            }
        }

        // Загрузить участников семьи
        async function loadFamilyMembers() {
            try {
                familyMembers = await API.getFamilyMembers() || [];
                renderMembersList();
            } catch (error) {
                console.error('Ошибка загрузки участников:', error);
                showToast('Ошибка загрузки участников', 'error');
                familyMembers = [];
                renderMembersList();
            }
        }

        // Отрендерить список участников
        function renderMembersList() {
            const container = document.getElementById('members-list');
            if (!container) return;

            if (!familyMembers || familyMembers.length === 0) {
                container.innerHTML = '<div class="empty-state">Нет участников</div>';
                return;
            }

            container.innerHTML = familyMembers.map(member => {
                const firstName = escapeHtml(member.first_name || '');
                const lastName = escapeHtml(member.last_name || '');
                const username = escapeHtml(member.username || '');
                const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Пользователь';

                return `
                <div class="member-item" data-telegram-id="${member.telegram_id}">
                    <div class="member-avatar">
                        ${(firstName ? firstName.charAt(0) : username ? username.charAt(0) : 'U').toUpperCase()}
                    </div>
                    <div class="member-info">
                        <div class="member-name">
                            ${displayName}
                            ${member.is_creator ? ' 👑' : ''}
                        </div>
                        <div class="member-details">
                            <span class="member-username">@${username || 'без username'}</span>
                            <span class="member-joined">вступил ${member.joined_at ? formatDate(member.joined_at, true) : 'недавно'}</span>
                        </div>
                    </div>
                    ${isCreator && !member.is_creator ? `
                        <button class="member-action-btn" onclick="removeMember(${member.telegram_id}, '${displayName.replace(/'/g, "\\'")}')" title="Исключить">
                            ✕
                        </button>
                    ` : ''}
                </div>
            `}).join('');
        }

        // Загрузить созданные приглашения (для создателя)
        async function loadCreatedInvites() {
            try {
                const invites = await API.getCreatedInvites ? await API.getCreatedInvites() : [];
                if (invites && invites.length > 0) {
                    document.getElementById('created-invites-section').style.display = 'block';
                    // TODO: Реализовать отображение созданных приглашений
                } else {
                    document.getElementById('created-invites-section').style.display = 'none';
                }
            } catch (error) {
                console.error('Ошибка загрузки созданных приглашений:', error);
                document.getElementById('created-invites-section').style.display = 'none';
            }
        }

        // Проверить входящие приглашения
        async function checkForInvites() {
            try {
                const invites = await API.getPendingInvites();
                pendingInvites = invites || [];

                const invitesSection = document.getElementById('invites-section');
                const invitesList = document.getElementById('pending-invites');

                if (pendingInvites.length > 0) {
                    invitesSection.style.display = 'block';

                    invitesList.innerHTML = pendingInvites.map(invite => {
                        const familyName = escapeHtml(invite.family_name || 'Без названия');
                        const invitedBy = escapeHtml(invite.invited_by_first_name || invite.invited_by_username || 'Пользователь');
                        const message = escapeHtml(invite.message || '');

                        return `
                        <div class="invite-item">
                            <div class="invite-header">
                                <h4>${familyName}</h4>
                                <span class="invite-hours">⏳ ${Math.floor(invite.hours_remaining || 0)}ч</span>
                            </div>
                            <div class="invite-details">
                                <div>Пригласил: ${invitedBy}</div>
                                ${message ? `<div class="invite-message">💬 "${message}"</div>` : ''}
                            </div>
                            <div class="invite-actions">
                                <button class="btn small decline" onclick="declineInvite('${invite.invite_token}')">
                                    Отклонить
                                </button>
                                <button class="btn small accept" onclick="acceptInvite('${invite.invite_token}')">
                                    Принять
                                </button>
                            </div>
                        </div>
                    `}).join('');
                } else {
                    invitesSection.style.display = 'none';
                }
            } catch (error) {
                console.error('Ошибка проверки приглашений:', error);
                const invitesSection = document.getElementById('invites-section');
                if (invitesSection) {
                    invitesSection.style.display = 'none';
                }
            }
        }

        // Показать форму создания семьи
        function showCreateFamilyModal() {
            document.getElementById('create-family-modal').classList.add('active');
        }

        // Создать семью
        async function createFamily() {
            const nameInput = document.getElementById('new-family-name');
            const name = nameInput ? nameInput.value.trim() : '';

            if (!name) {
                showToast('Введите название семьи', 'warning');
                if (nameInput) nameInput.focus();
                return;
            }

            if (name.length < 2) {
                showToast('Название слишком короткое', 'warning');
                if (nameInput) nameInput.focus();
                return;
            }

            try {
                if (tg && tg.MainButton) {
                    tg.MainButton.showProgress();
                }

                const result = await API.createFamily(name);

                if (tg && tg.MainButton) {
                    tg.MainButton.hideProgress();
                }

                closeModal('create-family-modal');

                showToast(`Семья "${name}" создана!`, 'success');

                // Обновляем данные
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } catch (error) {
                if (tg && tg.MainButton) {
                    tg.MainButton.hideProgress();
                }
                console.error('Ошибка создания семьи:', error);
                showToast('Ошибка: ' + (error.message || 'Неизвестная ошибка'), 'error');
            }
        }

        // Показать форму приглашения
        function showInviteForm() {
            closeModal('family-actions-modal');
            document.getElementById('invite-modal').classList.add('active');
        }

        // Отправить приглашение
        async function sendInvite() {
            const telegramIdInput = document.getElementById('invite-telegram-id');
            const messageInput = document.getElementById('invite-message');

            const telegramId = telegramIdInput ? parseInt(telegramIdInput.value.trim()) : 0;
            const message = messageInput ? messageInput.value.trim() || null : null;

            if (!telegramId || telegramId <= 0 || isNaN(telegramId)) {
                showToast('Введите корректный Telegram ID', 'warning');
                if (telegramIdInput) telegramIdInput.focus();
                return;
            }

            // Проверяем, не приглашаем ли сами себя
            const user = tg.initDataUnsafe?.user;
            if (user && user.id === telegramId) {
                showToast('Нельзя пригласить самого себя', 'warning');
                return;
            }

            // Проверяем, не является ли пользователь уже участником
            const isAlreadyMember = familyMembers.some(m => m.telegram_id === telegramId);
            if (isAlreadyMember) {
                showToast('Этот пользователь уже в семье', 'warning');
                return;
            }

            try {
                if (tg && tg.MainButton) {
                    tg.MainButton.showProgress();
                }

                await API.inviteToFamily(telegramId, message);

                if (tg && tg.MainButton) {
                    tg.MainButton.hideProgress();
                }

                closeModal('invite-modal');

                showToast('Приглашение отправлено!', 'success');

                // Очищаем форму
                if (telegramIdInput) telegramIdInput.value = '';
                if (messageInput) {
                    messageInput.value = '';
                    document.getElementById('message-chars').textContent = '0';
                }

            } catch (error) {
                if (tg && tg.MainButton) {
                    tg.MainButton.hideProgress();
                }
                console.error('Ошибка отправки приглашения:', error);
                showToast('Ошибка: ' + (error.message || 'Неизвестная ошибка'), 'error');
            }
        }

        // Принять приглашение
        async function acceptInvite(inviteToken) {
            if (!inviteToken) {
                showToast('Неверный токен приглашения', 'error');
                return;
            }

            try {
                await API.acceptInvite(inviteToken);
                showToast('Вы вступили в семью!', 'success');

                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } catch (error) {
                console.error('Ошибка принятия приглашения:', error);
                showToast('Ошибка: ' + (error.message || 'Неизвестная ошибка'), 'error');
            }
        }

        // Отклонить приглашение
        async function declineInvite(inviteToken) {
            if (!inviteToken) {
                showToast('Неверный токен приглашения', 'error');
                return;
            }

            try {
                await API.declineInvite(inviteToken);
                showToast('Приглашение отклонено', 'info');

                // Обновляем список
                pendingInvites = pendingInvites.filter(inv => inv.invite_token !== inviteToken);
                await checkForInvites();

            } catch (error) {
                console.error('Ошибка отклонения приглашения:', error);
                showToast('Ошибка: ' + (error.message || 'Неизвестная ошибка'), 'error');
            }
        }

        // Удалить участника
        async function removeMember(telegramId, memberName) {
            if (!telegramId || !memberName) return;

            if (!confirm(`Исключить ${memberName} из семьи?`)) {
                return;
            }

            try {
                await API.removeFamilyMember(telegramId);
                showToast(`${memberName} исключён из семьи`, 'success');

                // Обновляем список
                await loadFamilyMembers();

            } catch (error) {
                console.error('Ошибка исключения участника:', error);
                showToast('Ошибка: ' + (error.message || 'Неизвестная ошибка'), 'error');
            }
        }

        // Показать подтверждение выхода
        function showLeaveConfirm() {
            const warning = document.getElementById('last-member-warning');
            if (warning) {
                if (totalMembers === 1) {
                    warning.style.display = 'block';
                } else {
                    warning.style.display = 'none';
                }
            }

            closeModal('family-actions-modal');
            document.getElementById('leave-confirm-modal').classList.add('active');
        }

        // Выйти из семьи
        async function leaveFamily() {
            try {
                if (tg && tg.MainButton) {
                    tg.MainButton.showProgress();
                }

                await API.leaveFamily();

                if (tg && tg.MainButton) {
                    tg.MainButton.hideProgress();
                }

                closeModal('leave-confirm-modal');

                showToast('Вы вышли из семьи', 'info');

                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } catch (error) {
                if (tg && tg.MainButton) {
                    tg.MainButton.hideProgress();
                }
                console.error('Ошибка выхода из семьи:', error);
                showToast('Ошибка: ' + (error.message || 'Неизвестная ошибка'), 'error');
            }
        }

        // Показать действия с семьей
        function showFamilyActions() {
            document.getElementById('family-actions-modal').classList.add('active');
        }

        // Скопировать ссылку-приглашение
        function copyInviteLink() {
            // Временная заглушка - можно реализовать через создание приглашения с ссылкой
            showToast('Функция в разработке', 'info');
        }

        // Переименовать семью
        function renameFamily() {
            if (!currentFamily) return;

            const newName = prompt('Введите новое название семьи:', currentFamily.name || '');

            if (newName && newName.trim() && newName.trim() !== currentFamily.name) {
                // Требуется endpoint для переименования
                showToast('Функция в разработке', 'info');
            }
        }

        // Показать подтверждение удаления
        function showDeleteConfirm() {
            if (confirm('Удалить семью? Все данные останутся у участников, но семья будет деактивирована.')) {
                // Требуется endpoint для удаления семьи
                showToast('Функция в разработке', 'info');
            }
        }

        // Вспомогательные функции
        function formatDate(dateString, short = false) {
            if (!dateString) return 'не указано';

            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'не указано';

            if (short) {
                return date.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short'
                });
            }
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
            }
        }

        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            if (!toast) return;

            toast.textContent = message;
            toast.className = `toast ${type}`;
            toast.style.display = 'block';

            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);

            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
        }

        // Функция для экранирования HTML
        function escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }