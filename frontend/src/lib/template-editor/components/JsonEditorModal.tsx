import { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

interface JsonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  structure: any[];
  editableStyles: Record<string, any>;
  defaultData: Record<string, any>;
  onSave: (data: { structure: any[]; editableStyles: Record<string, any>; defaultData: Record<string, any> }) => void;
}

const JsonEditorModal = ({ isOpen, onClose, structure, editableStyles, defaultData, onSave }: JsonEditorModalProps) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const jsonData = {
        settings: {
          structure,
          editableElements: Object.keys(defaultData),
          editableStyles
        },
        default_data: defaultData
      };
      setJsonText(JSON.stringify(jsonData, null, 2));
      setError('');
    }
  }, [isOpen, structure, editableStyles, defaultData]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);

      // Support both formats: new (with settings object) and old (flat)
      let structure, editableElements, editableStyles, defaultData;

      if (parsed.settings) {
        // New format with settings object
        if (typeof parsed.settings !== 'object' || Array.isArray(parsed.settings)) {
          throw new Error('Field "settings" must be an object');
        }

        structure = parsed.settings.structure;
        editableElements = parsed.settings.editableElements;
        editableStyles = parsed.settings.editableStyles;

        // Validate default_data
        if (!parsed.default_data) {
          throw new Error('Missing "default_data" field');
        }
        if (typeof parsed.default_data !== 'object' || Array.isArray(parsed.default_data)) {
          throw new Error('Field "default_data" must be an object');
        }
        defaultData = parsed.default_data;
      } else {
        // Old flat format for backward compatibility
        structure = parsed.structure;
        editableElements = parsed.editableElements;
        editableStyles = parsed.editableStyles;
        defaultData = parsed.defaultData || parsed.default_data;
      }

      // Validate structure
      if (!structure) {
        throw new Error('Missing "structure" field in settings');
      }
      if (!Array.isArray(structure)) {
        throw new Error('Field "structure" must be an array');
      }

      // Validate editableElements (optional)
      if (editableElements !== undefined && !Array.isArray(editableElements)) {
        throw new Error('Field "editableElements" must be an array if provided');
      }

      // Validate editableStyles
      if (!editableStyles) {
        throw new Error('Missing "editableStyles" field in settings');
      }
      if (typeof editableStyles !== 'object' || Array.isArray(editableStyles)) {
        throw new Error('Field "editableStyles" must be an object');
      }

      // Validate defaultData
      if (!defaultData) {
        throw new Error('Missing data field (default_data or defaultData)');
      }
      if (typeof defaultData !== 'object' || Array.isArray(defaultData)) {
        throw new Error('Data field must be an object');
      }

      // Map to internal state
      onSave({
        structure,
        editableStyles,
        defaultData
      });
      setError('');
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">JSON Editor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto p-4">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-full min-h-[500px] font-mono text-sm p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            spellCheck={false}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-800">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Invalid JSON:</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Edit settings (structure, editableElements, editableStyles) and default_data
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Check size={16} />
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonEditorModal;
