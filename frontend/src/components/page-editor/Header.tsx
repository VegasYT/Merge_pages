import React, { useState } from 'react';
import { Plus, Smartphone, Tablet, Monitor, ArrowLeft, ChevronDown, Upload } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Page {
	id: number;
	name: string;
	slug: string;
	status: 'published' | 'draft';
}

interface HeaderProps {
	viewportSize: 'mobile' | 'tablet' | 'desktop';
	onViewportChange: (size: 'mobile' | 'tablet' | 'desktop') => void;
	onAddBlockClick: () => void;
	projectId: string;
	currentPage: Page;
	allPages: Page[];
	onPublish: () => void;
}

// Компонент шапки редактора с кнопками управления
export default function Header({
	viewportSize,
	onViewportChange,
	onAddBlockClick,
	projectId,
	currentPage,
	allPages,
	onPublish
}: HeaderProps) {
	const navigate = useNavigate();
	const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);

	const handleBackToPages = () => {
		navigate(`/projects/${projectId}/pages`);
	};

	const handlePageSelect = (pageId: number) => {
		navigate(`/projects/${projectId}/pages/${pageId}/editor`);
		setIsPageSelectorOpen(false);
	};

	return (
		<div className="bg-white border-b sticky top-0 z-10 shadow-sm">
			<div className="max-w-7xl mx-auto px-6 py-4">
				<div className="flex justify-between items-center">
					{/* Левая часть: навигация и выбор страницы */}
					<div className="flex items-center gap-4">
						<button
							onClick={handleBackToPages}
							className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
							title="Вернуться к списку страниц"
						>
							<ArrowLeft size={18} />
							Назад
						</button>

						{/* Выпадающий список страниц */}
						<div className="relative">
							<button
								onClick={() => setIsPageSelectorOpen(!isPageSelectorOpen)}
								className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition min-w-[200px] justify-between"
							>
								<span className="truncate">{currentPage.name}</span>
								<ChevronDown size={18} className={`transition-transform ${isPageSelectorOpen ? 'rotate-180' : ''}`} />
							</button>

							{isPageSelectorOpen && (
								<>
									<div
										className="fixed inset-0 z-10"
										onClick={() => setIsPageSelectorOpen(false)}
									/>
									<div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border z-20 max-h-[300px] overflow-y-auto">
										{allPages.map((page) => (
											<button
												key={page.id}
												onClick={() => handlePageSelect(page.id)}
												className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b last:border-b-0 ${
													page.id === currentPage.id ? 'bg-blue-50 text-blue-600' : ''
												}`}
											>
												<div className="font-medium">{page.name}</div>
												<div className="text-xs text-gray-500">/{page.slug}</div>
											</button>
										))}
									</div>
								</>
							)}
						</div>
					</div>

					{/* Центр: переключатели viewport */}
					<div className="flex gap-2">
						<button
							onClick={() => onViewportChange('mobile')}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
								viewportSize === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
							}`}
						>
							<Smartphone size={18} />
							Мобильный
						</button>
						<button
							onClick={() => onViewportChange('tablet')}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
								viewportSize === 'tablet' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
							}`}
						>
							<Tablet size={18} />
							Планшет
						</button>
						<button
							onClick={() => onViewportChange('desktop')}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
								viewportSize === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
							}`}
						>
							<Monitor size={18} />
							Десктоп
						</button>
					</div>

					{/* Правая часть: действия */}
					<div className="flex gap-2">
						<button
							onClick={onPublish}
							disabled={currentPage.status === 'published'}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
								currentPage.status === 'published'
									? 'bg-gray-300 text-gray-500 cursor-not-allowed'
									: 'bg-green-600 text-white hover:bg-green-700'
							}`}
						>
							<Upload size={20} />
							{currentPage.status === 'published' ? 'Опубликовано' : 'Опубликовать'}
						</button>
						<button
							onClick={onAddBlockClick}
							className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
						>
							<Plus size={20} />
							Добавить блок
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
