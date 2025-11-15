import React, { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";

/**
 * Модалка для добавления/редактирования брейкпоинта
 */
export default function BreakpointModal({ breakpoint, onSave, onDelete, onClose }) {
  const [name, setName] = useState(breakpoint?.name || "");
  const [width, setWidth] = useState(breakpoint?.width || 1920);

  useEffect(() => {
    if (breakpoint) {
      setName(breakpoint.name);
      setWidth(breakpoint.width);
    }
  }, [breakpoint]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !width || width <= 0) {
      alert("Введите название и корректную ширину");
      return;
    }
    onSave({ name, width });
  };

  const handleDeleteClick = () => {
    if (breakpoint?.isDefault) {
      alert("Нельзя удалить дефолтный брейкпоинт");
      return;
    }
    if (window.confirm(`Удалить брейкпоинт "${breakpoint?.name}"?`)) {
      onDelete(breakpoint.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 relative shadow-xl">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {breakpoint ? "Редактировать брейкпоинт" : "Добавить брейкпоинт"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Desktop, Tablet, Mobile..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ширина (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 font-medium"
            >
              {breakpoint ? "Сохранить" : "Добавить"}
            </button>

            {breakpoint && !breakpoint.isDefault && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 font-medium"
                title="Удалить брейкпоинт"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
