import { useForm, SubmitHandler } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFetching } from 'hooks/useFetching';
import { useSubmiting } from 'hooks/useSubmiting';
import { useCountries } from 'hooks/useCountries';
import { getDoc, doc } from 'firebase/firestore';
import { db } from 'config/firebase';
import { updateEvent } from 'services/eventActions';
import { sortedEventTypes } from 'utils/events';
import { IEvent } from 'types/types';
import Input from 'components/UI/Input/Input';
import { inputClasses } from 'utils/styles';
import Button from 'components/UI/Button/Button';
import ToggleButton from 'components/UI/ToogleButton/ToggleButton';
import { SpinnerCircular } from 'spinners-react';
import Select from 'components/UI/Select/Select';

const EditEventPage = () => {
	const { id } = useParams();
	const [activeValue, setActiveValue] = useState(1);
	const { countries, currencies } = useCountries();
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<IEvent>();

	const { fetching: fetchEvent, isLoading } = useFetching(async () => {
		if (id) {
			const docRef = doc(db, 'events', id);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				setValue('name', docSnap.data().name);
				setValue('about', docSnap.data().about);
				setValue('mode', docSnap.data().kind);
				setValue('category', docSnap.data().type);
				setValue('date', docSnap.data().date);
				setValue('freePlaces', docSnap.data().freePlaces);
				if (docSnap.data().kind === 'Offline') {
					setValue('street', docSnap.data().street);
					setValue('city', docSnap.data().city);
					setValue('country', docSnap.data().country);
				} else {
					setValue('link', docSnap.data().link);
				}
				setValue('price', docSnap.data().price);
				setValue('currency', docSnap.data().currency);
				if (docSnap.data().price) {
					setActiveValue(2);
				}
				setValue('totalParticipants', docSnap.data().totalParticipants);
			}
		}
	});

	const { submitting, isSubmitting, error } = useSubmiting(async (data) => {
		if (id) {
			await updateEvent(data, id);
			fetchEvent();
		}
	});

	const onSubmit: SubmitHandler<IEvent> = async (data) => {
		submitting(data);
	};

	useEffect(() => {
		fetchEvent();
	}, []);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className='p-10 max-w-5xl my-0 mx-auto'>
				{isSubmitting || isLoading ? (
					<div className='flex justify-center'>
						<SpinnerCircular className='pt-40' color='rgb(67 56 202)' />
					</div>
				) : (
					<>
						<h1 className='text-4xl font-bold text-white text-center'>Edit your event</h1>
						<div className='pb-12'>
							<div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
								<Input
									label='Event Name'
									id='name'
									autoComplete='off'
									placeholder='Your event'
									register={register('name', { required: true })}
									errors={errors}
									className='sm:col-span-3'
								/>

								<div className='col-span-full'>
									<label htmlFor='about' className='block text-sm font-medium leading-6 text-white'>
										Description
									</label>
									<div className='mt-2'>
										<textarea
											id='about'
											rows={3}
											className={inputClasses}
											{...register('about', { required: true })}
										/>
									</div>
									<p className='mt-3 text-sm leading-6 text-gray-400'>
										Write a few sentences about your event.
									</p>
								</div>
							</div>
						</div>

						<div className='pb-12'>
							<h2 className='text-base font-semibold leading-7 text-white'>Event Information</h2>
							<div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
								<Select
									label='Online/Offline'
									id='kind'
									register={register('mode', { required: true })}
									options={['Online', 'Offline']}
								/>
								<Select
									label='Type of event'
									id='type'
									register={register('category', { required: true })}
									options={[...sortedEventTypes, 'Other']}
								/>

								<Input
									type='datetime-local'
									label='Date and time'
									placeholder='Date and time'
									id='date'
									autoComplete='date'
									register={register('date', { required: true })}
									errors={errors}
									className='sm:col-span-full'
								/>

								{watch('mode') === 'Offline' ? (
									<>
										<Select
											label='Country'
											id='country'
											register={register('country', { required: true })}
											options={[...countries]}
											width='sm:col-span-full'
										/>
										<Input
											label='City'
											placeholder='City'
											id='city'
											autoComplete='city'
											register={register('city', { required: true })}
											errors={errors}
											className='sm:col-span-3 sm:col-start-1'
										/>

										<Input
											label='Street address'
											placeholder='Street address'
											id='street'
											autoComplete='street'
											register={register('street', { required: true })}
											errors={errors}
											className='sm:col-span-3'
										/>
									</>
								) : (
									<Input
										label='Link to event'
										placeholder='Your link to event'
										id='link'
										autoComplete='off'
										register={register('link', { required: false })}
										errors={errors}
										className='sm:col-span-full'
									/>
								)}
								<div className='flex flex-col gap-3'>
									<div className='flex flex-col gap-2'>
										<label className='block text-sm font-medium leading-6 text-white'>Price</label>
										<ToggleButton
											value1='Free'
											value2='Price'
											activeValue={activeValue}
											setActiveValue={setActiveValue}
										/>
									</div>
									{activeValue === 2 && (
										<div className='flex gap-4 items-center w-52'>
											<Input
												label='Price'
												placeholder='Price'
												id='price'
												autoComplete='price'
												register={register('price', { required: true })}
												errors={errors}
											/>
											<Select
												label='Currency'
												id='currency'
												register={register('currency', { required: true })}
												options={[...currencies, 'Other']}
												width='w-36'
											/>
										</div>
									)}
								</div>
								<Input
									label='Maximum number of participants'
									placeholder='Maximum number of participants'
									id='totalParticipants'
									autoComplete='off'
									type='number'
									register={register('totalParticipants', { required: true, valueAsNumber: true })}
									errors={errors}
									className='sm:col-span-2 h-10'
								/>
								<Input
									label='Free spots'
									placeholder='Free spots'
									id='freePlaces'
									autoComplete='off'
									type='number'
									register={register('freePlaces', { required: true, valueAsNumber: true })}
									errors={errors}
									className='sm:col-span-2 h-10'
								/>
							</div>
						</div>
						<div className='pt-5 text-center sm:col-span-2'>
							<p className='text-red-600'>{error}</p>
							<Button className='w-full' type='submit'>
								Update Event
							</Button>
						</div>
					</>
				)}
			</div>
		</form>
	);
};

export default EditEventPage;
