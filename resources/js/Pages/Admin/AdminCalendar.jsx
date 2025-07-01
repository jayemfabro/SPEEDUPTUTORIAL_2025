import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import DetailsCalendarModal from "@/Components/Admin/DetailsCalendarModal";
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


export default function AdminCalendar() {
    // State for calendar and events
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter states
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [teacherFilter, setTeacherFilter] = useState("all");

    // State for the modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLegendExpanded, setIsLegendExpanded] = useState(false);

    // Handle notes save
    const handleSaveNotes = (eventId, notes) => {
        // In a real app, you would make an API call here to save the notes
        console.log(`Saving notes for event ${eventId}:`, notes);

        // Update the local state
        setAllEvents(
            allEvents.map((event) =>
                event.id === eventId ? { ...event, notes } : event
            )
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

    // Dummy teachers data - in a real app, this would come from an API
    const teachers = [
        { id: "t1", name: "John Smith", email: "john@example.com" },
        { id: "t2", name: "Sarah Johnson", email: "sarah@example.com" },
        { id: "t3", name: "Michael Brown", email: "michael@example.com" },
    ];

    // Status options for filter
    const statuses = [
        "All",
        "Completed (RG)",
        "Completed (PRM)",
        "FC not consumed (RG)",
        "FC consumed (RG)",
        "Absent w/ntc counted (RG)",
        "Absent w/o ntc counted (RG)",
        "Absent w/ntc-not counted (RG)",
        "Cancelled (RG)",
    ];

    // Dummy class data using the same structure as TeachersDailyCalendar.jsx
    const dummyEvents = [
        {
            id: 1,
            student_name: "Aurora",
            teacher_id: "t1",
            teacher_name: "John Smith",
            day: getWeekdayFromDate(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 5)
            ),
            time: "17:00",
            duration: 30,
            class_type: "Regular",
            status: "FC not consumed (RG)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                5,
                17,
                0
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                5,
                17,
                30
            ),
            title: "Aurora (John Smith)",
        },
        {
            id: 2,
            student_name: "Emma",
            teacher_id: "t2",
            teacher_name: "Sarah Johnson",
            day: getWeekdayFromDate(
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    10
                )
            ),
            time: "14:30",
            duration: 60,
            class_type: "Premium",
            status: "Completed (PRM)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                10,
                14,
                30
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                10,
                15,
                30
            ),
            title: "Emma (Sarah Johnson)",
        },
        {
            id: 3,
            student_name: "Liam",
            teacher_id: "t3",
            teacher_name: "Michael Brown",
            day: getWeekdayFromDate(
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    15
                )
            ),
            time: "16:00",
            duration: 45,
            class_type: "Group",
            status: "Completed (RG)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                15,
                16,
                0
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                15,
                16,
                45
            ),
            title: "Liam (Michael Brown)",
        },
        {
            id: 4,
            student_name: "Olivia",
            teacher_id: "t1",
            teacher_name: "John Smith",
            day: getWeekdayFromDate(
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    20
                )
            ),
            time: "11:00",
            duration: 30,
            class_type: "Regular",
            status: "Absent w/ntc counted",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                20,
                11,
                0
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                20,
                11,
                30
            ),
            title: "Olivia (John Smith)",
        },
        {
            id: 5,
            student_name: "Noah",
            teacher_id: "t2",
            teacher_name: "Sarah Johnson",
            day: getWeekdayFromDate(
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    25
                )
            ),
            time: "15:30",
            duration: 60,
            class_type: "Premium",
            status: "Cancelled",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                25,
                15,
                30
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                25,
                16,
                30
            ),
            title: "Noah (Sarah Johnson)",
        },
        {
            id: 6,
            student_name: "Sophia",
            teacher_id: "t3",
            teacher_name: "Michael Brown",
            day: getWeekdayFromDate(
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() + 1,
                    0
                )
            ),
            time: "10:00",
            duration: 30,
            class_type: "Regular",
            status: "FC consumed",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + 1,
                0,
                10,
                0
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + 1,
                0,
                10,
                30
            ),
            title: "Sophia (Michael Brown)",
        },
        {
            id: 7,
            student_name: "Eddie",
            day: getWeekdayFromDate(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6)
            ),
            time: "20:00",
            duration: 30,
            class_type: "Premium",
            status: "Completed (PRM)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                6,
                20,
                0
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                6,
                20,
                30
            ),
            title: "Eddie",
        },
        {
            id: 8,
            student_name: "Jane Zhang",
            day: getWeekdayFromDate(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6)
            ),
            time: "20:30",
            duration: 30,
            class_type: "Regular",
            status: "Absent w/o ntc counted (RG)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                6,
                20,
                30
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                6,
                21,
                0
            ),
            title: "Jane Zhang",
        },
        {
            id: 9,
            student_name: "Jane Zhang",
            day: getWeekdayFromDate(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6)
            ),
            time: "21:00",
            duration: 30,
            class_type: "Regular",
            status: "Absent w/ntc-not counted (RG)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                6,
                21,
                0
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                6,
                21,
                30
            ),
            title: "Jane Zhang",
        },
        {
            id: 10,
            student_name: "Alice Bu",
            day: getWeekdayFromDate(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6)
            ),
            time: "21:30",
            duration: 30,
            class_type: "Regular",
            status: "Cancelled (RG)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                6,
                21,
                30
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                6,
                22,
                0
            ),
            title: "Alice Bu",
        },
        {
            id: 11,
            student_name: "Matson Chen",
            day: getWeekdayFromDate(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 8)
            ),
            time: "17:00",
            duration: 30,
            class_type: "Premium",
            status: "Completed (PRM)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                8,
                17,
                0
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                8,
                17,
                30
            ),
            title: "Matson Chen",
        },
        {
            id: 12,
            student_name: "Group English",
            day: getWeekdayFromDate(
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    10
                )
            ),
            time: "18:00",
            duration: 60,
            class_type: "Group",
            status: "FC not consumed (RG)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                10,
                18,
                0
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                10,
                19,
                0
            ),
            title: "Group English",
        },
        {
            id: 13,
            student_name: "Group Science",
            day: getWeekdayFromDate(
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    12
                )
            ),
            time: "18:30",
            duration: 60,
            class_type: "Group",
            status: "Completed (RG)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                12,
                18,
                30
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                12,
                19,
                30
            ),
            title: "Group Science",
        },
        {
            id: 14,
            student_name: "Matson Chen",
            day: getWeekdayFromDate(
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    14
                )
            ),
            time: "16:30",
            duration: 30,
            class_type: "Premium",
            status: "Completed (PRM)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                14,
                16,
                30
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                14,
                17,
                0
            ),
            title: "Matson Chen",
        },
        {
            id: 15,
            student_name: "Amy Li",
            day: getWeekdayFromDate(
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    15
                )
            ),
            time: "18:00",
            duration: 30,
            class_type: "Regular",
            status: "FC not consumed (RG)",
            date: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                15,
                18,
                0
            ),
            endDate: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                15,
                18,
                30
            ),
            title: "Amy Li",
        },
    ];

    // Dummy class data generator function
    const generateDummyEvents = () => {
        // In a real app, this would fetch events from an API
        // For now, we'll just return the static dummy events
        return dummyEvents.map((event) => ({
            ...event,
            // Make sure dates are fresh Date objects to avoid reference issues
            date: new Date(event.date),
            endDate: new Date(event.endDate),
        }));
    };

    // Set events on component mount
    useEffect(() => {
        const events = generateDummyEvents();
        setAllEvents(events);
        setFilteredEvents(events);
    }, []);

    // Filter events when filters change
    useEffect(() => {
        let filtered = [...allEvents];

        // Apply teacher filter
        if (teacherFilter !== "all") {
            filtered = filtered.filter(
                (event) => event.teacher_id === teacherFilter
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
            days.push({
                date,
                isCurrentMonth: false,
                events: getEventsForDate(date),
            });
        }

        // Add days from current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            days.push({
                date,
                isCurrentMonth: true,
                events: getEventsForDate(date),
            });
        }

        // Add days from next month
        const remainingDays = 42 - days.length; // Always show 6 weeks
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            days.push({
                date,
                isCurrentMonth: false,
                events: getEventsForDate(date),
            });
        }

        return days;
    };

    // Helper function to get events for a specific date
    const getEventsForDate = (date) => {
        const dateString = date.toISOString().split("T")[0];
        const filtered = filteredEvents.filter((event) => {
            // Filter by date
            const eventDate = new Date(event.date).toISOString().split("T")[0];
            if (eventDate !== dateString) return false;

            // Apply search filter if present
            if (
                searchQuery &&
                !event.student_name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            ) {
                return false;
            }

            // Apply status filter if not 'all'
            if (statusFilter !== "all" && event.status !== statusFilter) {
                return false;
            }

            return true;
        });

        return {
            items: filtered,
            total: filtered.length,
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
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    const handleEventUpdated = (eventId, newStatus) => {
        // In a real app, you would make an API call here to update the event status
        // For now, we'll just update the local state
        const updatedEvents = events.map((event) => {
            if (event.id === eventId) {
                return { ...event, status: newStatus };
            }
            return event;
        });

        setEvents(updatedEvents);
        setShowDetailsModal(false);

        // In a real application, we would show a success message
        console.log(`Updated class ${eventId} status to ${newStatus}`);
    };

    // Helper function to get event icon and styling based on class type and status
    const getEventStyles = (classType, status = "scheduled") => {
        // Class type styling (border color)
        let border = "";
        let typeIcon = null;

        switch (classType) {
            case "Premium":
                border = "border-amber-500";
                typeIcon = <Gem className="h-3 w-3 text-amber-600 mr-1" />;
                break;
            case "Group":
                border = "border-orange-500";
                typeIcon = <Users className="h-3 w-3 text-orange-600 mr-1" />;
                break;
            case "Regular":
            default:
                border = "border-navy-500";
                typeIcon = <User className="h-3 w-3 text-navy-600 mr-1" />;
                break;
        }

        // Status styling (background color)
        let bg = "";
        let text = "";
        let statusIcon = null;

        switch (status) {
            case "FC not consumed (RG)":
                bg = "bg-purple-100";
                text = "text-purple-900";
                statusIcon = (
                    <Calendar className="h-3 w-3 text-purple-700 mr-1" />
                );
                break;
            case "FC consumed (RG)":
                bg = "bg-purple-200";
                text = "text-purple-900";
                statusIcon = (
                    <Calendar className="h-3 w-3 text-purple-700 mr-1" />
                );
                break;
            case "Completed (RG)":
            case "completed":
                bg = "bg-green-100";
                text = "text-green-900";
                statusIcon = (
                    <CheckCircle2 className="h-3 w-3 text-green-700 mr-1" />
                );
                break;
            case "Completed (PRM)":
                bg = "bg-blue-100";
                text = "text-blue-900";
                statusIcon = (
                    <CheckCircle2 className="h-3 w-3 text-blue-700 mr-1" />
                );
                break;
            case "Absent w/ntc counted (RG)":
                bg = "bg-yellow-100";
                text = "text-yellow-900";
                statusIcon = (
                    <AlertCircle className="h-3 w-3 text-yellow-700 mr-1" />
                );
                break;
            case "Absent w/o ntc counted (RG)":
                bg = "bg-amber-100";
                text = "text-amber-900";
                statusIcon = (
                    <AlertCircle className="h-3 w-3 text-amber-700 mr-1" />
                );
                break;
            case "Absent w/ntc-not counted (RG)":
                bg = "bg-orange-100";
                text = "text-orange-900";
                statusIcon = (
                    <AlertCircle className="h-3 w-3 text-orange-700 mr-1" />
                );
                break;
            case "Cancelled (RG)":
            case "cancelled":
                bg = "bg-red-100";
                text = "text-red-900";
                statusIcon = <XCircle className="h-3 w-3 text-red-700 mr-1" />;
                break;
            case "scheduled":
            default:
                bg = "bg-orange-50";
                text = "text-orange-800";
                statusIcon = <Calendar className="h-3 w-3 text-orange-600" />;
                break;
        }

        return {
            bg,
            text,
            border,
            typeIcon,
            statusIcon,
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
                                                            statusFilter ===
                                                                "all"
                                                                ? "bg-navy-600 text-white"
                                                                : "text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                        onClick={() => {
                                                            setStatusFilter(
                                                                "all"
                                                            );
                                                            setFilterOpen(
                                                                false
                                                            );
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
                                                                    status ===
                                                                        "All"
                                                                        ? "all"
                                                                        : status
                                                                );
                                                                setFilterOpen(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            {status ===
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
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full">
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
                                                key={day.date.toISOString()}
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
                                                        {day.events.items
                                                            .slice(
                                                                0,
                                                                maxVisibleEvents
                                                            )
                                                            .map(
                                                                (
                                                                    event,
                                                                    eventIndex
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            eventIndex
                                                                        }
                                                                        onClick={() =>
                                                                            handleEventClick(
                                                                                event
                                                                            )
                                                                        }
                                                                        className={`text-[9px] p-1 rounded cursor-pointer hover:opacity-90 transition-all duration-200 ${
                                                                            getEventStyles(
                                                                                event.class_type,
                                                                                event.status
                                                                            ).bg
                                                                        } border-l-2 ${
                                                                            getEventStyles(
                                                                                event.class_type,
                                                                                event.status
                                                                            )
                                                                                .border
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex flex-col overflow-hidden">
                                                                                <div className="flex items-center">
                                                                                    {
                                                                                        getEventStyles(
                                                                                            event.class_type,
                                                                                            event.status
                                                                                        )
                                                                                            .typeIcon
                                                                                    }
                                                                                    <span
                                                                                        className={`font-medium truncate max-w-[60px] xs:max-w-[80px] ${
                                                                                            getEventStyles(
                                                                                                event.class_type,
                                                                                                event.status
                                                                                            )
                                                                                                .text
                                                                                        }`}
                                                                                    >
                                                                                        {
                                                                                            event.student_name
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <div
                                                                                    className="text-[8px] text-navy-500 truncate"
                                                                                    title={
                                                                                        event.teacher_name
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        event.teacher_name
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center justify-between mt-0.5 text-[8px] text-navy-500">
                                                                            <span>
                                                                                {event.date.toLocaleTimeString(
                                                                                    [],
                                                                                    {
                                                                                        hour: "2-digit",
                                                                                        minute: "2-digit",
                                                                                    }
                                                                                )}
                                                                            </span>
                                                                            <span className="flex items-center">
                                                                                <Clock className="h-2 w-2 mr-0.5" />
                                                                                {
                                                                                    event.duration
                                                                                }{" "}
                                                                                min
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        {hasMoreEvents && (
                                                            <button
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setSelectedDate(
                                                                        day.date
                                                                    );
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
                onNotesSave={handleSaveNotes}
                onJoinClass={handleJoinClass}
            />
        </AdminLayout>
    );
}
