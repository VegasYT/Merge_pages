import React, { useState } from 'react';
import { Copy, Eye, Code, Settings } from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

// Constants
import { commonClasses } from './constants';

// Utils
import { getElementByPath, getDefaultClasses } from './utils/elementUtils';
import { exportJSON as exportJSONUtil, importJSON as importJSONUtil } from './utils/jsonUtils';

// Hooks
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDndHandlers } from './hooks/useDndHandlers';

// Components
import Header from './components/Header';
import { ElementsSidebar } from './components/Sidebar';
import ElementTree from './components/ElementTree';
import VisualElement from './components/VisualElement';
import DropZone from './components/DropZone';
import EmptyCanvasDropZone from './components/EmptyCanvasDropZone';
import JsonEditorModal from './components/JsonEditorModal';

const App = () => {
  const [structure, setStructure] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editableStyles, setEditableStyles] = useState({});
  const [defaultData, setDefaultData] = useState({});
  const [templateName, setTemplateName] = useState('CustomBlock');
  const [categoryId, setCategoryId] = useState(1);
  const [viewMode, setViewMode] = useState('builder');
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [previewStyles, setPreviewStyles] = useState({});
  const [previewMode, setPreviewMode] = useState('desktop');

  // dnd-kit state
  const [activeId, setActiveId] = useState(null);
  const [draggedElementType, setDraggedElementType] = useState(null);

  // JSON editor modal state
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  // dnd-kit handlers
  const dndHandlers = useDndHandlers({
    structure,
    setStructure,
    defaultData,
    setDefaultData,
    setActiveId,
    setDraggedElementType,
  });

  // Add element
  const addElement = (type, parentPath = null) => {
    const containerTypes = ['container', 'div', 'grid', 'ul', 'ol', 'button', 'a'];
    const needsDataKey = !['container', 'div', 'grid', 'br', 'hr', 'ul', 'ol'].includes(type);

    const newElement = {
      type,
      className: getDefaultClasses(type),
      styles: {},
      children: containerTypes.includes(type) ? [] : undefined,
      dataKey: needsDataKey ? `${type}_${Date.now()}` : undefined,
    };

    // Additional fields for media elements
    if (type === 'img') {
      newElement.srcKey = `image_${Date.now()}`;
      newElement.altKey = `alt_${Date.now()}`;
      setDefaultData({
        ...defaultData,
        [newElement.srcKey]: 'https://via.placeholder.com/800x600',
        [newElement.altKey]: 'Image description'
      });
    }
    if (type === 'video' || type === 'audio') {
      newElement.srcKey = `${type}_${Date.now()}`;
      newElement.controls = true;
      newElement.loop = false;
      newElement.muted = false;
      newElement.autoPlay = false;
      if (type === 'video') {
        newElement.posterKey = `poster_${Date.now()}`;
        setDefaultData({
          ...defaultData,
          [newElement.srcKey]: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
          [newElement.posterKey]: 'https://via.placeholder.com/1920x1080'
        });
      } else {
        setDefaultData({
          ...defaultData,
          [newElement.srcKey]: 'https://example.com/audio.mp3'
        });
      }
    }
    if (type === 'iframe') {
      newElement.srcKey = `iframe_${Date.now()}`;
      newElement.titleKey = `title_${Date.now()}`;
      newElement.allowFullScreen = true;
      setDefaultData({
        ...defaultData,
        [newElement.srcKey]: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        [newElement.titleKey]: 'Embedded content'
      });
    }
    if (type === 'a') {
      newElement.hrefKey = `link_${Date.now()}`;
      setDefaultData({
        ...defaultData,
        [newElement.hrefKey]: '#'
      });
    }

    // Add defaultData for text elements
    if (needsDataKey && newElement.dataKey) {
      setDefaultData({
        ...defaultData,
        [newElement.dataKey]: `Sample ${type} text`
      });
    }

    if (parentPath === null) {
      setStructure([...structure, newElement]);
    } else {
      const newStructure = [...structure];
      const parent = getElementByPath(newStructure, parentPath);
      if (parent && parent.children) {
        parent.children.push(newElement);
      }
      setStructure(newStructure);
    }
  };

  // Delete element
  const deleteElement = (path) => {
    const newStructure = [...structure];
    if (path.length === 1) {
      newStructure.splice(path[0], 1);
    } else {
      const parentPath = path.slice(0, -1);
      const parent = getElementByPath(newStructure, parentPath);
      parent.children.splice(path[path.length - 1], 1);
    }
    setStructure(newStructure);
    setSelectedElement(null);
  };

  // Copy element
  const copyElement = (path) => {
    const newStructure = [...structure];
    const element = getElementByPath(newStructure, path);
    const copied = JSON.parse(JSON.stringify(element));

    if (path.length === 1) {
      newStructure.splice(path[0] + 1, 0, copied);
    } else {
      const parentPath = path.slice(0, -1);
      const parent = getElementByPath(newStructure, parentPath);
      parent.children.splice(path[path.length - 1] + 1, 0, copied);
    }
    setStructure(newStructure);
  };

  // Move element up/down
  const moveElement = (path, direction) => {
    const newStructure = [...structure];

    if (path.length === 1) {
      const index = path[0];
      if (direction === 'up' && index > 0) {
        [newStructure[index], newStructure[index - 1]] = [newStructure[index - 1], newStructure[index]];
      } else if (direction === 'down' && index < newStructure.length - 1) {
        [newStructure[index], newStructure[index + 1]] = [newStructure[index + 1], newStructure[index]];
      }
    } else {
      const parentPath = path.slice(0, -1);
      const parent = getElementByPath(newStructure, parentPath);
      const index = path[path.length - 1];

      if (direction === 'up' && index > 0) {
        [parent.children[index], parent.children[index - 1]] = [parent.children[index - 1], parent.children[index]];
      } else if (direction === 'down' && index < parent.children.length - 1) {
        [parent.children[index], parent.children[index + 1]] = [parent.children[index + 1], parent.children[index]];
      }
    }

    setStructure(newStructure);
  };

  // Update className
  const updateClassName = (path, newClassName) => {
    const newStructure = [...structure];
    const element = getElementByPath(newStructure, path);
    element.className = newClassName;
    setStructure(newStructure);
  };

  // Add editable style
  const addEditableStyle = (styleKey, config) => {
    setEditableStyles({
      ...editableStyles,
      [styleKey]: config
    });
  };

  // Link style to element
  const linkStyleToElement = (path, cssProperty, styleKey) => {
    const newStructure = [...structure];
    const element = getElementByPath(newStructure, path);
    if (!element.styles) element.styles = {};
    element.styles[cssProperty] = styleKey;
    setStructure(newStructure);
  };

  // Toggle collapse node
  const toggleNode = (pathStr) => {
    setCollapsedNodes({
      ...collapsedNodes,
      [pathStr]: !collapsedNodes[pathStr]
    });
  };

  // Export JSON
  const exportJSON = () => {
    exportJSONUtil(structure, editableStyles, defaultData, templateName, categoryId);
  };

  // Import JSON
  const importJSON = (e) => {
    const file = e.target.files[0];
    importJSONUtil(file, {
      setStructure,
      setEditableStyles,
      setDefaultData,
      setTemplateName,
      setCategoryId
    });
  };

  // Handle JSON editor save
  const handleJsonSave = (data) => {
    setStructure(data.structure);
    setEditableStyles(data.editableStyles);
    setDefaultData(data.defaultData);
  };

  // Render drop zone
  const renderDropZone = (parentPath, insertIndex) => {
    return (
      <DropZone
        parentPath={parentPath}
        insertIndex={insertIndex}
        activeId={activeId}
      />
    );
  };

  // Render visual element
  const renderVisualElement = (element, path = []) => {
    return (
      <VisualElement
        element={element}
        path={path}
        structure={structure}
        selectedElement={selectedElement}
        defaultData={defaultData}
        editableStyles={editableStyles}
        previewStyles={previewStyles}
        activeId={activeId}
        onSelectElement={setSelectedElement}
        onCopyElement={copyElement}
        onDeleteElement={deleteElement}
        renderDropZone={renderDropZone}
        getIdFromPath={dndHandlers.getIdFromPath}
      />
    );
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(selectedElement, deleteElement, copyElement);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={dndHandlers.handleDragStart}
      onDragOver={dndHandlers.handleDragOver}
      onDragEnd={dndHandlers.handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Header */}
        <Header
        templateName={templateName}
        setTemplateName={setTemplateName}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onImport={importJSON}
        onExport={exportJSON}
        onOpenJsonEditor={() => setIsJsonEditorOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'builder' && (
          <>
            {/* Left Sidebar - Elements */}
            <div className="w-64 bg-white border-r overflow-y-auto">
              <ElementsSidebar
                onAddElement={addElement}
              />

              <div className="border-t p-4">
                <h3 className="font-bold mb-3 text-sm">Structure Tree</h3>
                <div className="text-sm">
                  {structure.length === 0 ? (
                    <p className="text-gray-500 text-xs">Add elements to start</p>
                  ) : (
                    <ElementTree
                      elements={structure}
                      selectedElement={selectedElement}
                      collapsedNodes={collapsedNodes}
                      onSelectElement={setSelectedElement}
                      onToggleNode={toggleNode}
                      onMoveElement={moveElement}
                      onAddElement={addElement}
                      onCopyElement={copyElement}
                      onDeleteElement={deleteElement}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Center - Canvas */}
            <div className="flex-1 bg-gray-100 p-4 overflow-auto">
              <div className="bg-white rounded shadow-lg p-8 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Visual Preview</h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Select elements from the tree to edit. This is a structure preview - export and use with UniversalBlockRenderer for full rendering.
                </p>

                {structure.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded p-16 text-center">
                    <p className="text-gray-500 text-lg mb-2">Your canvas is empty</p>
                    <p className="text-gray-400 text-sm">Add elements from the left sidebar to start building</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                      <h3 className="font-semibold mb-2 text-blue-900">Structure Overview</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-3 shadow-sm">
                          <p className="text-gray-600 text-xs">Total Elements</p>
                          <p className="text-2xl font-bold text-blue-600">{JSON.stringify(structure).match(/"type"/g)?.length || 0}</p>
                        </div>
                        <div className="bg-white rounded p-3 shadow-sm">
                          <p className="text-gray-600 text-xs">Data Keys</p>
                          <p className="text-2xl font-bold text-green-600">{Object.keys(defaultData).length}</p>
                        </div>
                        <div className="bg-white rounded p-3 shadow-sm">
                          <p className="text-gray-600 text-xs">Editable Styles</p>
                          <p className="text-2xl font-bold text-purple-600">{Object.keys(editableStyles).length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded p-4 bg-gray-50">
                      <h3 className="font-semibold mb-2 text-sm">JSON Structure (collapsed)</h3>
                      <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(structure, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="w-96 bg-white border-l overflow-y-auto">
              <div className="p-4">
                <h3 className="font-bold mb-3">Properties</h3>

                {selectedElement ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Element Type</label>
                      <input
                        type="text"
                        value={selectedElement.element.type}
                        disabled
                        className="w-full px-3 py-2 border rounded bg-gray-100 text-sm"
                      />
                    </div>

                    {/* Data Key */}
                    {selectedElement.element.dataKey !== undefined && (
                      <div>
                        <label className="block text-sm font-semibold mb-1">Data Key</label>
                        <input
                          type="text"
                          value={selectedElement.element.dataKey || ''}
                          onChange={(e) => {
                            const oldKey = selectedElement.element.dataKey;
                            const newKey = e.target.value;

                            const newStructure = [...structure];
                            const element = getElementByPath(newStructure, selectedElement.path);
                            element.dataKey = newKey;
                            setStructure(newStructure);

                            if (newKey) {
                              const newData = { ...defaultData };
                              if (oldKey && oldKey !== newKey) {
                                newData[newKey] = newData[oldKey] || 'Sample text';
                                delete newData[oldKey];
                              } else if (!oldKey) {
                                newData[newKey] = 'Sample text';
                              }
                              setDefaultData(newData);
                            }
                          }}
                          className="w-full px-3 py-2 border rounded text-sm"
                          placeholder="e.g., title, subtitle"
                        />
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <label className="block text-sm font-semibold mb-1">Tailwind Classes</label>
                      <textarea
                        value={selectedElement.element.className || ''}
                        onChange={(e) => updateClassName(selectedElement.path, e.target.value)}
                        className="w-full px-3 py-2 border rounded font-mono text-xs"
                        rows={4}
                        placeholder="py-12 text-center max-w-6xl"
                      />

                      <div className="mt-2">
                        <p className="text-xs font-semibold mb-1">Quick Add Classes:</p>
                        <div className="flex flex-wrap gap-1">
                          {commonClasses.spacing.slice(0, 8).map(cls => (
                            <button
                              key={cls}
                              onClick={() => {
                                const current = selectedElement.element.className || '';
                                if (!current.includes(cls)) {
                                  updateClassName(selectedElement.path, `${current} ${cls}`.trim());
                                }
                              }}
                              className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              {cls}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <label className="block text-sm font-semibold mb-2">Editable Styles</label>
                      <p className="text-xs text-gray-600 mb-3">Link CSS properties to editable styles</p>

                      <div className="space-y-2">
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="CSS property (e.g., backgroundColor)"
                            className="w-full px-2 py-1 border rounded text-xs"
                            id="css-prop"
                          />
                          <input
                            type="text"
                            placeholder="Style key (e.g., primaryColor)"
                            className="w-full px-2 py-1 border rounded text-xs"
                            id="style-key"
                          />
                          <button
                            onClick={() => {
                              const cssProp = document.getElementById('css-prop').value;
                              const styleKey = document.getElementById('style-key').value;
                              if (cssProp && styleKey) {
                                linkStyleToElement(selectedElement.path, cssProp, styleKey);
                                if (!editableStyles[styleKey]) {
                                  addEditableStyle(styleKey, {
                                    type: 'color',
                                    label: styleKey,
                                    default: '#667eea'
                                  });
                                }
                                document.getElementById('css-prop').value = '';
                                document.getElementById('style-key').value = '';
                              }
                            }}
                            className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-semibold"
                          >
                            + Add Style Link
                          </button>
                        </div>

                        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                          <p className="font-semibold mb-1">Common CSS properties:</p>
                          <p>backgroundColor, color, fontSize, padding, margin, borderRadius, width, height</p>
                        </div>
                      </div>

                      {selectedElement.element.styles && Object.keys(selectedElement.element.styles).length > 0 && (
                        <div className="mt-3 text-xs bg-green-50 p-3 rounded border border-green-200">
                          <p className="font-semibold mb-2 text-green-800">Linked styles:</p>
                          {Object.entries(selectedElement.element.styles).map(([css, key]) => (
                            <div key={css} className="flex justify-between items-center text-gray-700 mb-1 bg-white px-2 py-1 rounded">
                              <span className="font-mono text-xs">{css} → {key}</span>
                              <button
                                onClick={() => {
                                  const newStructure = [...structure];
                                  const element = getElementByPath(newStructure, selectedElement.path);
                                  delete element.styles[css];
                                  setStructure(newStructure);
                                }}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Editable Styles Configuration */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Settings size={16} />
                        Configure Editable Styles
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {Object.entries(editableStyles).map(([key, config]) => (
                          <div key={key} className="border rounded p-3 text-xs bg-gray-50">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-semibold text-purple-700">{key}</span>
                              <button
                                onClick={() => {
                                  const newStyles = { ...editableStyles };
                                  delete newStyles[key];
                                  setEditableStyles(newStyles);
                                }}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                ×
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-semibold mb-1">Type</label>
                                <select
                                  value={config.type}
                                  onChange={(e) => {
                                    const newType = e.target.value;
                                    const updatedConfig = { ...config, type: newType };

                                    if ((newType === 'number' || newType === 'range') && !config.unit) {
                                      updatedConfig.unit = 'px';
                                      updatedConfig.min = config.min || 0;
                                      updatedConfig.max = config.max || 100;
                                      updatedConfig.step = config.step || 1;
                                    }

                                    setEditableStyles({
                                      ...editableStyles,
                                      [key]: updatedConfig
                                    });
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                >
                                  <option value="color">Color</option>
                                  <option value="text">Text</option>
                                  <option value="number">Number</option>
                                  <option value="range">Range</option>
                                  <option value="select">Select</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold mb-1">Label</label>
                                <input
                                  type="text"
                                  value={config.label}
                                  onChange={(e) => {
                                    setEditableStyles({
                                      ...editableStyles,
                                      [key]: { ...config, label: e.target.value }
                                    });
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold mb-1">Default Value</label>
                                <input
                                  type="text"
                                  value={config.default}
                                  onChange={(e) => {
                                    setEditableStyles({
                                      ...editableStyles,
                                      [key]: { ...config, default: e.target.value }
                                    });
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                />
                              </div>

                              {(config.type === 'number' || config.type === 'range') && (
                                <>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Min</label>
                                      <input
                                        type="number"
                                        value={config.min || 0}
                                        onChange={(e) => {
                                          setEditableStyles({
                                            ...editableStyles,
                                            [key]: { ...config, min: parseInt(e.target.value) }
                                          });
                                        }}
                                        className="w-full px-1 py-1 border rounded text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Max</label>
                                      <input
                                        type="number"
                                        value={config.max || 100}
                                        onChange={(e) => {
                                          setEditableStyles({
                                            ...editableStyles,
                                            [key]: { ...config, max: parseInt(e.target.value) }
                                          });
                                        }}
                                        className="w-full px-1 py-1 border rounded text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Step</label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={config.step || 1}
                                        onChange={(e) => {
                                          setEditableStyles({
                                            ...editableStyles,
                                            [key]: { ...config, step: parseFloat(e.target.value) }
                                          });
                                        }}
                                        className="w-full px-1 py-1 border rounded text-xs"
                                      />
                                    </div>
                                  </div>
                                  {config.type === 'number' && (
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Unit</label>
                                      <input
                                        type="text"
                                        value={config.unit || 'px'}
                                        onFocus={(e) => {
                                          if (!config.unit) {
                                            setEditableStyles({
                                              ...editableStyles,
                                              [key]: { ...config, unit: 'px' }
                                            });
                                          }
                                        }}
                                        onChange={(e) => {
                                          setEditableStyles({
                                            ...editableStyles,
                                            [key]: { ...config, unit: e.target.value }
                                          });
                                        }}
                                        className="w-full px-2 py-1 border rounded text-xs"
                                        placeholder="px, rem, %, etc"
                                      />
                                    </div>
                                  )}
                                </>
                              )}

                              {config.type === 'text' && (
                                <div>
                                  <label className="block text-xs font-semibold mb-1">Placeholder</label>
                                  <input
                                    type="text"
                                    value={config.placeholder || ''}
                                    onChange={(e) => {
                                      setEditableStyles({
                                        ...editableStyles,
                                        [key]: { ...config, placeholder: e.target.value }
                                      });
                                    }}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                  />
                                </div>
                              )}

                              {config.type === 'select' && (
                                <div>
                                  <label className="block text-xs font-semibold mb-1">Options (comma separated)</label>
                                  <input
                                    type="text"
                                    value={config.options?.join(', ') || ''}
                                    onChange={(e) => {
                                      setEditableStyles({
                                        ...editableStyles,
                                        [key]: { ...config, options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) }
                                      });
                                    }}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                    placeholder="option1, option2, option3"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {Object.keys(editableStyles).length === 0 && (
                          <p className="text-xs text-gray-500 text-center py-4">
                            No editable styles configured yet. Link CSS properties above to create them.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">Select an element from the tree to edit its properties</p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Code size={16} />
                    Default Data
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(defaultData).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-2 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-semibold text-gray-700">{key}</label>
                          <button
                            onClick={() => {
                              const newData = { ...defaultData };
                              delete newData[key];
                              setDefaultData(newData);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setDefaultData({ ...defaultData, [key]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-xs font-mono"
                        />
                      </div>
                    ))}
                    {Object.keys(defaultData).length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-4">
                        No data keys yet. Add elements with dataKey to populate this section.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === 'visual' && (
          <>
            {/* Left Sidebar - Elements */}
            <div className="w-64 bg-white border-r overflow-y-auto">
              <ElementsSidebar
                onAddElement={addElement}
              />

              <div className="border-t p-4">
                <h3 className="font-bold mb-3 text-sm">Structure Tree</h3>
                <div className="text-sm">
                  {structure.length === 0 ? (
                    <p className="text-gray-500 text-xs">Add elements to start</p>
                  ) : (
                    <ElementTree
                      elements={structure}
                      selectedElement={selectedElement}
                      collapsedNodes={collapsedNodes}
                      onSelectElement={setSelectedElement}
                      onToggleNode={toggleNode}
                      onMoveElement={moveElement}
                      onAddElement={addElement}
                      onCopyElement={copyElement}
                      onDeleteElement={deleteElement}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Center - Visual Canvas */}
            <div className="flex-1 bg-gray-100 p-4 overflow-auto">
              <div className="mx-auto">
                {/* Preview Mode Switcher */}
                <div className="mb-4 flex items-center justify-center gap-3 bg-white rounded-lg p-3 shadow-md max-w-fit mx-auto">
                  <span className="text-sm font-semibold text-gray-700">Preview:</span>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      previewMode === 'desktop'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🖥️ Desktop
                    <span className="text-xs ml-1 opacity-75">(100%)</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      previewMode === 'tablet'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📱 Tablet
                    <span className="text-xs ml-1 opacity-75">(768px)</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      previewMode === 'mobile'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📱 Mobile
                    <span className="text-xs ml-1 opacity-75">(375px)</span>
                  </button>
                </div>

                {/* Preview Container */}
                <div
                  className="bg-white rounded shadow-lg p-8 mx-auto transition-all duration-500 ease-in-out"
                  style={{
                    maxWidth: previewMode === 'desktop' ? '100%' :
                              previewMode === 'tablet' ? '768px' : '375px'
                  }}
                >
                  <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                    <h2 className="text-xl font-bold mb-2 text-purple-900">🎨 Visual Editor</h2>
                    <div className="text-sm text-purple-700 space-y-2">
                      <p className="font-medium">✨ Улучшенный редактор с поддержкой drag & drop:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                        <li>Перетаскивайте элементы используя <strong>drag handle</strong> (⋮⋮)</li>
                        <li>Быстрые действия на hover: <strong>дублировать</strong> и <strong>удалить</strong></li>
                        <li>Клавиатурные шорткаты: <kbd className="px-1 py-0.5 bg-purple-200 rounded text-purple-900 font-mono">Del</kbd> - удалить, <kbd className="px-1 py-0.5 bg-purple-200 rounded text-purple-900 font-mono">Ctrl+D</kbd> - дублировать</li>
                        <li>Точные зоны вставки: перед, после или внутрь контейнера</li>
                      </ul>
                    </div>
                  </div>

                  {structure.length === 0 ? (
                    <EmptyCanvasDropZone />
                  ) : (
                    <div className="space-y-0">
                      {structure.map((element, index) => (
                        <React.Fragment key={`root-${index}`}>
                          {renderDropZone([], index)}
                          {renderVisualElement(element, [index])}
                        </React.Fragment>
                      ))}
                      {renderDropZone([], structure.length)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Properties and Live Preview */}
            <div className="w-96 bg-white border-l overflow-y-auto">
              <div className="p-4">
                <h3 className="font-bold mb-3">Properties</h3>

                {selectedElement ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Element Type</label>
                      <input
                        type="text"
                        value={selectedElement.element.type}
                        disabled
                        className="w-full px-3 py-2 border rounded bg-gray-100 text-sm"
                      />
                    </div>

                    {selectedElement.element.dataKey !== undefined && (
                      <div>
                        <label className="block text-sm font-semibold mb-1">Content</label>
                        <input
                          type="text"
                          value={defaultData[selectedElement.element.dataKey] || ''}
                          onChange={(e) => {
                            setDefaultData({
                              ...defaultData,
                              [selectedElement.element.dataKey]: e.target.value
                            });
                          }}
                          className="w-full px-3 py-2 border rounded text-sm"
                          placeholder="Enter content..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Key: {selectedElement.element.dataKey}</p>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <label className="block text-sm font-semibold mb-1">Tailwind Classes</label>
                      <textarea
                        value={selectedElement.element.className || ''}
                        onChange={(e) => updateClassName(selectedElement.path, e.target.value)}
                        className="w-full px-3 py-2 border rounded font-mono text-xs"
                        rows={4}
                        placeholder="py-12 text-center max-w-6xl"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">Выберите элемент для редактирования</p>
                  </div>
                )}

                {/* Live Preview Controls */}
                {Object.keys(editableStyles).length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Settings size={16} />
                      Live Preview Controls
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Настройте стили как это сделал бы пользователь
                    </p>
                    <div className="space-y-3">
                      {Object.entries(editableStyles).map(([key, config]) => (
                        <div key={key} className="border rounded p-3 bg-gray-50">
                          <label className="block text-xs font-semibold mb-2 text-purple-700">
                            {config.label || key}
                          </label>

                          {config.type === 'color' && (
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={previewStyles[key] || config.default}
                                onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                                className="w-12 h-10 border rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={previewStyles[key] || config.default}
                                onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                                className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                              />
                            </div>
                          )}

                          {config.type === 'text' && (
                            <input
                              type="text"
                              value={previewStyles[key] || config.default}
                              onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                              placeholder={config.placeholder}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          )}

                          {config.type === 'number' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={previewStyles[key] !== undefined ? previewStyles[key] : config.default}
                                onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                                min={config.min}
                                max={config.max}
                                step={config.step}
                                className="flex-1 px-2 py-1 border rounded text-xs"
                              />
                              {config.unit && <span className="text-xs text-gray-600">{config.unit}</span>}
                            </div>
                          )}

                          {config.type === 'range' && (
                            <div className="space-y-1">
                              <input
                                type="range"
                                value={previewStyles[key] !== undefined ? previewStyles[key] : config.default}
                                onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                                min={config.min}
                                max={config.max}
                                step={config.step}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>{config.min}</span>
                                <span className="font-semibold">
                                  {previewStyles[key] !== undefined ? previewStyles[key] : config.default}
                                  {config.unit}
                                </span>
                                <span>{config.max}</span>
                              </div>
                            </div>
                          )}

                          {config.type === 'select' && (
                            <select
                              value={previewStyles[key] || config.default}
                              onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-xs"
                            >
                              {config.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          )}

                          <button
                            onClick={() => {
                              const newPreview = { ...previewStyles };
                              delete newPreview[key];
                              setPreviewStyles(newPreview);
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            Reset to default
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {viewMode === 'json' && (
          <div className="flex-1 p-6 overflow-auto bg-gray-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Generated JSON Template</h2>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({
                      id: Date.now(),
                      category_id: categoryId,
                      template_name: templateName,
                      name: templateName,
                      preview_url: 'https://via.placeholder.com/300x200',
                      settings: {
                        structure,
                        editableElements: Object.keys(defaultData),
                        editableStyles
                      },
                      default_data: defaultData
                    }, null, 2));
                    alert('JSON copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  <Copy size={14} className="inline mr-1" /> Copy JSON
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">Template Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Template Name:</span>
                    <span className="ml-2 font-semibold">{templateName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category ID:</span>
                    <span className="ml-2 font-semibold">{categoryId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Elements:</span>
                    <span className="ml-2 font-semibold">{JSON.stringify(structure).match(/"type"/g)?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Editable Items:</span>
                    <span className="ml-2 font-semibold">{Object.keys(defaultData).length + Object.keys(editableStyles).length}</span>
                  </div>
                </div>
              </div>

              <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto text-xs leading-relaxed shadow-inner">
                {JSON.stringify({
                  id: Date.now(),
                  category_id: categoryId,
                  template_name: templateName,
                  name: templateName,
                  preview_url: 'https://via.placeholder.com/300x200',
                  settings: {
                    structure,
                    editableElements: Object.keys(defaultData),
                    editableStyles
                  },
                  default_data: defaultData
                }, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* JSON Editor Modal */}
      <JsonEditorModal
        isOpen={isJsonEditorOpen}
        onClose={() => setIsJsonEditorOpen(false)}
        structure={structure}
        editableStyles={editableStyles}
        defaultData={defaultData}
        onSave={handleJsonSave}
      />
    </DndContext>
  );
};

export default App;
