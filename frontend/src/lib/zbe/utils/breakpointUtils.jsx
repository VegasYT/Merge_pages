/**
 * Утилиты для работы с брейкпоинтами
 */

/**
 * Глубокий мердж объектов (для props)
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Мерджит базовый элемент с переопределениями для конкретного брейкпоинта
 * @param {Object} element - Базовый элемент
 * @param {string} breakpointId - ID брейкпоинта
 * @returns {Object} - Элемент с примененными переопределениями
 */
export function mergeElementWithBreakpoint(element, breakpointId) {
  if (!element) return null;

  // Если нет переопределений, возвращаем элемент как есть
  const overrides = element.breakpointOverrides?.[breakpointId];
  if (!overrides) {
    return element;
  }

  // Мерджим переопределения
  const merged = { ...element };

  // Простые поля (x, y, width, height, borderRadius, opacity и т.д.)
  for (const key in overrides) {
    if (key === 'props') {
      // Для props делаем глубокий мердж
      merged.props = deepMerge(element.props || {}, overrides.props || {});
    } else if (key !== 'breakpointOverrides') {
      merged[key] = overrides[key];
    }
  }

  return merged;
}

/**
 * Обновляет элемент с учетом активного брейкпоинта
 * @param {Object} element - Элемент
 * @param {Object} updates - Обновления
 * @param {string} activeBreakpointId - ID активного брейкпоинта
 * @param {string} defaultBreakpointId - ID дефолтного брейкпоинта
 * @returns {Object} - Обновленный элемент
 */
export function updateElementForBreakpoint(element, updates, activeBreakpointId, defaultBreakpointId) {
  if (activeBreakpointId === defaultBreakpointId) {
    // Обновляем базовые поля
    return { ...element, ...updates };
  } else {
    // Обновляем переопределения для текущего брейкпоинта
    const currentOverrides = element.breakpointOverrides?.[activeBreakpointId] || {};

    // Мерджим обновления
    const newOverrides = { ...currentOverrides };

    for (const key in updates) {
      if (key === 'props') {
        // Для props делаем глубокий мердж
        newOverrides.props = deepMerge(currentOverrides.props || {}, updates.props || {});
      } else {
        newOverrides[key] = updates[key];
      }
    }

    return {
      ...element,
      breakpointOverrides: {
        ...element.breakpointOverrides,
        [activeBreakpointId]: newOverrides,
      },
    };
  }
}

/**
 * Обновляет конкретный prop элемента с учетом активного брейкпоинта
 * @param {Object} element - Элемент
 * @param {string} propName - Название свойства
 * @param {any} propValue - Значение свойства
 * @param {string} activeBreakpointId - ID активного брейкпоинта
 * @param {string} defaultBreakpointId - ID дефолтного брейкпоинта
 * @returns {Object} - Обновленный элемент
 */
export function updateElementPropForBreakpoint(element, propName, propValue, activeBreakpointId, defaultBreakpointId) {
  if (activeBreakpointId === defaultBreakpointId) {
    // Обновляем базовый prop
    return {
      ...element,
      props: {
        ...element.props,
        [propName]: propValue,
      },
    };
  } else {
    // Обновляем prop в переопределениях
    const currentOverrides = element.breakpointOverrides?.[activeBreakpointId] || {};

    return {
      ...element,
      breakpointOverrides: {
        ...element.breakpointOverrides,
        [activeBreakpointId]: {
          ...currentOverrides,
          props: {
            ...currentOverrides.props,
            [propName]: propValue,
          },
        },
      },
    };
  }
}
