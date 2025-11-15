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
      <div className="bg-gray-800 rounded-lg p-6 w-96 relative">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {breakpoint ? "Редактировать брейкпоинт" : "Добавить брейкпоинт"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Название</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Desktop, Tablet, Mobile..."
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Ширина (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min="1"
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition"
            >
              {breakpoint ? "Сохранить" : "Добавить"}
            </button>

            {breakpoint && !breakpoint.isDefault && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
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
