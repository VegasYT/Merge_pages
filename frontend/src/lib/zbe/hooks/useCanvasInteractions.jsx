import { useEffect } from 'react';
import { screenToCanvasSimple, getSelectionRect } from '../utils/geometryUtils.jsx';
import { applySnapping } from '../utils/snapUtils.jsx';
import { getElementsInSelection } from '../utils/elementUtils.jsx';

export const useCanvasInteractions = ({
  canvasRef,
  containerRef,
  zoom,
  canvasOffset,
  setCanvasOffset,
  canvasSettings,
  elements,
  setElements,
  selectedElement,
  setSelectedElement,
  selectedElements,
  setSelectedElements,
  isDragging,
  setIsDragging,
  dragOffset,
  setDragOffset,
  isSelecting,
  setIsSelecting,
  selectionStart,
  setSelectionStart,
  selectionEnd,
  setSelectionEnd,
  isPanning,
  setIsPanning,
  panStart,
  setPanStart,
  setSnapLines,
  setShowElementSettings,
  startDragging,
  stopDragging,
  startSelection,
  updateSelectionEnd,
  finishSelection,
  selectMultipleElements,
  clearSelection,
  addToSelection,
}) => {

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isPanning) {
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        setCanvasOffset({
          x: canvasOffset.x + deltaX,
          y: canvasOffset.y + deltaY,
        });
        setPanStart({ x: e.clientX, y: e.clientY });
        return;
      }

      if (isSelecting) {
        const canvas = canvasRef.current.getBoundingClientRect();
        const pos = screenToCanvasSimple(e.clientX, e.clientY, canvas, zoom);
        updateSelectionEnd(pos.x, pos.y);
        return;
      }

      if (isDragging && selectedElement) {
        const canvas = canvasRef.current.getBoundingClientRect();
        let newX = (e.clientX - canvas.left - dragOffset.x) / zoom;
        let newY = (e.clientY - canvas.top - dragOffset.y) / zoom;

        const elementsToMove = selectedElements.length > 0 ? selectedElements : [selectedElement];
        const mainElement = elements.find(el => el.id === selectedElement);

        if (mainElement) {
          const snappingResult = applySnapping(
            newX,
            newY,
            mainElement,
            elements,
            canvasSettings,
            elementsToMove
          );

          newX = snappingResult.x;
          newY = snappingResult.y;
          setSnapLines(snappingResult.snapLines);

          setElements((prev) => {
            const currentMainElement = prev.find(el => el.id === selectedElement);
            if (!currentMainElement) return prev;

            const deltaX = newX - currentMainElement.x;
            const deltaY = newY - currentMainElement.y;

            return prev.map((el) => {
              if (elementsToMove.includes(el.id)) {
                return { ...el, x: el.x + deltaX, y: el.y + deltaY };
              }
              return el;
            });
          });
        }
      }
    };

    const handleMouseUp = (e) => {
      if (isPanning) {
        setIsPanning(false);
        document.body.style.cursor = "";
        return;
      }

      if (isSelecting) {
        finishSelection();

        const selectionRect = getSelectionRect(selectionStart, selectionEnd);
        const selectedIds = getElementsInSelection(elements, selectionRect).map(el => el.id);

        if (e.ctrlKey || e.metaKey) {
          addToSelection(selectedIds);
        } else {
          selectMultipleElements(selectedIds);
          setShowElementSettings(selectedIds.length === 1);
        }
        return;
      }

      if (isDragging) {
        stopDragging();
        setSnapLines([]);
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isPanning,
    panStart,
    canvasOffset,
    isSelecting,
    selectionStart,
    selectionEnd,
    isDragging,
    selectedElement,
    selectedElements,
    dragOffset,
    zoom,
    elements,
    canvasSettings,
    canvasRef,
    setCanvasOffset,
    setPanStart,
    updateSelectionEnd,
    finishSelection,
    getSelectionRect,
    getElementsInSelection,
    addToSelection,
    selectMultipleElements,
    setShowElementSettings,
    stopDragging,
    setSnapLines,
    applySnapping,
    setElements
  ]);

  return {};
};