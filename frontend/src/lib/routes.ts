import { createBrowserRouter, redirect } from 'react-router';

import { RootLayout } from '@/views/layouts/root';
import { AuthLayout } from '@/views/layouts/auth';
import { HomeLayout } from '@/views/layouts/home';

import { LoginPage } from '@/views/pages/login';
import { RegisterPage } from '@/views/pages/register';
import { HomePage } from '@/views/pages/home';
import { ProjectsPage } from '@/views/pages/projects';
import { ProjectPagesPage } from '@/views/pages/project-pages';
import { PageEditorPage } from '@/views/pages/page-editor';
import { ZeroBlockEditorPage } from '@/views/pages/zeroblock-editor';
import { AdminPage } from '@/views/pages/admin';
import { ErrorPage } from '@/views/pages/error';

import { projectsLoader, projectPagesLoader, pageEditorLoader, zeroBlockEditorLoader } from './loaders';

const router = createBrowserRouter([
	{
		Component: RootLayout,
		children: [
			{
				path: '/',
				loader: () => redirect('/projects'),
			},
			{
				path: 'projects',
				Component: ProjectsPage,
				loader: projectsLoader,
			},
			{
				path: 'projects/:projectId/pages',
				Component: ProjectPagesPage,
				loader: projectPagesLoader,
			},
			{
				path: 'projects/:projectId/pages/:pageId/editor',
				Component: PageEditorPage,
				loader: pageEditorLoader,
			},
			{
				path: 'projects/:projectId/pages/:pageId/blocks/:blockId/zeroblock-editor',
				Component: ZeroBlockEditorPage,
				loader: zeroBlockEditorLoader,
			},
			{
				path: 'admin',
				Component: AdminPage,
			},
			{
				path: 'auth',
				Component: AuthLayout,
				children: [
					{ path: 'login', Component: LoginPage },
					{ path: 'register', Component: RegisterPage },
				],
			},
		],
		ErrorBoundary: ErrorPage,
	},
]);

export default router;

