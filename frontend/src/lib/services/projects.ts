import apiClient from './client';

export interface CreateProjectDto {
	name: string;
	subdomain: string;
	description: string;
}

export interface Project {
	id: number;
	user_id: number;
	subdomain: string;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
}

export const createProject = async (data: CreateProjectDto): Promise<Project> => {
	const response = await apiClient.post<Project>('/projects', data);
	return response.data;
};

export const getProjects = async (): Promise<Project[]> => {
	const response = await apiClient.get<Project[]>('/projects');
	return response.data;
};

export interface UpdateProjectDto {
	name?: string;
	subdomain?: string;
	description?: string;
}

export const updateProject = async (projectId: number, data: UpdateProjectDto): Promise<Project> => {
	const response = await apiClient.patch<Project>(`/projects/${projectId}`, data);
	return response.data;
};

export interface PublishPagesDto {
	page_ids: number[];
}

export const publishPages = async (projectId: number, data: PublishPagesDto): Promise<void> => {
	await apiClient.post(`/projects/${projectId}/publish`, data);
};
