import React, { useState, useMemo } from "react";
import { Monitor, Tablet, Smartphone, Plus, Settings, Infinity } from "lucide-react";
import BreakpointModal from "./BreakpointModal.jsx";

/**
 * Панель управления брейкпоинтами (компактная версия с иконками)
 */
export default function BreakpointPanel({
  breakpoints,
  activeBreakpointId,
  onBreakpointChange,
  onBreakpointAdd,
  onBreakpointUpdate,
  onBreakpointDelete,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBreakpoint, setEditingBreakpoint] = useState(null);
  const [hoveredBreakpoint, setHoveredBreakpoint] = useState(null);

  // Сортируем брейкпоинты от меньшего к большему
  const sortedBreakpoints = useMemo(() => {
    return [...breakpoints].sort((a, b) => a.width - b.width);
  }, [breakpoints]);

  const handleAddClick = () => {
    setEditingBreakpoint(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (breakpoint, e) => {
    e.stopPropagation();
    setEditingBreakpoint(breakpoint);
    setIsModalOpen(true);
  };

  const handleSave = (data) => {
    if (editingBreakpoint) {
      // Редактирование существующего
      onBreakpointUpdate(editingBreakpoint.id, data);
    } else {
      // Добавление нового
      onBreakpointAdd(data.name, data.width);
    }
    setIsModalOpen(false);
    setEditingBreakpoint(null);
  };

  const handleDelete = (id) => {
    onBreakpointDelete(id);
    setIsModalOpen(false);
    setEditingBreakpoint(null);
  };

  // Выбираем иконку в зависимости от ширины
  const getIcon = (width) => {
    if (width >= 1200) return Monitor;
    if (width >= 768) return Tablet;
    return Smartphone;
  };

  // Получаем диапазон для брейкпоинта
  const getWidthRange = (bp, index) => {
    const nextBp = sortedBreakpoints[index + 1];
    if (nextBp) {
      return `${bp.width}px - ${nextBp.width - 1}px`;
    } else {
      return (
        <span className="flex items-center gap-1">
          {bp.width}px - <Infinity size={14} />
        </span>
      );
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {sortedBreakpoints.map((bp, index) => {
          const Icon = getIcon(bp.width);
          const isActive = bp.id === activeBreakpointId;
          const isHovered = hoveredBreakpoint === bp.id;

          return (
            <div
              key={bp.id}
              className="relative"
              onMouseEnter={() => setHoveredBreakpoint(bp.id)}
              onMouseLeave={() => setHoveredBreakpoint(null)}
            >
              {/* Компактная кнопка с иконкой */}
              <button
                onClick={() => onBreakpointChange(bp.id)}
                className={`p-2 rounded transition relative ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon size={20} />

                {/* Кнопка редактирования (появляется при наведении) */}
                {isHovered && (
                  <button
                    onClick={(e) => handleEditClick(bp, e)}
                    className="absolute -top-1 -right-1 p-0.5 bg-white rounded-full hover:bg-gray-100 border border-gray-300 text-gray-700"
                    title="Редактировать брейкпоинт"
                  >
                    <Settings size={10} />
                  </button>
                )}
              </button>

              {/* Tooltip при наведении */}
              {isHovered && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 animate-fadeIn">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-xl px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{bp.name}</div>
                    <div className="text-xs text-gray-600">{getWidthRange(bp, index)}</div>
                  </div>
                  {/* Стрелка */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
                </div>
              )}
            </div>
          );
        })}

        {/* Кнопка добавления нового брейкпоинта */}
        <button
          onClick={handleAddClick}
          className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          title="Добавить брейкпоинт"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Модалка добавления/редактирования */}
      {isModalOpen && (
        <BreakpointModal
          breakpoint={editingBreakpoint}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBreakpoint(null);
          }}
        />
      )}
    </>
  );
}
