import apiClient from './client';

// ==================== Block Interfaces ====================

export interface Block {
	id: number;
	page_id: number;
	block_template_id: number | null;
	type: 'template' | 'zeroblock';
	position: number;
	settings: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface CreateBlockDto {
	block_template_id?: number | null;
	type: 'template' | 'zeroblock';
	position?: number;
	settings?: Record<string, any>;
}

export interface UpdateBlockDto {
	block_template_id?: number | null;
	position?: number;
	settings?: Record<string, any>;
}

// ==================== Block API Functions ====================

export const getBlocks = async (pageId: number): Promise<Block[]> => {
	const response = await apiClient.get<Block[]>(`/pages/${pageId}/blocks`);
	return response.data;
};

export const getBlock = async (blockId: number): Promise<Block> => {
	const response = await apiClient.get<Block>(`/blocks/${blockId}`);
	return response.data;
};

export const createBlock = async (pageId: number, data: CreateBlockDto): Promise<Block> => {
	const response = await apiClient.post<Block>(`/pages/${pageId}/blocks`, data);
	return response.data;
};

export const updateBlock = async (blockId: number, data: UpdateBlockDto): Promise<Block> => {
	const response = await apiClient.patch<Block>(`/blocks/${blockId}`, data);
	return response.data;
};

export const deleteBlock = async (blockId: number): Promise<void> => {
	await apiClient.delete(`/blocks/${blockId}`);
};

export const updateBlockPosition = async (blockId: number, position: number): Promise<Block> => {
	const response = await apiClient.patch<Block>(`/blocks/${blockId}/position`, { position });
	return response.data;
};
