import AdminLayout from "@/Layouts/AdminLayout";
import TeachersLayout from "@/Layouts/TeachersLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    UserCircle,
    Calendar,
    Clock,
    Users,
    BookOpen,
    DollarSign,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    AlertCircle,
    User,
    Gem,
    BarChart2,
    Book,
    CheckCircle,
    XCircle,
    Clock as ClockIcon,
} from "lucide-react";
import { useState, useEffect } from "react";

// Mock data - replace with actual API calls
const mockTeachers = [
    { id: 1, name: 'Omey', email: 'omey@example.com' },
    { id: 2, name: 'Alex', email: 'alex@example.com' },
    { id: 3, name: 'Sam', email: 'sam@example.com' },
];

const mockTeacherStats = {
    1: {
        totalStudents: 45,
        totalClasses: 26,
        totalAbsences: 5,
        upcomingClasses: 3,
        completionRate: '92%',
        recentActivity: [
            { type: 'class', title: 'Mathematics Class', date: '2025-06-28', time: '10:00 AM' },
            { type: 'student', title: 'New student assigned', date: '2025-06-27', student: 'John Doe' },
            { type: 'payment', title: 'Payment received', date: '2025-06-26', amount: '₱5,000' },
        ]
    },
    2: {
        totalStudents: 32,
        totalClasses: 18,
        totalAbsences: 2,
        upcomingClasses: 5,
        completionRate: '95%',
        recentActivity: [
            { type: 'class', title: 'Science Class', date: '2025-06-28', time: '2:00 PM' },
            { type: 'student', title: 'New student assigned', date: '2025-06-26', student: 'Jane Smith' },
        ]
    },
    3: {
        totalStudents: 28,
        totalClasses: 15,
        totalAbsences: 1,
        upcomingClasses: 2,
        completionRate: '97%',
        recentActivity: [
            { type: 'class', title: 'English Class', date: '2025-06-29', time: '9:00 AM' },
            { type: 'payment', title: 'Payment received', date: '2025-06-25', amount: '₱3,500' },
        ]
    }
};

