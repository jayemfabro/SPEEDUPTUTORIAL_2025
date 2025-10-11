import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, User, Diamond, Users, Gem, Check } from 'lucide-react';
import { Transition } from '@headlessui/react';

const AddStudentModal = ({ isOpen, onClose, onSubmit, studentForm, onInputChange }) => {
    // Remove class type dropdown logic
    // Add handler for new purchased class fields
    const handlePurchasedClassChange = (e) => {
        const { name, value } = e.target;
        onInputChange({ target: { name, value: value === "" ? 0 : parseInt(value, 10) } });
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
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                    </Transition.Child>

                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

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
                                <h3 className="text-lg leading-6 font-medium text-white">Add New Student</h3>
                                <button
                                    onClick={onClose}
                                    className="bg-navy-600 rounded-full p-1 text-gray-300 hover:text-white focus:outline-none transition-colors duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={onSubmit}>
                                <div className="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        <div className="sm:col-span-6">
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Full Name
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    required
                                                    value={studentForm.name}
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    required
                                                    value={studentForm.email}
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Purchased Class
                                            </label>
                                            <div className="space-y-2">
                                                {/* Regular */}
                                                <div className="flex items-center">
                                                    <span className="bg-navy-500 text-white border border-blue-700 px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] text-center mr-3">
                                                        Regular
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        name="purchased_class_regular"
                                                        value={studentForm.purchased_class_regular || ''}
                                                        onChange={handlePurchasedClassChange}
                                                        placeholder="0"
                                                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-32 sm:text-sm border-gray-300 rounded-md"
                                                    />
                                                </div>
                                                {/* Premium */}
                                                <div className="flex items-center">
                                                    <span className="bg-orange-500 text-white border border-orange-600 px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] text-center mr-3">
                                                        Premium
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        name="purchased_class_premium"
                                                        value={studentForm.purchased_class_premium || ''}
                                                        onChange={handlePurchasedClassChange}
                                                        placeholder="0"
                                                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-32 sm:text-sm border-gray-300 rounded-md"
                                                    />
                                                </div>
                                                {/* Group */}
                                                <div className="flex items-center">
                                                    <span className="bg-orange-500 text-white border border-orange-600 px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] text-center mr-3">
                                                        Group
                                                    </span>
                                                <input
                                                        type="number"
                                                        min="0"
                                                        name="purchased_class_group"
                                                        value={studentForm.purchased_class_group || ''}
                                                        onChange={handlePurchasedClassChange}
                                                        placeholder="0"
                                                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-32 sm:text-sm border-gray-300 rounded-md"
                                                />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                                    >
                                        Add Student
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
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

export default AddStudentModal;