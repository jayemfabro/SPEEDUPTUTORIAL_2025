import React, { useState, useEffect, useMemo, useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import DetailsCalendarModal from "@/Components/Admin/DetailsCalendarModal";
import Legend from "@/Components/Admin/Legend";
import { CLASS_TYPE_COLORS, CLASS_STATUS_COLORS } from "@/utils/colorMapping";
import axios from "axios";
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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    
    // State for teachers and classes
    const [teachers, setTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [classes, setClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);

    // Status options for filter (matching the legend)
    const statuses = [
        "Valid for cancellation",
        "FC not consumed",
        "Completed",
        "Absent w/ntc counted",
        "Cancelled",
        "Absent w/ntc-not counted",
        "FC consumed",
    ];

    // Fetch teachers from API
    const fetchTeachers = async () => {
        setLoadingTeachers(true);
        try {
            const response = await axios.get('/api/admin/active-teachers');
            setTeachers(response.data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            setError('Failed to load teachers');
        } finally {
            setLoadingTeachers(false);
        }
    };

    // Fetch teachers on component mount
    useEffect(() => {
        fetchTeachers();
    }, []);

    // Fetch classes on component mount and when filters change
    useEffect(() => {
        fetchClasses();
    }, [currentWeek, teacherFilter]);

    // Fetch classes from API
    const fetchClasses = async () => {
        setLoadingClasses(true);
        try {
            const params = new URLSearchParams();
            
            // Add teacher filter if selected
            if (teacherFilter !== 'all') {
                params.append('teacher_id', teacherFilter);
            }
            
            // Add date range for current week
            const startOfWeek = new Date(currentWeek);
            const day = startOfWeek.getDay();
            startOfWeek.setDate(startOfWeek.getDate() - day + 1); // Start from Monday
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Sunday
            
            params.append('start_date', startOfWeek.toISOString().split('T')[0]);
            params.append('end_date', endOfWeek.toISOString().split('T')[0]);
            
            const response = await axios.get(`/api/admin/calendar-classes?${params}`);
            const classesData = response.data || [];
            console.log('API response (admin/calendar-classes):', classesData);
            
            // PRE-PROCESS the student names in group classes before setting state
            const processedClasses = [];
            
            classesData.forEach(classItem => {
                // Special handling for group classes with multiple student names
                if (classItem.class_type === 'Group' && classItem.student_name) {
                    console.log('Pre-processing group class:', classItem.student_name);
                    
                    // Handle "kai, mei..." format - need to extract individual names
                    if (classItem.student_name.includes(',')) {
                        console.log('Found group class with multiple students:', classItem.student_name);
                        
                        // Remove the ellipsis if present
                        const cleanedName = classItem.student_name.replace('...', '');
                        
                        // Split by comma and create individual class items
                        const studentNames = cleanedName.split(',')
                            .map(name => name.trim())
                            .filter(name => name.length > 0);
                            
                        console.log('Split into individual students:', studentNames);
                        
                        // Create a separate class item for each student
                        studentNames.forEach(studentName => {
                            const newClassItem = {...classItem};
                            newClassItem.student_name = studentName;
                            newClassItem.original_student_list = classItem.student_name;
                            newClassItem.isIndividualGroupStudent = true;
                            processedClasses.push(newClassItem);
                        });
                    } else {
                        // No commas - just a single student in a group class
                        processedClasses.push(classItem);
                    }
                } else {
                    // Not a group class - add as is
                    processedClasses.push(classItem);
                }
            });
            
            console.log('Processed classes for individual display:', processedClasses.length);
            
            // Special handling for Sunday cards - set their status to "Valid for cancellation"
            processedClasses.forEach(cls => {
                // Make sure all Sunday classes have "Valid for cancellation" status
                if (cls.day === 'Sunday') {
                    cls.status = 'Valid for cancellation';
                    console.log('Set Sunday class to Valid for cancellation:', cls.student_name);
                }
            });
            
            setClasses(processedClasses);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setError('Failed to load classes');
        } finally {
            setLoadingClasses(false);
        }
    };

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

    // Make getClassesForSlot always use the latest classes state
    const getClassesForSlot = React.useCallback((day, time24) => {
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
    }, [classes]);

    const formatDate = (date) => {
        return `${date.getMonth() + 1}.${date.getDate()}`;
    };

    // Handle opening the event details modal
    const handleEventClick = (event) => {
        // Create a clean copy of the event for the modal
        const eventForModal = {
            ...event,
            date: event.date ? new Date(event.date) : new Date(),
            endDate: event.endDate ? new Date(event.endDate) : new Date(),
        };
        
        // If this is a group class, provide additional information
        if (event.class_type === 'Group') {
            // Find other students in this group class
            const otherStudentsInGroup = classes
                .filter(ev =>
                    ev.class_type === 'Group' &&
                    ev.time === event.time &&
                    ev.teacher_id === event.teacher_id &&
                    ev.id !== event.id &&
                    (ev.date instanceof Date ? ev.date.toDateString() : new Date(ev.date).toDateString()) === 
                    (event.date instanceof Date ? event.date.toDateString() : new Date(event.date).toDateString())
                )
                .map(ev => ev.student_name);
                
            // Add group class information to the modal data
            eventForModal.isGroupClassStudent = true;
            eventForModal.otherStudentsInGroup = otherStudentsInGroup;
            eventForModal.groupNote = `This student is part of a group class with: ${[event.student_name, ...otherStudentsInGroup].join(', ')}`;
        }
        
        setSelectedEvent(eventForModal);
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

    // Handle status change in the modal
    const handleStatusChange = (eventId, newStatus) => {
        // Only update the selected event status in the modal, not the main classes array
        if (selectedEvent && selectedEvent.id === eventId) {
            setSelectedEvent(prev => ({
                ...prev,
                status: newStatus
            }));
        }
        // Do NOT update setClasses here!
    };

    // Handle class update (Update button functionality)
    const handleUpdateClass = async (eventId) => {
        try {
            setLoading(true);
            const eventToUpdate = selectedEvent;
            if (!eventToUpdate) {
                console.error('No event selected for update');
                return;
            }
            
            // Single class update for the selected student
            const updateData = {
                teacher_id: eventToUpdate.teacher_id,
                student_name: eventToUpdate.student_name,
                class_type: eventToUpdate.class_type,
                schedule: eventToUpdate.date ? eventToUpdate.date.toISOString().split('T')[0] : '',
                time: eventToUpdate.time,
                status: eventToUpdate.status
            };
            
            // If user wants to update all students in the group (optional future feature)
            const updateAllInGroup = eventToUpdate.class_type === 'Group' && 
                                     eventToUpdate.isGroupClassStudent && 
                                     eventToUpdate.updateAllInGroup;
            
            if (updateAllInGroup) {
                // Find all students in this group class
                const groupStudents = classes.filter(ev =>
                    ev.class_type === 'Group' &&
                    ev.time === eventToUpdate.time &&
                    ev.teacher_id === eventToUpdate.teacher_id &&
                    (ev.date instanceof Date ? ev.date.toDateString() : new Date(ev.date).toDateString()) === 
                    (eventToUpdate.date instanceof Date ? eventToUpdate.date.toDateString() : new Date(eventToUpdate.date).toDateString())
                );
                
                // Update all students in the group
                await Promise.all(groupStudents.map(async (cls) => {
                    const studentUpdateData = {
                        ...updateData,
                        student_name: cls.student_name
                    };
                    await axios.put(`/api/admin/classes/${cls.id}`, studentUpdateData);
                }));
                
                // Update local state
                setClasses(prevClasses => prevClasses.map(cls => {
                    if (groupStudents.some(g => g.id === cls.id)) {
                        return { ...cls, status: eventToUpdate.status };
                    }
                    return cls;
                }));
                
                setShowDetailsModal(false);
                toast.success('All students in group class updated successfully!', {
                  position: 'top-right',
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
            } else {
                // Update just the selected student
                const response = await axios.put(`/api/admin/classes/${eventId}`, updateData);
                if (response.data && response.data.class) {
                    setClasses(prevClasses =>
                        prevClasses.map(cls =>
                            cls.id === eventId ? { ...cls, ...response.data.class } : cls
                        )
                    );
                    setShowDetailsModal(false);
                    toast.success('Class updated successfully!', {
                      position: 'top-right',
                      autoClose: 2000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    });
                }
            }
        } catch (error) {
            console.error('Error updating class:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Error updating class: ${error.response.data.message}`, {
                  position: 'top-right',
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
            } else {
                toast.error('Failed to update class. Please try again.', {
                  position: 'top-right',
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
            }
        } finally {
            setLoading(false);
        }
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

        // Then apply teacher filter (server-side filtering is preferred, but this provides client-side backup)
        if (teacherFilter !== "all") {
            result = result.filter((cls) => 
                String(cls.teacher_id) === String(teacherFilter)
            );
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

    // Make getFilteredClassesForSlot always use the latest filteredClassesMap
    const getFilteredClassesForSlot = React.useCallback((day, time24) => {
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
    }, [filteredClassesMap]);

    // Generate unique statuses for filter dropdown with proper formatting
    // const statuses = useMemo(() => {
    //     const statusSet = new Set();
    //     classes.forEach((cls) => {
    //         // Clean up status by removing (RG) suffix for display
    //         const cleanStatus = cls.status.replace(/\s*\(RG\)$/, "").trim();
    //         statusSet.add(cleanStatus);
    //     });

    //     // Convert to array and sort
    //     const sortedStatuses = Array.from(statusSet).sort();

    //     // Move 'Completed' to the top if it exists
    //     const completedIndex = sortedStatuses.findIndex((s) =>
    //         s.startsWith("Completed")
    //     );
    //     if (completedIndex > 0) {
    //         const [completed] = sortedStatuses.splice(completedIndex, 1);
    //         sortedStatuses.unshift(completed);
    //     }

    //     return sortedStatuses;
    // }, [classes]);

    // Helper function to get event styles (matching the screenshot exactly)
    const getEventStyles = (classType, status = 'scheduled') => {
        // Class type styling
        let typeIcon = null;
        
        // Status styling (background color matching the exact screenshot)
        let bg = '';
        let text = '';
        let secondaryText = '';
        let statusIcon = null;
        let cssClass = '';
        
        switch (status) {
            case 'Valid for cancellation':
            case 'Valid for Cancellation':
                bg = 'bg-[#94a3b8]'; // Gray color from screenshot
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <div className="flex items-center w-full">
                    <span className="text-xs font-semibold">V</span>
                    <span className="ml-1 text-xs">{classType === "Premium" ? "P " : classType === "Group" ? "G " : "R "}</span>
                </div>;
                cssClass = 'bg-[#94a3b8] text-white';
                break;
            case 'FC not consumed':
            case 'Free Class':
                bg = 'bg-[#fcd34d]'; // Yellow color from screenshot
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <div className="flex items-center w-full">
                    <span className="text-xs font-semibold">FC</span>
                    <span className="ml-1 text-xs"></span>
                </div>;
                cssClass = 'bg-[#fcd34d] text-white';
                break;
            case 'Completed':
                bg = 'bg-[#4ade80]'; // Green color from screenshot
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <div className="flex items-center w-full">
                    <span className="text-xs font-semibold">C</span>
                    <span className="ml-1 text-xs"></span>
                </div>;
                cssClass = 'bg-[#4ade80] text-white';
                break;
            case 'Absent w/ntc counted':
                bg = 'bg-[#60a5fa]'; // Blue color from screenshot
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <div className="flex items-center w-full">
                    <span className="text-xs font-semibold">A</span>
                    <span className="ml-1 text-xs"></span>
                </div>;
                cssClass = 'bg-[#60a5fa] text-white';
                break;
            case 'Cancelled':
                bg = 'bg-[#c084fc]'; // Purple color from screenshot
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <div className="flex items-center w-full">
                    <span className="text-xs font-semibold">CL</span>
                    <span className="ml-1 text-xs"></span>
                </div>;
                cssClass = 'bg-[#c084fc] text-white';
                break;
            case 'Absent w/ntc-not counted':
                bg = 'bg-[#64748b]'; // Dark Gray color from screenshot
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <div className="flex items-center w-full">
                    <span className="text-xs font-semibold">ANC</span>
                    <span className="ml-1 text-xs"></span>
                </div>;
                cssClass = 'bg-[#64748b] text-white';
                break;
            case 'FC consumed':
                bg = 'bg-[#f472b6]'; // Pink color from screenshot
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <div className="flex items-center w-full">
                    <span className="text-xs font-semibold">FCC</span>
                    <span className="ml-1 text-xs"></span>
                </div>;
                cssClass = 'bg-[#f472b6] text-white';
                break;
            case 'Absent Without Notice':
                bg = 'bg-[#ef4444]'; // Red color from screenshot
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <div className="flex items-center w-full">
                    <span className="text-xs font-semibold">AWN</span>
                    <span className="ml-1 text-xs"></span>
                </div>;
                cssClass = 'bg-[#ef4444] text-white';
                break;
            case 'scheduled':
            default:
                // Based on class type - using exact colors from screenshot
                if (classType === "Premium") {
                    bg = 'bg-[#f472b6]'; // Pink from screenshot
                    text = 'text-white';
                    secondaryText = 'text-white';
                    statusIcon = <div className="flex items-center w-full">
                        <span className="text-xs font-semibold">P</span>
                        <span className="ml-1 text-xs"></span>
                    </div>;
                    cssClass = 'bg-[#f472b6] text-white';
                } else if (classType === "Group") {
                    bg = 'bg-[#4ade80]'; // Green from screenshot
                    text = 'text-white';
                    secondaryText = 'text-white';
                    statusIcon = <div className="flex items-center w-full">
                        <span className="text-xs font-semibold">G</span>
                        <span className="ml-1 text-xs"></span>
                    </div>;
                    cssClass = 'bg-[#4ade80] text-white';
                } else {
                    bg = 'bg-[#c084fc]'; // Purple from screenshot
                    text = 'text-white';
                    secondaryText = 'text-white';
                    statusIcon = <div className="flex items-center w-full">
                        <span className="text-xs font-semibold">R</span>
                        <span className="ml-1 text-xs"></span>
                    </div>;
                    cssClass = 'bg-[#c084fc] text-white';
                }
                break;
        }
        
        return {
            bg,
            text,
            secondaryText,
            border,
            typeIcon,
            statusIcon,
            cssClass
        };
    };

    // Helper to get all stats for a student from allClasses (matching Students.jsx)
    function getStudentStatsFromClasses(student, allClasses) {
        const studentClasses = allClasses.filter(cls => cls.student_name === student.name);
        const completed = studentClasses.filter(cls => cls.status === "Completed").length;
        const absentWntcCounted = studentClasses.filter(cls => cls.status === "Absent w/ntc counted").length;
        const cancelled = studentClasses.filter(cls => cls.status === "Cancelled").length;
        const absentWntcNotCounted = studentClasses.filter(cls => cls.status === "Absent w/ntc-not counted").length;
        const fcConsumed = studentClasses.filter(cls => cls.status === "FC consumed").length;
        const purchased = (student.purchased_class_regular || 0)
            + (student.purchased_class_premium || 0)
            + (student.purchased_class_group || 0);
        // Free classes: +1 for each Cancelled or Absent w/ntc-not counted, -1 for each FC consumed
        const freeClasses = Math.max(0, cancelled + absentWntcNotCounted - fcConsumed);
        // Class left: purchased - completed - absentWntcCounted - fcConsumed
        const classLeft = Math.max(0, purchased - completed - absentWntcCounted - fcConsumed);
        // Free class consumed: count of FC consumed
        const freeClassConsumed = fcConsumed;
        return {
            completed,
            absentWntcCounted,
            freeClasses,
            classLeft,
            freeClassConsumed,
        };
    }

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

            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                                                        String(t.id) === teacherFilter
                                                )?.name || "Teacher"}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">
                                                {loadingTeachers ? "Loading teachers..." : "All Teachers"}
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
                                                {loadingTeachers ? (
                                                    <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                                                        Loading teachers...
                                                    </div>
                                                ) : (
                                                    teachers.map((teacher) => (
                                                        <button
                                                            key={teacher.id}
                                                            type="button"
                                                            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                teacherFilter ===
                                                                String(teacher.id)
                                                                    ? "bg-navy-600 text-white"
                                                                    : "hover:bg-gray-100 text-gray-700"
                                                            }`}
                                                            onClick={() => {
                                                                setTeacherFilter(
                                                                    String(teacher.id)
                                                                );
                                                                setFilterOpen(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            <User className="h-4 w-4 mr-2" />
                                                            {teacher.name}
                                                        </button>
                                                    ))
                                                )}
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
                                                    All Statuses
                                                </button>
                                                
                                                {statuses.map((status) => {
                                                    // Get status color based on status name (matching legend)
                                                    let statusColor = '';
                                                    let borderColor = '';
                                                    
                                                    switch (status) {
                                                        case 'Valid for cancellation':
                                                            statusColor = 'bg-gray-400';
                                                            borderColor = 'border-gray-300';
                                                            break;
                                                        case 'FC not consumed':
                                                            statusColor = 'bg-yellow-400';
                                                            borderColor = 'border-yellow-500';
                                                            break;
                                                        case 'Completed':
                                                            statusColor = 'bg-green-400';
                                                            borderColor = 'border-green-500';
                                                            break;
                                                        case 'Absent w/ntc counted':
                                                            statusColor = 'bg-blue-400';
                                                            borderColor = 'border-blue-500';
                                                            break;
                                                        case 'Cancelled':
                                                            statusColor = 'bg-purple-400';
                                                            borderColor = 'border-purple-500';
                                                            break;
                                                        case 'Absent w/ntc-not counted':
                                                            statusColor = 'bg-gray-600';
                                                            borderColor = 'border-gray-500';
                                                            break;
                                                        case 'FC consumed':
                                                            statusColor = 'bg-pink-400';
                                                            borderColor = 'border-pink-400';
                                                            break;
                                                        default:
                                                            statusColor = 'bg-[#4B5563]';
                                                            borderColor = 'border-[#4B5563]';
                                                            break;
                                                    }
                                                    
                                                    return (
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
                                                            setStatusFilter(status);
                                                            setFilterOpen(false);
                                                        }}
                                                    >
                                                        <span className={`w-4 h-4 ${statusColor} ${borderColor} border flex-shrink-0 rounded-sm mr-3`}></span>
                                                        {status}
                                                    </button>
                                                    );
                                                })}
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
                    {loading || loadingClasses ? (
                        <div className="p-6 sm:p-8 text-center">
                            <div className="inline-block h-7 sm:h-8 w-7 sm:w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                            <p className="mt-2 text-sm sm:text-base text-gray-600">
                                {loadingClasses ? "Loading classes..." : "Loading..."}
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
                                                
                                                // Uncomment for debugging if needed
                                                /*if (filteredClassesInSlot.length > 0) {
                                                    console.log(`Classes for ${getDayName(day)}, ${time.display}:`, 
                                                        filteredClassesInSlot.map(c => ({
                                                            id: c.id,
                                                            name: c.student_name,
                                                            type: c.class_type,
                                                            status: c.status
                                                        }))
                                                    );
                                                }*/
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
                                                        {/* Display all classes as individual cards, including group classes */}
                                                        {filteredClassesInSlot.map(cls => {
                                                            // Check if this is a Sunday card
                                                            const isSunday = getDayName(day) === 'Sunday';
                                                            
                                                            // Apply styling directly based on status or class type
                                                            // This matches exactly with Legend.jsx
                                                            let cardStyle = '';
                                                            let statusIcon = null;
                                                            
                                                            // First check if class has status - priority over class type
                                                            // Set the left border color based on class type (exactly matching Legend.jsx)
                                                            let leftBorderColor = '';
                                                            if (cls.class_type === 'Premium') {
                                                                leftBorderColor = 'border-l-orange-400'; // Orange for premium from Legend.jsx
                                                            } 
                                                            else if (cls.class_type === 'Group') {
                                                                leftBorderColor = 'border-l-[#4A9782]'; // Custom green for group from Legend.jsx
                                                            } 
                                                            else {
                                                                leftBorderColor = 'border-l-navy-500'; // Navy for regular from Legend.jsx
                                                            }
                                                            
                                                            // Set card background color based on class status (exactly matching Legend.jsx)
                                                            if (isSunday || cls.status === 'Valid for cancellation' || cls.status === 'Valid for Cancellation') {
                                                                cardStyle = 'bg-gray-400 text-gray-700'; // Very light gray to match screenshot
                                                            } else if (cls.status === 'FC not consumed' || cls.status === 'Free Class') {
                                                                cardStyle = 'bg-yellow-400 text-gray-700';
                                                            } else if (cls.status === 'Completed') {
                                                                cardStyle = 'bg-green-400 text-gray-700';
                                                            } else if (cls.status === 'Absent w/ntc counted') {
                                                                cardStyle = 'bg-blue-400 text-gray-700';
                                                            } else if (cls.status === 'Cancelled') {
                                                                cardStyle = 'bg-purple-400 text-gray-700';
                                                            } else if (cls.status === 'Absent w/ntc-not counted') {
                                                                cardStyle = 'bg-gray-600 text-white';
                                                            } else if (cls.status === 'FC consumed') {
                                                                cardStyle = 'bg-pink-400 text-gray-700';
                                                            } else if (cls.status === 'Absent Without Notice') {
                                                                cardStyle = 'bg-red-400 text-gray-700';
                                                            } else {
                                                                // Default (scheduled) - gray background
                                                                cardStyle = 'bg-gray-500 text-white';
                                                            }
                                                            
                                                            const [bgClass, textClass, borderClass] = cardStyle.split(' ');
                                                            
                                                            return (
                                                                <div
                                                                    key={cls.id}
                                                                    onClick={() => handleEventClick(cls)}
                                                                    className={`border-l-4 ${leftBorderColor} py-1.5 px-2 rounded-md text-xs shadow mb-1 last:mb-0 cursor-pointer transition-all duration-200 hover:shadow-md ${bgClass} ${textClass}`}
                                                                >
                                                                    {/* Student name only with user icon */}
                                                                    <div className="flex items-center">
                                                                        <User className="h-3 w-3 mr-1.5" />
                                                                        <span className="text-xs font-medium truncate">{cls.student_name}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
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
                onStatusChange={handleStatusChange}
                onSaveNotes={handleSaveNotes}
                onJoinClass={handleUpdateClass}
            />
            <ToastContainer />
        </AdminLayout>
    );
}
