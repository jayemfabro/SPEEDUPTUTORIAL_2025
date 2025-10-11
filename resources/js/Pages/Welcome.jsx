import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import { 
    ArrowUp,
    ArrowRight,
    Award,
    BarChart2,
    Bell, 
    BookOpen, 
    Calendar, 
    ChevronLeft,
    ChevronRight,
    Clock, 
    FileText, 
    Home, 
    Mail, 
    MapPin,
    MessageSquare, 
    Phone, 
    PieChart, 
    Rocket, 
    Settings, 
    Star, 
    Tag,
    Users, 
    UserCheck, 
    Zap,
    Loader2
} from "lucide-react";

export default function LandingPage() {
    const [activeSection, setActiveSection] = React.useState('home');
    const [isVisible, setIsVisible] = React.useState(false);
    const [promotions, setPromotions] = React.useState([]);
    const [loadingPromotions, setLoadingPromotions] = React.useState(true);
    
    // Fetch promotions from API
    React.useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoadingPromotions(true);
                const response = await axios.get('/api/promotional/active');
                setPromotions(response.data);
            } catch (err) {
                console.error('Error fetching promotions:', err);
            } finally {
                setLoadingPromotions(false);
            }
        };
        
        fetchPromotions();
    }, []);

    // Show/Hide scroll to top button based on scroll position
    React.useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // Handle active section on scroll
    React.useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'announcements', 'about', 'why-choose-us'];
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const offsetTop = element.offsetTop;
                    const offsetHeight = element.offsetHeight;

                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on initial load

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top handler
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div className="min-h-screen bg-white relative">
            {/* Scroll to Top Button */}
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 z-40"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-6 w-6" />
                </button>
            )}
            <Header activeSection={activeSection} />

            {/* Hero Section */}
            <section
                id="home"
                className="min-h-[calc(100vh-5px)] flex items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900 text-white overflow-hidden relative"
            >
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500 rounded-full opacity-10 blur-3xl"></div>
                    <div className="absolute top-1/2 -left-48 w-96 h-96 bg-orange-400 rounded-full opacity-10 blur-3xl"></div>
                    <div className="absolute -bottom-24 right-1/4 w-64 h-64 bg-orange-300 rounded-full opacity-10 blur-3xl"></div>
                </div>
                
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10 py-12">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                        {/* Logo - First on mobile, second on larger screens */}
                        <div className="relative w-1/2 mx-auto lg:w-3/4 order-first lg:order-last mt-12">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full blur-md opacity-20"></div>
                            <div className="relative bg-gradient-to-br from-navy-700 to-navy-800 p-1 rounded-full shadow-lg border border-navy-600">
                                <div className="bg-navy-800 rounded-full overflow-hidden">
                                    <img
                                        src="/Logo/SpeedUp.png"
                                        alt="SpeedUp Logo"
                                        className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Text content - Second on mobile, first on larger screens */}
                        <div className="space-y-6 order-last lg:order-first">
                            <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
                                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
                                    Speed Up
                                    <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent block mt-1">
                                        Tutorial Center
                                    </span>
                                </h1>
                                <p className="text-lg md:text-xl text-gray-200 max-w-[600px] leading-relaxed">
                                    A comprehensive platform for tutorial centers to manage students, track progress, create assignments, and streamline operations all in one place.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <Link
                                        href={route('inquiry')}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-base font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5"
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-20 bg-gradient-to-b from-orange-50 to-orange-100 text-navy-900">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center space-y-6 mb-20">
                            <div className="inline-flex items-center px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-transform duration-300">
                                <Users className="h-5 w-5 mr-2" />
                                <span>About Us</span>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-navy-900">
                                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Empowering Education</span> Through Technology
                            </h2>
                            <p className="text-xl text-navy-700 max-w-[800px] mx-auto">
                                Speed Up Tutorial Center is dedicated to
                                revolutionizing educational management with
                                innovative tools designed specifically for
                                administrators and teachers.
                            </p>
                        </div>

                        <div className="grid gap-12 lg:grid-cols-2 items-center mb-20">
                            <div className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border-l-4 border-orange-500 transform hover:-translate-y-1 transition-transform duration-300">
                                <h3 className="text-2xl font-bold text-navy-900 flex items-center">
                                    <div className="bg-orange-500 p-2 rounded-full mr-3">
                                        <Rocket className="h-6 w-6 text-white" />
                                    </div>
                                    Our Mission
                                </h3>
                                <p className="text-navy-700 leading-relaxed">
                                    We believe that effective education
                                    management should be simple, efficient, and
                                    accessible. Our platform is built to help
                                    tutorial centers, schools, and educational
                                    institutions streamline their operations,
                                    allowing educators to focus on what they do
                                    best - teaching.
                                </p>
                                <p className="text-navy-700 leading-relaxed">
                                    Since our founding, we've been committed to
                                    creating tools that make a real difference
                                    in the daily lives of administrators and
                                    teachers, helping them manage students more
                                    effectively and track progress with ease.
                                </p>
                            </div>
                            <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl overflow-hidden p-1">
                                <div className="bg-white rounded-xl p-6 h-full flex items-center justify-center">
                                    <img
                                        src="/Logo/SpeedUp.png"
                                        alt="Our team working together"
                                        className="h-56 w-auto object-contain transform hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-12 lg:grid-cols-2 items-center">
                            <div className="relative order-2 lg:order-1 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl overflow-hidden p-1">
                                <div className="bg-white rounded-xl p-6 h-full flex items-center justify-center">
                                    <img
                                        src="/Logo/SpeedUp.png"
                                        alt="Modern educational technology"
                                        className="h-56 w-auto object-contain transform hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-6 order-1 lg:order-2 bg-white p-8 rounded-2xl shadow-xl border-r-4 border-orange-500 transform hover:-translate-y-1 transition-transform duration-300">
                                <h3 className="text-2xl font-bold text-navy-900 flex items-center">
                                    <div className="bg-orange-500 p-2 rounded-full mr-3">
                                        <Zap className="h-6 w-6 text-white" />
                                    </div>
                                    Our Vision
                                </h3>
                                <p className="text-navy-700 leading-relaxed">
                                    We envision a future where educational
                                    administration is seamless and intuitive.
                                    Our comprehensive platform brings together
                                    student management, progress tracking,
                                    scheduling, and communication tools in one
                                    unified system.
                                </p>
                                <p className="text-navy-700 leading-relaxed">
                                    By leveraging modern technology and
                                    user-centered design, we're building the
                                    next generation of educational management
                                    solutions that adapt to the unique needs of
                                    every tutorial center and educational
                                    institution.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section id="why-choose-us" className="py-20 bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 text-white relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 via-navy-900/80 to-navy-800/90"></div>
                
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDEwYTFmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMxMTFhMzMiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-10"></div>
                
                {/* Decorative elements */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-navy-900 to-transparent z-10"></div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
                    <div className="text-center space-y-6 mb-20">
                        <div className="inline-flex items-center px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <Award className="h-5 w-5 mr-2" />
                            <span>Why Choose Us</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Why Parents & Students</span> Choose Us
                        </h2>
                        <p className="text-xl text-gray-300 max-w-[800px] mx-auto">
                            We're committed to providing exceptional educational support that makes a real difference in our students' academic journeys.
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2 items-stretch">
                        <div className="space-y-6 bg-gradient-to-br from-navy-800/80 to-navy-900/90 p-8 rounded-2xl shadow-2xl border-l-4 border-orange-500 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-orange-500/10 hover:border-orange-400 backdrop-blur-sm">
                                <div className="flex items-center space-x-6">
                                    <div className="bg-orange-500 p-3 rounded-full">
                                        <Users className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Qualified Tutors</h3>
                                </div>
                                <p className="text-gray-200 leading-relaxed">
                                    Our team of highly qualified, experienced, and passionate educators specialize in their subject areas, ensuring the highest quality instruction for every student.
                                </p>
                            </div>
                            
                            <div className="space-y-6 bg-gradient-to-br from-navy-800/80 to-navy-900/90 p-8 rounded-2xl shadow-2xl border-l-4 border-orange-500 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-orange-500/10 hover:border-orange-400 backdrop-blur-sm">
                                <div className="flex items-center space-x-6">
                                    <div className="bg-orange-500 p-3 rounded-full">
                                        <UserCheck className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Personalized Learning</h3>
                                </div>
                                <p className="text-gray-200 leading-relaxed">
                                    We tailor our teaching methods to match each student's unique learning style and pace, ensuring maximum effectiveness and understanding of the material.
                                </p>
                            </div>

                            <div className="space-y-6 bg-gradient-to-br from-navy-800/80 to-navy-900/90 p-8 rounded-2xl shadow-2xl border-l-4 border-orange-500 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-orange-500/10 hover:border-orange-400 backdrop-blur-sm">
                                <div className="flex items-center space-x-6">
                                    <div className="bg-orange-500 p-3 rounded-full">
                                        <BarChart2 className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Proven Results</h3>
                                </div>
                                <p className="text-gray-200 leading-relaxed">
                                    Our students consistently demonstrate significant improvement in their grades and overall understanding of subjects, thanks to our effective teaching methodologies.
                                </p>
                            </div>

                            <div className="space-y-6 bg-gradient-to-br from-navy-800/80 to-navy-900/90 p-8 rounded-2xl shadow-2xl border-l-4 border-orange-500 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-orange-500/10 hover:border-orange-400 backdrop-blur-sm">
                                <div className="flex items-center space-x-6">
                                    <div className="bg-orange-500 p-3 rounded-full">
                                        <Clock className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Flexible Scheduling</h3>
                                </div>
                                <p className="text-gray-200 leading-relaxed">
                                    We understand busy schedules, which is why we offer flexible class times including weekend and evening sessions to accommodate every student's needs.
                                </p>
                            </div>
                    </div>
                </div>
            </section>

            {/* Announcements & Promotions Section */}
            <section id="announcements" className="py-20 bg-gradient-to-b from-orange-50 to-orange-100 text-navy-900">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center space-y-6 mb-16">
                        <div className="inline-flex items-center px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <Bell className="h-5 w-5 mr-2" />
                            <span>Announcements</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-navy-900">
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Announcements</span> & Promotions
                        </h2>
                        <p className="text-xl text-navy-700 max-w-[800px] mx-auto">
                            Stay updated with our latest news, events, and special offers
                        </p>
                    </div>

                    {/* Announcement Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {loadingPromotions ? (
                            <div className="col-span-3 flex justify-center items-center py-16">
                                <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
                                <span className="ml-4 text-xl text-gray-700">Loading announcements...</span>
                            </div>
                        ) : promotions.length === 0 ? (
                            <div className="col-span-3 bg-gray-50 p-8 rounded-xl text-center">
                                <h3 className="text-2xl font-medium text-gray-700">No active announcements at this time</h3>
                                <p className="mt-2 text-gray-500">Check back soon for new announcements and special offers.</p>
                            </div>
                        ) : (
                            // Display up to 3 promotions
                            promotions.slice(0, 3).map(promo => (
                                <div 
                                    key={promo.id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-xl transition-shadow duration-300 flex flex-col h-full transform hover:-translate-y-2 transition-transform duration-300 border-b-4 border-navy-800"
                                >
                                    <div className="relative h-60 overflow-hidden">
                                        <img 
                                            src={promo.image || `https://placehold.co/600x400?text=${encodeURIComponent(promo.title)}`}
                                            alt={promo.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://placehold.co/600x400?text=${encodeURIComponent(promo.title)}`;
                                            }}
                                        />
                                        <div className="absolute top-4 right-4 bg-navy-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                            {promo.badge || "Featured"}
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent p-4">
                                            <div className="flex items-center space-x-2 text-white">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    {new Date(promo.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-navy-900 mb-3">
                                            {promo.title}
                                        </h3>
                                        <p className="text-gray-600 mb-5 flex-1">
                                            {promo.description && promo.description.length > 150 
                                                ? promo.description.substring(0, 150) + '...' 
                                                : promo.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {/* Generate hashtags based on the title words */}
                                            {promo.title.split(' ')
                                                .filter(word => word.length > 3)
                                                .slice(0, 3)
                                                .map((word, i) => (
                                                    <span key={i} className="px-2 py-1 bg-navy-100 text-navy-800 rounded-full text-xs font-medium">
                                                        #{word.toLowerCase().replace(/[^a-z0-9]/gi, '')}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                        <Link href={route('announcement.show', promo.id)}>
                                            <button className="inline-flex items-center justify-center px-4 py-3 bg-navy-800 hover:bg-navy-700 text-white text-sm font-medium rounded-lg transition-colors w-full shadow-md">
                                                Learn More
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
