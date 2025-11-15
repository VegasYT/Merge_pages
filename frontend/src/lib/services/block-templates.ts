import apiClient from './client';

// ==================== BlockTemplate Interfaces ====================

export interface BlockTemplate {
	id: number;
	category_id: number;
	template_name: string;
	name: string;
	preview_url: string;
	settings: {
		type?: 'html';
		structure?: any[];
		editableElements?: string[];
		editableStyles?: Record<string, any>;
	};
	default_data: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface BlockTemplateCategory {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
}

// ==================== BlockTemplate API Functions ====================

export const getBlockTemplates = async (): Promise<BlockTemplate[]> => {
	const response = await apiClient.get<BlockTemplate[]>('/block-templates');
	return response.data;
};

export const getBlockTemplate = async (templateId: number): Promise<BlockTemplate> => {
	const response = await apiClient.get<BlockTemplate>(`/block-templates/${templateId}`);
	return response.data;
};

export const getBlockTemplateCategories = async (): Promise<BlockTemplateCategory[]> => {
	const response = await apiClient.get<BlockTemplateCategory[]>('/block-templates/categories');
	return response.data;
};

export const getBlockTemplatesByCategory = async (categoryId: number): Promise<BlockTemplate[]> => {
	const response = await apiClient.get<BlockTemplate[]>(`/block-templates/categories/${categoryId}/templates`);
	return response.data;
};
