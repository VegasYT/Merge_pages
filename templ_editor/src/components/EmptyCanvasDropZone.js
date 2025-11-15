import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const EmptyCanvasDropZone = ({ onDrop }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'empty-canvas',
    data: {
      type: 'drop-zone',
      parentPath: [],
      insertIndex: 0,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed border-gray-300 rounded p-16 text-center transition-colors ${
        isOver ? 'border-green-500 bg-green-50' : 'bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      <div className="text-4xl mb-4">📦</div>
      <p className="text-gray-500 text-lg mb-2">Начните создавать</p>
      <p className="text-gray-400 text-sm">Перетащите элементы из левой панели или нажмите на них</p>
    </div>
  );
};

export default EmptyCanvasDropZone;
