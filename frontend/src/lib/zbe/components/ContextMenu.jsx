import React, { useState } from "react";
import {
  MoveUp,
  MoveDown,
  Copy,
  Clipboard,
  Trash2,
  Plus,
  EyeOff,
  Eye,
  ChevronRight,
  Type,
  Square,
  Image,
  MousePointerSquareDashed,
  Film,
} from "lucide-react";

/**
 * Компонент контекстного меню
 */
export default function ContextMenu({
  position,
  canvasOffset,
  hasSelectedElements,
  hasClipboard,
  showLayersPanel,
  availableTypes,
  onClose,
  onMoveUp,
  onMoveDown,
  onCopy,
  onPaste,
  onDelete,
  onAddElement,
  onToggleLayers,
}) {
  if (!position) return null;

  const [showAddElementSubmenu, setShowAddElementSubmenu] = useState(false);

  // Рассчитываем новую позицию меню с учетом панорамирования
  const adjustedX = position.x + (canvasOffset.x - position.initialCanvasOffset.x);
  const adjustedY = position.y + (canvasOffset.y - position.initialCanvasOffset.y);

  return (
    <>
      {/* Оверлей для закрытия меню при клике вне его */}
      <div
        className="fixed inset-0 z-40"
        style={{ pointerEvents: 'none' }}
      />

      {/* Само меню */}
      <div
        className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-[180px]"
        style={{
          left: adjustedX,
          top: adjustedY,
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => {
          // Останавливаем всплытие, чтобы клики по меню не проходили дальше
          e.stopPropagation();
        }}
      >
        {hasSelectedElements ? (
          // Меню когда элементы выделены
          <>
            <MenuItem icon={MoveUp} label="Выше" onClick={onMoveUp} />
            <MenuItem icon={MoveDown} label="Ниже" onClick={onMoveDown} />
            <MenuDivider />
            <MenuItem icon={Copy} label="Копировать" onClick={onCopy} />
            {hasClipboard && (
              <MenuItem icon={Clipboard} label="Вставить" onClick={onPaste} />
            )}
            <MenuDivider />
            <MenuItem
              icon={Trash2}
              label="Удалить"
              onClick={onDelete}
              danger
            />
          </>
        ) : (
          // Меню когда ничего не выделено
          <>
            {hasClipboard && (
              <>
                <MenuItem icon={Clipboard} label="Вставить" onClick={onPaste} />
                <MenuDivider />
              </>
            )}
            <MenuItemWithSubmenu
              icon={Plus}
              label="Добавить элемент"
              showSubmenu={showAddElementSubmenu}
              onMouseEnter={() => setShowAddElementSubmenu(true)}
              onMouseLeave={() => setShowAddElementSubmenu(false)}
            >
              {availableTypes?.map((typeInfo) => {
                const IconComponent = {
                  Type,
                  Square,
                  Image,
                  MousePointerSquareDashed,
                  Film
                }[typeInfo.icon] || Square;

                return (
                  <MenuItem
                    key={typeInfo.type_name}
                    icon={IconComponent}
                    label={typeInfo.display_name}
                    onClick={() => onAddElement(typeInfo.type_name)}
                  />
                );
              })}
            </MenuItemWithSubmenu>
            <MenuItem
              icon={showLayersPanel ? EyeOff : Eye}
              label={showLayersPanel ? "Скрыть слои" : "Показать слои"}
              onClick={onToggleLayers}
            />
          </>
        )}
      </div>
    </>
  );
}

/**
 * Компонент отдельного пункта меню
 */
function MenuItem({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 transition ${
        danger ? "text-red-600 hover:text-red-700" : "text-gray-700"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <Icon size={16} />
      <span className="text-sm">{label}</span>
    </button>
  );
}

/**
 * Пункт меню с подменю
 */
function MenuItemWithSubmenu({ icon: Icon, label, showSubmenu, onMouseEnter, onMouseLeave, children }) {
  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 transition cursor-pointer text-gray-700">
        {Icon && <Icon size={16} />}
        <span className="text-sm flex-1">{label}</span>
        <ChevronRight size={14} />
      </div>

      {/* Подменю */}
      {showSubmenu && (
        <div
          className="absolute left-full top-0 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[160px] z-50"
          style={{
            pointerEvents: 'auto',
            marginLeft: '-1px' // Убираем промежуток, наслаивая границы
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Разделитель между пунктами меню
 */
function MenuDivider() {
  return <div className="my-1 border-t border-gray-200" />;
}
