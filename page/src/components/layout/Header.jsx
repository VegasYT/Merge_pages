import React from 'react';
import { Plus, Smartphone, Tablet, Monitor } from 'lucide-react';

// Компонент шапки редактора с кнопками управления
export default function Header({ viewportSize, onViewportChange, onAddBlockClick }) {
  return (
    <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewportChange('mobile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  viewportSize === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Smartphone size={18} />
                Мобильный
              </button>
              <button
                onClick={() => onViewportChange('tablet')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  viewportSize === 'tablet'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Tablet size={18} />
                Планшет
              </button>
              <button
                onClick={() => onViewportChange('desktop')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  viewportSize === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Monitor size={18} />
                Десктоп
              </button>
            </div>
          </div>
          <button
            onClick={onAddBlockClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Добавить блок
          </button>
        </div>
      </div>
    </div>
  );
}
