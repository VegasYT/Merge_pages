import { createBrowserRouter } from 'react-router';

import { RootLayout } from '@/views/layouts/root';
import { AuthLayout } from '@/views/layouts/auth';
import { HomeLayout } from '@/views/layouts/home';

import { LoginPage } from '@/views/pages/login';
import { RegisterPage } from '@/views/pages/register';
import { HomePage } from '@/views/pages/home';
import { ProjectsPage } from '@/views/pages/projects';
import { ProjectPagesPage } from '@/views/pages/project-pages';
import { ErrorPage } from '@/views/pages/error';

import { projectsLoader, projectPagesLoader } from './loaders';

const router = createBrowserRouter([
	{
		Component: RootLayout,
		children: [
			{
				path: '/',
				Component: HomeLayout,
				children: [
					{ index: true, Component: HomePage },
				],
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

