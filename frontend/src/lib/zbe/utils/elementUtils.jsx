/**
 * Утилиты для работы с элементами
 */

/**
 * Генерирует уникальный ID для элемента
 */
export const generateElementId = () => {
  return Date.now() + Math.round(Math.random() * 1000);
};

/**
 * Создаёт новый элемент с дефолтными значениями
 */
export const createElement = (typeName, typeConfig, defaultProps, defaultSize, position = { x: 50, y: 50 }, generatedName = '') => {
  return {
    id: generateElementId(),
    type_name: typeName,
    x: position.x,
    y: position.y,
    width: defaultSize.width,
    height: defaultSize.height,
    props: {
      ...defaultProps,
      ...(generatedName && defaultProps.content !== undefined && { content: generatedName }),
      ...(generatedName && defaultProps.buttonText !== undefined && { buttonText: generatedName })
    },
    borderRadius: typeConfig.defaultProps?.borderRadius || 0,
    opacity: 1,
  };
};

/**
 * Дублирует элемент со смещением
 */
export const duplicateElement = (element, offset = { x: 20, y: 20 }) => {
  return {
    ...element,
    id: generateElementId(),
    x: element.x + offset.x,
    y: element.y + offset.y
  };
};

/**
 * Дублирует элементы из буфера обмена со смещением
 */
export const duplicateClipboardElements = (clipboard, offset = { x: 20, y: 20 }) => {
  const baseTimestamp = Date.now();
  return clipboard.map((el, index) => ({
    ...el,
    id: baseTimestamp + index,
    x: el.x + offset.x,
    y: el.y + offset.y,
  }));
};

/**
 * Проверяет, попадает ли точка в элемент
 */
export const isPointInElement = (x, y, element) => {
  return (
    x >= element.x &&
    x <= element.x + element.width &&
    y >= element.y &&
    y <= element.y + element.height
  );
};

/**
 * Находит элемент под курсором (верхний в z-order)
 */
export const findElementAtPoint = (x, y, elements) => {
  // Ищем с конца массива (верхние элементы)
  for (let i = elements.length - 1; i >= 0; i--) {
    if (isPointInElement(x, y, elements[i])) {
      return elements[i];
    }
  }
  return null;
};

/**
 * Фильтрует элементы, попадающие в область выделения
 */
export const getElementsInSelection = (elements, selectionRect) => {
  return elements.filter(element => {
    return !(
      element.x + element.width < selectionRect.x ||
      selectionRect.x + selectionRect.width < element.x ||
      element.y + element.height < selectionRect.y ||
      selectionRect.y + selectionRect.height < element.y
    );
  });
};

/**
 * Перемещает элемент на слой вверх или вниз
 */
export const moveElementLayer = (elements, id, direction) => {
  const idx = elements.findIndex((el) => el.id === id);
  if (idx === -1) return elements;

  const newElements = [...elements];
  if (direction === "up" && idx < newElements.length - 1) {
    [newElements[idx], newElements[idx + 1]] = [newElements[idx + 1], newElements[idx]];
  } else if (direction === "down" && idx > 0) {
    [newElements[idx], newElements[idx - 1]] = [newElements[idx - 1], newElements[idx]];
  }

  return newElements;
};
