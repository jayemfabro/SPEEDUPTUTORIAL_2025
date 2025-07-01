import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    MessageSquare,
    Send,
    Facebook,
    Twitter,
    Linkedin,
    ArrowRight,
} from "lucide-react";


export default function Inquiry() {
    return (
        <>
            <Head title="Get Started - Speed Up Tutorial Center" />
            
            <Header />

            {/* Main Content */}
            <main className="w-full bg-orange-100 text-gray-800 py-12">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get Started with Speed Up</h1>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                            Fill out the form below to inquire about our services or schedule a demo. Our team will get back to you within 24 hours.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Contact Information */}
                        <div className="md:col-span-1 bg-navy-700 text-white rounded-2xl p-8 shadow-xl">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                                    <p className="text-navy-200 mb-6">
                                        Have questions? Reach out to us directly or fill out the form.
                                    </p>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <Phone className="h-6 w-6 mr-4 text-orange-400 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium mb-1">Phone</h4>
                                            <p className="text-navy-200">(555) 123-ADMIN</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <Mail className="h-6 w-6 mr-4 text-orange-400 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium mb-1">Email</h4>
                                            <p className="text-navy-200">support@speeduptutorial.com</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <MapPin className="h-6 w-6 mr-4 text-orange-400 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium mb-1">Address</h4>
                                            <p className="text-navy-200">
                                                123 Education Ave<br />
                                                Learning City, LC 12345
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-6 border-t border-navy-600">
                                    <h4 className="font-medium mb-4">Connect with us</h4>
                                    <div className="flex space-x-4">
                                        <a href="#" className="bg-navy-600 hover:bg-navy-500 p-2 rounded-full transition-colors">
                                            <Facebook className="h-5 w-5" />
                                        </a>
                                        <a href="#" className="bg-navy-600 hover:bg-navy-500 p-2 rounded-full transition-colors">
                                            <Twitter className="h-5 w-5" />
                                        </a>
                                        <a href="#" className="bg-navy-600 hover:bg-navy-500 p-2 rounded-full transition-colors">
                                            <Linkedin className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Inquiry Form */}
                        <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
                            
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <select
                                        id="subject"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="demo">Request a Demo</option>
                                        <option value="pricing">Pricing Information</option>
                                        <option value="support">Technical Support</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        rows="5"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="consent"
                                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="consent" className="ml-2 block text-sm text-gray-700">
                                        I agree to the <a href="#" className="text-orange-600 hover:text-orange-700">Privacy Policy</a> and consent to being contacted.
                                    </label>
                                </div>
                                
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                                >
                                    Send Message
                                    <Send className="ml-2 h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
