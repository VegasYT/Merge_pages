import { useState } from 'react';

/**
 * Хук для отслеживания позиции мыши и наведения
 */
export const useMouse = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState(null);

  return {
    mousePos,
    setMousePos,
    hoveredElement,
    setHoveredElement,
  };
};
