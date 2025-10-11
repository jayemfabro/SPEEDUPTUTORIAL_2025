import React, { useState, useEffect, useRef } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import AddClassesModal from "@/Components/Admin/AddClassesModal";
import UpdateClassesModal from "@/Components/Admin/UpdateClassesModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    Users,
    DownloadCloud,
} from "lucide-react";
import axios from "axios";
import { CLASS_STATUS_COLORS, getClassStatusColor } from "@/utils/colorMapping";
import html2pdf from 'html2pdf.js';


export default function AdminClasses() {
    const { auth } = usePage().props;

    // Helper function to convert date format to yyyy-MM-dd
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        
        // If it's already in yyyy-MM-dd format, return as is
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        
        // If it's in MM/dd/yyyy format, convert it
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const [month, day, year] = parts;
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
        
        return '';
    };

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

    // Classes and teachers state
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState({});
    const [loading, setLoading] = useState(true);
    


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
        // teacher_id: "",
        teacherName: "",
        student_name: "",
        class_type: "Regular",
        schedule: "",
        time: "",
        status: "Valid for Cancellation", // <-- This should NOT be "Cancelled"
    });

    // Handle sorting
    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // Helper function to get clean status display name
    const getCleanStatusName = (status) => {
        // If the status is already clean (from AdminCalendar style), return as is
        const cleanStatuses = [
            "Valid for Cancellation",
            "Free Class",
            "FC not consumed", 
            "Completed",
            "Absent w/ntc counted",
            "Cancelled",
            "Absent w/ntc-not counted", 
            "FC consumed"
        ];
        
        if (cleanStatuses.includes(status)) {
            return status;
        }
        
        // Map from database format to clean display format
        const statusMap = {
            "FC not consumed (RG)": "FC not consumed",
            "FC consumed (RG)": "FC consumed", 
            "Completed (RG)": "Completed",
            "Completed (PRM)": "Completed",
            "Absent w/ntc counted (RG)": "Absent w/ntc counted",
            "Absent w/ntc-not counted (RG)": "Absent w/ntc-not counted",
            "Cancelled (RG)": "Cancelled",
        };
        return statusMap[status] || status;
    };

    // Helper function to convert 24-hour time to 12-hour format
    const formatTimeTo12Hour = (time24) => {
        if (!time24) return time24;
        
        try {
            // Create a date object with the time
            const [hours, minutes] = time24.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            
            // Format to 12-hour time
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return time24; // Return original if formatting fails
        }
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
            filtered = filtered.filter((cls) => {
                // Convert database status to clean format for comparison
                const cleanStatus = getCleanStatusName(cls.status);
                return cleanStatus === filterStatus;
            });
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

    // State for header checkbox

    const [showExportOptions, setShowExportOptions] = useState(false);
    const [exportType, setExportType] = useState('all'); // 'all' or 'student'
    const [selectedStudent, setSelectedStudent] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [processingExport, setProcessingExport] = useState(false);
    const [exportConfig, setExportConfig] = useState({ type: 'all', studentId: '' });





    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Helper function to get export title based on export type
    const getExportTitle = (exportType, studentId) => {
        if (exportType === 'student' && studentId) {
            return `Classes for Student: ${studentId}`;
        }
        return 'All Classes';
    };

    // Handle exporting classes as PDF with direct download
    const handleExportAsPDF = () => {
        try {
            setProcessingExport(true);
            
            const { type: exportType, studentId } = exportConfig;
            
            // Filter classes based on export type
            let classesToExport = [...filteredClasses];
            
            // Apply additional filters based on export type
            if (exportType === 'student' && studentId) {
                classesToExport = classesToExport.filter(cls => 
                    cls.student_id === studentId || cls.student_name === studentId
                );
            }
            
            // Sort classes by date and time
            classesToExport.sort((a, b) => {
                // First sort by date
                const dateA = new Date(a.schedule || 0);
                const dateB = new Date(b.schedule || 0);
                
                if (dateA - dateB !== 0) {
                    return dateA - dateB;
                }
                
                // If same date, sort by time
                return a.time?.localeCompare(b.time || '');
            });
            
            // Get current date info for the title
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            
            // Month names for display
            const monthNames = ["January", "February", "March", "April", "May", "June",
                               "July", "August", "September", "October", "November", "December"];
            
            // Create a container for PDF generation
            const element = document.createElement('div');
            
            // Set the HTML content for the PDF
            element.innerHTML = `
                                                                                                <div style="font-family: 'Inter', Arial, sans-serif; background: #fff; color: #222; min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-start;">
                                                                                                    <!-- Header (fixed at top) -->
                                                                                                    <div style="position: relative; top: 0; left: 0; width: 100%; z-index: 10;">
                                                                                                        <div style="background: #11235A; border-radius: 18px 18px 0 0; padding: 24px 32px 10px 32px; display: flex; align-items: flex-start; justify-content: space-between;">
                                                                                                            <div style="display: flex; align-items: center;">
                                                                                                                <img src="/Logo/SpeedUp.png" alt="Logo" style="height: 48px; width: 48px; border-radius: 50%; background: #fff; margin-right: 18px;" />
                                                                                                                <div>
                                                                                                                    <div style="font-size: 1.5rem; font-weight: 700; color: #fff;">SpeedUp Tutorial Center</div>
                                                                                                                    <div style="font-size: 1rem; color: #fff; margin-top: 2px;">Manage your classes and their information.</div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div style="text-align: right; color: #FFD600; font-size: 1.5rem; font-weight: 700; letter-spacing: 1px; margin-top: 4px;">SCHEDULE</div>
                                                                                                        </div>
                                                                                                        <div style="background: #FFD600; color: #222; font-size: 1rem; font-weight: 500; padding: 10px 32px; display: flex; align-items: center; border-radius: 0 0 18px 18px;">
                                                                                                            <span style="display: flex; align-items: center;">
                                                                                                                <svg style="height: 18px; width: 18px; margin-right: 8px;" fill="none" stroke="#11235A" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#11235A" stroke-width="2" fill="#FFD600"/><circle cx="12" cy="12" r="3" fill="#11235A"/></svg>
                                                                                                                123 Anywhere St., Any City, ST 12345
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <!-- Table (main content) -->
                                                                                                    <div style="flex: 1 0 auto; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px; max-width: 900px; margin-top: 32px; margin-bottom: 32px;">
                                                                                                        <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
                                                                                                            <thead>
                                                                                                                <tr>
                                                                                                                    <th style="background: #11235A; color: #fff; padding: 16px 12px; text-align: left; font-weight: 700; font-size: 1rem; border-top-left-radius: 8px;">TEACHER</th>
                                                                                                                    <th style="background: #11235A; color: #fff; padding: 16px 12px; text-align: left; font-weight: 700; font-size: 1rem;">STUDENT</th>
                                                                                                                    <th style="background: #11235A; color: #fff; padding: 16px 12px; text-align: left; font-weight: 700; font-size: 1rem;">CLASS TYPE</th>
                                                                                                                    <th style="background: #11235A; color: #fff; padding: 16px 12px; text-align: left; font-weight: 700; font-size: 1rem; border-top-right-radius: 8px;">DATE</th>
                                                                                                                </tr>
                                                                                                            </thead>
                                                                                                            <tbody>
                                                                                                                ${classesToExport.map((cls, index) => `
                                                                                                                    <tr style="background: ${index % 2 === 1 ? '#f2f7ff' : '#fff'};">
                                                                                                                        <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; font-size: 15px; color: #222;">
                                                                                                                            ${teachers[cls.teacher_id]?.name || 'Unknown Teacher'}
                                                                                                                            <div style='font-size: 12px; color: #888;'>${teachers[cls.teacher_id]?.email || ''}</div>
                                                                                                                        </td>
                                                                                                                        <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; font-size: 15px; color: #222;">
                                                                                                                            ${cls.student_name ? cls.student_name.replace(/^"|"$/g, '') : 'N/A'}
                                                                                                                        </td>
                                                                                                                        <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; font-size: 15px; color: #222;">
                                                                                                                            ${cls.class_type || 'Regular'}
                                                                                                                        </td>
                                                                                                                        <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; font-size: 15px; color: #222;">
                                                                                                                            ${cls.schedule ? new Date(cls.schedule).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                                                                                        </td>
                                                                                                                    </tr>
                                                                                                                `).join('')}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </div>
                                                                                                    <!-- Footer (fixed at bottom) -->
                                                                                                    <div style="flex-shrink: 0; width: 100%;">
                                                                                                        <div style="background: #FFD600; color: #222; font-size: 1rem; font-weight: 500; padding: 10px 32px; display: flex; align-items: center; border-radius: 0 0 18px 18px; margin: 0 auto; max-width: 900px; justify-content: space-between;">
                                                                                                            <span style="display: flex; align-items: center;">
                                                                                                                <svg style="height: 18px; width: 18px; margin-right: 8px;" fill="none" stroke="#11235A" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#11235A" stroke-width="2" fill="#FFD600"/><circle cx="12" cy="12" r="3" fill="#11235A"/></svg>
                                                                                                                +123-456-7890
                                                                                                            </span>
                                                                                                            <span style="display: flex; align-items: center;">
                                                                                                                <svg style="height: 18px; width: 18px; margin-right: 8px;" fill="none" stroke="#11235A" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#FFD600" stroke="#11235A" stroke-width="2"/><path d="M8 12h8M8 16h8M8 8h8" stroke="#11235A" stroke-width="2"/></svg>
                                                                                                                www.reallygreatsite.com
                                                                                                            </span>
                                                                                                            <span style="display: flex; align-items: center;">
                                                                                                                <svg style="height: 18px; width: 18px; margin-right: 8px;" fill="none" stroke="#11235A" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#FFD600" stroke="#11235A" stroke-width="2"/></svg>
                                                                                                                123 Anywhere St., Any City, ST 12345
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        <div style="text-align: center; font-size: 12px; color: #6c757d; margin-top: 8px; margin-bottom: 8px;">
                                                                                                            Generated on ${new Date().toLocaleString()} | Total: ${classesToExport.length} classes
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                </div>
            `;
            
            // Configure PDF options
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `${exportType === 'student' ? `Classes_${studentId.replace(/\s+/g, '_')}` : 'All_Classes'}_${now.toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Generate and download PDF using html2pdf
            setTimeout(() => {
                html2pdf().from(element).set(opt).save()
                    .then(() => {
                        toast.success("PDF downloaded successfully!");
                        setProcessingExport(false);
                        setShowExportModal(false);
                    });
            }, 1000);
            
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            toast.error("An error occurred while generating the PDF.");
            setProcessingExport(false);
            setShowExportModal(false);
        }
    };

    // Handle opening the add class modal
    const openAddClassModal = () => {
        setEditingClass(null);
        setFormData({
            teacher_id: "",
            teacherName: "",
            student_name: "",
            student_email: "",
            student_id: "",
            studentName: "",
            class_type: "Regular",
            classType: "Regular",
            schedule: "",
            time: "",
            status: "Valid for Cancellation",
        });
        setShowAddModal(true);
    };

    // Handle opening the edit class modal
    const openEditClassModal = (cls) => {
        setEditingClass(cls);
        setFormData({
            teacher_id: cls.teacher_id || "",
            teacherName: cls.teacher_name || "",
            studentName: cls.student_name || "",
            classType: cls.class_type || "Regular",
            schedule: formatDateForInput(cls.schedule || ""),
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
    
    // Fetch classes data when component mounts
    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);
    
    // Fetch classes data from API
    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/classes');
            setClasses(response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch teachers data from API
    const fetchTeachers = async () => {
        try {
            const response = await axios.get('/api/admin/active-teachers');
            console.log('Raw teacher data from API:', response.data);
            // Convert array to object with teacher ID as key
            const teachersObj = {};
            response.data.forEach(teacher => {
                teachersObj[teacher.id] = { 
                    name: teacher.name,
                    image: teacher.image || teacher.avatar || null,
                    email: teacher.email || null
                };
            });
            console.log('Processed teachers object:', teachersObj);
            setTeachers(teachersObj);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    // Accept selectedStudents for group class
    const handleSubmitForm = async (e, selectedStudents = []) => {
        e.preventDefault();
        console.log('Form data being submitted:', formData);
        try {
            if (formData.classType === 'Group') {
                if (!selectedStudents || selectedStudents.length === 0) {
                    toast.error('Please select at least one student for group class.');
                    return;
                }
                // Send a separate request for each student
                await Promise.all(selectedStudents.map(async (student) => {
                    const apiData = {
                        teacher_id: formData.teacher_id,
                        student_name: student.name,
                        class_type: formData.classType,
                        schedule: formData.schedule,
                        time: formData.time,
                        status: formData.status
                    };
                    await axios.post('/api/admin/classes', apiData);
                }));
                toast.success('Group class created successfully! Multiple students have been added to this time slot.');
            } else {
                const apiData = {
                    teacher_id: formData.teacher_id,
                    student_name: formData.studentName || formData.student_name,
                    class_type: formData.classType || formData.class_type,
                    schedule: formData.schedule,
                    time: formData.time,
                    status: formData.status
                };
                console.log('API data being sent:', apiData);
                if (editingClass) {
                    await axios.put(`/api/admin/classes/${editingClass.id}`, apiData);
                    toast.success('Class updated successfully!');
                } else {
                    await axios.post('/api/admin/classes', apiData);
                    toast.success('Class created successfully!');
                }
            }
            fetchClasses();
            setFormData({
                teacher_id: "",
                teacherName: "",
                studentName: "",
                classType: "Regular",
                schedule: "",
                time: "",
                status: "FC not consumed (RG)",
            });
            setShowAddModal(false);
            setShowEditModal(false);
            setEditingClass(null);
        } catch (error) {
            console.error('Error saving class:', error);
            if (error.response && error.response.status === 409) {
                const conflictData = error.response.data;
                toast.error(
                    <div>
                        <div className="font-semibold text-red-800 mb-2">⚠️ TIME SLOT UNAVAILABLE</div>
                        <div className="text-sm text-red-700 mb-3">
                            <strong>Conflicting class:</strong><br/>
                            • Student: {conflictData.conflicting_class.student_name}<br/>
                            • Class Type: {conflictData.conflicting_class.class_type}<br/>
                            • Time: {conflictData.conflicting_class.time}<br/>
                            • Date: {new Date(conflictData.conflicting_class.schedule).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-red-600">
                            Please choose a different time slot or change to "Group" class type.
                        </div>
                    </div>,
                    {
                        autoClose: 8000,
                        closeOnClick: false,
                        draggable: false
                    }
                );
                setTimeout(() => {
                    if (confirm('Would you like to change the class type to "Group" to allow multiple students at this time slot?')) {
                        setFormData(prev => ({
                            ...prev,
                            classType: "Group"
                        }));
                        toast.info('Class type changed to "Group". Please submit again to create the group class.');
                    }
                }, 1000);
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to save class. Please try again.';
                toast.error(errorMessage);
            }
        }
    };

    // Handle edit button click
    const handleEdit = (cls) => {
        setEditingClass(cls);
        setFormData({
            teacher_id: cls.teacher_id,
            student_name: cls.student_name,
            class_type: cls.class_type,
            schedule: cls.schedule,
            time: cls.time,
            status: cls.status,
        });
        setShowAddModal(true);
    };

    // Handle delete button click
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this class?")) {
            try {
                await axios.delete(`/api/admin/classes/${id}`);
                // Remove the class from the state
                setClasses(classes.filter((cls) => cls.id !== id));
                toast.success('Class deleted successfully!');
            } catch (error) {
                console.error('Error deleting class:', error);
                toast.error('Failed to delete class. Please try again.');
            }
        }
    };

    // Helper function to get legend-exact colors for status dropdown
    const getLegendStatusColor = (status) => {
        const legendColors = {
            "Valid for Cancellation": { bg: "bg-gray-300", border: "border-gray-300" },
            "FC not consumed": { bg: "bg-yellow-400", border: "border-yellow-500" },
            "Free Class": { bg: "bg-yellow-400", border: "border-yellow-500" },
            "Completed": { bg: "bg-green-400", border: "border-green-500" },
            "Absent w/ntc counted": { bg: "bg-blue-400", border: "border-blue-500" },
            "Cancelled": { bg: "bg-purple-400", border: "border-purple-500" },
            "Absent w/ntc-not counted": { bg: "bg-gray-600", border: "border-gray-500" },
            "FC consumed": { bg: "bg-pink-400", border: "border-pink-400" },
            "Absent Without Notice": { bg: "bg-red-400", border: "border-red-500" },
        };
        return legendColors[status] || { bg: "bg-gray-400", border: "border-gray-500" };
    };

    // Get status badge class with colors from legend
    const getStatusBadgeClass = (status) => {
        // First get the clean status name
        const cleanStatus = getCleanStatusName(status);
        // Then get the exact legend colors
        const legendColor = getLegendStatusColor(cleanStatus);
        
        // Determine text color based on background color for better contrast
        let textColor = 'text-white';
        if (cleanStatus === 'FC not consumed' || cleanStatus === 'Free Class') {
            textColor = 'text-black'; // Yellow background needs dark text
        }
        
        return `${legendColor.bg} ${textColor} border ${legendColor.border} px-3 py-1 rounded-md text-xs font-medium inline-block min-w-[180px] text-center`;
    };

    // Get class type badge class with colors matching the legend
    const getClassTypeBadgeClass = (type) => {
        switch (type.toLowerCase()) {
            case "premium":
                return "bg-orange-500 text-white border border-orange-600 px-3 py-1 text-xs font-semibold rounded-full inline-block min-w-[80px] text-center";
            case "group":
                return "bg-[#4A9782] text-white border border-[#4A9782] px-3 py-1 text-xs font-semibold rounded-full inline-block min-w-[80px] text-center";
            case "regular":
            default:
                return "bg-navy-500 text-white border border-blue-700 px-3 py-1 text-xs font-semibold rounded-full inline-block min-w-[80px] text-center";
        }
    };

    // Example: Count only valid free classes, exclude cancelled
    const getFreeClassCount = () => {
        return classes.filter(cls => {
            const status = getCleanStatusName(cls.status);
            return (
                (status === "FC not consumed" || status === "FC consumed") &&
                cls.class_type.toLowerCase() === "regular"
            );
        }).length;
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
            <div>
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
                        <div className="flex flex-col sm:flex-row gap-4 w-full overflow-visible">
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
                            <div className="relative w-full sm:w-56 z-[9999]">
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
                            <div className="relative w-full sm:w-64 z-[90]">
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
                                                {getCleanStatusName(filterStatus)}
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
                                    <div className="absolute z-[100] mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
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
                                                    "Valid for Cancellation",
                                                    "FC not consumed",
                                                    "Completed",
                                                    "Absent w/ntc counted",
                                                    "Cancelled",
                                                    "Absent w/ntc-not counted",
                                                    "FC consumed",
                                                ].map((status) => {
                                                    const legendColor = getLegendStatusColor(status);
                                                    return (
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
                                                            <span className={`w-4 h-4 ${legendColor.bg} ${legendColor.border} border rounded-sm mr-3 flex-shrink-0`}></span>
                                                            {status}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Export as PDF Button with dropdown */}
                            <div className="relative inline-block">
                                <button
                                    onClick={() => setShowExportOptions(!showExportOptions)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 whitespace-nowrap h-[42px] mr-2"
                                >
                                    <DownloadCloud className="-ml-1 mr-2 h-5 w-5" />
                                    Export Classes
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </button>
                                
                                {showExportOptions && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                            <div className="px-4 py-2">
                                                <button
                                                    onClick={() => {
                                                        setExportConfig({ type: 'all', studentId: '' });
                                                        setShowExportModal(true);
                                                        setShowExportOptions(false);
                                                    }}
                                                    className="block w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    role="menuitem"
                                                >
                                                    Export All Classes
                                                </button>
                                            </div>
                                            
                                            <div className="border-t border-gray-100">
                                                <div className="block px-4 py-2 text-sm text-gray-700 font-medium">
                                                    Export By Student
                                                </div>
                                                <div className="px-4 py-2">
                                                    <select
                                                        value={selectedStudent}
                                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="">Select Student</option>
                                                        {Array.from(new Set(classes.map(cls => cls.student_name)))
                                                            .filter(name => name)
                                                            .sort()
                                                            .map(name => (
                                                                <option key={name} value={name}>{name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <button
                                                        onClick={() => {
                                                            if (selectedStudent) {
                                                                setExportConfig({ type: 'student', studentId: selectedStudent });
                                                                setShowExportModal(true);
                                                                setShowExportOptions(false);
                                                            } else {
                                                                toast.error("Please select a student");
                                                            }
                                                        }}
                                                        className="mt-2 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Export
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Add Class Button */}
                            <button
                                onClick={openAddClassModal}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all duration-300 transform hover:scale-105 whitespace-nowrap h-[42px]"
                            >
                                <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                                Add Class
                            </button>
                            </div>
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
                                        className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
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
                                            colSpan="8"
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
                                            className="transition-all duration-200 hover:bg-gray-50"
                                        >

                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 relative">
                                                        {teachers[cls.teacher_id]?.image ? (
                                                            <img 
                                                                className="h-10 w-10 rounded-full object-cover border-2 border-blue-200" 
                                                                src={teachers[cls.teacher_id].image} 
                                                                alt={teachers[cls.teacher_id]?.name || "Teacher"}
                                                                onError={(e) => {
                                                                    // Fallback to default icon if image fails to load
                                                                    e.target.style.display = 'none';
                                                                    const fallback = e.target.parentNode.querySelector('.fallback-icon');
                                                                    if (fallback) fallback.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div 
                                                            className={`fallback-icon h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-200 ${teachers[cls.teacher_id]?.image ? 'hidden' : 'flex'}`}
                                                        >
                                                            <User className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-navy-900">
                                                            {teachers[
                                                                cls.teacher_id
                                                            ]?.name ||
                                                                "Unknown Teacher"}
                                                        </div>
                                                        {teachers[cls.teacher_id]?.email && (
                                                            <div className="text-xs text-gray-500">
                                                                {teachers[cls.teacher_id].email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-navy-900">
                                                    {cls.student_name ? cls.student_name.replace(/^"|"$/g, '') : ''}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <span className={getClassTypeBadgeClass(cls.class_type)}>
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
                                                    {formatTimeTo12Hour(cls.time)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={getStatusBadgeClass(cls.status)}>
                                                    {getCleanStatusName(cls.status)}
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
                    setEditingClass(null);
                    setFormData({
                        teacher_id: "",
                        teacherName: "",
                        student_name: "",
                        class_type: "Regular",
                        schedule: "",
                        time: "",
                        status: "FC not consumed (RG)",
                    });
                }}
                onSubmit={handleSubmitForm}
                formData={formData}
                onInputChange={handleInputChange}
                isEditing={editingClass ? true : false}
            />

            {/* Edit Class Modal */}
            <UpdateClassesModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingClass(null);
                    setFormData({
                        teacher_id: "",
                        teacherName: "",
                        student_name: "",
                        class_type: "Regular",
                        schedule: "",
                        time: "",
                        status: "FC not consumed (RG)",
                    });
                }}
                onSubmit={handleSubmitForm}
                classForm={formData}
                onInputChange={handleInputChange}
                isUpdating={false}
            />

                <ToastContainer />
                
                {/* Export Confirmation Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-6 w-96 max-w-lg">
                            <div className="flex flex-col items-center justify-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {processingExport ? "Generating PDF..." : "Confirm Export"}
                                </h3>
                                
                                {processingExport ? (
                                    <div className="flex flex-col items-center py-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                        <p className="text-sm text-gray-500">
                                            Preparing your download...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-500 mb-4 text-center">
                                            {exportConfig.type === 'student' 
                                                ? `Are you sure you want to export classes for ${exportConfig.studentId}?`
                                                : 'Are you sure you want to export all classes?'
                                            }
                                        </p>
                                        
                                        <div className="flex justify-end w-full space-x-3">
                                            <button
                                                onClick={() => setShowExportModal(false)}
                                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleExportAsPDF}
                                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}