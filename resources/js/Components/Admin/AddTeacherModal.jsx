import React, { useRef, useState, useEffect } from "react";
import { X, Camera, Eye, EyeOff } from "lucide-react";
import { Transition } from "@headlessui/react";

const AddTeacherModal = ({
    isOpen,
    onClose,
    onSubmit,
    teacherForm,
    onInputChange,
}) => {
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setPassword('');
            setConfirmPassword('');
            setPreviewImage(null);
            setPasswordsMatch(true);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    useEffect(() => {
        // Validate passwords match when either field changes
        if (password && confirmPassword) {
            setPasswordsMatch(password === confirmPassword);
        } else {
            setPasswordsMatch(true);
        }
    }, [password, confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setPasswordsMatch(false);
            return;
        }

        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            // Create form data object
            const formData = {
                ...teacherForm,
                password: password
            };
            
            // Call the onSubmit function passed from parent
            await onSubmit(formData);
            
            // Reset form on success
            setPassword('');
            setConfirmPassword('');
            setPreviewImage(null);
            setPasswordsMatch(true);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                onInputChange({
                    target: {
                        name: "image",
                        value: file,
                    },
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };
    return (
        <Transition show={isOpen} as={React.Fragment}>
            <div className="fixed inset-0 overflow-y-auto z-50">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            className="fixed inset-0 transition-opacity"
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                    </Transition.Child>

                    <span
                        className="hidden sm:inline-block sm:align-middle sm:h-screen"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>

                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-gradient-to-r from-navy-700 to-navy-800 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-white">
                                    Add New Teacher
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="bg-navy-600 rounded-full p-1 text-gray-300 hover:text-white focus:outline-none transition-colors duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
                                    <div className="space-y-4">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            {/* Profile Image Upload */}
                                            <div className="flex flex-col items-center">
                                                <div className="relative group">
                                                    <div
                                                        className="h-56 w-56 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-orange-400 transition-colors duration-200"
                                                        onClick={triggerFileInput}
                                                    >
                                                        {previewImage ? (
                                                            <img
                                                                src={previewImage}
                                                                alt="Preview"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="text-center p-4">
                                                                <Camera className="mx-auto h-12 w-12 text-gray-400 group-hover:text-orange-500 mb-3" />
                                                                <span className="text-sm text-gray-500 group-hover:text-orange-500">
                                                                    Click to upload
                                                                </span>
                                                                <p className="mt-2 text-xs text-gray-500">
                                                    JPG, PNG up to 2MB
                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleImageChange}
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                </div>
                                            </div>

                                            {/* Name Fields */}
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <label
                                                        htmlFor="firstName"
                                                        className="block text-sm font-medium text-gray-700"
                                                    >
                                                        First Name *
                                                    </label>
                                                    <div className="mt-1">
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            id="firstName"
                                                            required
                                                            value={
                                                                teacherForm.firstName ||
                                                                ""
                                                            }
                                                            onChange={onInputChange}
                                                            className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="middleName"
                                                        className="block text-sm font-medium text-gray-700"
                                                    >
                                                        Middle Name
                                                    </label>
                                                    <div className="mt-1">
                                                        <input
                                                            type="text"
                                                            name="middleName"
                                                            id="middleName"
                                                            value={
                                                                teacherForm.middleName ||
                                                                ""
                                                            }
                                                            onChange={onInputChange}
                                                            className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="lastName"
                                                        className="block text-sm font-medium text-gray-700"
                                                    >
                                                        Last Name *
                                                    </label>
                                                    <div className="mt-1">
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            id="lastName"
                                                            required
                                                            value={
                                                                teacherForm.lastName ||
                                                                ""
                                                            }
                                                            onChange={onInputChange}
                                                            className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="email"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Email *
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        required
                                                        value={
                                                            teacherForm.email ||
                                                            ""
                                                        }
                                                        onChange={onInputChange}
                                                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
                                                    />
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="birthdate"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Birthdate *
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="date"
                                                        name="birthdate"
                                                        id="birthdate"
                                                        required
                                                        value={
                                                            teacherForm.birthdate ||
                                                            ""
                                                        }
                                                        onChange={onInputChange}
                                                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
                                                    />
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="username"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Username *
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        id="username"
                                                        required
                                                        value={
                                                            teacherForm.username ||
                                                            ""
                                                        }
                                                        onChange={onInputChange}
                                                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
                                                    />
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="phone"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Phone
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        id="phone"
                                                        value={
                                                            teacherForm.phone ||
                                                            ""
                                                        }
                                                        onChange={onInputChange}
                                                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
                                                    />
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="password"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Password *
                                                </label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        id="password"
                                                        required
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="confirmPassword"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Confirm Password *
                                                </label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        id="confirmPassword"
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className={`shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-${passwordsMatch ? 'gray-300' : 'red-500'} rounded-md h-10 px-3 pr-10`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                {!passwordsMatch && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        Passwords do not match
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={!passwordsMatch || !password || !confirmPassword || isSubmitting}
                                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 ${
                                            !passwordsMatch || !password || !confirmPassword || isSubmitting
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                        }`}
                                    >
                                        {isSubmitting ? 'Adding...' : 'Add Teacher'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Transition.Child>
                </div>
            </div>
        </Transition>
    );
};

export default AddTeacherModal;
