import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import DetailsCalendarModal from "@/Components/Admin/DetailsCalendarModal";
import MoreClassesModal from "@/Components/Teacher/MoreClassesModal";
import {
    ChevronDown,
    ChevronUp,
    Search,
    User,
    Users,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ListFilter,
    Gem,
    Calendar,
} from "lucide-react";
import Legend from "@/Components/Admin/Legend";
import { CLASS_TYPE_COLORS, CLASS_STATUS_COLORS } from "@/utils/colorMapping";
import axios from "axios";
import refreshEventManager from "@/utils/refreshEvents";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function AdminCalendar() {
    // State for calendar and events
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [renderKey, setRenderKey] = useState(0); // Force re-render key
    const [forceUpdateTimestamp, setForceUpdateTimestamp] = useState(Date.now());
    const [calendarKey, setCalendarKey] = useState(0); // Calendar component key

    // Filter states
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [teacherFilter, setTeacherFilter] = useState("all");

    // State for the modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLegendExpanded, setIsLegendExpanded] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // State for MoreClassesModal
    const [showMoreClassesModal, setShowMoreClassesModal] = useState(false);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [selectedDayDate, setSelectedDayDate] = useState(null);

    // State for teachers
    const [teachers, setTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);

    // Handle notes save
    const handleSaveNotes = (eventId, notes) => {
        console.log(`Admin saving notes for event ${eventId}:`, notes);

        // Update the local state
        setAllEvents(
            allEvents.map((event) =>
                event.id === eventId ? { ...event, notes } : event
            )
        );

        setFilteredEvents(
            filteredEvents.map((event) =>
                event.id === eventId ? { ...event, notes } : event
            )
        );

        // If the selected event is the one being updated, update it as well
        if (selectedEvent && selectedEvent.id === eventId) {
            setSelectedEvent({ ...selectedEvent, notes });
        }

        // Force re-render to ensure updates are visible
        setRenderKey(prev => prev + 1);
        setForceUpdateTimestamp(Date.now());
        setCalendarKey(prev => prev + 1);
    };

    // Handle status change in the modal
    const handleStatusChange = (eventId, newStatus) => {
        console.log('Admin HandleStatusChange called:', eventId, newStatus);
        
        // Update the selected event status immediately
        if (selectedEvent && selectedEvent.id === eventId) {
            setSelectedEvent(prev => ({
                ...prev,
                status: newStatus
            }));
        }
        
        // Update the events in the local state immediately
        setAllEvents(prevEvents => {
            const updated = prevEvents.map(event =>
                event.id === eventId ? { ...event, status: newStatus } : event
            );
            console.log('Updated admin allEvents:', updated);
            return updated;
        });
        
        setFilteredEvents(prevEvents => {
            const updated = prevEvents.map(event =>
                event.id === eventId ? { ...event, status: newStatus } : event
            );
            console.log('Updated admin filteredEvents:', updated);
            return updated;
        });

        // Single refresh to update colors
        setRenderKey(prev => prev + 1);
        setForceUpdateTimestamp(Date.now());
        setCalendarKey(prev => prev + 1);
        
        // Trigger cross-component refresh event
        refreshEventManager.triggerEventUpdate(eventId, 'status_change', 'admin');
        
        // Force immediate notification refresh to update bell for teacher
        if (window.refreshNotifications) {
            window.refreshNotifications();
        }
        
        // Also trigger immediate teacher calendar refresh
        setTimeout(() => {
            refreshEventManager.triggerRefresh('admin_status_change');
        }, 100);
    };

    // Handle class update (Update button functionality)
    const handleUpdateClass = async (eventId, updateData) => {
        try {
            setLoading(true);
            const eventToUpdate = updateData || selectedEvent;
            if (!eventToUpdate) {
                console.error('No event selected for update');
                return;
            }
            
            const payload = {
                teacher_id: eventToUpdate.teacher_id,
                student_name: eventToUpdate.student_name,
                class_type: eventToUpdate.class_type,
                schedule: eventToUpdate.date ? eventToUpdate.date.toISOString().split('T')[0] : '',
                time: eventToUpdate.time,
                status: eventToUpdate.status
            };
            
            const response = await axios.put(`/api/admin/classes/${eventId}`, payload);
            const updatedEventData = response.data && response.data.class
                ? { ...response.data.class }
                : { ...payload, id: eventId };
            
            setAllEvents(prevEvents => {
                const updated = prevEvents.map(event =>
                    event.id === eventId ? { ...event, ...updatedEventData } : event
                );
                setRenderKey(prev => prev + 1);
                return updated;
            });
            
            setFilteredEvents(prevEvents => {
                const updated = prevEvents.map(event =>
                    event.id === eventId ? { ...event, ...updatedEventData } : event
                );
                return updated;
            });
            
            setSelectedEvent(prev => prev ? { ...prev, ...updatedEventData } : null);
            setShowDetailsModal(false);
            
            toast.success('Class updated successfully!', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error updating class:', error);
            toast.error('Error updating class.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper function to convert date to weekday name
    const getWeekdayFromDate = (date) => {
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

    // Status options for filter (matching the legend)
    const statuses = [
        "Valid for cancellation",
        "FC not consumed",
        "Completed",
        "Absent w/ntc counted",
        "Cancelled",
        "Absent w/ntc-not counted",
        "FC consumed",
        "Absent Without Notice",
    ];

    // Removed dummy events - now using real API data from fetchClasses()

    // Fetch teachers on component mount
    useEffect(() => {
        fetchTeachers();
    }, []);

    // Fetch classes when component mounts, month changes, or teacher filter changes
    useEffect(() => {
        fetchClasses();
    }, [selectedDate, teacherFilter]);

    // Removed auto-refresh mechanism that was polling every 3 seconds
    
    // Listen for external refresh events (e.g., from teacher updates)
    useEffect(() => {
        let refreshTimeout;
        
        const unsubscribe = refreshEventManager.addListener((refreshData) => {
            console.log('Admin received refresh event:', refreshData);
            
            // Clear any existing timeout to debounce rapid refreshes
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
            }
            
            // Debounce refresh calls to prevent rapid fire refreshes
            refreshTimeout = setTimeout(() => {
                // Trigger immediate data refresh
                fetchClasses();
                
                // Single refresh for real-time updates
                setRenderKey(prev => prev + 1);
                setForceUpdateTimestamp(Date.now());
                setCalendarKey(prev => prev + 1);
            }, 300); // 300ms debounce
        });
        
        // Cleanup listener and timeout on unmount
        return () => {
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
            }
            unsubscribe();
        };
    }, []);

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

    // Fetch classes from API
    const fetchClasses = async () => {
        console.log('Admin fetchClasses called for date:', selectedDate);
        setLoadingClasses(true);
        try {
            const params = new URLSearchParams();
            
            // Add teacher filter if selected
            if (teacherFilter !== 'all') {
                params.append('teacher_id', teacherFilter);
                console.log('Admin applying teacher filter:', teacherFilter);
            }
            
            // Add date range for current month
            const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            
            params.append('start_date', startOfMonth.toISOString().split('T')[0]);
            params.append('end_date', endOfMonth.toISOString().split('T')[0]);
            
            console.log('Admin fetching classes with params:', params.toString());
            const response = await axios.get(`/api/admin/calendar-classes?${params}`);
            const classes = response.data;
            console.log('Admin received classes data:', classes.length, 'classes');
            
            // Transform classes to events format for calendar
            const events = classes.map(cls => {
                try {
                    // Safety checks for required fields
                    if (!cls.date || !cls.time) {
                        console.warn('Class missing date or time in fetchClasses:', cls);
                        return null;
                    }
                    
                    // Parse date more carefully to avoid timezone issues
                    const [year, month, day] = cls.date.split('-').map(num => parseInt(num, 10));
                    const [hours, minutes] = cls.time.split(':').map(num => parseInt(num, 10));
                    
                    // Create date using local timezone to avoid date shifting
                    const date = new Date(year, month - 1, day, hours, minutes);
                    const endDate = new Date(date.getTime() + (cls.duration || 60) * 60000);
                    
                    return {
                        id: cls.id,
                        student_name: cls.student_name,
                        teacher_id: cls.teacher_id,
                        teacher_name: cls.teacher_name,
                        day: cls.day,
                        time: cls.time,
                        duration: cls.duration || 60,
                        class_type: cls.class_type,
                        status: cls.status,
                        date: date,
                        endDate: endDate,
                        notes: cls.notes || '',
                        title: cls.student_name + (cls.teacher_name ? ` (${cls.teacher_name})` : '')
                    };
                } catch (error) {
                    console.error('Error transforming class data in fetchClasses:', cls, error);
                    return null; // Return null for invalid entries
                }
            }).filter(event => event !== null); // Remove null entries
            
            console.log('Admin transformed events:', events.length, 'events');
            setAllEvents(events);
            setFilteredEvents(events);
            setRenderKey(prev => prev + 1); // Force re-render after fetching new events
        } catch (error) {
            console.error('Admin error fetching classes:', error);
            setError('Failed to load classes');
        } finally {
            setLoadingClasses(false);
        }
    };

    // Fetch data on mount
    useEffect(() => {
        fetchTeachers();
        fetchClasses();
    }, []);

    // Filter events when filters change
    useEffect(() => {
        let filtered = [...allEvents];

        // Apply teacher filter
        if (teacherFilter !== "all") {
            filtered = filtered.filter(
                (event) => event.teacher_id == teacherFilter // Use == instead of === to handle type mismatch
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(
                (event) => event.status === statusFilter
            );
        }

        // Apply search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((event) => {
                const studentName = event.student_name?.toLowerCase() || "";
                const teacherName = event.teacher_name?.toLowerCase() || "";
                const classType = event.class_type?.toLowerCase() || "";

                return (
                    studentName.includes(query) ||
                    teacherName.includes(query) ||
                    classType.includes(query)
                );
            });
        }

        setFilteredEvents(filtered);
    }, [allEvents, teacherFilter, statusFilter, searchQuery]);

    // Update events when filters change - simplified since we're now using the filteredEvents state
    // The main filtering is now handled by the useEffect that watches all filter states

    // Generate calendar days with actual events
    const generateCalendarDays = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const daysFromPrevMonth = firstDay.getDay();

        // Add days from previous month
        for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            const today = new Date();
            const isToday = date.getFullYear() === today.getFullYear() && 
                           date.getMonth() === today.getMonth() && 
                           date.getDate() === today.getDate();
            days.push({
                date,
                isCurrentMonth: false,
                isToday,
                events: getEventsForDate(date),
            });
        }

        // Add days from current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const today = new Date();
            const isToday = date.getFullYear() === today.getFullYear() && 
                           date.getMonth() === today.getMonth() && 
                           date.getDate() === today.getDate();
            days.push({
                date,
                isCurrentMonth: true,
                isToday,
                events: getEventsForDate(date),
            });
        }

        // Add days from next month
        const remainingDays = 42 - days.length; // Always show 6 weeks
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            const today = new Date();
            const isToday = date.getFullYear() === today.getFullYear() && 
                           date.getMonth() === today.getMonth() && 
                           date.getDate() === today.getDate();
            days.push({
                date,
                isCurrentMonth: false,
                isToday,
                events: getEventsForDate(date),
            });
        }

        return days;
    };

    // Helper function to get events for a specific date
    const getEventsForDate = (date) => {
        console.log('Admin getEventsForDate called for:', date.toDateString());
        // Use local date string comparison to avoid timezone issues
        const targetYear = date.getFullYear();
        const targetMonth = date.getMonth();
        const targetDay = date.getDate();
        
        // Only filter by date - other filters are already applied in filteredEvents
        const filtered = filteredEvents.filter((event) => {
            // Safety check: ensure event and event.date exist
            if (!event || !event.date) {
                console.warn('Admin event with missing date found:', event);
                return false;
            }
            
            // Ensure event.date is a valid Date object
            const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
            
            // Check if the date is valid
            if (isNaN(eventDate.getTime())) {
                console.warn('Admin event with invalid date found:', event);
                return false;
            }
            
            // Compare year, month, and day directly to avoid timezone issues
            const eventYear = eventDate.getFullYear();
            const eventMonth = eventDate.getMonth();
            const eventDay = eventDate.getDate();
            
            return eventYear === targetYear && eventMonth === targetMonth && eventDay === targetDay;
        });

        // Sort events by time (8:00, 8:30, 9:00, etc.)
        const sortedFiltered = filtered.sort((a, b) => {
            // If either event doesn't have a time, put it at the end
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            
            // Use localeCompare for consistent time string comparison
            return a.time.localeCompare(b.time);
        });

        console.log(`Admin found ${filtered.length} events for ${date.toDateString()}, sorted by time`);
        return {
            items: sortedFiltered,
            total: sortedFiltered.length,
        };
    };

    const calendarDays = generateCalendarDays();
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Navigation functions
    const goToPreviousMonth = () => {
        setSelectedDate(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
        );
    };

    const goToNextMonth = () => {
        setSelectedDate(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
        );
    };

    // Event handlers
    const handleEventClick = (event) => {
        console.log('Admin handleEventClick called with event:', event);
        // No need to gather all students, just show the selected student's event
        setSelectedEvent(event);
        setShowDetailsModal(true);
        console.log('Admin details modal opened for event:', event.id);
    };

    const handleMoreClassesClick = (dayEvents, dayDate) => {
        console.log('Admin handleMoreClassesClick called with:', { dayEvents, dayDate });
        // dayEvents now contains only the hidden events passed from the button click
        setSelectedDayEvents(dayEvents);
        setSelectedDayDate(dayDate);
        setShowMoreClassesModal(true);
        console.log('Admin modal state updated, showMoreClassesModal:', true);
    };

    const handleEventUpdated = async (eventId, newStatus) => {
        try {
            // Make API call to update the status
            await axios.patch(`/api/admin/classes/${eventId}/status`, {
                status: newStatus
            });
            
            // Update local state
            const updatedAllEvents = allEvents.map((event) => {
                if (event.id === eventId) {
                    return { ...event, status: newStatus };
                }
                return event;
            });

            const updatedFilteredEvents = filteredEvents.map((event) => {
                if (event.id === eventId) {
                    return { ...event, status: newStatus };
                }
                return event;
            });

            setAllEvents(updatedAllEvents);
            setFilteredEvents(updatedFilteredEvents);
            
            // Force re-render to update colors immediately
            setRenderKey(prev => prev + 1);
            setForceUpdateTimestamp(Date.now());
            setCalendarKey(prev => prev + 1);
            
            // Additional forced update
            setTimeout(() => {
                setRenderKey(prev => prev + 1);
                setForceUpdateTimestamp(Date.now());
                setCalendarKey(prev => prev + 1);
            }, 50);
            
            // Force state refresh
            setTimeout(() => {
                setAllEvents(prevEvents => [...prevEvents]);
                setFilteredEvents(prevEvents => [...prevEvents]);
            }, 100);
            
            setShowDetailsModal(false);

            console.log(`Updated admin class ${eventId} status to ${newStatus}`);
        } catch (error) {
            console.error('Error updating class status:', error);
            alert('Failed to update class status. Please try again.');
        }
    };

    // Helper function to get event styles (matching TeacherCalendar.jsx)
    const getEventStyles = (classType, status = 'scheduled') => {
        // Class type styling (border color)
        let border = '';
        let typeIcon = null;
        
        switch (classType) {
            case "Premium":
                border = 'border-orange-400';
                typeIcon = <Gem className="h-3 w-3 text-white-600 mr-1" />;
                break;
            case "Group":
                border = 'border-[#4A9782]';
                typeIcon = <Users className="h-3 w-3 text-white mr-1" />;
                break;
            case "Regular":
            default:
                border = 'border-navy-500';
                typeIcon = <User className="h-3 w-3 text-white-600 mr-1" />;
                break;
        }
        
        // Status styling (background color matching legend)
        let bg = '';
        let text = '';
        let secondaryText = '';
        let statusIcon = null;
        
        switch (status) {
            case 'Valid for cancellation':
            case 'Valid for Cancellation':
                bg = 'bg-gray-400';
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <Calendar className="h-3 w-3 text-gray-200 mr-1" />;
                break;
            case 'FC not consumed':
            case 'Free Class':
                bg = 'bg-yellow-400';
                text = 'text-black';
                secondaryText = 'text-black';
                statusIcon = <Calendar className="h-3 w-3 text-yellow-200 mr-1" />;
                break;
            case 'Completed':
                bg = 'bg-green-400';
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <CheckCircle2 className="h-3 w-3 text-green-800 mr-1" />;
                break;
            case 'Absent w/ntc counted':
                bg = 'bg-blue-400';
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <AlertCircle className="h-3 w-3 text-blue-800 mr-1" />;
                break;
            case 'Cancelled':
                bg = 'bg-purple-400';
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <XCircle className="h-3 w-3 text-purple-800 mr-1" />;
                break;
            case 'Absent w/ntc-not counted':
                bg = 'bg-gray-600';
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <AlertCircle className="h-3 w-3 text-orange-800 mr-1" />;
                break;
            case 'FC consumed':
                bg = 'bg-pink-400';
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <Calendar className="h-3 w-3 text-pink-800 mr-1" />;
                break;
            case 'Absent Without Notice':
                bg = 'bg-red-400';
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <AlertCircle className="h-3 w-3 text-red-800 mr-1" />;
                break;
            case 'scheduled':
            default:
                bg = 'bg-slate-400';
                text = 'text-slate-900';
                secondaryText = 'text-slate-700';
                statusIcon = <Calendar className="h-3 w-3 text-slate-800" />;
                break;
        }
        
        return {
            bg,
            text,
            secondaryText,
            border,
            typeIcon,
            statusIcon
        };
    };

    // Helper function to get status information
    const getStatusInfo = (status) => {
        switch (status) {
            case "scheduled":
                return {
                    label: "Scheduled",
                    color: "bg-orange-50 text-orange-800 border border-orange-100",
                    icon: <Calendar className="h-4 w-4 text-orange-600" />,
                };
            case "completed":
                return {
                    label: "Completed",
                    color: "bg-green-50 text-green-800 border border-green-100",
                    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
                };
            case "cancelled":
                return {
                    label: "Cancelled",
                    color: "bg-red-50 text-red-800 border border-red-100",
                    icon: <XCircle className="h-4 w-4 text-red-600" />,
                };
            default:
                return {
                    label: "Unknown",
                    color: "bg-navy-50 text-navy-800 border border-navy-100",
                    icon: <AlertCircle className="h-4 w-4 text-navy-500" />,
                };
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Success Message */}
                {updateSuccess && (
                    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Class updated successfully!
                        </div>
                    </div>
                )}

                <Legend/>
                
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

                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                {/* Teacher Filter Dropdown */}
                                <div className="relative w-full sm:w-56 z-50">
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
                                            {teacherFilter &&
                                            teacherFilter !== "all" ? (
                                                <span className="truncate">
                                                    {teachers.find(
                                                        (t) =>
                                                            t.id ===
                                                            teacherFilter
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
                                                            teacherFilter ===
                                                                "all"
                                                                ? "bg-navy-600 text-white"
                                                                : "text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                        onClick={() => {
                                                            setTeacherFilter(
                                                                "all"
                                                            );
                                                            setFilterOpen(
                                                                false
                                                            );
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
                                                            <User className="h-4 w-4 mr-2 text-navy-600" />
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
                                        onClick={() =>
                                            setFilterOpen(
                                                filterOpen === "status"
                                                    ? null
                                                    : "status"
                                            )
                                        }
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
                                                                borderColor = 'border-gray-500';
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
                                                                borderColor = 'border-gray-600';
                                                                break;
                                                            case 'FC consumed':
                                                                statusColor = 'bg-pink-400';
                                                                borderColor = 'border-pink-400';
                                                                break;
                                                            case 'Absent Without Notice':
                                                                statusColor = 'bg-red-400';
                                                                borderColor = 'border-red-500';
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
                        </div>

                        {/* Month Navigation */}
                        <div className="flex items-center space-x-2 h-[42px]">
                            <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-navy-100 h-full">
                                <button
                                    onClick={goToPreviousMonth}
                                    className="h-full px-3 text-navy-600 hover:text-navy-800 hover:bg-navy-50 transition-colors duration-200 flex items-center"
                                    aria-label="Previous month"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <div className="px-3 text-sm font-medium text-navy-900 h-full flex items-center">
                                    {selectedDate.toLocaleDateString("en-US", {
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </div>

                                <button
                                    onClick={goToNextMonth}
                                    className="h-full px-3 text-navy-600 hover:text-navy-800 hover:bg-navy-50 transition-colors duration-200 flex items-center"
                                    aria-label="Next month"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar View */}
                <div key={renderKey} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-navy-700">
                        <h2 className="text-sm sm:text-base font-semibold text-white">
                            Monthly View
                        </h2>
                    </div>

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
                        <div className="overflow-x-auto w-full">
                            <div className="min-w-[320px] w-full">
                                <div className="grid grid-cols-7 border-b border-navy-100 bg-navy-50">
                                    {["S", "M", "T", "W", "T", "F", "S"].map(
                                        (day, index) => (
                                            <div
                                                key={index}
                                                className="py-1.5 sm:py-2 text-center text-[10px] xs:text-xs font-medium text-navy-600 uppercase tracking-wider"
                                            >
                                                {window.innerWidth < 400
                                                    ? day
                                                    : [
                                                          "Sun",
                                                          "Mon",
                                                          "Tue",
                                                          "Wed",
                                                          "Thu",
                                                          "Fri",
                                                          "Sat",
                                                      ][index]}
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="grid grid-cols-7">
                                    {calendarDays.map((day, index) => {
                                        const maxVisibleEvents =
                                            window.innerWidth < 640 ? 1 : 3;
                                        const hasMoreEvents =
                                            day.events.total > maxVisibleEvents;

                                        return (
                                            <div
                                                key={`${day.date.toISOString()}-${renderKey}-${forceUpdateTimestamp}`}
                                                className={`min-h-[4rem] sm:min-h-28 p-1 border-r border-b border-navy-100 transition-colors duration-150 ${
                                                    day.isCurrentMonth
                                                        ? "bg-white hover:bg-navy-50"
                                                        : "bg-navy-50/30 text-navy-400 hover:bg-navy-50/50"
                                                } ${
                                                    day.isToday
                                                        ? "bg-orange-50 border-l-2 border-l-orange-500"
                                                        : ""
                                                }`}
                                            >
                                                <div className="flex justify-between items-start h-4">
                                                    <span
                                                        className={`text-xs font-medium ${
                                                            day.isToday
                                                                ? "flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-xs"
                                                                : "text-navy-700"
                                                        }`}
                                                    >
                                                        {day.date.getDate()}
                                                    </span>
                                                    {day.events.total > 0 && (
                                                        <span className="text-[9px] bg-orange-100 text-orange-700 font-medium px-1 py-0.5 rounded-full leading-none">
                                                            {day.events.total}
                                                        </span>
                                                    )}
                                                </div>

                                                {day.events.total > 0 && (
                                                    <div className="mt-1 space-y-0.5">
                                                        {/* Display individual cards for all events, including group classes */}
                                                        {(() => {
                                                            // Don't group classes - display each student individually
                                                            const allEvents = [...day.events.items];
                                                            
                                                            // Create individual cards for all events
                                                            const eventCards = allEvents.map((event) => {
                                                                const isEditing = showDetailsModal && selectedEvent && selectedEvent.id === event.id;
                                                                const statusForColor = isEditing && typeof window !== 'undefined' && window.__ADMIN_MODAL_LOCAL_STATUS__
                                                                    ? window.__ADMIN_MODAL_LOCAL_STATUS__
                                                                    : event.status;
                                                                const eventStyles = getEventStyles(event.class_type, statusForColor);
                                                                return (
                                                                    <div
                                                                        key={`${event.id}-${event.status}-${renderKey}-${forceUpdateTimestamp}`}
                                                                        onClick={() => handleEventClick(event)}
                                                                        className={`text-[9px] p-1 rounded cursor-pointer hover:opacity-90 transition-all duration-200 ${eventStyles.bg} border-l-4 ${eventStyles.border}`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex flex-col overflow-hidden">
                                                                                <div className="flex items-center">
                                                                                    {eventStyles.typeIcon}
                                                                                    <span className={`font-medium truncate max-w-[60px] xs:max-w-[80px] ${eventStyles.text}`}>{event.student_name}</span>
                                                                                </div>
                                                                                <div className={`text-[8px] truncate ${eventStyles.secondaryText}`} title={event.teacher_name}>{event.teacher_name}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`flex items-center justify-between mt-0.5 text-[8px] ${eventStyles.secondaryText}`}>
                                                                            <span>{event.date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}</span>
                                                                            <span className="flex items-center"><Clock className="h-2 w-2 mr-0.5" />{event.duration} min</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            });
                                                            
                                                            // Show up to maxVisibleEvents
                                                            return eventCards.slice(0, maxVisibleEvents);
                                                        })()}
                                                        {hasMoreEvents && (
                                                            <button
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    // Pass only the hidden events (the ones not displayed)
                                                                    const hiddenEvents = day.events.items.slice(maxVisibleEvents);
                                                                    handleMoreClassesClick(hiddenEvents, day.date);
                                                                }}
                                                                className="text-[9px] text-navy-500 hover:text-navy-700 w-full text-left px-1 py-0.5 hover:bg-navy-50 rounded"
                                                            >
                                                                +
                                                                {day.events
                                                                    .total -
                                                                    maxVisibleEvents}{" "}
                                                                more
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
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
                onNotesSave={handleSaveNotes}
                onJoinClass={handleUpdateClass}
            />

            {/* More Classes Modal */}
            <MoreClassesModal
                isOpen={showMoreClassesModal}
                onClose={() => {
                    console.log('Admin MoreClassesModal closing');
                    setShowMoreClassesModal(false);
                }}
                classes={selectedDayEvents}
                timeSlot="Additional Classes"
                day={selectedDayDate ? selectedDayDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) : ''}
                onClassClick={handleEventClick}
            />
            <ToastContainer />
        </AdminLayout>
    );
}
