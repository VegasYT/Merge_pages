import React from 'react';
import { Settings, Eye, Code, Upload, Download, FileJson } from 'lucide-react';

const Header = ({
  templateName,
  setTemplateName,
  categoryId,
  setCategoryId,
  viewMode,
  setViewMode,
  onImport,
  onExport,
  onOpenJsonEditor
}) => {
  return (
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
          onClick={() => setViewMode('visual')}
          className={`px-3 py-1 rounded text-sm ${viewMode === 'visual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <Eye size={14} className="inline mr-1" /> Visual
        </button>
        <button
          onClick={() => setViewMode('json')}
          className={`px-3 py-1 rounded text-sm ${viewMode === 'json' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <Code size={14} className="inline mr-1" /> JSON
        </button>

        <div className="border-l pl-2 ml-2">
          <button
            onClick={onOpenJsonEditor}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
            title="Edit JSON in modal"
          >
            <FileJson size={14} className="inline mr-1" /> Edit JSON
          </button>
        </div>

        <div className="border-l pl-2 ml-2">
          <label className="px-3 py-1 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 text-sm">
            <Upload size={14} className="inline mr-1" /> Import
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
        </div>

        <button
          onClick={onExport}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          <Download size={14} className="inline mr-1" /> Export
        </button>
      </div>
    </div>
  );
};

export default Header;
