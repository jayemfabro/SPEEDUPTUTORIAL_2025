import React from 'react';
import { 
    X, 
    Mail, 
    Phone, 
    Award, 
    Calendar, 
    User, 
    BookOpen, 
    Star, 
    Clock, 
    BarChart2, 
    GraduationCap,
    Briefcase,
    User as UserIcon,
    AtSign,
    Cake,
    BookOpen as BookIcon
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

const DetailsTeacherModal = ({ isOpen, onClose, teacher }) => {
    if (!teacher) return null;

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
                                        {teacher.specialization && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-orange-50 to-amber-50 text-amber-800 border border-amber-100">
                                                {teacher.specialization}
                                            </span>
                                        )}
                                        {teacher.experience && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800 border border-blue-100">
                                                {teacher.experience} Exp
                                            </span>
                                        )}
                                        <div className="flex items-center text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="space-y-3">
                                    <motion.div 
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl mb-4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                    >
                                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                                    <GraduationCap className="h-5 w-5" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-xs text-gray-500">Courses</p>
                                                    <p className="font-semibold">12</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-green-50 rounded-lg text-green-500">
                                                    <BarChart2 className="h-5 w-5" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-xs text-gray-500">Rating</p>
                                                    <div className="flex items-center">
                                                        <span className="font-semibold mr-1">4.8</span>
                                                        <Star className="h-3 w-3 text-amber-400 fill-current" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                                                    <Award className="h-5 w-5" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-xs text-gray-500">Experience</p>
                                                    <p className="font-semibold">{teacher.experience || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-xs text-gray-500">Status</p>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
                                                    label="Full Name" 
                                                    value={`${teacher.first_name || ''} ${teacher.middle_name ? teacher.middle_name + ' ' : ''}${teacher.last_name || ''}`.trim()} 
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
                                                    value={teacher.birthdate ? new Date(teacher.birthdate).toLocaleDateString() : ''} 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-6">
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Professional Information</h3>
                                            <div className="space-y-2">
                                                <DetailItem 
                                                    icon={Award} 
                                                    label="Specialization" 
                                                    value={teacher.specialization} 
                                                />
                                                <DetailItem 
                                                    icon={Briefcase} 
                                                    label="Experience" 
                                                    value={teacher.experience} 
                                                />
                                                <DetailItem 
                                                    icon={Calendar} 
                                                    label="Availability" 
                                                    value={teacher.availability} 
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
                                    <button
                                        type="button"
                                        className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-md shadow-sm hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                                    >
                                        Send Message
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