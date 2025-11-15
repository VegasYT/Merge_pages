import { useState, useCallback } from "react";

/**
 * Хук для управления брейкпоинтами (responsive design)
 * @param {Array} initialBreakpoints - начальные брейкпоинты (опционально)
 */
export function useBreakpoints(initialBreakpoints = null) {
  const [breakpoints, setBreakpoints] = useState(initialBreakpoints || [
    {
      id: "desktop",
      name: "Desktop",
      width: 1920,
      height: 1080,
      backgroundColor: "#ffffff",
      isDefault: true,
    },
    {
      id: "tablet",
      name: "Tablet",
      width: 768,
      height: 1024,
      backgroundColor: "#ffffff",
    },
    {
      id: "mobile",
      name: "Mobile",
      width: 375,
      height: 667,
      backgroundColor: "#ffffff",
    },
  ]);

  const [activeBreakpointId, setActiveBreakpointId] = useState(
    initialBreakpoints && initialBreakpoints.length > 0
      ? initialBreakpoints[0].id
      : "desktop"
  );

  // Получить активный брейкпоинт
  const getActiveBreakpoint = useCallback(() => {
    return breakpoints.find((bp) => bp.id === activeBreakpointId) || breakpoints[0];
  }, [breakpoints, activeBreakpointId]);

  // Получить дефолтный брейкпоинт
  const getDefaultBreakpoint = useCallback(() => {
    return breakpoints.find((bp) => bp.isDefault) || breakpoints[0];
  }, [breakpoints]);

  // Добавить новый брейкпоинт
  const addBreakpoint = useCallback((name, width) => {
    const newId = `bp_${Date.now()}`;
    const newBreakpoint = {
      id: newId,
      name,
      width,
      height: 1080,
      backgroundColor: "#ffffff",
      isDefault: false,
    };
    setBreakpoints((prev) => [...prev, newBreakpoint]);
    return newId;
  }, []);

  // Обновить брейкпоинт
  const updateBreakpoint = useCallback((id, updates) => {
    setBreakpoints((prev) =>
      prev.map((bp) => {
        if (bp.id === id) {
          // Нельзя изменить isDefault
          const { isDefault, ...allowedUpdates } = updates;
          return { ...bp, ...allowedUpdates };
        }
        return bp;
      })
    );
  }, []);

  // Удалить брейкпоинт
  const deleteBreakpoint = useCallback((id) => {
    setBreakpoints((prev) => {
      const breakpoint = prev.find((bp) => bp.id === id);
      // Нельзя удалить дефолтный брейкпоинт
      if (breakpoint?.isDefault) {
        console.warn("Нельзя удалить дефолтный брейкпоинт");
        return prev;
      }
      // Если удаляем активный, переключаемся на дефолтный
      if (id === activeBreakpointId) {
        const defaultBp = prev.find((bp) => bp.isDefault);
        setActiveBreakpointId(defaultBp?.id || prev[0].id);
      }
      return prev.filter((bp) => bp.id !== id);
    });
  }, [activeBreakpointId]);

  // Установить активный брейкпоинт
  const setActiveBreakpoint = useCallback((id) => {
    setActiveBreakpointId(id);
  }, []);

  return {
    breakpoints,
    setBreakpoints,
    activeBreakpointId,
    getActiveBreakpoint,
    getDefaultBreakpoint,
    addBreakpoint,
    updateBreakpoint,
    deleteBreakpoint,
    setActiveBreakpoint,
  };
}
