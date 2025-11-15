// Фильтрация классов по viewport
export const filterClassesByViewport = (className: string, viewportSize: 'mobile' | 'tablet' | 'desktop'): string => {
	if (!className) return '';

	const classes = className.split(' ');
	const filtered = classes.filter((cls) => {
		if (viewportSize === 'mobile') {
			// На мобильном показываем только базовые классы (без префиксов)
			return !cls.startsWith('sm:') && !cls.startsWith('md:') && !cls.startsWith('lg:') && !cls.startsWith('xl:');
		} else if (viewportSize === 'tablet') {
			// На планшете показываем base + sm + md
			if (cls.startsWith('lg:') || cls.startsWith('xl:')) return false;
			return true;
		} else {
			// На десктопе показываем все
			return true;
		}
	});

	// Убираем префиксы для активного viewport
	return filtered
		.map((cls) => {
			if (viewportSize === 'tablet') {
				if (cls.startsWith('md:')) return cls.substring(3);
				if (cls.startsWith('sm:')) return cls.substring(3);
			} else if (viewportSize === 'mobile') {
				// Все без префиксов
				return cls;
			}
			return cls;
		})
		.join(' ');
};

// Получение класса viewport для контейнера
export const getViewportClass = (viewportSize: 'mobile' | 'tablet' | 'desktop'): string => {
	if (viewportSize === 'mobile') return 'w-[360px]';
	if (viewportSize === 'tablet') return 'w-[768px]';
	return 'w-full';
};

// Маппинг viewportSize на ширину экрана
export const getWidthFromViewportSize = (size: 'mobile' | 'tablet' | 'desktop'): number => {
	switch (size) {
		case 'mobile':
			return 375;
		case 'tablet':
			return 768;
		case 'desktop':
		default:
			return 1920;
	}
};
