import React, { useState } from 'react';
import { User, Gem, Users, Clock, CheckCircle2, AlertTriangle, AlertCircle, XCircle, ChevronUp, ChevronDown, Info } from 'lucide-react';

const Legend = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6 transition-all duration-200 hover:shadow-xl">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-5 py-3.5 flex items-center justify-between bg-gradient-to-r from-navy-800 to-navy-700 hover:from-navy-700 hover:to-navy-600 transition-all duration-200 group"
                aria-expanded={isExpanded}
                aria-controls="legend-content"
            >
                <div className="flex items-center">
                    <div className="p-1.5 bg-navy-100 rounded-lg mr-3 group-hover:bg-navy-200 transition-colors">
                        <Info className="h-4 w-4 text-navy-600" />
                    </div>
                    <span className="text-sm font-semibold text-white">
                        Class Legend
                    </span>
                </div>
                <div className="flex items-center">
                    <span className="text-xs text-white mr-2 hidden sm:inline">
                        {isExpanded}
                    </span>
                    <div className="p-1 bg-white rounded-lg shadow-sm border border-gray-200 group-hover:border-navy-300 transition-colors">
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-navy-600" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-navy-600" />
                        )}
                    </div>
                </div>
            </button>

            <div
                id="legend-content"
                className={`transition-all duration-300 ${
                    isExpanded
                        ? "max-h-[500px] opacity-100 overflow-y-auto custom-scrollbar"
                        : "max-h-0 opacity-0 overflow-hidden"
                }`}
                aria-hidden={!isExpanded}
            >
                <div className="p-5 pt-3 space-y-6">
                    {/* Class Types */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-navy-600 uppercase tracking-wider flex items-center">
                            <span className="w-1.5 h-1.5 bg-navy-400 rounded-full mr-2"></span>
                            Class Types
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Regular Class */}
                            <div className="flex items-start p-3 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white">
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-3 h-5 bg-navy-500 rounded-full"></div>
                                </div>
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 text-navy-600 mr-2" />
                                        <span className="text-sm font-semibold text-gray-800">
                                            Regular
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Standard one-on-one class
                                    </p>
                                </div>
                            </div>

                            {/* Premium Class */}
                            <div className="flex items-start p-3 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white">
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-3 h-5 bg-orange-400 rounded-full"></div>
                                </div>
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        <Gem className="h-4 w-4 text-amber-600 mr-2" />
                                        <span className="text-sm font-semibold text-gray-800">
                                            Premium
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Premium one-on-one class
                                    </p>
                                </div>
                            </div>

                            {/* Group Class */}
                            <div className="flex items-start p-3 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white">
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-3 h-5 bg-[#4A9782] rounded-full"></div>
                                </div>
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 text-[#4A9782] mr-2" />
                                        <span className="text-sm font-semibold text-gray-800">
                                            Group
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Group class with multiple students
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Class Status */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-navy-600 uppercase tracking-wider flex items-center">
                                <span className="w-1.5 h-1.5 bg-navy-400 rounded-full mr-2"></span>
                                Class Status
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Valid for Cancellation */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-6 h-6 bg-gray-200 border border-gray-300 flex-shrink-0 rounded-md"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Valid for Cancellation
                                </span>
                            </button>

                            {/* FC consumed */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-6 h-6 bg-yellow-400 border border-yellow-500 flex-shrink-0 rounded-md"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    FC not consumed
                                </span>
                            </button>

                            {/* Completed (RG) */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-6 h-6 bg-green-400 border border-green-500 flex-shrink-0 rounded-md"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Completed
                                </span>
                            </button>

                            {/* Absent w/ntc counted */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-6 h-6 bg-blue-400 border border-blue-500 flex-shrink-0 rounded-md"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Absent w/ntc counted
                                </span>
                            </button>

                            {/* Cancelled */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-6 h-6 bg-purple-400 border border-purple-500 flex-shrink-0 rounded-md"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Cancelled
                                </span>
                            </button>

                            {/* Absent w/ntc-not counted */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-6 h-6 bg-gray-600 border border-gray-500 flex-shrink-0 rounded-md"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Absent w/ntc-not counted
                                </span>
                            </button>

                            {/* FC consumed */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-6 h-6 bg-pink-400 border border-pink-400 flex-shrink-0 rounded-md"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    FC consumed
                                </span>
                            </button>

                            {/* Absent Without Notice */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-6 h-6 bg-red-400 border border-red-500 flex-shrink-0 rounded-md"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Absent Without Notice
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Legend;
