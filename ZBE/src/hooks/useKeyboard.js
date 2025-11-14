import { useState, useEffect } from 'react';

/**
 * Хук для обработки клавиатуры
 */
export const useKeyboard = (callbacks = {}) => {
  const [isAltPressed, setIsAltPressed] = useState(false);

  const {
    onCopy,
    onPaste,
    onDelete,
    onArrowMove,
    onEscape,
    onUndo,
    onRedo,
  } = callbacks;

  // Обработка Alt клавиши
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        e.preventDefault();
        setIsAltPressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (!e.altKey) {
        setIsAltPressed(false);
      }
    };

    // Сброс состояния Alt при потере фокуса окном или переключении вкладки
    const handleBlur = () => {
      setIsAltPressed(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsAltPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Обработка основных клавиатурных команд
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Проверяем, не находимся ли мы в текстовом поле
      const isInputField = e.target.tagName === 'INPUT' ||
                          e.target.tagName === 'TEXTAREA' ||
                          e.target.isContentEditable;

      // Undo - Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ" && !e.shiftKey && !isInputField) {
        if (onUndo) {
          e.preventDefault();
          onUndo();
        }
        return;
      }

      // Redo - Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ" && e.shiftKey && !isInputField) {
        if (onRedo) {
          e.preventDefault();
          onRedo();
        }
        return;
      }

      // Copy - Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyC" && !isInputField) {
        if (onCopy) {
          e.preventDefault();
          onCopy();
        }
        return;
      }

      // Paste - Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyV" && !isInputField) {
        if (onPaste) {
          e.preventDefault();
          onPaste();
        }
        return;
      }

      // Delete key
      if (e.key === "Delete" && !isInputField) {
        if (onDelete) {
          onDelete();
        }
        return;
      }

      // Arrow keys for moving selected element
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && !isInputField) {
        if (onArrowMove) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          onArrowMove(e.key, step);
        }
        return;
      }

      // Escape key
      if (e.key === "Escape") {
        if (onEscape) {
          onEscape();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCopy, onPaste, onDelete, onArrowMove, onEscape, onUndo, onRedo]);

  return {
    isAltPressed,
    setIsAltPressed,
  };
};
