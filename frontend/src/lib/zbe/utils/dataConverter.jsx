/**
 * Утилита для преобразования данных из API формата в формат ZBE и обратно
 */

/**
 * Преобразует ZeroBlockResponsive[] в формат брейкпоинтов ZBE
 * @param {Array} zeroBlockResponsive - массив ZeroBlockResponsive из API
 * @returns {Array} массив брейкпоинтов в формате ZBE
 */
export const convertResponsiveToBreakpoints = (zeroBlockResponsive) => {
  if (!zeroBlockResponsive || zeroBlockResponsive.length === 0) {
    // Возвращаем дефолтный брейкпоинт если нет данных
    return [
      {
        id: 'desktop',
        name: 'Desktop',
        width: 1920,
        height: 1080,
        backgroundColor: '#ffffff',
        isDefault: true,
      }
    ];
  }

  // Сортируем по ширине (от большего к меньшему)
  const sorted = [...zeroBlockResponsive].sort((a, b) => b.width - a.width);

  return sorted.map((resp, index) => ({
    id: `bp_${resp.id}`, // Используем числовой ID с префиксом
    name: resp.props?.name || `Breakpoint ${resp.width}px`,
    width: resp.width,
    height: resp.height || 1080,
    backgroundColor: resp.props?.backgroundColor || '#ffffff',
    isDefault: index === 0, // Первый (самый широкий) - default
    responsiveId: resp.id, // Сохраняем числовой ID для сохранения
  }));
};

/**
 * Преобразует ZeroLayers + ZeroLayerResponsive + ZeroBaseElements в формат элементов ZBE
 * @param {Array} zeroLayers - массив ZeroLayer из API
 * @param {Array} zeroLayerResponsive - массив ZeroLayerResponsive из API
 * @param {Array} zeroBaseElements - массив ZeroBaseElement из API
 * @param {Array} breakpoints - массив брейкпоинтов ZBE (уже преобразованный)
 * @returns {Array} массив элементов в формате ZBE
 */
export const convertLayersToElements = (
  zeroLayers,
  zeroLayerResponsive,
  zeroBaseElements,
  breakpoints
) => {
  if (!zeroLayers || zeroLayers.length === 0) {
    return [];
  }

  // Создаем Map для быстрого доступа к base elements
  const baseElementsMap = new Map(
    zeroBaseElements.map(be => [be.id, be])
  );

  // Создаем Map для responsive настроек по layer_id и breakpoint_id
  const responsiveMap = new Map();
  zeroLayerResponsive.forEach(resp => {
    const key = `${resp.zero_layer_id}_${resp.zero_block_responsive_id}`;
    responsiveMap.set(key, resp);
  });

  // Создаем Map для соответствия responsiveId -> breakpointId
  const responsiveToBpMap = new Map(
    breakpoints.map(bp => [bp.responsiveId, bp.id])
  );

  return zeroLayers.map(layer => {
    const baseElement = baseElementsMap.get(layer.zero_base_element_id);
    if (!baseElement) {
      console.warn(`Base element ${layer.zero_base_element_id} not found for layer ${layer.id}`);
      return null;
    }

    // Находим default breakpoint
    const defaultBreakpoint = breakpoints.find(bp => bp.isDefault) || breakpoints[0];
    const defaultResponsiveId = defaultBreakpoint?.responsiveId;

    // Получаем responsive настройки для default breakpoint
    const defaultKey = `${layer.id}_${defaultResponsiveId}`;
    const defaultResp = responsiveMap.get(defaultKey);

    if (!defaultResp) {
      console.warn(`No default responsive settings found for layer ${layer.id}`);
      return null;
    }

    // Базовые свойства элемента (из default breakpoint)
    const element = {
      id: Date.now() + Math.random(), // Генерируем временный ID для ZBE
      layerId: layer.id, // Сохраняем ID из базы для последующего сохранения
      type_name: baseElement.type_name,
      name: defaultResp.data?.name || baseElement.display_name || baseElement.type_name,
      x: defaultResp.x ?? 0,
      y: defaultResp.y ?? 0,
      width: defaultResp.width ?? 100,
      height: defaultResp.height ?? 100,
      borderRadius: 0,
      opacity: 1,
      props: defaultResp.data?.props || {},
      breakpointOverrides: {},
    };

    // Собираем overrides для других breakpoints
    breakpoints.forEach(bp => {
      if (bp.isDefault || !bp.responsiveId) return;

      const key = `${layer.id}_${bp.responsiveId}`;
      const resp = responsiveMap.get(key);

      if (resp) {
        const override = {};

        // Добавляем только те значения, которые отличаются от default
        if (resp.x !== null && resp.x !== element.x) override.x = resp.x;
        if (resp.y !== null && resp.y !== element.y) override.y = resp.y;
        if (resp.width !== null && resp.width !== element.width) override.width = resp.width;
        if (resp.height !== null && resp.height !== element.height) override.height = resp.height;

        // Добавляем props если они отличаются
        if (resp.data?.props && Object.keys(resp.data.props).length > 0) {
          override.props = resp.data.props;
        }

        // Добавляем override только если есть отличия
        if (Object.keys(override).length > 0) {
          element.breakpointOverrides[bp.id] = override;
        }
      }
    });

    return element;
  }).filter(el => el !== null);
};

/**
 * Создает брейкпоинт ID из числового ID responsive настройки
 * @param {number} responsiveId - числовой ID из базы
 * @returns {string} - строковый ID для ZBE
 */
export const createBreakpointId = (responsiveId) => {
  return `bp_${responsiveId}`;
};

/**
 * Извлекает числовой ID responsive настройки из брейкпоинт ID
 * @param {string} breakpointId - строковый ID из ZBE
 * @returns {number|null} - числовой ID для базы или null
 */
export const extractResponsiveId = (breakpointId) => {
  if (typeof breakpointId === 'number') return breakpointId;
  if (breakpointId.startsWith('bp_')) {
    return parseInt(breakpointId.substring(3), 10);
  }
  return null;
};
