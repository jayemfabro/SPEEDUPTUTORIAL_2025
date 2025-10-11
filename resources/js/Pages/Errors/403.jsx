import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ShieldX, Home, ArrowLeft, Mail, BookOpen, Users, Calendar, GraduationCap, Calculator, Clock, Award, Target } from 'lucide-react';

export default function Error403({ role }) {
    return (
        <>
            <Head title="403 - Unauthorized Access" />
            
            <div className="min-h-screen bg-navy-900 flex flex-col items-center pt-6 sm:justify-center sm:pt-0 relative overflow-hidden">
                {/* Background Icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Top Left Icons */}
                    <BookOpen className="absolute top-20 left-10 w-12 h-12 text-orange-300 opacity-20 animate-pulse" />
                    <GraduationCap className="absolute top-32 left-32 w-16 h-16 text-orange-200 opacity-15 transform rotate-12" />
                    <Calculator className="absolute top-48 left-16 w-10 h-10 text-orange-400 opacity-25 transform -rotate-12" />
                    
                    {/* Top Right Icons */}
                    <Users className="absolute top-24 right-12 w-14 h-14 text-orange-300 opacity-20 transform -rotate-6" />
                    <Calendar className="absolute top-44 right-28 w-12 h-12 text-orange-200 opacity-15 animate-pulse" />
                    <Clock className="absolute top-60 right-8 w-10 h-10 text-orange-400 opacity-25 transform rotate-6" />
                    
                    {/* Bottom Left Icons */}
                    <Award className="absolute bottom-40 left-8 w-14 h-14 text-orange-300 opacity-20 transform rotate-12" />
                    <Target className="absolute bottom-20 left-24 w-12 h-12 text-orange-200 opacity-15 transform -rotate-12" />
                    
                    {/* Bottom Right Icons */}
                    <BookOpen className="absolute bottom-32 right-16 w-10 h-10 text-orange-400 opacity-25 transform rotate-45" />
                    <GraduationCap className="absolute bottom-48 right-32 w-12 h-12 text-orange-300 opacity-20 transform -rotate-6" />
                    
                    {/* Center Floating Icons */}
                    <Users className="absolute top-1/3 left-1/4 w-8 h-8 text-orange-200 opacity-10 transform rotate-12" />
                    <Calculator className="absolute top-2/3 right-1/3 w-8 h-8 text-orange-300 opacity-15 transform -rotate-12" />
                    <Calendar className="absolute bottom-1/3 left-1/3 w-8 h-8 text-orange-200 opacity-10 transform rotate-6" />
                    <Clock className="absolute top-1/2 right-1/4 w-8 h-8 text-orange-400 opacity-15 transform -rotate-6" />
                    
                    {/* Additional scattered icons for richness */}
                    <Award className="absolute top-16 left-1/2 w-6 h-6 text-orange-300 opacity-15 transform rotate-45" />
                    <Target className="absolute bottom-16 right-1/2 w-6 h-6 text-orange-200 opacity-10 transform -rotate-45" />
                </div>
              
                {/* Error Card */}
                <div className="w-full overflow-hidden bg-white px-8 py-10 shadow-xl sm:max-w-md sm:rounded-lg text-center relative z-10" style={{ animation: 'shakeCard 1s ease-in-out' }}>
                    {/* Error Icon */}
                    <div className="mb-6">
                        <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center animate-pulse" style={{ animation: 'shake 3s ease-in-out infinite' }}>
                            <svg 
                                className="w-16 h-16 text-orange-600" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                {/* Warning Triangle */}
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 2 L22 20 L2 20 Z"
                                    className="text-orange-500"
                                    style={{
                                        strokeDasharray: '60',
                                        strokeDashoffset: '60',
                                        animation: 'drawTriangle 2s ease-in-out infinite alternate, shakeTriangle 4s ease-in-out infinite'
                                    }}
                                />
                                
                                {/* Warning Triangle Fill */}
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={0} 
                                    d="M12 2 L22 20 L2 20 Z"
                                    fill="currentColor"
                                    className="text-orange-100"
                                    style={{
                                        opacity: '0',
                                        animation: 'fillTriangle 2s ease-in-out 0.5s infinite alternate'
                                    }}
                                />
                                
                                {/* Warning Line */}
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={3} 
                                    d="M12 8v4"
                                    className="text-orange-700"
                                    style={{
                                        strokeDasharray: '8',
                                        strokeDashoffset: '8',
                                        animation: 'drawLine 1.5s ease-in-out 1s infinite alternate, shakeExclamation 2s ease-in-out 3s infinite'
                                    }}
                                />
                                
                                {/* Warning Dot */}
                                <circle 
                                    cx="12" 
                                    cy="16" 
                                    r="1.5" 
                                    fill="currentColor"
                                    className="text-orange-700"
                                    style={{
                                        opacity: '0',
                                        animation: 'showDot 1s ease-in-out 1.5s infinite alternate, shakeExclamation 2s ease-in-out 3s infinite'
                                    }}
                                />
                                
                                {/* Pulsing Glow Ring */}
                                <circle 
                                    cx="12" 
                                    cy="12" 
                                    r="10" 
                                    stroke="currentColor"
                                    strokeWidth={1}
                                    fill="none"
                                    className="text-orange-300"
                                    style={{
                                        opacity: '0',
                                        animation: 'pulseGlow 3s ease-in-out 2s infinite'
                                    }}
                                />
                                
                                {/* Exclamation Mark Alternative */}
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 8v4M12 16h.01"
                                    className="text-orange-600"
                                    style={{
                                        strokeDasharray: '10',
                                        strokeDashoffset: '10',
                                        animation: 'drawExclamation 1.5s ease-in-out 2.5s infinite alternate, shakeExclamation 2s ease-in-out 3s infinite',
                                        opacity: '0.8'
                                    }}
                                />
                            </svg>
                            
                            {/* CSS Animation Styles */}
                            <style jsx>{`
                                @keyframes drawTriangle {
                                    from {
                                        stroke-dashoffset: 60;
                                    }
                                    to {
                                        stroke-dashoffset: 0;
                                    }
                                }
                                
                                @keyframes fillTriangle {
                                    from {
                                        opacity: 0;
                                    }
                                    to {
                                        opacity: 0.3;
                                    }
                                }
                                
                                @keyframes drawLine {
                                    from {
                                        stroke-dashoffset: 8;
                                        opacity: 0;
                                    }
                                    to {
                                        stroke-dashoffset: 0;
                                        opacity: 1;
                                    }
                                }
                                
                                @keyframes showDot {
                                    from {
                                        opacity: 0;
                                        transform: scale(0.5);
                                    }
                                    to {
                                        opacity: 1;
                                        transform: scale(1);
                                    }
                                }
                                
                                @keyframes pulseGlow {
                                    0%, 100% {
                                        opacity: 0;
                                        transform: scale(1);
                                    }
                                    50% {
                                        opacity: 0.4;
                                        transform: scale(1.1);
                                    }
                                }
                                
                                @keyframes drawExclamation {
                                    from {
                                        stroke-dashoffset: 10;
                                        opacity: 0;
                                    }
                                    to {
                                        stroke-dashoffset: 0;
                                        opacity: 0.8;
                                    }
                                }
                                
                                @keyframes pulse-glow {
                                    0%, 100% {
                                        box-shadow: 0 0 10px rgba(255, 165, 0, 0.4);
                                        transform: scale(1);
                                    }
                                    50% {
                                        box-shadow: 0 0 30px rgba(255, 165, 0, 0.8);
                                        transform: scale(1.05);
                                    }
                                }
                                
                                @keyframes shake {
                                    0%, 100% {
                                        transform: translateX(0);
                                    }
                                    10%, 30%, 50%, 70%, 90% {
                                        transform: translateX(-2px);
                                    }
                                    20%, 40%, 60%, 80% {
                                        transform: translateX(2px);
                                    }
                                }
                                
                                @keyframes shakeTriangle {
                                    0%, 100% {
                                        transform: translateX(0) translateY(0);
                                    }
                                    10%, 30%, 50%, 70%, 90% {
                                        transform: translateX(-1px) translateY(-1px);
                                    }
                                    20%, 40%, 60%, 80% {
                                        transform: translateX(1px) translateY(1px);
                                    }
                                }
                                
                                @keyframes shakeExclamation {
                                    0%, 100% {
                                        transform: translateX(0);
                                    }
                                    25% {
                                        transform: translateX(-1px);
                                    }
                                    50% {
                                        transform: translateX(1px);
                                    }
                                    75% {
                                        transform: translateX(-1px);
                                    }
                                }
                                
                                @keyframes shakeCode {
                                    0%, 100% {
                                        transform: translateX(0);
                                    }
                                    20% {
                                        transform: translateX(-3px);
                                    }
                                    40% {
                                        transform: translateX(3px);
                                    }
                                    60% {
                                        transform: translateX(-2px);
                                    }
                                    80% {
                                        transform: translateX(2px);
                                    }
                                }
                                
                                @keyframes shakeCard {
                                    0% {
                                        transform: translateX(0) translateY(0);
                                    }
                                    5% {
                                        transform: translateX(-3px) translateY(-3px);
                                    }
                                    10% {
                                        transform: translateX(3px) translateY(3px);
                                    }
                                    15% {
                                        transform: translateX(-3px) translateY(3px);
                                    }
                                    20% {
                                        transform: translateX(3px) translateY(-3px);
                                    }
                                    25% {
                                        transform: translateX(-2px) translateY(-2px);
                                    }
                                    30% {
                                        transform: translateX(2px) translateY(2px);
                                    }
                                    35% {
                                        transform: translateX(-2px) translateY(2px);
                                    }
                                    40% {
                                        transform: translateX(2px) translateY(-2px);
                                    }
                                    45% {
                                        transform: translateX(-1px) translateY(-1px);
                                    }
                                    50% {
                                        transform: translateX(1px) translateY(1px);
                                    }
                                    55% {
                                        transform: translateX(-1px) translateY(1px);
                                    }
                                    60% {
                                        transform: translateX(1px) translateY(-1px);
                                    }
                                    65% {
                                        transform: translateX(-1px) translateY(-1px);
                                    }
                                    70% {
                                        transform: translateX(1px) translateY(1px);
                                    }
                                    75% {
                                        transform: translateX(-1px) translateY(1px);
                                    }
                                    80% {
                                        transform: translateX(1px) translateY(-1px);
                                    }
                                    85% {
                                        transform: translateX(-1px) translateY(-1px);
                                    }
                                    90% {
                                        transform: translateX(1px) translateY(1px);
                                    }
                                    95% {
                                        transform: translateX(-1px) translateY(1px);
                                    }
                                    100% {
                                        transform: translateX(0) translateY(0);
                                    }
                                }
                            `}</style>
                        </div>
                    </div>

                    {/* Error Code */}
                    <h1 className="text-5xl font-bold text-orange-600 mb-3" style={{ animation: 'shakeCode 4s ease-in-out infinite' }}>403</h1>
                    
                    {/* Error Title */}
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Access Denied</h2>
                    
                    {/* Error Message */}
                    <div className="mb-8">
                        <p className="text-gray-600 mb-2 text-sm">
                            This area is restricted to <span className="font-semibold text-orange-600">{role || 'authorized'}</span> users only.
                        </p>
                        <p className="text-xs text-gray-500">
                            You don't have the necessary permissions to access this page.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
