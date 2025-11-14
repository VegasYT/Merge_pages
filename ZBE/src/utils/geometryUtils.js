/**
 * Утилиты для геометрических вычислений
 */

/**
 * Преобразует координаты экрана в координаты canvas
 */
export const screenToCanvas = (clientX, clientY, canvasRect, zoom, canvasOffset, canvasSettings) => {
  const canvasCenterX = canvasRect.left + canvasRect.width / 2;
  const canvasCenterY = canvasRect.top + canvasRect.height / 2;

  const relativeX = (clientX - canvasCenterX) / zoom;
  const relativeY = (clientY - canvasCenterY) / zoom;

  const x = relativeX + canvasSettings.width / 2 - canvasOffset.x / zoom;
  const y = relativeY + canvasSettings.height / 2 - canvasOffset.y / zoom;

  return { x, y };
};

/**
 * Преобразует координаты экрана в координаты canvas (упрощённая версия)
 * Используется при клике на canvas
 */
export const screenToCanvasSimple = (clientX, clientY, canvasRect, zoom) => {
  const x = (clientX - canvasRect.left) / zoom;
  const y = (clientY - canvasRect.top) / zoom;
  return { x, y };
};

/**
 * Проверяет, находится ли точка внутри прямоугольника
 */
export const isPointInRect = (pointX, pointY, rect) => {
  return (
    pointX >= rect.x &&
    pointX <= rect.x + rect.width &&
    pointY >= rect.y &&
    pointY <= rect.y + rect.height
  );
};

/**
 * Проверяет, пересекаются ли два прямоугольника
 */
export const doRectsIntersect = (rect1, rect2) => {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
};

/**
 * Получает границы прямоугольника выделения
 */
export const getSelectionRect = (start, end) => {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  return { x, y, width, height };
};

/**
 * Вычисляет расстояние между двумя точками
 */
export const getDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Вычисляет центр элемента
 */
export const getElementCenter = (element) => {
  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2
  };
};

/**
 * Получает границы элемента
 */
export const getElementBounds = (element) => {
  return {
    left: element.x,
    right: element.x + element.width,
    top: element.y,
    bottom: element.y + element.height,
    centerX: element.x + element.width / 2,
    centerY: element.y + element.height / 2
  };
};
