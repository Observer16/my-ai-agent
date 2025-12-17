import React, { useState, useEffect } from 'react';
import { Settings, Link2, Bell, CheckCircle, XCircle, Clock, Copy } from 'lucide-react';

interface LinkCodeData {
  link_code: string;
  expires_in_minutes: number;
  expires_at: string;
  instructions: string;
}

interface TelegramStatus {
  is_linked: boolean;
  telegram_id: number | null;
  username: string | null;
  linked_at: string | null;
}

interface NotificationSettings {
  enabled: boolean;
  channel: string;
  frequency: string | null;
  preferred_time: string | null;
}

export const HealthSettingsPage: React.FC = () => {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [linkCode, setLinkCode] = useState<LinkCodeData | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadAllData();
  }, []);

  // Обратный отсчёт для кода
  useEffect(() => {
    if (!linkCode) {
      setCountdown(0);
      return;
    }

    const expiresAt = new Date(linkCode.expires_at).getTime();
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setCountdown(remaining);

      if (remaining === 0) {
        setLinkCode(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [linkCode]);

  const loadAllData = async () => {
    await Promise.all([
      loadTelegramStatus(),
      loadNotificationSettings()
    ]);
  };

  const loadTelegramStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/health/telegram/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load status');

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error loading status:', err);
      setError('Не удалось загрузить статус');
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/health/telegram/notification-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load settings');

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const generateLinkCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/health/telegram/generate-link-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate code');
      }

      const data = await response.json();
      setLinkCode(data);
    } catch (err) {
      console.error('Error generating code:', err);
      setError(err instanceof Error ? err.message : 'Ошибка генерации кода');
    } finally {
      setLoading(false);
    }
  };

  const unlinkTelegram = async () => {
    if (!confirm('Отвязать Telegram? Уведомления перестанут приходить.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/health/telegram/unlink', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to unlink');

      await loadAllData();
      setLinkCode(null);
    } catch (err) {
      console.error('Error unlinking:', err);
      setError('Ошибка отвязки аккаунта');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    if (!notifications) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/health/telegram/notification-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !notifications.enabled
        })
      });

      if (!response.ok) throw new Error('Failed to update settings');

      await loadNotificationSettings();
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Ошибка обновления настроек');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!linkCode) return;

    navigator.clipboard.writeText(`/link ${linkCode.link_code}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Настройки здоровья
            </h1>
          </div>
          <p className="text-gray-600">
            Управление уведомлениями и интеграциями
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Ошибка</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Telegram интеграция */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Link2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Telegram Уведомления
              </h2>
              <p className="text-sm text-gray-600">
                Получай напоминания о приёме лекарств
              </p>
            </div>
          </div>

          {/* Статус привязки */}
          {status?.is_linked ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">
                      ✅ Аккаунт привязан
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      @{status.username || 'пользователь'} 
                      {status.telegram_id && ` (ID: ${status.telegram_id})`}
                    </p>
                    {status.linked_at && (
                      <p className="text-xs text-green-600 mt-1">
                        Привязан: {new Date(status.linked_at).toLocaleString('ru-RU')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={unlinkTelegram}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Отвязать
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">
                    ℹ️ Аккаунт не привязан
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Привяжи Telegram для получения уведомлений о приёме лекарств
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Кнопка генерации кода */}
          {!status?.is_linked && !linkCode && (
            <button
              onClick={generateLinkCode}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <Link2 className="w-5 h-5" />
                  Получить код привязки
                </>
              )}
            </button>
          )}

          {/* Инструкция с кодом */}
          {linkCode && (
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    🔗 Инструкция по привязке
                  </h3>
                  <p className="text-sm text-gray-600">
                    Код действителен {formatCountdown(countdown)}
                  </p>
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
                <li>Открой Telegram</li>
                <li>
                  Найди бота <code className="bg-white px-2 py-0.5 rounded text-blue-600 font-mono">@YourHealthBot</code>
                </li>
                <li>Отправь команду:</li>
              </ol>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={`/link ${linkCode.link_code}`}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={copyCode}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  title="Скопировать"
                >
                  <Copy className="w-5 h-5" />
                  {copiedCode ? '✓' : ''}
                </button>
              </div>

              {copiedCode && (
                <p className="text-sm text-green-600 mb-3">
                  ✅ Команда скопирована!
                </p>
              )}

              <button
                onClick={() => setLinkCode(null)}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Сгенерировать новый код
              </button>
            </div>
          )}
        </div>

        {/* Настройки уведомлений */}
        {status?.is_linked && notifications && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Настройки уведомлений
                </h2>
                <p className="text-sm text-gray-600">
                  Управление напоминаниями о приёме
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Telegram уведомления
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {notifications.enabled 
                    ? 'Уведомления включены' 
                    : 'Уведомления отключены'}
                </p>
              </div>
              <button
                onClick={toggleNotifications}
                disabled={loading}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                  notifications.enabled 
                    ? 'bg-green-600' 
                    : 'bg-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    notifications.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthSettingsPage;
