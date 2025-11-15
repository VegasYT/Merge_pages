import { useDraggable } from '@dnd-kit/core';
import { elementTypes, categories } from '../constants/elementTypes';

interface DraggableElementProps {
  el: { type: string; label: string; icon: string };
  onAddElement: (type: string) => void;
}

const DraggableElement = ({ el, onAddElement }: DraggableElementProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${el.type}`,
    data: {
      type: 'new',
      elementType: el.type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onAddElement(el.type)}
      className={`w-full p-2 border rounded hover:bg-blue-50 text-left flex items-center gap-2 text-xs cursor-move hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span className="text-sm">{el.icon}</span>
      <span>{el.label}</span>
      <span className="ml-auto text-gray-400">⋮⋮</span>
    </div>
  );
};

interface ElementsSidebarProps {
  onAddElement: (type: string) => void;
}

const ElementsSidebar = ({ onAddElement }: ElementsSidebarProps) => {
  return (
    <div className="p-4">
      <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
        <span>Elements</span>
        <span className="text-xs font-normal text-gray-500">(drag to canvas)</span>
      </h3>
      {categories.map(category => (
        <div key={category} className="mb-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">{category}</h4>
          <div className="space-y-1">
            {elementTypes
              .filter(el => el.category === category)
              .map((el) => (
                <DraggableElement key={el.type} el={el} onAddElement={onAddElement} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ElementsSidebar;
