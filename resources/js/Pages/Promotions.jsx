import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import axios from 'axios';
import { Calendar, Bell, Tag, ArrowRight, Loader2 } from 'lucide-react';

export default function Announcements() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/promotional/active');
                setPromotions(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching promotions:', err);
                setError('Failed to load promotions. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Head title="Announcements - Speed Up Tutorial Center" />
            
            <Header activeSection="announcements" />

            {/* Main Content */}
            <main className="w-full bg-orange-50 min-h-screen py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-medium shadow-lg mb-4">
                            <Bell className="h-5 w-5 mr-2" />
                            <span>Announcements</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Latest</span> Updates
                        </h1>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                            Stay updated with our latest announcements, events, and special offers from Speed Up Tutorial Center.
                        </p>
                    </div>

                    {/* Announcements Content */}
                    <div className="mt-8">
                        {loading ? (
                            <div className="flex justify-center items-center py-16">
                                <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
                                <span className="ml-4 text-xl text-gray-700">Loading announcements...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
                                <p className="text-red-700">{error}</p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : promotions.length === 0 ? (
                            <div className="bg-gray-50 p-8 rounded-xl text-center">
                                <h3 className="text-2xl font-medium text-gray-700">No active announcements at this time</h3>
                                <p className="mt-2 text-gray-500">Check back soon for new announcements and special offers.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {promotions.map(promo => (
                                    <div 
                                        key={promo.id} 
                                        className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full transform hover:-translate-y-2 transition-transform duration-300 border-b-4 border-orange-500"
                                    >
                                        {promo.image && (
                                            <div className="relative h-60 overflow-hidden">
                                                <img 
                                                    src={promo.image} 
                                                    alt={promo.title} 
                                                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                                    }}
                                                />
                                                <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                    {promo.badge || "Active"}
                                                </div>
                                                {promo.expires_at && (
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-4">
                                                        <div className="flex items-center space-x-2 text-white">
                                                            <Calendar className="h-4 w-4" />
                                                            <span className="text-sm font-medium">
                                                                Expires: {new Date(promo.expires_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                {promo.title}
                                            </h3>
                                            <div className="prose prose-sm prose-orange mb-5 flex-1 text-gray-600">
                                                <p>{promo.description}</p>
                                            </div>
                                            
                                            {/* Add tags if you have them in your data */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center">
                                                    <Tag className="h-3 w-3 mr-1" />
                                                    Announcement
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link 
                                                    href={route('announcement.show', promo.id)}
                                                    className="inline-flex items-center justify-center px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors w-full shadow-md"
                                                >
                                                    Learn More
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                                <a 
                                                    href={`mailto:contact@speeduptutorial.com?subject=Inquiry about: ${promo.title}`} 
                                                    className="inline-flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors w-full shadow-md"
                                                >
                                                    Contact Us
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}