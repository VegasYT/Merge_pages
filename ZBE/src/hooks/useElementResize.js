import { measureTextSize } from '../utils/textUtils';

/**
 * Хук для изменения размера элементов с привязкой
 */
export const useElementResize = ({
  zoom,
  canvasSettings,
  elements,
  updateElement,
  setSnapLines,
  startBatch,
  endBatch
}) => {

  const handleResize = (e, element, direction) => {
    e.stopPropagation();

    // Начинаем группировку для истории (предотвращает запись промежуточных состояний)
    if (startBatch) startBatch();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;
    const startPosX = element.x;
    const startPosY = element.y;
    const aspectRatio = startWidth / startHeight;

    const onMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / zoom;
      const deltaY = (moveEvent.clientY - startY) / zoom;
      const isShiftPressed = moveEvent.shiftKey;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      if (element.type_name === "text") {
        const { width: minW } = measureTextSize(
          element.props?.content,
          element.props?.fontSize,
          element.props?.fontWeight,
          element.props?.lineHeight,
          element.props?.letterSpacing
        );

        if (direction.includes("e")) {
          newWidth = Math.max(minW, startWidth + deltaX);
          if (isShiftPressed) newHeight = newWidth / aspectRatio;
        }
        if (direction.includes("w")) {
          newWidth = Math.max(minW, startWidth - deltaX);
          newX = startPosX + (startWidth - newWidth);
          if (isShiftPressed) newHeight = newWidth / aspectRatio;
        }
        const { height: calculatedHeight } = measureTextSize(
          element.props?.content,
          element.props?.fontSize,
          element.props?.fontWeight,
          element.props?.lineHeight,
          element.props?.letterSpacing,
          newWidth
        );
        if (direction.includes("s")) {
          newHeight = Math.max(calculatedHeight, startHeight + deltaY);
          if (isShiftPressed) newWidth = newHeight * aspectRatio;
        }
        if (direction.includes("n")) {
          newHeight = Math.max(calculatedHeight, startHeight - deltaY);
          newY = startPosY + (startHeight - newHeight);
          if (isShiftPressed) newWidth = newHeight * aspectRatio;
        }
        if (!direction.includes("s") && !direction.includes("n")) {
          newHeight = calculatedHeight;
        }
      } else {
        if (direction.includes("e")) {
          newWidth = Math.max(50, startWidth + deltaX);
          if (isShiftPressed) newHeight = newWidth / aspectRatio;
        }
        if (direction.includes("w")) {
          newWidth = Math.max(50, startWidth - deltaX);
          newX = startPosX + (startWidth - newWidth);
          if (isShiftPressed) newHeight = newWidth / aspectRatio;
        }
        if (direction.includes("s")) {
          newHeight = Math.max(30, startHeight + deltaY);
          if (isShiftPressed) newWidth = newHeight * aspectRatio;
        }
        if (direction.includes("n")) {
          newHeight = Math.max(30, startHeight - deltaY);
          newY = startPosY + (startHeight - newHeight);
          if (isShiftPressed) newWidth = newHeight * aspectRatio;
        }

        // Диагональное изменение размера
        if (direction === "se" || direction === "ne" || direction === "sw" || direction === "nw") {
          newWidth = Math.max(50, startWidth + (direction.includes("e") ? deltaX : -deltaX));
          newHeight = Math.max(30, startHeight + (direction.includes("s") ? deltaY : -deltaY));

          if (direction.includes("w")) {
            newX = startPosX + (startWidth - newWidth);
          }
          if (direction.includes("n")) {
            newY = startPosY + (startHeight - newHeight);
          }

          if (isShiftPressed) {
            const deltaMax = Math.max(Math.abs(deltaX), Math.abs(deltaY));

            // Определяем знак в зависимости от направления угла
            let sign;
            if (direction === "se") {
              // Правый нижний: + при движении вправо-вниз
              sign = (deltaX + deltaY) > 0 ? 1 : -1;
            } else if (direction === "nw") {
              // Левый верхний: + при движении влево-вверх (оба отрицательные)
              sign = (deltaX + deltaY) < 0 ? 1 : -1;
            } else if (direction === "ne") {
              // Правый верхний: + при движении вправо-вверх
              sign = (deltaX - deltaY) > 0 ? 1 : -1;
            } else if (direction === "sw") {
              // Левый нижний: + при движении влево-вниз
              sign = (deltaY - deltaX) > 0 ? 1 : -1;
            }

            newWidth = Math.max(50, startWidth + sign * deltaMax);
            newHeight = newWidth / aspectRatio;

            if (direction.includes("w")) {
              newX = startPosX + (startWidth - newWidth);
            }
            if (direction.includes("n")) {
              newY = startPosY + (startHeight - newHeight);
            }
          }
        }
      }

      // Привязка к краям и другим элементам
      const SNAP_THRESHOLD = 8;
      const activeSnapLines = [];

      const currentLeft = newX;
      const currentRight = newX + newWidth;
      const currentTop = newY;
      const currentBottom = newY + newHeight;
      const currentCenterX = newX + newWidth / 2;
      const currentCenterY = newY + newHeight / 2;

      // Привязка к краям канваса
      if (direction.includes("e") && Math.abs(currentRight - canvasSettings.width) < SNAP_THRESHOLD) {
        newWidth = canvasSettings.width - newX;
        activeSnapLines.push({ type: 'vertical', position: canvasSettings.width });
      }
      if (direction.includes("w") && Math.abs(currentLeft) < SNAP_THRESHOLD) {
        const widthDiff = newX - 0;
        newX = 0;
        newWidth = newWidth + widthDiff;
        activeSnapLines.push({ type: 'vertical', position: 0 });
      }
      if (direction.includes("s") && Math.abs(currentBottom - canvasSettings.height) < SNAP_THRESHOLD) {
        newHeight = canvasSettings.height - newY;
        activeSnapLines.push({ type: 'horizontal', position: canvasSettings.height });
      }
      if (direction.includes("n") && Math.abs(currentTop) < SNAP_THRESHOLD) {
        const heightDiff = newY - 0;
        newY = 0;
        newHeight = newHeight + heightDiff;
        activeSnapLines.push({ type: 'horizontal', position: 0 });
      }

      // Привязка к центру канваса
      const canvasCenterX = canvasSettings.width / 2;
      const canvasCenterY = canvasSettings.height / 2;

      if (direction.includes("e") && Math.abs(currentCenterX - canvasCenterX) < SNAP_THRESHOLD) {
        newWidth = (canvasCenterX - newX) * 2;
        activeSnapLines.push({ type: 'vertical', position: canvasCenterX });
      }
      if (direction.includes("w") && Math.abs(currentCenterX - canvasCenterX) < SNAP_THRESHOLD) {
        const newWidthFromCenter = (currentRight - canvasCenterX) * 2;
        newX = currentRight - newWidthFromCenter;
        newWidth = newWidthFromCenter;
        activeSnapLines.push({ type: 'vertical', position: canvasCenterX });
      }
      if (direction.includes("s") && Math.abs(currentCenterY - canvasCenterY) < SNAP_THRESHOLD) {
        newHeight = (canvasCenterY - newY) * 2;
        activeSnapLines.push({ type: 'horizontal', position: canvasCenterY });
      }
      if (direction.includes("n") && Math.abs(currentCenterY - canvasCenterY) < SNAP_THRESHOLD) {
        const newHeightFromCenter = (currentBottom - canvasCenterY) * 2;
        newY = currentBottom - newHeightFromCenter;
        newHeight = newHeightFromCenter;
        activeSnapLines.push({ type: 'horizontal', position: canvasCenterY });
      }

      // Края элемента к центральным осям
      if (direction.includes("e") && Math.abs(currentRight - canvasCenterX) < SNAP_THRESHOLD) {
        newWidth = canvasCenterX - newX;
        activeSnapLines.push({ type: 'vertical', position: canvasCenterX });
      }
      if (direction.includes("w") && Math.abs(currentLeft - canvasCenterX) < SNAP_THRESHOLD) {
        const widthDiff = newX - canvasCenterX;
        newX = canvasCenterX;
        newWidth = newWidth + widthDiff;
        activeSnapLines.push({ type: 'vertical', position: canvasCenterX });
      }
      if (direction.includes("s") && Math.abs(currentBottom - canvasCenterY) < SNAP_THRESHOLD) {
        newHeight = canvasCenterY - newY;
        activeSnapLines.push({ type: 'horizontal', position: canvasCenterY });
      }
      if (direction.includes("n") && Math.abs(currentTop - canvasCenterY) < SNAP_THRESHOLD) {
        const heightDiff = newY - canvasCenterY;
        newY = canvasCenterY;
        newHeight = newHeight + heightDiff;
        activeSnapLines.push({ type: 'horizontal', position: canvasCenterY });
      }

      // Привязка к другим элементам
      elements.forEach((otherEl) => {
        if (otherEl.id === element.id) return;

        const otherLeft = otherEl.x;
        const otherRight = otherEl.x + otherEl.width;
        const otherTop = otherEl.y;
        const otherBottom = otherEl.y + otherEl.height;
        const otherCenterX = otherEl.x + otherEl.width / 2;
        const otherCenterY = otherEl.y + otherEl.height / 2;

        if (direction.includes("e")) {
          if (Math.abs(currentRight - otherRight) < SNAP_THRESHOLD) {
            newWidth = otherRight - newX;
            activeSnapLines.push({ type: 'vertical', position: otherRight });
          }
          if (Math.abs(currentRight - otherLeft) < SNAP_THRESHOLD) {
            newWidth = otherLeft - newX;
            activeSnapLines.push({ type: 'vertical', position: otherLeft });
          }
          if (Math.abs(currentCenterX - otherCenterX) < SNAP_THRESHOLD) {
            newWidth = (otherCenterX - newX) * 2;
            activeSnapLines.push({ type: 'vertical', position: otherCenterX });
          }
          if (Math.abs(currentRight - otherCenterX) < SNAP_THRESHOLD) {
            newWidth = otherCenterX - newX;
            activeSnapLines.push({ type: 'vertical', position: otherCenterX });
          }
        }

        if (direction.includes("w")) {
          if (Math.abs(currentLeft - otherLeft) < SNAP_THRESHOLD) {
            const widthDiff = newX - otherLeft;
            newX = otherLeft;
            newWidth = newWidth + widthDiff;
            activeSnapLines.push({ type: 'vertical', position: otherLeft });
          }
          if (Math.abs(currentLeft - otherRight) < SNAP_THRESHOLD) {
            const widthDiff = newX - otherRight;
            newX = otherRight;
            newWidth = newWidth + widthDiff;
            activeSnapLines.push({ type: 'vertical', position: otherRight });
          }
          if (Math.abs(currentCenterX - otherCenterX) < SNAP_THRESHOLD) {
            const newWidthFromCenter = (currentRight - otherCenterX) * 2;
            newX = currentRight - newWidthFromCenter;
            newWidth = newWidthFromCenter;
            activeSnapLines.push({ type: 'vertical', position: otherCenterX });
          }
          if (Math.abs(currentLeft - otherCenterX) < SNAP_THRESHOLD) {
            const widthDiff = newX - otherCenterX;
            newX = otherCenterX;
            newWidth = newWidth + widthDiff;
            activeSnapLines.push({ type: 'vertical', position: otherCenterX });
          }
        }

        if (direction.includes("s")) {
          if (Math.abs(currentBottom - otherBottom) < SNAP_THRESHOLD) {
            newHeight = otherBottom - newY;
            activeSnapLines.push({ type: 'horizontal', position: otherBottom });
          }
          if (Math.abs(currentBottom - otherTop) < SNAP_THRESHOLD) {
            newHeight = otherTop - newY;
            activeSnapLines.push({ type: 'horizontal', position: otherTop });
          }
          if (Math.abs(currentCenterY - otherCenterY) < SNAP_THRESHOLD) {
            newHeight = (otherCenterY - newY) * 2;
            activeSnapLines.push({ type: 'horizontal', position: otherCenterY });
          }
          if (Math.abs(currentBottom - otherCenterY) < SNAP_THRESHOLD) {
            newHeight = otherCenterY - newY;
            activeSnapLines.push({ type: 'horizontal', position: otherCenterY });
          }
        }

        if (direction.includes("n")) {
          if (Math.abs(currentTop - otherTop) < SNAP_THRESHOLD) {
            const heightDiff = newY - otherTop;
            newY = otherTop;
            newHeight = newHeight + heightDiff;
            activeSnapLines.push({ type: 'horizontal', position: otherTop });
          }
          if (Math.abs(currentTop - otherBottom) < SNAP_THRESHOLD) {
            const heightDiff = newY - otherBottom;
            newY = otherBottom;
            newHeight = newHeight + heightDiff;
            activeSnapLines.push({ type: 'horizontal', position: otherBottom });
          }
          if (Math.abs(currentCenterY - otherCenterY) < SNAP_THRESHOLD) {
            const newHeightFromCenter = (currentBottom - otherCenterY) * 2;
            newY = currentBottom - newHeightFromCenter;
            newHeight = newHeightFromCenter;
            activeSnapLines.push({ type: 'horizontal', position: otherCenterY });
          }
          if (Math.abs(currentTop - otherCenterY) < SNAP_THRESHOLD) {
            const heightDiff = newY - otherCenterY;
            newY = otherCenterY;
            newHeight = newHeight + heightDiff;
            activeSnapLines.push({ type: 'horizontal', position: otherCenterY });
          }
        }
      });

      // После всех привязок пересчитываем размеры для сохранения пропорций при зажатом Shift
      if (isShiftPressed && activeSnapLines.length > 0) {
        const hasVerticalSnap = activeSnapLines.some(line => line.type === 'vertical');
        const hasHorizontalSnap = activeSnapLines.some(line => line.type === 'horizontal');

        // Если произошла только вертикальная привязка (изменилась ширина), пересчитываем высоту
        if (hasVerticalSnap && !hasHorizontalSnap) {
          newHeight = newWidth / aspectRatio;

          // Корректируем Y координату для направлений с 'n'
          if (direction.includes("n")) {
            newY = startPosY + startHeight - newHeight;
          }
        }

        // Если произошла только горизонтальная привязка (изменилась высота), пересчитываем ширину
        if (hasHorizontalSnap && !hasVerticalSnap) {
          newWidth = newHeight * aspectRatio;

          // Корректируем X координату для направлений с 'w'
          if (direction.includes("w")) {
            newX = startPosX + startWidth - newWidth;
          }
        }

        // Если произошла привязка по обеим осям (диагональное изменение), используем наибольшее изменение
        if (hasVerticalSnap && hasHorizontalSnap) {
          const widthChange = Math.abs(newWidth - startWidth);
          const heightChange = Math.abs(newHeight - startHeight);

          if (widthChange > heightChange) {
            newHeight = newWidth / aspectRatio;
            if (direction.includes("n")) {
              newY = startPosY + startHeight - newHeight;
            }
          } else {
            newWidth = newHeight * aspectRatio;
            if (direction.includes("w")) {
              newX = startPosX + startWidth - newWidth;
            }
          }
        }
      }

      setSnapLines(activeSnapLines);
      updateElement(element.id, { width: newWidth, height: newHeight, x: newX, y: newY });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      setSnapLines([]);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";

      // Завершаем группировку и сохраняем финальное состояние в историю
      if (endBatch) endBatch();
    };

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return { handleResize };
};
