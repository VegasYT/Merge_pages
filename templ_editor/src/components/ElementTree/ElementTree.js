import React from 'react';
import { ChevronRight, ChevronDown, Plus, Copy, Trash2 } from 'lucide-react';

const ElementTree = ({
  elements,
  path = [],
  selectedElement,
  collapsedNodes,
  onSelectElement,
  onToggleNode,
  onMoveElement,
  onAddElement,
  onCopyElement,
  onDeleteElement
}) => {
  return elements.map((element, index) => {
    const currentPath = [...path, index];
    const pathStr = currentPath.join('-');
    const isSelected = selectedElement && JSON.stringify(selectedElement.path) === JSON.stringify(currentPath);
    const hasChildren = element.children !== undefined;
    const hasChildrenContent = element.children && element.children.length > 0;
    const isCollapsed = collapsedNodes[pathStr];

    return (
      <div key={index} className="ml-2">
        <div
          className={`flex items-center gap-1 p-2 rounded cursor-pointer hover:bg-blue-50 mb-1 ${
            isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'border border-gray-300'
          }`}
          onClick={() => onSelectElement({ element, path: currentPath })}
        >
          {hasChildrenContent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleNode(pathStr);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          {!hasChildrenContent && <span className="w-5"></span>}

          <span className="text-xs font-semibold flex-1">{element.type}</span>
          {element.dataKey && <span className="text-xs text-gray-500">({element.dataKey.substring(0, 8)}...)</span>}

          <div className="flex flex-wrap gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveElement(currentPath, 'up');
              }}
              className="p-0.5 hover:bg-gray-200 rounded text-xs"
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveElement(currentPath, 'down');
              }}
              className="p-0.5 hover:bg-gray-200 rounded text-xs"
              title="Move down"
            >
              ↓
            </button>
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddElement('div', currentPath);
                }}
                className="p-0.5 hover:bg-green-200 rounded"
                title="Add child"
              >
                <Plus size={12} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyElement(currentPath);
              }}
              className="p-0.5 hover:bg-blue-200 rounded"
              title="Copy"
            >
              <Copy size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteElement(currentPath);
              }}
              className="p-0.5 hover:bg-red-200 rounded"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        {hasChildrenContent && !isCollapsed && (
          <div className="ml-2 border-l-2 border-gray-300 pl-2">
            <ElementTree
              elements={element.children}
              path={currentPath}
              selectedElement={selectedElement}
              collapsedNodes={collapsedNodes}
              onSelectElement={onSelectElement}
              onToggleNode={onToggleNode}
              onMoveElement={onMoveElement}
              onAddElement={onAddElement}
              onCopyElement={onCopyElement}
              onDeleteElement={onDeleteElement}
            />
          </div>
        )}
      </div>
    );
  });
};

export default ElementTree;
