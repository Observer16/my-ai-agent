import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Кнопка настроек для модуля "Здоровье"
 * Размещается в правом верхнем углу страницы
 */
export const HealthSettingsButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/health/settings');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow group"
      title="Настройки здоровья"
    >
      <Settings className="w-5 h-5 text-gray-600 group-hover:text-blue-600 group-hover:rotate-45 transition-all duration-300" />
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
        Настройки
      </span>
    </button>
  );
};

export default HealthSettingsButton;
