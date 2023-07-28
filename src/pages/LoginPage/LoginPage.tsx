import Button from '../../components/UI/Button/Button';
import { useForm, SubmitHandler } from 'react-hook-form';
import { db } from '../../config/firebase';
import { useState } from 'react';
import { SpinnerCircular } from 'spinners-react';
import Input from '../../components/UI/Input/Input';
import { setUser } from '../../features/userSlice';
import { useAppDispatch } from '../../hooks/redux-hooks';
import { getDocs, collection } from 'firebase/firestore';
import { IUser } from '../../types/types';
import { Link, useNavigate } from 'react-router-dom';

type FormData = {
	email: string;
	pwd: string;
};

const LoginPage = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [errorMessage, setErrorMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid },
	} = useForm<FormData>({ mode: 'onChange' });

	const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
		setLoading(true);
		try {
			const users = await getDocs(collection(db, 'users'));
			const filteredUsers = users.docs.map((user) => ({ ...user.data(), id: user.id } as IUser));
			const foundUser = filteredUsers.find((user) => user.email === data.email && user.password === data.pwd);
			if (foundUser) {
				dispatch(
					setUser({
						id: foundUser.id,
						name: foundUser.name,
						email: foundUser.email,
						userType: foundUser.userType,
					})
				);
				reset();
				setErrorMessage('');
				navigate('/');
			} else {
				setErrorMessage('User not found');
			}
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			}
		} finally {
			setLoading(false);
		}
	};
	return (
		<div className='flex justify-center items-center flex-col'>
			{loading ? (
				<SpinnerCircular className='pt-40' color='rgb(67 56 202)' />
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col pt-8 gap-3 w-96'>
					<h1 className='text-3xl font-bold text-center'>Sign in to your account</h1>
					<p className='text-red-500 py-2'>{errorMessage}</p>
					<Input
						id='email'
						type='email'
						label='Email'
						errors={errors}
						autoComplete='email'
						placeholder='Your Email'
						register={register('email', {
							required: '*This field is required',
							pattern: {
								value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
								message: '*Please enter a valid email address',
							},
						})}
					/>
					<Input
						id='pwd'
						type='password'
						label='Password'
						errors={errors}
						autoComplete='password'
						placeholder='Your Password'
						register={register('pwd', {
							required: '*This field is required',
							pattern: {
								value: /^\S*$/,
								message: '*Password cannot contain spaces',
							},
							minLength: {
								value: 6,
								message: '*Password must be at least 6 characters long',
							},
						})}
					/>
					<Button disabled={!isValid} className='mt-3' type='submit'>
						Login
					</Button>
					<p className='text-center pt-6'>
						<span className='opacity-70'>Don’t have an account? </span>
						<Link to='/signup' className='text-indigo-400 hover:underline'>
							Sign up
						</Link>
					</p>
				</form>
			)}
		</div>
	);
};

export default LoginPage;
