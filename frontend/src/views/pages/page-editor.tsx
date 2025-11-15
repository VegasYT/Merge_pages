import { useState, useEffect } from 'react';
import { useLoaderData, useParams } from 'react-router';
import PageEditorLayout from '@/components/page-editor/PageEditorLayout';
import Header from '@/components/page-editor/Header';
import BlockPreview from '@/components/page-editor/BlockPreview';
import BlockSettingsModal from '@/components/page-editor/modals/BlockSettingsModal';
import AddBlockModal from '@/components/page-editor/modals/AddBlockModal';
import { getViewportClass } from '@/lib/utils/style-utils';
import { createBlock, updateBlock, deleteBlock as deleteBlockApi, updateBlockPosition } from '@/lib/services/blocks';
import { publishPages } from '@/lib/services/projects';
import type { Block } from '@/lib/services/blocks';
import type { BlockTemplate, BlockTemplateCategory } from '@/lib/services/block-templates';
import { toast } from 'sonner';

interface Project {
	id: number;
	user_id: number;
	subdomain: string;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
}

interface Page {
	id: number;
	project_id: number;
	name: string;
	title: string;
	slug: string;
	icon?: string;
	status: 'published' | 'draft';
	created_at: string;
	updated_at: string;
}

interface LoaderData {
	project: Project;
	page: Page;
	pages: Page[];
	blocks: Block[];
	blockTemplates: BlockTemplate[];
	categories: BlockTemplateCategory[];
	zeroblockDataMap: Map<number, any>;
}

