import React, { useState } from 'react';
import { 
    X, 
    Mail, 
    Phone, 
    Calendar, 
    User, 
    Star, 
    Clock, 
    BarChart2, 
    GraduationCap,
    User as UserIcon,
    AtSign,
    Cake,
    UserCheck,
    UserX,
    AlertCircle
} from 'lucide-react';
import { Transition } from '@headlessui/react';
import { motion } from 'framer-motion';

const DetailItem = ({ icon: Icon, label, value, className = '' }) => {
    if (!value) return null;
    
    return (
        <motion.div 
            className={`flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${className}`}
            whileHover={{ x: 2 }}
        >
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <Icon className="h-5 w-5" />
            </div>
            <div className="ml-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm text-gray-900 mt-1">{value || 'Not specified'}</p>
            </div>
        </motion.div>
    );
};

const DetailsTeacherModal = ({ isOpen, onClose, teacher, onStatusChange }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    
    if (!teacher) return null;

    const isActive = teacher.status === 'active';

    const handleStatusToggle = async () => {
        if (!onStatusChange) return;
        
        setIsUpdating(true);
        try {
            await onStatusChange(teacher.id, isActive ? 'inactive' : 'active');
        } catch (error) {
            console.error('Error updating teacher status:', error);
        } finally {
            setIsUpdating(false);
        }
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
                            <div className="bg-gradient-to-r from-navy-700 to-navy-800 px-6 py-5 flex justify-between items-center shadow-lg">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Teacher Profile</h3>
                                    <p className="text-navy-200 text-sm mt-1">Detailed information</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="bg-navy-600 rounded-full p-1 text-gray-300 hover:text-white focus:outline-none transition-colors duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="bg-white px-6 py-6 sm:p-6 overflow-y-auto max-h-[70vh]">
                                <motion.div 
                                    className="flex flex-col items-center mb-8"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="relative group">
                                        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-orange-500/30">
                                            <img 
                                                src={teacher.image} 
                                                alt={teacher.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(teacher.name) + '&background=4f46e5&color=fff&size=256';
                                                }}
                                            />
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                            Teacher
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mt-4">{teacher.name}</h2>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-orange-50 to-amber-50 text-amber-800 border border-amber-100">
                                            Teacher
                                        </span>
                                        <div className="flex items-center text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                                {/* Teacher class stats - modern card grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    <div className="flex items-center bg-blue-50 rounded-xl p-4">
                                        <GraduationCap className="h-6 w-6 text-blue-500 mr-3" />
                                        <div>
                                            <div className="text-xs text-gray-500 font-medium">Total Classes</div>
                                            <div className="text-lg font-bold text-gray-900">{teacher.total_classes}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-green-50 rounded-xl p-4">
                                        <BarChart2 className="h-6 w-6 text-green-500 mr-3" />
                                        <div>
                                            <div className="text-xs text-gray-500 font-medium">Completed</div>
                                            <div className="text-lg font-bold text-gray-900">{teacher.completed_classes}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-yellow-50 rounded-xl p-4">
                                        <Clock className="h-6 w-6 text-yellow-500 mr-3" />
                                        <div>
                                            <div className="text-xs text-gray-500 font-medium">Cancelled</div>
                                            <div className="text-lg font-bold text-gray-900">{teacher.cancelled_classes}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-pink-50 rounded-xl p-4">
                                        <Star className="h-6 w-6 text-pink-500 mr-3" />
                                        <div>
                                            <div className="text-xs text-gray-500 font-medium">FC Consumed</div>
                                            <div className="text-lg font-bold text-gray-900">{teacher.fc_consumed_classes}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-blue-100 rounded-xl p-4">
                                        <UserX className="h-6 w-6 text-blue-700 mr-3" />
                                        <div>
                                            <div className="text-xs text-gray-500 font-medium">Absent w/ntc counted</div>
                                            <div className="text-lg font-bold text-gray-900">{teacher.absent_w_ntc_counted}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-blue-50 rounded-xl p-4">
                                        <UserX className="h-6 w-6 text-blue-500 mr-3" />
                                        <div>
                                            <div className="text-xs text-gray-500 font-medium">Absent w/ntc-not counted</div>
                                            <div className="text-lg font-bold text-gray-900">{teacher.absent_w_ntc_not_counted}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <motion.div 
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl mb-4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                    >
                                    </motion.div>

                                    <motion.div 
                                        className="space-y-3"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.2 }}
                                    >
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Personal Information</h3>
                                            <div className="space-y-2">
                                                <DetailItem 
                                                    icon={UserIcon} 
                                                    label="First Name" 
                                                    value={teacher.firstName} 
                                                />
                                                <DetailItem 
                                                    icon={UserIcon} 
                                                    label="Middle Name" 
                                                    value={teacher.middleName} 
                                                />
                                                <DetailItem 
                                                    icon={UserIcon} 
                                                    label="Last Name" 
                                                    value={teacher.lastName} 
                                                />
                                                <DetailItem 
                                                    icon={AtSign} 
                                                    label="Username" 
                                                    value={teacher.username} 
                                                />
                                                <DetailItem 
                                                    icon={Mail} 
                                                    label="Email Address" 
                                                    value={teacher.email} 
                                                />
                                                <DetailItem 
                                                    icon={Phone} 
                                                    label="Phone Number" 
                                                    value={teacher.phone} 
                                                />
                                                <DetailItem 
                                                    icon={Cake} 
                                                    label="Birthdate" 
                                                    value={teacher.birthdate ? new Date(teacher.birthdate).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: '2-digit', 
                                                        day: '2-digit' 
                                                    }) : ''} 
                                                />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {(teacher.bio || teacher.notes) && (
                                        <motion.div 
                                            className="mt-6"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.3 }}
                                        >
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                                {teacher.bio ? 'Bio' : 'Notes'}
                                            </h3>
                                            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                    {teacher.bio || teacher.notes}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {!isActive && (
                                        <motion.div 
                                            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex-shrink-0">
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">Account Deactivated</h3>
                                                <div className="mt-1 text-sm text-red-700">
                                                    <p>This teacher account is currently inactive. The user cannot log in until the account is reactivated.</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <motion.div
                                        className="mt-4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.4 }}
                                    >
                                        <button
                                            type="button"
                                            onClick={handleStatusToggle}
                                            disabled={isUpdating}
                                            className={`w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${
                                                isActive 
                                                    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                                                    : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            ) : (
                                                <>
                                                    {isActive ? (
                                                        <UserX className="h-4 w-4 mr-2" />
                                                    ) : (
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                    )}
                                                </>
                                            )}
                                            {isUpdating ? 'Updating...' : (isActive ? 'Deactivate Account' : 'Activate Account')}
                                        </button>
                                    </motion.div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 sm:px-6 flex justify-between border-t border-gray-100">
                                <div className="text-sm text-gray-500">
                                    Last updated: {new Date().toLocaleDateString()}
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </div>
        </Transition>
    );
};

export default DetailsTeacherModal;