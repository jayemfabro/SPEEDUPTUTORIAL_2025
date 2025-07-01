import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AddTeacherModal from '@/Components/Admin/AddTeacherModal';
import UpdateTeacherModal from '@/Components/Admin/UpdateTeacherModal';
import DetailsTeacherModal from '@/Components/Admin/DetailsTeacherModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PlusCircle, 
    Search, 
    Edit, 
    Trash2, 
    Mail, 
    Phone, 
    Award, 
    Calendar, 
    CheckCircle, 
    User, 
    XCircle, 
    ChevronDown, 
    ChevronUp 
} from 'lucide-react';


export default function Teachers() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState(null);
    const [currentTeacher, setCurrentTeacher] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const statusOptions = [
        {
            value: 'active',
            label: 'Active',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            icon: CheckCircle,
        },
        {
            value: 'inactive',
            label: 'Inactive',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            icon: XCircle,
        },
    ];

    const handleStatusSelect = (status) => {
        setFilterStatus(status === filterStatus ? '' : status);
        setDropdownOpen(null);
    };
    
    // Mock data for teachers
    const [teachers, setTeachers] = useState([
        {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1 (555) 123-4567',
            specialization: 'Mathematics',
            experience: '5 years',
            availability: 'Mon-Fri, 9AM-5PM',
            image: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            phone: '+1 (555) 987-6543',
            specialization: 'English Literature',
            experience: '8 years',
            availability: 'Tue-Sat, 10AM-6PM',
            image: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        {
            id: 3,
            name: 'Michael Chen',
            email: 'michael.chen@example.com',
            phone: '+1 (555) 456-7890',
            specialization: 'Physics',
            experience: '6 years',
            availability: 'Mon-Wed, Fri, 8AM-4PM',
            image: 'https://randomuser.me/api/portraits/men/3.jpg'
        },
    ]);

    // Form state for teacher data
    const [teacherForm, setTeacherForm] = useState({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        experience: '',
        availability: '',
        image: '',
        bio: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTeacherForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddTeacher = (e) => {
        e.preventDefault();
        const id = teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1;
        
        // Add default image if none provided
        const image = teacherForm.image || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${id % 10}.jpg`;
        
        setTeachers(prev => [...prev, { ...teacherForm, id, image }]);
        resetForm();
        setIsAddModalOpen(false);
        showNotification('Teacher added successfully!');
    };
    
    const handleEditTeacher = (e) => {
        e.preventDefault();
        setTeachers(prev => 
            prev.map(teacher => 
                teacher.id === currentTeacher.id ? { ...teacherForm } : teacher
            )
        );
        resetForm();
        setIsEditModalOpen(false);
        showNotification('Teacher updated successfully!');
    };
    
    const handleDeleteTeacher = () => {
        setTeachers(prev => prev.filter(teacher => teacher.id !== currentTeacher.id));
        setIsDeleteModalOpen(false);
        showNotification('Teacher removed successfully!', 'warning');
    };
    
    const openEditModal = (teacher) => {
        setCurrentTeacher(teacher);
        setTeacherForm({
            ...teacher
        });
        setIsEditModalOpen(true);
    };

    const openDetailsModal = (teacher) => {
        setCurrentTeacher(teacher);
        setIsDetailsModalOpen(true);
    };
    
    const openDeleteModal = (teacher) => {
        setCurrentTeacher(teacher);
        setIsDeleteModalOpen(true);
    };
    
    const resetForm = () => {
        setTeacherForm({
            name: '',
            email: '',
            phone: '',
            specialization: '',
            experience: '',
            availability: '',
            image: '',
            bio: ''
        });
        setCurrentTeacher(null);
        setIsDetailsModalOpen(false);
    };
    
    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const filteredTeachers = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <Head title="Teachers Management" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Responsive Banner */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-navy-800 to-navy-700 p-4 sm:p-6 md:p-8 mb-6 shadow-lg">
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="text-center sm:text-left">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                                            Teachers Management
                                        </h1>
                                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-navy-100">
                                            Manage your teaching staff and their information
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Add action buttons or additional content here if needed */}
                        </div>
                    </div>
                </div>

                {/* Search and Filter Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <div className="relative w-full sm:w-64">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 h-[42px] border border-gray-200 rounded-lg leading-5 bg-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-sm"
                                    placeholder="Search by name or specialization..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="relative w-full sm:w-64">
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(dropdownOpen === 'status' ? null : 'status')}
                                    onBlur={() => setTimeout(() => setDropdownOpen(null), 200)}
                                    aria-haspopup="listbox"
                                    aria-expanded={dropdownOpen === 'status'}
                                    className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-between h-[42px] ${
                                        dropdownOpen === 'status'
                                            ? 'bg-orange-50 border border-orange-200 text-navy-700'
                                            : 'bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {filterStatus ? (
                                            <>
                                                <span className={`mr-2 ${
                                                    statusOptions.find(opt => opt.value === filterStatus)?.bgColor
                                                } rounded-full p-1`}>
                                                    {React.createElement(
                                                        statusOptions.find(opt => opt.value === filterStatus)?.icon,
                                                        {
                                                            className: `h-4 w-4 ${
                                                                statusOptions.find(opt => opt.value === filterStatus)?.textColor
                                                            }`
                                                        }
                                                    )}
                                                </span>
                                                <span className="truncate">
                                                    {statusOptions.find(opt => opt.value === filterStatus)?.label}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-gray-500">
                                                All Statuses
                                            </span>
                                        )}
                                    </div>
                                    {dropdownOpen === 'status' ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </button>

                                {dropdownOpen === 'status' && (
                                    <div className="absolute z-[60] mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                                        <div className="max-h-60 overflow-y-auto">
                                            <div className="p-2 space-y-1">
                                                <button
                                                    key="all-statuses"
                                                    type="button"
                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                        !filterStatus
                                                            ? 'bg-navy-600 text-white'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                    onClick={() => handleStatusSelect('')}
                                                >
                                                    All Statuses
                                                </button>
                                                {statusOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                            filterStatus === option.value
                                                                ? 'bg-navy-600 text-white'
                                                                : 'hover:bg-gray-100 text-gray-700'
                                                        }`}
                                                        onClick={() => handleStatusSelect(option.value)}
                                                    >
                                                        <span className={`mr-2 ${option.bgColor} rounded-full p-1`}>
                                                            {React.createElement(option.icon, {
                                                                className: `h-4 w-4 ${option.textColor}`
                                                            })}
                                                        </span>
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={openAddModal}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                        >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                            Add Teacher
                        </button>
                    </div>
                </div>

                {/* Teacher Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
                        <AnimatePresence>
                            {filteredTeachers.map((teacher) => (
                                <motion.div 
                                    key={teacher.id} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 flex flex-col h-full"
                                >
                                    <div className="bg-gradient-to-r from-navy-700 to-navy-800 px-4 py-3 border-b border-navy-600 flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border-2 border-orange-400 shadow-md">
                                                <img 
                                                    src={teacher.image} 
                                                    alt={teacher.name} 
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/150?text=Teacher';
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-base leading-5 font-medium text-white">{teacher.name}</h3>
                                                <div className="flex items-center mt-0.5">
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 shadow-sm">
                                                        {teacher.specialization}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => openEditModal(teacher)}
                                                className="text-gray-300 hover:text-orange-400 focus:outline-none transition-colors duration-200 p-1"
                                                title="Edit teacher"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(teacher)}
                                                className="text-gray-300 hover:text-red-500 focus:outline-none transition-colors duration-200 p-1"
                                                title="Delete teacher"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 flex-grow">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center text-xs overflow-hidden group">
                                                <Mail className="flex-shrink-0 mr-2 h-4 w-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
                                                <span className="text-gray-600 truncate hover:text-orange-600 transition-colors">{teacher.email}</span>
                                            </div>
                                            <div className="flex items-center text-xs group">
                                                <Phone className="flex-shrink-0 mr-2 h-4 w-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
                                                <span className="text-gray-600 hover:text-orange-600 transition-colors">{teacher.phone}</span>
                                            </div>
                                            <div className="flex items-center text-xs group">
                                                <Award className="flex-shrink-0 mr-2 h-4 w-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
                                                <span className="text-gray-600 hover:text-orange-600 transition-colors">Exp: {teacher.experience}</span>
                                            </div>
                                            <div className="flex items-center text-xs group">
                                                <Calendar className="flex-shrink-0 mr-2 h-4 w-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
                                                <span className="text-gray-600 hover:text-orange-600 transition-colors">{teacher.availability}</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex justify-end border-t border-gray-100 pt-1.5">
                                            <button 
                                                onClick={() => openDetailsModal(teacher)}
                                                className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs leading-4 font-medium rounded text-white bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 focus:outline-none focus:ring-1 focus:ring-navy-500 transition-all duration-200 transform hover:scale-105 shadow-sm"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    {/* Empty state when no teachers match search */}
                    {filteredTeachers.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="text-center py-20 px-6 bg-white rounded-xl shadow-sm border border-gray-100 w-full mt-8 hover:shadow-md transition-shadow duration-300">
                            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-navy-50 mb-4">
                                <User className="h-10 w-10 text-navy-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No teachers found</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">We couldn't find any teachers matching your search criteria. Try adjusting your search or add a new teacher to get started.</p>
                        </motion.div>
                    )}
                    
                    {/* Add Teacher Modal */}
                    <AddTeacherModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        onSubmit={handleAddTeacher}
                        teacherForm={teacherForm}
                        onInputChange={handleInputChange}
                    />

                    {/* Update Teacher Modal */}
                    <UpdateTeacherModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSubmit={handleEditTeacher}
                        teacherForm={teacherForm}
                        onInputChange={handleInputChange}
                        isUpdating={false}
                    />

                    {/* Teacher Details Modal */}
                    <DetailsTeacherModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => setIsDetailsModalOpen(false)}
                        teacher={currentTeacher}
                    />
                </div>
        </AdminLayout>
    );
}
