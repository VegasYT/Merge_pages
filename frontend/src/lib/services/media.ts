import apiClient from './client';

// ==================== Media Interfaces ====================

export interface MediaUploadResponse {
	url: string;
	filename?: string;
}

export interface UploadByUrlDto {
	url: string;
}

// ==================== Media API Functions ====================

/**
 * Загрузка файла (изображение, видео и т.д.)
 */
export const uploadMedia = async (file: File): Promise<MediaUploadResponse> => {
	const formData = new FormData();
	formData.append('file', file);

	const response = await apiClient.post<MediaUploadResponse>('/media', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});

	return response.data;
};

/**
 * Загрузка файла по URL
 */
export const uploadMediaByUrl = async (data: UploadByUrlDto): Promise<MediaUploadResponse> => {
	const response = await apiClient.post<MediaUploadResponse>('/media/upload-by-url', data);
	return response.data;
};
