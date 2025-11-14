import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { AuthToggler } from '@/components/auth-toggler';
import { Button } from '@/components/shared/button';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/shared/field';
import { Input } from '@/components/shared/input';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { registerThenLoginHelper } from '@/lib/services/auth';
import { useAuthStore } from '@/stores';
import { useNavigate } from 'react-router';
import { Spinner } from '@/components/shared/spinner';

const formSchema = z
	.object({
		email: z
			.string()
			.email({ message: 'Введите корректный адрес электронной почты' }),
		password: z
			.string()
			.min(0, { message: 'Пароль должен быть не менее 8 символов' }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword'],
	});

export const RegisterPage = () => {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async (form) =>
			register.mutate({
				email: form.value.email,
				password: form.value.password,
			}),
	});

	const register = useMutation({
		mutationKey: ['register-mutation'],
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			registerThenLoginHelper({ email, password }),
		onSuccess: (data) => {
			toast.success('Успешная регистрация. Добро пожаловать!');
			useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
			navigate('/projects');
		},
		onError: () => {
			form.setFieldValue('password', '');
			form.setFieldValue('confirmPassword', '');
			toast.error(
				'Непредвиденная ошибка регистрации. Пожалуйста, проверьте свои данные и повторите попытку позже'
			);
		},
	});

	return (
		<div className='top-1/2 left-1/2 absolute flex flex-col gap-8 w-3/5 -translate-1/2'>
			<AuthToggler />

			<form
				id='auth-register'
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

					<form.Field
						name='confirmPassword'
						children={(field) => {
							const isInvalid =
								!field.state.meta.isValid && field.state.meta.isTouched;

							return (
								<Field className='gap-1'>
									<FieldLabel htmlFor={field.name}>Повтор пароля</FieldLabel>
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
							<span className='font-heading text-lg'>Зарегистрироваться</span>
							{register.isPending && <Spinner />}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</div>
	);
};