const PageEditorPage = () => {
	const { project, page, pages, blocks: initialBlocks, blockTemplates, categories, zeroblockDataMap } = useLoaderData() as LoaderData;
	const { projectId } = useParams();
	const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
	const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
	const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
	const [insertAfterPosition, setInsertAfterPosition] = useState<number | null>(null);
	const [hoveredBlockId, setHoveredBlockId] = useState<number | null>(null);
	const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

	// Загружаем CDN Tailwind для динамических классов из API
	useEffect(() => {
		// Проверяем, не загружен ли уже скрипт
		if (document.getElementById('tailwind-cdn')) {
			return;
		}

		// Создаём конфигурацию ПЕРЕД загрузкой скрипта
		(window as any).tailwind = {
			config: {
				important: true, // Все CDN стили получают !important
				corePlugins: {
					preflight: false, // Отключаем preflight чтобы не конфликтовать с базовыми стилями
				}
			}
		};

		// Загружаем CDN скрипт
		const script = document.createElement('script');
		script.id = 'tailwind-cdn';
		script.src = 'https://cdn.tailwindcss.com';
		script.onload = () => {
			// После загрузки CDN, делаем небольшое изменение в DOM
			// чтобы триггернуть MutationObserver и заставить CDN пересканировать страницу
			setTimeout(() => {
				const root = document.getElementById('root');
				if (root) {
					// Добавляем и сразу удаляем invisible элемент для триггера
					const trigger = document.createElement('div');
					trigger.className = 'bg-gradient-to-r from-blue-600 to-indigo-600'; // Триггерный класс
					trigger.style.display = 'none';
					root.appendChild(trigger);
					setTimeout(() => trigger.remove(), 10);
				}
			}, 100);
		};
		document.head.appendChild(script);

		// Cleanup при размонтировании
		return () => {
			const existingScript = document.getElementById('tailwind-cdn');
			if (existingScript) {
				existingScript.remove();
			}
			delete (window as any).tailwind;
		};
	}, []);

	const getBlockTemplate = (blockTemplateId: number | null): BlockTemplate | undefined => {
		if (!blockTemplateId) return undefined;
		return blockTemplates.find((t) => t.id === blockTemplateId);
	};

	const openBlockSettings = (block: Block) => {
		setSelectedBlock(block);
		setIsSettingsModalOpen(true);
	};

	const saveBlockSettings = async (updatedSettings: Record<string, any>) => {
		if (!selectedBlock) return;

		try {
			const updatedBlock = await updateBlock(selectedBlock.id, { settings: updatedSettings });
			setBlocks(blocks.map((b) => (b.id === selectedBlock.id ? updatedBlock : b)));
			setIsSettingsModalOpen(false);
			toast.success('Настройки блока сохранены!');
		} catch (error: any) {
			console.error('Error saving block settings:', error);
			toast.error(error.response?.data?.message || 'Не удалось сохранить настройки блока');
		}
	};

	const addBlock = async (blockTemplate: BlockTemplate | null) => {
		try {
			// Определяем позицию нового блока
			const newPosition = insertAfterPosition !== null ? insertAfterPosition + 1 : blocks.length;

			// ШАГ 1: Сначала сдвигаем позиции всех блоков, которые идут после места вставки
			if (insertAfterPosition !== null) {
				const blocksToShift = blocks.filter((b) => b.position >= newPosition);

				// Обновляем позиции на сервере (сдвигаем вниз)
				const shiftPromises = blocksToShift.map((b) => updateBlockPosition(b.id, b.position + 1));

				await Promise.all(shiftPromises);
			}

			// ШАГ 2: Теперь создаём новый блок с освободившейся позицией
			const newBlockData = {
				block_template_id: blockTemplate?.id || null,
				type: blockTemplate ? ('template' as const) : ('zeroblock' as const),
				position: newPosition,
				settings: blockTemplate
					? {
							...blockTemplate.default_data,
							styles: blockTemplate.settings.editableStyles
								? Object.keys(blockTemplate.settings.editableStyles).reduce((acc, key) => {
										acc[key] = (blockTemplate.settings.editableStyles as any)[key].default;
										return acc;
								  }, {} as Record<string, any>)
								: {},
					  }
					: {},
			};

			const createdBlock = await createBlock(page.id, newBlockData);

			// ШАГ 3: Обновляем локальное состояние
			let newBlocks: Block[];
			if (insertAfterPosition !== null) {
				const insertIndex = insertAfterPosition + 1;
				// Сначала обновляем позиции существующих блоков
				const updatedBlocks = blocks.map((b) => (b.position >= newPosition ? { ...b, position: b.position + 1 } : b));
				// Затем вставляем новый блок
				newBlocks = [...updatedBlocks.slice(0, insertIndex), createdBlock, ...updatedBlocks.slice(insertIndex)];
			} else {
				newBlocks = [...blocks, createdBlock];
			}

			setBlocks(newBlocks);
			setIsAddBlockModalOpen(false);
			setInsertAfterPosition(null);
			toast.success('Блок добавлен!');
		} catch (error: any) {
			console.error('Error adding block:', error);
			toast.error(error.response?.data?.message || 'Не удалось добавить блок');
		}
	};

	const deleteBlock = async (blockId: number) => {
		if (!window.confirm('Удалить этот блок?')) return;

		try {
			await deleteBlockApi(blockId);
			const newBlocks = blocks.filter((b) => b.id !== blockId);

			// Обновляем позиции
			const updatePromises = newBlocks.map((b, idx) => {
				if (b.position !== idx) {
					return updateBlockPosition(b.id, idx);
				}
				return Promise.resolve(b);
			});

			await Promise.all(updatePromises);

			setBlocks(newBlocks.map((b, idx) => ({ ...b, position: idx })));
			toast.success('Блок удалён!');
		} catch (error: any) {
			console.error('Error deleting block:', error);
			toast.error(error.response?.data?.message || 'Не удалось удалить блок');
		}
	};

	const moveBlock = async (blockId: number, direction: 'up' | 'down') => {
		const index = blocks.findIndex((b) => b.id === blockId);
		if (index === -1) return;
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= blocks.length) return;

		try {
			const newBlocks = [...blocks];
			[newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];

			// Обновляем позиции на сервере
			await Promise.all([updateBlockPosition(newBlocks[index].id, index), updateBlockPosition(newBlocks[newIndex].id, newIndex)]);

			setBlocks(newBlocks.map((b, idx) => ({ ...b, position: idx })));
			toast.success('Блок перемещён!');
		} catch (error: any) {
			console.error('Error moving block:', error);
			toast.error(error.response?.data?.message || 'Не удалось переместить блок');
		}
	};

	const openAddBlockAfter = (position: number) => {
		setInsertAfterPosition(position);
		setIsAddBlockModalOpen(true);
	};

	const handlePublish = async () => {
		try {
			await publishPages(Number(projectId), { page_ids: [page.id] });
			toast.success('Страница успешно опубликована!');
		} catch (error: any) {
			console.error('Error publishing page:', error);
			toast.error(error.response?.data?.message || 'Не удалось опубликовать страницу');
		}
	};

	return (
		<PageEditorLayout>
			<div className="min-h-screen bg-gray-100">
				<Header
					viewportSize={viewportSize}
					onViewportChange={setViewportSize}
					onAddBlockClick={() => setIsAddBlockModalOpen(true)}
					projectId={projectId!}
					currentPage={page}
					allPages={pages}
					onPublish={handlePublish}
				/>

				<div className="flex justify-center bg-gray-200 min-h-screen py-8">
					<div className={`${getViewportClass(viewportSize)} bg-white shadow-lg transition-all duration-500 ease-in-out`}>
						{blocks.length === 0 ? (
							<div className={`${getViewportClass(viewportSize)} mx-auto`}>
								<div className="text-center py-32">
									<p className="text-gray-500 text-lg mb-4">Страница пока пуста</p>
									<button
										onClick={() => setIsAddBlockModalOpen(true)}
										className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
									>
										Добавить первый блок
									</button>
								</div>
							</div>
						) : (
							blocks.map((block) => (
								<BlockPreview
									key={block.id}
									block={block}
									template={getBlockTemplate(block.block_template_id)}
									isHovered={hoveredBlockId === block.id}
									onHover={() => setHoveredBlockId(block.id)}
									onLeave={() => setHoveredBlockId(null)}
									onOpenSettings={() => openBlockSettings(block)}
									onDelete={() => deleteBlock(block.id)}
									onMoveUp={() => moveBlock(block.id, 'up')}
									onMoveDown={() => moveBlock(block.id, 'down')}
									onAddAfter={() => openAddBlockAfter(block.position)}
									isFirst={block.position === 0}
									isLast={block.position === blocks.length - 1}
									viewportSize={viewportSize}
									zeroblockData={zeroblockDataMap.get(block.id)}
								/>
							))
						)}
					</div>
				</div>

				{isSettingsModalOpen && selectedBlock && (
					<BlockSettingsModal
						block={selectedBlock}
						template={getBlockTemplate(selectedBlock.block_template_id)}
						onClose={() => setIsSettingsModalOpen(false)}
						onSave={saveBlockSettings}
					/>
				)}

				{isAddBlockModalOpen && (
					<AddBlockModal
						categories={categories}
						blockTemplates={blockTemplates}
						onClose={() => setIsAddBlockModalOpen(false)}
						onAddBlock={addBlock}
					/>
				)}
			</div>
		</PageEditorLayout>
	);
};

export { PageEditorPage };
