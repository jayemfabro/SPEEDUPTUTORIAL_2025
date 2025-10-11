import React, { useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import Header from "@/Components/Header";
import Footer from '@/Components/Footer';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    User,
    Tag,
    Share2,
    Facebook,
    Twitter,
    Linkedin,
    Phone,
    Mail,
    ArrowRight,
} from "lucide-react";

export default function Announcement({ announcement }) {
    const { url } = usePage();

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-orange-50">
            <Header />

            {/* Main Content */}
            <main className="container mx-auto px-4 md:px-6 py-12 bg-transparent">
                <div className="mb-6">
                    <Link 
                        href={route('announcements')} 
                        className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to all announcements
                    </Link>
                </div>
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 border-b-4 border-orange-500">
                            {/* Featured Image */}
                            <div className="relative h-72 md:h-[500px] overflow-hidden rounded-t-2xl">
                                <img
                                    src={announcement.image}
                                    alt={announcement.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                                />

                                {/* Top-right badge (absolute) */}
                                <div className="absolute top-4 right-4">
                                    <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
                                        {announcement.badge ?? 'Active'}
                                    </div>
                                </div>

                                {/* Expires overlay - bottom left */}
                                {announcement.expires_at && (
                                    <div className="absolute left-4 bottom-4 bg-black/60 rounded-md px-3 py-2 text-white text-sm flex items-center gap-2">
                                        <span className="inline-flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </span>
                                        <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6 md:p-10">
                                    <h1 className="text-2xl md:text-4xl font-bold text-white max-w-3xl leading-tight drop-shadow-lg">
                                        {announcement.title}
                                    </h1>
                                </div>
                            </div>

                    {/* Content */}
                    <div className="p-6 md:p-10">
                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 mb-8 text-sm border-b border-gray-100 pb-6">
                            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                                <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                                <span className="font-medium">
                                    {announcement.date}
                                </span>
                            </div>
                            {announcement.location && (
                                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                                    <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                                    <span className="font-medium">
                                        {announcement.location}
                                    </span>
                                </div>
                            )}
                            {announcement.author && (
                                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                                    <User className="h-4 w-4 mr-2 text-orange-500" />
                                    <span className="font-medium">
                                        By {announcement.author}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {announcement.tags && announcement.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {announcement.tags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors cursor-pointer"
                                    >
                                        <Tag className="h-3 w-3 mr-1.5" />
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Title (compact) */}
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                            {announcement.title}
                        </h2>

                        {/* Content */}
                        <div className="prose prose-orange prose-lg max-w-none mb-10">
                            {announcement.content.map((paragraph, index) => (
                                <p
                                    key={index}
                                    className="mb-6 text-gray-700 leading-relaxed"
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
