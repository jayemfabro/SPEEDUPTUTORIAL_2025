import React, { useState, useEffect, useRef } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import TeachersLayout from "@/Layouts/TeachersLayout";
import {
    Search,
    Edit,
    Trash2,
    ChevronDown,
    ChevronUp,
    User,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    PlusCircle,
    Zap,
    ZapOff,
    CalendarX,
    Check,
} from "lucide-react";
import AddClassesModal from "@/Components/Teacher/AddClassesModal";
import UpdateClasses from "@/Components/Teacher/UpdateClasses";

export default function TeacherClasses() {
    const { auth } = usePage().props;

    // State for date picker
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const datePickerRef = useRef(null);

    // State for search and filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterClassType, setFilterClassType] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const statusOptions = [
        {
            value: "FC not consumed (RG)",
            label: "FC not consumed (RG)",
            icon: Zap,
            bgColor: "bg-purple-100",
            textColor: "text-purple-900",
        },
        {
            value: "FC consumed (RG)",
            label: "FC consumed (RG)",
            icon: ZapOff,
            bgColor: "bg-purple-200",
            textColor: "text-purple-900",
        },
        {
            value: "Completed (RG)",
            label: "Completed (RG)",
            icon: CheckCircle,
            bgColor: "bg-green-100",
            textColor: "text-green-900",
        },
        {
            value: "Completed (PRM)",
            label: "Completed (PRM)",
            icon: CheckCircle,
            bgColor: "bg-blue-100",
            textColor: "text-blue-900",
        },
        {
            value: "Absent w/ntc counted (RG)",
            label: "Absent w/ntc counted (RG)",
            icon: Clock,
            bgColor: "bg-yellow-100",
            textColor: "text-yellow-900",
        },
        {
            value: "Absent w/o ntc counted (RG)",
            label: "Absent w/o ntc counted (RG)",
            icon: AlertCircle,
            bgColor: "bg-amber-100",
            textColor: "text-amber-900",
        },
        {
            value: "Absent w/ntc-not counted (RG)",
            label: "Absent w/ntc-not counted (RG)",
            icon: CalendarX,
            bgColor: "bg-orange-100",
            textColor: "text-orange-900",
        },
        {
            value: "Cancelled (RG)",
            label: "Cancelled (RG)",
            icon: XCircle,
            bgColor: "bg-red-100",
            textColor: "text-red-900",
        },
    ];

    const handleStatusSelect = (value) => {
        setFilterStatus(value === filterStatus ? "" : value);
        setDropdownOpen(null);
    };

    // Sample data - replace with actual API calls
    const [classes, setClasses] = useState([
        {
            id: 1,
            studentname: "John Doe",
            studentemail: "john@example.com",
            classtype: "Regular",
            schedule: "2023-06-05",
            time: "14:00 - 15:00",
            status: "FC not consumed (RG)",
            duration: 60,
            day: "Monday",
        },
        {
            id: 2,
            studentname: "Jane Smith",
            studentemail: "jane@example.com",
            classtype: "Premium",
            schedule: "2023-06-06",
            time: "16:00 - 17:30",
            status: "FC not consumed (RG)",
            duration: 90,
            day: "Tuesday",
        },
        {
            id: 3,
            studentname: "Alex Johnson",
            studentemail: "alex@example.com",
            classtype: "Group",
            schedule: "2023-06-07",
            time: "18:00 - 19:30",
            status: "Completed (RG)",
            duration: 90,
            day: "Wednesday",
        },
    ]);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState({
        key: "studentname",
        direction: "asc",
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({
        studentname: "",
        studentemail: "",
        classtype: "",
        schedule: "",
        time: "",
        status: "",
    });

    // Handle sorting
    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // Format time for display - ensures consistent time display format
    const formatTimeForDisplay = (timeStr) => {
        if (!timeStr) return "";
        // If already in display format (HH:MM - HH:MM), return as is
        if (timeStr.includes(" - ")) return timeStr;

        // If in 24h format (HH:MM), convert to display format
        try {
            const [startHour, startMinute] = timeStr.split(":");
            const startHourNum = parseInt(startHour, 10);
            const startMinuteNum = parseInt(startMinute, 10);

            // Calculate end time (default to 1 hour duration if not specified)
            const durationMinutes =
                classes.find(
                    (cls) =>
                        cls.time === timeStr ||
                        (typeof cls.time === "string" &&
                            cls.time.startsWith(timeStr))
                )?.duration || 60;

            const totalMinutes =
                startHourNum * 60 + startMinuteNum + durationMinutes;
            const endHourNum = Math.floor(totalMinutes / 60);
            const endMinuteNum = totalMinutes % 60;

            return `${timeStr} - ${endHourNum
                .toString()
                .padStart(2, "0")}:${endMinuteNum.toString().padStart(2, "0")}`;
        } catch (e) {
            console.error("Error formatting time:", e);
            return timeStr; // Return original if there's an error
        }
    };

    // Apply sorting and filtering
    function getSortedAndFilteredClasses() {
        let filtered = [...classes];

        // Apply search
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (cls) =>
                    cls.studentname.toLowerCase().includes(query) ||
                    (cls.studentemail &&
                        cls.studentemail.toLowerCase().includes(query)) ||
                    (cls.subject && cls.subject.toLowerCase().includes(query))
            );
        }

        // Apply status filter
        if (filterStatus) {
            filtered = filtered.filter((cls) => cls.status === filterStatus);
        }

        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }

    // Get filtered and sorted classes
    const filteredClasses = getSortedAndFilteredClasses();

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Date picker helper functions
    const handleDateChange = (date) => {
        setFormData((prev) => ({
            ...prev,
            start_date: date ? date.toISOString() : "",
        }));
    };

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); // 0-6 (Sunday-Saturday)
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Last day of month

        const days = [];

        // Add empty cells for days before the first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target)
            ) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [datePickerRef]);

    // Reset form data to default values
    const resetForm = () => {
        setFormData((prev) => ({
            ...prev,
            studentname: "",
            studentemail: "",
            classtype: "",
            schedule: "",
            time: "",
            status: "", // Explicitly set status to empty string
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingClass) {
            // Update existing class
            setClasses(
                classes.map((cls) =>
                    cls.id === editingClass.id
                        ? { ...formData, id: editingClass.id }
                        : cls
                )
            );
        } else {
            // Add new class
            const newClass = {
                ...formData,
                id: Math.max(0, ...classes.map((c) => c.id)) + 1, // Generate new ID
            };
            setClasses([...classes, newClass]);
        }

        // Reset form and close modals
        resetForm();
        setShowAddModal(false);
        setShowUpdateModal(false);
        setEditingClass(null);
    };

    // Handle edit button click
    const handleEdit = (cls) => {
        setEditingClass(cls);
        setFormData({
            studentname: cls.studentname,
            studentemail: cls.studentemail,
            classtype: cls.classtype,
            schedule: cls.schedule,
            time: cls.time,
            status: cls.status,
        });
        setShowUpdateModal(true);
    };

    // Handle delete button click
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this class?")) {
            setClasses(classes.filter((cls) => cls.id !== id));
        }
    };

    // Get status badge class with navy theme
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Completed (RG)":
                return "bg-green-50 text-green-700 border border-green-100";
            case "Completed (PRM)":
                return "bg-blue-50 text-blue-700 border border-blue-100";
            case "Absent w/ntc counted (RG)":
            case "Absent w/o ntc counted (RG)":
            case "Absent w/ntc-not counted (RG)":
                return "bg-yellow-50 text-yellow-700 border border-yellow-100";
            case "FC not consumed (RG)":
            case "FC consumed (RG)":
                return "bg-purple-50 text-purple-700 border border-purple-100";
            case "Cancelled (RG)":
                return "bg-red-50 text-red-700 border border-red-100";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-100";
        }
    };

    // Get class type badge class with navy theme
    const getClassTypeBadgeClass = (type) => {
        if (!type) return "bg-navy-50 text-navy-700 border border-navy-100";

        const typeLower = type.toString().toLowerCase();
        switch (typeLower) {
            case "premium":
                return "bg-navy-50 text-navy-700 border border-navy-100";
            case "group":
                return "bg-navy-100 text-navy-800 border border-navy-200";
            default:
                return "bg-navy-50 text-navy-700 border border-navy-100";
        }
    };

    return (
        <TeachersLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Classes
                </h2>
            }
        >
            <Head title="Manage Classes" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Responsive Banner */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-navy-800 to-navy-700 p-4 sm:p-6 md:p-8 mb-6 shadow-lg">
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="text-center sm:text-left">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                                            Classes Management
                                        </h1>
                                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-navy-100">
                                            Manage your classes and their
                                            information
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Filters and search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative w-full sm:w-64">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search classes..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pl-10"
                                />
                            </div>

                            <div className="relative w-full sm:w-64">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDropdownOpen(
                                            dropdownOpen === "status"
                                                ? null
                                                : "status"
                                        )
                                    }
                                    onBlur={() =>
                                        setTimeout(
                                            () => setDropdownOpen(null),
                                            200
                                        )
                                    }
                                    aria-haspopup="listbox"
                                    aria-expanded={dropdownOpen === "status"}
                                    className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-between h-[42px] ${
                                        dropdownOpen === "status"
                                            ? "bg-orange-50 border border-orange-200 text-navy-700"
                                            : "bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm"
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {filterStatus ? (
                                            <>
                                                <span
                                                    className={`mr-2 ${
                                                        statusOptions.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                filterStatus
                                                        )?.bgColor
                                                    } rounded-full p-1`}
                                                >
                                                    {React.createElement(
                                                        statusOptions.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                filterStatus
                                                        )?.icon,
                                                        {
                                                            className: `h-4 w-4 ${
                                                                statusOptions.find(
                                                                    (opt) =>
                                                                        opt.value ===
                                                                        filterStatus
                                                                )?.textColor
                                                            }`,
                                                        }
                                                    )}
                                                </span>
                                                <span className="truncate">
                                                    {
                                                        statusOptions.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                filterStatus
                                                        )?.label
                                                    }
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-gray-500">
                                                All Statuses
                                            </span>
                                        )}
                                    </div>
                                    {dropdownOpen === "status" ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </button>

                                {dropdownOpen === "status" && (
                                    <div className="absolute z-[60] mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                                        <div className="max-h-60 overflow-y-auto">
                                            <div className="p-2 space-y-1">
                                                <button
                                                    key="all-statuses"
                                                    type="button"
                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                        !filterStatus
                                                            ? "bg-navy-600 text-white"
                                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                    }`}
                                                    onClick={() =>
                                                        handleStatusSelect("")
                                                    }
                                                >
                                                    <span className="mr-2 rounded-full p-1">
                                                        <span className="h-4 w-4 opacity-0"></span>
                                                    </span>
                                                    All Statuses
                                                    {!filterStatus && (
                                                        <Check className="h-4 w-4 text-white ml-auto" />
                                                    )}
                                                </button>
                                                {statusOptions.map((status) => {
                                                    const isSelected =
                                                        filterStatus ===
                                                        status.value;
                                                    return (
                                                        <button
                                                            key={status.value}
                                                            type="button"
                                                            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                isSelected
                                                                    ? "bg-navy-600 text-white"
                                                                    : `${status.bgColor} ${status.textColor} hover:bg-opacity-80`
                                                            }`}
                                                            onClick={() =>
                                                                handleStatusSelect(
                                                                    status.value
                                                                )
                                                            }
                                                        >
                                                            <span
                                                                className={`mr-2 ${
                                                                    isSelected
                                                                        ? "bg-white bg-opacity-20"
                                                                        : ""
                                                                } rounded-full p-1`}
                                                            >
                                                                {React.createElement(
                                                                    status.icon,
                                                                    {
                                                                        className: `h-4 w-4 ${
                                                                            isSelected
                                                                                ? "text-white"
                                                                                : status.textColor
                                                                        }`,
                                                                    }
                                                                )}
                                                            </span>
                                                            {status.label}
                                                            {isSelected && (
                                                                <Check className="h-4 w-4 ml-auto text-white" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setEditingClass(null);
                                setFormData({
                                    studentname: "",
                                    studentemail: "",
                                    classtype: "Regular",
                                    schedule: "",
                                    time: "",
                                    status: "FC not consumed (RG)",
                                });
                                setShowAddModal(true);
                            }}
                            className="bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 text-sm font-medium w-full sm:w-auto"
                        >
                            <PlusCircle className="h-5 w-5" />
                            <span>Add New Class</span>
                        </button>
                    </div>
                </div>

                {/* Classes Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gradient-to-r from-navy-800 to-navy-700">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Student
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Class Type
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Schedule
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Time
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClasses.map((cls) => (
                                    <tr
                                        key={cls.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-navy-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-navy-900">
                                                        {cls.studentname}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getClassTypeBadgeClass(
                                                    cls.classtype
                                                )}`}
                                            >
                                                {cls.classtype}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-navy-600">
                                                <Calendar className="h-4 w-4 mr-1.5 text-navy-400" />
                                                {new Date(
                                                    cls.schedule
                                                ).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-navy-500">
                                                <Clock className="h-4 w-4 mr-1.5 text-navy-400" />
                                                {formatTimeForDisplay(cls.time)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-md ${getStatusBadgeClass(
                                                    cls.status
                                                )}`}
                                            >
                                                {cls.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(cls)
                                                    }
                                                    className="text-navy-600 hover:text-navy-900 p-1 rounded-full hover:bg-navy-50 transition-colors"
                                                    aria-label="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(cls.id)
                                                    }
                                                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Class Modal */}
            <AddClassesModal
                key={showAddModal ? "add-modal-open" : "add-modal-closed"}
                isOpen={showAddModal}
                onClose={() => {
                    resetForm();
                    setShowAddModal(false);
                }}
                onSubmit={handleSubmit}
                formData={formData}
                onInputChange={handleInputChange}
                isEditing={false}
            />

            <UpdateClasses
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                onSubmit={handleSubmit}
                formData={formData}
                onInputChange={handleInputChange}
            />
        </TeachersLayout>
    );
}
