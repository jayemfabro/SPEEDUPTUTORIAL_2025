import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import AddStudentModal from "@/Components/Admin/AddStudentModal";
import UpdateStudentModal from "@/Components/Admin/UpdateStudentModal";
import { Transition } from "@headlessui/react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    PlusCircle,
    Search,
    Edit,
    Trash2,
    BookOpen,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

export default function Students() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentStudent, setCurrentStudent] = useState(null);

    // Students data
    const [students, setStudents] = useState([]);
    
    // Bulk delete functionality
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Add state for all classes
    const [allClasses, setAllClasses] = useState([]);

    // Get class type badge class with colors matching AdminClasses
    const getClassTypeBadgeClass = (type) => {
        switch (type?.toLowerCase()) {
            case "premium":
                return "bg-orange-500 text-white border border-orange-600 px-3 py-1 text-xs font-semibold rounded-full inline-block min-w-[80px] text-center";
            case "group":
                return "bg-[#4A9782] text-white border border-[#4A9782] px-3 py-1 text-xs font-semibold rounded-full inline-block min-w-[80px] text-center";
            case "regular":
            default:
                return "bg-navy-500 text-white border border-blue-700 px-3 py-1 text-xs font-semibold rounded-full inline-block min-w-[80px] text-center";
        }
    };

    // Form state for student data
    const [studentForm, setStudentForm] = useState({
        name: "",
        email: "",
        purchased_class_regular: 0,
        purchased_class_premium: 0,
        purchased_class_group: 0,
        class_left: 0,
        completed: 0,
        cancelled: 0,
        free_classes: 0,
        free_class_consumed: 0,
        absent_w_ntc_counted: 0,
        absent_w_ntc_not_counted: 0,
        absent_without_notice: 0,
    });

    // Load students data
    const fetchStudents = async () => {
        try {
            const response = await axios.get('/api/admin/students');
            const rawStudents = response.data || [];
            
            // Apply computation logic to all students to ensure data consistency
            const computedStudents = rawStudents.map(student => {
                const purchasedClass = (student.purchased_class_regular || 0) + (student.purchased_class_premium || 0) + (student.purchased_class_group || 0);
                const completed = student.completed || 0;
                const absentCounted = student.absent_w_ntc_counted || 0;
                const absentWithoutNotice = student.absent_without_notice || 0;
                const freeClassConsumed = student.free_class_consumed || 0;
                // Recalculate class_left based on the formula: total purchased - completed - absent_counted - absent_without_notice - free_class_consumed
                const classLeft = Math.max(0, purchasedClass - completed - absentCounted - absentWithoutNotice - freeClassConsumed);
                
                // Calculate free classes: cancelled classes add to free classes, consumed classes reduce free classes
                let freeClasses = (student.free_classes || 0);
                
                const computedStudent = {
                    ...student,
                    class_left: classLeft,
                    free_classes: Math.max(0, freeClasses)
                };
                
                return computedStudent;
            });
            
            setStudents(computedStudents);

            // Debug log to check students data
            console.log("Fetched students:", computedStudents);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Error loading students data.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setStudents([]); // Set to empty array to prevent null/undefined errors
        }
    };

    // Fetch all classes for per-type usage
    const fetchClasses = async () => {
        try {
            const response = await axios.get('/api/admin/classes');
            setAllClasses(response.data || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setAllClasses([]);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchClasses(); // Fetch classes on mount

        // Set up automatic refresh when the page becomes visible again
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchStudents();
            }
        };

        // Set up periodic refresh every 10 seconds for testing
        const intervalId = setInterval(() => {
            fetchStudents();
        }, 10000);

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Listen for class updates from other pages
        const handleClassUpdated = () => {
            fetchStudents();
            fetchClasses();
        };
        window.addEventListener('classUpdated', handleClassUpdated);

        // Set up the global function after students state is available
        window.updateStudentStats = async (studentName, statusChange) => {
            try {
                // Refresh the students data first to get latest state
                await fetchStudents();
                
                // Find student by name from the latest students data
                const response = await axios.get('/api/admin/students');
                const currentStudents = response.data || [];
                const student = currentStudents.find(s => s.name.toLowerCase() === studentName.toLowerCase());
                
                if (!student) {
                    return;
                }

                let updatedData = { ...student };

                // Apply computation based on status change
                switch (statusChange.toLowerCase()) {
                    case 'completed':
                        updatedData.completed = (updatedData.completed || 0) + 1;
                        updatedData.class_left = Math.max(0, (updatedData.class_left || 0) - 1);
                        break;

                    case 'cancelled':
                        updatedData.cancelled = (updatedData.cancelled || 0) + 1;
                        // Do NOT increment free_classes here
                        break;

                    case 'absent w/ntc counted':
                        updatedData.absent_w_ntc_counted = (updatedData.absent_w_ntc_counted || 0) + 1;
                        break;

                    case 'absent w/ntc-not counted':
                        updatedData.free_classes = (updatedData.free_classes || 0) + 1;
                        break;

                    case 'absent without notice':
                        // +1 to absent without notice - class type will be handled by backend calculation
                        updatedData.absent_without_notice = (updatedData.absent_without_notice || 0) + 1;
                        break;

                    case 'fc consumed':
                    case 'free class consumed':
                        updatedData.free_class_consumed = (updatedData.free_class_consumed || 0) + 1;
                        updatedData.free_classes = Math.max(0, (updatedData.free_classes || 0) - 1);
                        break;
                }

                // Recalculate class_left
                const purchasedClass = updatedData.purchased_class || 0;
                const completed = updatedData.completed || 0;
                const absentCounted = updatedData.absent_w_ntc_counted || 0;
                const absentWithoutNotice = updatedData.absent_without_notice || 0;
                const freeClassConsumed = updatedData.free_class_consumed || 0;
                
                updatedData.class_left = Math.max(0, purchasedClass - completed - absentCounted - absentWithoutNotice - freeClassConsumed);

                // Update in database
                const updateResponse = await axios.put(`/api/admin/students/${student.id}`, updatedData);
                const savedStudent = updateResponse.data;

                // Force refresh the students list
                await fetchStudents();

                toast.success(`Student ${studentName} updated: ${statusChange}`, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

        

                return savedStudent;
            } catch (error) {
                console.error(`Error updating student stats for ${studentName}:`, error);
                toast.error(`Error updating student ${studentName}`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                throw error;
            }
        };

        // Cleanup
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('classUpdated', handleClassUpdated);
            // Clean up global function
            delete window.updateStudentStats;
        };
    }, []);

    // Handle input change for the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStudentForm((prev) => {
            const result = computeStudentData(prev, name, value);
            return result;
        });
    };

    // Computation function for student data
    const computeStudentData = (formData, fieldName, newValue) => {
        const updatedForm = {
            ...formData,
            [fieldName]: newValue,
        };

        const toInt = (v) => parseInt(v) || 0;

        // Cancelled: add to free_classes
        if (fieldName === 'cancelled') {
            const cancelled = toInt(newValue);
            const previousCancelled = toInt(formData.cancelled);
            if (cancelled > previousCancelled) {
                updatedForm.free_classes = toInt(updatedForm.free_classes) + (cancelled - previousCancelled);
            }
        }

        // FC Consumed: reduce free_classes
        if (fieldName === 'free_class_consumed') {
            const consumed = toInt(newValue);
            const previousConsumed = toInt(formData.free_class_consumed);
            if (consumed > previousConsumed) {
                updatedForm.free_classes = Math.max(0, toInt(updatedForm.free_classes) - (consumed - previousConsumed));
            }
        }

        // Absent w/ntc-not counted: add to free_classes
        if (fieldName === 'absent_w_ntc_not_counted') {
            const absentNotCounted = toInt(newValue);
            const previousAbsentNotCounted = toInt(formData.absent_w_ntc_not_counted);
            if (absentNotCounted > previousAbsentNotCounted) {
                updatedForm.free_classes = toInt(updatedForm.free_classes) + (absentNotCounted - previousAbsentNotCounted);
            }
        }

        // Class left: recalculate
        const totalPurchased = toInt(updatedForm.purchased_class_regular) + toInt(updatedForm.purchased_class_premium) + toInt(updatedForm.purchased_class_group);
        updatedForm.class_left = Math.max(
            0,
            totalPurchased
            - toInt(updatedForm.completed)
            - toInt(updatedForm.absent_w_ntc_counted)
            - toInt(updatedForm.absent_without_notice)
            - toInt(updatedForm.free_class_consumed)
        );

        return updatedForm;
    };

    // Handle form submission for adding a student
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/students', {
                name: studentForm.name,
                email: studentForm.email,
                purchased_class_regular: studentForm.purchased_class_regular,
                purchased_class_premium: studentForm.purchased_class_premium,
                purchased_class_group: studentForm.purchased_class_group,
                class_left: studentForm.class_left,
                completed: studentForm.completed,
                cancelled: studentForm.cancelled,
                free_classes: studentForm.free_classes,
                free_class_consumed: studentForm.free_class_consumed,
                absent_w_ntc_counted: studentForm.absent_w_ntc_counted,
                absent_w_ntc_not_counted: studentForm.absent_w_ntc_not_counted,
                absent_without_notice: studentForm.absent_without_notice,
            });
            toast.success('Student added successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setIsAddModalOpen(false);
            setStudentForm({
                name: "",
                email: "",
                purchased_class_regular: 0,
                purchased_class_premium: 0,
                purchased_class_group: 0,
                class_left: 0,
                completed: 0,
                cancelled: 0,
                free_classes: 0,
                free_class_consumed: 0,
                absent_w_ntc_counted: 0,
                absent_w_ntc_not_counted: 0,
                absent_without_notice: 0,
            });
            // Refresh students list
            fetchStudents();
        } catch (error) {
            console.error('Error adding student:', error);
            toast.error(error.response?.data?.message || 'Failed to add student', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    // Handle student update
    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        
        try {
            const updatedStudent = {
                ...studentForm,
                id: currentStudent.id,
            };

            // Make an API call to update the student in the database
            const response = await axios.put(`/api/admin/students/${currentStudent.id}`, updatedStudent);
            
            // Use the returned data from the server
            const savedStudent = response.data;

            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student.id === currentStudent.id ? savedStudent : student
                )
            );
            
            setIsEditModalOpen(false);
            resetForm();
            toast.success("Student updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error("Error updating student:", error);
            toast.error("Error updating student. Please try again.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    // Function to update a student field with automatic computation
    const updateStudentField = async (studentId, fieldName, newValue) => {
        try {
            // Find the student in current state
            const student = students.find(s => s.id === studentId);
            if (!student) {
                throw new Error('Student not found');
            }

            // Compute the updated data
            const updatedData = computeStudentData(student, fieldName, newValue);

            // Update the student in the database
            const response = await axios.put(`/api/admin/students/${studentId}`, updatedData);
            const savedStudent = response.data;

            // Update the students state
            setStudents(prevStudents =>
                prevStudents.map(s => s.id === studentId ? savedStudent : s)
            );

            toast.success("Student updated successfully with automatic computation!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            return savedStudent;
        } catch (error) {
            console.error("Error updating student field:", error);
            toast.error("Error updating student. Please try again.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            throw error;
        }
    };

    // Handle opening edit modal
    const openEditModal = (student) => {
        setCurrentStudent(student);
        setStudentForm({
            ...student,
        });
        setIsEditModalOpen(true);
    };

    // Handle student deletion
    const handleDeleteStudent = async () => {
        try {
            // Make an API call to delete the student from the database
            await axios.delete(`/api/admin/students/${currentStudent.id}`);
            
            setStudents(prevStudents => 
                prevStudents.filter(student => student.id !== currentStudent.id)
            );
            
            setIsDeleteModalOpen(false);
            resetForm();
            toast.success("Student removed successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error("Error deleting student:", error);
            toast.error("Error deleting student. Please try again.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    // Open delete confirmation
    const openDeleteModal = (student) => {
        setCurrentStudent(student);
        setIsDeleteModalOpen(true);
    };

    // Reset form
    const resetForm = () => {
        setStudentForm({
            name: "",
            email: "",
            purchased_class_regular: 0,
            purchased_class_premium: 0,
            purchased_class_group: 0,
            class_left: 0,
            completed: 0,
            cancelled: 0,
            free_classes: 0,
            free_class_consumed: 0,
            absent_w_ntc_counted: 0,
            absent_w_ntc_not_counted: 0,
            absent_without_notice: 0,
        });
        setCurrentStudent(null);
    };

    // Open add student modal
    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    // Filter students based on search query
    const filteredStudents = students.filter(
        (student) =>
            (student.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            ((student.purchased_class_regular || 0) + (student.purchased_class_premium || 0) + (student.purchased_class_group || 0)).toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Before rendering table
    console.log("Rendering students table, filteredStudents:", filteredStudents);

    // Bulk delete functions
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(filteredStudents.map(student => student.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const handleBulkDelete = async () => {
        if (selectedStudents.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedStudents.length} selected student(s)?`)) {
            setIsDeleting(true);
            try {
                await Promise.all(
                    selectedStudents.map(studentId => 
                        axios.delete(`/api/admin/students/${studentId}`)
                    )
                );
                
                // Remove deleted students from state
                setStudents(prev => prev.filter(student => !selectedStudents.includes(student.id)));
                setSelectedStudents([]);
                
                toast.success(`${selectedStudents.length} student(s) deleted successfully!`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } catch (error) {
                console.error('Error deleting students:', error);
                toast.error('Error deleting some students. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Function to manually recompute all student data
    const recomputeAllStudents = async () => {
        try {
            const updatedStudents = await Promise.all(
                students.map(async (student) => {
                    const totalPurchased = (student.purchased_class_regular || 0) + (student.purchased_class_premium || 0) + (student.purchased_class_group || 0);
                    const completed = student.completed || 0;
                    const absentCounted = student.absent_w_ntc_counted || 0;
                    const absentWithoutNotice = student.absent_without_notice || 0;
                    const freeClassConsumed = student.free_class_consumed || 0;
                    
                    // Recalculate class_left
                    const classLeft = Math.max(0, totalPurchased - completed - absentCounted - absentWithoutNotice - freeClassConsumed);
                    
                    // For cancelled classes, they should add to free_classes
                    // For free_class_consumed, they should reduce free_classes
                    const adjustedFreeClasses = Math.max(0, (student.free_classes || 0));
                    
                    const updatedData = {
                        ...student,
                        class_left: classLeft,
                        free_classes: adjustedFreeClasses
                    };
                    
                    // Update in database
                    try {
                        const response = await axios.put(`/api/admin/students/${student.id}`, updatedData);
                        return response.data;
                    } catch (error) {
                        console.error(`Error updating student ${student.id}:`, error);
                        return updatedData; // Return local computation if API fails
                    }
                })
            );
            
            setStudents(updatedStudents);
            toast.success("All student data recomputed successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error("Error recomputing student data:", error);
            toast.error("Error recomputing student data. Please try again.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    // Global function to update student stats when class status changes
    // This can be called from other pages like AdminClasses
    window.updateStudentStats = async (studentName, statusChange) => {
        try {
            // Find student by name
            const student = students.find(s => s.name.toLowerCase() === studentName.toLowerCase());
            if (!student) {
                console.log(`Student ${studentName} not found`);
                return;
            }

            let updatedData = { ...student };

            // Apply computation based on status change
            switch (statusChange.toLowerCase()) {
                case 'completed':
                    // +1 to completed and -1 to class left
                    updatedData.completed = (updatedData.completed || 0) + 1;
                    break;

                case 'cancelled':
                    // +1 to cancelled, -1 to class left
                    updatedData.cancelled = (updatedData.cancelled || 0) + 1;
                    // Do NOT increment free_classes here
                    break;

                case 'absent w/ntc counted':
                    // +1 to absent w/ntc counted, -1 to class left
                    updatedData.absent_w_ntc_counted = (updatedData.absent_w_ntc_counted || 0) + 1;
                    break;

                case 'absent w/ntc-not counted':
                    // +1 to free class, -1 to class left
                    updatedData.free_classes = (updatedData.free_classes || 0) + 1;
                    break;

                case 'absent without notice':
                    // +1 to absent without notice - class type will be handled by backend calculation
                    updatedData.absent_without_notice = (updatedData.absent_without_notice || 0) + 1;
                    break;

                case 'fc consumed':
                case 'free class consumed':
                    // +1 to free class consumed, -1 to free class
                    updatedData.free_class_consumed = (updatedData.free_class_consumed || 0) + 1;
                    updatedData.free_classes = Math.max(0, (updatedData.free_classes || 0) - 1);
                    break;
            }

            // Recalculate class_left after all changes
            const totalPurchased = (updatedData.purchased_class_regular || 0) + (updatedData.purchased_class_premium || 0) + (updatedData.purchased_class_group || 0);
            const completed = updatedData.completed || 0;
            const absentCounted = updatedData.absent_w_ntc_counted || 0;
            const absentWithoutNotice = updatedData.absent_without_notice || 0;
            const freeClassConsumed = updatedData.free_class_consumed || 0;
            
            // Class left = total purchased - completed - absent_w_ntc_counted - absent_without_notice - free_class_consumed
            updatedData.class_left = Math.max(0, totalPurchased - completed - absentCounted - absentWithoutNotice - freeClassConsumed);

            // Update in database
            const response = await axios.put(`/api/admin/students/${student.id}`, updatedData);
            const savedStudent = response.data;

            // Update local state if this component is active
            setStudents(prevStudents =>
                prevStudents.map(s => s.id === student.id ? savedStudent : s)
            );

            console.log(`Updated student ${studentName} with ${statusChange}:`, savedStudent);
            toast.success(`Student ${studentName} updated: ${statusChange}`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            return savedStudent;
        } catch (error) {
            console.error(`Error updating student stats for ${studentName}:`, error);
            toast.error(`Error updating student ${studentName}`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            throw error;
        }
    };

    // Helper to get used count for a student and class type
    const getUsedCount = (student, type) => {
        return allClasses.filter(
            cls =>
                cls.student_name === student.name &&
                cls.class_type && cls.class_type.toLowerCase() === type &&
                ["Completed", "Absent w/ntc counted", "FC consumed", "Absent Without Notice"].includes(cls.status)
        ).length;
    };

    // Helper to get all stats for a student from allClasses
    function getStudentStatsFromClasses(student, allClasses) {
        const studentClasses = allClasses.filter(cls => cls.student_name === student.name);
        const completed = studentClasses.filter(cls => cls.status === "Completed").length;
        const absentWntcCounted = studentClasses.filter(cls => cls.status === "Absent w/ntc counted").length;
        const absentWithoutNotice = studentClasses.filter(cls => cls.status === "Absent Without Notice").length;
        const cancelled = studentClasses.filter(cls => cls.status === "Cancelled").length;
        const absentWntcNotCounted = studentClasses.filter(cls => cls.status === "Absent w/ntc-not counted").length;
        const fcConsumed = studentClasses.filter(cls => cls.status === "FC consumed").length;
        
        // Calculate remaining class types after deducting "Absent Without Notice" by class type
        let remainingRegular = student.purchased_class_regular || 0;
        let remainingPremium = student.purchased_class_premium || 0;
        let remainingGroup = student.purchased_class_group || 0;
        
        // Deduct "Absent Without Notice" from respective class types
        const absentWithoutNoticeClasses = studentClasses.filter(cls => cls.status === "Absent Without Notice");
        absentWithoutNoticeClasses.forEach(cls => {
            const classType = cls.class_type?.toLowerCase();
            if (classType === 'regular') {
                remainingRegular = Math.max(0, remainingRegular - 1);
            } else if (classType === 'premium') {
                remainingPremium = Math.max(0, remainingPremium - 1);
            } else if (classType === 'group') {
                remainingGroup = Math.max(0, remainingGroup - 1);
            }
        });
        
        const totalPurchased = remainingRegular + remainingPremium + remainingGroup;
        
        // Free classes: +1 for each Cancelled or Absent w/ntc-not counted, -1 for each FC consumed
        const freeClasses = Math.max(0, cancelled + absentWntcNotCounted - fcConsumed);
        // Class left: total remaining - completed - absentWntcCounted - fcConsumed
        const classLeft = Math.max(0, totalPurchased - completed - absentWntcCounted - fcConsumed);
        // Free class consumed: count of FC consumed
        const freeClassConsumed = fcConsumed;
        return {
            completed,
            absentWntcCounted,
            absentWithoutNotice,
            freeClasses,
            classLeft,
            freeClassConsumed,
            // Return the adjusted class type counts for display
            remainingRegular,
            remainingPremium,
            remainingGroup,
        };
    }

    return (
        <AdminLayout>
            <Head title="Students Management" />
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Responsive Banner */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-navy-800 to-navy-700 p-4 sm:p-6 md:p-8 mb-6 shadow-lg">
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="text-center sm:text-left">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                                            Students Management
                                        </h1>
                                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-navy-100">
                                            Manage your students and their
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <div className="relative w-full sm:w-64">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 h-[42px] border border-gray-200 rounded-lg leading-5 bg-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-sm"
                                    placeholder="Search by name or purchased class..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <button
                            onClick={openAddModal}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                        >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                            Add Student
                        </button>

                        {/* Bulk Delete Button */}
                        {selectedStudents.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="-ml-1 mr-2 h-5 w-5" />
                                {isDeleting ? 'Deleting...' : `Delete ${selectedStudents.length} Selected`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto" style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#f97316 #f1f5f9'
                    }}>
                        <style>{`
                            .overflow-x-auto::-webkit-scrollbar {
                                height: 6px;
                            }
                            .overflow-x-auto::-webkit-scrollbar-track {
                                background: #f1f5f9;
                                border-radius: 3px;
                            }
                            .overflow-x-auto::-webkit-scrollbar-thumb {
                                background: #f97316;
                                border-radius: 3px;
                            }
                            .overflow-x-auto::-webkit-scrollbar-thumb:hover {
                                background: #ea580c;
                            }
                        `}</style>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-navy-900 to-navy-700">
                                <tr>
                                    <th className="px-6 py-3"></th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider text-center" colSpan={3}>Purchased Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Completed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Absent w/ntc counted</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Absent without Notice</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Class Left</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Free Classes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Free Class Consumed</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                                </tr>
                                <tr style={{height: '8px'}}>
                                    <td style={{backgroundColor: '#94a3b8'}}></td>
                                    <td style={{backgroundColor: '#94a3b8'}}></td>
                                    <td style={{backgroundColor: '#94a3b8'}}></td>
                                    <td className="bg-navy-500"></td>
                                    <td className="bg-orange-500"></td>
                                    <td className="bg-[#4A9782]"></td>
                                    <td className="bg-green-400"></td>
                                    <td className="bg-blue-400"></td>
                                    <td className="bg-red-400"></td>
                                    <td style={{backgroundColor: '#94a3b8'}}></td>
                                    <td className="bg-yellow-400"></td>
                                    <td className="bg-pink-400"></td>
                                    <td style={{backgroundColor: '#94a3b8'}}></td>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => {
                                        const stats = getStudentStatsFromClasses(student, allClasses);
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.includes(student.id)}
                                                        onChange={() => handleSelectStudent(student.id)}
                                                        className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="ml-0">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {student.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                ID: {student.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {student.email}
                                                    </div>
                                                </td>
                                                {/* Purchased Class: Regular */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <span className="bg-navy-500 border border-blue-700 text-white px-3 py-1 rounded-md text-center text-sm font-medium">
                                                        {(() => {
                                                            const purchased = student.purchased_class_regular || 0;
                                                            const used = getUsedCount(student, "regular");
                                                            const remaining = Math.max(0, purchased - used);
                                                            return `${remaining}/${purchased}`;
                                                        })()}
                                                    </span>
                                                </td>
                                                {/* Purchased Class: Premium */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <span className="bg-orange-500 border border-orange-600 text-white px-3 py-1 rounded-md text-center text-sm font-medium">
                                                        {(() => {
                                                            const purchased = student.purchased_class_premium || 0;
                                                            const used = getUsedCount(student, "premium");
                                                            const remaining = Math.max(0, purchased - used);
                                                            return `${remaining}/${purchased}`;
                                                        })()}
                                                    </span>
                                                </td>
                                                {/* Purchased Class: Group */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <span className="bg-[#4A9782] border border-[#4A9782] text-white px-3 py-1 rounded-md text-center text-sm font-medium">
                                                        {(() => {
                                                            const purchased = student.purchased_class_group || 0;
                                                            const used = getUsedCount(student, "group");
                                                            const remaining = Math.max(0, purchased - used);
                                                            return `${remaining}/${purchased}`;
                                                        })()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="text-sm text-gray-900 bg-green-400 border border-green-500 text-white px-3 py-1 rounded-md text-center font-medium">
                                                        {stats.completed}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="text-sm text-gray-900 bg-blue-400 border border-blue-500 text-white px-3 py-1 rounded-md text-center font-medium">
                                                        {stats.absentWntcCounted}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="text-sm text-gray-900 bg-red-400 border border-red-500 text-white px-3 py-1 rounded-md text-center font-medium">
                                                        {stats.absentWithoutNotice || 0}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="text-sm text-gray-900">
                                                        {stats.classLeft}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="text-sm text-gray-900 bg-yellow-400 border border-yellow-500 text-white px-3 py-1 rounded-md text-center font-medium">
                                                        {stats.freeClasses}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium      ">
                                                    <div className="text-sm text-gray-900 bg-pink-400 border border-pink-400 text-white px-3 py-1 rounded-md text-center font-medium">
                                                        {stats.freeClassConsumed}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    student
                                                                )
                                                            }
                                                            className="text-navy-600 hover:text-navy-900 transition-colors p-1 rounded-full hover:bg-navy-50"
                                                            title="Edit student"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    student
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                                                            title="Delete student"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="12"
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <BookOpen className="h-12 w-12 mb-2" />
                                                <p className="text-lg font-medium text-gray-500">
                                                    No students found
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Try adjusting your search or
                                                    add a new student.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Student Modal */}
                <AddStudentModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleSubmit}
                    studentForm={studentForm}
                    onInputChange={handleInputChange}
                />

                {/* Update Student Modal */}
                <UpdateStudentModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleUpdateStudent}
                    studentForm={studentForm}
                    onInputChange={handleInputChange}
                    isUpdating={false}
                />

                {/* Delete Confirmation Modal */}
                <Transition show={isDeleteModalOpen}>
                    <div className="fixed inset-0 overflow-y-auto z-50">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <Transition.Child
                                as="div"
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            />

                            <span
                                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                                aria-hidden="true"
                            >
                                &#8203;
                            </span>

                            <Transition.Child
                                as="div"
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <AlertCircle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Delete Student
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Are you sure you want to
                                                    delete{" "}
                                                    {currentStudent?.name}? This
                                                    action cannot be undone.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={handleDeleteStudent}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsDeleteModalOpen(false)
                                        }
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Transition.Child>
                        </div>
                    </div>
                </Transition>

                {/* Toast Container */}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </AdminLayout>
    );
}
