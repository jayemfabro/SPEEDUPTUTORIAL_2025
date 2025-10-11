import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, User, Diamond, Users, Gem, Check } from 'lucide-react';
import { Transition } from '@headlessui/react';

const UpdateStudentModal = ({ isOpen, onClose, onSubmit, studentForm, onInputChange, isUpdating }) => {
    const [isClassTypeOpen, setIsClassTypeOpen] = useState(false);

    const classTypes = [
        {
            value: "Regular",
            label: "Regular Class",
            icon: User,
            bgColor: "bg-navy-100",
            textColor: "text-navy-900",
            iconBgColor: "bg-navy-500",
            iconTextColor: "text-white",
        },
        {
            value: "Premium",
            label: "Premium Class",
            icon: Gem,
            bgColor: "bg-amber-100",
            textColor: "text-amber-900",
            iconBgColor: "bg-amber-500",
            iconTextColor: "text-white",
        },
        {
            value: "Group",
            label: "Group Class",
            icon: Users,
            bgColor: "bg-orange-100",
            textColor: "text-orange-900",
            iconBgColor: "bg-orange-500",
            iconTextColor: "text-white",
        },
    ];

    const getClassTypeOption = (type) => {
        const option = classTypes.find((opt) => opt.value === type);
        return (
            option || {
                bgColor: "bg-gray-100",
                textColor: "text-gray-700",
                iconBgColor: "bg-gray-500",
                iconTextColor: "text-white",
                icon: User,
                label: "Regular Class",
            }
        );
    };

    const selectedClassType = getClassTypeOption(studentForm.class_type || 'Regular');

    const handleClassTypeSelect = (classType) => {
        const syntheticEvent = {
            target: {
                name: 'class_type',
                value: classType
            }
        };
        onInputChange(syntheticEvent);
        setIsClassTypeOpen(false);
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

                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
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
                                <h3 className="text-lg leading-6 font-medium text-white">Update Student</h3>
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

                                        <div className="sm:col-span-3">
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

                                        <div className="sm:col-span-3">
                                            <label htmlFor="class_type" className="block text-sm font-medium text-gray-700">
                                                Class Type
                                            </label>
                                            <div className="mt-1 relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsClassTypeOpen(!isClassTypeOpen)}
                                                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-between ${
                                                        isClassTypeOpen
                                                            ? "bg-orange-50 border border-orange-200 text-navy-700"
                                                            : "bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm"
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        {studentForm.class_type ? (
                                                            <>
                                                                <span className={`mr-2 ${selectedClassType.iconBgColor} rounded-full p-1`}>
                                                                    {React.createElement(selectedClassType.icon, {
                                                                        className: `h-4 w-4 ${selectedClassType.iconTextColor}`,
                                                                    })}
                                                                </span>
                                                                <span className="truncate">
                                                                    {selectedClassType.label}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-500">
                                                                Select Class Type
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isClassTypeOpen ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </button>

                                                {isClassTypeOpen && (
                                                    <div className="absolute z-10 mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                                                        <div className="max-h-60 overflow-y-auto">
                                                            <div className="p-2 space-y-1">
                                                                {classTypes.map((type) => {
                                                                    const isSelected = studentForm.class_type === type.value;
                                                                    return (
                                                                        <button
                                                                            key={type.value}
                                                                            type="button"
                                                                            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                                isSelected
                                                                                    ? "bg-navy-600 text-white"
                                                                                    : `${type.bgColor} ${type.textColor} hover:bg-opacity-80`
                                                                            }`}
                                                                            onClick={() => handleClassTypeSelect(type.value)}
                                                                        >
                                                                            <span className={`mr-2 ${
                                                                                isSelected
                                                                                    ? "bg-white bg-opacity-20"
                                                                                    : type.iconBgColor
                                                                            } rounded-full p-1`}>
                                                                                {React.createElement(type.icon, {
                                                                                    className: `h-4 w-4 ${
                                                                                        isSelected
                                                                                            ? "text-white"
                                                                                            : type.iconTextColor
                                                                                    }`,
                                                                                })}
                                                                            </span>
                                                                            <span className="flex-1">
                                                                                {type.label}
                                                                            </span>
                                                                            {isSelected && (
                                                                                <Check className="h-4 w-4 ml-2 text-white" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="purchased_class" className="block text-sm font-medium text-gray-700">
                                                Purchased Class
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    name="purchased_class"
                                                    id="purchased_class"
                                                    value={studentForm.purchased_class || ''}
                                                    onChange={onInputChange}
                                                    placeholder="Enter purchased class details"
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                Phone
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    id="phone"
                                                    required
                                                    value={studentForm.phone}
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                                                Grade
                                            </label>
                                            <div className="mt-1">
                                                <select
                                                    name="grade"
                                                    id="grade"
                                                    required
                                                    value={studentForm.grade}
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                >
                                                    <option value="">Select grade</option>
                                                    <option value="7th Grade">7th Grade</option>
                                                    <option value="8th Grade">8th Grade</option>
                                                    <option value="9th Grade">9th Grade</option>
                                                    <option value="10th Grade">10th Grade</option>
                                                    <option value="11th Grade">11th Grade</option>
                                                    <option value="12th Grade">12th Grade</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                Status
                                            </label>
                                            <div className="mt-1">
                                                <select
                                                    name="status"
                                                    id="status"
                                                    required
                                                    value={studentForm.status}
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label htmlFor="courses" className="block text-sm font-medium text-gray-700">
                                                Courses (comma separated)
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    name="courses"
                                                    id="courses"
                                                    required
                                                    value={studentForm.courses}
                                                    onChange={onInputChange}
                                                    placeholder="e.g., Mathematics, Physics, English"
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 ${
                                            isUpdating 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                        }`}
                                    >
                                        {isUpdating ? 'Updating...' : 'Update Student'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isUpdating}
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

export default UpdateStudentModal;