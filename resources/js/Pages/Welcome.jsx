import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import { 
    ArrowUp,
    ArrowRight,
    Mail,
    Phone,
    MapPin,
    Users,
    Rocket,
    Zap,
    Award,
    Calendar,
    Bell,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

export default function LandingPage() {
    const [activeSection, setActiveSection] = React.useState('home');
    const [isVisible, setIsVisible] = React.useState(false);

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
            const sections = ['home', 'announcements', 'about'];
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
                className="py-20 md:py-32 bg-orange-100"
            >
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                        <div className="space-y-8">
                            <div className="space-y-8">
                                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-gray-900 leading-tight">
                                    Speed Up Your
                                    <span className="text-orange-500 block mt-2">
                                        Teaching
                                    </span>
                                </h1>
                                <p className="text-2xl md:text-3xl text-gray-600 max-w-[700px] leading-relaxed">
                                    Powerful admin and teacher tools to manage
                                    students, track progress, create
                                    assignments, and streamline your educational
                                    workflow all in one platform.
                                </p>
                                <div className="pt-4">
                                    <Link
                                        href={route('inquiry')}
                                        className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="relative bg-white rounded-full">
                            <img
                                src="/Logo/SpeedUp.png"
                                alt="Teacher dashboard interface"
                                className="rounded-full shadow-2xl w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-20 bg-white border-t border-orange-200 bg-orange-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center space-y-4 mb-16">
                            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                <Users className="h-4 w-4 mr-2" />
                                <span>About Us</span>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900">
                                Empowering Education Through Technology
                            </h2>
                            <p className="text-xl text-gray-600 max-w-[800px] mx-auto">
                                Speed Up Tutorial Center is dedicated to
                                revolutionizing educational management with
                                innovative tools designed specifically for
                                administrators and teachers.
                            </p>
                        </div>

                        <div className="grid gap-12 lg:grid-cols-2 items-center mb-16">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Our Mission
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We believe that effective education
                                    management should be simple, efficient, and
                                    accessible. Our platform is built to help
                                    tutorial centers, schools, and educational
                                    institutions streamline their operations,
                                    allowing educators to focus on what they do
                                    best - teaching.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    Since our founding, we've been committed to
                                    creating tools that make a real difference
                                    in the daily lives of administrators and
                                    teachers, helping them manage students more
                                    effectively and track progress with ease.
                                </p>
                            </div>
                            <div className="relative bg-orange-100 rounded-xl shadow-lg w-full h-64 flex items-center justify-center p-6">
                                <img
                                    src="/Logo/SpeedUp.png"
                                    alt="Our team working together"
                                    className="h-48 w-auto object-contain"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid gap-12 lg:grid-cols-2 items-center">
                            <div className="relative order-2 lg:order-1 bg-orange-100 rounded-xl shadow-lg w-full h-64 flex items-center justify-center p-6">
                                <img
                                    src="/Logo/SpeedUp.png"
                                    alt="Modern educational technology"
                                    className="h-48 w-auto object-contain"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                            <div className="space-y-6 order-1 lg:order-2">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Our Vision
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We envision a future where educational
                                    administration is seamless and intuitive.
                                    Our comprehensive platform brings together
                                    student management, progress tracking,
                                    scheduling, and communication tools in one
                                    unified system.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
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

            {/* Announcements & Promotions Section */}
            <section id="announcements" className="py-20 bg-gradient-to-b from-white to-orange-50 border-t border-orange-200">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center space-y-4 mb-12">
                        <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            <Bell className="h-4 w-4 mr-2" />
                            <span>Latest Updates</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900">
                            Announcements & Promotions
                        </h2>
                        <p className="text-xl text-gray-600 max-w-[800px] mx-auto">
                            Stay updated with our latest news, events, and special offers
                        </p>
                    </div>

                    {/* Announcement Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Card 1 */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="relative h-60 overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1050&q=80"
                                    alt="Summer learning program"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Featured
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <div className="flex items-center space-x-2 text-white">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm font-medium">June 28, 2025</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Summer Learning Program Registration Open!
                                </h3>
                                <p className="text-gray-600 mb-4 flex-1">
                                    Enroll your child in our intensive summer learning program designed to bridge learning gaps and prepare them for the upcoming school year.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">#summer</span>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">#learning</span>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">#enrollment</span>
                                </div>
                                <Link href="/announcement/1">
                                    <button className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors w-full">
                                        Learn More
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="relative h-60 overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1050&q=80"
                                    alt="Premium math tutoring"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    New
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <div className="flex items-center space-x-2 text-white">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm font-medium">July 15, 2025</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    New Premium Math Tutoring Package
                                </h3>
                                <p className="text-gray-600 mb-4 flex-1">
                                    Introducing our new Premium Math Tutoring Package with specialized instructors for advanced mathematics. Perfect for competitive exams.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">#premium</span>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">#math</span>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">#tutoring</span>
                                </div>
                                <Link href="/announcement/2">
                                    <button className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors w-full">
                                        Learn More
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="relative h-60 overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1050&q=80"
                                    alt="Back to school discount"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Discount
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <div className="flex items-center space-x-2 text-white">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm font-medium">August 5, 2025</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Back to School Special Discount
                                </h3>
                                <p className="text-gray-600 mb-4 flex-1">
                                    Get 20% off on all tutoring packages when you register before September 1st. Prepare your child for academic success with our expert tutors.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">#discount</span>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">#back-to-school</span>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">#special</span>
                                </div>
                                <Link href="/announcement/3">
                                <button className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors w-full">
                                    Learn More
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
