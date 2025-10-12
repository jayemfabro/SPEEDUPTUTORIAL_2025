import AdminLayout from "@/Layouts/AdminLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    UserCircle,
    Calendar,
    Users,
    BookOpen,
    Filter,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    User,
    XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function TeacherOverview({ teacherId }) {
    const [teacher, setTeacher] = useState(null);
    const [stats, setStats] = useState({
        total_students: 0,
        total_classes: 0,
        upcoming_classes: 0,
        total_absences: 0
    });
    
    // Debug log the current stats whenever they change
    useEffect(() => {
        console.log('Current stats state:', stats);
    }, [stats]);
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [teachers, setTeachers] = useState({});
    const [selectedTeacher, setSelectedTeacher] = useState(teacherId);
    const [filterOpen, setFilterOpen] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch all teachers for dropdown
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await window.axios.get('/api/admin/teachers');
                // Convert array to object
                const teachersObj = {};
                response.data.forEach(teacher => {
                    teachersObj[teacher.id] = teacher;
                });
                setTeachers(teachersObj);
            } catch (error) {
                console.error('Error fetching teachers:', error);
            }
        };
        fetchTeachers();
    }, []);

    // Fetch teacher data and stats
    useEffect(() => {
        const fetchTeacherData = async () => {
            if (!selectedTeacher) return;
            
            setLoading(true);
            try {
                // Fetch teacher details
                const teacherResponse = await window.axios.get(`/api/admin/teachers/${selectedTeacher}`);
                setTeacher(teacherResponse.data);
                
                // Fetch teacher stats
                const statsResponse = await window.axios.get(`/api/admin/dashboard/stats/teacher/${selectedTeacher}`);
                const statsData = statsResponse.data;
                console.log('Received teacher stats:', statsData);
                
                // Directly extract values with logging for debugging
                const totalStudents = statsData.total_students || statsData.totalStudents || 0;
                const totalClasses = statsData.total_classes || statsData.totalClasses || 0;
                const upcomingClasses = statsData.upcoming_classes || 0;
                const totalAbsences = statsData.total_absences || statsData.teacherAbsences || 0;
                
                console.log('Extracted values:', { 
                    totalStudents, 
                    totalClasses, 
                    upcomingClasses, 
                    totalAbsences,
                    rawData: statsData 
                });
                
                setStats({
                    total_students: totalStudents,
                    total_classes: totalClasses,
                    upcoming_classes: upcomingClasses,
                    total_absences: totalAbsences
                });
                
                // Fetch teacher classes
                const classesResponse = await window.axios.get(`/api/admin/teachers/${selectedTeacher}/classes`);
                if (classesResponse.data && classesResponse.data.classes) {
                    // Filter for upcoming classes
                    const upcoming = classesResponse.data.classes.filter(cls => {
                        const scheduleDate = new Date(cls.schedule);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return scheduleDate >= today && cls.status !== 'Completed' && cls.status !== 'Cancelled';
                    }).slice(0, 5); // Show only first 5
                    
                    setUpcomingClasses(upcoming);
                }
            } catch (error) {
                console.error('Error fetching teacher data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherData();
    }, [selectedTeacher]);

    // Handle teacher change
    const handleTeacherChange = (teacherId) => {
        setSelectedTeacher(teacherId);
        window.history.pushState(
            {},
            '',
            `/admin/teacher/${teacherId}/overview`
        );
    };

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Teacher Overview
                </h2>
            }
        >
            <Head title="Teacher Overview" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header with teacher info and dropdown */}
                    <div className="mb-8 relative z-10">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                        Teacher Overview
                                    </h1>
                                    <p className="text-slate-600 mt-2 text-lg">
                                        {!loading && teacher ? 
                                            `Viewing data for ${teacher.name}` : 
                                            'Loading teacher data...'}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {/* Teacher Filter Dropdown */}
                                    <div className="relative w-56 z-[99999]">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFilterOpen(
                                                    filterOpen === "teacher"
                                                        ? null
                                                        : "teacher"
                                                )
                                            }
                                            onBlur={() =>
                                                setTimeout(
                                                    () => setFilterOpen(null),
                                                    200
                                                )
                                            }
                                            aria-haspopup="listbox"
                                            aria-expanded={filterOpen === "teacher"}
                                            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-between h-[42px] ${
                                                filterOpen === "teacher"
                                                    ? "bg-orange-50 border border-orange-200 text-navy-700"
                                                    : "bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm"
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                {selectedTeacher && teachers[selectedTeacher] ? (
                                                    <span className="truncate">
                                                        {teachers[selectedTeacher].name || "Teacher"}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        Select Teacher
                                                    </span>
                                                )}
                                            </div>
                                            {filterOpen === "teacher" ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </button>

                                        {filterOpen === "teacher" && (
                                            <div 
                                                className="absolute z-[99999] mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-xl" 
                                                style={{
                                                    position: 'absolute', 
                                                    zIndex: 99999,
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: 'white',
                                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                                                }}
                                            >
                                                <div className="max-h-60 overflow-y-auto">
                                                    <div className="p-2 space-y-1">
                                                        {Object.entries(teachers).map(
                                                            ([id, teacher]) => (
                                                                <button
                                                                    key={id}
                                                                    type="button"
                                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                        selectedTeacher === id
                                                                            ? "bg-navy-600 text-white"
                                                                            : "hover:bg-gray-100 text-gray-700"
                                                                    }`}
                                                                    onClick={() => {
                                                                        handleTeacherChange(id);
                                                                        setFilterOpen(null);
                                                                    }}
                                                                >
                                                                    <User className="h-4 w-4 mr-2 text-navy-600" />
                                                                    {teacher.name}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="hidden md:flex items-center space-x-4">
                                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
                                            <Calendar className="w-4 h-4 mr-2 inline" />
                                            {new Date().toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                        {/* Total Students Card */}
                        <div className="group relative overflow-hidden bg-gradient-to-br from-navy-700 to-navy-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-blue-100 text-sm font-medium">
                                            Total Students
                                        </p>
                                        <div className="flex items-baseline justify-end mt-1">
                                            <p className="text-3xl font-bold text-white">
                                                {loading ? '...' : (
                                                    stats.total_students !== undefined ? 
                                                    stats.total_students : 
                                                    'N/A'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Classes Card */}    
                        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-100 text-sm font-medium">
                                            Total Classes
                                        </p>
                                        <div className="flex items-baseline justify-end mt-1">
                                            <p className="text-3xl font-bold text-white">
                                                {loading ? '...' : (
                                                    stats.total_classes !== undefined ? 
                                                    stats.total_classes : 
                                                    'N/A'
                                                )}
                                            </p>
                                            {!loading && (
                                                <span className="ml-2 text-xs font-medium px-2 py-1 bg-white/20 text-white rounded-full backdrop-blur-sm">
                                                    95%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Classes Card */}
                        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-orange-100 text-sm font-medium">
                                            Upcoming Classes
                                        </p>
                                        <p className="text-3xl font-bold text-white mt-1">
                                            {loading ? '...' : (
                                                stats.upcoming_classes !== undefined ? 
                                                stats.upcoming_classes : 
                                                'N/A'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Absences Card */}
                        <div className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <XCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-red-100 text-sm font-medium">
                                            Total Absences
                                        </p>
                                        <div className="flex items-baseline justify-end mt-1">
                                            <p className="text-3xl font-bold text-white">
                                                {loading ? '...' : (
                                                    stats.total_absences !== undefined ? 
                                                    stats.total_absences : 
                                                    'N/A'
                                                )}
                                            </p>
                                            <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${
                                                stats.total_absences > 0 
                                                    ? 'bg-white/20 text-white' 
                                                    : 'bg-green-500/20 text-green-100'
                                            }`}>
                                                {stats.total_absences > 0 ? '+1 week' : 'None'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Classes Section */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg mr-3">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                Upcoming Classes
                            </h3>
                            {!loading && upcomingClasses.length > 0 && (
                                <div className="flex items-center text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-full">
                                    <Filter className="w-4 h-4 mr-2" />
                                    {upcomingClasses.length} upcoming
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-slate-500">Loading upcoming classes...</p>
                            </div>
                        ) : upcomingClasses.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-500">No upcoming classes found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200">
                                {upcomingClasses.map((cls, index) => (
                                    <div key={index} className="py-4 first:pt-0 last:pb-0">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-slate-800">{cls.student_name}</p>
                                                <p className="text-sm text-slate-600">{cls.class_type} Class</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-slate-800">{new Date(cls.schedule).toLocaleDateString()}</p>
                                                <p className="text-sm text-slate-600">{cls.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}