import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import AddStudentModal from "@/Components/Admin/AddStudentModal";
import UpdateStudentModal from "@/Components/Admin/UpdateStudentModal";
import { Transition } from "@headlessui/react";
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
    const [notification, setNotification] = useState(null);
    const [currentStudent, setCurrentStudent] = useState(null);

    // Mock data for students
    const [students, setStudents] = useState([
        {
            id: 1,
            name: "Alex Johnson",
            email: "alex.johnson@example.com",
            phone: "+1 (555) 123-4567",
            grade: "10th Grade",
            courses: ["Mathematics", "Physics"],
            status: "Active",
            image: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        {
            id: 2,
            name: "Maria Garcia",
            email: "maria.garcia@example.com",
            phone: "+1 (555) 987-6543",
            grade: "11th Grade",
            courses: ["English", "History"],
            status: "Active",
            image: "https://randomuser.me/api/portraits/women/44.jpg",
        },
        {
            id: 3,
            name: "James Wilson",
            email: "james.wilson@example.com",
            phone: "+1 (555) 456-7890",
            grade: "9th Grade",
            courses: ["Biology", "Chemistry"],
            status: "Inactive",
            image: "https://randomuser.me/api/portraits/men/22.jpg",
        },
    ]);

    // Form state for student data
    const [studentForm, setStudentForm] = useState({
        name: "",
        email: "",
        phone: "",
        grade: "",
        courses: [],
        status: "Active",
        image: "",
    });

    // Show notification
    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    // Handle input change for the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStudentForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission for adding a student
    const handleSubmit = (e) => {
        e.preventDefault();
        const newStudent = {
            ...studentForm,
            id: Math.max(0, ...students.map((s) => s.id)) + 1,
            courses: studentForm.courses
                .split(",")
                .map((course) => course.trim())
                .filter(Boolean),
        };

        setStudents([...students, newStudent]);
        setIsAddModalOpen(false);
        showNotification("Student added successfully!");
    };

    // Handle student update
    const handleUpdateStudent = (e) => {
        e.preventDefault();
        setStudents((prev) =>
            prev.map((student) =>
                student.id === currentStudent.id
                    ? {
                          ...studentForm,
                          id: currentStudent.id,
                          courses:
                              typeof studentForm.courses === "string"
                                  ? studentForm.courses
                                        .split(",")
                                        .map((course) => course.trim())
                                        .filter(Boolean)
                                  : studentForm.courses,
                      }
                    : student
            )
        );
        setIsEditModalOpen(false);
        showNotification("Student updated successfully!");
    };

    // Handle opening edit modal
    const openEditModal = (student) => {
        setCurrentStudent(student);
        setStudentForm({
            ...student,
            courses: Array.isArray(student.courses)
                ? student.courses.join(", ")
                : student.courses || "",
        });
        setIsEditModalOpen(true);
    };

    // Handle student deletion
    const handleDeleteStudent = () => {
        setStudents((prev) =>
            prev.filter((student) => student.id !== currentStudent.id)
        );
        setIsDeleteModalOpen(false);
        showNotification("Student removed successfully!", "warning");
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
            phone: "",
            grade: "",
            courses: "",
            status: "Active",
            image: "",
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
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.courses.some((course) =>
                course.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    return (
        <AdminLayout>
            <Head title="Students Management" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                                    placeholder="Search by name, grade, or course..."
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
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-navy-900 to-navy-700">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Student
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Contact
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Grade
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Courses
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border-2 border-orange-400">
                                                        <img
                                                            src={student.image}
                                                            alt={student.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror =
                                                                    null;
                                                                e.target.src =
                                                                    "https://via.placeholder.com/150?text=Student";
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
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
                                                <div className="text-xs text-gray-500">
                                                    {student.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {student.grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {student.courses.map(
                                                        (course, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                            >
                                                                {course}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        student.status ===
                                                        "Active"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {student.status}
                                                </span>
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
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
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
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            </Transition.Child>

                            <span
                                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                                aria-hidden="true"
                            >
                                &#8203;
                            </span>

                            <Transition.Child
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

                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.3 }}
                            className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-xl ${
                                notification.type === "success"
                                    ? "bg-green-500"
                                    : "bg-yellow-500"
                            } text-white max-w-sm z-50`}
                        >
                            <div className="flex items-center space-x-3">
                                {notification.type === "success" ? (
                                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                )}
                                <p className="font-medium">
                                    {notification.message}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}
