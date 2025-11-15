import { getElementByPath, getDefaultClasses } from '../utils/elementUtils';

interface UseDndHandlersProps {
  structure: any[];
  setStructure: (structure: any[]) => void;
  defaultData: Record<string, any>;
  setDefaultData: (data: Record<string, any>) => void;
  setActiveId: (id: string | null) => void;
  setDraggedElementType: (type: string | null) => void;
}

export const useDndHandlers = ({
  structure,
  setStructure,
  defaultData,
  setDefaultData,
  setActiveId,
  setDraggedElementType,
}: UseDndHandlersProps) => {
  // Helper to create new element
  const createNewElement = (type: string) => {
    const containerTypes = ['container', 'div', 'grid', 'ul', 'ol', 'button', 'a'];
    const needsDataKey = !['container', 'div', 'grid', 'br', 'hr', 'ul', 'ol', 'img', 'video', 'audio', 'iframe'].includes(type);

    const newElement: any = {
      type,
      className: getDefaultClasses(type),
      styles: {},
      children: containerTypes.includes(type) ? [] : undefined,
      dataKey: needsDataKey ? `${type}_${Date.now()}` : undefined,
    };

    const newData: Record<string, any> = {};

    if (needsDataKey && newElement.dataKey) {
      newData[newElement.dataKey] = `Sample ${type} text`;
    }

    if (type === 'img') {
      newElement.srcKey = `image_${Date.now()}`;
      newElement.altKey = `alt_${Date.now()}`;
      newData[newElement.srcKey] = 'https://via.placeholder.com/800x600';
      newData[newElement.altKey] = 'Image description';
    } else if (type === 'video' || type === 'audio') {
      newElement.srcKey = `${type}_${Date.now()}`;
      newElement.controls = true;
      newElement.loop = false;
      newElement.muted = false;
      newElement.autoPlay = false;
      if (type === 'video') {
        newElement.posterKey = `poster_${Date.now()}`;
        newData[newElement.srcKey] = 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4';
        newData[newElement.posterKey] = 'https://via.placeholder.com/1920x1080';
      } else {
        newData[newElement.srcKey] = 'https://example.com/audio.mp3';
      }
    } else if (type === 'iframe') {
      newElement.srcKey = `iframe_${Date.now()}`;
      newElement.titleKey = `title_${Date.now()}`;
      newElement.allowFullScreen = true;
      newData[newElement.srcKey] = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      newData[newElement.titleKey] = 'Embedded content';
    } else if (type === 'a') {
      newElement.hrefKey = `link_${Date.now()}`;
      newData[newElement.hrefKey] = '#';
    }

    // Update defaultData
    if (Object.keys(newData).length > 0) {
      setDefaultData((prev) => ({ ...prev, ...newData }));
    }

    return newElement;
  };

  // Helper to get element path from ID
  const getPathFromId = (id: string): number[] | null => {
    if (typeof id === 'string' && id.startsWith('element-')) {
      return id.replace('element-', '').split('-').map(Number);
    }
    return null;
  };

  // Helper to generate ID from path
  const getIdFromPath = (path: number[]): string => {
    return `element-${path.join('-')}`;
  };

  // Handle drag start
  const handleDragStart = (event: any) => {
    const { active } = event;

    if (active.data.current?.type === 'new') {
      // Dragging new element from sidebar
      setDraggedElementType(active.data.current.elementType);
      setActiveId(active.id);
    } else {
      // Dragging existing element
      setActiveId(active.id);
    }
  };

  // Handle drag over
  const handleDragOver = (event: any) => {
    const { over } = event;
    // Track what we're hovering over for visual feedback
    if (over) {
      // setOverId can be used for visual feedback
    }
  };

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setDraggedElementType(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // Case 1: Adding new element from sidebar
    if (activeData?.type === 'new') {
      const elementType = activeData.elementType;
      const newElement = createNewElement(elementType);

      if (overData?.type === 'drop-zone') {
        // Drop into a specific position
        const { parentPath, insertIndex } = overData;
        const newStructure = JSON.parse(JSON.stringify(structure));

        if (parentPath.length === 0) {
          newStructure.splice(insertIndex, 0, newElement);
        } else {
          const parent = getElementByPath(newStructure, parentPath);
          if (parent && parent.children) {
            parent.children.splice(insertIndex, 0, newElement);
          }
        }

        setStructure(newStructure);
      } else if (overData?.type === 'element') {
        // Drop onto an element
        const overPath = getPathFromId(over.id);
        const newStructure = JSON.parse(JSON.stringify(structure));
        const overElement = getElementByPath(newStructure, overPath!);

        // If it's a container, add inside
        if (overElement && overElement.children !== undefined) {
          overElement.children.push(newElement);
          setStructure(newStructure);
        } else {
          // Otherwise, add after
          if (overPath!.length === 1) {
            newStructure.splice(overPath![0] + 1, 0, newElement);
          } else {
            const parentPath = overPath!.slice(0, -1);
            const parent = getElementByPath(newStructure, parentPath);
            if (parent && parent.children) {
              parent.children.splice(overPath![overPath!.length - 1] + 1, 0, newElement);
            }
          }
          setStructure(newStructure);
        }
      }
    }
    // Case 2: Moving existing element
    else if (activeData?.type === 'element') {
      const activePath = getPathFromId(active.id);

      if (!activePath) {
        setActiveId(null);
        return;
      }

      if (overData?.type === 'drop-zone') {
        // Move to specific position
        moveElementToPosition(activePath, overData.parentPath, overData.insertIndex);
      } else if (overData?.type === 'element') {
        // Move relative to another element
        const overPath = getPathFromId(over.id);
        if (!overPath || JSON.stringify(activePath) === JSON.stringify(overPath)) {
          setActiveId(null);
          return;
        }

        // Check if trying to move into itself
        if (overPath.length > activePath.length) {
          const isChild = activePath.every((val, idx) => val === overPath[idx]);
          if (isChild) {
            setActiveId(null);
            return;
          }
        }

        const newStructure = JSON.parse(JSON.stringify(structure));
        const overElement = getElementByPath(newStructure, overPath);

        // If over a container, move inside
        if (overElement && overElement.children !== undefined) {
          moveElementToPosition(activePath, overPath, overElement.children.length);
        } else {
          // Otherwise, move after
          if (overPath.length === 1) {
            moveElementToPosition(activePath, [], overPath[0] + 1);
          } else {
            const parentPath = overPath.slice(0, -1);
            moveElementToPosition(activePath, parentPath, overPath[overPath.length - 1] + 1);
          }
        }
      }
    }

    setActiveId(null);
    setDraggedElementType(null);
  };

  // Helper to move element to specific position
  const moveElementToPosition = (sourcePath: number[], targetParentPath: number[], insertIndex: number) => {
    const newStructure = JSON.parse(JSON.stringify(structure));

    // Get the element to move
    const element = getElementByPath(newStructure, sourcePath);
    if (!element) return;

    const elementCopy = JSON.parse(JSON.stringify(element));

    // Get target parent BEFORE removing element (important for index stability)
    let targetParent: any = null;
    if (targetParentPath.length > 0) {
      targetParent = getElementByPath(newStructure, targetParentPath);
      if (!targetParent || !targetParent.children) {
        console.error('Target parent not found or has no children');
        return;
      }
    }

    // Adjust insert index if moving within same parent
    let adjustedIndex = insertIndex;
    const sameParent = JSON.stringify(sourcePath.slice(0, -1)) === JSON.stringify(targetParentPath);
    if (sameParent && sourcePath[sourcePath.length - 1] < insertIndex) {
      adjustedIndex--;
    }

    // Remove from old position
    if (sourcePath.length === 1) {
      newStructure.splice(sourcePath[0], 1);
    } else {
      const sourceParentPath = sourcePath.slice(0, -1);
      const sourceParent = getElementByPath(newStructure, sourceParentPath);
      if (sourceParent && sourceParent.children) {
        sourceParent.children.splice(sourcePath[sourcePath.length - 1], 1);
      }
    }

    // Insert at new position using the reference we got earlier
    if (targetParentPath.length === 0) {
      newStructure.splice(adjustedIndex, 0, elementCopy);
    } else {
      // Use the reference we got before removing
      targetParent.children.splice(adjustedIndex, 0, elementCopy);
    }

    setStructure(newStructure);
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getIdFromPath,
    createNewElement,
  };
};