const AdminDashboard = () => {
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalClasses: 0,
        totalRevenue: 0,
        totalTeachers: 0,
        recentActivities: []
    });

    useEffect(() => {
        // In a real app, you would fetch this data from your API
        if (selectedTeacher === 'all') {
            // Calculate aggregate stats for all teachers
            const aggregateStats = {
                totalStudents: 105, // Sum of all teachers' students
                totalClasses: 59,   // Sum of all teachers' classes
                totalRevenue: 25000,
                totalTeachers: 3,
                recentActivities: [
                    { type: 'class', title: 'Mathematics Class', date: '2025-06-28', time: '10:00 AM', teacher: 'Omey' },
                    { type: 'class', title: 'Science Class', date: '2025-06-28', time: '2:00 PM', teacher: 'Alex' },
                    { type: 'student', title: 'New student assigned', date: '2025-06-27', student: 'John Doe', teacher: 'Omey' },
                    { type: 'payment', title: 'Payment received', date: '2025-06-26', amount: '₱5,000', teacher: 'Omey' },
                    { type: 'student', title: 'New student assigned', date: '2025-06-26', student: 'Jane Smith', teacher: 'Alex' },
                ]
            };
            setStats(aggregateStats);
        } else {
            // Get stats for selected teacher
            const teacherStat = mockTeacherStats[selectedTeacher] || {};
            setStats({
                totalStudents: teacherStat.totalStudents || 0,
                totalClasses: teacherStat.totalClasses || 0,
                totalRevenue: 0, // This would be calculated based on teacher's classes
                totalTeachers: 1,
                recentActivities: teacherStat.recentActivity || []
            });
        }
    }, [selectedTeacher]);

    return (
        <div className="py-12">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header with welcome message and filter */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-2xl font-bold text-navy-800">
                            {selectedTeacher === 'all' ? 'Admin Dashboard' : 'Teacher Overview'}
                        </h1>
                        <p className="text-navy-600 mt-1">
                            {selectedTeacher === 'all' 
                                ? 'Welcome back! Here\'s an overview of your academy.' 
                                : `Viewing data for ${mockTeachers.find(t => t.id === parseInt(selectedTeacher))?.name || 'selected teacher'}`}
                        </p>
                    </div>
                    
                    {/* Teacher Filter Dropdown */}
                    <div className="relative w-full sm:w-56">
                        <button
                            onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-navy-700 bg-white border border-navy-200 rounded-lg hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-200"
                        >
                            <span className="truncate">
                                {selectedTeacher === 'all' 
                                    ? 'All Teachers' 
                                    : mockTeachers.find(t => t.id === parseInt(selectedTeacher))?.name || 'Select Teacher'}
                            </span>
                            {isTeacherDropdownOpen ? (
                                <ChevronUp className="w-4 h-4 ml-2 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                            )}
                        </button>
                        
                        {isTeacherDropdownOpen && (
                            <div className="absolute right-0 z-10 w-full mt-1 origin-top-right bg-white border border-navy-100 rounded-lg shadow-lg overflow-hidden">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setSelectedTeacher('all');
                                            setIsTeacherDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center ${selectedTeacher === 'all' ? 'bg-navy-50 text-navy-900' : 'text-navy-700 hover:bg-navy-50'}`}
                                    >
                                        <Users className="w-4 h-4 mr-2 text-navy-500" />
                                        All Teachers
                                    </button>
                                    {mockTeachers.map((teacher) => (
                                        <button
                                            key={teacher.id}
                                            onClick={() => {
                                                setSelectedTeacher(teacher.id);
                                                setIsTeacherDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center ${selectedTeacher === teacher.id ? 'bg-navy-50 text-navy-900' : 'text-navy-700 hover:bg-navy-50'}`}
                                        >
                                            <UserCircle className="w-4 h-4 mr-2 text-navy-500" />
                                            {teacher.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {/* Total Students Card */}
                    <div className="p-5 bg-gradient-to-br from-white to-navy-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-navy-100">
                        <div className="flex items-start">
                            <div className="p-2.5 bg-blue-50 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-navy-600">
                                    Total Students
                                </p>
                                <div className="flex items-baseline mt-1">
                                    <p className="text-2xl font-bold text-navy-800">
                                        {stats.totalStudents}
                                    </p>
                                    {selectedTeacher === 'all' && (
                                        <span className="ml-2 text-xs font-medium px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full">
                                            +12% this month
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Classes Card */}
                    <div className="p-5 bg-gradient-to-br from-white to-navy-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-navy-100">
                        <div className="flex items-start">
                            <div className="p-2.5 bg-green-50 rounded-lg">
                                <BookOpen className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-navy-600">
                                    Total Classes
                                </p>
                                <div className="flex items-baseline mt-1">
                                    <p className="text-2xl font-bold text-navy-800">
                                        {stats.totalClasses}
                                    </p>
                                    {selectedTeacher === 'all' ? (
                                        <span className="ml-2 text-xs font-medium px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                                            +8 this month
                                        </span>
                                    ) : (
                                        <span className="ml-2 text-xs font-medium px-1.5 py-0.5 bg-navy-50 text-navy-700 rounded-full">
                                            {mockTeacherStats[selectedTeacher]?.completionRate || '0%'} completion
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Teachers Card (only shown when viewing all teachers) */}
                    {selectedTeacher === 'all' && (
                        <div className="p-5 bg-gradient-to-br from-white to-navy-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-navy-100">
                            <div className="flex items-start">
                                <div className="p-2.5 bg-purple-50 rounded-lg">
                                    <UserCircle className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-navy-600">
                                        Total Teachers
                                    </p>
                                    <p className="text-2xl font-bold text-navy-800 mt-1">
                                        {stats.totalTeachers}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upcoming Classes Card (shown when a specific teacher is selected) */}
                    {selectedTeacher !== 'all' && (
                        <div className="p-5 bg-gradient-to-br from-white to-navy-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-navy-100">
                            <div className="flex items-start">
                                <div className="p-2.5 bg-orange-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-navy-600">
                                        Upcoming Classes
                                    </p>
                                    <p className="text-2xl font-bold text-navy-800 mt-1">
                                        {mockTeacherStats[selectedTeacher]?.upcomingClasses || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Revenue Card (only shown when viewing all teachers) */}
                    {selectedTeacher === 'all' && (
                        <div className="p-5 bg-gradient-to-br from-white to-navy-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-navy-100">
                            <div className="flex items-start">
                                <div className="p-2.5 bg-yellow-50 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-navy-600">
                                        Total Revenue
                                    </p>
                                    <p className="text-2xl font-bold text-navy-800 mt-1">
                                        ₱{stats.totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Absences Card (shown when a specific teacher is selected) */}
                    {selectedTeacher !== 'all' && (
                        <div className="p-5 bg-gradient-to-br from-white to-navy-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-navy-100">
                            <div className="flex items-start">
                                <div className="p-2.5 bg-red-50 rounded-lg">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-navy-600">
                                        Total Absences
                                    </p>
                                    <div className="flex items-baseline mt-1">
                                        <p className="text-2xl font-bold text-navy-800">
                                            {mockTeacherStats[selectedTeacher]?.totalAbsences || 0}
                                        </p>
                                        <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                                            mockTeacherStats[selectedTeacher]?.totalAbsences > 0 
                                                ? 'bg-red-50 text-red-700' 
                                                : 'bg-green-50 text-green-700'
                                        }`}>
                                            {mockTeacherStats[selectedTeacher]?.totalAbsences > 0 ? '+1 this week' : 'No absences'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activities Section */}
                <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-navy-100">
                        <h3 className="text-lg font-semibold text-navy-800">
                            Recent Activities
                        </h3>
                    </div>
                    <div className="divide-y divide-navy-100">
                        {stats.recentActivities.length > 0 ? (
                            stats.recentActivities.map((activity, index) => (
                                <div key={index} className="p-4 hover:bg-navy-50 transition-colors duration-150">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {activity.type === 'class' ? (
                                                <Calendar className="w-5 h-5 text-blue-500" />
                                            ) : activity.type === 'student' ? (
                                                <User className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <DollarSign className="w-5 h-5 text-purple-500" />
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-navy-800">
                                                    {activity.title}
                                                </p>
                                                <span className="text-xs text-navy-500">
                                                    {activity.date} {activity.time ? `• ${activity.time}` : ''}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-navy-600">
                                                {activity.type === 'class' && (
                                                    <span>Class at {activity.time} with {activity.teacher || 'teacher'}</span>
                                                )}
                                                {activity.type === 'student' && (
                                                    <span>New student: {activity.student} {activity.teacher && `(Assigned to ${activity.teacher})`}</span>
                                                )}
                                                {activity.type === 'payment' && (
                                                    <span>{activity.amount} received {activity.teacher && `from ${activity.teacher}`}</span>
                                                )}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-navy-400" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-navy-500">No recent activities found</p>
                            </div>
                        )}
                    </div>
                    {stats.recentActivities.length > 0 && (
                        <div className="px-6 py-3 bg-navy-50 text-right">
                            <button className="text-sm font-medium text-navy-700 hover:text-navy-900">
                                View all activities
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TeachersDashboard = () => {
    return (
        <div className="py-12">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header with welcome message */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-navy-800">Welcome, Teacher Omey</h1>
                    <p className="text-navy-600 mt-1">Here's an overview of your teaching statistics</p>
                </div>
                
                {/* Teacher Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
                    <div className="p-6 bg-gradient-to-br from-white to-navy-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-navy-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <BookOpen className="w-7 h-7 text-orange-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-navy-600">
                                    Completed Classes
                                </p>
                                <div className="flex items-baseline">
                                    <p className="text-2xl font-bold text-navy-800">
                                        26
                                    </p>
                                    <span className="ml-2 text-xs text-green-600 font-medium">+3 this week</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-white to-navy-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-navy-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Clock className="w-7 h-7 text-orange-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-navy-600">
                                    Absences
                                </p>
                                <div className="flex items-baseline">
                                    <p className="text-2xl font-bold text-navy-800">
                                        5
                                    </p>
                                    <span className="ml-2 text-xs text-red-600 font-medium">+1 this week</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-white to-navy-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-navy-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Calendar className="w-7 h-7 text-orange-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-navy-600">
                                    Free Classes
                                </p>
                                <div className="flex items-baseline">
                                    <p className="text-2xl font-bold text-navy-800">
                                        8
                                    </p>
                                    <span className="ml-2 text-xs text-navy-600 font-medium">2 remaining</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content container */}

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-navy-800">
                            Teaching Statistics
                        </h2>
                        <p className="text-sm text-navy-500 mt-1">Detailed breakdown of your classes</p>
                    </div>
                    <div className="bg-navy-50 text-navy-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        June 2025
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left section - Detailed Class Statistics */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-navy-800 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-orange-500" />
                                Detailed Class Statistics
                            </h3>
                            <div className="flex items-center text-xs text-navy-500 bg-navy-50 px-3 py-1.5 rounded-full">
                                <Filter className="w-3.5 h-3.5 mr-1" />
                                This Month
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                                    <span className="text-sm font-medium text-navy-800">
                                        Completed classes
                                    </span>
                                </div>
                                <div className="text-right font-bold text-navy-900">
                                    26
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-orange-400 mr-3"></div>
                                    <span className="text-sm font-medium text-navy-800">
                                        Absent with notice (counted)
                                    </span>
                                </div>
                                <div className="text-right font-bold text-navy-900">
                                    5
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-3"></div>
                                    <span className="text-sm font-medium text-navy-800">
                                        Absent with notice (not counted)
                                    </span>
                                </div>
                                <div className="text-right font-bold text-navy-900">
                                    3
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                                    <span className="text-sm font-medium text-navy-800">
                                        Absent without notice
                                    </span>
                                </div>
                                <div className="text-right font-bold text-navy-900">
                                    2
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-orange-300 mr-3"></div>
                                    <span className="text-sm font-medium text-navy-800">
                                        Free class not consumed
                                    </span>
                                </div>
                                <div className="text-right font-bold text-navy-900">
                                    2
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-3"></div>
                                    <span className="text-sm font-medium text-navy-800">
                                        Free class consumed
                                    </span>
                                </div>
                                <div className="text-right font-bold text-navy-900">
                                    1
                                </div>
                            </div>
                        </div>

                        {/* Monthly totals */}
                        <div className="mt-6 pt-5 border-t border-navy-200">
                            <h4 className="text-base font-bold text-navy-800 mb-4">
                                Monthly Totals
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                        <span className="text-sm text-navy-700">
                                            Completed
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-navy-900">
                                        115
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div>
                                        <span className="text-sm text-navy-700">
                                            With Notice
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-navy-900">
                                        10
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                                        <span className="text-sm text-navy-700">
                                            Not Counted
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-navy-900">
                                        8
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                        <span className="text-sm text-navy-700">
                                            No Notice
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-navy-900">
                                        25
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-orange-300 mr-2"></div>
                                        <span className="text-sm text-navy-700">
                                            Free Unused
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-navy-900">
                                        5
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                                        <span className="text-sm text-navy-700">
                                            Free Used
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-navy-900">
                                        3
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right section - Stats */}
                    <div className="space-y-6">
                        {/* Today's stats */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-navy-800 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                                    Today's Classes
                                </h3>
                                <div className="text-xs font-medium text-white bg-orange-500 px-3 py-1.5 rounded-full">
                                    June 26, 2025
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="p-4 bg-navy-50 rounded-lg text-center hover:bg-navy-100 transition-colors">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2"></div>
                                    <span className="block text-xl font-bold text-navy-900">
                                        26
                                    </span>
                                    <span className="block text-xs text-navy-600">
                                        Completed
                                    </span>
                                </div>
                                <div className="p-4 bg-navy-50 rounded-lg text-center hover:bg-navy-100 transition-colors">
                                    <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-2"></div>
                                    <span className="block text-xl font-bold text-navy-900">
                                        2
                                    </span>
                                    <span className="block text-xs text-navy-600">
                                        Absent
                                    </span>
                                </div>
                                <div className="p-4 bg-navy-50 rounded-lg text-center hover:bg-navy-100 transition-colors">
                                    <div className="w-3 h-3 rounded-full bg-orange-400 mx-auto mb-2"></div>
                                    <span className="block text-xl font-bold text-navy-900">
                                        5
                                    </span>
                                    <span className="block text-xs text-navy-600">
                                        With Notice
                                    </span>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg text-center">
                                    <span className="block text-xs text-navy-600 mb-1">
                                        Total
                                    </span>
                                    <span className="block text-2xl font-bold text-navy-900">
                                        33
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Monthly summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-base font-bold text-navy-800 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1.5 text-orange-500" />
                                        Monthly Classes
                                    </h3>
                                    <div className="text-xs text-navy-500 bg-navy-50 px-2 py-1 rounded-full">
                                        June
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-2 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                            <span className="text-sm text-navy-700">
                                                Completed
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-navy-900">
                                            115
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                            <span className="text-sm text-navy-700">
                                                Absent
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-navy-900">
                                            25
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div>
                                            <span className="text-sm text-navy-700">
                                                With Notice
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-navy-900">
                                            10
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-2 border-t border-navy-200 flex justify-between items-center">
                                    <span className="text-sm font-medium text-navy-700">
                                        Total
                                    </span>
                                    <span className="text-lg font-bold text-navy-900">
                                        150
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-base font-bold text-navy-800 flex items-center">
                                            <Gem className="w-4 h-4 mr-1.5 text-amber-500" />
                                            Free Classes
                                        </h3>
                                        <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                                            8 Total
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col items-center p-3 bg-gradient-to-b from-orange-50 to-white rounded-lg hover:bg-orange-100 transition-colors">
                                            <div className="w-3 h-3 rounded-full bg-orange-300 mb-1"></div>
                                            <span className="text-lg font-bold text-navy-900">
                                                5
                                            </span>
                                            <span className="text-xs text-navy-600">
                                                Not Used
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-gradient-to-b from-orange-50 to-white rounded-lg hover:bg-orange-100 transition-colors">
                                            <div className="w-3 h-3 rounded-full bg-orange-500 mb-1"></div>
                                            <span className="text-lg font-bold text-navy-900">
                                                3
                                            </span>
                                            <span className="text-xs text-navy-600">
                                                Used
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-base font-bold text-navy-800 flex items-center">
                                            <User className="w-4 h-4 mr-1.5 text-navy-500" />
                                            Teacher's Absences
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-navy-700">
                                            This month
                                        </span>
                                        <span className="text-2xl font-bold text-navy-900">
                                            5
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Note at bottom */}
                <div className="mt-8 bg-gradient-to-r from-orange-50 to-white rounded-xl p-6 shadow-sm border border-orange-100">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                            <div className="p-2 bg-orange-100 rounded-full">
                                <AlertCircle className="h-6 w-6 text-orange-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-navy-800 mb-2">
                                Important Note
                            </h3>
                            <div className="text-sm text-navy-700">
                                <p className="mb-2">
                                    Every time teachers consume a{" "}
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100">
                                        <span className="w-2 h-2 rounded-full bg-orange-300 mr-1"></span>
                                        <span className="font-medium text-orange-800">
                                            free class
                                        </span>
                                    </span>
                                    , the{" "}
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100">
                                        <span className="w-2 h-2 rounded-full bg-orange-500 mr-1"></span>
                                        <span className="font-medium text-orange-800">
                                            consumed count
                                        </span>
                                    </span>{" "}
                                    will automatically increase.
                                </p>
                                <p className="text-navy-600 flex items-center">
                                    <Calendar className="w-4 h-4 mr-1.5 text-orange-500" />
                                    These statistics will reset on the first
                                    week of each month.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const { auth } = usePage().props;
    const role = auth.user.role;

    // Only use AdminLayout or TeachersLayout based on role
    const Layout = role === "admin" ? AdminLayout : TeachersLayout;
    const DashboardContent =
        role === "admin" ? AdminDashboard : TeachersDashboard;

    return (
        <Layout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />
            <DashboardContent />
        </Layout>
    );
}
