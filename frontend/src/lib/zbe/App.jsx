import React, { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Type,
  Square,
  Image,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Plus,
  MousePointerSquareDashed,
  Film
} from "lucide-react";
import { useElementTypes } from "./useElementTypes.jsx";
import ElementRenderer from "./ElementRenderer.jsx";
import DynamicSettings from "./DynamicSettings.jsx";

// Импорт хуков
import { useCanvas } from "./hooks/useCanvas.jsx";
import { useElements } from "./hooks/useElements.jsx";
import { useSelection } from "./hooks/useSelection.jsx";
import { useClipboard } from "./hooks/useClipboard.jsx";
import { useKeyboard } from "./hooks/useKeyboard.jsx";
import { useDragAndDrop } from "./hooks/useDragAndDrop.jsx";
import { useMouse } from "./hooks/useMouse.jsx";
import { useSnapLines } from "./hooks/useSnapLines.jsx";
import { useElementResize } from "./hooks/useElementResize.jsx";
import { useBreakpoints } from "./hooks/useBreakpoints.jsx";

// Импорт утилит
import { createElement } from "./utils/elementUtils.jsx";
import { measureTextSize, generateUniqueName } from "./utils/textUtils.jsx";
import { convertResponsiveToBreakpoints, convertLayersToElements } from "./utils/dataConverter.jsx";

// Импорт компонентов
import { SnapLines, SelectionBox, DistanceLines } from "./components/Canvas/index.jsx";
import BreakpointPanel from "./components/BreakpointPanel.jsx";
import { mergeElementWithBreakpoint } from "./utils/breakpointUtils.jsx";
import ContextMenu from "./components/ContextMenu.jsx";

