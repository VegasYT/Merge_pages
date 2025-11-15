import React from 'react';

/**
 * Компонент для отображения линий привязки
 */
const SnapLines = ({ snapLines, canvasSettings }) => {
  if (snapLines.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: canvasSettings.width,
        height: canvasSettings.height,
        pointerEvents: 'none',
        zIndex: 1001
      }}
    >
      {snapLines.map((line, index) => {
        if (line.type === 'vertical') {
          return (
            <line
              key={`snap-v-${index}`}
              x1={line.position}
              y1={0}
              x2={line.position}
              y2={canvasSettings.height}
              stroke="#a855f7"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        } else {
          return (
            <line
              key={`snap-h-${index}`}
              x1={0}
              y1={line.position}
              x2={canvasSettings.width}
              y2={line.position}
              stroke="#a855f7"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        }
      })}
    </svg>
  );
};

export default SnapLines;
