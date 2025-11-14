import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

/**
 * Компонент для динамической генерации UI настроек на основе schema
 */
export default function DynamicSettings({ schema, values, onChange }) {
  if (!schema || Object.keys(schema).length === 0) {
    return <div className="text-sm text-gray-400">Нет настроек для этого элемента</div>;
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
        <label className="block text-sm mb-2">{label}</label>
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-700 rounded px-3 py-2 text-white"
          rows="3"
        />
      </div>
    );
  }

  // String (обычный текст)
  if (type === "string") {
    return (
      <div>
        <label className="block text-sm mb-2">{label}</label>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-700 rounded px-3 py-2 text-white"
        />
      </div>
    );
  }

  // Color picker
  if (type === "color") {
    return (
      <div>
        <label className="block text-sm mb-2">{label}</label>
        <input
          type="color"
          value={localValue || "#000000"}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-full h-10 rounded"
        />
      </div>
    );
  }

  // Number (range slider)
  if (type === "range") {
    return (
      <div>
        <label className="block text-sm mb-2">
          {label}: {localValue}{units ?? ""}
        </label>
        <input
          type="range"
          min={min ?? 0}
          max={max ?? 100}
          step={step ?? 1}
          value={localValue ?? min ?? 0}
          onChange={(e) => handleColorChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    );
  }

  // Number (обычный input)
  if (type === "number") {
    return (
      <div>
        <label className="block text-sm mb-2">{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          step={step ?? 1}
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-gray-700 rounded px-3 py-2"
        />
      </div>
    );
  }

  // Select dropdown
  if (type === "select") {
    return (
      <div>
        <label className="block text-sm mb-2">{label}</label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-700 rounded px-3 py-2"
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

  const jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZXhwIjoxNzYzMDMxNDUxfQ.geILTiF95NsZiCSqotkYgQixTC1kG2n2j3IwCoJfQ5c"

  if (type === "upload") {
    const uploadFile = async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://landy.website/api/media", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${jwt_token}`,
        }
      });

      const data = await res.json();
      if (data.url) {
        const fullUrl = `https://landy.website${data.url}`;
        onChange(fullUrl);
        setIsOpen(false);
      }
    };

    const uploadUrl = async () => {
      const res = await fetch("https://landy.website/api/media/upload-by-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt_token}`,
        },
        body: JSON.stringify({ url: urlInput }),
      })

      const data = await res.json();
      if (data.url) {
        const fullUrl = `https://landy.website${data.url}`;
        onChange(fullUrl);
        setIsOpen(false);
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
        <label className="block text-sm mb-2">{label}</label>
        <button
          className="px-3 py-2 bg-purple-600 rounded text-white hover:bg-purple-700"
          onClick={() => setIsOpen(true)}
        >
          Загрузить
        </button>

        {/* Показываем текущий URL, если есть */}
        {value && (
          <div className="text-xs mt-2 text-gray-400 break-all">
            Текущее значение: {value}
          </div>
        )}

        {/* Модалка */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl w-96 relative space-y-4">
              {/* Закрыть */}
              <button
                className="absolute top-2 right-2"
                onClick={() => setIsOpen(false)}
              >
                ✖
              </button>

              <h3 className="text-lg font-semibold mb-2">Загрузка файла</h3>

              {/* DROP AREA */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border border-gray-600 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-700 transition"
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
              <div className="text-xs text-gray-400 text-center">
                Или нажми Ctrl+V, чтобы вставить из буфера обмена
              </div>

              {/* Маленький текст → ввод ссылки */}
              <div className="text-xs text-gray-400">
                Или укажи ссылку на файл:
              </div>

              <input
                type="text"
                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />

              <button
                onClick={uploadUrl}
                className="w-full bg-blue-600 px-3 py-2 rounded text-white hover:bg-blue-700"
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
      <label className="block text-sm mb-2">{label}</label>
      <div className="text-xs text-gray-400">Неподдерживаемый тип: {type}</div>
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
        <label className="block text-sm">{label}</label>
        <button
          onClick={addItem}
          className="p-1 bg-purple-600 rounded hover:bg-purple-700 transition"
          title="Добавить элемент"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={index} className="bg-gray-750 rounded p-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Элемент {index + 1}</span>
              <button
                onClick={() => removeItem(index)}
                className="p-1 hover:bg-red-600 rounded transition"
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
          <div className="text-xs text-gray-400 text-center py-2">
            Нет элементов. Нажмите + чтобы добавить.
          </div>
        )}
      </div>
    </div>
  );
}
