import { Link, useLocation } from 'react-router';

const AuthToggler = () => {
	const location = useLocation();

	return (
		<div className='flex flex-col gap-2'>
			<h1 className='font-display text-5xl'>Войти</h1>
			<span className='font-label'>
				{location.pathname === '/auth/login'
					? 'Ещё нет учётной записи?'
					: 'Уже есть учётная запись?'}
				<Link
					className='text-primary hover:underline'
					to={
						location.pathname === '/auth/login'
							? '/auth/register'
							: '/auth/login'
					}
				>
					{location.pathname === '/auth/login'
						? ' Зарегистрироваться!'
						: ' Войти в аккаунт!'}
				</Link>
			</span>
		</div>
	);
};

export { AuthToggler };

