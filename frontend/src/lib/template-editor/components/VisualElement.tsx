import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { GripVertical, Copy, Trash2 } from 'lucide-react';

interface VisualElementProps {
  element: any;
  path?: number[];
  structure: any[];
  selectedElement: any;
  defaultData: Record<string, any>;
  editableStyles: Record<string, any>;
  previewStyles: Record<string, any>;
  activeId: string | null;
  onSelectElement: (data: { element: any; path: number[] }) => void;
  onCopyElement: (path: number[]) => void;
  onDeleteElement: (path: number[]) => void;
  renderDropZone: (parentPath: number[], insertIndex: number) => React.ReactNode;
  getIdFromPath: (path: number[]) => string;
}

const VisualElement = ({
  element,
  path = [],
  structure,
  selectedElement,
  defaultData,
  editableStyles,
  previewStyles,
  activeId,
  onSelectElement,
  onCopyElement,
  onDeleteElement,
  renderDropZone,
  getIdFromPath,
}: VisualElementProps) => {
  const currentPath = [...path];
  const pathStr = currentPath.join('-');
  const elementId = getIdFromPath(currentPath);
  const isSelected = selectedElement && JSON.stringify(selectedElement.path) === JSON.stringify(currentPath);
  const hasChildren = element.children !== undefined;
  const isContainer = hasChildren;

  // Build breadcrumb path for hierarchical handles
  const buildBreadcrumb = () => {
    const breadcrumb: any[] = [];
    let currentStructure = structure;

    for (let i = 0; i < currentPath.length; i++) {
      const index = currentPath[i];
      const elem = currentStructure[index];
      if (elem) {
        breadcrumb.push({
          element: elem,
          path: currentPath.slice(0, i + 1),
          label: elem.type
        });
        if (elem.children) {
          currentStructure = elem.children;
        }
      }
    }

    return breadcrumb;
  };

  const breadcrumb = buildBreadcrumb();
  const shouldShowBreadcrumb = breadcrumb.length > 1;

  // Use draggable for the element
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: elementId,
    data: {
      type: 'element',
      path: currentPath,
      element,
    },
  });

  // Use droppable if it's a container
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `${elementId}-container`,
    data: {
      type: 'element',
      path: currentPath,
      element,
    },
    disabled: !isContainer,
  });

  // Combine refs
  const setRefs = (node: any) => {
    setDragRef(node);
    if (isContainer) {
      setDropRef(node);
    }
  };

  // Inline styles from element.styles
  const inlineStyles: Record<string, any> = {};
  if (element.styles) {
    Object.entries(element.styles).forEach(([cssProp, styleKey]) => {
      if (editableStyles[styleKey as string]) {
        const config = editableStyles[styleKey as string];
        let value = previewStyles[styleKey as string] !== undefined ? previewStyles[styleKey as string] : config.default;

        if (config.type === 'number' || config.type === 'range') {
          const unit = config.unit || 'px';
          value = `${value}${unit}`;
        }

        inlineStyles[cssProp] = value;
      }
    });
  }

  const ElementTag = element.type === 'container' ? 'div' : element.type;
  const content = element.dataKey ? (defaultData[element.dataKey] || `[${element.dataKey}]`) : null;

  const voidElements = ['hr', 'br', 'img', 'input', 'meta', 'link'];
  const isVoidElement = voidElements.includes(element.type);

  // Elements that cannot have text content as children
  const noTextContentElements = ['textarea', 'select'];
  const shouldRenderContent = !noTextContentElements.includes(element.type);

  return (
    <div
      ref={setRefs}
      key={pathStr}
      className={`group transition-all duration-150 ease-in-out ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : ''
      } ${isOver && isContainer ? 'ring-2 ring-green-500' : ''}`}
      style={{
        minHeight: element.children ? '40px' : 'auto',
        overflow: 'visible',
        opacity: isDragging ? '0.4' : '1',
        position: 'relative',
        pointerEvents: 'none'
      }}
    >
      {/* Element controls overlay */}
      <div className="absolute top-0 left-0 right-0 opacity-30 group-hover:opacity-100 z-20 transition-opacity flex items-center justify-between gap-2 pointer-events-none">
        {/* Left side - Breadcrumb handles or single handle */}
        <div className="flex items-center gap-0.5 pointer-events-auto">
          {shouldShowBreadcrumb ? (
            breadcrumb.map((crumb, idx) => (
              <div
                key={crumb.path.join('-')}
                data-drag-handle
                {...(idx === breadcrumb.length - 1 ? listeners : {})}
                {...(idx === breadcrumb.length - 1 ? attributes : {})}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement({ element: crumb.element, path: crumb.path });
                }}
                className={`flex items-center gap-1 px-2 py-1 text-white text-xs font-semibold select-none ${
                  idx === breadcrumb.length - 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                } transition-all ${
                  idx === breadcrumb.length - 1
                    ? 'bg-blue-600/95 backdrop-blur-sm rounded-br shadow-md'
                    : 'bg-gray-600/90 backdrop-blur-sm hover:bg-gray-700/90'
                } ${idx === 0 ? 'rounded-tl' : ''}`}
                title={`${idx === breadcrumb.length - 1 ? 'Drag' : 'Select'} ${crumb.label}${crumb.element.children !== undefined ? ' (container)' : ''}`}
              >
                <GripVertical size={12} />
                <span>{crumb.label}</span>
                {idx < breadcrumb.length - 1 && <span className="opacity-50">/</span>}
              </div>
            ))
          ) : (
            <div
              data-drag-handle
              {...listeners}
              {...attributes}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600/95 backdrop-blur-sm rounded-tl rounded-br shadow-md text-white text-xs font-semibold select-none cursor-grab active:cursor-grabbing"
              title={`Drag ${element.type}${hasChildren ? ' (container)' : ''}`}
            >
              <GripVertical size={12} />
              <span>{element.type}</span>
            </div>
          )}
        </div>

        {/* Right side - Quick actions */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-bl shadow-md overflow-hidden pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyElement(currentPath);
            }}
            className="px-2 py-1 hover:bg-blue-50 text-blue-600 transition-colors"
            title="Duplicate (Ctrl+D)"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteElement(currentPath);
            }}
            className="px-2 py-1 hover:bg-red-50 text-red-600 transition-colors"
            title="Delete (Del)"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Render void elements without children */}
      {isVoidElement ? (
        <ElementTag
          className={element.className || ''}
          style={{...inlineStyles, pointerEvents: 'auto'}}
          src={element.srcKey ? defaultData[element.srcKey] : undefined}
          alt={element.altKey ? defaultData[element.altKey] : undefined}
          onClick={(e: any) => {
            e.stopPropagation();
            onSelectElement({ element, path: currentPath });
          }}
        />
      ) : (
        <ElementTag
          className={element.className || ''}
          style={{...inlineStyles, position: 'relative', pointerEvents: 'auto'}}
          src={element.srcKey ? defaultData[element.srcKey] : undefined}
          alt={element.altKey ? defaultData[element.altKey] : undefined}
          href={element.hrefKey ? defaultData[element.hrefKey] : undefined}
          poster={element.posterKey ? defaultData[element.posterKey] : undefined}
          title={element.titleKey ? defaultData[element.titleKey] : undefined}
          controls={element.controls}
          loop={element.loop}
          muted={element.muted}
          autoPlay={element.autoPlay}
          allowFullScreen={element.allowFullScreen}
          placeholder={element.type === 'textarea' ? (element.placeholder || content || '') : undefined}
          defaultValue={element.type === 'textarea' ? (content || '') : undefined}
          onClick={(e: any) => {
            e.stopPropagation();
            onSelectElement({ element, path: currentPath });
          }}
        >
          {shouldRenderContent && content}

          {element.children && element.children.length > 0 && element.type !== 'textarea' && (
            <>
              {element.children.map((child: any, index: number) => (
                <React.Fragment key={`${currentPath.join('-')}-${index}`}>
                  {renderDropZone(currentPath, index)}
                  <VisualElement
                    element={child}
                    path={[...currentPath, index]}
                    structure={structure}
                    selectedElement={selectedElement}
                    defaultData={defaultData}
                    editableStyles={editableStyles}
                    previewStyles={previewStyles}
                    activeId={activeId}
                    onSelectElement={onSelectElement}
                    onCopyElement={onCopyElement}
                    onDeleteElement={onDeleteElement}
                    renderDropZone={renderDropZone}
                    getIdFromPath={getIdFromPath}
                  />
                </React.Fragment>
              ))}
              {renderDropZone(currentPath, element.children.length)}
            </>
          )}
          {element.children && element.children.length === 0 && (
            <div
              className="text-gray-400 text-sm py-8 text-center border-2 border-dashed border-gray-300 rounded m-2 hover:bg-gray-100 hover:border-gray-400 transition-colors select-none"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="text-lg mb-1">📦</div>
              <div className="font-medium">Перетащите элементы сюда</div>
              <div className="text-xs mt-1 opacity-75">или используйте кнопку +</div>
            </div>
          )}
        </ElementTag>
      )}
    </div>
  );
};

export default VisualElement;
