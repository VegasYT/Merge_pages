import apiClient from './client';

// ==================== ZeroBlock Interfaces ====================

export interface ZeroBlock {
	id: number;
	block_id: number;
	created_at: string;
	updated_at: string;
}

export interface ZeroBaseElement {
	id: number;
	type_name: string;
	display_name: string;
	icon: string;
	schema: {
		props: Record<string, any>;
	};
	created_at: string;
}

export interface ZeroLayer {
	id: number;
	zero_block_id: number;
	zero_base_element_id: number;
	data: Record<string, any> | null;
	position: number;
	created_at: string;
}

export interface ZeroBlockResponsive {
	id: number;
	zero_block_id: number;
	width: number;
	height: number | null;
	props: Record<string, any> | null;
	created_at: string;
}

export interface ZeroLayerResponsive {
	id: number;
	zero_layer_id: number;
	zero_block_responsive_id: number;
	x: number | null;
	y: number | null;
	width: number | null;
	height: number | null;
	direction: string | null;
	data: Record<string, any> | null;
	created_at: string;
}

// ==================== DTOs ====================

export interface CreateZeroLayerDto {
	zero_base_element_id: number;
	data?: Record<string, any>;
	position?: number;
}

export interface UpdateZeroLayerDto {
	zero_base_element_id?: number;
	data?: Record<string, any>;
}

export interface CreateZeroBlockResponsiveDto {
	zero_block_id?: number;
	width: number;
	height?: number | null;
	props?: Record<string, any>;
}

export interface UpdateZeroBlockResponsiveDto {
	width?: number;
	height?: number | null;
	props?: Record<string, any>;
}

export interface CreateZeroLayerResponsiveDto {
	zero_block_responsive_id: number;
	zero_block_id?: number;
	x?: number;
	y?: number;
	width?: number | null;
	height?: number | null;
	direction?: string;
	data?: Record<string, any>;
}

export interface UpdateZeroLayerResponsiveDto {
	x?: number | null;
	y?: number | null;
	width?: number | null;
	height?: number | null;
	direction?: string | null;
	data?: Record<string, any> | null;
}

// ==================== ZeroBlock API Functions ====================

export const getZeroBlockByBlockId = async (blockId: number): Promise<ZeroBlock> => {
	const response = await apiClient.get<ZeroBlock>(`/blocks/${blockId}/zero-block`);
	return response.data;
};

export const createZeroBlock = async (blockId: number): Promise<ZeroBlock> => {
	const response = await apiClient.post<ZeroBlock>(`/blocks/${blockId}/zero-block`, {});
	return response.data;
};

// ==================== ZeroBaseElement API Functions ====================

export const getZeroBaseElements = async (): Promise<ZeroBaseElement[]> => {
	const response = await apiClient.get<ZeroBaseElement[]>('/zero-base-elements');
	return response.data;
};

export const getZeroBaseElement = async (elementId: number): Promise<ZeroBaseElement> => {
	const response = await apiClient.get<ZeroBaseElement>(`/zero-base-elements/${elementId}`);
	return response.data;
};

// ==================== ZeroLayer API Functions ====================

export const getZeroLayers = async (zeroBlockId: number): Promise<ZeroLayer[]> => {
	const response = await apiClient.get<ZeroLayer[]>(`/zero-blocks/${zeroBlockId}/layers`);
	return response.data;
};

export const getZeroLayer = async (layerId: number): Promise<ZeroLayer> => {
	const response = await apiClient.get<ZeroLayer>(`/zero-layers/${layerId}`);
	return response.data;
};

export const createZeroLayer = async (zeroBlockId: number, data: CreateZeroLayerDto): Promise<ZeroLayer> => {
	const response = await apiClient.post<ZeroLayer>(`/zero-blocks/${zeroBlockId}/layers`, data);
	return response.data;
};

export const updateZeroLayer = async (layerId: number, data: UpdateZeroLayerDto): Promise<ZeroLayer> => {
	const response = await apiClient.patch<ZeroLayer>(`/zero-layers/${layerId}`, data);
	return response.data;
};

export const updateZeroLayerPosition = async (layerId: number, position: number): Promise<ZeroLayer> => {
	const response = await apiClient.patch<ZeroLayer>(`/zero-layers/${layerId}/position`, { position });
	return response.data;
};

export const deleteZeroLayer = async (layerId: number): Promise<void> => {
	await apiClient.delete(`/zero-layers/${layerId}`);
};

// ==================== ZeroBlockResponsive API Functions ====================

export const getZeroBlockResponsiveSettings = async (zeroBlockId: number): Promise<ZeroBlockResponsive[]> => {
	const response = await apiClient.get<ZeroBlockResponsive[]>(`/zero-blocks/${zeroBlockId}/responsive`);
	return response.data;
};

export const getZeroBlockResponsive = async (responsiveId: number): Promise<ZeroBlockResponsive> => {
	const response = await apiClient.get<ZeroBlockResponsive>(`/zero-block-responsive/${responsiveId}`);
	return response.data;
};

export const createZeroBlockResponsive = async (zeroBlockId: number, data: Omit<CreateZeroBlockResponsiveDto, 'zero_block_id'>): Promise<ZeroBlockResponsive> => {
	const response = await apiClient.post<ZeroBlockResponsive>(`/zero-blocks/${zeroBlockId}/responsive`, data);
	return response.data;
};

export const updateZeroBlockResponsive = async (responsiveId: number, data: UpdateZeroBlockResponsiveDto): Promise<ZeroBlockResponsive> => {
	const response = await apiClient.patch<ZeroBlockResponsive>(`/zero-block-responsive/${responsiveId}`, data);
	return response.data;
};

export const deleteZeroBlockResponsive = async (responsiveId: number): Promise<void> => {
	await apiClient.delete(`/zero-block-responsive/${responsiveId}`);
};

// ==================== ZeroLayerResponsive API Functions ====================

export const getZeroLayerResponsiveSettings = async (layerId: number): Promise<ZeroLayerResponsive[]> => {
	const response = await apiClient.get<ZeroLayerResponsive[]>(`/zero-layers/${layerId}/responsive`);
	return response.data;
};

export const getZeroLayerResponsive = async (responsiveId: number): Promise<ZeroLayerResponsive> => {
	const response = await apiClient.get<ZeroLayerResponsive>(`/zero-layer-responsive/${responsiveId}`);
	return response.data;
};

export const createZeroLayerResponsive = async (layerId: number, data: CreateZeroLayerResponsiveDto): Promise<ZeroLayerResponsive> => {
	const response = await apiClient.post<ZeroLayerResponsive>(`/zero-layers/${layerId}/responsive`, data);
	return response.data;
};

export const updateZeroLayerResponsive = async (responsiveId: number, data: UpdateZeroLayerResponsiveDto): Promise<ZeroLayerResponsive> => {
	const response = await apiClient.patch<ZeroLayerResponsive>(`/zero-layer-responsive/${responsiveId}`, data);
	return response.data;
};

export const deleteZeroLayerResponsive = async (responsiveId: number): Promise<void> => {
	await apiClient.delete(`/zero-layer-responsive/${responsiveId}`);
};
