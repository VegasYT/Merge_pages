import React from 'react';
import { getSelectionRect } from '../../utils/geometryUtils.jsx';

/**
 * Компонент для отображения прямоугольника выделения
 */
const SelectionBox = ({ isSelecting, selectionStart, selectionEnd }) => {
  if (!isSelecting) return null;

  const { x, y, width, height } = getSelectionRect(selectionStart, selectionEnd);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width,
        height: height,
        border: '1px solid #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default SelectionBox;
