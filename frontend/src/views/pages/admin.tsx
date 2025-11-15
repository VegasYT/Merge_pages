import { useState } from 'react';
import { Code, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPage = () => {
	const [templateName, setTemplateName] = useState('');
	const [categoryId, setCategoryId] = useState(1);
	const [htmlStructure, setHtmlStructure] = useState('');
	const [javascript, setJavascript] = useState('');
	const [defaultData, setDefaultData] = useState('{}');
	const [editableStyles, setEditableStyles] = useState('{}');
	const [showPreview, setShowPreview] = useState(false);

	const handleSave = async () => {
		try {
			// Валидация JSON
			let parsedData;
			let parsedStyles;
			try {
				parsedData = JSON.parse(defaultData);
				parsedStyles = JSON.parse(editableStyles);
			} catch (e) {
				toast.error('Invalid JSON in data or styles');
				return;
			}

			const templateData = {
				name: templateName,
				category_id: categoryId,
				html_structure: htmlStructure,
				javascript: javascript,
				default_data: parsedData,
				editable_styles: parsedStyles,
			};

			const response = await fetch('http://localhost:3000/api/block-templates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(templateData),
			});

			if (!response.ok) {
				throw new Error('Failed to save template');
			}

			toast.success('Template saved successfully!');
			// Очистка формы
			setTemplateName('');
			setHtmlStructure('');
			setJavascript('');
			setDefaultData('{}');
			setEditableStyles('{}');
		} catch (error) {
			console.error('Error saving template:', error);
			toast.error('Failed to save template');
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
					<h1 className="text-3xl font-bold text-gray-900 mb-6">Template Block Editor</h1>

					<div className="grid grid-cols-2 gap-6">
						{/* Левая колонка - Основная информация */}
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Template Name
								</label>
								<input
									type="text"
									value={templateName}
									onChange={(e) => setTemplateName(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Hero Section"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Category ID
								</label>
								<input
									type="number"
									value={categoryId}
									onChange={(e) => setCategoryId(parseInt(e.target.value))}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									HTML Structure (JSON)
								</label>
								<textarea
									value={htmlStructure}
									onChange={(e) => setHtmlStructure(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
									rows={10}
									placeholder='{"type": "div", "className": "container", "children": []}'
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Default Data (JSON)
								</label>
								<textarea
									value={defaultData}
									onChange={(e) => setDefaultData(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
									rows={6}
									placeholder='{"title": "Hello World"}'
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Editable Styles (JSON)
								</label>
								<textarea
									value={editableStyles}
									onChange={(e) => setEditableStyles(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
									rows={6}
									placeholder='{"titleColor": "#000000"}'
								/>
							</div>
						</div>

						{/* Правая колонка - JavaScript */}
						<div className="space-y-4">
							<div>
								<div className="flex items-center justify-between mb-2">
									<label className="block text-sm font-medium text-gray-700">
										JavaScript Code
									</label>
									<button
										onClick={() => setShowPreview(!showPreview)}
										className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
									>
										{showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
										{showPreview ? 'Hide' : 'Show'} Preview
									</button>
								</div>
								<textarea
									value={javascript}
									onChange={(e) => setJavascript(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
									rows={25}
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
							</div>

							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
									<Code size={16} />
									Изоляция скриптов
								</h3>
								<p className="text-xs text-blue-800 mb-2">
									Каждый блок будет автоматически изолирован через IIFE. Ваш скрипт получит доступ к:
								</p>
								<ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
									<li><code className="bg-blue-100 px-1 rounded">blockElement</code> - DOM элемент блока</li>
									<li><code className="bg-blue-100 px-1 rounded">data</code> - данные блока</li>
									<li><code className="bg-blue-100 px-1 rounded">blockId</code> - уникальный ID блока</li>
								</ul>
								<p className="text-xs text-blue-800 mt-2">
									Все переменные будут локальными для каждого экземпляра блока.
								</p>
							</div>
						</div>
					</div>

					{/* Кнопки действий */}
					<div className="flex gap-4 mt-6">
						<button
							onClick={handleSave}
							className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
						>
							<Save size={20} />
							Save Template
						</button>
					</div>
				</div>

				{/* Превью */}
				{showPreview && (
					<div className="bg-white rounded-xl shadow-sm p-6">
						<h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
						<div className="bg-gray-100 p-4 rounded-lg">
							<p className="text-sm text-gray-600 mb-2">Generated JavaScript wrapper:</p>
							<pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
{`(function(blockElement, data, blockId) {
  'use strict';

  // Изоляция через замыкание
  ${javascript || '// Your code here'}

})(document.getElementById('block-' + blockId), blockData, blockId);`}
							</pre>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
