import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import AuthIllustration from '@/assets/images/auth-illustration.jpg';
import Logo from '@/assets/images/logo.svg';

export const AuthLayout = () => {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (location.pathname === '/auth')
			navigate('/auth/login', { replace: true });
	}, [location, navigate]);

	return (
		<section className='auth-page-styles flex gap-5 h-full'>
			<div className='relative flex-1 justify-center items-center'>
				<img
					src={Logo}
					alt='Логотип "Landy"'
					className='top-1 left-1 absolute cursor-pointer'
					onClick={() => navigate('/')}
				/>
				<Outlet />
			</div>
			<div className='flex-1 rounded-3xl bg-ring'>
				<img
					src={AuthIllustration}
					alt='Страница авторизации'
					className='rounded-3xl w-full h-full object-cover'
				/>
			</div>
		</section>
	);
};

