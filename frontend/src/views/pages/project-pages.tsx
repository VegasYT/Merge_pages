import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { Plus, Search, FileText, Calendar, Edit, Trash2, ExternalLink, ChevronRight, MoreVertical, Copy, Eye, EyeOff, Loader2, ArrowLeft, Upload } from 'lucide-react';
import { createPage, updatePage, deletePage } from '@/lib/services/pages';
import { publishPages } from '@/lib/services/projects';
import type { Page } from '@/lib/services/pages';
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

interface LoaderData {
	project: Project;
	pages: Page[];
}

const ProjectPagesPage = () => {
	const { project, pages: initialPages } = useLoaderData() as LoaderData;
	const navigate = useNavigate();
	const [pages, setPages] = useState<Page[]>(initialPages);
	const [searchQuery, setSearchQuery] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [selectedPage, setSelectedPage] = useState<number | null>(null);
	const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
	const [contextMenuPosition, setContextMenuPosition] = useState<{ top: number; left: number } | null>(null);
	const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
	const [newPage, setNewPage] = useState({ name: '', title: '', slug: '' });
	const [isCreating, setIsCreating] = useState(false);
	const [isEditPageModalOpen, setIsEditPageModalOpen] = useState(false);
	const [editingPage, setEditingPage] = useState<Page | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
	const [selectedPageIds, setSelectedPageIds] = useState<number[]>([]);
	const [isPublishing, setIsPublishing] = useState(false);

	// Функция для нормализации slug
	const normalizeSlug = (value: string): string => {
		return value
			.toLowerCase() // Переводим в нижний регистр
			.replace(/\s+/g, '-') // Заменяем пробелы на дефисы
			.replace(/[^a-z0-9\-\/]/g, '') // Оставляем только буквы, цифры, дефисы и слеши
			.replace(/\/+/g, '/') // Заменяем несколько слешей подряд на один
			.replace(/\-+/g, '-') // Заменяем несколько дефисов подряд на один
			.replace(/^\/+/, ''); // Убираем слеши только в начале
	};

	const filteredPages = pages.filter(page => {
		const matchesSearch =
			page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			page.slug.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === 'all' || page.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const getTimeSince = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days} days ago`;
		if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
		return `${Math.floor(days / 30)} months ago`;
	};

	const gradients = [
		'from-blue-500 to-purple-600',
		'from-pink-500 to-rose-600',
		'from-green-500 to-teal-600',
		'from-orange-500 to-red-600',
		'from-indigo-500 to-blue-600',
		'from-purple-500 to-pink-600',
	];

	const publishedCount = pages.filter(p => p.status === 'published').length;
	const draftCount = pages.filter(p => p.status === 'draft').length;

	const handleCreatePage = async () => {
		if (!newPage.name || !newPage.title || !newPage.slug) {
			toast.error('Please fill in all required fields');
			return;
		}

		setIsCreating(true);
		try {
			const createdPage = await createPage(project.id, {
				name: newPage.name,
				title: newPage.title,
				slug: newPage.slug,
				status: 'draft',
			});

			setPages([createdPage, ...pages]);
			setIsAddPageModalOpen(false);
			setNewPage({ name: '', title: '', slug: '' });

			toast.success('Page created successfully!');
		} catch (error: any) {
			console.error('Error creating page:', error);
			toast.error(error.response?.data?.message || 'Failed to create page. Please try again.');
		} finally {
			setIsCreating(false);
		}
	};

	const handleUpdatePage = async () => {
		if (!editingPage || !editingPage.name || !editingPage.title || !editingPage.slug) {
			toast.error('Please fill in all required fields');
			return;
		}

		setIsUpdating(true);
		try {
			const updatedPage = await updatePage(editingPage.id, {
				name: editingPage.name,
				title: editingPage.title,
				slug: editingPage.slug,
				icon: editingPage.icon,
				status: editingPage.status,
			});

			setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
			setIsEditPageModalOpen(false);
			setEditingPage(null);

			toast.success('Page updated successfully!');
		} catch (error: any) {
			console.error('Error updating page:', error);
			toast.error(error.response?.data?.message || 'Failed to update page. Please try again.');
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDeletePage = async (pageId: number) => {
		if (!confirm('Are you sure you want to delete this page?')) {
			return;
		}

		try {
			await deletePage(pageId);
			setPages(pages.filter(p => p.id !== pageId));
			setSelectedPage(null);
			setContextMenuPosition(null);

			toast.success('Page deleted successfully!');
		} catch (error: any) {
			console.error('Error deleting page:', error);
			toast.error(error.response?.data?.message || 'Failed to delete page. Please try again.');
		}
	};

	const openEditModal = (page: Page) => {
		setEditingPage(page);
		setIsEditPageModalOpen(true);
		setSelectedPage(null);
		setContextMenuPosition(null);
	};

	const togglePageStatus = async (page: Page) => {
		const newStatus = page.status === 'published' ? 'draft' : 'published';

		try {
			const updatedPage = await updatePage(page.id, {
				status: newStatus,
			});

			setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
			setSelectedPage(null);
			setContextMenuPosition(null);

			toast.success(`Page ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
		} catch (error: any) {
			console.error('Error updating page status:', error);
			toast.error(error.response?.data?.message || 'Failed to update page status.');
		}
	};

	const handlePublishPages = async () => {
		if (selectedPageIds.length === 0) {
			toast.error('Выберите хотя бы одну страницу для публикации');
			return;
		}

		setIsPublishing(true);
		try {
			await publishPages(project.id, { page_ids: selectedPageIds });
			toast.success(`${selectedPageIds.length} ${selectedPageIds.length === 1 ? 'страница опубликована' : 'страницы опубликованы'} успешно!`);
			setIsPublishModalOpen(false);
			setSelectedPageIds([]);
		} catch (error: any) {
			console.error('Error publishing pages:', error);
			toast.error(error.response?.data?.message || 'Не удалось опубликовать страницы');
		} finally {
			setIsPublishing(false);
		}
	};

	const togglePageSelection = (pageId: number) => {
		setSelectedPageIds(prev =>
			prev.includes(pageId)
				? prev.filter(id => id !== pageId)
				: [...prev, pageId]
		);
	};

	const toggleAllPages = () => {
		if (selectedPageIds.length === pages.length) {
			setSelectedPageIds([]);
		} else {
			setSelectedPageIds(pages.map(p => p.id));
		}
	};

	return (
		<div className="standard-tailwind-styles min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<button
								onClick={() => navigate('/projects')}
								className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								title="Back to projects"
							>
								<ArrowLeft size={20} className="text-gray-600" />
							</button>
							<div>
								<h1 className="text-xl md:text-2xl font-bold text-gray-900">{project.name} - Pages</h1>
								<p className="text-xs md:text-sm text-gray-600 mt-1 hidden sm:block">Manage landing pages</p>
							</div>
						</div>

						<div className="flex gap-2">
							<button
								onClick={() => setIsPublishModalOpen(true)}
								className="px-3 py-2 md:px-4 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-1.5 md:gap-2 shadow-lg shadow-green-500/30 text-sm md:text-base"
							>
								<Upload size={18} className="md:w-5 md:h-5" />
								<span className="hidden sm:inline">Опубликовать страницы</span>
								<span className="sm:hidden">Опубликовать</span>
							</button>
							<button
								onClick={() => setIsAddPageModalOpen(true)}
								className="px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-1.5 md:gap-2 shadow-lg shadow-blue-500/30 text-sm md:text-base"
							>
								<Plus size={18} className="md:w-5 md:h-5" />
								<span className="hidden sm:inline">New Page</span>
								<span className="sm:hidden">New</span>
							</button>
						</div>
					</div>

					{/* Search and Filters */}
					<div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
							<input
								type="text"
								placeholder="Search pages..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-9 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
							/>
						</div>

						{/* Status Filter */}
						<div className="flex items-center gap-2 overflow-x-auto">
							<button
								onClick={() => setStatusFilter('all')}
								className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
									statusFilter === 'all'
										? 'bg-blue-100 text-blue-700 border border-blue-300'
										: 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
								}`}
							>
								All ({pages.length})
							</button>
							<button
								onClick={() => setStatusFilter('published')}
								className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
									statusFilter === 'published'
										? 'bg-green-100 text-green-700 border border-green-300'
										: 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
								}`}
							>
								<Eye size={14} className="md:w-4 md:h-4" />
								Published ({publishedCount})
							</button>
							<button
								onClick={() => setStatusFilter('draft')}
								className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
									statusFilter === 'draft'
										? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
										: 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
								}`}
							>
								<EyeOff size={14} className="md:w-4 md:h-4" />
								Draft ({draftCount})
							</button>
						</div>

						<div className="flex items-center gap-1 md:gap-2 bg-gray-100 rounded-lg p-1">
							<button
								onClick={() => setViewMode('grid')}
								className={`px-2 md:px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-all ${
									viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
								}`}
							>
								Grid
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`px-2 md:px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-all ${
									viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
								}`}
							>
								List
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Pages Count */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
				<p className="text-xs md:text-sm text-gray-600">
					{filteredPages.length} {filteredPages.length === 1 ? 'page' : 'pages'}
					{searchQuery && ' found'}
				</p>
			</div>

			{/* Pages Grid/List */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 pb-8 md:pb-12">
				{viewMode === 'grid' ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredPages.map((page, index) => (
							<div
								key={page.id}
								className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200"
								onClick={() => {
									navigate(`/projects/${project.id}/pages/${page.id}/editor`);
								}}
							>
								{/* Gradient Header */}
								<div className={`h-32 bg-gradient-to-r ${gradients[index % gradients.length]} relative overflow-hidden`}>
									<div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
									<div className="absolute inset-0 flex items-center justify-center">
										<span className="text-6xl opacity-90">{page.icon || '📄'}</span>
									</div>
									<div className="absolute top-3 right-3">
										<span
											className={`px-2 py-1 text-xs font-semibold rounded-full ${
												page.status === 'published' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
											}`}
										>
											{page.status === 'published' ? 'Published' : 'Draft'}
										</span>
									</div>
								</div>

								{/* Content */}
								<div className="p-5">
									<div className="flex items-start justify-between mb-3">
										<div className="flex-1 min-w-0">
											<h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
												{page.name}
											</h3>
											<p className="text-xs text-gray-500 mt-1 truncate">{page.slug}</p>
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												const rect = e.currentTarget.getBoundingClientRect();
												setContextMenuPosition({
													top: rect.bottom + window.scrollY + 5,
													left: rect.left + window.scrollX - 150,
												});
												setSelectedPage(page.id);
											}}
											className="p-1 hover:bg-gray-100 rounded transition-colors"
										>
											<MoreVertical size={18} className="text-gray-400" />
										</button>
									</div>

									<p className="text-sm text-gray-600 mb-4 line-clamp-2">{page.title}</p>

									<div className="flex items-center justify-between text-xs text-gray-500">
										<div className="flex items-center gap-1">
											<Calendar size={14} />
											<span>Updated {getTimeSince(page.updated_at)}</span>
										</div>
										<ChevronRight
											size={16}
											className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
										/>
									</div>
								</div>

								{/* Action Buttons on Hover */}
								<div className="border-t border-gray-100 px-5 py-3 flex items-center gap-2 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										onClick={(e) => {
											e.stopPropagation();
											openEditModal(page);
										}}
										className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
									>
										<Edit size={14} />
										Edit
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											window.open(`https://${project.subdomain}.yourdomain.com${page.slug}`, '_blank');
										}}
										className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
									>
										<ExternalLink size={14} />
										View
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="space-y-3">
						{filteredPages.map((page, index) => (
							<div
								key={page.id}
								className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer border border-gray-200"
								onClick={() => {
									navigate(`/projects/${project.id}/pages/${page.id}/editor`);
								}}
							>
								<div className="p-3 md:p-5 flex items-center gap-2 md:gap-4">
									{/* Icon Circle */}
									<div
										className={`w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gradient-to-r ${gradients[index % gradients.length]} flex items-center justify-center flex-shrink-0`}
									>
										<span className="text-2xl md:text-3xl">{page.icon || '📄'}</span>
									</div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1 flex-wrap">
											<h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
												{page.name}
											</h3>
											<span
												className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${
													page.status === 'published'
														? 'bg-green-100 text-green-700'
														: 'bg-yellow-100 text-yellow-700'
												}`}
											>
												{page.status === 'published' ? 'Published' : 'Draft'}
											</span>
										</div>
										<p className="text-sm text-gray-600 mb-2 line-clamp-1 hidden sm:block">{page.title}</p>
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
											<span className="flex items-center gap-1 truncate">
												<FileText size={12} />
												<span className="truncate">{page.slug}</span>
											</span>
											<span className="flex items-center gap-1 hidden sm:flex">
												<Calendar size={12} />
												Updated {getTimeSince(page.updated_at)}
											</span>
										</div>
									</div>

									{/* Actions */}
									<div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
										<button
											onClick={(e) => {
												e.stopPropagation();
												openEditModal(page);
											}}
											className="p-1.5 md:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors hidden sm:block"
											title="Edit"
										>
											<Edit size={16} className="md:w-[18px] md:h-[18px]" />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												window.open(`https://${project.subdomain}.yourdomain.com${page.slug}`, '_blank');
											}}
											className="p-1.5 md:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors hidden sm:block"
											title="Open"
										>
											<ExternalLink size={16} className="md:w-[18px] md:h-[18px]" />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												const rect = e.currentTarget.getBoundingClientRect();
												setContextMenuPosition({
													top: rect.bottom + window.scrollY + 5,
													left: rect.left + window.scrollX - 150,
												});
												setSelectedPage(page.id);
											}}
											className="p-1.5 md:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
											title="More"
										>
											<MoreVertical size={16} className="md:w-[18px] md:h-[18px]" />
										</button>
										<ChevronRight
											size={18}
											className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all ml-1 md:ml-2 hidden sm:block md:w-5 md:h-5"
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Empty State */}
				{filteredPages.length === 0 && (
					<div className="text-center py-16">
						<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FileText size={40} className="text-gray-400" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							{searchQuery ? 'No pages found' : 'No pages yet'}
						</h3>
						<p className="text-gray-600 mb-6">
							{searchQuery ? 'Try adjusting your search terms' : 'Create your first landing page to get started'}
						</p>
						{!searchQuery && (
							<button
								onClick={() => setIsAddPageModalOpen(true)}
								className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-blue-500/30"
							>
								<Plus size={20} />
								Create Your First Page
							</button>
						)}
					</div>
				)}
			</div>

			{/* Context Menu */}
			{selectedPage && contextMenuPosition && (
				<div
					className="fixed inset-0 z-50 animate-fadeIn"
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) {
							(e.currentTarget as HTMLElement).dataset.mousedownOutside = 'true';
						}
					}}
					onClick={(e) => {
						const target = e.currentTarget as HTMLElement;
						if (e.target === e.currentTarget && target.dataset.mousedownOutside === 'true') {
							setSelectedPage(null);
							setContextMenuPosition(null);
						}
						delete target.dataset.mousedownOutside;
					}}
				>
					<div
						className="absolute bg-white rounded-xl shadow-2xl p-2 w-48 animate-slideIn"
						style={{
							top: `${contextMenuPosition.top}px`,
							left: `${contextMenuPosition.left}px`,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => {
								const page = pages.find((p) => p.id === selectedPage);
								if (page) {
									openEditModal(page);
								}
							}}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3"
						>
							<Edit size={16} />
							Edit Page
						</button>
						<button
							onClick={() => {
								const page = pages.find((p) => p.id === selectedPage);
								if (page) {
									navigator.clipboard.writeText(`https://${project.subdomain}.yourdomain.com${page.slug}`);
									toast.success('Link copied to clipboard!');
								}
								setSelectedPage(null);
								setContextMenuPosition(null);
							}}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3"
						>
							<Copy size={16} />
							Copy Link
						</button>
						<button
							onClick={() => {
								const page = pages.find((p) => p.id === selectedPage);
								if (page) {
									window.open(`https://${project.subdomain}.yourdomain.com${page.slug}`, '_blank');
								}
								setSelectedPage(null);
								setContextMenuPosition(null);
							}}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3"
						>
							<ExternalLink size={16} />
							Open in New Tab
						</button>
						<button
							onClick={() => {
								const page = pages.find((p) => p.id === selectedPage);
								if (page) {
									togglePageStatus(page);
								}
							}}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3"
						>
							<Eye size={16} />
							Toggle Status
						</button>
						<hr className="my-1" />
						<button
							onClick={() => {
								if (selectedPage) {
									handleDeletePage(selectedPage);
								}
							}}
							className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3"
						>
							<Trash2 size={16} />
							Delete
						</button>
					</div>
				</div>
			)}

			{/* Loading Overlay */}
			{isCreating && (
				<div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
					<div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center gap-4">
						<Loader2 size={48} className="animate-spin text-blue-600" />
						<p className="text-gray-700 font-medium">Creating your page...</p>
					</div>
				</div>
			)}

			{/* Add Page Modal */}
			{isAddPageModalOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) {
							(e.currentTarget as HTMLElement).dataset.mousedownOutside = 'true';
						}
					}}
					onClick={(e) => {
						const target = e.currentTarget as HTMLElement;
						if (e.target === e.currentTarget && target.dataset.mousedownOutside === 'true' && !isCreating) {
							setIsAddPageModalOpen(false);
							setNewPage({ name: '', title: '', slug: '' });
						}
						delete target.dataset.mousedownOutside;
					}}
				>
					<div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scaleIn" onClick={(e) => e.stopPropagation()}>
						<h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Page</h2>

						<div className="space-y-4">
							{/* Page Name */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Page Name</label>
								<input
									type="text"
									value={newPage.name}
									onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
									placeholder="About Us"
									disabled={isCreating}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
							</div>

							{/* Page Title */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
								<input
									type="text"
									value={newPage.title}
									onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
									placeholder="Learn more about our company"
									disabled={isCreating}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
							</div>

							{/* Page Slug */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
								<div className="flex items-center gap-2">
									<span className="text-gray-600 font-medium whitespace-nowrap">yourdomain.com/</span>
									<input
										type="text"
										value={newPage.slug}
										onChange={(e) => {
											const normalized = normalizeSlug(e.target.value);
											setNewPage({ ...newPage, slug: normalized });
										}}
										placeholder="about"
										disabled={isCreating}
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
									/>
								</div>
								<p className="text-xs text-gray-500 mt-1">Only letters, numbers, dashes, and slashes (e.g., about, contact)</p>
							</div>
						</div>

						{/* Buttons */}
						<div className="flex items-center gap-3 mt-6">
							<button
								onClick={() => {
									setIsAddPageModalOpen(false);
									setNewPage({ name: '', title: '', slug: '' });
								}}
								disabled={isCreating}
								className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Cancel
							</button>
							<button
								onClick={handleCreatePage}
								disabled={!newPage.name || !newPage.title || !newPage.slug || isCreating}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isCreating ? (
									<>
										<Loader2 size={18} className="animate-spin" />
										Creating...
									</>
								) : (
									'Create Page'
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Page Modal */}
			{isEditPageModalOpen && editingPage && (
				<div
					className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) {
							(e.currentTarget as HTMLElement).dataset.mousedownOutside = 'true';
						}
					}}
					onClick={(e) => {
						const target = e.currentTarget as HTMLElement;
						if (e.target === e.currentTarget && target.dataset.mousedownOutside === 'true' && !isUpdating) {
							setIsEditPageModalOpen(false);
							setEditingPage(null);
						}
						delete target.dataset.mousedownOutside;
					}}
				>
					<div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scaleIn" onClick={(e) => e.stopPropagation()}>
						<h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Page</h2>

						<div className="space-y-4">
							{/* Page Name */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Page Name</label>
								<input
									type="text"
									value={editingPage.name}
									onChange={(e) => setEditingPage({ ...editingPage, name: e.target.value })}
									placeholder="About Us"
									disabled={isUpdating}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
							</div>

							{/* Page Title */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
								<input
									type="text"
									value={editingPage.title}
									onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
									placeholder="Learn more about our company"
									disabled={isUpdating}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
							</div>

							{/* Page Slug */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
								<div className="flex items-center gap-2">
									<span className="text-gray-600 font-medium whitespace-nowrap">yourdomain.com/</span>
									<input
										type="text"
										value={editingPage.slug}
										onChange={(e) => {
											const normalized = normalizeSlug(e.target.value);
											setEditingPage({ ...editingPage, slug: normalized });
										}}
										placeholder="about"
										disabled={isUpdating}
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
									/>
								</div>
								<p className="text-xs text-gray-500 mt-1">Only letters, numbers, dashes, and slashes (e.g., about, contact)</p>
							</div>

							{/* Status */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
								<div className="flex items-center gap-4">
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="status"
											value="published"
											checked={editingPage.status === 'published'}
											onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as 'published' | 'draft' })}
											disabled={isUpdating}
											className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
										/>
										<span className="text-sm text-gray-700">Published</span>
									</label>
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="status"
											value="draft"
											checked={editingPage.status === 'draft'}
											onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as 'published' | 'draft' })}
											disabled={isUpdating}
											className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
										/>
										<span className="text-sm text-gray-700">Draft</span>
									</label>
								</div>
							</div>
						</div>

						{/* Buttons */}
						<div className="flex items-center gap-3 mt-6">
							<button
								onClick={() => {
									setIsEditPageModalOpen(false);
									setEditingPage(null);
								}}
								disabled={isUpdating}
								className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Cancel
							</button>
							<button
								onClick={handleUpdatePage}
								disabled={!editingPage.name || !editingPage.title || !editingPage.slug || isUpdating}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isUpdating ? (
									<>
										<Loader2 size={18} className="animate-spin" />
										Saving...
									</>
								) : (
									'Save Changes'
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Loading Overlay for Update */}
			{isUpdating && (
				<div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
					<div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center gap-4">
						<Loader2 size={48} className="animate-spin text-blue-600" />
						<p className="text-gray-700 font-medium">Updating your page...</p>
					</div>
				</div>
			)}

			{/* Publish Pages Modal */}
			{isPublishModalOpen && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200">
							<h2 className="text-xl font-bold text-gray-900">Опубликовать страницы</h2>
							<p className="text-sm text-gray-600 mt-1">Выберите страницы для публикации</p>
						</div>

						<div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
							{/* Select All */}
							<div className="mb-4">
								<label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
									<input
										type="checkbox"
										checked={selectedPageIds.length === pages.length}
										onChange={toggleAllPages}
										className="w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500 rounded"
									/>
									<span className="font-medium text-gray-900">
										Выбрать все ({pages.length})
									</span>
								</label>
							</div>

							{/* Page List */}
							<div className="space-y-2">
								{pages.map((page) => (
									<label
										key={page.id}
										className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 cursor-pointer transition-colors"
									>
										<input
											type="checkbox"
											checked={selectedPageIds.includes(page.id)}
											onChange={() => togglePageSelection(page.id)}
											className="w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500 rounded"
										/>
										<div className="flex-1">
											<div className="font-medium text-gray-900">{page.name}</div>
											<div className="text-sm text-gray-500">/{page.slug}</div>
										</div>
										<div className={`px-2 py-1 rounded text-xs font-medium ${
											page.status === 'published'
												? 'bg-green-100 text-green-700'
												: 'bg-yellow-100 text-yellow-700'
										}`}>
											{page.status}
										</div>
									</label>
								))}
							</div>

							{pages.length === 0 && (
								<div className="text-center py-8 text-gray-500">
									Нет доступных страниц для публикации
								</div>
							)}
						</div>

						{/* Buttons */}
						<div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
							<button
								onClick={() => {
									setIsPublishModalOpen(false);
									setSelectedPageIds([]);
								}}
								disabled={isPublishing}
								className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Отмена
							</button>
							<button
								onClick={handlePublishPages}
								disabled={selectedPageIds.length === 0 || isPublishing}
								className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isPublishing ? (
									<>
										<Loader2 size={18} className="animate-spin" />
										Публикация...
									</>
								) : (
									<>
										<Upload size={18} />
										Опубликовать ({selectedPageIds.length})
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export { ProjectPagesPage };
