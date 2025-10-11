import React from "react";
import { Link } from "@inertiajs/react";
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    MapPin,
    Phone,
    Mail,
    Send,
    Lock,
    BookOpen,
    Shield,
    ExternalLink,
} from "lucide-react";

const Footer = () => {
    return (
        <footer id="contact" className="bg-navy-800 text-white relative w-full">
            {/* Top wave decoration */}
            <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-12 text-navy-50">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
                    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
                    <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
                </svg>
            </div>
            
            <div className="container mx-auto px-6 pt-16 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
                    {/* Logo and Social Links */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white p-2 rounded-full shadow-md">
                                <img
                                    src="/Logo/SpeedUp.png"
                                    alt="Speed Up Tutorial Center Logo"
                                    className="h-12 w-12 rounded-full"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder-logo.png";
                                    }}
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                Speed Up Tutorial
                            </h2>
                        </div>
                        <p className="text-navy-200 leading-relaxed">
                            Empowering educators with comprehensive management
                            tools for tutorial centers and educational institutions.
                        </p>
                        <div className="flex space-x-5 pt-2">
                            <a
                                href="https://www.facebook.com/SpeedUpEnglishOnlineTutors"
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-300"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-6 w-6" />
                            </a>
                           
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:ml-8">
                        <h3 className="text-white font-bold text-xl mb-6 pb-2 border-b border-orange-500 inline-block">
                            Quick Links
                        </h3>
                        <ul className="space-y-4">
                            
                            <li>
                                <Link
                                    href="/#about"
                                    className="text-gray-300 hover:text-orange-400 transition-colors flex items-center group"
                                >
                                    <Shield className="h-4 w-4 mr-3 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#announcements"
                                    className="text-gray-300 hover:text-orange-400 transition-colors flex items-center group"
                                >
                                    <ExternalLink className="h-4 w-4 mr-3 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
                                    Announcements
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#contact"
                                    className="text-gray-300 hover:text-orange-400 transition-colors flex items-center group"
                                >
                                    <Phone className="h-4 w-4 mr-3 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold text-xl mb-6 pb-2 border-b border-orange-500 inline-block">
                            Contact Us
                        </h3>
                        <ul className="space-y-5">
                        
                            <li className="flex items-start">
                                <Mail className="h-5 w-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
                                <a
                                    href="mailto:speedupenglishonlinetutors@gmail.com"
                                    className="text-navy-200 hover:text-orange-400 transition-colors duration-300 break-all"
                                >
                                    speedupenglishonlinetutors@gmail.com
                                </a>
                            </li>
                           
                        </ul>
                    </div>

                    {/* QR Code Section */}
                    <div>
                        <h3 className="text-white font-bold text-xl mb-6 pb-2 border-b border-orange-500 inline-block">
                            Scan to Connect
                        </h3>
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                                <img
                                    src="/images/qrcode.jpg"
                                    alt="QR Code"
                                    className="h-32 w-32 rounded-lg"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentNode.innerHTML = '<div class="flex items-center justify-center h-32 w-32 bg-navy-100 rounded-lg"><p class="text-navy-500 text-sm text-center">QR Code<br/>Coming Soon</p></div>';
                                    }}
                                />
                            </div>
                            <p className="text-navy-300 text-sm mt-3 text-center">
                                Scan to visit our<br/>mobile app
                            </p>
                        </div>
                    </div>
                </div>
            
                {/* Copyright and Legal */}
                <div className="border-t border-orange-500 mt-10 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-navy-300 text-center md:text-left">
                            &copy; {new Date().getFullYear()} Speed Up Tutorial
                            Center. All rights reserved.
                        </p>
                    
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
