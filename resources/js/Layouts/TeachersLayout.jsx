import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import ReactDOM from "react-dom";
import NotificationBell from "../Components/NotificationBell";
import {
    LayoutDashboard,
    Users,
    Calendar,
    BookOpen,
    Settings,
    Menu,
    X,
    ChevronDown,
    Bell,
    LogOut,
    User,
    HelpCircle,
    FileText,
    Home,
    Award,
    Zap,
    MessageSquare,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";

const MenuItem = ({ icon: Icon, text, href, active = false, className = '' }) => {
    return (
        <Link
            href={href}
            className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${className} ${
                active
                    ? "text-orange-500 bg-navy-50 shadow-md border-l-4 border-orange-500"
                    : "text-gray-100 hover:bg-navy-700 hover:text-orange-400"
            }`}
            title={text}
        >
            <div className={`flex items-center justify-center w-8 h-8 ${text ? 'mr-3' : 'mx-auto'}`}>
                <Icon className={`h-5 w-5 ${active ? "text-orange-500" : "text-gray-400 group-hover:text-orange-400"}`} />
            </div>
            {text && (
                <>
                    <span className="font-medium whitespace-nowrap">{text}</span>
                    {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    )}
                </>
            )}
        </Link>
    );
};

const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
};

export default function TeachersLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Initialize sidebar state based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        
        // Set initial state
        handleResize();
        
        // Add event listener for window resize
        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <aside
                className={`bg-navy-800 min-h-screen flex flex-col transition-all duration-300 ease-in-out shadow-xl ${
                    isSidebarOpen 
                        ? "translate-x-0 w-72" 
                        : "-translate-x-full w-0"
                } ${
                    isSidebarCollapsed ? "md:translate-x-0 md:w-20" : "md:translate-x-0 md:w-72"
                } md:static absolute z-50 overflow-hidden`}
            >
                {/* Logo */}
                <div className="bg-navy-800 py-4 px-4 md:px-6 border-b border-navy-700">
                    <div className="flex items-center justify-start transition-all duration-300">
                        <img 
                            src="/Logo/SpeedUp.png" 
                            alt="SpeedUp Tutorial Center Logo" 
                            className="h-10 w-10 md:h-12 md:w-12 object-contain transition-all duration-300"
                        />
                        <div className={`ml-3 flex flex-col transition-all duration-300 ${
                            isSidebarCollapsed ? 'opacity-0 w-0 h-0 overflow-hidden' : 'opacity-100 w-auto h-auto'
                        }`}>
                            <span className="text-xl font-bold text-orange-400 leading-none whitespace-nowrap">
                                SpeedUp
                            </span>
                            <span className="text-xs text-gray-300 font-medium whitespace-nowrap">
                                Tutorial Center
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-6 right-4 text-gray-300 hover:text-orange-400 focus:outline-none md:hidden bg-navy-700 rounded-full p-1 transition-all duration-200"
                >
                    <X className="h-5 w-5" />
                </button>
                <nav className={`flex-1 px-3 md:px-4 py-8 space-y-6 overflow-y-auto relative z-10 transition-all duration-300 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-navy-700 [&::-webkit-scrollbar-thumb]:bg-navy-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-orange-500 ${
                    isSidebarCollapsed ? 'px-2' : 'px-4'
                }`}>
                    <div>
                        <MenuItem
                            icon={LayoutDashboard}
                            text={isSidebarCollapsed ? '' : "Dashboard"}
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                            className={isSidebarCollapsed ? 'justify-center' : ''}
                        />
                        <MenuItem
                            icon={Calendar}
                            text={isSidebarCollapsed ? '' : "Calendar"}
                            href={route('teacher.calendar')}
                            active={route().current('teacher.calendar')}
                            className={isSidebarCollapsed ? 'justify-center' : ''}
                        />
                        <MenuItem
                            icon={Calendar}
                            text={isSidebarCollapsed ? '' : "Daily Calendar"}
                            href={route('teacher.daily-calendar')}
                            active={route().current('teacher.daily-calendar')}
                            className={isSidebarCollapsed ? 'justify-center' : ''}
                        />
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header */}
                <header className="bg-navy-700 shadow-lg py-5 px-8 flex items-center justify-between relative overflow-hidden border-b border-navy-600">
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-300 hover:text-orange-400 focus:outline-none md:hidden p-2 rounded-lg transition-all duration-200 relative z-10"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    
                    <div className="hidden md:flex items-center relative z-10">
                    <button
                        onClick={toggleSidebarCollapse}
                        className="text-gray-300 hover:text-orange-400 focus:outline-none p-2 rounded-lg transition-all duration-200 mr-2"
                        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="text-orange-400 font-bold text-lg">Teacher Portal</span>
                </div>

                    {/* User info */}
                    <div className="relative ml-4 flex items-center space-x-4">
                        <NotificationBell />
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2 focus:outline-none group"
                        >
                                                        {user.profile_photo_url ? (
                                <img
                                    src={user.profile_photo_url}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full object-cover border-2 border-blue-400 hover:border-blue-500 transition-colors shadow-md"
                                    onError={(e) => {
                                        console.error('Image failed to load:', e.target.src);
                                        setImageError(true);
                                    }}
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-navy-600 flex items-center justify-center group-hover:bg-navy-500 transition-colors border-2 border-blue-400 shadow-md">
                                    <span className="text-sm font-medium text-blue-400">
                                        {getInitials(user.name)}
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col items-start space-y-0">
                                <span className="text-sm font-semibold text-gray-100">
                                    {user.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                    Teacher
                                </span>
                            </div>
                            <ChevronDown
                                className={`h-4 w-4 text-gray-400 group-hover:text-orange-400 transition-transform ${
                                    isDropdownOpen ? "transform rotate-180" : ""
                                }`}
                            />
                        </button>

                        {/* Dropdown Menu - Using React Portal to render outside the DOM hierarchy */}
                        {isDropdownOpen && ReactDOM.createPortal(
                            <>
                                {/* Backdrop overlay */}
                                <div 
                                    onClick={() => setIsDropdownOpen(false)}
                                    style={{
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        zIndex: 9998
                                    }}
                                />
                                
                                {/* Dropdown content */}
                                <div 
                                    style={{
                                        position: 'fixed',
                                        top: '80px',
                                        right: '20px',
                                        width: '14rem',
                                        zIndex: 9999,
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                                    }}
                                    className="py-2 bg-navy-800 rounded-lg border border-navy-600"
                                >
                                    <div className="px-4 py-3 border-b border-navy-700">
                                        {user.profile_photo_url ? (
                                            <img
                                                src={user.profile_photo_url}
                                                alt={user.name}
                                                className="h-16 w-16 rounded-full object-cover border-2 border-blue-400 mx-auto mb-2 shadow-md"
                                                onError={(e) => {
                                                    console.error('Image failed to load:', e.target.src);
                                                    setImageError(true);
                                                }}
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-full bg-navy-700 flex items-center justify-center mx-auto mb-2 border-2 border-blue-400 shadow-md">
                                                <span className="text-lg font-medium text-blue-400">
                                                    {getInitials(user.name)}
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-sm font-semibold text-gray-100 text-center">{user.name}</p>
                                        <p className="text-xs text-gray-400 text-center mt-1">{user.email}</p>
                                    </div>
                                    
                                    <div className="py-1">
                                        <Link
                                            href="/profile"
                                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-navy-700 hover:text-orange-400"
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            Profile
                                        </Link>
                                    </div>
                                    
                                    <div className="border-t border-navy-700 py-1">
                                        <button
                                            onClick={() => router.post(route('logout'))}
                                            className="flex w-full items-center px-4 py-2 text-sm text-orange-400 hover:bg-navy-700 hover:text-orange-500"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </>,
                            document.body
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 relative">                    
                    {/* Background Design Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-navy-800 rounded-full opacity-5 -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500 rounded-full opacity-5 -ml-40 -mb-40"></div>
                        
                        {/* Floating Icons */}
                        <div className="absolute top-20 right-10">
                            <BookOpen className="h-16 w-16 text-navy-200" />
                        </div>
                        <div className="absolute bottom-20 left-10">
                            <Calendar className="h-16 w-16 text-navy-200" />
                        </div>
                        <div className="absolute top-1/2 right-1/4">
                            <Award className="h-12 w-12 text-orange-200" />
                        </div>
                        <div className="absolute bottom-1/3 left-1/3">
                            <Users className="h-14 w-14 text-navy-200" />
                        </div>
                        <div className="absolute top-1/3 left-1/4">
                            <Zap className="h-10 w-10 text-orange-200" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">{children}</div>
                </main>
            </div>
        </div>
    );
}