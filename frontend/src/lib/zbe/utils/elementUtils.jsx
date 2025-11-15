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
export const createElement = (typeName, typeConfig, defaultProps, defaultSize, position = { x: 50, y: 50 }, generatedName = '', zIndex = 0) => {
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
    zIndex,
  };
};

/**
 * Дублирует элемент со смещением
 */
export const duplicateElement = (element, offset = { x: 20, y: 20 }, newZIndex = null) => {
  return {
    ...element,
    id: generateElementId(),
    x: element.x + offset.x,
    y: element.y + offset.y,
    zIndex: newZIndex !== null ? newZIndex : element.zIndex
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
 * Перемещает элемент на слой вверх или вниз (изменяет zIndex)
 */
export const moveElementLayer = (elements, id, direction) => {
  const element = elements.find((el) => el.id === id);
  if (!element) return elements;

  const currentZIndex = element.zIndex || 0;

  // Получаем все уникальные zIndex и сортируем
  const allZIndices = [...new Set(elements.map(el => el.zIndex || 0))].sort((a, b) => a - b);
  const currentIdx = allZIndices.indexOf(currentZIndex);

  let newZIndex = currentZIndex;

  if (direction === "up") {
    // "up" = увеличить zIndex (стать выше)
    if (currentIdx < allZIndices.length - 1) {
      // Берем следующий zIndex и добавляем 1 (чтобы быть точно выше)
      newZIndex = allZIndices[currentIdx + 1] + 1;
    } else {
      // Уже самый высокий, просто увеличиваем на 1
      newZIndex = currentZIndex + 1;
    }
  } else if (direction === "down") {
    // "down" = уменьшить zIndex (стать ниже)
    if (currentIdx > 0) {
      // Берем предыдущий zIndex и вычитаем 1 (чтобы быть точно ниже)
      const prevZIndex = allZIndices[currentIdx - 1];
      newZIndex = prevZIndex > 0 ? prevZIndex - 1 : Math.max(0, currentZIndex - 1);
    } else {
      // Уже самый низкий, уменьшаем только если > 0
      newZIndex = Math.max(0, currentZIndex - 1);
    }
  }

  return elements.map(el =>
    el.id === id ? { ...el, zIndex: newZIndex } : el
  );
};
