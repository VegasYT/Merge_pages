import { useState, useEffect, useRef } from 'react';
import { moveElementLayer } from '../utils/elementUtils';
import {
  mergeElementWithBreakpoint,
  updateElementForBreakpoint,
  updateElementPropForBreakpoint,
} from '../utils/breakpointUtils';
import { useHistory } from './useHistory';

/**
 * Хук для управления элементами (CRUD операции) с поддержкой брейкпоинтов и истории
 */
export const useElements = (activeBreakpointId = 'desktop', defaultBreakpointId = 'desktop') => {
  const [elements, setElements] = useState([]);

  // Интеграция с историей (10 шагов на каждый брейкпоинт)
  const history = useHistory(activeBreakpointId, 10);

  // Флаг для предотвращения записи в историю при загрузке или undo/redo
  const skipHistoryRef = useRef(false);

  // Таймер для debouncing записи в историю
  const historyTimerRef = useRef(null);

  // Инициализируем историю при первой загрузке элементов
  useEffect(() => {
    if (elements.length > 0) {
      history.ensureHistoryExists(elements);
    }
  }, []);

  // Записываем в историю с debouncing (0.5 секунды)
  useEffect(() => {
    // Пропускаем запись если это undo/redo
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      return;
    }

    // Очищаем предыдущий таймер
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
    }

    // Устанавливаем новый таймер на 500ms
    historyTimerRef.current = setTimeout(() => {
      history.pushState([...elements]); // Делаем копию массива
      historyTimerRef.current = null;
    }, 500);

    // Очистка при размонтировании
    return () => {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
      }
    };
  }, [elements]);

  // Добавить элемент
  const addElement = (element) => {
    // Инициализируем breakpointOverrides если его нет
    const elementWithOverrides = {
      ...element,
      breakpointOverrides: element.breakpointOverrides || {},
    };
    setElements((prev) => [...prev, elementWithOverrides]);
  };

  // Обновить элемент полностью (с учетом активного брейкпоинта)
  const updateElement = (id, updates) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? updateElementForBreakpoint(el, updates, activeBreakpointId, defaultBreakpointId)
          : el
      )
    );
  };

  // Обновить конкретное свойство элемента (с учетом активного брейкпоинта)
  const updateElementProp = (id, propName, propValue) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? updateElementPropForBreakpoint(el, propName, propValue, activeBreakpointId, defaultBreakpointId)
          : el
      )
    );
  };

  // Удалить элемент
  const deleteElement = (id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  // Удалить несколько элементов
  const deleteElements = (ids) => {
    setElements((prev) => prev.filter((el) => !ids.includes(el.id)));
  };

  // Переместить элемент на слой вверх/вниз
  const moveLayer = (id, direction) => {
    setElements((prev) => moveElementLayer(prev, id, direction));
  };

  // Дублировать элемент
  const duplicateElement = (id) => {
    const element = elements.find((el) => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: Date.now(),
        x: element.x + 20,
        y: element.y + 20
      };
      setElements((prev) => [...prev, newElement]);
      return newElement.id;
    }
    return null;
  };

  // Получить элемент с применением настроек брейкпоинта
  const getElementForBreakpoint = (element, breakpointId) => {
    return mergeElementWithBreakpoint(element, breakpointId);
  };

  // Получить все элементы с применением настроек активного брейкпоинта
  const getElementsForActiveBreakpoint = () => {
    return elements.map((el) => mergeElementWithBreakpoint(el, activeBreakpointId));
  };

  // === История (Undo/Redo) ===

  /**
   * Мерж состояний с сохранением breakpointOverrides для других брейкпоинтов
   * @param {Array} restoredState - Восстановленное состояние из истории
   * @param {Array} currentState - Текущее состояние элементов
   * @param {string} activeBreakpointId - Активный брейкпоинт
   * @returns {Array} - Смерженное состояние
   */
  const mergeStateWithOtherBreakpoints = (restoredState, currentState, activeBreakpointId) => {
    return restoredState.map(restoredEl => {
      // Находим текущий элемент с тем же ID
      const currentEl = currentState.find(el => el.id === restoredEl.id);

      if (!currentEl) {
        // Элемента нет в текущем состоянии - возвращаем восстановленный
        return restoredEl;
      }

      // Если это не дефолтный брейкпоинт, нужно сохранить ВСЁ из текущего состояния
      // и восстановить ТОЛЬКО breakpointOverride для текущего брейкпоинта
      if (activeBreakpointId !== defaultBreakpointId) {
        // Берем текущее состояние элемента (базовые свойства и все breakpointOverrides)
        const mergedOverrides = {
          ...currentEl.breakpointOverrides,
          // Восстанавливаем только breakpointOverride для текущего брейкпоинта
          [activeBreakpointId]: restoredEl.breakpointOverrides?.[activeBreakpointId]
        };

        return {
          ...currentEl, // Сохраняем все базовые свойства из текущего состояния
          breakpointOverrides: mergedOverrides
        };
      }

      // Для дефолтного брейкпоинта восстанавливаем базовые свойства,
      // но сохраняем breakpointOverrides всех брейкпоинтов
      return {
        ...restoredEl,
        breakpointOverrides: currentEl.breakpointOverrides || {}
      };
    });
  };

  /**
   * Отменить последнее действие (Ctrl+Z)
   */
  const undo = () => {
    const previousState = history.undo();
    if (previousState !== null) {
      skipHistoryRef.current = true;

      // Мержим восстановленное состояние с текущим, сохраняя breakpointOverrides других брейкпоинтов
      const mergedState = mergeStateWithOtherBreakpoints(previousState, elements, activeBreakpointId);
      setElements(mergedState);

      return true;
    }
    return false;
  };

  /**
   * Повторить отменённое действие (Ctrl+Shift+Z)
   */
  const redo = () => {
    const nextState = history.redo();
    if (nextState !== null) {
      skipHistoryRef.current = true;

      // Мержим восстановленное состояние с текущим, сохраняя breakpointOverrides других брейкпоинтов
      const mergedState = mergeStateWithOtherBreakpoints(nextState, elements, activeBreakpointId);
      setElements(mergedState);

      return true;
    }
    return false;
  };

  /**
   * Проверить, можно ли отменить
   */
  const canUndo = () => {
    return history.canUndo();
  };

  /**
   * Проверить, можно ли повторить
   */
  const canRedo = () => {
    return history.canRedo();
  };

  /**
   * Начать группировку действий
   * Используется для drag, resize, slider - предотвращает запись промежуточных состояний
   */
  const startBatch = () => {
    history.startBatch();
  };

  /**
   * Завершить группировку действий
   * Записывает финальное состояние в историю немедленно
   */
  const endBatch = () => {
    // Сбрасываем таймер debounce, чтобы не было задержки
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }

    // Немедленно записываем финальное состояние
    history.endBatch([...elements]);
  };

  return {
    elements,
    setElements,
    addElement,
    updateElement,
    updateElementProp,
    deleteElement,
    deleteElements,
    moveLayer,
    duplicateElement,
    getElementForBreakpoint,
    getElementsForActiveBreakpoint,
    // История
    undo,
    redo,
    canUndo,
    canRedo,
    startBatch,
    endBatch,
  };
};
