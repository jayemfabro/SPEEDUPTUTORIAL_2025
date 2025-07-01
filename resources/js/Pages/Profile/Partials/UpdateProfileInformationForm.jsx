import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Camera, User, Calendar, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(user.profile_photo_url || '');

    const { data, setData, patch, errors, processing, recentlySuccessful, reset } =
        useForm({
            name: user.name || '',
            email: user.email || '',
            birthdate: user.birthdate || '',
            photo: null,
        });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setData('photo', file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const submit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('birthdate', data.birthdate);
        if (data.photo) {
            formData.append('photo', data.photo);
        }

        patch(route('profile.update'), formData, {
            preserveScroll: true,
            onSuccess: () => reset('photo'),
        });
    };

    return (
        <section className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
            <header className="border-b border-gray-100 pb-4 mb-6">
                <h2 className="text-xl font-semibold text-navy-800 flex items-center">
                    <User className="h-5 w-5 mr-2 text-orange-500" />
                    Profile Information
                </h2>
                <p className="mt-1 text-sm text-navy-600">
                    Update your account's profile information and contact details.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center space-x-6">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-full bg-navy-100 border-2 border-navy-200 overflow-hidden">
                            {preview ? (
                                <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-navy-200 flex items-center justify-center">
                                    <User className="h-10 w-10 text-navy-400" />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={triggerFileInput}
                            className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors"
                        >
                            <Camera className="h-4 w-4" />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </button>
                    </div>
                    <div>
                        <p className="text-sm text-navy-600 mb-1">Profile Photo</p>
                        <p className="text-xs text-navy-400">JPG, GIF or PNG. Max size 2MB</p>
                        {errors.photo && (
                            <p className="text-xs text-red-500 mt-1">{errors.photo}</p>
                        )}
                    </div>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="name" value="Full Name" className="text-navy-700 text-sm font-medium mb-1" />
                        <div className="relative">
                            <TextInput
                                id="name"
                                className="w-full border-navy-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-lg"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                            />
                            <User className="h-4 w-4 text-navy-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                        <InputError className="mt-1" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email Address" className="text-navy-700 text-sm font-medium mb-1" />
                        <div className="relative">
                            <TextInput
                                id="email"
                                type="email"
                                className="w-full border-navy-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-lg"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                            />
                            <svg className="h-4 w-4 text-navy-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <InputError className="mt-1" message={errors.email} />
                    </div>
                </div>

                {/* Birthdate */}
                <div className="w-full md:w-1/2">
                    <InputLabel htmlFor="birthdate" value="Date of Birth" className="text-navy-700 text-sm font-medium mb-1" />
                    <div className="relative">
                        <TextInput
                            id="birthdate"
                            type="date"
                            className="w-full border-navy-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-lg"
                            value={data.birthdate}
                            onChange={(e) => setData('birthdate', e.target.value)}
                        />
                        <Calendar className="h-4 w-4 text-navy-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <InputError className="mt-1" message={errors.birthdate} />
                </div>

                {/* Email Verification */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-700">
                                    Your email address is unverified.
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="ml-1 font-medium text-amber-700 underline hover:text-amber-600"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <p className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-150"
                        enterFrom="opacity-0 -translate-x-2"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in-out duration-150"
                        leaveFrom="opacity-100 translate-x-0"
                        leaveTo="opacity-0 -translate-x-2"
                        className="mr-4"
                    >
                        <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-100 text-green-700 text-sm font-medium rounded-lg">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Changes saved successfully!
                        </div>
                    </Transition>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`inline-flex items-center px-4 py-2 bg-navy-700 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-navy-800 active:bg-navy-900 focus:outline-none focus:border-navy-900 focus:ring focus:ring-navy-200 disabled:opacity-50 transition ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
}
