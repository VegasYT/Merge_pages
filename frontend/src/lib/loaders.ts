import { redirect, LoaderFunctionArgs } from 'react-router';
import apiClient from './services/client';
import { getBlocks, getBlock } from './services/blocks';
import { getBlockTemplates, getBlockTemplateCategories } from './services/block-templates';
import {
	getZeroBlockByBlockId,
	getZeroBaseElements,
	getZeroLayers,
	getZeroBlockResponsiveSettings,
	getZeroLayerResponsiveSettings,
} from './services/zeroblocks';

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

// Loader для загрузки страницы и её блоков для редактора
export async function pageEditorLoader({ params }: LoaderFunctionArgs) {
	try {
		const { projectId, pageId } = params;
		if (!projectId || !pageId) {
			throw new Error('Project ID and Page ID are required');
		}

		console.log('📦 Page editor loader: Loading page', pageId, 'and blocks...');

		// Загружаем проект, страницу, блоки, шаблоны и категории параллельно
		const [projectResponse, pageResponse, blocks, blockTemplates, categories] = await Promise.all([
			apiClient.get<Project>(`/projects/${projectId}`),
			apiClient.get<Page>(`/pages/${pageId}`),
			getBlocks(Number(pageId)),
			getBlockTemplates(),
			getBlockTemplateCategories(),
		]);

		console.log('✅ Page editor loader: Successfully loaded page and', blocks.length, 'blocks');

		return {
			project: projectResponse.data,
			page: pageResponse.data,
			blocks,
			blockTemplates,
			categories,
		};
	} catch (error: any) {
		console.error('❌ Page editor loader failed:', error);
		console.error('Error status:', error.response?.status);
		console.error('Error data:', error.response?.data);
		// Если ошибка авторизации, редирект на логин
		throw redirect('/auth/login');
	}
}

// Loader для загрузки zeroblock editor
export async function zeroBlockEditorLoader({ params }: LoaderFunctionArgs) {
	try {
		const { projectId, pageId, blockId } = params;
		if (!projectId || !pageId || !blockId) {
			throw new Error('Project ID, Page ID, and Block ID are required');
		}

		console.log('📦 ZeroBlock editor loader: Loading block', blockId, '...');

		// Загружаем блок
		const block = await getBlock(Number(blockId));

		// Проверяем, что это zeroblock
		if (block.type !== 'zeroblock') {
			throw new Error('Block is not a zeroblock');
		}

		// Загружаем zeroblock данные и базовые элементы
		let zeroBlock = null;
		let zeroLayers = [];
		let zeroBlockResponsive = [];
		let zeroLayerResponsive = [];

		try {
			zeroBlock = await getZeroBlockByBlockId(Number(blockId));

			// Если zeroblock существует, загружаем все связанные данные
			if (zeroBlock) {
				console.log('ZeroBlock found, loading layers and responsive data...');

				// Сначала загружаем layers и block responsive
				[zeroLayers, zeroBlockResponsive] = await Promise.all([
					getZeroLayers(zeroBlock.id),
					getZeroBlockResponsiveSettings(zeroBlock.id),
				]);

				// Теперь загружаем layer responsive для каждого слоя
				if (zeroLayers.length > 0) {
					const layerResponsivePromises = zeroLayers.map((layer) =>
						getZeroLayerResponsiveSettings(layer.id)
					);
					const layerResponsiveArrays = await Promise.all(layerResponsivePromises);
					// Объединяем все массивы в один
					zeroLayerResponsive = layerResponsiveArrays.flat();
				}

				console.log('Loaded:', {
					layers: zeroLayers.length,
					breakpoints: zeroBlockResponsive.length,
					layerResponsive: zeroLayerResponsive.length,
				});
			}
		} catch (error: any) {
			// Если zeroblock не найден, это нормально - создадим его позже
			if (error.response?.status !== 404) {
				throw error;
			}
			console.log('ZeroBlock not found, will be created');
		}

		const zeroBaseElements = await getZeroBaseElements();
		console.log('Loaded base elements:', zeroBaseElements.length);

		console.log('✅ ZeroBlock editor loader: Successfully loaded all data');

		return {
			block,
			zeroBlock,
			zeroBaseElements,
			zeroLayers,
			zeroBlockResponsive,
			zeroLayerResponsive,
			projectId,
			pageId,
		};
	} catch (error: any) {
		console.error('❌ ZeroBlock editor loader failed:', error);
		console.error('Error status:', error.response?.status);
		console.error('Error data:', error.response?.data);
		// Если ошибка авторизации, редирект на логин
		throw redirect('/auth/login');
	}
}
