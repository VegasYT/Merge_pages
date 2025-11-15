import { useEffect } from 'react';

export const useKeyboardShortcuts = (selectedElement, deleteElement, copyElement) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected element with Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !e.target.matches('input, textarea')) {
        e.preventDefault();
        deleteElement(selectedElement.path);
      }

      // Duplicate selected element with Ctrl+D or Cmd+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElement && !e.target.matches('input, textarea')) {
        e.preventDefault();
        copyElement(selectedElement.path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteElement, copyElement]);
};
