import React, { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import axios from "axios";
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

const UpdateClassesModal = ({
    isOpen,
    onClose,
    onSubmit,
    classForm = {},
    onInputChange,
    isUpdating = false,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);
    const timeDropdownRef = useRef(null);
    const classTypeDropdownRef = useRef(null);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch active teachers when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchActiveTeachers();
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

    const handleDropdownToggle = (dropdown) => {
        setDropdownOpen(dropdownOpen === dropdown ? null : dropdown);
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
            value: "Valid for cancellation",
            label: "Valid for cancellation",
            icon: CheckCircle,
            bgColor: "bg-green-100",
            textColor: "text-green-900",
        },
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
            bgColor: "bg-gray-100",
            textColor: "text-gray-900",
        },
        {
                    value: "Cancelled (RG)",
        label: "Cancelled (RG)",
            icon: XCircle,
            bgColor: "bg-red-100",
            textColor: "text-red-900",
        },
    ];

    const classTypeOptions = [
        {
            value: "Regular",
            label: "Regular Class",
            icon: User,
            bgColor: "bg-blue-100",
            textColor: "text-blue-900",
        },
        {
            value: "Premium",
            label: "Premium Class",
            icon: Gem,
            bgColor: "bg-purple-100",
            textColor: "text-purple-900",
        },
        {
            value: "Group",
            label: "Group Class",
            icon: Users,
            bgColor: "bg-green-100",
            textColor: "text-green-900",
        },
    ];

    const getStatusOption = (status) => {
        const option = statusOptions.find((opt) => opt.value === status);
        return (
            option || {
                bg: "bg-gray-100",
                text: "text-gray-700",
                icon: HelpCircle,
            }
        );
    };

    const getClassTypeOption = (type) => {
        const option = classTypeOptions.find((opt) => opt.value === type);
        return (
            option || {
                bg: "bg-gray-100",
                text: "text-gray-700",
                icon: "HelpCircle",
            }
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);
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
                                    {isUpdating
                                        ? "Updating..."
                                        : "Update Class"}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="bg-navy-600 rounded-full p-1 text-gray-300 hover:text-white focus:outline-none transition-colors duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={onSubmit}>
                                <div className="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        {/* Student Name */}
                                        <div className="sm:col-span-6">
                                            <label
                                                htmlFor="studentName"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Student Name
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    name="studentName"
                                                    id="studentName"
                                                    required
                                                    value={
                                                        classForm.studentName ||
                                                        ""
                                                    }
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
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
                                                        {classForm.teacherName ? (
                                                            <span className="truncate">
                                                                {
                                                                    classForm.teacherName
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
                                                                        !classForm.teacherName
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
                                                                    {!classForm.teacherName && (
                                                                        <Check className="h-4 w-4 text-white ml-auto" />
                                                                    )}
                                                                </button>
                                                                {teachers.length > 0 ? (
                                                                    teachers.map(
                                                                    (
                                                                        teacher
                                                                    ) => {
                                                                        const isSelected =
                                                                            classForm.teacherName ===
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
                                                                    })
                                                                ) : loading ? (
                                                                    <div className="w-full p-3 text-center text-sm text-gray-500">
                                                                        Loading teachers...
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-full p-3 text-center text-sm text-gray-500">
                                                                        No active teachers found
                                                                    </div>
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
                                                        {classForm.classType ? (
                                                            <>
                                                                <span
                                                                    className={`mr-2 ${
                                                                        getClassTypeOption(
                                                                            classForm.classType
                                                                        )
                                                                            .bgColor
                                                                    } rounded-full p-1`}
                                                                >
                                                                    {React.createElement(
                                                                        getClassTypeOption(
                                                                            classForm.classType
                                                                        ).icon,
                                                                        {
                                                                            className: `h-4 w-4 ${
                                                                                getClassTypeOption(
                                                                                    classForm.classType
                                                                                )
                                                                                    .textColor
                                                                            }`,
                                                                        }
                                                                    )}
                                                                </span>
                                                                <span className="truncate">
                                                                    {classTypeOptions.find(
                                                                        (opt) =>
                                                                            opt.value ===
                                                                            classForm.classType
                                                                    )?.label ||
                                                                        classForm.classType}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-500">
                                                                Select Class
                                                                Type
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
                                                                <button
                                                                    key="select-class-type"
                                                                    type="button"
                                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                                        !classForm.classType
                                                                            ? "bg-navy-600 text-white"
                                                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                                    }`}
                                                                    onMouseDown={(
                                                                        e
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        handleClassTypeSelect(
                                                                            ""
                                                                        );
                                                                    }}
                                                                >
                                                                    <span className="mr-2 rounded-full p-1">
                                                                        <span className="h-4 w-4 opacity-0"></span>
                                                                    </span>
                                                                    Select Class
                                                                    Type
                                                                    {!classForm.classType && (
                                                                        <Check className="h-4 w-4 text-white ml-auto" />
                                                                    )}
                                                                </button>
                                                                {classTypeOptions.map(
                                                                    (type) => {
                                                                        const isSelected =
                                                                            classForm.classType ===
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
                                                                                            : ""
                                                                                    } rounded-full p-1`}
                                                                                >
                                                                                    {React.createElement(
                                                                                        type.icon,
                                                                                        {
                                                                                            className: `h-4 w-4 ${
                                                                                                isSelected
                                                                                                    ? "text-white"
                                                                                                    : type.textColor
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
                                                        classForm.schedule || ""
                                                    }
                                                    onChange={onInputChange}
                                                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
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
                                                className="relative w-full mt-1"
                                                ref={timeDropdownRef}
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
                                                    className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-between h-[42px] ${
                                                        dropdownOpen === "time"
                                                            ? "bg-orange-50 border border-orange-200 text-navy-700"
                                                            : "bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm"
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 mr-2 text-navy-400" />
                                                        {classForm.time ? (
                                                            <span className="text-navy-900">
                                                                {timeOptions.find(
                                                                    (opt) =>
                                                                        opt.value ===
                                                                        classForm.time
                                                                )?.label ||
                                                                    classForm.time}
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
                                                                        !classForm.time
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
                                                                    {!classForm.time && (
                                                                        <Check className="h-4 w-4 text-white ml-auto" />
                                                                    )}
                                                                </button>
                                                                {timeOptions.map(
                                                                    (time) => {
                                                                        const isSelected =
                                                                            classForm.time ===
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
                                        {/* Hidden Status Input - Default to "valid for cancellation" */}
                                        <input
                                            type="hidden"
                                            name="status"
                                            value={classForm.status || "Valid for cancellation"}
                                            onChange={onInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                                    <button
                                        type="submit"
                                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 ${
                                            isUpdating
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                                        }`}
                                        disabled={isUpdating}
                                    >
                                        Update Class
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200 ${
                                            isUpdating
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-gray-50"
                                        }`}
                                        disabled={isUpdating}
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
export default UpdateClassesModal;
