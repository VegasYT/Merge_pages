import React from 'react';

// Функция для проверки, содержит ли HTML видимый контент
const hasVisibleHtmlContent = (html: string): boolean => {
	if (!html || html.trim() === '') return false;

	// Создаем временный элемент для анализа
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;

	// Удаляем все невидимые элементы (script, style, meta и т.д.)
	const invisibleTags = tempDiv.querySelectorAll('script, style, meta, link, title');
	invisibleTags.forEach((tag) => tag.remove());

	// Проверяем, остался ли какой-то текст или элементы
	const textContent = tempDiv.textContent?.trim() || '';
	const hasElements = tempDiv.children.length > 0;

	return textContent.length > 0 || hasElements;
};

interface HtmlBlockRendererProps {
	htmlContent: string;
}

// Компонент для безопасного рендеринга HTML кода
export default function HtmlBlockRenderer({ htmlContent }: HtmlBlockRendererProps) {
	const isEmpty = !htmlContent || htmlContent.trim() === '';
	const hasVisibleContent = !isEmpty && hasVisibleHtmlContent(htmlContent);

	// Placeholder для пустого блока
	if (isEmpty) {
		return (
			<div className="min-h-[200px] flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
				<div className="text-center text-gray-400 p-8">
					<svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
					</svg>
					<p className="text-lg font-medium">HTML блок пуст</p>
					<p className="text-sm mt-2">Нажмите на настройки, чтобы добавить HTML код</p>
				</div>
			</div>
		);
	}

	// Placeholder для блока с невидимым контентом (скрипты, стили и т.д.)
	if (!hasVisibleContent) {
		return (
			<div className="min-h-[200px] flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
				<div className="text-center text-gray-400 p-8">
					<svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
					</svg>
					<p className="text-lg font-medium">HTML блок</p>
				</div>
			</div>
		);
	}

	return <div className="min-h-[100px]" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
