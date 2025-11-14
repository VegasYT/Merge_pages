import { useState } from 'react';

/**
 * Хук для управления canvas (zoom, pan)
 * Настройки канваса теперь в брейкпоинтах
 */
export const useCanvas = () => {
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.1));

  const handleResetView = () => {
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  return {
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
  };
};
