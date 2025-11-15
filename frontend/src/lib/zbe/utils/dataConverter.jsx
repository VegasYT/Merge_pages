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
    width: Math.round(resp.width),
    height: Math.round(resp.height || 1080),
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
    // Округляем все числовые значения до целых чисел
    // Извлекаем props и удаляем borderRadius и opacity, так как они хранятся отдельно в ZBE
    const propsFromData = defaultResp.data?.props || {};
    const { borderRadius: propsRadius, opacity: propsOpacity, ...cleanProps } = propsFromData;

    const element = {
      id: Date.now() + Math.random(), // Генерируем временный ID для ZBE
      layerId: layer.id, // Сохраняем ID из базы для последующего сохранения
      type_name: baseElement.type_name,
      name: defaultResp.data?.name || baseElement.display_name || baseElement.type_name,
      x: Math.round(defaultResp.x ?? 0),
      y: Math.round(defaultResp.y ?? 0),
      width: Math.round(defaultResp.width ?? 100),
      height: Math.round(defaultResp.height ?? 100),
      borderRadius: Math.round(propsRadius ?? 0),
      opacity: propsOpacity ?? 1,
      props: cleanProps,
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
        // Округляем все числовые значения до целых чисел
        const roundedX = Math.round(resp.x ?? element.x);
        const roundedY = Math.round(resp.y ?? element.y);
        const roundedWidth = Math.round(resp.width ?? element.width);
        const roundedHeight = Math.round(resp.height ?? element.height);
        const roundedBorderRadius = Math.round(resp.data?.props?.borderRadius ?? element.borderRadius);
        const opacity = resp.data?.props?.opacity ?? element.opacity;

        if (resp.x !== null && roundedX !== element.x) override.x = roundedX;
        if (resp.y !== null && roundedY !== element.y) override.y = roundedY;
        if (resp.width !== null && roundedWidth !== element.width) override.width = roundedWidth;
        if (resp.height !== null && roundedHeight !== element.height) override.height = roundedHeight;
        if (resp.data?.props?.borderRadius !== undefined && roundedBorderRadius !== element.borderRadius) override.borderRadius = roundedBorderRadius;
        if (resp.data?.props?.opacity !== undefined && opacity !== element.opacity) override.opacity = opacity;

        // Добавляем props если они отличаются (исключая borderRadius и opacity)
        if (resp.data?.props && Object.keys(resp.data.props).length > 0) {
          const { borderRadius: _, opacity: __, ...cleanRespProps } = resp.data.props;
          if (Object.keys(cleanRespProps).length > 0) {
            override.props = cleanRespProps;
          }
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