export default function App({ initialData, onGetData }) {
  // Загружаем типы элементов
  const {
    getTypeConfig,
    getTypeSchema,
    getDefaultProps,
    getDefaultSize,
    getAvailableTypes
  } = useElementTypes(initialData?.zeroBaseElements);

  // Используем кастомные хуки

  // Преобразуем initialData для брейкпоинтов
  const initialBreakpoints = initialData?.zeroBlockResponsive
    ? convertResponsiveToBreakpoints(initialData.zeroBlockResponsive)
    : null;

  // Брейкпоинты
  const {
    breakpoints,
    setBreakpoints,
    activeBreakpointId,
    getActiveBreakpoint,
    getDefaultBreakpoint,
    addBreakpoint,
    updateBreakpoint,
    deleteBreakpoint,
    setActiveBreakpoint,
  } = useBreakpoints(initialBreakpoints);

  const activeBreakpoint = getActiveBreakpoint();
  const defaultBreakpoint = getDefaultBreakpoint();

  const canvasHook = useCanvas();
  const {
    zoom,
    setZoom,
    canvasOffset,
    setCanvasOffset,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
  } = canvasHook;

  const elementsHook = useElements(activeBreakpointId, defaultBreakpoint.id);
  const {
    elements,
    setElements,
    addElement,
    updateElement,
    updateElementProp,
    deleteElements,
    moveLayer,
    duplicateElement: duplicateElementHook,
    undo,
    redo,
    startBatch,
    endBatch,
  } = elementsHook;

  const selectionHook = useSelection();
  const {
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    isSelecting,
    setIsSelecting,
    selectionStart,
    selectionEnd,
    selectElement,
    selectMultipleElements,
    clearSelection,
    startSelection,
    updateSelectionEnd,
  } = selectionHook;

  const clipboardHook = useClipboard();
  const {
    clipboard,
    copyToClipboard,
    pasteFromClipboard,
  } = clipboardHook;

  const dragDropHook = useDragAndDrop();
  const {
    isDragging,
    setIsDragging,
    dragOffset,
    setDragOffset,
  } = dragDropHook;

  const mouseHook = useMouse();
  const {
    mousePos,
    setMousePos,
    hoveredElement,
    setHoveredElement,
  } = mouseHook;

  const snapLinesHook = useSnapLines();
  const {
    snapLines,
    setSnapLines,
  } = snapLinesHook;

  // Хук для изменения размера элементов
  const { handleResize } = useElementResize({
    zoom,
    canvasSettings: activeBreakpoint,
    elements,
    updateElement,
    setSnapLines,
    startBatch,
    endBatch,
  });

  // Локальные состояния (не вынесенные в хуки)
  const [showElementSettings, setShowElementSettings] = useState(true);
  const [tempSize, setTempSize] = useState({ width: "", height: "" });
  const [tempCanvasHeight, setTempCanvasHeight] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y } или null
  const [showLayersPanel, setShowLayersPanel] = useState(true); // Видимость панели слоев

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const isFirstRender = useRef(true);
  const isInitialDataLoaded = useRef(false);

  // Загрузка initialData при первом монтировании
  useEffect(() => {
    // Загружаем данные только один раз
    if (isInitialDataLoaded.current) return;

    if (initialData?.zeroLayers && initialData.zeroLayers.length > 0) {
      console.log('🔄 Loading initial data into ZBE...');
      console.log('  - Layers:', initialData.zeroLayers.length);
      console.log('  - Layer Responsive:', initialData.zeroLayerResponsive?.length || 0);
      console.log('  - Breakpoints:', breakpoints.length);

      try {
        // Преобразуем layers в элементы ZBE
        const loadedElements = convertLayersToElements(
          initialData.zeroLayers,
          initialData.zeroLayerResponsive || [],
          initialData.zeroBaseElements || [],
          breakpoints
        );

        if (loadedElements.length > 0) {
          console.log('✅ Loaded elements:', loadedElements.length);
          setElements(loadedElements);
        } else {
          console.warn('⚠️ No elements were loaded from initialData');
        }
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
      }

      isInitialDataLoaded.current = true;
    } else {
      console.log('ℹ️ No initial layers to load');
      isInitialDataLoaded.current = true;
    }
  }, [initialData, breakpoints]);

  // Отслеживаем изменения данных и передаем их в wrapper
  useEffect(() => {
    // Пропускаем первый рендер (инициализацию)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Передаем актуальные данные в wrapper
    if (onGetData) {
      onGetData({
        elements,
        breakpoints,
      });
    }
  }, [elements, breakpoints, onGetData]);

  // measureTextSize и generateName перенесены в utils/textUtils.js

  // --- Add element -------------------------------------------------------
 const addElementToCanvas = (typeName) => {
    const typeConfig = getTypeConfig(typeName);
    if (!typeConfig) {
      console.error(`Тип "${typeName}" не найден`);
      return;
    }

    const defaultProps = getDefaultProps(typeName);
    const defaultSize = getDefaultSize(typeName);

    // Генерируем уникальное имя для элемента
    const baseName = typeConfig.displayName || typeName;
    const generatedName = generateUniqueName(baseName, typeName, elements);

    const position = {
      x: 50 - canvasOffset.x / zoom,
      y: 50 - canvasOffset.y / zoom
    };

    // Вычисляем максимальный zIndex и добавляем +1
    const maxZIndex = elements.length > 0
      ? Math.max(...elements.map(el => el.zIndex || 0))
      : -1;
    const newZIndex = maxZIndex + 1;

    const newElement = createElement(typeName, typeConfig, defaultProps, defaultSize, position, generatedName, newZIndex);

    addElement(newElement);
    selectElement(newElement.id);
    setShowElementSettings(true);
};

  // --- Selection, dragging ----------------------------------------------
  const handleMouseDown = (e, element) => {
    // Закрываем контекстное меню только при клике левой кнопкой
    if (contextMenu && e.button === 0) {
      setContextMenu(null);
    }

    // СРЕДНЯЯ КНОПКА (колесико) - запускаем панорамирование
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      // Закрываем контекстное меню при панорамировании
      if (contextMenu) {
        setContextMenu(null);
      }
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      document.body.style.cursor = "grabbing";
      return;
    }

    // ПРАВАЯ КНОПКА - игнорируем
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Обрабатываем только левую кнопку мыши (button === 0)
    if (e.button !== 0) {
      return;
    }

    if (e.target.closest(".resize-handle")) return;
    e.stopPropagation();

    // Множественный выбор с Ctrl
    if (e.ctrlKey || e.metaKey) {
      // Получаем текущий список выбранных (включая одиночный выбор)
      const currentSelected = selectedElements.length > 0
        ? selectedElements
        : (selectedElement ? [selectedElement] : []);

      if (currentSelected.includes(element.id)) {
        // Убираем элемент из выбора
        const newSelected = currentSelected.filter(id => id !== element.id);
        setSelectedElements(newSelected);
        if (newSelected.length === 1) {
          setSelectedElement(newSelected[0]);
        } else if (newSelected.length === 0) {
          setSelectedElement(null);
        }
      } else {
        // Добавляем элемент к выбору
        const newSelected = [...currentSelected, element.id];
        setSelectedElements(newSelected);
        setSelectedElement(element.id);
      }
      setShowElementSettings(false);
    } else {
      // Обычный выбор одного элемента
      if (selectedElements.length > 0) {
        // Если кликнули на один из выбранных элементов, начинаем перетаскивание группы
        if (selectedElements.includes(element.id)) {
          setSelectedElement(element.id); // Обновляем главный элемент на тот, который схватили
          setIsDragging(true);
          startBatch(); // Начинаем группировку для истории
          const rect = e.currentTarget.getBoundingClientRect();
          setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        } else {
          // Выбираем новый элемент и сбрасываем множественный выбор
          setSelectedElement(element.id);
          setSelectedElements([]);
          setShowElementSettings(true);
        }
      } else {
        setSelectedElement(element.id);
        setSelectedElements([]);
        setIsDragging(true);
        startBatch(); // Начинаем группировку для истории
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setShowElementSettings(true);
      }
    }

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
  };

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();

      // Не открываем меню, если идет панорамирование или выделение
      // isDragging не проверяем, так как при ПКМ он не должен быть активен
      if (isPanning || isSelecting) {
        return;
      }

      // Если контекстное меню уже открыто, просто закрываем его
      if (contextMenu) {
        setContextMenu(null);
        return;
      }

      // Показываем контекстное меню в позиции курсора
      // Сохраняем также текущий offset канваса для синхронизации при панорамировании
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        initialCanvasOffset: { ...canvasOffset },
      });
    };

    const canvas = containerRef.current;
    if (canvas) {
      canvas.addEventListener('contextmenu', handleContextMenu);
      return () => canvas.removeEventListener('contextmenu', handleContextMenu);
    }
  }, [containerRef, canvasOffset, contextMenu, isPanning, isSelecting]);

  const handleMouseMove = (e) => {
    if (isPanning) {
      // Проверяем, что средняя кнопка действительно нажата
      // Если нет - значит mouseup был пропущен, останавливаем панорамирование
      if (!(e.buttons & 4)) {
        setIsPanning(false);
        document.body.style.cursor = "";
        return;
      }

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
      // Проверяем, что левая кнопка действительно нажата
      if (!(e.buttons & 1)) {
        setIsSelecting(false);
        return;
      }

      const canvas = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - canvas.left) / zoom;
      const y = (e.clientY - canvas.top) / zoom;
      updateSelectionEnd(x, y);
      return;
    }

    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const canvasCenterX = canvasRect.left + canvasRect.width / 2;
      const canvasCenterY = canvasRect.top + canvasRect.height / 2;
      const relativeX = (e.clientX - canvasCenterX) / zoom;
      const relativeY = (e.clientY - canvasCenterY) / zoom;
      const x = relativeX + activeBreakpoint.width / 2 - canvasOffset.x / zoom;
      const y = relativeY + activeBreakpoint.height / 2 - canvasOffset.y / zoom;
      setMousePos({ x, y });
    }

    if (isDragging && selectedElement) {
      // Проверяем, что левая кнопка действительно нажата
      if (!(e.buttons & 1)) {
        setIsDragging(false);
        setSnapLines([]);
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        return;
      }

      const canvas = canvasRef.current.getBoundingClientRect();
      let newX = (e.clientX - canvas.left - dragOffset.x) / zoom;
      let newY = (e.clientY - canvas.top - dragOffset.y) / zoom;

      const elementsToMove = selectedElements.length > 0 ? selectedElements : [selectedElement];
      const baseMainElement = elements.find(el => el.id === selectedElement);
      const mainElement = mergeElementWithBreakpoint(baseMainElement, activeBreakpointId);

      if (mainElement) {
        const SNAP_THRESHOLD = 8;
        const activeSnapLines = [];

        if (Math.abs(newX) < SNAP_THRESHOLD) {
          newX = 0;
          activeSnapLines.push({ type: 'vertical', position: 0 });
        }
        if (Math.abs(newX + mainElement.width - activeBreakpoint.width) < SNAP_THRESHOLD) {
          newX = activeBreakpoint.width - mainElement.width;
          activeSnapLines.push({ type: 'vertical', position: activeBreakpoint.width });
        }
        if (Math.abs(newY) < SNAP_THRESHOLD) {
          newY = 0;
          activeSnapLines.push({ type: 'horizontal', position: 0 });
        }
        if (Math.abs(newY + mainElement.height - activeBreakpoint.height) < SNAP_THRESHOLD) {
          newY = activeBreakpoint.height - mainElement.height;
          activeSnapLines.push({ type: 'horizontal', position: activeBreakpoint.height });
        }

        const canvasCenterX = activeBreakpoint.width / 2;
        const canvasCenterY = activeBreakpoint.height / 2;
        const elementCenterX = newX + mainElement.width / 2;
        const elementCenterY = newY + mainElement.height / 2;
        const elementLeft = newX;
        const elementRight = newX + mainElement.width;
        const elementTop = newY;
        const elementBottom = newY + mainElement.height;

        if (Math.abs(elementCenterX - canvasCenterX) < SNAP_THRESHOLD) {
          newX = canvasCenterX - mainElement.width / 2;
          activeSnapLines.push({ type: 'vertical', position: canvasCenterX });
        }
        if (Math.abs(elementCenterY - canvasCenterY) < SNAP_THRESHOLD) {
          newY = canvasCenterY - mainElement.height / 2;
          activeSnapLines.push({ type: 'horizontal', position: canvasCenterY });
        }

        if (Math.abs(elementLeft - canvasCenterX) < SNAP_THRESHOLD) {
          newX = canvasCenterX;
          activeSnapLines.push({ type: 'vertical', position: canvasCenterX });
        }
        if (Math.abs(elementRight - canvasCenterX) < SNAP_THRESHOLD) {
          newX = canvasCenterX - mainElement.width;
          activeSnapLines.push({ type: 'vertical', position: canvasCenterX });
        }
        if (Math.abs(elementTop - canvasCenterY) < SNAP_THRESHOLD) {
          newY = canvasCenterY;
          activeSnapLines.push({ type: 'horizontal', position: canvasCenterY });
        }
        if (Math.abs(elementBottom - canvasCenterY) < SNAP_THRESHOLD) {
          newY = canvasCenterY - mainElement.height;
          activeSnapLines.push({ type: 'horizontal', position: canvasCenterY });
        }

        elements.forEach((baseOtherEl) => {
          if (elementsToMove.includes(baseOtherEl.id)) return;

          // Применяем мердж для других элементов тоже
          const otherEl = mergeElementWithBreakpoint(baseOtherEl, activeBreakpointId);

          const otherLeft = otherEl.x;
          const otherRight = otherEl.x + otherEl.width;
          const otherTop = otherEl.y;
          const otherBottom = otherEl.y + otherEl.height;
          const otherCenterX = otherEl.x + otherEl.width / 2;
          const otherCenterY = otherEl.y + otherEl.height / 2;

          const currentLeft = newX;
          const currentRight = newX + mainElement.width;
          const currentTop = newY;
          const currentBottom = newY + mainElement.height;
          const currentCenterX = newX + mainElement.width / 2;
          const currentCenterY = newY + mainElement.height / 2;

          if (Math.abs(currentLeft - otherLeft) < SNAP_THRESHOLD) {
            newX = otherLeft;
            activeSnapLines.push({ type: 'vertical', position: otherLeft });
          }
          if (Math.abs(currentRight - otherRight) < SNAP_THRESHOLD) {
            newX = otherRight - mainElement.width;
            activeSnapLines.push({ type: 'vertical', position: otherRight });
          }
          if (Math.abs(currentLeft - otherRight) < SNAP_THRESHOLD) {
            newX = otherRight;
            activeSnapLines.push({ type: 'vertical', position: otherRight });
          }
          if (Math.abs(currentRight - otherLeft) < SNAP_THRESHOLD) {
            newX = otherLeft - mainElement.width;
            activeSnapLines.push({ type: 'vertical', position: otherLeft });
          }
          if (Math.abs(currentCenterX - otherCenterX) < SNAP_THRESHOLD) {
            newX = otherCenterX - mainElement.width / 2;
            activeSnapLines.push({ type: 'vertical', position: otherCenterX });
          }
          if (Math.abs(currentLeft - otherCenterX) < SNAP_THRESHOLD) {
            newX = otherCenterX;
            activeSnapLines.push({ type: 'vertical', position: otherCenterX });
          }
          if (Math.abs(currentRight - otherCenterX) < SNAP_THRESHOLD) {
            newX = otherCenterX - mainElement.width;
            activeSnapLines.push({ type: 'vertical', position: otherCenterX });
          }

          if (Math.abs(currentTop - otherTop) < SNAP_THRESHOLD) {
            newY = otherTop;
            activeSnapLines.push({ type: 'horizontal', position: otherTop });
          }
          if (Math.abs(currentBottom - otherBottom) < SNAP_THRESHOLD) {
            newY = otherBottom - mainElement.height;
            activeSnapLines.push({ type: 'horizontal', position: otherBottom });
          }
          if (Math.abs(currentTop - otherBottom) < SNAP_THRESHOLD) {
            newY = otherBottom;
            activeSnapLines.push({ type: 'horizontal', position: otherBottom });
          }
          if (Math.abs(currentBottom - otherTop) < SNAP_THRESHOLD) {
            newY = otherTop - mainElement.height;
            activeSnapLines.push({ type: 'horizontal', position: otherTop });
          }
          if (Math.abs(currentCenterY - otherCenterY) < SNAP_THRESHOLD) {
            newY = otherCenterY - mainElement.height / 2;
            activeSnapLines.push({ type: 'horizontal', position: otherCenterY });
          }
          if (Math.abs(currentTop - otherCenterY) < SNAP_THRESHOLD) {
            newY = otherCenterY;
            activeSnapLines.push({ type: 'horizontal', position: otherCenterY });
          }
          if (Math.abs(currentBottom - otherCenterY) < SNAP_THRESHOLD) {
            newY = otherCenterY - mainElement.height;
            activeSnapLines.push({ type: 'horizontal', position: otherCenterY });
          }
        });

        setSnapLines(activeSnapLines);
      }

      // Получаем текущий элемент с учетом брейкпоинта
      const currentMainElementMerged = mergeElementWithBreakpoint(
        elements.find(el => el.id === selectedElement),
        activeBreakpointId
      );

      if (currentMainElementMerged) {
        const deltaX = newX - currentMainElementMerged.x;
        const deltaY = newY - currentMainElementMerged.y;

        // Обновляем каждый элемент через updateElement, чтобы учитывался брейкпоинт
        elementsToMove.forEach((elId) => {
          const element = elements.find(el => el.id === elId);
          if (element) {
            const mergedEl = mergeElementWithBreakpoint(element, activeBreakpointId);
            updateElement(elId, {
              x: mergedEl.x + deltaX,
              y: mergedEl.y + deltaY
            });
          }
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
      setIsSelecting(false);

      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);

      // Применяем мерж с активным брейкпоинтом перед проверкой позиций
      const selectedIds = elements
        .filter(baseEl => {
          // Применяем настройки текущего брейкпоинта
          const el = mergeElementWithBreakpoint(baseEl, activeBreakpointId);

          const elLeft = el.x;
          const elRight = el.x + el.width;
          const elTop = el.y;
          const elBottom = el.y + el.height;

          return !(elRight < minX || elLeft > maxX || elBottom < minY || elTop > maxY);
        })
        .map(el => el.id);

      if (e.ctrlKey || e.metaKey) {
        const currentSelected = selectedElements.length > 0
          ? selectedElements
          : (selectedElement ? [selectedElement] : []);
        const newSelected = [...new Set([...currentSelected, ...selectedIds])];
        setSelectedElements(newSelected);
        if (newSelected.length > 0) {
          setSelectedElement(newSelected[0]);
        }
      } else {
        if (selectedIds.length > 0) {
          setSelectedElements(selectedIds);
          setSelectedElement(selectedIds[0]);
          setShowElementSettings(selectedIds.length === 1);
        }
      }
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      endBatch(); // Завершаем группировку и сохраняем финальное состояние в историю
      setSnapLines([]);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    }
  };

  const handleCanvasMouseDown = (e) => {
    // Закрываем контекстное меню только при клике левой кнопкой
    if (contextMenu && e.button === 0) {
      setContextMenu(null);
    }

    if (e.button === 1) {
      e.preventDefault();
      // Закрываем контекстное меню при панорамировании
      if (contextMenu) {
        setContextMenu(null);
      }
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      document.body.style.cursor = "grabbing";
      return;
    }

    if (e.button === 2) {
      e.preventDefault();
      return;
    }

    if (e.button === 0) {
      // Проверяем, что клик не на элементе (не имеет data-id)
      // Это позволяет начать выделение даже если курсор вне канваса
      if (!e.target.closest('[data-id]') && !e.target.closest('.resize-handle')) {
        const canvas = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - canvas.left) / zoom;
        const y = (e.clientY - canvas.top) / zoom;

        startSelection(x, y);

        if (!e.ctrlKey && !e.metaKey) {
          clearSelection();
        }
        setShowElementSettings(false);
      }
    }
  };

  // Обработка клавиатуры через хук
  const { isAltPressed } = useKeyboard({
    onUndo: () => {
      const success = undo();
      if (success) {
        // Сбрасываем выделение, так как элементы могли измениться
        clearSelection();
        setShowElementSettings(false);
      }
    },
    onRedo: () => {
      const success = redo();
      if (success) {
        // Сбрасываем выделение, так как элементы могли измениться
        clearSelection();
        setShowElementSettings(false);
      }
    },
    onCopy: () => {
      if (selectedElement || selectedElements.length > 0) {
        const idsToCopy = selectedElements.length > 0 ? selectedElements : (selectedElement ? [selectedElement] : []);
        if (idsToCopy.length > 0) {
          const elementsToCopy = elements.filter(el => idsToCopy.includes(el.id));
          copyToClipboard(elementsToCopy);
        }
      }
    },
    onPaste: () => {
      const newElements = pasteFromClipboard();
      if (newElements.length > 0) {
        setElements(prev => [...prev, ...newElements]);
        const newIds = newElements.map(el => el.id);
        selectMultipleElements(newIds);
        setShowElementSettings(newIds.length === 1);
      }
    },
    onDelete: () => {
      if (selectedElement || selectedElements.length > 0) {
        const idsToDelete = selectedElements.length > 0 ? selectedElements : (selectedElement ? [selectedElement] : []);
        if (idsToDelete.length > 0) {
          deleteElements(idsToDelete);
          clearSelection();
          setShowElementSettings(false);
        }
      }
    },
    onArrowMove: (key, step) => {
      if (selectedElement) {
        const element = elements.find(el => el.id === selectedElement);
        if (!element) return;

        let newX = element.x;
        let newY = element.y;

        switch (key) {
          case "ArrowUp":
            newY -= step;
            break;
          case "ArrowDown":
            newY += step;
            break;
          case "ArrowLeft":
            newX -= step;
            break;
          case "ArrowRight":
            newX += step;
            break;
          default:
            break;
        }

        updateElement(selectedElement, { x: newX, y: newY });
      }
    },
    onEscape: () => {
      clearSelection();
      setShowElementSettings(false);
    }
  });

  // Старый useEffect для клавиатуры удалён - теперь используется хук useKeyboard

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Track hovered element when alt is pressed - improved detection
  useEffect(() => {
  if (!isAltPressed || !selectedElement) {
    setHoveredElement(null);
    return;
  }

  const updateHoveredElement = () => {
    if (!canvasRef.current) return;

    let checkX, checkY;

    // === ОПРЕДЕЛЯЕМ ТОЧКУ ПРОВЕРКИ ===
    if (isDragging) {
      const baseDraggedEl = elements.find(el => el.id === selectedElement);
      if (!baseDraggedEl) return;
      const draggedEl = mergeElementWithBreakpoint(baseDraggedEl, activeBreakpointId);
      checkX = draggedEl.x + draggedEl.width / 2;
      checkY = draggedEl.y + draggedEl.height / 2;
    } else {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseInCanvasX = mousePos.x - canvasRect.left;
      const mouseInCanvasY = mousePos.y - canvasRect.top;

      const canvasCenterX = canvasRect.width / 2;
      const canvasCenterY = canvasRect.height / 2;

      const offsetX = mouseInCanvasX - canvasCenterX;
      const offsetY = mouseInCanvasY - canvasCenterY;

      const localOffsetX = offsetX / zoom;
      const localOffsetY = offsetY / zoom;

      checkX = (activeBreakpoint.width / 2) + localOffsetX;
      checkY = (activeBreakpoint.height / 2) + localOffsetY;
    }

    let closestElement = null;
    let minDistance = Infinity;

    elements.forEach((baseEl) => {
      if (baseEl.id === selectedElement) return;

      // Применяем мердж для каждого элемента
      const el = mergeElementWithBreakpoint(baseEl, activeBreakpointId);

      // === 1. ЦЕНТР ВНУТРИ? (МАКСИМАЛЬНЫЙ ПРИОРИТЕТ) ===
      const centerInside =
        checkX >= el.x &&
        checkX <= el.x + el.width &&
        checkY >= el.y &&
        checkY <= el.y + el.height;

      if (centerInside) {
        closestElement = el.id;
        minDistance = 0;
        return; // ← ВЫХОДИМ, БОЛЬШЕ НЕ ПРОВЕРЯЕМ
      }

      // === 2. РАССТОЯНИЕ ДО ГРАНИЦЫ (ТОЛЬКО ЕСЛИ НЕ ВНУТРИ) ===
      const distX = Math.max(el.x - checkX, checkX - (el.x + el.width), 0);
      const distY = Math.max(el.y - checkY, checkY - (el.y + el.height), 0);
      const localDistance = Math.sqrt(distX * distX + distY * distY);

      // КЛЮЧЕВАЯ ФОРМУЛА: порог в ЛОКАЛЬНЫХ единицах
      const THRESHOLD_LOCAL = 30 / zoom; // 30px на экране → всегда

      if (localDistance < THRESHOLD_LOCAL && localDistance < minDistance) {
        minDistance = localDistance;
        closestElement = el.id;
      }
    });

    setHoveredElement(closestElement);
  };

  updateHoveredElement();

  const handleMouseMove = () => {
    updateHoveredElement();
  };

  window.addEventListener('mousemove', handleMouseMove);

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };
}, [
  isAltPressed,
  selectedElement,
  mousePos,
  elements,
  zoom,
  activeBreakpoint.width,
  activeBreakpoint.height,
  isDragging,
  setHoveredElement
]);

