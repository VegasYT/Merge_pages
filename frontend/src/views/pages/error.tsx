import { Button } from '@/components/shared/button';
import { useNavigate } from 'react-router';

const ErrorPage = () => {
	const navigate = useNavigate();

	return (
		<div className='top-1/2 left-1/2 fixed flex flex-col items-center gap-4 -translate-1/2'>
			<span className='text-xl'>Такой страницы не существует :(</span>
			<Button size='lg' onClick={() => navigate(-1)}>
				Верните меня обратно!
			</Button>
		</div>
	);
};

export { ErrorPage };

