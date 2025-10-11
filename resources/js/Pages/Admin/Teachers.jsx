import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
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
    Calendar, 
    CheckCircle, 
    User, 
    XCircle, 
    ChevronDown, 
    ChevronUp,
    AlertCircle
} from 'lucide-react';

export default function Teachers() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState(null);

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
    const [currentTeacher, setCurrentTeacher] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
    
    // Form state for teacher data
    const [teacherForm, setTeacherForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        birthdate: '',
        password: '',
        image: null
    });

    // Fetch teachers from API
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setIsLoading(true);
            
            const response = await axios.get('/api/admin/teachers');
            console.log('Teachers fetched:', response.data);
            setTeachers(response.data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            showNotification('Error fetching teachers', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setTeacherForm(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };
    
    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddTeacher = async (formData) => {
        try {
            console.log('Adding teacher with data:', formData);
            
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            const response = await axios.post('/api/admin/teachers', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                console.log('Teacher added successfully:', response.data);
                setTeachers(prev => [...prev, response.data.teacher]);
                resetForm();
                setIsAddModalOpen(false);
                showNotification(response.data.message);
            }
        } catch (error) {
            console.error('Error adding teacher:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                
                // Handle CSRF token mismatch
                if (error.response.status === 419) {
                    showNotification('Session expired. Please refresh the page and try again.', 'error');
                    // Optionally refresh the page after a delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    return;
                }
                
                // Show detailed validation errors
                if (error.response.data.errors) {
                    const errorMessages = Object.values(error.response.data.errors).flat();
                    console.error('Validation errors:', errorMessages);
                    showNotification(`Validation Error: ${errorMessages.join(', ')}`, 'error');
                } else {
                    showNotification(error.response.data.message || 'Error adding teacher', 'error');
                }
            } else {
                showNotification('Error adding teacher', 'error');
            }
        }
    };
    
    const handleEditTeacher = async (formData) => {
        try {
            const data = new FormData();
            data.append('firstName', teacherForm.firstName);
            data.append('middleName', teacherForm.middleName || '');
            data.append('lastName', teacherForm.lastName);
            data.append('username', teacherForm.username);
            data.append('email', teacherForm.email);
            data.append('phone', teacherForm.phone || '');
            data.append('birthdate', teacherForm.birthdate || '');
            if (teacherForm.password) {
                data.append('password', teacherForm.password);
            }
            if (teacherForm.image && typeof teacherForm.image === 'object') {
                data.append('image', teacherForm.image);
            }
            data.append('_method', 'PUT');

            const response = await axios.post(`/api/admin/teachers/${currentTeacher.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                // Update the teacher in the local state
                setTeachers(prev => 
                    prev.map(teacher => 
                        teacher.id === currentTeacher.id ? response.data.teacher : teacher
                    )
                );
                resetForm();
                setIsEditModalOpen(false);
                showNotification(response.data.message || 'Teacher updated successfully!');
            }
        } catch (error) {
            console.error('Error updating teacher:', error);
            if (error.response) {
                // Handle CSRF token mismatch
                if (error.response.status === 419) {
                    showNotification('Session expired. Please refresh the page and try again.', 'error');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    return;
                }
                
                if (error.response.data && error.response.data.errors) {
                    // Show validation errors
                    const errors = error.response.data.errors;
                    const errorMessages = Object.values(errors).flat();
                    showNotification(`Validation errors: ${errorMessages.join(', ')}`, 'error');
                } else {
                    showNotification(error.response?.data?.message || 'Error updating teacher', 'error');
                }
            } else {
                showNotification('Error updating teacher', 'error');
            }
        }
    };
    
    const handleDeleteTeacher = async () => {
        try {
            console.log('Deleting teacher:', currentTeacher);
            
            const response = await axios.delete(`/api/admin/teachers/${currentTeacher.id}`);
            
            if (response.status === 200) {
                console.log('Teacher deleted successfully:', response.data);
                setTeachers(prev => prev.filter(teacher => teacher.id !== currentTeacher.id));
                setIsDeleteModalOpen(false);
                showNotification(response.data.message || 'Teacher deleted successfully!', 'warning');
            }
        } catch (error) {
            console.error('Error deleting teacher:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                
                // Handle CSRF token mismatch
                if (error.response.status === 419) {
                    showNotification('Session expired. Please refresh the page and try again.', 'error');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    return;
                }
                
                showNotification(error.response.data.message || 'Error deleting teacher', 'error');
            } else {
                showNotification('Error deleting teacher', 'error');
            }
        }
    };
    
    const handleStatusChange = async (teacherId, newStatus) => {
        try {
            const response = await axios.patch(`/api/admin/teachers/${teacherId}/status`, {
                status: newStatus
            });

            if (response.status === 200) {
                // Update the teacher status in local state
                setTeachers(prev => 
                    prev.map(teacher => 
                        teacher.id === teacherId ? { ...teacher, status: newStatus } : teacher
                    )
                );
                showNotification(
                    `Teacher ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`,
                    newStatus === 'active' ? 'success' : 'warning'
                );
            }
        } catch (error) {
            console.error('Error updating teacher status:', error);
            
            // Handle CSRF token mismatch
            if (error.response && error.response.status === 419) {
                showNotification('Session expired. Please refresh the page and try again.', 'error');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                return;
            }
            
            showNotification(
                error.response?.data?.message || 'Error updating teacher status',
                'error'
            );
            throw error; // Re-throw to handle in the modal
        }
    };
    
    const openEditModal = (teacher) => {
        setCurrentTeacher(teacher);
        
        setTeacherForm({
            ...teacher,
            birthdate: formatDateForInput(teacher.birthdateRaw || teacher.birthdate || ''),
            password: '' // Clear password field for security
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
            firstName: '',
            middleName: '',
            lastName: '',
            username: '',
            email: '',
            phone: '',
            birthdate: '',
            password: '',
            image: null
        });
        setCurrentTeacher(null);
        setIsDetailsModalOpen(false);
    };
    
    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             teacher.username?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = !filterStatus || teacher.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <Head title="Teachers Management" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                                notification.type === 'error' 
                                    ? 'bg-red-500 text-white' 
                                    : notification.type === 'warning'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-green-500 text-white'
                            }`}
                        >
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                {notification.message}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
                    </div>
                ) : (
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
                                                    src={teacher.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjI1IiBmaWxsPSIjOUI5OUFGIi8+CjxwYXRoIGQ9Ik0zMCAxMjBDMzAgMTAwIDUwIDkwIDc1IDkwQzEwMCA5MCAxMjAgMTAwIDEyMCAxMjBWMTUwSDMwVjEyMFoiIGZpbGw9IiM5Qjk5QUYiLz4KPHRleHQgeD0iNzUiIHk9IjEzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3Mjg0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UZWFjaGVyPC90ZXh0Pgo8L3N2Zz4K'} 
                                                    alt={teacher.name} 
                                                    className="h-full w-full object-cover"
                                                    onLoad={(e) => {
                                                        console.log('Image loaded successfully:', e.target.src);
                                                    }}
                                                    onError={(e) => {
                                                        console.log('Image failed to load:', e.target.src);
                                                        e.target.onerror = null;
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjI1IiBmaWxsPSIjOUI5OUFGIi8+CjxwYXRoIGQ9Ik0zMCAxMjBDMzAgMTAwIDUwIDkwIDc1IDkwQzEwMCA5MCAxMjAgMTAwIDEyMCAxMjBWMTUwSDMwVjEyMFoiIGZpbGw9IiM5Qjk5QUYiLz4KPHRleHQgeD0iNzUiIHk9IjEzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3Mjg0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UZWFjaGVyPC90ZXh0Pgo8L3N2Zz4K';
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-base leading-5 font-medium text-white">{teacher.name}</h3>
                                                <div className="flex items-center mt-0.5">
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 shadow-sm">
                                                        <User className="h-3 w-3 mr-1" />
                                                        Teacher
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
                                                <span className="text-gray-600 hover:text-orange-600 transition-colors">{teacher.phone || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center text-xs group">
                                                <User className="flex-shrink-0 mr-2 h-4 w-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
                                                <span className="text-gray-600 hover:text-orange-600 transition-colors">@{teacher.username}</span>
                                            </div>
                                            <div className="flex items-center text-xs group">
                                                <Calendar className="flex-shrink-0 mr-2 h-4 w-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
                                                <span className="text-gray-600 hover:text-orange-600 transition-colors">
                                                    {teacher.birthdate ? new Date(teacher.birthdate).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: '2-digit', 
                                                        day: '2-digit' 
                                                    }) : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs group mt-1">
                                                <div className="flex-shrink-0 mr-2">
                                                    {teacher.status === 'active' ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                                <span className={`text-xs font-medium ${
                                                    teacher.status === 'active' 
                                                    ? 'text-green-700'
                                                    : 'text-red-700'
                                                }`}>
                                                    {teacher.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
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
                )}
                
                {/* Empty state when no teachers match search */}
                {!isLoading && filteredTeachers.length === 0 && (
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
                    onClose={() => {
                        setIsAddModalOpen(false);
                        resetForm();
                    }}
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
                    onStatusChange={handleStatusChange}
                />

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {isDeleteModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Delete Teacher
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-700">
                                        Are you sure you want to delete <strong>{currentTeacher?.name}</strong>? 
                                        This will permanently remove the teacher and all associated data.
                                    </p>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteTeacher}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        Delete Teacher
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}
