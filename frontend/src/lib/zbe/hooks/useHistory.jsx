import { useState, useCallback, useRef } from 'react';

/**
 * Хук для управления историей состояний (Undo/Redo)
 * Поддерживает отдельную историю для каждого брейкпоинта
 *
 * @param {string} activeBreakpointId - ID активного брейкпоинта
 * @param {number} maxHistorySize - Максимальное количество шагов истории (по умолчанию 10)
 */
export const useHistory = (activeBreakpointId, maxHistorySize = 10) => {
  // Храним историю для каждого брейкпоинта отдельно
  // Структура: { breakpointId: { past: [], present: null, future: [] } }
  const [histories, setHistories] = useState({});

  // Флаг для предотвращения записи в историю при Undo/Redo
  const isUndoRedoAction = useRef(false);

  // Флаг для группировки действий (batching)
  const isBatching = useRef(false);
  const batchStartState = useRef(null);

  /**
   * Получить текущую историю для активного брейкпоинта
   */
  const getCurrentHistory = useCallback(() => {
    return histories[activeBreakpointId] || { past: [], present: null, future: [] };
  }, [histories, activeBreakpointId]);

  /**
   * Инициализировать историю для брейкпоинта если её нет
   */
  const ensureHistoryExists = useCallback((state) => {
    setHistories(prev => {
      if (!prev[activeBreakpointId]) {
        return {
          ...prev,
          [activeBreakpointId]: {
            past: [],
            present: state,
            future: []
          }
        };
      }
      return prev;
    });
  }, [activeBreakpointId]);

  /**
   * Записать новое состояние в историю
   * @param {any} newState - Новое состояние для записи
   */
  const pushState = useCallback((newState) => {
    // Если это действие Undo/Redo, не записываем в историю
    if (isUndoRedoAction.current) {
      return;
    }

    // Если мы в режиме группировки (batching), не записываем промежуточные состояния
    if (isBatching.current) {
      return;
    }

    setHistories(prev => {
      const currentHistory = prev[activeBreakpointId] || { past: [], present: null, future: [] };

      // Если present null, инициализируем историю
      if (currentHistory.present === null) {
        return {
          ...prev,
          [activeBreakpointId]: {
            past: [],
            present: newState,
            future: []
          }
        };
      }

      // Добавляем текущее состояние в past
      const newPast = [...currentHistory.past, currentHistory.present];

      // Ограничиваем размер истории
      const limitedPast = newPast.length > maxHistorySize
        ? newPast.slice(newPast.length - maxHistorySize)
        : newPast;

      return {
        ...prev,
        [activeBreakpointId]: {
          past: limitedPast,
          present: newState,
          future: [] // Очищаем future при новом действии
        }
      };
    });
  }, [activeBreakpointId, maxHistorySize]);

  /**
   * Отменить последнее действие (Undo)
   * @returns {any|null} Предыдущее состояние или null
   */
  const undo = useCallback(() => {
    const currentHistory = getCurrentHistory();

    if (currentHistory.past.length === 0) {
      return null; // Нечего отменять
    }

    isUndoRedoAction.current = true;

    // Берём последнее состояние из past
    const previous = currentHistory.past[currentHistory.past.length - 1];
    const newPast = currentHistory.past.slice(0, currentHistory.past.length - 1);

    setHistories(prev => ({
      ...prev,
      [activeBreakpointId]: {
        past: newPast,
        present: previous,
        future: [currentHistory.present, ...currentHistory.future]
      }
    }));

    // Сбрасываем флаг после обновления состояния
    setTimeout(() => {
      isUndoRedoAction.current = false;
    }, 0);

    return previous;
  }, [activeBreakpointId, getCurrentHistory]);

  /**
   * Повторить отменённое действие (Redo)
   * @returns {any|null} Следующее состояние или null
   */
  const redo = useCallback(() => {
    const currentHistory = getCurrentHistory();

    if (currentHistory.future.length === 0) {
      return null; // Нечего повторять
    }

    isUndoRedoAction.current = true;

    // Берём первое состояние из future
    const next = currentHistory.future[0];
    const newFuture = currentHistory.future.slice(1);

    setHistories(prev => ({
      ...prev,
      [activeBreakpointId]: {
        past: [...currentHistory.past, currentHistory.present],
        present: next,
        future: newFuture
      }
    }));

    // Сбрасываем флаг после обновления состояния
    setTimeout(() => {
      isUndoRedoAction.current = false;
    }, 0);

    return next;
  }, [activeBreakpointId, getCurrentHistory]);

  /**
   * Проверить, можно ли отменить действие
   */
  const canUndo = useCallback(() => {
    const currentHistory = getCurrentHistory();
    return currentHistory.past.length > 0;
  }, [getCurrentHistory]);

  /**
   * Проверить, можно ли повторить действие
   */
  const canRedo = useCallback(() => {
    const currentHistory = getCurrentHistory();
    return currentHistory.future.length > 0;
  }, [getCurrentHistory]);

  /**
   * Очистить всю историю
   */
  const clearHistory = useCallback(() => {
    setHistories({});
  }, []);

  /**
   * Очистить историю для конкретного брейкпоинта
   */
  const clearBreakpointHistory = useCallback((breakpointId) => {
    setHistories(prev => {
      const newHistories = { ...prev };
      delete newHistories[breakpointId];
      return newHistories;
    });
  }, []);

  /**
   * Начать группировку действий (batching)
   * Во время batching промежуточные изменения не записываются в историю
   * Используется для drag, resize, slider и других плавных операций
   */
  const startBatch = useCallback(() => {
    if (!isBatching.current) {
      isBatching.current = true;
      const currentHistory = getCurrentHistory();
      batchStartState.current = currentHistory.present;
    }
  }, [getCurrentHistory]);

  /**
   * Завершить группировку действий и записать финальное состояние
   * @param {any} finalState - Финальное состояние для записи в историю
   */
  const endBatch = useCallback((finalState) => {
    if (isBatching.current) {
      isBatching.current = false;

      // Записываем финальное состояние в историю только если оно отличается от начального
      if (finalState && finalState !== batchStartState.current) {
        // Временно разрешаем запись
        const wasBatching = isBatching.current;
        isBatching.current = false;
        pushState(finalState);
        isBatching.current = wasBatching;
      }

      batchStartState.current = null;
    }
  }, [pushState]);

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    clearBreakpointHistory,
    ensureHistoryExists,
    getCurrentHistory,
    startBatch,
    endBatch,
  };
};
