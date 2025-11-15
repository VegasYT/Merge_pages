import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const DropZone = ({
  parentPath,
  insertIndex,
  activeId,
}) => {
  const zoneId = `dropzone-${parentPath.join('-')}-${insertIndex}`;
  const isDragging = !!activeId;

  const { setNodeRef, isOver } = useDroppable({
    id: zoneId,
    data: {
      type: 'drop-zone',
      parentPath,
      insertIndex,
    },
  });

  if (!isDragging) return null;

  return (
    <div
      ref={setNodeRef}
      key={zoneId}
      className={`transition-all duration-200 ${
        isOver ? 'h-32 z-[9999]' : 'h-20 z-[9999]'
      }`}
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        marginTop: isOver ? '-24px' : '-16px',
        marginBottom: isOver ? '-24px' : '-16px'
      }}
    >
      {/* Drop zone indicator */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
        isOver ? 'opacity-100' : 'opacity-30 hover:opacity-70'
      }`}>
        {/* Line */}
        <div className={`w-full transition-all duration-200 ${
          isOver ? 'h-1 bg-blue-600' : 'h-0.5 bg-blue-400'
        } relative`}>
          {/* Dots at the ends */}
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 transition-all duration-200 ${
            isOver ? 'w-3 h-3' : 'w-2 h-2'
          }`}></div>
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 transition-all duration-200 ${
            isOver ? 'w-3 h-3' : 'w-2 h-2'
          }`}></div>
          {/* Center dot */}
          {isOver && (
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          )}
        </div>
        {/* Label when hovered */}
        {isOver && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-lg whitespace-nowrap">
            Вставить сюда
          </div>
        )}
      </div>
    </div>
  );
};

export default DropZone;
