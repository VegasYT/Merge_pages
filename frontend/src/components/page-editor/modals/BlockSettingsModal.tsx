import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Block } from '@/lib/services/blocks';
import type { BlockTemplate } from '@/lib/services/block-templates';

interface BlockSettingsModalProps {
	block: Block;
	template?: BlockTemplate | null;
	onClose: () => void;
	onSave: (updatedSettings: Record<string, any>) => void;
}

// Модальное окно настроек блока
export default function BlockSettingsModal({ block, template, onClose, onSave }: BlockSettingsModalProps) {
	const [settings, setSettings] = useState<Record<string, any>>(block.settings || {});
	const [activeTab, setActiveTab] = useState<'content' | 'styles'>('content');
	const [isVisible, setIsVisible] = useState(false);
	const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

	useEffect(() => {
		// Плавное появление модалки
		setTimeout(() => setIsVisible(true), 10);
	}, []);

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(onClose, 300);
	};

	const handleOverlayMouseDown = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			setMouseDownOnOverlay(true);
		}
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && mouseDownOnOverlay) {
			handleClose();
		}
		setMouseDownOnOverlay(false);
	};

	const handleStyleChange = (key: string, value: any) => {
		setSettings({
			...settings,
			styles: {
				...settings.styles,
				[key]: value,
			},
		});
	};

	const handleDataChange = (key: string, value: any) => {
		setSettings({
			...settings,
			[key]: value,
		});
	};

	// Отдельная обработка для Zero Block
	if (block.type === 'zeroblock') {
		return (
			<div
				className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-all duration-300 ${
					isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
				}`}
				onMouseDown={handleOverlayMouseDown}
				onClick={handleOverlayClick}
			>
				<div
					className={`bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl transition-all duration-300 transform ${
						isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
					}`}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
						<h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Zero Block</h2>
						<button onClick={handleClose} className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300">
							<X size={24} />
						</button>
					</div>
					<div className="p-8 text-center">
						<div className="mb-6">
							<div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
								Z
							</div>
						</div>
						<p className="text-gray-600 mb-6 text-lg">Для редактирования Zero Block используйте редактор</p>
						<button
							onClick={handleClose}
							className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
						>
							Закрыть
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Отдельная обработка для HTML Block
	if (template?.settings.type === 'html') {
		return (
			<div
				className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-all duration-300 p-4 ${
					isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
				}`}
				onMouseDown={handleOverlayMouseDown}
				onClick={handleOverlayClick}
			>
				<div
					className={`bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-all duration-300 transform ${
						isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
					}`}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
						<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
							{template?.name}
						</h2>
						<button onClick={handleClose} className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300">
							<X size={24} />
						</button>
					</div>

					<div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
						<div className="space-y-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">HTML код</label>
							<textarea
								value={settings.htmlContent || ''}
								onChange={(e) => handleDataChange('htmlContent', e.target.value)}
								rows={20}
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none transition-all duration-300 hover:border-gray-300 bg-white shadow-sm font-mono text-sm"
								placeholder="Введите HTML код..."
							/>
							<p className="text-sm text-gray-500">Вы можете использовать любой валидный HTML код, включая inline стили и CSS.</p>
						</div>
					</div>

					<div className="p-6 border-t flex justify-end gap-4 bg-gradient-to-r from-gray-50 to-blue-50/30">
						<button
							onClick={handleClose}
							className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-300 font-medium text-gray-700 hover:shadow-md transform hover:scale-105"
						>
							Отмена
						</button>
						<button
							onClick={() => {
								onSave(settings);
								handleClose();
							}}
							className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium transform hover:scale-105"
						>
							Сохранить
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Стандартные блоки с контентом и стилями
	return (
		<div
			className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-all duration-300 ${
				isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
			}`}
			onMouseDown={handleOverlayMouseDown}
			onClick={handleOverlayClick}
		>
			<div
				className={`bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-all duration-300 transform ${
					isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
				}`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
					<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{template?.name}</h2>
					<button onClick={handleClose} className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300">
						<X size={24} />
					</button>
				</div>

				<div className="flex border-b bg-gray-50">
					<button
						onClick={() => setActiveTab('content')}
						className={`px-6 py-3 font-medium relative transition-all duration-300 ${
							activeTab === 'content' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
						}`}
					>
						Контент
						{activeTab === 'content' && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse"></div>
						)}
					</button>
					<button
						onClick={() => setActiveTab('styles')}
						className={`px-6 py-3 font-medium relative transition-all duration-300 ${
							activeTab === 'styles' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
						}`}
					>
						Стили
						{activeTab === 'styles' && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse"></div>
						)}
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
					{activeTab === 'content' && (
						<div className="space-y-6 animate-fadeIn">
							<h3 className="text-lg font-semibold mb-4 text-gray-800">Редактирование контента</h3>
							{template?.settings.editableElements?.map((element, index) => (
								<div key={element} className="animate-slideIn" style={{ animationDelay: `${index * 50}ms` }}>
									<label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{element}</label>
									<textarea
										value={settings[element] || ''}
										onChange={(e) => handleDataChange(element, e.target.value)}
										rows={3}
										className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none transition-all duration-300 hover:border-gray-300 bg-white shadow-sm"
									/>
								</div>
							))}
						</div>
					)}

					{activeTab === 'styles' && (
						<div className="space-y-6 animate-fadeIn">
							<h3 className="text-lg font-semibold mb-4 text-gray-800">Настройка стилей</h3>
							{template &&
								Object.entries(template.settings.editableStyles || {}).map(([key, config]: [string, any], index) => (
									<div
										key={key}
										className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-slideIn"
										style={{ animationDelay: `${index * 50}ms` }}
									>
										<label className="block text-sm font-medium text-gray-700 mb-3">{config.label}</label>

										{/* Тип: color - выбор цвета */}
										{config.type === 'color' && (
											<div className="flex gap-4 items-center">
												<input
													type="color"
													value={settings.styles?.[key] || config.default}
													onChange={(e) => handleStyleChange(key, e.target.value)}
													className="h-12 w-24 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-all"
												/>
												<input
													type="text"
													value={settings.styles?.[key] || config.default}
													onChange={(e) => handleStyleChange(key, e.target.value)}
													className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 hover:border-gray-300"
													placeholder="#000000"
												/>
											</div>
										)}

										{/* Тип: text - текстовое поле */}
										{config.type === 'text' && (
											<input
												type="text"
												value={settings.styles?.[key] || config.default}
												onChange={(e) => handleStyleChange(key, e.target.value)}
												placeholder={config.placeholder || config.default}
												className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 hover:border-gray-300"
											/>
										)}

										{/* Тип: number - числовое поле */}
										{config.type === 'number' && (
											<div className="flex gap-3 items-center">
												<input
													type="number"
													value={settings.styles?.[key] || config.default}
													onChange={(e) => handleStyleChange(key, e.target.value)}
													min={config.min}
													max={config.max}
													step={config.step || 1}
													className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 hover:border-gray-300"
												/>
												{config.unit && <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-2 rounded-lg">{config.unit}</span>}
											</div>
										)}

										{/* Тип: range - слайдер */}
										{config.type === 'range' && (
											<div className="space-y-2">
												<div className="flex items-center gap-4">
													<input
														type="range"
														value={settings.styles?.[key] || config.default}
														onChange={(e) => handleStyleChange(key, e.target.value)}
														min={config.min}
														max={config.max}
														step={config.step || 0.1}
														className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
													/>
													<span className="text-sm font-semibold text-blue-600 min-w-[3rem] text-right bg-blue-50 px-3 py-1 rounded-lg">
														{settings.styles?.[key] || config.default}
													</span>
												</div>
											</div>
										)}
									</div>
								))}
						</div>
					)}
				</div>

				<div className="p-6 border-t flex justify-end gap-4 bg-gradient-to-r from-gray-50 to-blue-50/30">
					<button
						onClick={handleClose}
						className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-300 font-medium text-gray-700 hover:shadow-md transform hover:scale-105"
					>
						Отмена
					</button>
					<button
						onClick={() => {
							onSave(settings);
							handleClose();
						}}
						className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium transform hover:scale-105"
					>
						Сохранить
					</button>
				</div>
			</div>
		</div>
	);
}
