import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const Header = ({ activeSection = '' }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-6">
            <header 
                className={`${scrolled ? 'bg-navy-800 shadow-lg border-2 border-orange-600' : 'bg-transparent shadow-none border-0'}
                           rounded-full py-2 px-6 md:px-8 
                           transition-all duration-300 ease-in-out 
                           ${scrolled ? 'w-[95%] md:w-[90%]' : 'w-[98%] md:w-[95%]'}`}
            >
                <div className="flex items-center justify-between">
                    <div className="hidden md:flex md:items-center md:space-x-3">
                        <Link href="/" className="flex items-center">
                            <div className={`${scrolled ? 'bg-orange-500' : 'bg-orange-500/80'} rounded-full transition-colors duration-300 shadow-md`}>
                                <img
                                    src="/Logo/SpeedUp.png"
                                    className="h-8 w-8"
                                    alt="Speed Up Tutorial Center Logo"
                                />
                            </div>
                            <span 
                                className="ml-3 text-lg font-bold text-white transition-colors duration-300"
                            >
                                Speed Up Tutorial Center
                            </span>
                        </Link>
                    </div>

                    <nav className="flex items-center space-x-6 mx-auto md:mx-0 md:space-x-8">
                        <Link
                            href="/#home"
                            className={`group relative text-sm font-medium transition-colors 
                                      ${activeSection === 'home' 
                                        ? 'text-orange-400' 
                                        : 'text-white hover:text-orange-300'}`}
                        >
                            Home
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 
                                           ${activeSection === 'home' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </Link>
                        <Link
                            href="/#about"
                            className={`group relative text-sm font-medium transition-colors 
                                      ${activeSection === 'about' 
                                        ? 'text-orange-400' 
                                        : 'text-white hover:text-orange-300'}`}
                        >
                            About Us
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 
                                           ${activeSection === 'about' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </Link>
                        <Link
                            href="/#why-choose-us"
                            className={`group relative text-sm font-medium transition-colors 
                                      ${activeSection === 'why-choose-us' 
                                        ? 'text-orange-400' 
                                        : 'text-white hover:text-orange-300'}`}
                        >
                            Why Choose Us
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 
                                           ${activeSection === 'why-choose-us' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </Link>
                        <Link
                            href={route('announcements')}
                            className={`group relative text-sm font-medium transition-colors 
                                      ${activeSection === 'announcements' 
                                        ? 'text-orange-400' 
                                        : 'text-white hover:text-orange-300'}`}
                        >
                            Announcements
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 
                                           ${activeSection === 'announcements' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </Link>
                    </nav>
                </div>
            </header>
        </div>
    );
};

export default Header;