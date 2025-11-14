import { useState } from 'react';

/**
 * Хук для управления перетаскиванием элементов
 */
export const useDragAndDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Начать перетаскивание
  const startDragging = (clientX, clientY, rect) => {
    setIsDragging(true);
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  // Завершить перетаскивание
  const stopDragging = () => {
    setIsDragging(false);
  };

  // Начать изменение размера
  const startResizing = (direction, element, mouseX, mouseY) => {
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: mouseX,
      y: mouseY,
      width: element.width,
      height: element.height,
      elementX: element.x,
      elementY: element.y,
    });
  };

  // Завершить изменение размера
  const stopResizing = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };

  return {
    isDragging,
    setIsDragging,
    dragOffset,
    setDragOffset,
    isResizing,
    setIsResizing,
    resizeDirection,
    setResizeDirection,
    resizeStart,
    setResizeStart,
    startDragging,
    stopDragging,
    startResizing,
    stopResizing,
  };
};
