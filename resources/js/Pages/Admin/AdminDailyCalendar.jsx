import React, { useState, useEffect, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import DetailsCalendarModal from "@/Components/Admin/DetailsCalendarModal";
import Legend from "@/Components/Admin/Legend";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Calendar,
    Search,
    Info,
    ListFilter,
    Clock,
    Gem,
    User,
    Users,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";

export default function AdminDailyCalendar() {
    const { auth } = usePage().props;

    // State for current week
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [teacherFilter, setTeacherFilter] = useState("all");
    const [filterOpen, setFilterOpen] = useState(null); // null, 'teacher', or 'status'

    // Toggle filter dropdown
    const toggleFilter = (filterType) => {
        setFilterOpen(filterOpen === filterType ? null : filterType);
    };
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Sample teacher data - would be fetched from API in a real app
    const teachers = [
        { id: "t1", name: "John Smith", email: "john@example.com" },
        { id: "t2", name: "Sarah Johnson", email: "sarah@example.com" },
        { id: "t3", name: "Michael Brown", email: "michael@example.com" },
    ];

    // Dummy class data with teacher information
    const [classes, setClasses] = useState([
        {
            id: 1,
            student_name: "Aurora",
            teacher_id: "t1",
            teacher_name: "John Smith",
            day: "Monday",
            time: "17:00",
            duration: 30,
            class_type: "Regular",
            status: "FC not consumed (RG)",
        },
        {
            id: 2,
            student_name: "Emma",
            teacher_id: "t2",
            teacher_name: "Sarah Johnson",
            day: "Monday",
            time: "18:00",
            duration: 30,
            class_type: "Premium",
            status: "Completed (PRM)",
        },
        {
            id: 3,
            student_name: "Liam",
            teacher_id: "t3",
            teacher_name: "Michael Brown",
            day: "Monday",
            time: "18:30",
            duration: 30,
            class_type: "Group",
            status: "Completed (RG)",
        },
        {
            id: 4,
            student_name: "Olivia",
            teacher_id: "t1",
            teacher_name: "John Smith",
            day: "Monday",
            time: "19:00",
            duration: 30,
            class_type: "Regular",
            status: "Absent w/ntc counted (RG)",
        },
        {
            id: 5,
            student_name: "Noah",
            teacher_id: "t2",
            teacher_name: "Sarah Johnson",
            day: "Monday",
            time: "19:30",
            duration: 30,
            class_type: "Premium",
            status: "Cancelled (RG)",
        },
        {
            id: 6,
            student_name: "Eddie",
            teacher_id: "t3",
            teacher_name: "Michael Brown",
            day: "Monday",
            time: "20:00",
            duration: 30,
            class_type: "Premium",
            status: "Completed (PRM)",
        },
        {
            id: 7,
            student_name: "Jane Zhang",
            teacher_id: "t1",
            teacher_name: "John Smith",
            day: "Monday",
            time: "20:30",
            duration: 30,
            class_type: "Regular",
            status: "Absent w/o ntc counted (RG)",
        },
        {
            id: 8,
            student_name: "Jane Zhang",
            teacher_id: "t2",
            teacher_name: "Sarah Johnson",
            day: "Monday",
            time: "21:00",
            duration: 30,
            class_type: "Regular",
            status: "Absent w/ntc-not counted (RG)",
        },
        {
            id: 9,
            student_name: "Alice Bu",
            teacher_id: "t3",
            teacher_name: "Michael Brown",
            day: "Monday",
            time: "21:30",
            duration: 30,
            class_type: "Regular",
            status: "Cancelled (RG)",
        },
        {
            id: 10,
            student_name: "Matson Chen",
            teacher_id: "t1",
            teacher_name: "John Smith",
            day: "Tuesday",
            time: "17:00",
            duration: 30,
            class_type: "Premium",
            status: "Completed (PRM)",
        },
        {
            id: 11,
            student_name: "Amy Li",
            teacher_id: "t2",
            teacher_name: "Sarah Johnson",
            day: "Tuesday",
            time: "18:00",
            duration: 30,
            class_type: "Regular",
            status: "FC not consumed (RG)",
        },
        {
            id: 12,
            student_name: "Eric Z",
            teacher_id: "t3",
            teacher_name: "Michael Brown",
            day: "Tuesday",
            time: "18:30",
            duration: 30,
            class_type: "Premium",
            status: "Completed (PRM)",
        },
        {
            id: 13,
            student_name: "Matson Chen",
            teacher_id: "t1",
            teacher_name: "John Smith",
            day: "Wednesday",
            time: "16:30",
            duration: 30,
            class_type: "Premium",
            status: "Completed (PRM)",
        },
        {
            id: 14,
            student_name: "Jeffery",
            teacher_id: "t2",
            teacher_name: "Sarah Johnson",
            day: "Friday",
            time: "17:30",
            duration: 30,
            class_type: "Regular",
            status: "FC consumed (RG)",
        },
        {
            id: 15,
            student_name: "John",
            teacher_id: "t3",
            teacher_name: "Michael Brown",
            day: "Friday",
            time: "20:00",
            duration: 30,
            class_type: "Regular",
            status: "Completed (RG)",
        },
        {
            id: 16,
            student_name: "Group: English Conversation",
            teacher_id: "t1",
            teacher_name: "John Smith",
            day: "Wednesday",
            time: "19:00",
            duration: 60,
            class_type: "Group",
            status: "Completed (RG)",
        },
        {
            id: 17,
            student_name: "Group: Business English",
            teacher_id: "t2",
            teacher_name: "Sarah Johnson",
            day: "Thursday",
            time: "18:00",
            duration: 60,
            class_type: "Group",
            status: "FC consumed (RG)",
        },
    ]);

    // Get days of the current week
    const getDaysOfWeek = () => {
        const days = [];
        const startOfWeek = new Date(currentWeek);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day + 1); // Start from Monday

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push(date);
        }

        return days;
    };

    // Generate time slots from 8:00 AM to 10:00 PM in 30-minute increments (12-hour format)
    const getTimeSlots = () => {
        const timeSlots = [];
        for (let hour = 8; hour <= 22; hour++) {
            for (let minute of ["00", "30"]) {
                if (hour === 22 && minute === "30") break; // Skip 10:30 PM

                // Convert to 12-hour format
                const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM/PM
                const ampm = hour >= 12 ? "PM" : "AM";
                timeSlots.push({
                    time24: `${hour.toString().padStart(2, "0")}:${minute}`,
                    display: `${displayHour}:${minute} ${ampm}`,
                });
            }
        }
        return timeSlots;
    };

    const goToPreviousWeek = () => {
        const prevWeek = new Date(currentWeek);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setCurrentWeek(prevWeek);
    };

    const goToNextWeek = () => {
        const nextWeek = new Date(currentWeek);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setCurrentWeek(nextWeek);
    };

    const getClassesForSlot = (day, time24) => {
        const dayName = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ][day.getDay()];
        return classes.filter(
            (cls) => cls.day === dayName && cls.time === time24
        );
    };

    const formatDate = (date) => {
        return `${date.getMonth() + 1}.${date.getDate()}`;
    };

    // Handle opening the event details modal
    const handleEventClick = (event) => {
        setSelectedEvent({
            ...event,
            // Ensure date and endDate are Date objects
            date: event.date ? new Date(event.date) : new Date(),
            endDate: event.endDate ? new Date(event.endDate) : new Date(),
        });
        setShowDetailsModal(true);
    };

    // Handle saving notes
    const handleSaveNotes = (eventId, notes) => {
        // In a real app, you would make an API call here to save the notes
        console.log(`Saving notes for event ${eventId}:`, notes);

        // Update the local state
        setClasses(
            classes.map((cls) => (cls.id === eventId ? { ...cls, notes } : cls))
        );

        // If the selected event is the one being updated, update it as well
        if (selectedEvent && selectedEvent.id === eventId) {
            setSelectedEvent({ ...selectedEvent, notes });
        }
    };

    // Handle join class
    const handleJoinClass = (eventId) => {
        // In a real app, this would open the class in a new tab or redirect to the class page
        console.log("Joining class:", eventId);
        // For now, just show an alert
        alert(`Joining class ${eventId}`);
    };

    const getDayName = (date) => {
        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        return days[date.getDay()];
    };

    const getChineseDayName = (date) => {
        const days = [
            "星期日",
            "星期一",
            "星期二",
            "星期三",
            "星期四",
            "星期五",
            "星期六",
        ];
        return days[date.getDay()];
    };

    const daysOfWeek = getDaysOfWeek();
    const timeSlots = getTimeSlots();

    // Filter classes based on search query, status, and teacher
    const filteredClasses = useMemo(() => {
        let result = [...classes];

        // Apply search query first
        if (searchQuery) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(
                (cls) =>
                    cls.student_name.toLowerCase().includes(query) ||
                    (cls.teacher_name &&
                        cls.teacher_name.toLowerCase().includes(query)) ||
                    cls.class_type.toLowerCase().includes(query)
            );
        }

        // Then apply teacher filter
        if (teacherFilter !== "all") {
            result = result.filter((cls) => cls.teacher_id === teacherFilter);
        }

        // Finally apply status filter
        if (statusFilter !== "all") {
            result = result.filter((cls) => {
                // Handle both with and without (RG) suffix for backward compatibility
                const baseStatus = cls.status.replace(/\s*\(RG\)$/, "").trim();
                const targetStatus = statusFilter
                    .replace(/\s*\(RG\)$/, "")
                    .trim();
                return baseStatus === targetStatus;
            });
        }

        return result;
    }, [classes, searchQuery, statusFilter, teacherFilter]);

    // Create a map of filtered classes by day and time for efficient lookup
    const filteredClassesMap = useMemo(() => {
        const map = new Map();
        filteredClasses.forEach((cls) => {
            const key = `${cls.day}-${cls.time}`;
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(cls);
        });
        return map;
    }, [filteredClasses]);

    const getFilteredClassesForSlot = (day, time24) => {
        const dayName = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ][day.getDay()];
        return filteredClassesMap.get(`${dayName}-${time24}`) || [];
    };

    // Generate unique statuses for filter dropdown with proper formatting
    const statuses = useMemo(() => {
        const statusSet = new Set();
        classes.forEach((cls) => {
            // Clean up status by removing (RG) suffix for display
            const cleanStatus = cls.status.replace(/\s*\(RG\)$/, "").trim();
            statusSet.add(cleanStatus);
        });

        // Convert to array and sort
        const sortedStatuses = Array.from(statusSet).sort();

        // Move 'Completed' to the top if it exists
        const completedIndex = sortedStatuses.findIndex((s) =>
            s.startsWith("Completed")
        );
        if (completedIndex > 0) {
            const [completed] = sortedStatuses.splice(completedIndex, 1);
            sortedStatuses.unshift(completed);
        }

        return sortedStatuses;
    }, [classes]);

    return (
        <AdminLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Daily Calendar
                </h2>
            }
        >
            <Head title="Daily Calendar" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Legend />
                {/* Search and Filter Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 relative z-10">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            {/* Search Input */}
                            <div className="relative w-full sm:w-64">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 h-[42px] border border-gray-200 rounded-lg leading-5 bg-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-sm"
                                    placeholder="Search classes..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>

                            {/* Teacher Filter Dropdown */}
                            <div className="relative w-full sm:w-56 z-50">
                                <button
                                    type="button"
                                    onClick={() => toggleFilter("teacher")}
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
                                        {teacherFilter &&
                                        teacherFilter !== "all" ? (
                                            <span className="truncate">
                                                {teachers.find(
                                                    (t) =>
                                                        t.id === teacherFilter
                                                )?.name || "Teacher"}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">
                                                All Teachers
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
                                    <div className="absolute z-50 mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                                        <div className="max-h-60 overflow-y-auto">
                                            <div className="p-2 space-y-1">
                                                <button
                                                    key="all-teachers"
                                                    type="button"
                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                        !teacherFilter ||
                                                        teacherFilter === "all"
                                                            ? "bg-navy-600 text-white"
                                                            : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                    onClick={() => {
                                                        setTeacherFilter("all");
                                                        setFilterOpen(false);
                                                    }}
                                                >
                                                    <Users className="h-4 w-4 mr-2" />
                                                    All Teachers
                                                </button>
                                                {teachers.map((teacher) => (
                                                    <button
                                                        key={teacher.id}
                                                        type="button"
                                                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                            teacherFilter ===
                                                            teacher.id
                                                                ? "bg-navy-600 text-white"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => {
                                                            setTeacherFilter(
                                                                teacher.id
                                                            );
                                                            setFilterOpen(
                                                                false
                                                            );
                                                        }}
                                                    >
                                                        <User className="h-4 w-4 mr-2" />
                                                        {teacher.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Filter Dropdown */}
                            <div className="relative w-full sm:w-64 z-40">
                                <button
                                    type="button"
                                    onClick={() => toggleFilter("status")}
                                    onBlur={() =>
                                        setTimeout(
                                            () => setFilterOpen(null),
                                            200
                                        )
                                    }
                                    aria-haspopup="listbox"
                                    aria-expanded={filterOpen === "status"}
                                    className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-between h-[42px] ${
                                        filterOpen === "status"
                                            ? "bg-orange-50 border border-orange-200 text-navy-700"
                                            : "bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm"
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {statusFilter &&
                                        statusFilter !== "all" ? (
                                            <span className="truncate">
                                                {statusFilter}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">
                                                All Statuses
                                            </span>
                                        )}
                                    </div>
                                    {filterOpen === "status" ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </button>

                                {filterOpen === "status" && (
                                    <div className="absolute z-50 mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                                        <div className="max-h-60 overflow-y-auto">
                                            <div className="p-2 space-y-1">
                                                <button
                                                    key="all-statuses"
                                                    type="button"
                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                        !statusFilter ||
                                                        statusFilter === "all"
                                                            ? "bg-navy-600 text-white"
                                                            : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                    onClick={() => {
                                                        setStatusFilter("all");
                                                        setFilterOpen(false);
                                                    }}
                                                >
                                                    <ListFilter className="h-4 w-4 mr-2" />
                                                    All Statuses
                                                </button>
                                                {statuses.map((status) => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                            statusFilter ===
                                                            status
                                                                ? "bg-navy-600 text-white"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => {
                                                            setStatusFilter(
                                                                status === "All"
                                                                    ? "all"
                                                                    : status
                                                            );
                                                            setFilterOpen(
                                                                false
                                                            );
                                                        }}
                                                    >
                                                        {status ===
                                                            "Completed" ||
                                                        status ===
                                                            "Completed (RG)" ||
                                                        status ===
                                                            "Completed (PRM)" ? (
                                                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                                        ) : status.includes(
                                                              "Cancelled"
                                                          ) ? (
                                                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                                        ) : status.includes(
                                                              "Absent"
                                                          ) ? (
                                                            <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                                        ) : (
                                                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                                        )}
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Month Navigation */}
                        <div className="flex items-center space-x-2 h-[42px]">
                            <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-navy-100 h-full">
                                <button
                                    onClick={goToPreviousWeek}
                                    className="h-full px-3 text-navy-600 hover:text-navy-800 hover:bg-navy-50 transition-colors duration-200 flex items-center"
                                    aria-label="Previous week"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <div className="px-3 text-sm font-medium text-navy-900 h-full flex items-center">
                                    {currentWeek.toLocaleDateString("en-US", {
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </div>

                                <button
                                    onClick={goToNextWeek}
                                    className="h-full px-3 text-navy-600 hover:text-navy-800 hover:bg-navy-50 transition-colors duration-200 flex items-center"
                                    aria-label="Next week"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-6 sm:p-8 text-center">
                            <div className="inline-block h-7 sm:h-8 w-7 sm:w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                            <p className="mt-2 text-sm sm:text-base text-gray-600">
                                Loading classes...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="p-6 sm:p-8 text-center">
                            <AlertCircle className="h-7 sm:h-8 w-7 sm:w-8 text-red-500 mx-auto" />
                            <p className="mt-2 text-sm sm:text-base text-gray-600">
                                {error}
                            </p>
                            <button className="mt-4 px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:shadow-md transition-all duration-200">
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full bg-white rounded-lg shadow">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-navy-700 text-white border-b border-navy-800">
                                        <th
                                            colSpan="8"
                                            className="p-3 text-center"
                                        >
                                            <div className="flex items-center justify-center">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                <span className="font-bold text-sm">
                                                    Weekly Class Schedule
                                                </span>
                                            </div>
                                        </th>
                                    </tr>
                                    <tr className="bg-white border-b border-gray-200">
                                        <th className="border-r border-gray-200 p-3 w-28 text-xs font-semibold text-navy-700 bg-white">
                                            Time
                                        </th>
                                        {daysOfWeek.map((day, index) => (
                                            <th
                                                key={index}
                                                className="border-r border-gray-200 p-2 last:border-r-0 bg-white"
                                            >
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <span className="text-xs text-navy-500">
                                                            {getDayName(day)}
                                                        </span>
                                                        <span className="text-xs text-navy-700">
                                                            {formatDate(day)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {/* Time slots */}
                                    {timeSlots.map((time, timeIndex) => (
                                        <tr
                                            key={timeIndex}
                                            className="bg-white hover:bg-gray-50"
                                            style={{ transition: "all 0.2s" }}
                                        >
                                            <td className="border-r border-b border-navy-100 p-2 w-28 text-center font-medium text-xs text-navy-700">
                                                <div className="flex items-center justify-center">
                                                    <Clock className="h-3 w-3 mr-1 text-navy-400" />
                                                    <span>{time.display}</span>
                                                </div>
                                            </td>
                                            {daysOfWeek.map((day, dayIndex) => {
                                                const filteredClassesInSlot =
                                                    getFilteredClassesForSlot(
                                                        day,
                                                        time.time24
                                                    );
                                                const hasClass =
                                                    filteredClassesInSlot.length >
                                                    0;

                                                return (
                                                    <td
                                                        key={dayIndex}
                                                        className={`border-r border-b border-navy-100 p-1 last:border-r-0 ${
                                                            hasClass
                                                                ? ""
                                                                : "bg-white"
                                                        }`}
                                                    >
                                                        {filteredClassesInSlot.map(
                                                            (cls) => (
                                                                <div
                                                                    key={cls.id}
                                                                    onClick={() =>
                                                                        handleEventClick(
                                                                            cls
                                                                        )
                                                                    }
                                                                    className={`p-1.5 rounded-md text-xs shadow-sm mb-1 last:mb-0 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                                        // Border color based on class type
                                                                        cls.class_type ===
                                                                        "Premium"
                                                                            ? "border-l-4 border-amber-500 "
                                                                            : cls.class_type ===
                                                                              "Group"
                                                                            ? "border-l-4 border-orange-500 "
                                                                            : "border-l-4 border-navy-500 "
                                                                    }${
                                                                        // Background color based on status
                                                                        cls.status ===
                                                                        "FC not consumed (RG)"
                                                                            ? "bg-purple-100 hover:bg-purple-200 text-purple-900"
                                                                            : cls.status ===
                                                                              "FC consumed (RG)"
                                                                            ? "bg-purple-200 hover:bg-purple-300 text-purple-900"
                                                                            : cls.status ===
                                                                              "Completed (RG)"
                                                                            ? "bg-green-100 hover:bg-green-200 text-green-900"
                                                                            : cls.status ===
                                                                              "Completed (PRM)"
                                                                            ? "bg-blue-100 hover:bg-blue-200 text-blue-900"
                                                                            : cls.status ===
                                                                              "Absent w/ntc counted (RG)"
                                                                            ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-900"
                                                                            : cls.status ===
                                                                              "Absent w/o ntc counted (RG)"
                                                                            ? "bg-amber-100 hover:bg-amber-200 text-amber-900"
                                                                            : cls.status ===
                                                                              "Absent w/ntc-not counted (RG)"
                                                                            ? "bg-orange-100 hover:bg-orange-200 text-orange-900"
                                                                            : cls.status ===
                                                                              "Cancelled (RG)"
                                                                            ? "bg-red-100 hover:bg-red-200 text-red-900"
                                                                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                                                                    }`}
                                                                >
                                                                    <div>
                                                                        <div className="flex items-center">
                                                                            {cls.class_type ===
                                                                            "Premium" ? (
                                                                                <Gem className="h-3 w-3 text-amber-600 mr-1" />
                                                                            ) : cls.class_type ===
                                                                              "Group" ? (
                                                                                <Users className="h-3 w-3 text-orange-600 mr-1" />
                                                                            ) : (
                                                                                <User className="h-3 w-3 text-navy-600 mr-1" />
                                                                            )}
                                                                            <span className="font-medium">
                                                                                {
                                                                                    cls.student_name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        {cls.teacher_name && (
                                                                            <div className="text-[10px] text-navy-500 mt-0.5 truncate">
                                                                                {
                                                                                    cls.teacher_name
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {/* Event Details Modal */}
            <DetailsCalendarModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                event={selectedEvent}
                onSaveNotes={handleSaveNotes}
                onJoinClass={handleJoinClass}
            />
        </AdminLayout>
    );
}
