import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { uploadMedia, uploadMediaByUrl } from '@/lib/services/media';
import { REST_API_URL } from '@/lib/constants/env';

/**
 * Компонент для динамической генерации UI настроек на основе schema
 */
export default function DynamicSettings({ schema, values, onChange }) {
  if (!schema || Object.keys(schema).length === 0) {
    return <div className="text-sm text-gray-600">Нет настроек для этого элемента</div>;
  }

  return (
    <div className="space-y-4">
      {Object.keys(schema).map((propName) => {
        const propConfig = schema[propName];
        const value = values[propName] ?? propConfig.default;

        return (
          <PropField
            key={propName}
            propName={propName}
            propConfig={propConfig}
            value={value}
            onChange={(newValue) => onChange(propName, newValue)}
          />
        );
      })}
    </div>
  );
}

/**
 * Компонент для отдельного поля настройки
 */
function PropField({ propName, propConfig, value, onChange }) {
  const { label, type, min, max, step, options, placeholder, itemProps, units } = propConfig;

  const [localValue, setLocalValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const rafRef = useRef(null);
  const pendingValueRef = useRef(null);
  const fileInputRef = useRef(null);

  // Обновляем локальное значение когда приходит новое из props
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Throttled onChange с requestAnimationFrame (60fps без лагов)
  const handleColorChange = useCallback((newValue) => {
    setLocalValue(newValue); // Мгновенно обновляем локально
    pendingValueRef.current = newValue;

    // Если уже есть запланированное обновление, пропускаем
    if (rafRef.current !== null) {
      return;
    }

    // Планируем обновление на следующий кадр
    rafRef.current = requestAnimationFrame(() => {
      onChange(pendingValueRef.current);
      rafRef.current = null;
    });
  }, [onChange]);

  // Очищаем RAF при размонтировании
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Textarea
  if (type === "textarea") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="3"
        />
      </div>
    );
  }

  // String (обычный текст)
  if (type === "string") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    );
  }

  // Color picker
  if (type === "color") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
          type="color"
          value={localValue || "#000000"}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300"
        />
      </div>
    );
  }

  // Number (range slider)
  if (type === "range") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}: {localValue}{units ?? ""}
        </label>
        <input
          type="range"
          min={min ?? 0}
          max={max ?? 100}
          step={step ?? 1}
          value={localValue ?? min ?? 0}
          onChange={(e) => handleColorChange(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>
    );
  }

  // Number (обычный input)
  if (type === "number") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          step={step ?? 1}
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    );
  }

  // Select dropdown
  if (type === "select") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {options?.map((option) => {
            const optionValue = typeof option === "string" ? option : option.value;
            const optionLabel = typeof option === "string" ? option : option.label;
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  if (type === "upload") {
    const uploadFile = async (file) => {
      try {
        const data = await uploadMedia(file);
        if (data.url) {
          // Формируем полный URL
          const fullUrl = data.url.startsWith('http') ? data.url : `${REST_API_URL.replace('/api', '')}${data.url}`;
          onChange(fullUrl);
          setIsOpen(false);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    };

    const uploadUrl = async () => {
      try {
        const data = await uploadMediaByUrl({ url: urlInput });
        if (data.url) {
          // Формируем полный URL
          const fullUrl = data.url.startsWith('http') ? data.url : `${REST_API_URL.replace('/api', '')}${data.url}`;
          onChange(fullUrl);
          setIsOpen(false);
          setUrlInput('');
        }
      } catch (error) {
        console.error('Upload by URL failed:', error);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    };

    // Добавляем обработчик paste на document когда модалка открыта
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (e) => {
        // Перехватываем Ctrl+V до того, как его поймает useKeyboard
        if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          // Читаем из буфера обмена через navigator.clipboard API
          navigator.clipboard.read().then(items => {
            for (const item of items) {
              const imageType = item.types.find(type => type.startsWith('image/'));
              if (imageType) {
                item.getType(imageType).then(blob => {
                  // Создаем File из Blob
                  const file = new File([blob], 'pasted-image.png', { type: imageType });
                  uploadFile(file);
                });
                break;
              }
            }
          }).catch(err => {
            console.error('Не удалось прочитать буфер обмена:', err);
          });
        }
      };

      const handlePaste = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              uploadFile(file);
            }
            break;
          }
        }
      };

      // Добавляем оба обработчика с capture: true для приоритета
      document.addEventListener('keydown', handleKeyDown, true);
      document.addEventListener('paste', handlePaste, true);

      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('paste', handlePaste, true);
      };
    }, [isOpen]);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <button
          className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          Загрузить
        </button>

        {/* Показываем текущий URL, если есть */}
        {value && (
          <div className="text-xs mt-2 text-gray-500 break-all">
            Текущее значение: {value}
          </div>
        )}

        {/* Модалка */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-md relative space-y-4">
              {/* Закрыть */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                ✖
              </button>

              <h2 className="text-2xl font-bold text-gray-900">Загрузка файла</h2>

              {/* DROP AREA */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-gray-300 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-700"
                onClick={() => fileInputRef.current.click()}
              >
                Перетащи файл сюда<br />или нажми чтобы выбрать
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => uploadFile(e.target.files[0])}
                />
              </div>

              {/* Подсказка о вставке из буфера */}
              <div className="text-xs text-gray-500 text-center">
                Или нажми Ctrl+V, чтобы вставить из буфера обмена
              </div>

              {/* Маленький текст → ввод ссылки */}
              <div className="text-sm font-medium text-gray-700">
                Или укажи ссылку на файл:
              </div>

              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />

              <button
                onClick={uploadUrl}
                className="w-full px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 font-medium"
              >
                Отправить ссылку
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Array (список элементов с возможностью добавления/удаления)
  if (type === "array") {
    return <ArrayField label={label} value={value} onChange={onChange} itemProps={itemProps} />;
  }

  // Fallback для неизвестных типов
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="text-xs text-gray-500">Неподдерживаемый тип: {type}</div>
    </div>
  );
}

/**
 * Компонент для работы с массивами (children)
 */
function ArrayField({ label, value = [], onChange, itemProps = {} }) {
  const addItem = () => {
    const newItem = {};
    // Инициализируем новый элемент дефолтными значениями
    Object.keys(itemProps).forEach((key) => {
      newItem[key] = itemProps[key].default;
    });
    onChange([...value, newItem]);
  };

  const removeItem = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateItem = (index, propName, propValue) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [propName]: propValue };
    onChange(newValue);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          onClick={addItem}
          className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Добавить элемент"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Элемент {index + 1}</span>
              <button
                onClick={() => removeItem(index)}
                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                title="Удалить элемент"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {Object.keys(itemProps).map((propName) => {
              const propConfig = itemProps[propName];
              const propValue = item[propName] ?? propConfig.default;

              return (
                <PropField
                  key={propName}
                  propName={propName}
                  propConfig={propConfig}
                  value={propValue}
                  onChange={(newValue) => updateItem(index, propName, newValue)}
                />
              );
            })}
          </div>
        ))}

        {value.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            Нет элементов. Нажмите + чтобы добавить.
          </div>
        )}
      </div>
    </div>
  );
}
