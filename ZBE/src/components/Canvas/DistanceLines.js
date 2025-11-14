import React from 'react';

/**
 * Компонент для отображения линий расстояния (при зажатом Alt)
 */
const DistanceLines = ({ isAltPressed, selectedElement, hoveredElement, elements, canvasSettings }) => {
  if (!isAltPressed || !selectedElement) return null;

  const selected = elements.find(el => el.id === selectedElement);
  if (!selected) return null;

  const lines = [];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  if (hoveredElement) {
    const hovered = elements.find(el => el.id === hoveredElement);
    if (!hovered) return null;

    const A = {
      left: selected.x,
      right: selected.x + selected.width,
      top: selected.y,
      bottom: selected.y + selected.height
    };
    const B = {
      left: hovered.x,
      right: hovered.x + hovered.width,
      top: hovered.y,
      bottom: hovered.y + hovered.height
    };

    const overlapLeft = Math.max(A.left, B.left);
    const overlapRight = Math.min(A.right, B.right);
    const overlapTop = Math.max(A.top, B.top);
    const overlapBottom = Math.min(A.bottom, B.bottom);

    const hasHorizontalOverlap = overlapLeft < overlapRight;
    const hasVerticalOverlap = overlapTop < overlapBottom;

    // HORIZONTAL DISTANCES
    const hPositions = [];

    if (A.right <= B.left) {
      hPositions.push({ x1: A.right, x2: B.left });
    }
    if (B.right <= A.left) {
      hPositions.push({ x1: B.right, x2: A.left });
    }
    if (A.left > B.left && A.left < B.right) hPositions.push({ x1: B.left, x2: A.left });
    if (A.right < B.right && A.right > B.left) hPositions.push({ x1: A.right, x2: B.right });

    hPositions.forEach(pos => {
      let y;
      if (!hasVerticalOverlap) {
        const topMost = Math.min(A.top, B.top);
        const bottomMost = Math.max(A.bottom, B.bottom);
        const freeTopSpace = topMost;
        const freeBottomSpace = canvasSettings.height - bottomMost;
        y = freeTopSpace > freeBottomSpace ? topMost - 10 : bottomMost + 10;
      } else {
        y = (overlapTop + overlapBottom) / 2;
      }

      const gap = Math.abs(pos.x2 - pos.x1);
      if (gap > 0) {
        lines.push(
          <g key={`h-${pos.x1}-${pos.x2}`}>
            <line x1={pos.x1} y1={y} x2={pos.x2} y2={y} stroke="#ff0080" strokeWidth={1} />
            <line x1={pos.x1} y1={y - 3} x2={pos.x1} y2={y + 3} stroke="#ff0080" strokeWidth={1} />
            <line x1={pos.x2} y1={y - 3} x2={pos.x2} y2={y + 3} stroke="#ff0080" strokeWidth={1} />
            <text x={(pos.x1 + pos.x2) / 2} y={y - 5} fill="#ff0080" fontSize="12" textAnchor="middle">
              {Math.round(gap)}
            </text>
          </g>
        );
      }
    });

    // VERTICAL DISTANCES
    const vPositions = [];

    if (A.bottom <= B.top) vPositions.push({ y1: A.bottom, y2: B.top });
    if (B.bottom <= A.top) vPositions.push({ y1: B.bottom, y2: A.top });
    if (A.top > B.top && A.top < B.bottom) vPositions.push({ y1: B.top, y2: A.top });
    if (A.bottom < B.bottom && A.bottom > B.top) vPositions.push({ y1: A.bottom, y2: B.bottom });

    vPositions.forEach(pos => {
      let x;
      if (!hasHorizontalOverlap) {
        const leftMost = Math.min(A.left, B.left);
        const rightMost = Math.max(A.right, B.right);
        const freeLeftSpace = leftMost;
        const freeRightSpace = canvasSettings.width - rightMost;
        x = freeLeftSpace > freeRightSpace ? leftMost - 10 : rightMost + 10;
      } else {
        x = (overlapLeft + overlapRight) / 2;
      }

      const gap = Math.abs(pos.y2 - pos.y1);
      if (gap > 0) {
        lines.push(
          <g key={`v-${pos.y1}-${pos.y2}`}>
            <line x1={x} y1={pos.y1} x2={x} y2={pos.y2} stroke="#ff0080" strokeWidth={1} />
            <line x1={x - 3} y1={pos.y1} x2={x + 3} y2={pos.y1} stroke="#ff0080" strokeWidth={1} />
            <line x1={x - 3} y1={pos.y2} x2={x + 3} y2={pos.y2} stroke="#ff0080" strokeWidth={1} />
            <text x={x + 5} y={(pos.y1 + pos.y2) / 2} fill="#ff0080" fontSize="12" textAnchor="start">
              {Math.round(gap)}
            </text>
          </g>
        );
      }
    });
  } else {
    // Расстояния до краев канваса
    const visibleLeft = clamp(selected.x, 0, canvasSettings.width);
    const visibleRight = clamp(selected.x + selected.width, 0, canvasSettings.width);
    const visibleTop = clamp(selected.y, 0, canvasSettings.height);
    const visibleBottom = clamp(selected.y + selected.height, 0, canvasSettings.height);

    const distToLeft = selected.x < 0 ? 0 : selected.x;
    const distToTop = selected.y < 0 ? 0 : selected.y;
    const distToRight = selected.x + selected.width > canvasSettings.width ? 0 : canvasSettings.width - (selected.x + selected.width);
    const distToBottom = selected.y + selected.height > canvasSettings.height ? 0 : canvasSettings.height - (selected.y + selected.height);

    if (distToLeft > 0) {
      const y = selected.y + selected.height / 2;
      lines.push(
        <g key="left">
          <line x1={0} y1={y} x2={visibleLeft} y2={y} stroke="#ff0080" strokeWidth={1} />
          <text x={visibleLeft / 2} y={y - 5} fill="#ff0080" fontSize="12" textAnchor="middle">
            {Math.round(distToLeft)}
          </text>
        </g>
      );
    }

    if (distToTop > 0) {
      const x = selected.x + selected.width / 2;
      lines.push(
        <g key="top">
          <line x1={x} y1={0} x2={x} y2={visibleTop} stroke="#ff0080" strokeWidth={1} />
          <text x={x + 5} y={visibleTop / 2} fill="#ff0080" fontSize="12" textAnchor="start">
            {Math.round(distToTop)}
          </text>
        </g>
      );
    }

    if (distToRight > 0) {
      const y = selected.y + selected.height / 2;
      lines.push(
        <g key="right">
          <line x1={visibleRight} y1={y} x2={canvasSettings.width} y2={y} stroke="#ff0080" strokeWidth={1} />
          <text x={visibleRight + distToRight / 2} y={y - 5} fill="#ff0080" fontSize="12" textAnchor="middle">
            {Math.round(distToRight)}
          </text>
        </g>
      );
    }

    if (distToBottom > 0) {
      const x = selected.x + selected.width / 2;
      lines.push(
        <g key="bottom">
          <line x1={x} y1={visibleBottom} x2={x} y2={canvasSettings.height} stroke="#ff0080" strokeWidth={1} />
          <text x={x + 5} y={visibleBottom + distToBottom / 2} fill="#ff0080" fontSize="12" textAnchor="start">
            {Math.round(distToBottom)}
          </text>
        </g>
      );
    }
  }

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: canvasSettings.width,
        height: canvasSettings.height,
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      {lines}
    </svg>
  );
};

export default DistanceLines;
