import apiClient from './client';

export interface Page {
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

export interface CreatePageDto {
	name: string;
	title: string;
	slug: string;
	icon?: string;
	status?: 'published' | 'draft';
}

export interface UpdatePageDto {
	name?: string;
	title?: string;
	slug?: string;
	icon?: string;
	status?: 'published' | 'draft';
}

export const getPages = async (projectId: number): Promise<Page[]> => {
	const response = await apiClient.get<Page[]>(`/projects/${projectId}/pages`);
	return response.data;
};

export const getPage = async (pageId: number): Promise<Page> => {
	const response = await apiClient.get<Page>(`/pages/${pageId}`);
	return response.data;
};

export const createPage = async (projectId: number, data: CreatePageDto): Promise<Page> => {
	const response = await apiClient.post<Page>(`/projects/${projectId}/pages`, data);
	return response.data;
};

export const updatePage = async (pageId: number, data: UpdatePageDto): Promise<Page> => {
	const response = await apiClient.patch<Page>(`/pages/${pageId}`, data);
	return response.data;
};

export const deletePage = async (pageId: number): Promise<void> => {
	await apiClient.delete(`/pages/${pageId}`);
};

export interface UpdatePageStatusDto {
	status: 'published' | 'draft';
}

export const updatePageStatus = async (pageId: number, data: UpdatePageStatusDto): Promise<Page> => {
	const response = await apiClient.patch<Page>(`/pages/${pageId}/status`, data);
	return response.data;
};
