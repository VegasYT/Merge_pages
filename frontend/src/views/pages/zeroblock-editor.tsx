import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLoaderData } from 'react-router';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ZBEWrapper } from '@/components/zbe/ZBEWrapper';
import type { Block } from '@/lib/services/blocks';
import type {
	ZeroBlock,
	ZeroBaseElement,
	ZeroLayer,
	ZeroBlockResponsive,
	ZeroLayerResponsive,
} from '@/lib/services/zeroblocks';
import {
	createZeroBlock,
	createZeroLayer,
	updateZeroLayer,
	deleteZeroLayer,
	createZeroBlockResponsive,
	updateZeroBlockResponsive,
	deleteZeroBlockResponsive,
	createZeroLayerResponsive,
	updateZeroLayerResponsive,
	deleteZeroLayerResponsive,
} from '@/lib/services/zeroblocks';

interface LoaderData {
	block: Block;
	zeroBlock: ZeroBlock | null;
	zeroBaseElements: ZeroBaseElement[];
	zeroLayers: ZeroLayer[];
	zeroBlockResponsive: ZeroBlockResponsive[];
	zeroLayerResponsive: ZeroLayerResponsive[];
	projectId: string;
	pageId: string;
}

interface UnsavedChangesModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

function UnsavedChangesModal({ isOpen, onClose, onConfirm }: UnsavedChangesModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
				<h2 className="text-xl font-semibold mb-4">Несохраненные изменения</h2>
				<p className="text-gray-600 mb-6">У вас есть несохраненные изменения. Вы уверены, что хотите выйти без сохранения?</p>
				<div className="flex gap-3 justify-end">
					<button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
						Отмена
					</button>
					<button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
						Выйти без сохранения
					</button>
				</div>
			</div>
		</div>
	);
}

// Функция для создания hash состояния данных
const createDataHash = (data: any): string => {
	try {
		return JSON.stringify(data);
	} catch (error) {
		console.error('Error creating data hash:', error);
		return '';
	}
};

