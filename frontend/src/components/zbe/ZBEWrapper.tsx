import React, { useEffect, useRef, useState } from 'react';
import type {
	ZeroBlock,
	ZeroBaseElement,
	ZeroLayer,
	ZeroBlockResponsive,
	ZeroLayerResponsive,
} from '@/lib/services/zeroblocks';

// Импортируем App.jsx из ZBE
// @ts-ignore
import ZBEApp from '@/lib/zbe/App.jsx';

interface ZBEWrapperProps {
	blockId: number;
	zeroBlock: ZeroBlock | null;
	zeroBaseElements: ZeroBaseElement[];
	zeroLayers: ZeroLayer[];
	zeroBlockResponsive: ZeroBlockResponsive[];
	zeroLayerResponsive: ZeroLayerResponsive[];
	onDataChange?: () => void;
	onGetData?: (data: any) => void;
}

interface ZBEData {
	elements: any[];
	breakpoints: any[];
}

/**
 * Компонент-обертка для ZBE (ZeroBlock Editor)
 * Интегрирует редактор из папки ZBE с нашим API
 */
export const ZBEWrapper: React.FC<ZBEWrapperProps> = ({
	blockId,
	zeroBlock,
	zeroBaseElements,
	zeroLayers,
	zeroBlockResponsive,
	zeroLayerResponsive,
	onDataChange,
	onGetData,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		// Логируем данные для отладки
		console.log('ZBEWrapper initialized with data:', {
			blockId,
			zeroBlock,
			baseElements: zeroBaseElements.length,
			layers: zeroLayers.length,
			breakpoints: zeroBlockResponsive.length,
			layerResponsive: zeroLayerResponsive.length,
		});

		// Загружаем ZBE после монтирования
		setIsReady(true);
	}, []);

	if (!isReady) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-white text-lg">Загрузка редактора...</div>
			</div>
		);
	}

	return (
		<div ref={containerRef} className="w-full h-full">
			<ZBEApp
				initialData={{
					zeroBlock,
					zeroBaseElements,
					zeroLayers,
					zeroBlockResponsive,
					zeroLayerResponsive,
				}}
				onDataChange={onDataChange}
				onGetData={onGetData}
			/>
		</div>
	);
};
