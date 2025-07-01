"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status: propStatus }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });
    
    const [localStatus, setLocalStatus] = useState(propStatus || '');
    const [isMounted, setIsMounted] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        if (propStatus) {
            setLocalStatus(propStatus);
        }
    }, [propStatus]);

    const submit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!data.email.trim()) {
            setFormErrors({ email: 'Email is required' });
            return;
        }

        post(route('password.email'), {
            onSuccess: () => {
                setLocalStatus('We have emailed your password reset link!');
            },
            onError: (errors) => {
                setFormErrors(errors);
            }
        });
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Status & Error Messages */}
                <motion.div
                    className="space-y-4 mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                        opacity: localStatus || formErrors.general ? 1 : 0,
                        height: localStatus || formErrors.general ? 'auto' : 0,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    {localStatus && (
                        <motion.div
                            className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-green-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">
                                        {localStatus}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {formErrors.general && (
                        <motion.div
                            className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-red-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        {formErrors.general}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Forgot Password Form */}
                <motion.div
                    className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Logo and Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            className="flex justify-center mb-6"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <a href="/" className="block">
                                <img 
                                    src="/Logo/SpeedUp.png" 
                                    alt="SpeedUp Tutorial Center Logo" 
                                    className="h-36 w-36 mx-auto"
                                />
                            </a>
                        </motion.div>
                        <motion.h2
                            className="text-3xl font-extrabold text-gray-900 mb-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Forgot Password
                        </motion.h2>
                        <p className="text-gray-600">
                            Enter your email and we'll send you a link to reset your password
                        </p>
                    </div>
                    
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-orange-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`w-full pl-10 pr-4 py-3 border ${
                                        formErrors.email
                                            ? "border-red-300"
                                            : "border-gray-200 hover:border-orange-300"
                                    } rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400`}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    autoFocus={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            {formErrors.email && (
                                <motion.p
                                    className="mt-2 text-sm text-red-600 flex items-center"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                >
                                    <svg
                                        className="h-4 w-4 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {formErrors.email}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-6 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-orange-600 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md"
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            {processing ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Sending reset link...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <span>Send Reset Link</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </div>
                            )}
                        </motion.button>

                        {/* Back to Login */}
                        <motion.div
                            className="text-center mt-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <a
                                href={route('login')}
                                className="inline-flex items-center text-sm text-gray-500 hover:text-orange-500 transition-colors group"
                            >
                                <svg
                                    className="h-4 w-4 mr-1 transform group-hover:-translate-x-1 transition-transform duration-200"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Back to Login
                            </a>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
}
