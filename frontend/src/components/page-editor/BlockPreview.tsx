import React, { useEffect, useRef } from 'react';
import { Settings, Trash2, ArrowUp, ArrowDown, Plus, Edit3 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import UniversalBlockRenderer from './UniversalBlockRenderer';
import ZeroBlockPreview from './ZeroBlockPreview';
import HtmlBlockRenderer from './HtmlBlockRenderer';
import type { Block } from '@/lib/services/blocks';
import type { BlockTemplate } from '@/lib/services/block-templates';

interface BlockPreviewProps {
	block: Block;
	template?: BlockTemplate | null;
	isHovered: boolean;
	onHover: () => void;
	onLeave: () => void;
	onOpenSettings: () => void;
	onDelete: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onAddAfter: () => void;
	isFirst: boolean;
	isLast: boolean;
	viewportSize: 'mobile' | 'tablet' | 'desktop';
	zeroblockData?: any;
}

// Компонент предпросмотра блока с элементами управления
export default function BlockPreview({
	block,
	template,
	isHovered,
	onHover,
	onLeave,
	onOpenSettings,
	onDelete,
	onMoveUp,
	onMoveDown,
	onAddAfter,
	isFirst,
	isLast,
	viewportSize,
	zeroblockData,
}: BlockPreviewProps) {
	const navigate = useNavigate();
	const { projectId, pageId } = useParams();
	const blockRef = useRef<HTMLDivElement>(null);

	const handleEditZeroBlock = () => {
		navigate(`/projects/${projectId}/pages/${pageId}/blocks/${block.id}/zeroblock-editor`);
	};

	// Выполнение JavaScript кода блока с изоляцией
	useEffect(() => {
		if (!template || !template.settings.javascript || block.type === 'zeroblock') {
			return;
		}

		const blockElement = blockRef.current;
		if (!blockElement) {
			return;
		}

		// Данные блока (без styles)
		const { styles, ...data } = block.settings;
		const blockId = block.id;

		// Оборачиваем пользовательский скрипт в IIFE для изоляции
		const wrappedScript = `
			(function(blockElement, data, blockId) {
				'use strict';
				try {
					${template.settings.javascript}
				} catch (error) {
					console.error('Error executing block script for block #' + blockId + ':', error);
				}
			})(arguments[0], arguments[1], arguments[2]);
		`;

		try {
			// Создаем функцию из строки и выполняем ее
			const executeScript = new Function('blockElement', 'data', 'blockId', wrappedScript);
			executeScript(blockElement, data, blockId);
		} catch (error) {
			console.error(`Error executing script for block #${blockId}:`, error);
		}

		// Cleanup function - опционально, если скрипт создает слушателей событий
		return () => {
			// Здесь можно добавить cleanup логику если нужно
		};
	}, [block, template, block.settings]);

	return (
		<div
			ref={blockRef}
			id={`block-${block.id}`}
			onMouseEnter={onHover}
			onMouseLeave={onLeave}
			className="relative group"
		>
			{isHovered && (
				<div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-4 border-blue-500 z-10 pointer-events-none">
					<div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
						{!isFirst && (
							<button
								onClick={onMoveUp}
								className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition"
								title="Переместить вверх"
							>
								<ArrowUp size={20} className="text-gray-700" />
							</button>
						)}
						{!isLast && (
							<button
								onClick={onMoveDown}
								className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition"
								title="Переместить вниз"
							>
								<ArrowDown size={20} className="text-gray-700" />
							</button>
						)}
						{block.type === 'zeroblock' ? (
							<button
								onClick={handleEditZeroBlock}
								className="p-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition"
								title="Редактировать ZeroBlock"
							>
								<Edit3 size={20} />
							</button>
						) : (
							<button
								onClick={onOpenSettings}
								className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
								title="Настройки"
							>
								<Settings size={20} />
							</button>
						)}
						<button onClick={onDelete} className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition" title="Удалить">
							<Trash2 size={20} />
						</button>
					</div>

					<div className="absolute top-4 left-4 pointer-events-auto">
						<div className="bg-white px-3 py-1 rounded-full shadow-lg text-sm font-medium text-gray-700">
							{block.type === 'zeroblock' ? 'Zero Block' : template?.name}
						</div>
					</div>
				</div>
			)}

			<div className="block-content">
				{block.type === 'zeroblock' ? (
					<ZeroBlockPreview block={block} viewportSize={viewportSize} zeroblockData={zeroblockData} />
				) : template ? (
					template.settings.type === 'html' ? (
						<HtmlBlockRenderer htmlContent={block.settings.htmlContent || ''} />
					) : (
						<UniversalBlockRenderer
							structure={template.settings.structure || []}
							data={(() => {
								// Извлекаем все данные кроме styles
								const { styles, ...dataWithoutStyles } = block.settings;
								return dataWithoutStyles;
							})()}
							styles={block.settings.styles || {}}
							viewportSize={viewportSize}
						/>
					)
				) : null}
			</div>

			{/* Кнопка добавления блока после текущего */}
			<div
				className={`absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${
					isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
				}`}
			>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onAddAfter();
					}}
					className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
					title="Добавить блок после"
				>
					<Plus size={20} className="group-hover:rotate-90 transition-transform" />
				</button>
			</div>
		</div>
	);
}
