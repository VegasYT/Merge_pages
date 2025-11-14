import { redirect, LoaderFunctionArgs } from 'react-router';
import apiClient from './services/client';

interface Project {
	id: number;
	user_id: number;
	subdomain: string;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
}

interface Page {
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

// Loader для загрузки списка проектов
export async function projectsLoader() {
	try {
		console.log('📦 Projects loader: Loading projects...');
		const { data } = await apiClient.get<Project[]>('/projects');
		console.log('✅ Projects loader: Successfully loaded', data.length, 'projects');
		return data;
	} catch (error: any) {
		console.error('❌ Projects loader failed:', error);
		console.error('Error status:', error.response?.status);
		console.error('Error data:', error.response?.data);
		// Если ошибка авторизации, редирект на логин
		throw redirect('/auth/login');
	}
}

// Loader для загрузки проекта и его страниц
export async function projectPagesLoader({ params }: LoaderFunctionArgs) {
	try {
		const projectId = params.projectId;
		if (!projectId) {
			throw new Error('Project ID is required');
		}

		console.log('📦 Project pages loader: Loading project', projectId, 'and pages...');

		// Загружаем проект и его страницы параллельно
		const [projectResponse, pagesResponse] = await Promise.all([
			apiClient.get<Project>(`/projects/${projectId}`),
			apiClient.get<Page[]>(`/projects/${projectId}/pages`),
		]);

		console.log('✅ Project pages loader: Successfully loaded project and', pagesResponse.data.length, 'pages');

		return {
			project: projectResponse.data,
			pages: pagesResponse.data,
		};
	} catch (error: any) {
		console.error('❌ Project pages loader failed:', error);
		console.error('Error status:', error.response?.status);
		console.error('Error data:', error.response?.data);
		// Если ошибка авторизации, редирект на логин
		throw redirect('/auth/login');
	}
}
