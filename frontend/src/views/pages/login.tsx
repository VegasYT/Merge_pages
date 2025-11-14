import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Input } from '@/components/shared/input';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/shared/field';
import { Button } from '@/components/shared/button';
import { AuthToggler } from '@/components/auth-toggler';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { loginHelper } from '@/lib/services/auth';
import { useAuthStore } from '@/stores';
import { useNavigate } from 'react-router';
import { Spinner } from '@/components/shared/spinner';


// user@example.com
// string


const formSchema = z.object({
	email: z
		.string()
		.email({ message: 'Введите корректный адрес электронной почты' }),
	password: z
		.string()
		.min(0, { message: 'Пароль должен быть не менее 8 символов' }),
});

export const LoginPage = () => {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: (form) =>
			login.mutate({ email: form.value.email, password: form.value.password }),
	});

	const login = useMutation({
		mutationKey: ['login-mutation'],
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			loginHelper({ email, password }),
		onSuccess: (data) => {
			toast.success('Успешный вход. С возвращением!');
			useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
			navigate('/projects');
		},
		onError: () => {
			form.setFieldValue('password', '');
			toast.error('Ошибка входа. Пожалуйста, проверьте свои учетные данные.');
		},
	});

	return (
		<div className='top-1/2 left-1/2 absolute flex flex-col gap-8 w-3/5 -translate-1/2'>
			<AuthToggler />

			<form
				id='auth-login'
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className='flex flex-col gap-5 w-full'
			>
				<FieldGroup>
					<form.Field
						name='email'
						children={(field) => {
							const isInvalid =
								!field.state.meta.isValid && field.state.meta.isTouched;

							return (
								<Field className='gap-1'>
									<FieldLabel htmlFor={field.name}>Эл. почта</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										type='email'
										placeholder='example@email.com'
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>

					<form.Field
						name='password'
						children={(field) => {
							const isInvalid =
								!field.state.meta.isValid && field.state.meta.isTouched;

							return (
								<Field className='gap-1'>
									<FieldLabel htmlFor={field.name}>Пароль</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										type='password'
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>

					<Field>
						<Button type='submit' color='primary hover:' size='lg'>
							<span className='font-heading text-lg'>Войти</span>
							{login.isPending && <Spinner />}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</div>
	);
};

