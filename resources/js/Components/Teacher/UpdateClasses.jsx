import React from 'react';
import { X } from 'lucide-react';
import { Transition } from '@headlessui/react';

const UpdateClasses = ({ isOpen, onClose, onSubmit, formData, onInputChange }) => {
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
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-gradient-to-r from-navy-700 to-navy-800 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-white">
                                    Update Class
                                </h3>
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
                                        {/* Student Name */}
                                        <div className="sm:col-span-6">
                                            <label htmlFor="student_name" className="block text-sm font-medium text-gray-700">
                                                Student Name
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    name="student_name"
                                                    id="student_name"
                                                    required
                                                    value={formData.student_name || ''}
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        {/* Student Email */}
                                        <div className="sm:col-span-6">
                                            <label htmlFor="student_email" className="block text-sm font-medium text-gray-700">
                                                Student Email
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="email"
                                                    name="student_email"
                                                    id="student_email"
                                                    required
                                                    value={formData.student_email || ''}
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        {/* Class Type */}
                                        <div className="sm:col-span-3">
                                            <label htmlFor="class_type" className="block text-sm font-medium text-gray-700">
                                                Class Type
                                            </label>
                                            <div className="mt-1">
                                                <select
                                                    name="class_type"
                                                    id="class_type"
                                                    value={formData.class_type || 'Regular'}
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                >
                                                    <option value="Regular">Regular Class</option>
                                                    <option value="Premium">Premium Class</option>
                                                    <option value="Group">Group Class</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Schedule Date */}
                                        <div className="sm:col-span-3">
                                            <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
                                                Schedule Date
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="date"
                                                    name="schedule"
                                                    id="schedule"
                                                    required
                                                    value={formData.schedule || ''}
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        {/* Time */}
                                        <div className="sm:col-span-3">
                                            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                                                Time (e.g., 14:00 - 15:00)
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    name="time"
                                                    id="time"
                                                    required
                                                    value={formData.time || ''}
                                                    onChange={onInputChange}
                                                    placeholder="14:00 - 15:00"
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="sm:col-span-3">
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                Status
                                            </label>
                                            <div className="mt-1">
                                                <select
                                                    name="status"
                                                    id="status"
                                                    value={formData.status || 'FC not consumed (RG)'}
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                >
                                                    <option value="FC not consumed (RG)" className="bg-purple-100 text-purple-900">FC not consumed (RG)</option>
                                                    <option value="FC consumed (RG)" className="bg-purple-200 text-purple-900">FC consumed (RG)</option>
                                                    <option value="Completed (RG)" className="bg-green-100 text-green-900">Completed (RG)</option>
                                                    <option value="Completed (PRM)" className="bg-blue-100 text-blue-900">Completed (PRM)</option>
                                                    <option value="Absent w/ntc counted (RG)" className="bg-yellow-100 text-yellow-900">Absent w/ntc counted (RG)</option>
                                                    <option value="Absent w/o ntc counted (RG)" className="bg-amber-100 text-amber-900">Absent w/o ntc counted (RG)</option>
                                                    <option value="Absent w/ntc-not counted (RG)" className="bg-orange-100 text-orange-900">Absent w/ntc-not counted (RG)</option>
                                                    <option value="Cancelled (RG)" className="bg-red-100 text-red-900">Cancelled (RG)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-base font-medium text-white hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                                    >
                                        Update Class
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

export default UpdateClasses;