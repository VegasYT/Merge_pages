import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Модальное окно для добавления нового блока
export default function AddBlockModal({ categories, blockTemplates, onClose, onAddBlock }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleOverlayMouseDown = (e) => {
    // Запоминаем, что mousedown был на оверлее
    if (e.target === e.currentTarget) {
      setMouseDownOnOverlay(true);
    }
  };

  const handleOverlayClick = (e) => {
    // Закрываем только если и mousedown и click были на оверлее
    if (e.target === e.currentTarget && mouseDownOnOverlay) {
      handleClose();
    }
    setMouseDownOnOverlay(false);
  };

  const filteredTemplates = selectedCategory
    ? blockTemplates.filter(t => t.category_id === selectedCategory)
    : blockTemplates;

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Добавить блок
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-purple-50/30">
          {/* Zero Block секция */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Специальные блоки</h3>
            <div
              onClick={() => onAddBlock(null)}
              className="border-2 border-dashed border-purple-300 rounded-xl p-6 hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded flex items-center justify-center text-white font-bold text-2xl">
                  Z
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Zero Block</h4>
                  <p className="text-gray-600">Создайте кастомный блок с нуля</p>
                </div>
              </div>
            </div>
          </div>

          {/* Готовые шаблоны блоков */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Готовые блоки</h3>

            {/* Фильтр категорий */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                Все
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Сетка шаблонов */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => onAddBlock(template)}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl cursor-pointer transition-all duration-300 hover:border-blue-400 transform hover:scale-[1.03] bg-white group"
                >
                  <div className="overflow-hidden">
                    <img
                      src={template.preview_url}
                      alt={template.name}
                      className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{template.template_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
