import { useState } from 'react';
import { duplicateClipboardElements } from '../utils/elementUtils.jsx';

/**
 * Хук для управления буфером обмена (копирование/вставка)
 */
export const useClipboard = () => {
  const [clipboard, setClipboard] = useState([]);

  // Копировать элементы в буфер
  const copyToClipboard = (elements) => {
    setClipboard(elements);
  };

  // Вставить элементы из буфера с возвратом новых элементов
  const pasteFromClipboard = (offset = { x: 20, y: 20 }) => {
    if (clipboard.length === 0) return [];

    const newElements = duplicateClipboardElements(clipboard, offset);
    return newElements;
  };

  // Проверить, есть ли что-то в буфере
  const hasClipboard = () => clipboard.length > 0;

  // Очистить буфер
  const clearClipboard = () => {
    setClipboard([]);
  };

  return {
    clipboard,
    copyToClipboard,
    pasteFromClipboard,
    hasClipboard,
    clearClipboard,
  };
};
