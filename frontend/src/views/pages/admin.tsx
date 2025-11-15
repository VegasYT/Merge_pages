import { useState } from 'react';
import { Code, Save, Settings, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

// Template Editor Components
import ElementsSidebar from '@/lib/template-editor/components/ElementsSidebar';
import VisualElement from '@/lib/template-editor/components/VisualElement';
import DropZone from '@/lib/template-editor/components/DropZone';
import EmptyCanvasDropZone from '@/lib/template-editor/components/EmptyCanvasDropZone';
import JsonEditorModal from '@/lib/template-editor/components/JsonEditorModal';

// Template Editor Hooks
import { useDndHandlers } from '@/lib/template-editor/hooks/useDndHandlers';

// Template Editor Utils
import { getElementByPath, getDefaultClasses } from '@/lib/template-editor/utils/elementUtils';

export const AdminPage = () => {
	const [templateName, setTemplateName] = useState('');
	const [categoryId, setCategoryId] = useState(1);
	const [structure, setStructure] = useState<any[]>([]);
	const [selectedElement, setSelectedElement] = useState<any>(null);
	const [editableStyles, setEditableStyles] = useState<Record<string, any>>({});
	const [defaultData, setDefaultData] = useState<Record<string, any>>({});
	const [previewStyles, setPreviewStyles] = useState<Record<string, any>>({});
	const [javascript, setJavascript] = useState('');

	// JSON editor modal state
	const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);

	// dnd-kit state
	const [activeId, setActiveId] = useState<string | null>(null);
	const [draggedElementType, setDraggedElementType] = useState<string | null>(null);

	// Configure sensors for drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Require 8px movement before drag starts
			},
		}),
		useSensor(KeyboardSensor)
	);

	// dnd-kit handlers
	const dndHandlers = useDndHandlers({
		structure,
		setStructure,
		defaultData,
		setDefaultData,
		setActiveId,
		setDraggedElementType,
	});

	// Add element
	const addElement = (type: string, parentPath: number[] | null = null) => {
		const containerTypes = ['container', 'div', 'grid', 'ul', 'ol', 'button', 'a'];
		const needsDataKey = !['container', 'div', 'grid', 'br', 'hr', 'ul', 'ol'].includes(type);

		const newElement: any = {
			type,
			className: getDefaultClasses(type),
			styles: {},
			children: containerTypes.includes(type) ? [] : undefined,
			dataKey: needsDataKey ? `${type}_${Date.now()}` : undefined,
		};

		// Additional fields for media elements
		if (type === 'img') {
			newElement.srcKey = `image_${Date.now()}`;
			newElement.altKey = `alt_${Date.now()}`;
			setDefaultData({
				...defaultData,
				[newElement.srcKey]: 'https://via.placeholder.com/800x600',
				[newElement.altKey]: 'Image description'
			});
		}
		if (type === 'video' || type === 'audio') {
			newElement.srcKey = `${type}_${Date.now()}`;
			newElement.controls = true;
			newElement.loop = false;
			newElement.muted = false;
			newElement.autoPlay = false;
			if (type === 'video') {
				newElement.posterKey = `poster_${Date.now()}`;
				setDefaultData({
					...defaultData,
					[newElement.srcKey]: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
					[newElement.posterKey]: 'https://via.placeholder.com/1920x1080'
				});
			} else {
				setDefaultData({
					...defaultData,
					[newElement.srcKey]: 'https://example.com/audio.mp3'
				});
			}
		}
		if (type === 'iframe') {
			newElement.srcKey = `iframe_${Date.now()}`;
			newElement.titleKey = `title_${Date.now()}`;
			newElement.allowFullScreen = true;
			setDefaultData({
				...defaultData,
				[newElement.srcKey]: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
				[newElement.titleKey]: 'Embedded content'
			});
		}
		if (type === 'a') {
			newElement.hrefKey = `link_${Date.now()}`;
			setDefaultData({
				...defaultData,
				[newElement.hrefKey]: '#'
			});
		}

		// Add defaultData for text elements
		if (needsDataKey && newElement.dataKey) {
			setDefaultData({
				...defaultData,
				[newElement.dataKey]: `Sample ${type} text`
			});
		}

		if (parentPath === null) {
			setStructure([...structure, newElement]);
		} else {
			const newStructure = [...structure];
			const parent = getElementByPath(newStructure, parentPath);
			if (parent && parent.children) {
				parent.children.push(newElement);
			}
			setStructure(newStructure);
		}
	};

	// Delete element
	const deleteElement = (path: number[]) => {
		const newStructure = [...structure];
		if (path.length === 1) {
			newStructure.splice(path[0], 1);
		} else {
			const parentPath = path.slice(0, -1);
			const parent = getElementByPath(newStructure, parentPath);
			parent.children.splice(path[path.length - 1], 1);
		}
		setStructure(newStructure);
		setSelectedElement(null);
	};

	// Copy element
	const copyElement = (path: number[]) => {
		const newStructure = [...structure];
		const element = getElementByPath(newStructure, path);
		const copied = JSON.parse(JSON.stringify(element));

		if (path.length === 1) {
			newStructure.splice(path[0] + 1, 0, copied);
		} else {
			const parentPath = path.slice(0, -1);
			const parent = getElementByPath(newStructure, parentPath);
			parent.children.splice(path[path.length - 1] + 1, 0, copied);
		}
		setStructure(newStructure);
	};

	// Update className
	const updateClassName = (path: number[], newClassName: string) => {
		const newStructure = [...structure];
		const element = getElementByPath(newStructure, path);
		element.className = newClassName;
		setStructure(newStructure);
	};

	// Add editable style
	const addEditableStyle = (styleKey: string, config: any) => {
		setEditableStyles({
			...editableStyles,
			[styleKey]: config
		});
	};

	// Link style to element
	const linkStyleToElement = (path: number[], cssProperty: string, styleKey: string) => {
		const newStructure = [...structure];
		const element = getElementByPath(newStructure, path);
		if (!element.styles) element.styles = {};
		element.styles[cssProperty] = styleKey;
		setStructure(newStructure);
	};

	// Render drop zone
	const renderDropZone = (parentPath: number[], insertIndex: number) => {
		return (
			<DropZone
				parentPath={parentPath}
				insertIndex={insertIndex}
				activeId={activeId}
			/>
		);
	};

	// Render visual element
	const renderVisualElement = (element: any, path: number[] = []) => {
		return (
			<VisualElement
				element={element}
				path={path}
				structure={structure}
				selectedElement={selectedElement}
				defaultData={defaultData}
				editableStyles={editableStyles}
				previewStyles={previewStyles}
				activeId={activeId}
				onSelectElement={setSelectedElement}
				onCopyElement={copyElement}
				onDeleteElement={deleteElement}
				renderDropZone={renderDropZone}
				getIdFromPath={dndHandlers.getIdFromPath}
			/>
		);
	};

	const handleSave = async () => {
		try {
			if (!templateName.trim()) {
				toast.error('Please enter a template name');
				return;
			}

			const templateData = {
				category_id: categoryId,
				template_name: templateName,
				name: templateName,
				settings: {
					structure: structure,
					editableStyles: editableStyles,
					editableElements: Object.keys(defaultData),
					...(javascript && { javascript: javascript })
				},
				default_data: defaultData,
				preview_url: 'https://via.placeholder.com/300x200'
			};

			const response = await fetch('/api/block-templates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(templateData),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(errorData?.message || 'Failed to save template');
			}

			const result = await response.json();
			toast.success('Template saved successfully!');
			console.log('Saved template:', result);

			// Очистка формы
			setTemplateName('');
			setStructure([]);
			setDefaultData({});
			setEditableStyles({});
			setJavascript('');
		} catch (error) {
			console.error('Error saving template:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to save template');
		}
	};

	// Handle JSON editor save
	const handleJsonSave = (data: { structure: any[]; editableStyles: Record<string, any>; defaultData: Record<string, any> }) => {
		setStructure(data.structure);
		setEditableStyles(data.editableStyles);
		setDefaultData(data.defaultData);
		toast.success('JSON updated successfully!');
	};

	return (
		<DndContext
			sensors={sensors}
			onDragStart={dndHandlers.handleDragStart}
			onDragOver={dndHandlers.handleDragOver}
			onDragEnd={dndHandlers.handleDragEnd}
		>
			<div className="h-screen flex flex-col bg-gray-100">
				{/* Header */}
				<div className="bg-white border-b px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<h1 className="text-2xl font-bold text-gray-900">Template Block Editor</h1>
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={templateName}
								onChange={(e) => setTemplateName(e.target.value)}
								className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
								placeholder="Template Name"
							/>
							<input
								type="number"
								value={categoryId}
								onChange={(e) => setCategoryId(parseInt(e.target.value))}
								className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
								placeholder="Cat ID"
							/>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<button
							onClick={() => setIsJsonEditorOpen(true)}
							className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
							title="Edit JSON manually"
						>
							<FileJson size={18} />
							Edit JSON
						</button>
						<button
							onClick={handleSave}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
						>
							<Save size={18} />
							Save Template
						</button>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1 flex overflow-hidden">
					{/* Left Sidebar - Elements */}
					<div className="w-64 bg-white border-r overflow-y-auto">
						<ElementsSidebar onAddElement={addElement} />
					</div>

					{/* Center - Visual Canvas */}
					<div className="flex-1 bg-gray-100 p-4 overflow-auto">
						<div className="bg-white rounded-xl shadow-sm p-8 max-w-5xl mx-auto">
							<h2 className="text-xl font-bold mb-4">Visual Builder</h2>
							<p className="text-gray-600 mb-6 text-sm">
								Drag and drop elements to build your template. All changes are live!
							</p>

							{structure.length === 0 ? (
								<EmptyCanvasDropZone />
							) : (
								<div className="space-y-0">
									{structure.map((element, index) => (
										<div key={`root-${index}`}>
											{renderDropZone([], index)}
											{renderVisualElement(element, [index])}
										</div>
									))}
									{renderDropZone([], structure.length)}
								</div>
							)}
						</div>
					</div>

					{/* Right Sidebar - Properties */}
					<div className="w-96 bg-white border-l overflow-y-auto">
						<div className="p-4">
							<h3 className="font-bold mb-3">Properties</h3>

							{selectedElement ? (
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-semibold mb-1">Element Type</label>
										<input
											type="text"
											value={selectedElement.element.type}
											disabled
											className="w-full px-3 py-2 border rounded bg-gray-100 text-sm"
										/>
									</div>

									{/* Data Key */}
									{selectedElement.element.dataKey !== undefined && (
										<div>
											<label className="block text-sm font-semibold mb-1">Content</label>
											<input
												type="text"
												value={defaultData[selectedElement.element.dataKey] || ''}
												onChange={(e) => {
													setDefaultData({
														...defaultData,
														[selectedElement.element.dataKey]: e.target.value
													});
												}}
												className="w-full px-3 py-2 border rounded text-sm"
												placeholder="Enter content..."
											/>
											<p className="text-xs text-gray-500 mt-1">Key: {selectedElement.element.dataKey}</p>
										</div>
									)}

									<div className="border-t pt-3">
										<label className="block text-sm font-semibold mb-1">Tailwind Classes</label>
										<textarea
											value={selectedElement.element.className || ''}
											onChange={(e) => updateClassName(selectedElement.path, e.target.value)}
											className="w-full px-3 py-2 border rounded font-mono text-xs"
											rows={4}
											placeholder="py-12 text-center max-w-6xl"
										/>
									</div>

									<div className="border-t pt-3">
										<label className="block text-sm font-semibold mb-2">Editable Styles</label>
										<p className="text-xs text-gray-600 mb-3">Link CSS properties to editable styles</p>

										<div className="space-y-2">
											<div className="space-y-2">
												<input
													type="text"
													placeholder="CSS property (e.g., backgroundColor)"
													className="w-full px-2 py-1 border rounded text-xs"
													id="css-prop"
												/>
												<input
													type="text"
													placeholder="Style key (e.g., primaryColor)"
													className="w-full px-2 py-1 border rounded text-xs"
													id="style-key"
												/>
												<button
													onClick={() => {
														const cssProp = (document.getElementById('css-prop') as HTMLInputElement)?.value;
														const styleKey = (document.getElementById('style-key') as HTMLInputElement)?.value;
														if (cssProp && styleKey) {
															linkStyleToElement(selectedElement.path, cssProp, styleKey);
															if (!editableStyles[styleKey]) {
																addEditableStyle(styleKey, {
																	type: 'color',
																	label: styleKey,
																	default: '#667eea'
																});
															}
															(document.getElementById('css-prop') as HTMLInputElement).value = '';
															(document.getElementById('style-key') as HTMLInputElement).value = '';
														}
													}}
													className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-semibold"
												>
													+ Add Style Link
												</button>
											</div>

											<div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
												<p className="font-semibold mb-1">Common CSS properties:</p>
												<p>backgroundColor, color, fontSize, padding, margin, borderRadius, width, height</p>
											</div>
										</div>

										{selectedElement.element.styles && Object.keys(selectedElement.element.styles).length > 0 && (
											<div className="mt-3 text-xs bg-green-50 p-3 rounded border border-green-200">
												<p className="font-semibold mb-2 text-green-800">Linked styles:</p>
												{Object.entries(selectedElement.element.styles).map(([css, key]) => (
													<div key={css} className="flex justify-between items-center text-gray-700 mb-1 bg-white px-2 py-1 rounded">
														<span className="font-mono text-xs">{css} → {key as string}</span>
														<button
															onClick={() => {
																const newStructure = [...structure];
																const element = getElementByPath(newStructure, selectedElement.path);
																delete element.styles[css];
																setStructure(newStructure);
															}}
															className="text-red-500 hover:text-red-700 font-bold"
														>
															×
														</button>
													</div>
												))}
											</div>
										)}
									</div>

									{/* Editable Styles Configuration */}
									<div className="border-t pt-4">
										<h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
											<Settings size={16} />
											Configure Editable Styles
										</h4>
										<div className="space-y-3 max-h-96 overflow-y-auto">
											{Object.entries(editableStyles).map(([key, config]) => (
												<div key={key} className="border rounded p-3 text-xs bg-gray-50">
													<div className="flex justify-between items-center mb-3">
														<span className="font-semibold text-purple-700">{key}</span>
														<button
															onClick={() => {
																const newStyles = { ...editableStyles };
																delete newStyles[key];
																setEditableStyles(newStyles);
															}}
															className="text-red-500 hover:text-red-700 font-bold"
														>
															×
														</button>
													</div>

													<div className="space-y-2">
														<div>
															<label className="block text-xs font-semibold mb-1">Type</label>
															<select
																value={config.type}
																onChange={(e) => {
																	const newType = e.target.value;
																	const updatedConfig = { ...config, type: newType };

																	if ((newType === 'number' || newType === 'range') && !config.unit) {
																		updatedConfig.unit = 'px';
																		updatedConfig.min = config.min || 0;
																		updatedConfig.max = config.max || 100;
																		updatedConfig.step = config.step || 1;
																	}

																	setEditableStyles({
																		...editableStyles,
																		[key]: updatedConfig
																	});
																}}
																className="w-full px-2 py-1 border rounded text-xs"
															>
																<option value="color">Color</option>
																<option value="text">Text</option>
																<option value="number">Number</option>
																<option value="range">Range</option>
																<option value="select">Select</option>
															</select>
														</div>

														<div>
															<label className="block text-xs font-semibold mb-1">Label</label>
															<input
																type="text"
																value={config.label}
																onChange={(e) => {
																	setEditableStyles({
																		...editableStyles,
																		[key]: { ...config, label: e.target.value }
																	});
																}}
																className="w-full px-2 py-1 border rounded text-xs"
															/>
														</div>

														<div>
															<label className="block text-xs font-semibold mb-1">Default Value</label>
															<input
																type="text"
																value={config.default}
																onChange={(e) => {
																	setEditableStyles({
																		...editableStyles,
																		[key]: { ...config, default: e.target.value }
																	});
																}}
																className="w-full px-2 py-1 border rounded text-xs"
															/>
														</div>
													</div>
												</div>
											))}

											{Object.keys(editableStyles).length === 0 && (
												<p className="text-xs text-gray-500 text-center py-4">
													No editable styles configured yet. Link CSS properties above to create them.
												</p>
											)}
										</div>
									</div>
								</div>
							) : (
								<div className="text-center py-12">
									<div className="text-4xl mb-3">👆</div>
									<p className="text-gray-500 text-sm">Select an element from the canvas to edit its properties</p>
								</div>
							)}

							<div className="mt-6 pt-6 border-t">
								<h3 className="font-bold mb-3 flex items-center gap-2">
									<Code size={16} />
									Default Data
								</h3>
								<div className="space-y-2 max-h-64 overflow-y-auto">
									{Object.entries(defaultData).map(([key, value]) => (
										<div key={key} className="bg-gray-50 p-2 rounded">
											<div className="flex justify-between items-center mb-1">
												<label className="block text-xs font-semibold text-gray-700">{key}</label>
												<button
													onClick={() => {
														const newData = { ...defaultData };
														delete newData[key];
														setDefaultData(newData);
													}}
													className="text-red-500 hover:text-red-700 text-xs font-bold"
												>
													×
												</button>
											</div>
											<input
												type="text"
												value={value as string}
												onChange={(e) => setDefaultData({ ...defaultData, [key]: e.target.value })}
												className="w-full px-2 py-1 border rounded text-xs font-mono"
											/>
										</div>
									))}
									{Object.keys(defaultData).length === 0 && (
										<p className="text-xs text-gray-500 text-center py-4">
											No data keys yet. Add elements with dataKey to populate this section.
										</p>
									)}
								</div>
							</div>

							<div className="mt-6 pt-6 border-t">
								<h3 className="font-bold mb-3 flex items-center gap-2">
									<Code size={16} />
									JavaScript
								</h3>
								<textarea
									value={javascript}
									onChange={(e) => setJavascript(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
									rows={10}
									placeholder={`// Этот скрипт будет выполнен для каждого блока
// blockElement - DOM элемент блока
// data - данные блока из default_data

// Пример инициализации слайдера:
const slider = blockElement.querySelector('.slider');
if (slider) {
  // Ваш код инициализации
  console.log('Slider initialized for block:', blockElement.id);
}`}
								/>
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
									<p className="text-xs text-blue-800 mb-2">
										Каждый блок будет автоматически изолирован через IIFE. Ваш скрипт получит доступ к:
									</p>
									<ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
										<li><code className="bg-blue-100 px-1 rounded">blockElement</code> - DOM элемент блока</li>
										<li><code className="bg-blue-100 px-1 rounded">data</code> - данные блока</li>
										<li><code className="bg-blue-100 px-1 rounded">blockId</code> - уникальный ID блока</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* JSON Editor Modal */}
			<JsonEditorModal
				isOpen={isJsonEditorOpen}
				onClose={() => setIsJsonEditorOpen(false)}
				structure={structure}
				editableStyles={editableStyles}
				defaultData={defaultData}
				onSave={handleJsonSave}
			/>
		</DndContext>
	);
};
