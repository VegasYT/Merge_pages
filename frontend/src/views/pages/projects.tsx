import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { Plus, Search, Globe, Calendar, Edit, Trash2, ExternalLink, ChevronRight, MoreVertical, Copy, Loader2 } from 'lucide-react';
import { createProject, updateProject } from '@/lib/services/projects';
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

const ProjectsPage = () => {
	const initialProjects = useLoaderData() as Project[];
	const navigate = useNavigate();
	const [projects, setProjects] = useState<Project[]>(initialProjects);
	const [searchQuery, setSearchQuery] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [selectedProject, setSelectedProject] = useState<number | null>(null);
	const [contextMenuPosition, setContextMenuPosition] = useState<{ top: number; left: number } | null>(null);
	const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
	const [newProject, setNewProject] = useState({ name: '', subdomain: '', description: '' });
	const [isCreating, setIsCreating] = useState(false);
	const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
	const [editingProject, setEditingProject] = useState<Project | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const filteredProjects = projects.filter(project =>
		project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
		project.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
	);

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

	const handleCreateProject = async () => {
		if (!newProject.name || !newProject.subdomain) {
			toast.error('Please fill in all required fields');
			return;
		}

		setIsCreating(true);
		try {
			const createdProject = await createProject({
				name: newProject.name,
				subdomain: newProject.subdomain,
				description: newProject.description,
			});

			// Add new project to the list
			setProjects([createdProject, ...projects]);

			// Close modal and reset form
			setIsAddProjectModalOpen(false);
			setNewProject({ name: '', subdomain: '', description: '' });

			toast.success('Project created successfully!');
		} catch (error: any) {
			console.error('Error creating project:', error);
			toast.error(error.response?.data?.message || 'Failed to create project. Please try again.');
		} finally {
			setIsCreating(false);
		}
	};

	const handleUpdateProject = async () => {
		if (!editingProject || !editingProject.name || !editingProject.subdomain) {
			toast.error('Please fill in all required fields');
			return;
		}

		setIsUpdating(true);
		try {
			const updatedProject = await updateProject(editingProject.id, {
				name: editingProject.name,
				subdomain: editingProject.subdomain,
				description: editingProject.description,
			});

			// Update project in the list
			setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));

			// Close modal and reset form
			setIsEditProjectModalOpen(false);
			setEditingProject(null);

			toast.success('Project updated successfully!');
		} catch (error: any) {
			console.error('Error updating project:', error);
			toast.error(error.response?.data?.message || 'Failed to update project. Please try again.');
		} finally {
			setIsUpdating(false);
		}
	};

	const openEditModal = (project: Project) => {
		setEditingProject({ ...project });
		setIsEditProjectModalOpen(true);
		setSelectedProject(null);
		setContextMenuPosition(null);
	};

	return (
		<div className="standard-tailwind-styles min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-xl md:text-2xl font-bold text-gray-900">My Projects</h1>
							<p className="text-xs md:text-sm text-gray-600 mt-1 hidden sm:block">Manage your landing pages</p>
						</div>

						<button
							onClick={() => setIsAddProjectModalOpen(true)}
							className="px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-1.5 md:gap-2 shadow-lg shadow-blue-500/30 text-sm md:text-base"
						>
							<Plus size={18} className="md:w-5 md:h-5" />
							<span className="hidden sm:inline">New Project</span>
							<span className="sm:hidden">New</span>
						</button>
					</div>

					{/* Search and Filters */}
					<div className="mt-4 md:mt-6 flex items-center gap-2 md:gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
							<input
								type="text"
								placeholder="Search projects..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-9 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
							/>
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

			{/* Projects Count */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
				<p className="text-xs md:text-sm text-gray-600">
					{filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
					{searchQuery && ' found'}
				</p>
			</div>

			{/* Projects Grid/List */}
			<div className="max-w-7xl mx-auto px-4 md:px-6 pb-8 md:pb-12">
				{viewMode === 'grid' ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredProjects.map((project, index) => (
							<div
								key={project.id}
								className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200"
								onClick={() => {
									navigate(`/projects/${project.id}/pages`);
								}}
							>
								{/* Gradient Header */}
								<div className={`h-32 bg-gradient-to-r ${gradients[index % gradients.length]} relative overflow-hidden`}>
									<div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
									<div className="absolute bottom-3 left-4 right-4">
										<div className="flex items-center gap-2 text-white/90 text-xs font-medium">
											<Globe size={14} />
											<span className="truncate">{project.subdomain}.yourdomain.com</span>
										</div>
									</div>
								</div>

								{/* Content */}
								<div className="p-5">
									<div className="flex items-start justify-between mb-3">
										<h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
											{project.name}
										</h3>
										<button
											onClick={(e) => {
												e.stopPropagation();
												const rect = e.currentTarget.getBoundingClientRect();
												setContextMenuPosition({
													top: rect.bottom + window.scrollY + 5,
													left: rect.left + window.scrollX - 150,
												});
												setSelectedProject(project.id);
											}}
											className="p-1 hover:bg-gray-100 rounded transition-colors"
										>
											<MoreVertical size={18} className="text-gray-400" />
										</button>
									</div>

									<p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>

									<div className="flex items-center justify-between text-xs text-gray-500">
										<div className="flex items-center gap-1">
											<Calendar size={14} />
											<span>Updated {getTimeSince(project.updated_at)}</span>
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
											openEditModal(project);
										}}
										className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
									>
										<Edit size={14} />
										Edit
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											window.open(`https://${project.subdomain}.yourdomain.com`, '_blank');
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
						{filteredProjects.map((project, index) => (
							<div
								key={project.id}
								className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer border border-gray-200"
								onClick={() => {
									navigate(`/projects/${project.id}/pages`);
								}}
							>
								<div className="p-3 md:p-5 flex items-center gap-2 md:gap-4">
									{/* Gradient Circle */}
									<div
										className={`w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gradient-to-r ${gradients[index % gradients.length]} flex items-center justify-center flex-shrink-0`}
									>
										<Globe size={20} className="text-white md:hidden" />
										<Globe size={24} className="text-white hidden md:block" />
									</div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
											{project.name}
										</h3>
										<p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2 line-clamp-1 hidden sm:block">
											{project.description}
										</p>
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
											<span className="flex items-center gap-1 truncate">
												<Globe size={12} />
												<span className="truncate">{project.subdomain}.yourdomain.com</span>
											</span>
											<span className="flex items-center gap-1 hidden sm:flex">
												<Calendar size={12} />
												Updated {getTimeSince(project.updated_at)}
											</span>
										</div>
									</div>

									{/* Actions */}
									<div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
										<button
											onClick={(e) => {
												e.stopPropagation();
												openEditModal(project);
											}}
											className="p-1.5 md:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors hidden sm:block"
											title="Edit"
										>
											<Edit size={16} className="md:w-[18px] md:h-[18px]" />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												window.open(`https://${project.subdomain}.yourdomain.com`, '_blank');
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
												setSelectedProject(project.id);
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
				{filteredProjects.length === 0 && (
					<div className="text-center py-16">
						<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Globe size={40} className="text-gray-400" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							{searchQuery ? 'No projects found' : 'No projects yet'}
						</h3>
						<p className="text-gray-600 mb-6">
							{searchQuery ? 'Try adjusting your search terms' : 'Create your first landing page to get started'}
						</p>
						{!searchQuery && (
							<button
								onClick={() => setIsAddProjectModalOpen(true)}
								className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-blue-500/30"
							>
								<Plus size={20} />
								Create Your First Project
							</button>
						)}
					</div>
				)}
			</div>

			{/* Context Menu */}
			{selectedProject && contextMenuPosition && (
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
							setSelectedProject(null);
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
								const project = projects.find((p) => p.id === selectedProject);
								if (project) {
									openEditModal(project);
								}
							}}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3"
						>
							<Edit size={16} />
							Edit Project
						</button>
						<button
							onClick={() => {
								const project = projects.find((p) => p.id === selectedProject);
								if (project) {
									navigator.clipboard.writeText(`https://${project.subdomain}.yourdomain.com`);
								}
								setSelectedProject(null);
								setContextMenuPosition(null);
							}}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3"
						>
							<Copy size={16} />
							Copy Link
						</button>
						<button
							onClick={() => {
								const project = projects.find((p) => p.id === selectedProject);
								if (project) {
									window.open(`https://${project.subdomain}.yourdomain.com`, '_blank');
								}
								setSelectedProject(null);
								setContextMenuPosition(null);
							}}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3"
						>
							<ExternalLink size={16} />
							Open in New Tab
						</button>
						<hr className="my-1" />
						<button
							onClick={() => {
								console.log('Delete:', selectedProject);
								setSelectedProject(null);
								setContextMenuPosition(null);
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
						<p className="text-gray-700 font-medium">Creating your project...</p>
					</div>
				</div>
			)}

			{/* Add Project Modal */}
			{isAddProjectModalOpen && (
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
							setIsAddProjectModalOpen(false);
							setNewProject({ name: '', subdomain: '', description: '' });
						}
						delete target.dataset.mousedownOutside;
					}}
				>
					<div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scaleIn" onClick={(e) => e.stopPropagation()}>
						<h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h2>

						<div className="space-y-4">
							{/* Project Name */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
								<input
									type="text"
									value={newProject.name}
									onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
									placeholder="My Awesome Project"
									disabled={isCreating}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
							</div>

							{/* Subdomain */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
								<div className="flex items-center gap-2">
									<input
										type="text"
										value={newProject.subdomain}
										onChange={(e) => {
											const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
											setNewProject({ ...newProject, subdomain: value });
										}}
										placeholder="my-project"
										disabled={isCreating}
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
									/>
									<span className="text-gray-600 font-medium whitespace-nowrap">.yourdomain.com</span>
								</div>
								<p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens allowed</p>
							</div>

							{/* Description */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Description <span className="text-gray-400">(optional)</span>
								</label>
								<textarea
									value={newProject.description}
									onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
									placeholder="A brief description of your project..."
									rows={3}
									disabled={isCreating}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
							</div>
						</div>

						{/* Buttons */}
						<div className="flex items-center gap-3 mt-6">
							<button
								onClick={() => {
									setIsAddProjectModalOpen(false);
									setNewProject({ name: '', subdomain: '', description: '' });
								}}
								disabled={isCreating}
								className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Cancel
							</button>
							<button
								onClick={handleCreateProject}
								disabled={!newProject.name || !newProject.subdomain || isCreating}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isCreating ? (
									<>
										<Loader2 size={18} className="animate-spin" />
										Creating...
									</>
								) : (
									'Create Project'
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Project Modal */}
			{isEditProjectModalOpen && editingProject && (
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
							setIsEditProjectModalOpen(false);
							setEditingProject(null);
						}
						delete target.dataset.mousedownOutside;
					}}
				>
					<div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scaleIn" onClick={(e) => e.stopPropagation()}>
						<h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Project</h2>

						<div className="space-y-4">
							{/* Project Name */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
								<input
									type="text"
									value={editingProject.name}
									onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
									placeholder="My Awesome Project"
									disabled={isUpdating}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
							</div>

							{/* Subdomain */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
								<div className="flex items-center gap-2">
									<input
										type="text"
										value={editingProject.subdomain}
										onChange={(e) => {
											const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
											setEditingProject({ ...editingProject, subdomain: value });
										}}
										placeholder="my-project"
										disabled={isUpdating}
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
									/>
									<span className="text-gray-600 font-medium whitespace-nowrap">.yourdomain.com</span>
								</div>
								<p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens allowed</p>
							</div>

							{/* Description */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Description <span className="text-gray-400">(optional)</span>
								</label>
								<textarea
									value={editingProject.description}
									onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
									placeholder="A brief description of your project..."
									rows={3}
									disabled={isUpdating}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
							</div>
						</div>

						{/* Buttons */}
						<div className="flex items-center gap-3 mt-6">
							<button
								onClick={() => {
									setIsEditProjectModalOpen(false);
									setEditingProject(null);
								}}
								disabled={isUpdating}
								className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Cancel
							</button>
							<button
								onClick={handleUpdateProject}
								disabled={!editingProject.name || !editingProject.subdomain || isUpdating}
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
						<p className="text-gray-700 font-medium">Updating your project...</p>
					</div>
				</div>
			)}
		</div>
	);
};

export { ProjectsPage };
