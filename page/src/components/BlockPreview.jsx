import React from 'react';
import { Settings, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import UniversalBlockRenderer from './UniversalBlockRenderer';
import ZeroBlockPreview from './ZeroBlockPreview';

// Компонент предпросмотра блока с элементами управления
export default function BlockPreview({
  block,
  template,
  isHovered,
  onHover,
  onLeave,
  onOpenSettings,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddAfter,
  isFirst,
  isLast,
  viewportSize
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative group"
    >
      {isHovered && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-4 border-blue-500 z-10 pointer-events-none">
          <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
            {!isFirst && (
              <button
                onClick={onMoveUp}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition"
                title="Переместить вверх"
              >
                <ArrowUp size={20} className="text-gray-700" />
              </button>
            )}
            {!isLast && (
              <button
                onClick={onMoveDown}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition"
                title="Переместить вниз"
              >
                <ArrowDown size={20} className="text-gray-700" />
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
              title="Настройки"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition"
              title="Удалить"
            >
              <Trash2 size={20} />
            </button>
          </div>

          <div className="absolute top-4 left-4 pointer-events-auto">
            <div className="bg-white px-3 py-1 rounded-full shadow-lg text-sm font-medium text-gray-700">
              {block.type === 'zeroblock' ? 'Zero Block' : template?.name}
            </div>
          </div>
        </div>
      )}

      {block.type === 'zeroblock' ? (
        <ZeroBlockPreview viewportSize={viewportSize} />
      ) : template ? (
        <UniversalBlockRenderer
          structure={template.settings.structure}
          data={block.settings.data || {}}
          styles={block.settings.styles || {}}
          viewportSize={viewportSize}
        />
      ) : null}

      {/* Кнопка добавления блока после текущего */}
      <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${
        isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
      }`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddAfter();
          }}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
          title="Добавить блок после"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>
    </div>
  );
}
