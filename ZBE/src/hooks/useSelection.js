import { useState } from 'react';

/**
 * Хук для управления выделением элементов
 */
export const useSelection = () => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]); // Множественный выбор
  const [isSelecting, setIsSelecting] = useState(false); // Режим выделения области
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });

  // Выбрать один элемент
  const selectElement = (id, clearMultiple = true) => {
    setSelectedElement(id);
    if (clearMultiple) {
      setSelectedElements([]);
    }
  };

  // Выбрать несколько элементов
  const selectMultipleElements = (ids) => {
    setSelectedElements(ids);
    if (ids.length > 0) {
      setSelectedElement(ids[0]);
    } else {
      setSelectedElement(null);
    }
  };

  // Добавить элементы к выделению
  const addToSelection = (ids) => {
    const currentSelected = selectedElements.length > 0
      ? selectedElements
      : (selectedElement ? [selectedElement] : []);
    const newSelected = [...new Set([...currentSelected, ...ids])];
    setSelectedElements(newSelected);
    if (newSelected.length > 0) {
      setSelectedElement(newSelected[0]);
    }
  };

  // Очистить выделение
  const clearSelection = () => {
    setSelectedElement(null);
    setSelectedElements([]);
  };

  // Начать выделение области
  const startSelection = (x, y) => {
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
  };

  // Обновить конец выделения
  const updateSelectionEnd = (x, y) => {
    setSelectionEnd({ x, y });
  };

  // Завершить выделение
  const finishSelection = () => {
    setIsSelecting(false);
  };

  return {
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    isSelecting,
    setIsSelecting,
    selectionStart,
    selectionEnd,
    selectElement,
    selectMultipleElements,
    addToSelection,
    clearSelection,
    startSelection,
    updateSelectionEnd,
    finishSelection,
  };
};
