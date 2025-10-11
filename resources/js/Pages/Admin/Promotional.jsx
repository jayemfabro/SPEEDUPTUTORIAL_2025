import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/Layouts/AdminLayout";
import AddPromotionalModal from "@/Components/Admin/AddPromotionalModal";
import UpdatePromotional from "@/Components/Admin/UpdatePromtional";
import axios from "axios";
import { 
  PlusCircle, 
  Calendar, 
  Edit, 
  Trash2, 
  Search,
} from "lucide-react";


// All icons are now imported from lucide-react

const Button = ({
    children,
    onClick,
    className = "",
    type = "button",
    disabled = false,
    variant = "default",
    size = "default",
}) => {
    const baseStyles =
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline:
            "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        destructive:
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
    };

    const sizes = {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${
                variants[variant] || variants.default
            } ${sizes[size] || sizes.default} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default function Promotional({ auth, posts: initialPosts = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [updateImagePreview, setUpdateImagePreview] = useState(null);
    const [posts, setPosts] = useState(initialPosts);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        image: null,
        status: "draft",
        expires_at: "",
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('status', data.status);
            formData.append('expires_at', data.expires_at || "");
            
            if (data.image) {
                formData.append('image', data.image);
            }

            const response = await axios.post('/api/admin/promotional', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.status === 201) {
                setPosts([response.data.post, ...posts]);
                setIsModalOpen(false);
                reset();
                setImagePreview(null);
                
                // Show success notification (you can implement this)
                console.log(response.data.message);
            }
        } catch (error) {
            console.error('Error creating promotional post:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                // Show detailed validation errors
                if (error.response.data.errors) {
                    const errorMessages = Object.values(error.response.data.errors).flat();
                    console.error('Validation errors:', errorMessages);
                } else {
                    console.error('Error message:', error.response.data.message || 'Unknown error');
                }
            } else {
                console.error('Network error:', error.message);
            }
        }
    };

    const deletePost = async (id) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await axios.delete(`/api/admin/promotional/${id}`);
                setPosts(posts.filter((post) => post.id !== id));
                console.log('Post deleted successfully');
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const toggleStatus = async (id) => {
        try {
            const response = await axios.patch(`/api/admin/promotional/${id}/toggle-status`);
            setPosts(
                posts.map((post) =>
                    post.id === id ? response.data.post : post
                )
            );
            console.log(response.data.message);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleUpdate = async (updatedData) => {
        try {
            const formData = new FormData();
            formData.append('title', updatedData.title);
            formData.append('description', updatedData.description);
            formData.append('status', updatedData.status);
            formData.append('expires_at', updatedData.expires_at || "");
            
            if (updatedData.image && updatedData.image instanceof File) {
                formData.append('image', updatedData.image);
            }

            const response = await axios.post(`/api/admin/promotional/${selectedPost.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-HTTP-Method-Override': 'PUT'
                },
            });

            setPosts(
                posts.map((post) =>
                    post.id === selectedPost.id ? response.data.post : post
                )
            );
            setIsUpdateModalOpen(false);
            setUpdateImagePreview(null);
            console.log(response.data.message);
        } catch (error) {
            console.error('Error updating promotional post:', error);
        }
    };

    const openUpdateModal = (post) => {
        setSelectedPost(post);
        setUpdateImagePreview(null);
        setIsUpdateModalOpen(true);
    };

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.description.toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesStatus = 
            !statusFilter || 
            post.status.toLowerCase() === statusFilter.toLowerCase();
            
        return matchesSearch && matchesStatus;
    });

    const openModal = () => {
        reset();
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setImagePreview(null);
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Promotional Posts" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Responsive Banner */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-navy-800 to-navy-700 p-4 sm:p-6 md:p-8 mb-6 shadow-lg">
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="text-center sm:text-left">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                                            Promotional Posts
                                        </h1>
                                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-navy-100">
                                            Manage your promotional posts and their
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
                                    placeholder="Search by title or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="relative w-full sm:w-64">
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(dropdownOpen === 'status' ? null : 'status')}
                                    onBlur={() => setTimeout(() => setDropdownOpen(null), 200)}
                                    aria-haspopup="listbox"
                                    aria-expanded={dropdownOpen === 'status'}
                                    className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-between h-[42px] ${
                                        dropdownOpen === 'status'
                                            ? 'bg-orange-50 border border-orange-200 text-navy-700'
                                            : 'bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {statusFilter ? (
                                            <>
                                                <span className={`mr-2 ${
                                                    statusFilter === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : statusFilter === 'draft' 
                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                } rounded-full p-1`}>
                                                    {statusFilter === 'active' 
                                                        ? 'Active' 
                                                        : statusFilter === 'draft' 
                                                            ? 'Draft' 
                                                            : 'All Statuses'}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-gray-500">
                                                All Statuses
                                            </span>
                                        )}
                                    </div>
                                    {dropdownOpen === 'status' ? (
                                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>

                                {dropdownOpen === 'status' && (
                                    <div className="absolute z-50 mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                                        <div className="max-h-60 overflow-y-auto">
                                            <div className="p-2 space-y-1">
                                                <button
                                                    key="all-statuses"
                                                    type="button"
                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                        !statusFilter
                                                            ? 'bg-navy-600 text-white'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                    onClick={() => {
                                                        setStatusFilter('');
                                                        setDropdownOpen(null);
                                                    }}
                                                >
                                                    All Statuses
                                                </button>
                                                <button
                                                    key="active"
                                                    type="button"
                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                        statusFilter === 'active'
                                                            ? 'bg-navy-600 text-white'
                                                            : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                                    onClick={() => {
                                                        setStatusFilter('active');
                                                        setDropdownOpen(null);
                                                    }}
                                                >
                                                    <span className="mr-2 bg-green-100 text-green-800 rounded-full p-1">
                                                        Active
                                                    </span>
                                                </button>
                                                <button
                                                    key="draft"
                                                    type="button"
                                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                                                        statusFilter === 'draft'
                                                            ? 'bg-navy-600 text-white'
                                                            : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                                    onClick={() => {
                                                        setStatusFilter('draft');
                                                        setDropdownOpen(null);
                                                    }}
                                                >
                                                    <span className="mr-2 bg-yellow-100 text-yellow-800 rounded-full p-1">
                                                        Draft
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={openModal}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                        >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                            Add Promo
                        </button>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    <AnimatePresence>
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 flex flex-col h-full group"
                            >
                                <div className="relative h-48 bg-gradient-to-r from-navy-700 to-navy-900">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <div className="text-white">
                                            <h3 className="text-xl font-bold mb-1">
                                                {post.title}
                                            </h3>
                                            <p className="text-navy-100 text-sm line-clamp-2">
                                                {post.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                                                post.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {post.status === "active"
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-navy-900">
                                            {post.title}
                                        </h3>
                                    </div>
                                    <p className="text-navy-600 mb-4 line-clamp-3 flex-grow">
                                        {post.description}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-navy-100">
                                        <div className="flex items-center text-sm text-navy-500">
                                            <Calendar className="h-4 w-4 mr-2 text-navy-400" />
                                            <span>
                                                Expires:{" "}
                                                <span className="font-medium">
                                                    {post.expires_at ? format(
                                                        new Date(post.expires_at),
                                                        "MMM d, yyyy"
                                                    ) : 'No expiry date'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-navy-50 flex justify-between items-center border-t border-navy-100">
                                    <button
                                        onClick={() => toggleStatus(post.id)}
                                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                            post.status === "active"
                                                ? "bg-navy-100 text-navy-700 hover:bg-navy-200 hover:text-navy-800"
                                                : "bg-navy-600 text-white hover:bg-navy-700"
                                        }`}
                                    >
                                        {post.status === "active"
                                            ? "Deactivate"
                                            : "Activate"}
                                    </button>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => openUpdateModal(post)}
                                            className="text-navy-600 hover:text-navy-900 transition-colors p-1 rounded-full hover:bg-navy-50"
                                            title="Edit post"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deletePost(post.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                                            title="Delete post"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="col-span-full text-center py-20 px-6 bg-white rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-navy-50 mb-4">
                                    <Calendar className="h-4 w-4 text-navy-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No promotional posts found</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    {searchQuery || statusFilter 
                                        ? "We couldn't find any posts matching your criteria. Try adjusting your search or filters."
                                        : "You haven't created any promotional posts yet. Create your first post to get started!"
                                    }
                                </p>
                                <button
                                    onClick={openModal}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Create Your First Post
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Add/Edit Post Modal */}
            <AddPromotionalModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                data={data}
                setData={setData}
                processing={processing}
                errors={errors}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                handleImageChange={handleImageChange}
            />

            {/* Update Post Modal */}
            <UpdatePromotional
                isOpen={isUpdateModalOpen}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setUpdateImagePreview(null);
                }}
                onSubmit={handleUpdate}
                post={selectedPost}
                processing={processing}
                errors={errors}
                imagePreview={updateImagePreview}
                setImagePreview={setUpdateImagePreview}
                handleImageChange={handleImageChange}
            />
        </AdminLayout>
    );
}
