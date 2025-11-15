import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getWidthFromViewportSize } from '@/lib/utils/style-utils';
import type { ZeroBlock, ZeroBaseElement, ZeroLayer, ZeroBlockResponsive, ZeroLayerResponsive } from '@/lib/services/zeroblocks';

interface ZeroblockData {
	zeroBlock: ZeroBlock;
	zeroBaseElements: ZeroBaseElement[];
	zeroBlockResponsive: ZeroBlockResponsive[];
	zeroLayers: ZeroLayer[];
	zeroLayerResponsive: ZeroLayerResponsive[];
}

interface ZeroblockRendererProps {
	zeroblockData: ZeroblockData;
	viewportSize?: 'mobile' | 'tablet' | 'desktop';
}

interface MergedLayerData {
	id: number;
	type_name: string;
	position: number;
	x: number | null;
	y: number | null;
	width: number | null;
	height: number | null;
	direction: string | null;
	props: Record<string, any>;
}

/**
 * Рендер зероблока с адаптивной версткой
 * Компонент использует viewportSize из топбара для выбора брейкпоинта
 * Также отслеживает реальную ширину контейнера для более точного выбора брейкпоинта
 */
export default function ZeroblockRenderer({ zeroblockData, viewportSize = 'desktop' }: ZeroblockRendererProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerWidth, setContainerWidth] = useState(0);

	// Отслеживание реальной ширины контейнера
	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width;
				setContainerWidth(width);
			}
		});

		resizeObserver.observe(containerRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	// Используем containerWidth если доступен, иначе viewportSize
	const effectiveWidth = containerWidth > 0 ? containerWidth : getWidthFromViewportSize(viewportSize);

	// Выбор подходящего responsive брейкпоинта
	const activeResponsive = useMemo(() => {
		if (!zeroblockData?.zeroBlockResponsive) return null;

		// Сортируем брейкпоинты по ширине (от большего к меньшему)
		const sorted = [...zeroblockData.zeroBlockResponsive].sort((a, b) => b.width - a.width);

		// Находим первый брейкпоинт, который меньше или равен эффективной ширине
		const matching = sorted.find((bp) => effectiveWidth >= bp.width);

		// Если не нашли подходящий, берем самый маленький
		return matching || sorted[sorted.length - 1];
	}, [effectiveWidth, zeroblockData?.zeroBlockResponsive]);

	// Функция для получения данных слоя с учетом responsive настроек
	const getLayerData = (layer: ZeroLayer): MergedLayerData | null => {
		if (!activeResponsive || !layer) return null;

		// Находим responsive настройки для данного слоя и активного брейкпоинта
		const layerResponsive = zeroblockData.zeroLayerResponsive?.find(
			(lr) => lr.zero_layer_id === layer.id && lr.zero_block_responsive_id === activeResponsive.id
		);

		if (!layerResponsive) return null;

		// Получаем базовый тип элемента
		const baseElement = zeroblockData.zeroBaseElements?.find((el) => el.id === layer.zero_base_element_id);

		if (!baseElement) return null;

		// ВСЕ PROPS берем напрямую из layerResponsive.data.props
		// Мерджинга НЕТ, так как props хранятся только в responsive данных
		return {
			id: layer.id,
			type_name: baseElement.type_name,
			position: layer.position,
			// Позиция и размеры из responsive настроек
			x: layerResponsive.x,
			y: layerResponsive.y,
			width: layerResponsive.width,
			height: layerResponsive.height,
			direction: layerResponsive.direction,
			// Props напрямую из responsive данных
			props: layerResponsive.data?.props || {},
		};
	};

	// Рендер отдельного элемента
	const renderElement = (mergedLayer: MergedLayerData) => {
		const { type_name, props = {}, x, y, width, height } = mergedLayer;

		// Базовые inline стили для позиционирования
		const baseStyles: React.CSSProperties = {
			position: 'absolute',
			left: `${x}px`,
			top: `${y}px`,
			width: `${width}px`,
			height: `${height}px`,
			boxSizing: 'border-box',
			borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined,
			opacity: props.opacity !== undefined ? props.opacity : 1,
		};

		// Рендер в зависимости от типа элемента
		switch (type_name) {
			case 'text':
				return (
					<div
						key={mergedLayer.id}
						style={{
							...baseStyles,
							color: props.color || '#000000',
							fontSize: `${props.fontSize || 24}px`,
							fontWeight: props.fontWeight || 'normal',
							display: 'flex',
							alignItems: 'center',
							whiteSpace: 'pre-wrap',
							overflowWrap: 'break-word',
						}}
					>
						{props.content || 'Текст'}
					</div>
				);

			case 'block':
				return (
					<div
						key={mergedLayer.id}
						style={{
							...baseStyles,
							backgroundColor: props.backgroundColor || '#ff740f',
						}}
					/>
				);

			case 'image':
				return (
					<div
						key={mergedLayer.id}
						style={{
							...baseStyles,
							overflow: 'hidden',
						}}
					>
						<img
							src={props.src || 'https://via.placeholder.com/400'}
							alt=""
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
					</div>
				);

			case 'button':
				return (
					<button
						key={mergedLayer.id}
						style={{
							...baseStyles,
							backgroundColor: props.backgroundColor || '#ff740f',
							color: props.color || '#ffffff',
							border: 'none',
							cursor: 'pointer',
							fontSize: `${props.fontSize || 16}px`,
							fontWeight: props.fontWeight || 'normal',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{props.content || 'Кнопка'}
					</button>
				);

			default:
				return (
					<div
						key={mergedLayer.id}
						style={{
							...baseStyles,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '12px',
							color: '#999',
						}}
					>
						{type_name}
					</div>
				);
		}
	};

	if (!zeroblockData || !activeResponsive) {
		return (
			<div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
				Нет данных для отображения
			</div>
		);
	}

	// Получаем данные всех слоев для активного брейкпоинта
	const layersData =
		zeroblockData.zeroLayers
			?.map((layer) => getLayerData(layer))
			.filter((layer): layer is MergedLayerData => layer !== null)
			.sort((a, b) => a.position - b.position) || [];

	return (
		<div
			ref={containerRef}
			style={{
				position: 'relative',
				width: '100%',
				height: `${activeResponsive.height}px`,
				overflow: 'hidden',
			}}
		>
			{/* Информация о текущем брейкпоинте (для отладки) */}
			<div
				style={{
					position: 'absolute',
					top: '10px',
					right: '10px',
					padding: '8px 12px',
					background: 'rgba(0, 0, 0, 0.7)',
					color: 'white',
					fontSize: '12px',
					borderRadius: '4px',
					zIndex: 1000,
				}}
			>
				{activeResponsive.props?.name || 'Unknown'} ({activeResponsive.width}x{activeResponsive.height})
				<br />
				Container: {containerWidth}px
			</div>

			{/* Рендер всех элементов */}
			{layersData.map((layer) => renderElement(layer))}
		</div>
	);
}
