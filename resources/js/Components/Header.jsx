import React from 'react';
import { Link } from '@inertiajs/react';

const Header = ({ activeSection = '' }) => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-orange-200 bg-white/95 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center space-x-3">
                    <Link href="/">
                        <img
                            src="/Logo/SpeedUp.png"
                            className="h-10 w-10"
                            alt="Speed Up Tutorial Center Logo"
                        />
                    </Link>
                    <Link 
                        href="/" 
                        className="text-xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                        Speed Up Tutorial Center
                    </Link>
                </div>

                <nav className="hidden md:flex items-center space-x-8">
                    <Link
                        href="/home"
                        className={`group relative text-sm font-medium transition-colors ${activeSection === 'home' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'}`}
                    >
                        Home
                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${activeSection === 'home' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </Link>
                    <Link
                        href="/about"
                        className={`group relative text-sm font-medium transition-colors ${activeSection === 'about' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'}`}
                    >
                        About Us
                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${activeSection === 'about' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </Link>
                    <Link
                        href="/announcements"
                        className={`group relative text-sm font-medium transition-colors ${activeSection === 'announcements' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'}`}
                    >
                        Announcements
                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${activeSection === 'announcements' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;