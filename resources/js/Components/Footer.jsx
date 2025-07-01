import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    Facebook, 
    Twitter, 
    Linkedin, 
    MapPin, 
    Phone, 
    Mail, 
    Send, 
    Lock, 
    BookOpen, 
    Shield 
} from 'lucide-react';

const Footer = () => {
    return (
        <footer id="contact" className="bg-navy-700 text-white">
            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <img
                                src="/Logo/SpeedUp.png"
                                alt="Speed Up Tutorial Center Logo"
                                className="h-10 w-10 rounded-full"
                                onError={(e) => {
                                    e.target.onerror = null;
                                }}
                            />
                            <span className="text-xl font-bold text-white">
                                Speed Up Tutorial Center
                            </span>
                        </div>
                        <p className="text-navy-200">
                            Empowering educators with comprehensive
                            management tools for tutorial centers.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-navy-200 hover:text-orange-400 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-6 w-6" />
                            </a>
                            <a
                                href="#"
                                className="text-navy-200 hover:text-orange-400 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-6 w-6" />
                            </a>
                            <a
                                href="#"
                                className="text-navy-200 hover:text-orange-400 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Quick Links</h4>
                        <div className="space-y-2">
                            <Link
                                href="/#home"
                                className="block text-navy-200 hover:text-orange-400 transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/#about"
                                className="block text-navy-200 hover:text-orange-400 transition-colors"
                            >
                                About Us
                            </Link>
                            <Link
                                href="/login"
                                className="block text-navy-200 hover:text-orange-400 transition-colors"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Contact Us</h4>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-orange-400" />
                                <span className="text-navy-200">
                                    123 Education St., Learning City, 1010
                                </span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="h-5 w-5 mr-2 flex-shrink-0 text-orange-400" />
                                <span className="text-navy-200">
                                    (555) 123-ADMIN
                                </span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="h-5 w-5 mr-2 flex-shrink-0 text-orange-400" />
                                <span className="text-navy-200">
                                    support@speeduptutorial.com
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-navy-600 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-navy-300 text-sm">
                        &copy; {new Date().getFullYear()} Speed Up Tutorial Center. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link
                            href="/privacy-policy"
                            className="text-navy-300 hover:text-orange-400 text-sm flex items-center transition-colors"
                        >
                            <Lock className="h-4 w-4 mr-1" />
                            <span>Privacy Policy</span>
                        </Link>
                        <Link
                            href="/terms"
                            className="text-navy-300 hover:text-orange-400 text-sm flex items-center transition-colors"
                        >
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>Terms of Service</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;