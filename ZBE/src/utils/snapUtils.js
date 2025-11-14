/**
 * Утилиты для привязки элементов (snap/магнетизм)
 */

const SNAP_THRESHOLD = 8; // Порог привязки в пикселях

/**
 * Применяет привязку к координатам элемента
 * Возвращает новые координаты и линии привязки
 */
export const applySnapping = (
  newX,
  newY,
  mainElement,
  elements,
  canvasSettings,
  elementsToMove = []
) => {
  let snapX = newX;
  let snapY = newY;
  const activeSnapLines = [];

  // === Привязка к краям канваса ===

  // Левый край
  if (Math.abs(snapX) < SNAP_THRESHOLD) {
    snapX = 0;
    activeSnapLines.push({ type: 'vertical', position: 0 });
  }

  // Правый край
  if (Math.abs(snapX + mainElement.width - canvasSettings.width) < SNAP_THRESHOLD) {
    snapX = canvasSettings.width - mainElement.width;
    activeSnapLines.push({ type: 'vertical', position: canvasSettings.width });
  }

  // Верхний край
  if (Math.abs(snapY) < SNAP_THRESHOLD) {
    snapY = 0;
    activeSnapLines.push({ type: 'horizontal', position: 0 });
  }

  // Нижний край
  if (Math.abs(snapY + mainElement.height - canvasSettings.height) < SNAP_THRESHOLD) {
    snapY = canvasSettings.height - mainElement.height;
    activeSnapLines.push({ type: 'horizontal', position: canvasSettings.height });
  }

  // === Привязка к центру канваса ===

  const canvasCenterX = canvasSettings.width / 2;
  const canvasCenterY = canvasSettings.height / 2;
  const elementCenterX = snapX + mainElement.width / 2;
  const elementCenterY = snapY + mainElement.height / 2;
  const elementLeft = snapX;
  const elementRight = snapX + mainElement.width;
  const elementTop = snapY;
  const elementBottom = snapY + mainElement.height;

  // Центр элемента к центру канваса
  if (Math.abs(elementCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snapX = canvasCenterX - mainElement.width / 2;
    activeSnapLines.push({ type: 'vertical', position: canvasCenterX });
  }

  if (Math.abs(elementCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snapY = canvasCenterY - mainElement.height / 2;
    activeSnapLines.push({ type: 'horizontal', position: canvasCenterY });
  }

  // Края элемента к центральным осям канваса
  if (Math.abs(elementLeft - canvasCenterX) < SNAP_THRESHOLD) {
    snapX = canvasCenterX;
    activeSnapLines.push({ type: 'vertical', position: canvasCenterX });
  }

  if (Math.abs(elementRight - canvasCenterX) < SNAP_THRESHOLD) {
    snapX = canvasCenterX - mainElement.width;
    activeSnapLines.push({ type: 'vertical', position: canvasCenterX });
  }

  if (Math.abs(elementTop - canvasCenterY) < SNAP_THRESHOLD) {
    snapY = canvasCenterY;
    activeSnapLines.push({ type: 'horizontal', position: canvasCenterY });
  }

  if (Math.abs(elementBottom - canvasCenterY) < SNAP_THRESHOLD) {
    snapY = canvasCenterY - mainElement.height;
    activeSnapLines.push({ type: 'horizontal', position: canvasCenterY });
  }

  // === Привязка к другим элементам ===

  elements.forEach((otherEl) => {
    // Пропускаем элементы, которые двигаем
    if (elementsToMove.includes(otherEl.id)) return;

    const otherLeft = otherEl.x;
    const otherRight = otherEl.x + otherEl.width;
    const otherTop = otherEl.y;
    const otherBottom = otherEl.y + otherEl.height;
    const otherCenterX = otherEl.x + otherEl.width / 2;
    const otherCenterY = otherEl.y + otherEl.height / 2;

    const currentLeft = snapX;
    const currentRight = snapX + mainElement.width;
    const currentTop = snapY;
    const currentBottom = snapY + mainElement.height;
    const currentCenterX = snapX + mainElement.width / 2;
    const currentCenterY = snapY + mainElement.height / 2;

    // Горизонтальная привязка (левые края)
    if (Math.abs(currentLeft - otherLeft) < SNAP_THRESHOLD) {
      snapX = otherLeft;
      activeSnapLines.push({ type: 'vertical', position: otherLeft });
    }

    // Горизонтальная привязка (правые края)
    if (Math.abs(currentRight - otherRight) < SNAP_THRESHOLD) {
      snapX = otherRight - mainElement.width;
      activeSnapLines.push({ type: 'vertical', position: otherRight });
    }

    // Горизонтальная привязка (левый край к правому)
    if (Math.abs(currentLeft - otherRight) < SNAP_THRESHOLD) {
      snapX = otherRight;
      activeSnapLines.push({ type: 'vertical', position: otherRight });
    }

    // Горизонтальная привязка (правый край к левому)
    if (Math.abs(currentRight - otherLeft) < SNAP_THRESHOLD) {
      snapX = otherLeft - mainElement.width;
      activeSnapLines.push({ type: 'vertical', position: otherLeft });
    }

    // Горизонтальная привязка (центры по вертикали)
    if (Math.abs(currentCenterX - otherCenterX) < SNAP_THRESHOLD) {
      snapX = otherCenterX - mainElement.width / 2;
      activeSnapLines.push({ type: 'vertical', position: otherCenterX });
    }

    // Горизонтальная привязка (левый край к центру другого элемента)
    if (Math.abs(currentLeft - otherCenterX) < SNAP_THRESHOLD) {
      snapX = otherCenterX;
      activeSnapLines.push({ type: 'vertical', position: otherCenterX });
    }

    // Горизонтальная привязка (правый край к центру другого элемента)
    if (Math.abs(currentRight - otherCenterX) < SNAP_THRESHOLD) {
      snapX = otherCenterX - mainElement.width;
      activeSnapLines.push({ type: 'vertical', position: otherCenterX });
    }

    // Вертикальная привязка (верхние края)
    if (Math.abs(currentTop - otherTop) < SNAP_THRESHOLD) {
      snapY = otherTop;
      activeSnapLines.push({ type: 'horizontal', position: otherTop });
    }

    // Вертикальная привязка (нижние края)
    if (Math.abs(currentBottom - otherBottom) < SNAP_THRESHOLD) {
      snapY = otherBottom - mainElement.height;
      activeSnapLines.push({ type: 'horizontal', position: otherBottom });
    }

    // Вертикальная привязка (верхний край к нижнему)
    if (Math.abs(currentTop - otherBottom) < SNAP_THRESHOLD) {
      snapY = otherBottom;
      activeSnapLines.push({ type: 'horizontal', position: otherBottom });
    }

    // Вертикальная привязка (нижний край к верхнему)
    if (Math.abs(currentBottom - otherTop) < SNAP_THRESHOLD) {
      snapY = otherTop - mainElement.height;
      activeSnapLines.push({ type: 'horizontal', position: otherTop });
    }

    // Вертикальная привязка (центры по горизонтали)
    if (Math.abs(currentCenterY - otherCenterY) < SNAP_THRESHOLD) {
      snapY = otherCenterY - mainElement.height / 2;
      activeSnapLines.push({ type: 'horizontal', position: otherCenterY });
    }

    // Вертикальная привязка (верхний край к центру другого элемента)
    if (Math.abs(currentTop - otherCenterY) < SNAP_THRESHOLD) {
      snapY = otherCenterY;
      activeSnapLines.push({ type: 'horizontal', position: otherCenterY });
    }

    // Вертикальная привязка (нижний край к центру другого элемента)
    if (Math.abs(currentBottom - otherCenterY) < SNAP_THRESHOLD) {
      snapY = otherCenterY - mainElement.height;
      activeSnapLines.push({ type: 'horizontal', position: otherCenterY });
    }
  });

  return {
    x: snapX,
    y: snapY,
    snapLines: activeSnapLines
  };
};

/**
 * Вычисляет расстояния от элемента до краёв canvas
 * Используется для отображения при зажатом Alt
 */
export const getDistancesToEdges = (element, canvasSettings) => {
  return {
    left: element.x,
    right: canvasSettings.width - (element.x + element.width),
    top: element.y,
    bottom: canvasSettings.height - (element.y + element.height)
  };
};
