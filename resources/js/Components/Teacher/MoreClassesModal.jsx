import React from 'react';
import { X, Clock, User, Users, Gem } from 'lucide-react';

export default function MoreClassesModal({ isOpen, onClose, classes, timeSlot, day, onClassClick }) {
    if (!isOpen) return null;

    if (!classes || classes.length === 0) {
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div 
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        onClick={onClose}
                    ></div>
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">No Classes</h3>
                            <p>No classes found for this time slot.</p>
                            <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const formatDay = (dayName) => {
        return dayName; // Just return the day name as is
    };

    const handleClassClick = (cls) => {
        onClose(); // Close this modal first
        if (onClassClick) {
            onClassClick(cls); // Trigger the details modal for the specific class
        }
    };

    return (
        <div 
            className="fixed inset-0 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center" 
            style={{ zIndex: 99999 }}
        >
            <div className="flex items-center justify-center min-h-screen w-full p-4">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal content */}
                <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full mx-auto">
                    {/* Header */}
                    <div className="bg-navy-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-white">
                                    Additional Classes
                                </h3>
                                <p className="text-sm text-navy-100 mt-1">
                                    {day}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-navy-100 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="bg-white px-4 pb-4 sm:p-6 sm:pt-4">{/* Classes list */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {(classes || []).map(cls => (
                                <div
                                    key={cls.id}
                                    onClick={() => handleClassClick(cls)}
                                    className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-opacity-80 ${
                                        cls.class_type === 'Premium' 
                                            ? 'border-amber-500 ' 
                                            : cls.class_type === 'Group'
                                                ? 'border-orange-500 '
                                                : 'border-navy-500 '
                                    }${
                                        cls.status === 'Valid for cancellation' || cls.status === 'Valid for Cancellation' ? 'bg-gray-600 text-white' :
                                        cls.status === 'FC not consumed' ? 'bg-yellow-400 text-black' :
                                        cls.status === 'Completed' ? 'bg-green-400 text-green-900' :
                                        cls.status === 'Absent w/ntc counted' ? 'bg-blue-400 text-white' :
                                        cls.status === 'Cancelled' ? 'bg-purple-400 text-black' :
                                        cls.status === 'Absent w/ntc-not counted' ? 'bg-orange-400 text-white' :
                                        cls.status === 'FC consumed' ? 'bg-pink-400 text-white' :
                                        'bg-slate-400 text-slate-900'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {cls.class_type === 'Premium' ? 
                                                <Gem className="h-4 w-4 text-amber-600 mr-2" /> : 
                                                cls.class_type === 'Group' ?
                                                <Users className="h-4 w-4 text-orange-600 mr-2" /> :
                                                <User className="h-4 w-4 text-navy-600 mr-2" />}
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {cls.student_name}
                                                </p>
                                                <p className="text-xs opacity-75">
                                                    {cls.class_type} Class
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium">
                                                {cls.status}
                                            </p>
                                            <div className="flex items-center text-xs opacity-75 mt-1">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {(() => {
                                                    if (!cls.time) return cls.time;
                                                    const [hours, minutes] = cls.time.split(':');
                                                    const date = new Date();
                                                    date.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0);
                                                    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    {cls.notes && (
                                        <div className="mt-2 pt-2 border-t border-white border-opacity-20">
                                            <p className="text-xs opacity-75">
                                                Notes: {cls.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
