import React, { useState, useEffect, useRef } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import AddClassesModal from "@/Components/Admin/AddClassesModal";
import UpdateClassesModal from "@/Components/Admin/UpdateClassesModal";
import {
    Search,
    Calendar as CalendarIcon,
    CheckCircle,
    Clock,
    User,
    ChevronDown,
    ChevronUp,
    Edit,
    Trash2,
    XCircle,
    AlertCircle,
    ListFilter,
    Calendar,
    PlusCircle,
    BookOpen,
} from "lucide-react";


export default function AdminClasses() {
    const { auth } = usePage().props;

    // State for date picker
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const datePickerRef = useRef(null);

    // State for search and filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterTeacher, setFilterTeacher] = useState("all");
    const [filterClassType, setFilterClassType] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);

    // Sample data - replace with actual API calls
    const [classes, setClasses] = useState([
        {
            id: 1,
            teacher_id: 1, // Teacher ID reference
            student_name: "John Doe",
            class_type: "Regular",
            schedule: "2023-06-05",
            time: "14:00 - 15:00",
            status: "FC not consumed (RG)",
        },
        {
            id: 2,
            teacher_id: 2, // Teacher ID reference
            student_name: "Jane Smith",
            class_type: "Premium",
            schedule: "2023-06-06",
            time: "16:00 - 17:30",
            status: "FC not consumed (RG)",
        },
        {
            id: 3,
            teacher_id: 1, // Teacher ID reference (same as first class)
            student_name: "Alex Johnson",
            class_type: "Group",
            schedule: "2023-06-07",
            time: "18:00 - 19:30",
            status: "Completed (RG)",
        },
        {
            id: 4,
            teacher_id: 3, // Teacher ID reference
            student_name: "Maria Garcia",
            class_type: "Premium",
            schedule: "2023-06-08",
            time: "10:00 - 11:30",
            status: "FC not consumed (RG)",
        },
    ]);

    // Teacher data mapping
    const teachers = {
        1: { name: "John Smith" },
        2: { name: "Sarah Johnson" },
        3: { name: "Michael Chen" },
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState({
        key: "student_name",
        direction: "asc",
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({
        student_name: "",
        student_email: "",
        class_type: "Regular",
        schedule: "",
        time: "",
        status: "FC not consumed (RG)",
    });

    // Handle sorting
    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // Get filtered and sorted classes
    const filteredClasses = getSortedAndFilteredClasses();

    // Apply sorting and filtering
    function getSortedAndFilteredClasses() {
        let filtered = [...classes];

        // Apply search
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (cls) =>
                    cls.student_name &&
                    cls.student_name.toLowerCase().includes(query)
            );
        }

        // Apply status filter - only filter if a specific status is selected
        if (filterStatus && filterStatus !== "all") {
            filtered = filtered.filter((cls) => cls.status === filterStatus);
        }

        // Apply teacher filter - only filter if a specific teacher is selected
        if (filterTeacher && filterTeacher !== "all") {
            filtered = filtered.filter(
                (cls) => cls.teacher_id.toString() === filterTeacher
            );
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

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle opening the add class modal
    const openAddClassModal = () => {
        setEditingClass(null);
        setFormData({
            student_name: "",
            student_email: "",
            class_type: "Regular",
            schedule: "",
            time: "",
            status: "FC not consumed (RG)",
        });
        setShowAddModal(true);
    };

    // Handle opening the edit class modal
    const openEditClassModal = (cls) => {
        setEditingClass(cls);
        setFormData({
            student_name: cls.student_name || "",
            student_email: cls.student_email || "",
            class_type: cls.class_type || "Regular",
            schedule: cls.schedule || "",
            time: cls.time || "",
            status: cls.status || "FC not consumed (RG)",
        });
        setShowEditModal(true);
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

    // Handle add form submission
    const handleAddSubmit = (formData) => {
        const newClass = {
            ...formData,
            id: Math.max(0, ...classes.map((c) => c.id)) + 1, // Generate new ID
        };
        setClasses([...classes, newClass]);

        // Reset form and close modal
        setFormData({
            student_name: "",
            student_email: "",
            class_type: "Regular",
            schedule: "",
            time: "",
            status: "FC not consumed (RG)",
        });
        setShowAddModal(false);
    };

    // Handle update form submission
    const handleUpdateSubmit = (formData) => {
        if (editingClass) {
            // Update existing class
            setClasses(
                classes.map((cls) =>
                    cls.id === editingClass.id
                        ? { ...formData, id: editingClass.id }
                        : cls
                )
            );
            setShowEditModal(false);
            setEditingClass(null);
        }
    };

    // Handle edit button click
    const handleEdit = (cls) => {
        setEditingClass(cls);
        setFormData({
            student_name: cls.student_name,
            student_email: cls.student_email,
            class_type: cls.class_type,
            schedule: cls.schedule,
            time: cls.time,
            status: cls.status,
        });
        setShowAddModal(true);
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
        switch (type.toLowerCase()) {
            case "premium":
                return "bg-navy-50 text-navy-700 border border-navy-100";
            case "group":
                return "bg-navy-100 text-navy-800 border border-navy-200";
            default:
                return "bg-navy-50 text-navy-700 border border-navy-100";
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Classes
                </h2>
            }
        >
            <Head title="Manage Classes" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                            {/* Add action buttons or additional content here if needed */}
                        </div>
                    </div>
                </div>

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
                                    placeholder="Search by student name or class..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>

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
                                        {filterTeacher &&
                                        filterTeacher !== "all" ? (
                                            <span className="truncate">
                                                {teachers[filterTeacher]
                                                    ?.name || "Teacher"}
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
                                                        !filterTeacher ||
                                                        filterTeacher === "all"
                                                            ? "bg-navy-600 text-white"
                                                            : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                    onClick={() => {
                                                        setFilterTeacher("all");
                                                        setFilterOpen(false);
                                                    }}
                                                >
                                                    <Users className="h-4 w-4 mr-2" />
                                                    All Teachers
                                                </button>
                                                {Object.entries(teachers).map(
                                                    ([id, teacher]) => (
                                                        <button
                                                            key={id}
                                                            type="button"
                                                            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                filterTeacher ===
                                                                id
                                                                    ? "bg-navy-600 text-white"
                                                                    : "hover:bg-gray-100 text-gray-700"
                                                            }`}
                                                            onClick={() => {
                                                                setFilterTeacher(
                                                                    id
                                                                );
                                                                setFilterOpen(
                                                                    false
                                                                );
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
                                        {filterStatus &&
                                        filterStatus !== "all" ? (
                                            <span className="truncate">
                                                {filterStatus}
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
                                                        !filterStatus ||
                                                        filterStatus === "all"
                                                            ? "bg-navy-600 text-white"
                                                            : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                    onClick={() => {
                                                        setFilterStatus("all");
                                                        setFilterOpen(false);
                                                    }}
                                                >
                                                    <ListFilter className="h-4 w-4 mr-2" />
                                                    All Statuses
                                                </button>
                                                {[
                                                    "FC not consumed (RG)",
                                                    "FC consumed (RG)",
                                                    "Completed (RG)",
                                                    "Completed (PRM)",
                                                    "Absent w/ntc counted (RG)",
                                                    "Absent w/o ntc counted (RG)",
                                                    "Absent w/ntc-not counted (RG)",
                                                    "Cancelled (RG)",
                                                ].map((status) => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                            filterStatus ===
                                                            status
                                                                ? "bg-navy-600 text-white"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => {
                                                            setFilterStatus(
                                                                status
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
                                                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
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

                        <button
                            onClick={openAddClassModal}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                        >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                            Add Class
                        </button>
                    </div>
                </div>

                {/* Classes Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gradient-to-r from-navy-900 to-navy-700">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Teacher
                                    </th>
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
                                {filteredClasses.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center text-navy-600">
                                                <BookOpen className="h-12 w-12 mb-2 text-navy-400" />
                                                <p className="text-lg font-medium text-navy-400">
                                                    No classes found
                                                </p>
                                                <p className="text-sm text-navy-400 mt-1">
                                                    Try adjusting your search or
                                                    add a new class.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClasses.map((cls) => (
                                        <tr
                                            key={cls.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-navy-900">
                                                            {teachers[
                                                                cls.teacher_id
                                                            ]?.name ||
                                                                "Unknown Teacher"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-navy-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-navy-900">
                                                            {cls.student_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getClassTypeBadgeClass(
                                                        cls.class_type
                                                    )}`}
                                                >
                                                    {cls.class_type}
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
                                                    {cls.time}
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
                                                            openEditClassModal(
                                                                cls
                                                            )
                                                        }
                                                        className="text-navy-600 hover:text-navy-900 transition-colors p-1 rounded-full hover:bg-navy-50"
                                                        title="Edit class"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(cls.id)
                                                        }
                                                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                                                        title="Delete class"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Class Modal */}
            <AddClassesModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setFormData({
                        student_name: "",
                        student_email: "",
                        class_type: "Regular",
                        schedule: "",
                        time: "",
                        status: "FC not consumed (RG)",
                    });
                }}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAddSubmit(formData);
                }}
                classForm={formData}
                onInputChange={handleInputChange}
            />

            {/* Edit Class Modal */}
            <UpdateClassesModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingClass(null);
                    setFormData({
                        student_name: "",
                        student_email: "",
                        class_type: "Regular",
                        schedule: "",
                        time: "",
                        status: "FC not consumed (RG)",
                    });
                }}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateSubmit(formData);
                }}
                classForm={formData}
                onInputChange={handleInputChange}
                isUpdating={false}
            />
        </AdminLayout>
    );
}
