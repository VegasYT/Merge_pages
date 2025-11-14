import { useState } from 'react';

/**
 * Хук для управления линиями привязки
 */
export const useSnapLines = () => {
  const [snapLines, setSnapLines] = useState([]);

  // Очистить линии привязки
  const clearSnapLines = () => {
    setSnapLines([]);
  };

  return {
    snapLines,
    setSnapLines,
    clearSnapLines,
  };
};
