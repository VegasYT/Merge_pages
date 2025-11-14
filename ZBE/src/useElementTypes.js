import { useState, useEffect } from "react";
import { BASE_ELEMENT_TYPES } from "../src/elementTypes"; // Закомментировано, так как пока не используется

/**
 * Хук для загрузки типов элементов из API или использования базовых типов
 * В будущем здесь можно добавить fetch к вашему бэкенду
 */
export function useElementTypes() {
  const [elementTypes, setElementTypes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadElementTypes();
  }, []);

  const loadElementTypes = async () => {
    try {
      setIsLoading(true);

      // TODO: Раскомментировать когда будет готов API
      const response = await fetch('https://landy.website/api/zero-base-elements');
      const data = await response.json();
      const typesMap = {};
      data.forEach(type => {
        typesMap[type.type_name] = type;
      });
      setElementTypes(typesMap);

      // Пока используем базовые типы
      // setElementTypes(BASE_ELEMENT_TYPES);

      setIsLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки типов элементов:', err);
      setError(err);
      // Fallback на базовые типы при ошибке
      // setElementTypes(BASE_ELEMENT_TYPES);
      // setIsLoading(false);
    }
  };

  /**
   * Добавить или обновить тип элемента
   */
  const addOrUpdateType = (typeName, typeConfig) => {
    setElementTypes(prev => ({
      ...prev,
      [typeName]: typeConfig
    }));
  };

  /**
   * Получить конфигурацию типа по имени
   */
  const getTypeConfig = (typeName) => {
    return elementTypes[typeName] || null;
  };

  /**
   * Получить схему props для типа
   */
  const getTypeSchema = (typeName) => {
    const config = elementTypes[typeName];
    return config?.schema?.props || {};
  };

  /**
   * Получить значения по умолчанию для всех props типа
   */
  const getDefaultProps = (typeName) => {
    const schema = getTypeSchema(typeName);
    const defaults = {};

    Object.keys(schema).forEach(propName => {
      const propConfig = schema[propName];
      if (propConfig.default !== undefined) {
        defaults[propName] = propConfig.default;
      }
    });

    // Добавляем дефолтные props из конфига типа
    const config = elementTypes[typeName];
    if (config?.defaultProps) {
      Object.assign(defaults, config.defaultProps);
    }

    return defaults;
  };

  /**
   * Получить размеры по умолчанию для типа
   */
  const getDefaultSize = (typeName) => {
    const config = elementTypes[typeName];
    return config?.defaultSize || { width: 150, height: 150 };
  };

  /**
   * Получить список всех доступных типов
   */
  const getAvailableTypes = () => {
    return Object.keys(elementTypes).map(typeName => ({
      type_name: typeName,
      display_name: elementTypes[typeName].display_name || typeName,
      icon: elementTypes[typeName].icon || "Square"
    }));
  };

  return {
    elementTypes,
    isLoading,
    error,
    addOrUpdateType,
    getTypeConfig,
    getTypeSchema,
    getDefaultProps,
    getDefaultSize,
    getAvailableTypes
  };
}
