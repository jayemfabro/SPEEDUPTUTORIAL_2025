import React, { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import axios from "axios";
import { CLASS_STATUS_COLORS } from "@/utils/colorMapping";
import {
    X,
    ChevronDown,
    ChevronUp,
    Check,
    HelpCircle,
    User,
    Zap,
    Users,
    Gem,
    ZapOff,
    CheckCircle,
    Clock,
    AlertCircle,
    CalendarX,
    XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

const AddClassesModal = ({
    isOpen,
    onClose,
    onSubmit,
    formData = {},
    onInputChange,
    isEditing = false,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);
    const timeDropdownRef = useRef(null);
    const classTypeDropdownRef = useRef(null);
    const studentDropdownRef = useRef(null);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    // Add state for all classes
    const [allClasses, setAllClasses] = useState([]);
    // Bulk selection state for group class
    const [selectedStudents, setSelectedStudents] = useState([]);

    // Reset selected students when modal opens or class type changes
    useEffect(() => {
        if (!isOpen || formData.classType !== 'Group') {
            setSelectedStudents([]);
        }
    }, [isOpen, formData.classType]);

    // Handle bulk student select for group class
    const handleBulkStudentSelect = (student) => {
        if (formData.classType !== 'Group') return;
        setSelectedStudents((prev) => {
            if (prev.some((s) => s.id === student.id)) {
                return prev.filter((s) => s.id !== student.id);
            } else {
                return [...prev, student];
            }
        });
    };

    // For single student select (non-group)
    const handleSingleStudentSelect = (student) => {
        onInputChange({ target: { name: 'studentName', value: student.name } });
        onInputChange({ target: { name: 'student_name', value: student.name } });
        onInputChange({ target: { name: 'student_email', value: student.email } });
        onInputChange({ target: { name: 'student_id', value: student.id } });
        setDropdownOpen(null);
    };

    // Fetch active teachers and students when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchActiveTeachers();
            fetchStudents();
            fetchClasses(); // Fetch classes on modal open
        }
    }, [isOpen]);

    const fetchActiveTeachers = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/admin/active-teachers");
            setTeachers(response.data);
        } catch (error) {
            console.error("Error fetching active teachers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/admin/students");
            setStudents(response.data || []);
            setFilteredStudents(response.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]);
            setFilteredStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.get('/api/admin/classes');
            setAllClasses(response.data || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setAllClasses([]);
        }
    };

    // Helper to get used count for a student and class type
    const getUsedCount = (student, type) => {
        return allClasses.filter(
            cls =>
                cls.student_name === student.name &&
                cls.class_type && cls.class_type.toLowerCase() === type &&
                ["Completed", "Absent w/ntc counted", "FC consumed"].includes(cls.status)
        ).length;
    };

    const handleDropdownToggle = (dropdown) => {
        const newState = dropdownOpen === dropdown ? null : dropdown;
        setDropdownOpen(newState);
        
        // Reset student search when opening student dropdown
        if (dropdown === "student" && newState === "student") {
            setStudentSearchQuery("");
            setFilteredStudents(students);
        }
    };

    const handleTimeSelect = (timeValue) => {
        onInputChange({ target: { name: "time", value: timeValue } });
        setDropdownOpen(null);
    };

    const handleClassTypeSelect = (classType) => {
        onInputChange({ target: { name: "classType", value: classType } });
        setDropdownOpen(null);
    };

    // Generate time slots from 8:00 AM to 11:00 PM in 30-minute intervals
    const generateTimeSlots = () => {
        const times = [];
        for (let hour = 8; hour <= 23; hour++) {
            for (let minute of ["00", "30"]) {
                if (hour === 23 && minute === "30") break; // Stop at 11:00 PM
                const time24 = `${hour.toString().padStart(2, "0")}:${minute}`;
                const period = hour >= 12 ? "PM" : "AM";
                const hour12 = hour % 12 || 12;
                const time12 = `${hour12}:${minute} ${period}`;
                times.push({ value: time24, label: time12 });
            }
        }
        return times;
    };

    const timeOptions = generateTimeSlots();

    const statusOptions = [
        {
            value: "Valid for Cancellation",
            label: "Valid for Cancellation",
            icon: CheckCircle,
            bgColor: "bg-gray-300",
            borderColor: "border-gray-300",
            textColor: "text-gray-900",
        },
        {
            value: "Free Class",
            label: "Free Class",
            icon: Zap,
            bgColor: "bg-yellow-400",
            borderColor: "border-yellow-500",
            textColor: "text-yellow-900",
        },
        {
            value: "FC not consumed",
            label: "FC not consumed",
            icon: Zap,
            bgColor: "bg-yellow-400",
            borderColor: "border-yellow-500",
            textColor: "text-yellow-900",
        },
        {
            value: "Completed",
            label: "Completed",
            icon: CheckCircle,
            bgColor: "bg-green-400",
            borderColor: "border-green-500",
            textColor: "text-green-900",
        },
        {
            value: "Absent w/ntc counted",
            label: "Absent w/ntc counted",
            icon: Clock,
            bgColor: "bg-blue-400",
            borderColor: "border-blue-500",
            textColor: "text-blue-900",
        },
        {
                    value: "Cancelled",
        label: "Cancelled",
            icon: XCircle,
            bgColor: "bg-purple-400",
            borderColor: "border-purple-500",
            textColor: "text-purple-900",
        },
        {
            value: "Absent w/ntc-not counted",
            label: "Absent w/ntc-not counted",
            icon: CalendarX,
            bgColor: "bg-gray-600",
            borderColor: "border-gray-500",
            textColor: "text-gray-900",
        },
        {
            value: "FC consumed",
            label: "FC consumed",
            icon: ZapOff,
            bgColor: "bg-pink-400",
            borderColor: "border-pink-400",
            textColor: "text-pink-900",
        },
        {
            value: "Absent Without Notice",
            label: "Absent Without Notice",
            icon: CalendarX,
            bgColor: "bg-red-400",
            borderColor: "border-red-500",
            textColor: "text-red-900",
        },
    ];

    const classTypeOptions = [
        {
            value: "Regular",
            label: "Regular Class",
            icon: User,
            bgColor: "bg-navy-500",
            textColor: "text-white",
            iconBgColor: "bg-navy-600",
            iconTextColor: "text-white",
        },
        {
            value: "Premium",
            label: "Premium Class",
            icon: Gem,
            bgColor: "bg-orange-400",
            textColor: "text-white",
            iconBgColor: "bg-orange-500",
            iconTextColor: "text-white",
        },
        {
            value: "Group",
            label: "Group Class",
            icon: Users,
            bgColor: "bg-[#4A9782]",
            textColor: "text-white",
            iconBgColor: "bg-[#4A9782]",
            iconTextColor: "text-white",
        },
    ];

    const getStatusOption = (status) => {
        const option = statusOptions.find((opt) => opt.value === status);
        return (
            option || {
                bgColor: "bg-gray-600",
                borderColor: "border-gray-700",
                textColor: "text-gray-700",
                icon: HelpCircle,
            }
        );
    };

    const getClassTypeOption = (type) => {
        const option = classTypeOptions.find((opt) => opt.value === type);
        return (
            option || {
                bgColor: "bg-gray-100",
                textColor: "text-gray-700",
                iconBgColor: "bg-gray-500",
                iconTextColor: "text-white",
                icon: HelpCircle,
                label: "Unknown",
            }
        );
    };

    // Handle student search
    const handleStudentSearch = (e) => {
        const query = e.target.value;
        setStudentSearchQuery(query);
        
        if (query.trim() === "") {
            setFilteredStudents(students);
        } else {
            const filtered = students.filter(
                student => {
                    const hasName = student.name && student.name.toLowerCase().includes(query.toLowerCase());
                    const hasEmail = student.email && student.email.toLowerCase().includes(query.toLowerCase());
                    return hasName || hasEmail;
                }
            );
            setFilteredStudents(filtered);
        }
    };

    // Handle student selection
    const handleStudentSelect = (student) => {
        onInputChange({ target: { name: "studentName", value: student.name } });
        onInputChange({ target: { name: "student_name", value: student.name } });
        onInputChange({ target: { name: "student_email", value: student.email } });
        onInputChange({ target: { name: "student_id", value: student.id } });
        setDropdownOpen(null);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                studentDropdownRef.current &&
                !studentDropdownRef.current.contains(event.target) &&
                dropdownOpen === "student"
            ) {
                setDropdownOpen(null);
            } else if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                dropdownOpen !== "student"
            ) {
                setDropdownOpen(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    // On submit, if group, pass selectedStudents
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (formData.classType === 'Group') {
            if (selectedStudents.length === 0) {
                toast.error('Please select at least one student for group class.');
                return;
            }
            // Pass selected students array to parent
            onSubmit(e, selectedStudents);
            return;
        }
        // Single student logic (existing)
        const student = students.find(s => s.name === formData.studentName);
        if (!student) {
            toast.error('Please select a student.');
            return;
        }
        let purchased = 0;
        let typeKey = 'regular';
        if (formData.classType === 'Regular') { purchased = student.purchased_class_regular || 0; typeKey = 'regular'; }
        else if (formData.classType === 'Premium') { purchased = student.purchased_class_premium || 0; typeKey = 'premium'; }
        else if (formData.classType === 'Group') { purchased = student.purchased_class_group || 0; typeKey = 'group'; }
        const used = getUsedCount(student, typeKey);
        const remaining = purchased - used;
        if (remaining <= 0) {
            toast.error(`No remaining purchased ${formData.classType} classes for this student.`);
            return;
        }
        onSubmit(e);
    };

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <div className="fixed inset-0 overflow-y-auto z-50">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            className="fixed inset-0 transition-opacity"
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                    </Transition.Child>

                    <span
                        className="hidden sm:inline-block sm:align-middle sm:h-screen"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>

                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full overflow-visible"
                            style={{ zIndex: 1000, position: "relative" }}
                        >
                            <div className="bg-gradient-to-r from-navy-700 to-navy-800 px-6 py-4 flex justify-between items-center rounded-t-lg">
                                <h3 className="text-lg leading-6 font-medium text-white">
                                    {isEditing ? "Edit Class" : "Add New Class"}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="bg-navy-600 rounded-full p-1 text-gray-300 hover:text-white focus:outline-none transition-colors duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleFormSubmit}>
                                <div className="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        {/* Student Name Dropdown */}
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="studentName"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Student Name
                                            </label>
                                            <div className="relative w-full mt-1" ref={studentDropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDropdownToggle("student")}
                                                    aria-haspopup="listbox"
                                                    aria-expanded={dropdownOpen === "student"}
                                                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-between ${
                                                        dropdownOpen === "student"
                                                            ? "bg-orange-50 border border-orange-200 text-navy-700"
                                                            : "bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm"
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 mr-2 text-navy-400" />
                                                        {formData.classType === 'Group' && selectedStudents.length > 0 ? (
                                                            <span className="truncate">
                                                                {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                                                            </span>
                                                        ) : formData.studentName ? (
                                                            <span className="truncate">
                                                                {formData.studentName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-500">
                                                                Select Student
                                                            </span>
                                                        )}
                                                    </div>
                                                    {dropdownOpen === "student" ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </button>

                                                {dropdownOpen === "student" && (
                                                    <div className="absolute z-[60] mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                                                        <div className="p-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Type student name..."
                                                                value={studentSearchQuery}
                                                                onChange={handleStudentSearch}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onFocus={(e) => e.stopPropagation()}
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto">
                                                            <div className="p-2 space-y-1">
                                                                {loading ? (
                                                                    <div className="text-center py-2 text-sm text-gray-500">
                                                                        Loading students...
                                                                    </div>
                                                                ) : filteredStudents.length > 0 ? (
                                                                    filteredStudents.map((student) => {
                                                                        const isSelected = formData.classType === 'Group'
                                                                            ? selectedStudents.some((s) => s.id === student.id)
                                                                            : formData.studentName === student.name;
                                                                        return (
                                                                            <div key={student.id} className="flex items-center w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-gray-50">
                                                                                {formData.classType === 'Group' && (
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isSelected}
                                                                                        onChange={() => handleBulkStudentSelect(student)}
                                                                                        className="mr-2 h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                                                                    />
                                                                                )}
                                                                                <button
                                                                                    type="button"
                                                                                    className={`flex-1 flex flex-col text-left ${isSelected ? 'text-navy-700 font-semibold' : 'text-navy-700'}`}
                                                                                    onMouseDown={(e) => {
                                                                                        e.preventDefault();
                                                                                        if (formData.classType === 'Group') {
                                                                                            handleBulkStudentSelect(student);
                                                                                        } else {
                                                                                            handleSingleStudentSelect(student);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <span className="font-medium">{student.name}</span>
                                                                                    <span className="text-xs text-gray-400">{student.email}</span>
                                                                                </button>
                                                                                {isSelected && (
                                                                                    <Check className="h-4 w-4 ml-2 text-orange-500" />
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <div className="text-center py-2 text-sm text-gray-500">
                                                                        No students found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Teacher Dropdown */}
                                        <div className="sm:col-span-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teacher
                                            </label>
                                            <div
                                                className="relative w-full"
                                                ref={dropdownRef}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDropdownToggle(
                                                            "teacher"
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        setTimeout(
                                                            () =>
                                                                setDropdownOpen(
                                                                    null
                                                                ),
                                                            200
                                                        )
                                                    }
                                                    aria-haspopup="listbox"
                                                    aria-expanded={
                                                        dropdownOpen ===
                                                        "teacher"
                                                    }
                                                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-between ${
                                                        dropdownOpen ===
                                                        "teacher"
                                                            ? "bg-orange-50 border border-orange-200 text-navy-700"
                                                            : "bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm"
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 mr-2 text-navy-400" />
                                                        {formData.teacherName ? (
                                                            <span className="truncate">
                                                                {
                                                                    formData.teacherName
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-500">
                                                                Select Teacher
                                                            </span>
                                                        )}
                                                    </div>
                                                    {dropdownOpen ===
                                                    "teacher" ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </button>

                                                {dropdownOpen === "teacher" && (
                                                    <div className="absolute z-[60] mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                                                        <div className="max-h-60 overflow-y-auto">
                                                            <div className="p-2 space-y-1">
                                                                <button
                                                                    key="select-teacher"
                                                                    type="button"
                                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                        !formData.teacherName
                                                                            ? "bg-navy-600 text-white"
                                                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                                    }`}
                                                                    onMouseDown={(
                                                                        e
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        onInputChange(
                                                                            {
                                                                                target: {
                                                                                    name: "teacherName",
                                                                                    value: "",
                                                                                },
                                                                            }
                                                                        );
                                                                        onInputChange(
                                                                            {
                                                                                target: {
                                                                                    name: "teacher_id",
                                                                                    value: "",
                                                                                },
                                                                            }
                                                                        );
                                                                        setDropdownOpen(
                                                                            null
                                                                        );
                                                                    }}
                                                                >
                                                                    <span className="mr-2">
                                                                        <span className="h-4 w-4"></span>
                                                                    </span>
                                                                    Select
                                                                    Teacher
                                                                    {!formData.teacherName && (
                                                                        <Check className="h-4 w-4 text-white ml-auto" />
                                                                    )}
                                                                </button>
                                                                {teachers.map(
                                                                    (teacher) => {
                                                                        const isSelected =
                                                                            formData.teacherName ===
                                                                            teacher.name;
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    teacher.id
                                                                                }
                                                                                type="button"
                                                                                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                                    isSelected
                                                                                        ? "bg-navy-600 text-white"
                                                                                        : "text-navy-700 hover:bg-gray-50"
                                                                                }`}
                                                                                onMouseDown={(
                                                                                    e
                                                                                ) => {
                                                                                    e.preventDefault();
                                                                                    onInputChange(
                                                                                        {
                                                                                            target: {
                                                                                                name: "teacherName",
                                                                                                value: teacher.name,
                                                                                            },
                                                                                        }
                                                                                    );
                                                                                    onInputChange(
                                                                                        {
                                                                                            target: {
                                                                                                name: "teacher_id",
                                                                                                value: teacher.id,
                                                                                            },
                                                                                        }
                                                                                    );
                                                                                    setDropdownOpen(
                                                                                        null
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <User className="h-4 w-4 mr-2 text-navy-400" />
                                                                                <span className="flex-1">
                                                                                    {
                                                                                        teacher.name
                                                                                    }
                                                                                </span>
                                                                                {isSelected && (
                                                                                    <Check className="h-4 w-4 ml-2 text-white" />
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Class Type */}
                                        <div className="sm:col-span-3">
                                            <label
                                                htmlFor="classType"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Class Type
                                            </label>
                                            <div
                                                className="relative w-full"
                                                ref={classTypeDropdownRef}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDropdownToggle(
                                                            "classType"
                                                        );
                                                    }}
                                                    onBlur={(e) => {
                                                        // Check if the new focus target is outside our dropdown
                                                        if (
                                                            !classTypeDropdownRef.current?.contains(
                                                                e.relatedTarget
                                                            )
                                                        ) {
                                                            setDropdownOpen(
                                                                null
                                                            );
                                                        }
                                                    }}
                                                    aria-haspopup="listbox"
                                                    aria-expanded={
                                                        dropdownOpen ===
                                                        "classType"
                                                    }
                                                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-between ${
                                                        dropdownOpen ===
                                                        "classType"
                                                            ? "bg-orange-50 border border-orange-200 text-navy-700"
                                                            : "bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm"
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        {formData.classType ? (
                                                            <>
                                                                <span
                                                                    className={`mr-2 ${
                                                                        getClassTypeOption(
                                                                            formData.classType
                                                                        )
                                                                            .iconBgColor
                                                                    } rounded-full p-1`}
                                                                >
                                                                    {React.createElement(
                                                                        getClassTypeOption(
                                                                            formData.classType
                                                                        ).icon,
                                                                        {
                                                                            className: `h-4 w-4 ${
                                                                                getClassTypeOption(
                                                                                    formData.classType
                                                                                )
                                                                                    .iconTextColor
                                                                            }`,
                                                                        }
                                                                    )}
                                                                </span>
                                                                <span className="truncate">
                                                                    {classTypeOptions.find(
                                                                        (opt) =>
                                                                            opt.value ===
                                                                            formData.classType
                                                                    )?.label ||
                                                                        formData.classType}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-500">
                                                                Select Class
                                                            </span>
                                                        )}
                                                    </div>
                                                    {dropdownOpen ===
                                                    "classType" ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </button>

                                                {dropdownOpen ===
                                                    "classType" && (
                                                    <div className="absolute z-[9999] mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                                                        <div
                                                            className="max-h-60 overflow-y-auto"
                                                            style={{
                                                                maxHeight:
                                                                    "15rem",
                                                            }}
                                                        >
                                                            <div className="p-2 space-y-1">
                                                                {classTypeOptions.map(
                                                                    (type) => {
                                                                        const isSelected =
                                                                            formData.classType ===
                                                                            type.value;
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    type.value
                                                                                }
                                                                                type="button"
                                                                                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                                    isSelected
                                                                                        ? "bg-navy-600 text-white"
                                                                                        : `${type.bgColor} ${type.textColor} hover:bg-opacity-80`
                                                                                }`}
                                                                                onMouseDown={(
                                                                                    e
                                                                                ) => {
                                                                                    e.preventDefault();
                                                                                    handleClassTypeSelect(
                                                                                        type.value
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <span
                                                                                    className={`mr-2 ${
                                                                                        isSelected
                                                                                            ? "bg-white bg-opacity-20"
                                                                                            : type.iconBgColor
                                                                                    } rounded-full p-1`}
                                                                                >
                                                                                    {React.createElement(
                                                                                        type.icon,
                                                                                        {
                                                                                            className: `h-4 w-4 ${
                                                                                                isSelected
                                                                                                    ? "text-white"
                                                                                                    : type.iconTextColor
                                                                                            }`,
                                                                                            size: 16,
                                                                                        }
                                                                                    )}
                                                                                </span>
                                                                                <span className="flex-1">
                                                                                    {
                                                                                        type.label
                                                                                    }
                                                                                </span>
                                                                                {isSelected && (
                                                                                    <Check className="h-4 w-4 ml-2 text-white" />
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Schedule Date */}
                                        <div className="sm:col-span-3">
                                            <label
                                                htmlFor="schedule"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Schedule Date
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="date"
                                                    name="schedule"
                                                    id="schedule"
                                                    required
                                                    value={
                                                        formData.schedule || ""
                                                    }
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        {/* Status Dropdown */}
                                        <div className="sm:col-span-3">
                                            <label
                                                htmlFor="status"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Status
                                            </label>
                                            <div className="relative mt-1" style={{ width: '304px', height: '38px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDropdownToggle("status")}
                                                    aria-haspopup="listbox"
                                                    aria-expanded={dropdownOpen === "status"}
                                                    className={`w-full h-full text-left px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-between ${
                                                        dropdownOpen === "status"
                                                            ? "bg-orange-50 border border-orange-200 text-navy-700"
                                                            : "bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm"
                                                    }`}
                                                    style={{ height: '38px' }}
                                                >
                                                    <div className="flex items-center">
                                                        {formData.status ? (
                                                            <>
                                                                <span className={`w-4 h-4 ${getStatusOption(formData.status).bgColor} ${getStatusOption(formData.status).borderColor} border rounded-sm mr-3 flex-shrink-0`}></span>
                                                                <span className="truncate">
                                                                    {formData.status}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-500">
                                                                Select Status
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
                                                                    key="valid-cancellation"
                                                                    type="button"
                                                                    className="w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center hover:bg-gray-100 text-gray-700"
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        onInputChange({ target: { name: 'status', value: 'Valid for Cancellation' } });
                                                                        setDropdownOpen(null);
                                                                    }}
                                                                >
                                                                    <span className="w-4 h-4 bg-gray-300 border border-gray-300 rounded-sm mr-3 flex-shrink-0"></span>
                                                                    Valid for Cancellation
                                                                </button>
                                                                <button
                                                                    key="free-class"
                                                                    type="button"
                                                                    className="w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center hover:bg-gray-100 text-gray-700"
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        onInputChange({ target: { name: 'status', value: 'Free Class' } });
                                                                        setDropdownOpen(null);
                                                                    }}
                                                                >
                                                                    <span className="w-4 h-4 bg-yellow-400 border border-yellow-500 rounded-sm mr-3 flex-shrink-0"></span>
                                                                    Free Class
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Time Dropdown */}
                                        <div className="sm:col-span-3">
                                            <label
                                                htmlFor="time"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Time
                                            </label>
                                            <div
                                                className="relative mt-1"
                                                ref={timeDropdownRef}
                                                style={{ width: '304px', height: '38px' }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDropdownToggle(
                                                            "time"
                                                        );
                                                    }}
                                                    onBlur={(e) => {
                                                        // Check if the new focus target is outside our dropdown
                                                        if (
                                                            !timeDropdownRef.current?.contains(
                                                                e.relatedTarget
                                                            )
                                                        ) {
                                                            setDropdownOpen(
                                                                null
                                                            );
                                                        }
                                                    }}
                                                    aria-haspopup="listbox"
                                                    aria-expanded={
                                                        dropdownOpen === "time"
                                                    }
                                                    className={`w-full h-full text-left px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-between ${
                                                        dropdownOpen === "time"
                                                            ? "bg-orange-50 border border-orange-200 text-navy-700"
                                                            : "bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm"
                                                    }`}
                                                    style={{ height: '38px' }}
                                                >
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 mr-2 text-navy-400" />
                                                        {formData.time ? (
                                                            <span className="text-navy-900">
                                                                {timeOptions.find(
                                                                    (opt) =>
                                                                        opt.value ===
                                                                        formData.time
                                                                )?.label ||
                                                                    formData.time}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-500">
                                                                Select Time
                                                            </span>
                                                        )}
                                                    </div>
                                                    {dropdownOpen === "time" ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </button>

                                                {dropdownOpen === "time" && (
                                                    <div className="absolute z-[9999] mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                                                        <div
                                                            className="max-h-60 overflow-y-auto"
                                                            style={{
                                                                maxHeight:
                                                                    "15rem",
                                                            }}
                                                        >
                                                            <div className="p-2 space-y-1">
                                                                <button
                                                                    key="select-time"
                                                                    type="button"
                                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                        !formData.time
                                                                            ? "bg-navy-600 text-white"
                                                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                                    }`}
                                                                    onMouseDown={(
                                                                        e
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        handleTimeSelect(
                                                                            ""
                                                                        );
                                                                    }}
                                                                >
                                                                    <span className="mr-2">
                                                                        <span className="h-4 w-4 opacity-0"></span>
                                                                    </span>
                                                                    Select Time
                                                                    {!formData.time && (
                                                                        <Check className="h-4 w-4 text-white ml-auto" />
                                                                    )}
                                                                </button>
                                                                {timeOptions.map(
                                                                    (time) => {
                                                                        const isSelected =
                                                                            formData.time ===
                                                                            time.value;
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    time.value
                                                                                }
                                                                                type="button"
                                                                                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                                    isSelected
                                                                                        ? "bg-navy-600 text-white"
                                                                                        : "text-navy-700 hover:bg-navy-50"
                                                                                }`}
                                                                                onMouseDown={(
                                                                                    e
                                                                                ) => {
                                                                                    e.preventDefault();
                                                                                    handleTimeSelect(
                                                                                        time.value
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <Clock className="h-4 w-4 mr-2 text-navy-400" />
                                                                                <span className="flex-1">
                                                                                    {
                                                                                        time.label
                                                                                    }
                                                                                </span>
                                                                                {isSelected && (
                                                                                    <Check className="h-4 w-4 ml-2 text-white" />
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-base font-medium text-white hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                                    >
                                        Add Class
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Transition.Child>
                </div>
            </div>
        </Transition>
    );
};
export default AddClassesModal;
