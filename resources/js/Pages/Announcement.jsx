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
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Featured Image */}
                    <div className="relative h-72 md:h-[500px] overflow-hidden">
                        <img
                            src={announcement.image}
                            alt={announcement.title}
                            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 flex flex-col justify-between p-6 md:p-10">
                            <div className="self-end">
                                <div className="inline-block bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                                    {announcement.badge}
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white max-w-3xl leading-tight drop-shadow-lg">
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

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            {announcement.title}
                        </h1>

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

                        {/* Contact/Register Section */}
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-8 mb-10 shadow-sm border border-orange-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="bg-orange-500 p-2 rounded-lg text-white mr-3">
                                    <User className="h-5 w-5" />
                                </span>
                                {announcement.callToAction.title}
                            </h3>
                            <p className="text-gray-700 mb-6 pl-12">
                                {announcement.callToAction.description}
                            </p>
                            <div className="flex flex-wrap gap-4 pl-12">
                                <Link
                                    href={route("register")}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                                >
                                    {announcement.callToAction.buttonText}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                                <Link
                                    href="/#contact"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-white border border-orange-300 hover:bg-orange-50 text-orange-600 font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>

                        {/* Share */}
                        <div className="flex items-center justify-end border-t border-gray-100 pt-6">
                            <span className="text-sm font-medium text-gray-700 mr-4">
                                Share this announcement:
                            </span>
                            <div className="flex space-x-3">
                                <button className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors text-white">
                                    <Facebook className="h-4 w-4" />
                                </button>
                                <button className="p-2 bg-blue-400 hover:bg-blue-500 rounded-full transition-colors text-white">
                                    <Twitter className="h-4 w-4" />
                                </button>
                                <button className="p-2 bg-blue-700 hover:bg-blue-800 rounded-full transition-colors text-white">
                                    <Linkedin className="h-4 w-4" />
                                </button>
                                <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
                                    <Share2 className="h-4 w-4 text-gray-700" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