export const ZeroBlockEditorPage = () => {
	const {
		block,
		zeroBlock: initialZeroBlock,
		zeroBaseElements,
		zeroLayers: initialZeroLayers,
		zeroBlockResponsive: initialZeroBlockResponsive,
		zeroLayerResponsive: initialZeroLayerResponsive,
		projectId,
		pageId,
	} = useLoaderData() as LoaderData;
	const navigate = useNavigate();
	const [showUnsavedModal, setShowUnsavedModal] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [zbeLoaded, setZbeLoaded] = useState(false);
	const [zeroBlock, setZeroBlock] = useState<ZeroBlock | null>(initialZeroBlock);
	const [isCreatingZeroBlock, setIsCreatingZeroBlock] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Храним hash сохраненного состояния для отслеживания изменений
	const savedDataHashRef = useRef<string>('');

	// Храним актуальное состояние сохраненных данных для правильной синхронизации
	const [savedZeroLayers, setSavedZeroLayers] = useState<ZeroLayer[]>(initialZeroLayers);
	const [savedZeroBlockResponsive, setSavedZeroBlockResponsive] = useState<ZeroBlockResponsive[]>(initialZeroBlockResponsive);
	const [savedZeroLayerResponsive, setSavedZeroLayerResponsive] = useState<ZeroLayerResponsive[]>(initialZeroLayerResponsive);

	// Логируем загруженные данные
	useEffect(() => {
		console.log('ZeroBlock Editor Data:', {
			block,
			zeroBlock: initialZeroBlock,
			baseElements: zeroBaseElements.length,
			layers: initialZeroLayers.length,
			breakpoints: initialZeroBlockResponsive.length,
			layerResponsive: initialZeroLayerResponsive.length,
		});
	}, []);

	// Проверка наличия несохраненных изменений
	const hasUnsavedChanges = (): boolean => {
		if (!zbeDataRef.current) return false;
		const currentHash = createDataHash(zbeDataRef.current);
		return currentHash !== savedDataHashRef.current && savedDataHashRef.current !== '';
	};

	// Переход назад
	const handleGoBack = () => {
		if (hasUnsavedChanges()) {
			setShowUnsavedModal(true);
		} else {
			navigate(`/projects/${projectId}/pages/${pageId}/editor`);
		}
	};

	const handleConfirmExit = () => {
		setShowUnsavedModal(false);
		navigate(`/projects/${projectId}/pages/${pageId}/editor`);
	};

	// Ref для хранения данных из ZBE
	const zbeDataRef = useRef<any>(null);

	// Функция которую передаем в ZBEWrapper для получения данных
	const handleZBEDataUpdate = (data: any) => {
		console.log('Received ZBE data:', data);
		zbeDataRef.current = data;

		// При первой загрузке данных сохраняем hash
		if (savedDataHashRef.current === '') {
			savedDataHashRef.current = createDataHash(data);
			console.log('Initial data hash saved');
		}
	};

	// Сохранение данных
	const handleSave = async () => {
		if (!zeroBlock || !zbeDataRef.current) {
			toast.error('Нет данных для сохранения');
			return;
		}

		setIsSaving(true);
		try {
			const { elements, breakpoints } = zbeDataRef.current;

			console.log('💾 Saving zeroblock data:', {
				zeroBlockId: zeroBlock.id,
				elements: elements.length,
				breakpoints: breakpoints.length,
			});

			// ===== ШАГ 1: Синхронизация Breakpoints (ZeroBlockResponsive) =====
			console.log('📐 Syncing breakpoints...');

			// Создаем Map для сопоставления строковых ID (из ZBE) с числовыми ID (из базы)
			// и Map существующих breakpoints по ширине
			const breakpointIdMap = new Map<string, number>(); // stringId -> numericId
			const existingBreakpointsByWidth = new Map(savedZeroBlockResponsive.map((bp) => [bp.width, bp]));
			const currentBreakpointIds = new Set<number>();
			const updatedBreakpoints: ZeroBlockResponsive[] = [];

			// Обрабатываем каждый breakpoint из ZBE
			for (const bp of breakpoints) {
				const stringId = bp.id; // это может быть 'desktop', 'tablet', 'mobile'

				// Ищем существующий breakpoint по ширине
				const existing = existingBreakpointsByWidth.get(bp.width);

				if (existing) {
					// Обновляем существующий
					// Округляем width и height до целых чисел
					const updated = await updateZeroBlockResponsive(existing.id, {
						width: Math.round(bp.width),
						height: Math.round(bp.height),
						props: { name: bp.name, ...bp.props },
					});
					breakpointIdMap.set(stringId, existing.id);
					currentBreakpointIds.add(existing.id);
					updatedBreakpoints.push(updated);
					console.log(`  ✏️ Updated breakpoint ${existing.id} (${bp.name}, ${bp.width}px)`);
				} else {
					// Создаем новый
					// Округляем width и height до целых чисел
					const created = await createZeroBlockResponsive(zeroBlock.id, {
						zero_block_id: zeroBlock.id,
						width: Math.round(bp.width),
						height: Math.round(bp.height),
						props: { name: bp.name, ...bp.props },
					});
					breakpointIdMap.set(stringId, created.id);
					currentBreakpointIds.add(created.id);
					updatedBreakpoints.push(created);
					console.log(`  ➕ Created breakpoint ${created.id} (${bp.name}, ${bp.width}px)`);
				}
			}

			// Удаляем breakpoints которых больше нет в ZBE
			for (const existingBp of savedZeroBlockResponsive) {
				if (!currentBreakpointIds.has(existingBp.id)) {
					await deleteZeroBlockResponsive(existingBp.id);
					console.log(`  🗑️ Deleted breakpoint ${existingBp.id}`);
				}
			}

			// ===== ШАГ 2: Синхронизация Elements (ZeroLayers) =====
			console.log('🎨 Syncing layers...');

			// Создаем Map существующих layers
			const existingLayersMap = new Map(savedZeroLayers.map((layer) => [layer.id, layer]));
			const currentLayerIds = new Set<number>();
			const updatedLayers: ZeroLayer[] = [];

			// Обрабатываем каждый element из ZBE
			for (const element of elements) {
				// Находим zero_base_element_id по type_name
				const baseElement = zeroBaseElements.find((be) => be.type_name === element.type_name);
				if (!baseElement) {
					console.warn(`  ⚠️ Base element not found for type: ${element.type_name}`);
					continue;
				}

				// position = zIndex элемента (берём напрямую из zIndex)
				const position = element.zIndex ?? 0;

				// Если element имеет layerId и существует в базе - обновляем
				if (element.layerId && existingLayersMap.has(element.layerId)) {
					const updated = await updateZeroLayer(element.layerId, {
						zero_base_element_id: baseElement.id,
						position,
					});
					currentLayerIds.add(element.layerId);
					updatedLayers.push(updated);
					console.log(`  ✏️ Updated layer ${element.layerId} (${element.name}), position: ${position}`);
				}
				// Если нет layerId - создаем новый
				else if (!element.layerId) {
					const createdLayer = await createZeroLayer(zeroBlock.id, {
						zero_base_element_id: baseElement.id,
						position,
					});
					element.layerId = createdLayer.id;
					currentLayerIds.add(createdLayer.id);
					updatedLayers.push(createdLayer);
					console.log(`  ➕ Created layer ${createdLayer.id} (${element.name}), position: ${position}`);
				}
			}

			// Удаляем layers которых больше нет
			for (const existingLayer of savedZeroLayers) {
				if (!currentLayerIds.has(existingLayer.id)) {
					await deleteZeroLayer(existingLayer.id);
					console.log(`  🗑️ Deleted layer ${existingLayer.id}`);
				}
			}

			// ===== ШАГ 3: Синхронизация Layer Responsive настроек =====
			console.log('📱 Syncing layer responsive settings...');

			// Создаем Map существующих responsive настроек
			const existingLayerResponsiveMap = new Map(
				savedZeroLayerResponsive.map((lr) => [`${lr.zero_layer_id}_${lr.zero_block_responsive_id}`, lr])
			);
			const currentLayerResponsiveIds = new Set<number>();
			const updatedLayerResponsive: ZeroLayerResponsive[] = [];

			// Обрабатываем каждый element для каждого breakpoint
			for (const element of elements) {
				if (!element.layerId) continue;

				for (const bp of breakpoints) {
					const stringBpId = bp.id; // строковый ID ('desktop', 'tablet', etc)
					if (!stringBpId) continue;

					// Получаем числовой ID из Map
					const numericBpId = breakpointIdMap.get(stringBpId);
					if (!numericBpId) {
						console.warn(`  ⚠️ Breakpoint ID not found for ${stringBpId}`);
						continue;
					}

					const key = `${element.layerId}_${numericBpId}`;

					// Получаем данные для этого брейкпоинта (с учетом overrides)
					// Округляем все значения до целых чисел
					const bpData = element.breakpointOverrides?.[stringBpId] || {};
					const x = Math.round(bpData.x ?? element.x ?? 0);
					const y = Math.round(bpData.y ?? element.y ?? 0);
					const width = Math.round(bpData.width ?? element.width ?? 100);
					const height = Math.round(bpData.height ?? element.height ?? 100);
					const borderRadius = Math.round(bpData.borderRadius ?? element.borderRadius ?? 0);
					const opacity = bpData.opacity ?? element.opacity ?? 1;

					// Собираем ВСЕ данные элемента (props + позиция + размеры)
					// В data идет всё что нужно для рендеринга элемента
					const elementData = {
						props: {
							...element.props,
							...(bpData.props || {}),
							borderRadius,
							opacity,
						},
						// Также сохраняем дополнительные данные элемента
						name: element.name,
						type_name: element.type_name,
					};

					const responsiveData = {
						x,
						y,
						width,
						height,
						direction: null, // пока не используется
						data: elementData,
					};

					// Проверяем существует ли уже эта responsive настройка
					const existing = existingLayerResponsiveMap.get(key);

					if (existing) {
						// Обновляем существующую (PATCH)
						const updated = await updateZeroLayerResponsive(existing.id, responsiveData);
						currentLayerResponsiveIds.add(existing.id);
						updatedLayerResponsive.push(updated);
						console.log(`  ✏️ PATCH layer responsive ${existing.id} (layer ${element.layerId}, bp ${numericBpId})`);
					} else {
						// Создаем новую (POST)
						const created = await createZeroLayerResponsive(element.layerId, {
							zero_block_responsive_id: numericBpId,
							zero_block_id: zeroBlock.id,
							...responsiveData,
						});
						currentLayerResponsiveIds.add(created.id);
						updatedLayerResponsive.push(created);
						console.log(`  ➕ POST layer responsive ${created.id} (layer ${element.layerId}, bp ${numericBpId}, zb ${zeroBlock.id})`);
					}
				}
			}

			// Удаляем responsive настройки которых больше нет
			for (const existing of savedZeroLayerResponsive) {
				if (!currentLayerResponsiveIds.has(existing.id)) {
					await deleteZeroLayerResponsive(existing.id);
					console.log(`  🗑️ Deleted layer responsive ${existing.id}`);
				}
			}

			console.log('✅ All data saved successfully!');
			toast.success('Изменения сохранены!');

			// Обновляем сохраненное состояние для следующего сохранения
			setSavedZeroBlockResponsive(updatedBreakpoints);
			setSavedZeroLayers(updatedLayers);
			setSavedZeroLayerResponsive(updatedLayerResponsive);

			// Обновляем hash сохраненных данных
			if (zbeDataRef.current) {
				savedDataHashRef.current = createDataHash(zbeDataRef.current);
				console.log('Saved data hash updated after save');
			}
		} catch (error: any) {
			console.error('❌ Error saving zeroblock:', error);
			toast.error(error.response?.data?.message || 'Не удалось сохранить изменения');
		} finally {
			setIsSaving(false);
		}
	};

	// Обработчик изменения данных в ZBE
	// Больше не нужен, так как мы проверяем изменения по hash

	// Создание ZeroBlock если его еще нет
	useEffect(() => {
		const initZeroBlock = async () => {
			if (!zeroBlock && !isCreatingZeroBlock) {
				setIsCreatingZeroBlock(true);
				try {
					console.log('Creating ZeroBlock for block:', block.id);
					const newZeroBlock = await createZeroBlock(block.id);
					setZeroBlock(newZeroBlock);
					console.log('ZeroBlock created:', newZeroBlock);
					toast.success('ZeroBlock создан!');
				} catch (error: any) {
					console.error('Error creating zeroblock:', error);
					toast.error(error.response?.data?.message || 'Не удалось создать ZeroBlock');
				} finally {
					setIsCreatingZeroBlock(false);
				}
			}
		};

		initZeroBlock();
	}, [block.id, zeroBlock, isCreatingZeroBlock]);

	// Загрузка ZBE компонента
	useEffect(() => {
		setZbeLoaded(true);
	}, []);

	// Предотвращение закрытия страницы с несохраненными изменениями
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges()) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, []);

	return (
		<div className="h-screen flex flex-col bg-gray-900">
			{/* Верхняя панель с кнопками */}
			<div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<button
						onClick={handleGoBack}
						className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
					>
						<ArrowLeft size={20} />
						Назад
					</button>
					<div className="text-white">
						<h1 className="text-lg font-semibold">Редактор Zero Block</h1>
						<p className="text-sm text-gray-400">Block ID: {block.id}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					{hasUnsavedChanges() && <span className="text-sm text-yellow-400">Есть несохраненные изменения</span>}
					<button
						onClick={handleSave}
						disabled={isSaving}
						className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSaving ? (
							<>
								<Loader2 size={20} className="animate-spin" />
								Сохранение...
							</>
						) : (
							<>
								<Save size={20} />
								Сохранить
							</>
						)}
					</button>
				</div>
			</div>

			{/* Контейнер для ZBE */}
			<div ref={containerRef} className="flex-1 overflow-hidden">
				{isCreatingZeroBlock ? (
					<div className="flex items-center justify-center h-full text-white">
						<div className="text-center">
							<Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
							<p className="text-lg">Создание ZeroBlock...</p>
						</div>
					</div>
				) : zbeLoaded && zeroBlock ? (
					<ZBEWrapper
						blockId={block.id}
						zeroBlock={zeroBlock}
						zeroBaseElements={zeroBaseElements}
						zeroLayers={initialZeroLayers}
						zeroBlockResponsive={initialZeroBlockResponsive}
						zeroLayerResponsive={initialZeroLayerResponsive}
						onGetData={handleZBEDataUpdate}
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<Loader2 size={48} className="text-blue-500 animate-spin" />
					</div>
				)}
			</div>

			{/* Модальное окно подтверждения выхода */}
			<UnsavedChangesModal isOpen={showUnsavedModal} onClose={() => setShowUnsavedModal(false)} onConfirm={handleConfirmExit} />
		</div>
	);
};
