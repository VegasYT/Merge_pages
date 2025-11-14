import { Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';

import { Toaster } from '@/components/shared/sonner';
import { useAuthStore } from '@/stores';

export const RootLayout = () => {
	const navigate = useNavigate();
	const accessToken = useAuthStore((s) => s.accessToken);

	useEffect(() => {
		if (accessToken === null) {
			navigate('/auth/login');
		}
	}, [accessToken, navigate]);

	return (
		<div className='flex-1 p-5 rounded-3xl min-h-0'>
			<Outlet />
			<Toaster />
		</div>
	);
};

