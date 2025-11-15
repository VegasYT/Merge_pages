import React, { useState } from 'react';
import { Plus, Trash2, Copy, Download, Upload, Eye, Code, Settings, ChevronDown, ChevronRight } from 'lucide-react';

export const AdminPage = () => {
  const [structure, setStructure] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editableStyles, setEditableStyles] = useState({});
  const [defaultData, setDefaultData] = useState({});
  const [templateName, setTemplateName] = useState('CustomBlock');
  const [categoryId, setCategoryId] = useState(1);
  const [viewMode, setViewMode] = useState('builder');
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [javascript, setJavascript] = useState('');

  // Базовые элементы для добавления
  const elementTypes = [
    { type: 'container', label: 'Container', icon: '📦', category: 'Layout' },
    { type: 'div', label: 'Div', icon: '□', category: 'Layout' },
    { type: 'grid', label: 'Grid', icon: '⊞', category: 'Layout' },
    { type: 'h1', label: 'Heading 1', icon: 'H1', category: 'Text' },
    { type: 'h2', label: 'Heading 2', icon: 'H2', category: 'Text' },
    { type: 'h3', label: 'Heading 3', icon: 'H3', category: 'Text' },
    { type: 'h4', label: 'Heading 4', icon: 'H4', category: 'Text' },
    { type: 'h5', label: 'Heading 5', icon: 'H5', category: 'Text' },
    { type: 'h6', label: 'Heading 6', icon: 'H6', category: 'Text' },
    { type: 'p', label: 'Paragraph', icon: 'P', category: 'Text' },
    { type: 'span', label: 'Span', icon: 'S', category: 'Text' },
    { type: 'strong', label: 'Bold', icon: 'B', category: 'Text' },
    { type: 'em', label: 'Italic', icon: 'I', category: 'Text' },
    { type: 'small', label: 'Small', icon: 's', category: 'Text' },
    { type: 'button', label: 'Button', icon: '🔘', category: 'Interactive' },
    { type: 'a', label: 'Link', icon: '🔗', category: 'Interactive' },
    { type: 'img', label: 'Image', icon: '🖼️', category: 'Media' },
    { type: 'video', label: 'Video', icon: '🎬', category: 'Media' },
    { type: 'audio', label: 'Audio', icon: '🎵', category: 'Media' },
    { type: 'iframe', label: 'iFrame', icon: '🌐', category: 'Media' },
    { type: 'ul', label: 'List (ul)', icon: '•', category: 'Lists' },
    { type: 'ol', label: 'List (ol)', icon: '1.', category: 'Lists' },
    { type: 'li', label: 'List Item', icon: '◦', category: 'Lists' },
    { type: 'br', label: 'Line Break', icon: '↵', category: 'Utility' },
    { type: 'hr', label: 'Divider', icon: '─', category: 'Utility' },
  ];

  const categories = ['Layout', 'Text', 'Interactive', 'Media', 'Lists', 'Utility'];

  // Часто используемые Tailwind классы
  const commonClasses = {
    spacing: ['p-4', 'py-8', 'py-12', 'py-16', 'px-4', 'px-6', 'mx-auto', 'mb-4', 'mb-6', 'mb-8'],
    responsive: ['sm:', 'md:', 'lg:', 'xl:'],
    text: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
    layout: ['flex', 'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'max-w-full', 'max-w-6xl', 'w-full'],
    other: ['rounded', 'rounded-lg', 'shadow', 'shadow-md', 'font-bold', 'text-center', 'hover:opacity-90']
  };

  // Добавление элемента
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

    // Дополнительные поля для медиа элементов
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
      newElement.titleKey = `iframe_title_${Date.now()}`;
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

    // Добавление defaultData для текстовых элементов
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

  // Получение элемента по пути
  const getElementByPath = (struct, path) => {
    let current = { children: struct };
    for (const index of path) {
      current = current.children[index];
    }
    return current;
  };

  // Дефолтные классы для элементов
  const getDefaultClasses = (type) => {
    switch (type) {
      case 'container':
        return 'py-12';
      case 'div':
        return '';
      case 'h1':
        return 'text-4xl font-bold mb-4';
      case 'h2':
        return 'text-3xl font-bold mb-4';
      case 'h3':
        return 'text-2xl font-bold mb-3';
      case 'h4':
        return 'text-xl font-bold mb-3';
      case 'h5':
        return 'text-lg font-bold mb-2';
      case 'h6':
        return 'text-base font-bold mb-2';
      case 'p':
        return 'text-base mb-4';
      case 'span':
        return 'text-base';
      case 'button':
        return 'px-6 py-3 rounded text-white font-semibold bg-blue-500 hover:bg-blue-600';
      case 'a':
        return 'text-blue-600 hover:underline';
      case 'img':
        return 'w-full h-auto';
      case 'video':
      case 'audio':
        return 'w-full';
      case 'iframe':
        return 'w-full h-96';
      case 'grid':
        return 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';
      case 'ul':
      case 'ol':
        return 'space-y-2';
      case 'li':
        return 'text-base';
      case 'strong':
        return 'font-bold';
      case 'em':
        return 'italic';
      case 'small':
        return 'text-sm';
      case 'hr':
        return 'my-4 border-gray-300';
      default:
        return '';
    }
  };

  // Удаление элемента
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

  // Копирование элемента
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

  // Перемещение элемента вверх/вниз
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

  // Обновление className элемента
  const updateClassName = (path, newClassName) => {
    const newStructure = [...structure];
    const element = getElementByPath(newStructure, path);
    element.className = newClassName;
    setStructure(newStructure);
  };

  // Добавление стиля в editableStyles
  const addEditableStyle = (styleKey, config) => {
    setEditableStyles({
      ...editableStyles,
      [styleKey]: config
    });
  };

  // Связывание CSS свойства элемента со стилем
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

  // Экспорт JSON
  const exportJSON = () => {
    const template = {
      id: Date.now(),
      category_id: categoryId,
      template_name: templateName,
      name: templateName,
      preview_url: 'https://via.placeholder.com/300x200',
      settings: {
        structure,
        editableElements: Object.keys(defaultData),
        editableStyles,
        javascript: javascript || undefined
      },
      default_data: defaultData
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}.json`;
    a.click();
  };

  // Импорт JSON
  const importJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          setStructure(json.settings.structure || []);
          setEditableStyles(json.settings.editableStyles || {});
          setDefaultData(json.default_data || {});
          setTemplateName(json.template_name || 'CustomBlock');
          setCategoryId(json.category_id || 1);
          setJavascript(json.settings.javascript || '');
        } catch (err) {
          alert('Ошибка импорта JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Рендер дерева элементов
  const renderElementTree = (elements, path = []) => {
    return elements.map((element, index) => {
      const currentPath = [...path, index];
      const pathStr = currentPath.join('-');
      const isSelected = selectedElement && JSON.stringify(selectedElement.path) === JSON.stringify(currentPath);
      const hasChildren = element.children && element.children.length > 0;
      const isCollapsed = collapsedNodes[pathStr];
      
      return (
        <div key={index} className="ml-2">
          <div 
            className={`flex items-center gap-1 p-2 rounded cursor-pointer hover:bg-blue-50 mb-1 ${
              isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'border border-gray-300'
            }`}
            onClick={() => setSelectedElement({ element, path: currentPath })}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(pathStr);
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
            {!hasChildren && <span className="w-5"></span>}
            
            <span className="text-xs font-semibold flex-1">{element.type}</span>
            {element.dataKey && <span className="text-xs text-gray-500">({element.dataKey.substring(0, 8)}...)</span>}
            
            <div className="flex gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveElement(currentPath, 'up');
                }}
                className="p-0.5 hover:bg-gray-200 rounded text-xs"
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveElement(currentPath, 'down');
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
                    addElement('div', currentPath);
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
                  copyElement(currentPath);
                }}
                className="p-0.5 hover:bg-blue-200 rounded"
                title="Copy"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteElement(currentPath);
                }}
                className="p-0.5 hover:bg-red-200 rounded"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {hasChildren && !isCollapsed && (
            <div className="ml-2 border-l-2 border-gray-300 pl-2">
              {renderElementTree(element.children, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="px-3 py-1 border rounded font-semibold text-sm"
            placeholder="Template Name"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(parseInt(e.target.value))}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value={1}>Заголовки</option>
            <option value={2}>Контент</option>
            <option value={3}>Галереи</option>
            <option value={4}>Формы</option>
            <option value={5}>Футеры</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('builder')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'builder' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <Settings size={14} className="inline mr-1" /> Builder
          </button>
          <button
            onClick={() => setViewMode('javascript')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'javascript' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <Code size={14} className="inline mr-1" /> JavaScript
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'json' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <Eye size={14} className="inline mr-1" /> JSON
          </button>

          <div className="border-l pl-2 ml-2">
            <label className="px-3 py-1 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 text-sm">
              <Upload size={14} className="inline mr-1" /> Import
              <input type="file" accept=".json" onChange={importJSON} className="hidden" />
            </label>
          </div>
          
          <button
            onClick={exportJSON}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            <Download size={14} className="inline mr-1" /> Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'builder' && (
          <>
            {/* Left Sidebar - Elements */}
            <div className="w-64 bg-white border-r overflow-y-auto">
              <div className="p-4">
                <h3 className="font-bold mb-3 text-sm">Elements</h3>
                {categories.map(category => (
                  <div key={category} className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">{category}</h4>
                    <div className="space-y-1">
                      {elementTypes
                        .filter(el => el.category === category)
                        .map((el) => (
                          <button
                            key={el.type}
                            onClick={() => addElement(el.type)}
                            className="w-full p-2 border rounded hover:bg-blue-50 text-left flex items-center gap-2 text-xs"
                          >
                            <span className="text-sm">{el.icon}</span>
                            <span>{el.label}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-4">
                <h3 className="font-bold mb-3 text-sm">Structure Tree</h3>
                <div className="text-sm">
                  {structure.length === 0 ? (
                    <p className="text-gray-500 text-xs">Add elements to start</p>
                  ) : (
                    renderElementTree(structure)
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
                            
                            // Update defaultData
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

                    {/* Media Element Fields */}
                    {(selectedElement.element.type === 'img' || 
                      selectedElement.element.type === 'video' || 
                      selectedElement.element.type === 'audio' ||
                      selectedElement.element.type === 'iframe') && (
                      <div className="space-y-3 border-t pt-3">
                        <h4 className="font-semibold text-sm text-blue-600">Media Properties</h4>
                        
                        <div>
                          <label className="block text-xs font-semibold mb-1">Source Key</label>
                          <input
                            type="text"
                            value={selectedElement.element.srcKey || ''}
                            onChange={(e) => {
                              const newStructure = [...structure];
                              const element = getElementByPath(newStructure, selectedElement.path);
                              element.srcKey = e.target.value;
                              setStructure(newStructure);
                              
                              if (e.target.value && !defaultData[e.target.value]) {
                                setDefaultData({ ...defaultData, [e.target.value]: 'https://via.placeholder.com/800x600' });
                              }
                            }}
                            className="w-full px-2 py-1 border rounded text-xs"
                            placeholder="e.g., heroImage"
                          />
                        </div>

                        {selectedElement.element.type === 'img' && (
                          <div>
                            <label className="block text-xs font-semibold mb-1">Alt Key</label>
                            <input
                              type="text"
                              value={selectedElement.element.altKey || ''}
                              onChange={(e) => {
                                const newStructure = [...structure];
                                const element = getElementByPath(newStructure, selectedElement.path);
                                element.altKey = e.target.value;
                                setStructure(newStructure);
                                
                                if (e.target.value && !defaultData[e.target.value]) {
                                  setDefaultData({ ...defaultData, [e.target.value]: 'Image description' });
                                }
                              }}
                              className="w-full px-2 py-1 border rounded text-xs"
                              placeholder="e.g., imageAlt"
                            />
                          </div>
                        )}

                        {selectedElement.element.type === 'video' && (
                          <div>
                            <label className="block text-xs font-semibold mb-1">Poster Key</label>
                            <input
                              type="text"
                              value={selectedElement.element.posterKey || ''}
                              onChange={(e) => {
                                const newStructure = [...structure];
                                const element = getElementByPath(newStructure, selectedElement.path);
                                element.posterKey = e.target.value;
                                setStructure(newStructure);
                                
                                if (e.target.value && !defaultData[e.target.value]) {
                                  setDefaultData({ ...defaultData, [e.target.value]: 'https://via.placeholder.com/800x600' });
                                }
                              }}
                              className="w-full px-2 py-1 border rounded text-xs"
                              placeholder="e.g., videoPoster"
                            />
                          </div>
                        )}

                        {selectedElement.element.type === 'iframe' && (
                          <div>
                            <label className="block text-xs font-semibold mb-1">Title Key</label>
                            <input
                              type="text"
                              value={selectedElement.element.titleKey || ''}
                              onChange={(e) => {
                                const newStructure = [...structure];
                                const element = getElementByPath(newStructure, selectedElement.path);
                                element.titleKey = e.target.value;
                                setStructure(newStructure);
                                
                                if (e.target.value && !defaultData[e.target.value]) {
                                  setDefaultData({ ...defaultData, [e.target.value]: 'Embedded content' });
                                }
                              }}
                              className="w-full px-2 py-1 border rounded text-xs"
                              placeholder="e.g., iframeTitle"
                            />
                          </div>
                        )}

                        {(selectedElement.element.type === 'video' || selectedElement.element.type === 'audio') && (
                          <div className="space-y-2 bg-gray-50 p-3 rounded">
                            <p className="text-xs font-semibold text-gray-700">Playback Options</p>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={selectedElement.element.controls !== false}
                                onChange={(e) => {
                                  const newStructure = [...structure];
                                  const element = getElementByPath(newStructure, selectedElement.path);
                                  element.controls = e.target.checked;
                                  setStructure(newStructure);
                                }}
                              />
                              Show controls
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={selectedElement.element.autoPlay || false}
                                onChange={(e) => {
                                  const newStructure = [...structure];
                                  const element = getElementByPath(newStructure, selectedElement.path);
                                  element.autoPlay = e.target.checked;
                                  setStructure(newStructure);
                                }}
                              />
                              Auto play
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={selectedElement.element.loop || false}
                                onChange={(e) => {
                                  const newStructure = [...structure];
                                  const element = getElementByPath(newStructure, selectedElement.path);
                                  element.loop = e.target.checked;
                                  setStructure(newStructure);
                                }}
                              />
                              Loop
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={selectedElement.element.muted || false}
                                onChange={(e) => {
                                  const newStructure = [...structure];
                                  const element = getElementByPath(newStructure, selectedElement.path);
                                  element.muted = e.target.checked;
                                  setStructure(newStructure);
                                }}
                              />
                              Muted
                            </label>
                          </div>
                        )}

                        {selectedElement.element.type === 'iframe' && (
                          <label className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedElement.element.allowFullScreen !== false}
                              onChange={(e) => {
                                const newStructure = [...structure];
                                const element = getElementByPath(newStructure, selectedElement.path);
                                element.allowFullScreen = e.target.checked;
                                setStructure(newStructure);
                              }}
                            />
                            Allow fullscreen
                          </label>
                        )}
                      </div>
                    )}

                    {/* Link href */}
                    {selectedElement.element.type === 'a' && (
                      <div>
                        <label className="block text-sm font-semibold mb-1">Href Key</label>
                        <input
                          type="text"
                          value={selectedElement.element.hrefKey || ''}
                          onChange={(e) => {
                            const newStructure = [...structure];
                            const element = getElementByPath(newStructure, selectedElement.path);
                            element.hrefKey = e.target.value;
                            setStructure(newStructure);
                            
                            if (e.target.value && !defaultData[e.target.value]) {
                              setDefaultData({ ...defaultData, [e.target.value]: '#' });
                            }
                          }}
                          className="w-full px-3 py-2 border rounded text-sm"
                          placeholder="e.g., buttonLink"
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
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="CSS property"
                            className="flex-1 px-2 py-1 border rounded text-xs"
                            id="css-prop"
                          />
                          <input
                            type="text"
                            placeholder="Style key"
                            className="flex-1 px-2 py-1 border rounded text-xs"
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
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 leading-none"
                          >
                            +
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
                                    setEditableStyles({
                                      ...editableStyles,
                                      [key]: { ...config, type: e.target.value }
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

        {viewMode === 'javascript' && (
          <div className="flex-1 p-6 overflow-auto bg-gray-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-5xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">JavaScript Code Editor</h2>
                <p className="text-sm text-gray-600">
                  Write JavaScript code that will be executed for each block instance. Your code will be automatically isolated.
                </p>
              </div>

              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Code size={16} />
                  Available Variables
                </h3>
                <p className="text-xs text-blue-800 mb-2">
                  Each block instance will have access to:
                </p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li><code className="bg-blue-100 px-1 rounded">blockElement</code> - DOM element reference for this block</li>
                  <li><code className="bg-blue-100 px-1 rounded">data</code> - Block's data from default_data and settings</li>
                  <li><code className="bg-blue-100 px-1 rounded">blockId</code> - Unique identifier for this block instance</li>
                </ul>
                <p className="text-xs text-blue-800 mt-2">
                  All variables are scoped locally to each block instance via IIFE (Immediately Invoked Function Expression).
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  JavaScript Code
                </label>
                <textarea
                  value={javascript}
                  onChange={(e) => setJavascript(e.target.value)}
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-gray-900 text-green-400"
                  placeholder={`// Example: Initialize a slider
const slider = blockElement.querySelector('.slider');
if (slider) {
  // Your initialization code here
  console.log('Slider initialized for block:', blockId);
  console.log('Block data:', data);
}

// Example: Add event listeners
const buttons = blockElement.querySelectorAll('button');
buttons.forEach(button => {
  button.addEventListener('click', () => {
    console.log('Button clicked in block:', blockId);
  });
});`}
                  spellCheck={false}
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview: Generated Wrapper</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Your code will be wrapped like this for isolation:
                </p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
{`(function(blockElement, data, blockId) {
  'use strict';
  try {
    ${javascript || '// Your code here'}
  } catch (error) {
    console.error('Error in block #' + blockId + ':', error);
  }
})(document.getElementById('block-' + blockId), blockData, blockId);`}
                </pre>
              </div>
            </div>
          </div>
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
                        editableStyles,
                        javascript: javascript || undefined
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
                    editableStyles,
                    javascript: javascript || undefined
                  },
                  default_data: defaultData
                }, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};