useEffect(() => {
  const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
  window.addEventListener('mousemove', handle);
  return () => window.removeEventListener('mousemove', handle);
}, [setMousePos]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!selectedElement && selectedElements.length === 0) return;

      // Проверяем, кликнули ли по одному из выбранных элементов
      const allSelectedIds = selectedElements.length > 0 ? selectedElements : [selectedElement];
      for (const id of allSelectedIds) {
        const selectedDom = document.querySelector(`[data-id="${id}"]`);
        if (selectedDom && selectedDom.contains(e.target)) return;
      }

      const panels = document.querySelectorAll(".panel");
      for (const panel of panels) {
        if (panel.contains(e.target)) return;
      }

      setSelectedElement(null);
      setSelectedElements([]);
      setShowElementSettings(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedElement, selectedElements, setSelectedElement, setSelectedElements]);

  useEffect(() => {
    if (isDragging || isPanning || isSelecting) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isPanning, isSelecting, selectedElement, dragOffset, zoom, canvasOffset, panStart, selectionStart, selectionEnd, elements, selectedElements]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      container.addEventListener("mousemove", handleMouseMove);
      return () => {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("mousemove", handleMouseMove);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, canvasOffset]);

  // --- Element updates --------------------------------------------------
  // updateElement и updateElementProp уже доступны из хука useElements

  const deleteSelectedElement = () => {
    const idsToDelete = selectedElements.length > 0 ? selectedElements : (selectedElement ? [selectedElement] : []);
    if (idsToDelete.length > 0) {
      deleteElements(idsToDelete);
      clearSelection();
      setShowElementSettings(false);
    }
  };

  // copySelectedElements и pasteElements удалены - теперь используются
  // функции copyToClipboard и pasteFromClipboard из хука useClipboard

  const duplicateElementLocal = (id) => {
    const newId = duplicateElementHook(id);
    if (newId) {
      selectElement(newId);
    }
  };

  // moveLayer теперь доступен из хука useElements

  // Функции zoom теперь в хуке useCanvas (handleZoomIn, handleZoomOut, handleResetView)

  const selectedElementData = (() => {
    const baseElement = elements.find((el) => el.id === selectedElement);
    if (!baseElement) return null;
    // Применяем мердж с активным брейкпоинтом
    return mergeElementWithBreakpoint(baseElement, activeBreakpointId);
  })();

  useEffect(() => {
    if (selectedElementData) {
      setTempSize({
        width: Math.round(selectedElementData.width),
        height: Math.round(selectedElementData.height),
      });
    } else {
      setTempSize({ width: "", height: "" });
    }
  }, [selectedElementData]);

  // Синхронизируем локальное состояние высоты канваса с активным брейкпоинтом
  useEffect(() => {
    setTempCanvasHeight(activeBreakpoint.height);
  }, [activeBreakpoint.height]);

  useEffect(() => {
    if (!selectedElementData) return;
    if (selectedElementData.type_name !== "text") return;

    // Сначала получаем минимальную ширину без учета текущей ширины контейнера
    const { width: minW } = measureTextSize(
      selectedElementData.props?.content,
      selectedElementData.props?.fontSize,
      selectedElementData.props?.fontWeight,
      selectedElementData.props?.lineHeight,
      selectedElementData.props?.letterSpacing
    );

    // Определяем итоговую ширину (не меньше минимальной)
    const finalWidth = Math.max(selectedElementData.width, minW);

    // Теперь рассчитываем высоту с учетом итоговой ширины
    const { height: minH } = measureTextSize(
      selectedElementData.props?.content,
      selectedElementData.props?.fontSize,
      selectedElementData.props?.fontWeight,
      selectedElementData.props?.lineHeight,
      selectedElementData.props?.letterSpacing,
      finalWidth
    );

    let updated = {};
    if (selectedElementData.width < minW) updated.width = finalWidth;
    if (selectedElementData.height < minH) updated.height = minH;

    if (Object.keys(updated).length > 0) {
      updateElement(selectedElementData.id, updated);
      setTempSize({
        width: Math.round(updated.width || selectedElementData.width),
        height: Math.round(updated.height || selectedElementData.height),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElementData?.props?.content, selectedElementData?.props?.fontSize, selectedElementData?.props?.fontWeight, selectedElementData?.props?.lineHeight, selectedElementData?.props?.letterSpacing]);

  // handleResize перенесён в хук useElementResize

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.min(Math.max(0.1, zoom + delta), 3);

      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();

        // Позиция мыши относительно контейнера
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Центр контейнера
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Позиция мыши в координатах канваса (до зума)
        // Учитываем текущий offset и zoom
        const canvasMouseX = (mouseX - centerX - canvasOffset.x) / zoom;
        const canvasMouseY = (mouseY - centerY - canvasOffset.y) / zoom;

        // После зума эта же точка на канвасе должна оказаться под курсором
        // mouseX = centerX + canvasOffset.x + canvasMouseX * newZoom
        // canvasOffset.x = mouseX - centerX - canvasMouseX * newZoom
        const newOffsetX = mouseX - centerX - canvasMouseX * newZoom;
        const newOffsetY = mouseY - centerY - canvasMouseY * newZoom;

        setCanvasOffset({ x: newOffsetX, y: newOffsetY });
      }

      setZoom(newZoom);
    } else if (e.shiftKey) {
      setCanvasOffset({
        x: canvasOffset.x - e.deltaY,
        y: canvasOffset.y,
      });
    } else {
      setCanvasOffset({
        x: canvasOffset.x,
        y: canvasOffset.y - e.deltaY,
      });
    }
  };

  const applyTempSize = () => {
    if (!selectedElementData) return;
    const el = selectedElementData;
    let w = Number(tempSize.width);
    let h = Number(tempSize.height);

    if (isNaN(w) || w <= 0) w = el.width;
    if (isNaN(h) || h <= 0) h = el.height;

    if (el.type_name === "text") {
      const { width: minW } = measureTextSize(
        el.props?.content,
        el.props?.fontSize,
        el.props?.fontWeight,
        el.props?.lineHeight,
        el.props?.letterSpacing
      );
      w = Math.max(w, minW);
      const { height: minH } = measureTextSize(
        el.props?.content,
        el.props?.fontSize,
        el.props?.fontWeight,
        el.props?.lineHeight,
        el.props?.letterSpacing,
        w
      );
      h = Math.max(h, minH);
    } else {
      w = Math.max(w, 20);
      h = Math.max(h, 20);
    }

    updateElement(el.id, { width: w, height: h });
    setTempSize({ width: Math.round(w), height: Math.round(h) });
  };

  const applyCanvasHeight = () => {
    let h = Number(tempCanvasHeight);
    // Если пустое поле или невалидное значение, считаем как 0
    if (isNaN(h) || h < 0) h = 0;
    updateBreakpoint(activeBreakpointId, { height: h });
  };

  // Render snap lines
  // Render функции перенесены в компоненты: SnapLines, SelectionBox, DistanceLines



  // --- Render ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* Top Toolbar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-6 panel shadow-sm">
        {/* Левая часть - кнопка добавления элементов */}
        <div className="flex items-center gap-3 min-w-[212px]">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
            >
              <Plus size={22} />
            </button>

            {menuOpen && (
              <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-xl p-2 w-48 animate-fadeIn z-50">
                {getAvailableTypes().map((typeInfo) => {
                  const IconComponent = {
                    Type,
                    Square,
                    Image,
                    MousePointerSquareDashed,
                    Film
                  }[typeInfo.icon] || Square;
                  return (
                    <button
                      key={typeInfo.type_name}
                      onClick={() => { setMenuOpen(false); addElementToCanvas(typeInfo.type_name); }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-100 transition text-gray-700"
                    >
                      <IconComponent size={18} />
                      <span>{typeInfo.display_name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Центр - панель брейкпоинтов */}
        <div className="flex-1 flex items-center justify-center">
          <BreakpointPanel
            breakpoints={breakpoints}
            activeBreakpointId={activeBreakpointId}
            onBreakpointChange={setActiveBreakpoint}
            onBreakpointAdd={addBreakpoint}
            onBreakpointUpdate={updateBreakpoint}
            onBreakpointDelete={deleteBreakpoint}
          />
        </div>

        {/* Правая часть - зум */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Отдалить"
          >
            <ZoomOut size={20} />
          </button>
          <div className="px-3 py-1 bg-gray-100 text-gray-900 rounded min-w-[80px] text-center font-medium">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Приблизить"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Сбросить вид"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Layers */}
        {showLayersPanel && (
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col panel shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-lg text-gray-900">Слои</h3>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {[...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0)).map((element) => (
              <div
                key={element.id}
                onClick={(e) => {
                  // Множественный выбор с Ctrl
                  if (e.ctrlKey || e.metaKey) {
                    // Получаем текущий список выбранных (включая одиночный выбор)
                    const currentSelected = selectedElements.length > 0
                      ? selectedElements
                      : (selectedElement ? [selectedElement] : []);

                    if (currentSelected.includes(element.id)) {
                      // Убираем элемент из выбора
                      const newSelected = currentSelected.filter(id => id !== element.id);
                      setSelectedElements(newSelected);
                      if (newSelected.length === 1) {
                        setSelectedElement(newSelected[0]);
                        setShowElementSettings(true);
                      } else if (newSelected.length === 0) {
                        setSelectedElement(null);
                        setShowElementSettings(false);
                      } else {
                        setShowElementSettings(false);
                      }
                    } else {
                      // Добавляем элемент к выбору
                      const newSelected = [...currentSelected, element.id];
                      setSelectedElements(newSelected);
                      setSelectedElement(element.id);
                      setShowElementSettings(false);
                    }
                  } else {
                    // Обычный выбор одного элемента
                    setSelectedElement(element.id);
                    setSelectedElements([]);
                    setShowElementSettings(true);
                  }
                }}
                className={`p-3 mb-2 rounded cursor-pointer flex items-center justify-between ${
                  (selectedElement === element.id || selectedElements.includes(element.id)) ? "bg-blue-100 border border-blue-300" : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {(() => {
                    const typeConfig = getTypeConfig(element.type_name);
                    const IconComponent = {
                      Type,
                      Square,
                      Image,
                      MousePointerSquareDashed,
                      Film
                    }[typeConfig.icon] || Square;
                    return <IconComponent size={16} className="flex-shrink-0" />;
                  })()}
                  <span className="text-sm truncate text-gray-900">
                    {(() => {
                      const typeConfig = getTypeConfig(element.type_name);
                      return element.props?.content || typeConfig.display_name || typeConfig.type_name;
                    })()}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(element.id, "up");
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-600"
                  >
                    <MoveUp size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(element.id, "down");
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-600"
                  >
                    <MoveDown size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden bg-gray-100 relative"
          onMouseDown={handleCanvasMouseDown}
          style={{ isolation: "isolate" }}
        >
          <div className="absolute top-4 right-4 bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs z-10 max-w-xs shadow-sm text-gray-700">
            <div className="font-semibold mb-1">Управление:</div>
            <div>Выделение областью - зажать ЛКМ и тянуть</div>
            <div>Ctrl + область - добавить к выделению</div>
            <div>Ctrl + клик - выбор нескольких элементов</div>
            <div>Ctrl + C / Ctrl + V - копировать/вставить</div>
            <div>Ctrl + Z / Ctrl + Shift + Z - отменить/повторить</div>
            <div>Delete - удалить выбранные элементы</div>
            <div>Alt - показать расстояния</div>
            <div>Ctrl + колесико - зум к курсору</div>
            <div>Средняя кнопка мыши - панорамирование</div>
            <div>Колесико - вверх/вниз</div>
            <div>Shift + колесико - влево/вправо</div>
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
            }}
          >
            <div
              ref={canvasRef}
              style={{
                width: activeBreakpoint.width,
                height: activeBreakpoint.height,
                backgroundColor: activeBreakpoint.backgroundColor,
                zoom: zoom,
                willChange: "transform",
                minWidth: activeBreakpoint.width,
                minHeight: activeBreakpoint.height,
                position: "relative",
                maxWidth: "none",
                maxHeight: "none",
              }}
            >
              <SnapLines snapLines={snapLines} canvasSettings={activeBreakpoint} />
              <DistanceLines
                isAltPressed={isAltPressed}
                selectedElement={selectedElement}
                hoveredElement={hoveredElement}
                elements={elements}
                canvasSettings={activeBreakpoint}
              />
              <SelectionBox
                isSelecting={isSelecting}
                selectionStart={selectionStart}
                selectionEnd={selectionEnd}
              />

              {[...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((baseElement) => {
                // Применяем мердж с активным брейкпоинтом
                const element = mergeElementWithBreakpoint(baseElement, activeBreakpointId);
                return (
                <div
                  key={element.id}
                  data-id={element.id}
                  onMouseDown={(e) => handleMouseDown(e, baseElement)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Не открываем меню, если идет панорамирование или выделение
                    if (isPanning || isSelecting) {
                      return;
                    }

                    // Если элемент не выделен, выделяем его
                    if (selectedElement !== element.id && !selectedElements.includes(element.id)) {
                      setSelectedElement(element.id);
                      setSelectedElements([]);
                    }

                    // Всегда показываем/обновляем контекстное меню для элемента
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      initialCanvasOffset: { ...canvasOffset },
                    });
                  }}
                  className="absolute cursor-move"
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    borderRadius: element.borderRadius,
                    opacity: element.opacity,
                    overflow: "visible",
                    outline: (selectedElement === element.id || selectedElements.includes(element.id)) ? "1px solid #a855f7" : "none",
                    outlineOffset: "0px",
                    willChange: isDragging && selectedElement === element.id ? "transform" : "auto",
                    transform: "translate3d(0, 0, 0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: element.textAlign === "left" ? "flex-start" : element.textAlign === "center" ? "center" : "flex-end",
                    boxSizing: "border-box",
                  }}
                >
                  <ElementRenderer element={element} typeConfig={getTypeConfig(element.type_name)} />

                  {selectedElement === element.id && (
                    <>
                      {/* Боковые стороны */}
                      <div
                        className="resize-handle absolute cursor-ew-resize"
                        style={{
                          right: "-2px",
                          top: 0,
                          bottom: 0,
                          width: "6px",
                          background: "transparent",
                        }}
                        onMouseDown={(e) => handleResize(e, element, "e")}
                      />
                      <div
                        className="resize-handle absolute cursor-ew-resize"
                        style={{
                          left: "-2px",
                          top: 0,
                          bottom: 0,
                          width: "6px",
                          background: "transparent",
                        }}
                        onMouseDown={(e) => handleResize(e, element, "w")}
                      />
                      <div
                        className="resize-handle absolute cursor-ns-resize"
                        style={{
                          left: 0,
                          right: 0,
                          top: "-2px",
                          height: "6px",
                          background: "transparent",
                        }}
                        onMouseDown={(e) => handleResize(e, element, "n")}
                      />
                      <div
                        className="resize-handle absolute cursor-ns-resize"
                        style={{
                          left: 0,
                          right: 0,
                          bottom: "-2px",
                          height: "6px",
                          background: "transparent",
                        }}
                        onMouseDown={(e) => handleResize(e, element, "s")}
                      />

                      {/* Углы */}
                      <div
                        className="resize-handle absolute cursor-nwse-resize"
                        style={{
                          right: "-3px",
                          bottom: "-3px",
                          width: "8px",
                          height: "8px",
                          background: "#a855f7",
                          border: "1px solid white",
                          borderRadius: "1px",
                        }}
                        onMouseDown={(e) => handleResize(e, element, "se")}
                      />
                      <div
                        className="resize-handle absolute cursor-nesw-resize"
                        style={{
                          right: "-3px",
                          top: "-3px",
                          width: "8px",
                          height: "8px",
                          background: "#a855f7",
                          border: "1px solid white",
                          borderRadius: "1px",
                        }}
                        onMouseDown={(e) => handleResize(e, element, "ne")}
                      />
                      <div
                        className="resize-handle absolute cursor-nesw-resize"
                        style={{
                          left: "-3px",
                          bottom: "-3px",
                          width: "8px",
                          height: "8px",
                          background: "#a855f7",
                          border: "1px solid white",
                          borderRadius: "1px",
                        }}
                        onMouseDown={(e) => handleResize(e, element, "sw")}
                      />
                      <div
                        className="resize-handle absolute cursor-nwse-resize"
                        style={{
                          left: "-3px",
                          top: "-3px",
                          width: "8px",
                          height: "8px",
                          background: "#a855f7",
                          border: "1px solid white",
                          borderRadius: "1px",
                        }}
                        onMouseDown={(e) => handleResize(e, element, "nw")}
                      />
                    </>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Settings */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-auto panel shadow-lg">
          {/* Canvas Settings */}
          <div className="border-b border-gray-200">
            <div className="p-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <Settings size={20} />
                Настройки канваса
              </h3>
            </div>
            <div className="px-4 pb-4 space-y-4">
              <div className="text-xs text-gray-500 mb-2">
                Ширина определяется активным брейкпоинтом: {activeBreakpoint.width}px
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Высота</label>
                <input
                  type="number"
                  value={tempCanvasHeight}
                  onChange={(e) => setTempCanvasHeight(e.target.value)}
                  onBlur={applyCanvasHeight}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyCanvasHeight();
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цвет фона</label>
                <input
                  type="color"
                  value={activeBreakpoint.backgroundColor}
                  onChange={(e) => updateBreakpoint(activeBreakpointId, { backgroundColor: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Выравнивание блока</label>
                <select
                  value={activeBreakpoint.alignment || 'left'}
                  onChange={(e) => updateBreakpoint(activeBreakpointId, { alignment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="left">Слева</option>
                  <option value="center">По центру</option>
                  <option value="right">Справа</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clipboard Info */}
          {clipboard.length > 0 && (
            <div className="border-b border-gray-200 bg-blue-50 p-4">
              <div className="text-sm text-blue-700">
                В буфере обмена: <span className="font-semibold text-blue-900">{clipboard.length}</span> {clipboard.length === 1 ? 'элемент' : 'элементов'}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Нажмите Ctrl+V для вставки
              </div>
            </div>
          )}

          {/* Multiple Selection Info */}
          {selectedElements.length > 1 && (
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="text-sm text-gray-700">
                Выбрано элементов: <span className="font-semibold text-blue-600">{selectedElements.length}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Настройки доступны только для одного элемента
              </div>
            </div>
          )}

          {/* Element Settings */}
          {selectedElementData && selectedElements.length === 0 && (
            <div className="border-b border-gray-200">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setShowElementSettings(!showElementSettings)}
              >
                <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                  <Settings size={20} />
                  Настройки элемента
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateElementLocal(selectedElementData.id);
                    }}
                    className="p-2 hover:bg-gray-200 rounded text-gray-600"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSelectedElement();
                    }}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                  {showElementSettings ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                </div>
              </div>

              {showElementSettings && (
                <div className="px-4 pb-4 space-y-4">
                  {activeBreakpointId !== defaultBreakpoint.id && (
                    <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-700">
                      Изменения сохраняются для брейкпоинта: <span className="font-semibold">{activeBreakpoint.name}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">X</label>
                      <input
                        type="number"
                        value={Math.round(selectedElementData.x)}
                        onChange={(e) => updateElement(selectedElementData.id, { x: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Y</label>
                      <input
                        type="number"
                        value={Math.round(selectedElementData.y)}
                        onChange={(e) => updateElement(selectedElementData.id, { y: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ширина</label>
                      <input
                        type="number"
                        value={tempSize.width}
                        onChange={(e) => setTempSize({ ...tempSize, width: e.target.value })}
                        onBlur={applyTempSize}
                        onKeyDown={applyTempSize}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Высота</label>
                      <input
                        type="number"
                        value={tempSize.height}
                        onChange={(e) => setTempSize({ ...tempSize, height: e.target.value })}
                        onBlur={applyTempSize}
                        onKeyDown={applyTempSize}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {/* Динамические настройки на основе схемы типа */}
                  <DynamicSettings
                    schema={getTypeSchema(selectedElementData.type_name)}
                    values={selectedElementData.props || {}}
                    onChange={(propName, propValue) => {
                      updateElementProp(selectedElementData.id, propName, propValue);
                    }}
                  />

                  {/* Разделитель */}
                  <div className="border-t border-gray-200 my-4"></div>

                  {/* Общие настройки для всех типов */}
                  <div className="text-base font-semibold mb-3 text-gray-900">Общие настройки</div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Скругление углов: {selectedElementData.borderRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      value={selectedElementData.borderRadius}
                      onChange={(e) => updateElement(selectedElementData.id, { borderRadius: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Прозрачность: {Math.round(selectedElementData.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedElementData.opacity}
                      onChange={(e) => updateElement(selectedElementData.id, { opacity: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Контекстное меню */}
      <ContextMenu
        position={contextMenu}
        canvasOffset={canvasOffset}
        hasSelectedElements={selectedElement !== null || selectedElements.length > 0}
        hasClipboard={clipboard.length > 0}
        showLayersPanel={showLayersPanel}
        availableTypes={getAvailableTypes()}
        onClose={() => setContextMenu(null)}
        onMoveUp={() => {
          // Перемещаем все выделенные элементы вверх
          const idsToMove = selectedElements.length > 0 ? selectedElements : (selectedElement ? [selectedElement] : []);

          // Сортируем id по их текущей позиции в массиве (от конца к началу для "up")
          const sortedIds = idsToMove.slice().sort((a, b) => {
            const indexA = elements.findIndex(el => el.id === a);
            const indexB = elements.findIndex(el => el.id === b);
            return indexB - indexA; // Сортируем в обратном порядке
          });

          sortedIds.forEach(id => moveLayer(id, "up"));
          setContextMenu(null);
        }}
        onMoveDown={() => {
          // Перемещаем все выделенные элементы вниз
          const idsToMove = selectedElements.length > 0 ? selectedElements : (selectedElement ? [selectedElement] : []);

          // Сортируем id по их текущей позиции в массиве (от начала к концу для "down")
          const sortedIds = idsToMove.slice().sort((a, b) => {
            const indexA = elements.findIndex(el => el.id === a);
            const indexB = elements.findIndex(el => el.id === b);
            return indexA - indexB; // Сортируем в прямом порядке
          });

          sortedIds.forEach(id => moveLayer(id, "down"));
          setContextMenu(null);
        }}
        onCopy={() => {
          // Копируем выделенные элементы
          if (selectedElement || selectedElements.length > 0) {
            const idsToCopy = selectedElements.length > 0 ? selectedElements : (selectedElement ? [selectedElement] : []);
            if (idsToCopy.length > 0) {
              const elementsToCopy = elements.filter(el => idsToCopy.includes(el.id));
              copyToClipboard(elementsToCopy);
            }
          }
          setContextMenu(null);
        }}
        onPaste={() => {
          // Вставляем элементы из буфера обмена
          const newElements = pasteFromClipboard();
          if (newElements.length > 0) {
            setElements(prev => [...prev, ...newElements]);
            const newIds = newElements.map(el => el.id);
            selectMultipleElements(newIds);
            setShowElementSettings(newIds.length === 1);
          }
          setContextMenu(null);
        }}
        onDelete={() => {
          // Удаляем выделенные элементы
          if (selectedElement || selectedElements.length > 0) {
            const idsToDelete = selectedElements.length > 0 ? selectedElements : (selectedElement ? [selectedElement] : []);
            if (idsToDelete.length > 0) {
              deleteElements(idsToDelete);
              clearSelection();
              setShowElementSettings(false);
            }
          }
          setContextMenu(null);
        }}
        onAddElement={(typeName) => {
          // Добавляем элемент выбранного типа
          addElementToCanvas(typeName);
          setContextMenu(null);
        }}
        onToggleLayers={() => {
          // Переключаем видимость панели слоев
          setShowLayersPanel(!showLayersPanel);
          setContextMenu(null);
        }}
      />
    </div>
  );
}