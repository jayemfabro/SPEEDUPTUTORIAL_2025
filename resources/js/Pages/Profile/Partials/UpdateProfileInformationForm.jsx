import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Camera, User, Calendar, Upload } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);
    
    // Use the profile_photo_url from user object or fallback to a default image
    const photoUrl = user.profile_photo_url || '/Logo/SpeedUp.png';
    console.log("Current user photo URL:", photoUrl);
    
    const [preview, setPreview] = useState(photoUrl);

    // Helper function to convert date format to yyyy-MM-dd
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        
        // If it's already in yyyy-MM-dd format, return as is
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        
        // If it's in MM/dd/yyyy format, convert it
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const [month, day, year] = parts;
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
        
        return '';
    };
    
    const { data, setData, errors, reset, clearErrors } = useForm({
        name: user.name || '',
        email: user.email || '',
        birthdate: formatDateForInput(user.birthdate),
        photo: null,
    });
    
    // Add these states since we're no longer using Inertia's built-in processing state
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    
    // Clear all errors when component mounts or when data changes
    useEffect(() => {
        // This ensures any errors from previous form submissions are cleared
        if (Object.keys(errors).length > 0) {
            clearErrors();
        }
    }, [data.name, data.email, errors, clearErrors]); // Re-run when name or email changes

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
        
        // Set processing to true to show the loading state
        setProcessing(true);
        
        // Basic form validation before submission
        if (!data.name || !data.email) {
            // If validation fails, set errors and return
            if (!data.name) errors.name = 'The name field is required.';
            if (!data.email) errors.email = 'The email field is required.';
            setProcessing(false);
            return;
        }
        
        // Create FormData object to properly handle file uploads
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        formData.append('name', data.name);
        formData.append('email', data.email);
        if (data.birthdate) {
            formData.append('birthdate', data.birthdate);
        }
        if (data.photo) {
            formData.append('photo', data.photo);
        }
        
        // Clear any existing errors
        clearErrors();
        
        try {
            // Use direct fetch to submit the form - bypassing the Inertia validation issues
            fetch(route('profile.update'), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            })
            .then(response => {
                // Check if the response is JSON
                const contentType = response.headers.get('content-type');
                const isJson = contentType && contentType.includes('application/json');
                
                if (response.ok) {
                    // Success case
                    setRecentlySuccessful(true);
                    
                    if (data.photo) {
                        // For profile photo updates, we need to reload the page
                        // to get the new photo URL from the server
                        console.log("Photo was uploaded successfully, reloading page...");
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        // Just reset the photo field if no new photo was uploaded
                        reset('photo');
                        
                        // Hide success message after 2.5 seconds
                        setTimeout(() => {
                            setRecentlySuccessful(false);
                        }, 2500);
                    }
                } 
                else if (isJson) {
                    // Get JSON validation errors
                    return response.json().then(data => {
                        if (data.errors) {
                            // Set validation errors from server
                            for (const [key, value] of Object.entries(data.errors)) {
                                const errorMessage = Array.isArray(value) ? value[0] : value;
                                // Use setData to force a UI update
                                setData(key, data[key]);
                                // Set the error message
                                errors[key] = errorMessage;
                            }
                        } else if (data.message) {
                            console.error('Server error:', data.message);
                        }
                    });
                } 
                else {
                    // Non-JSON error
                    console.error('Server returned an error:', response.status, response.statusText);
                }
            })
            .catch(error => {
                console.error('Network or parsing error:', error);
            })
            .finally(() => {
                // Always turn off processing state
                setProcessing(false);
            });
        } catch (error) {
            console.error('Exception during form submission:', error);
            setProcessing(false);
        }
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
                                className={`w-full border-navy-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                    if (errors.name) clearErrors('name');
                                }}
                                onBlur={() => {
                                    if (!data.name.trim()) {
                                        // Only for UI feedback, server will also validate
                                        setData('name', data.name.trim());
                                    }
                                }}
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
                                className={`w-full border-navy-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                                value={data.email}
                                onChange={(e) => {
                                    setData('email', e.target.value);
                                    if (errors.email) clearErrors('email');
                                }}
                                onBlur={() => {
                                    if (!data.email.trim()) {
                                        // Only for UI feedback, server will also validate
                                        setData('email', data.email.trim());
                                    }
                                }}
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
                            className={`w-full border-navy-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-lg ${errors.birthdate ? 'border-red-500' : ''}`}
                            value={data.birthdate || ''}
                            onChange={(e) => {
                                setData('birthdate', e.target.value);
                                if (errors.birthdate) clearErrors('birthdate');
                            }}
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
                    
                    {/* Error Message Summary - We'll show a different message while processing */}
                    {(errors.name || errors.email || errors.birthdate || errors.photo) && !processing && (
                        <div className="mr-4 inline-flex items-center px-4 py-2 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-lg">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Please fix the errors above
                        </div>
                    )}
                    
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
