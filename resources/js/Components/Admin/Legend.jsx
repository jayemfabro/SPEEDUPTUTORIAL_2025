import React, { useState } from 'react';
import { User, Gem, Users, Clock, CheckCircle2, AlertTriangle, AlertCircle, XCircle, ChevronUp, ChevronDown, Info } from 'lucide-react';

const Legend = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6 transition-all duration-200 hover:shadow-xl">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-5 py-3.5 flex items-center justify-between bg-gradient-to-r from-navy-50 to-gray-50 hover:from-navy-100 hover:to-gray-100 transition-all duration-200 group"
                aria-expanded={isExpanded}
                aria-controls="legend-content"
            >
                <div className="flex items-center">
                    <div className="p-1.5 bg-navy-100 rounded-lg mr-3 group-hover:bg-navy-200 transition-colors">
                        <Info className="h-4 w-4 text-navy-600" />
                    </div>
                    <span className="text-sm font-semibold text-navy-800">
                        Class Legend
                    </span>
                </div>
                <div className="flex items-center">
                    <span className="text-xs text-navy-500 mr-2 hidden sm:inline">
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
                                    <div className="w-3 h-5 bg-amber-500 rounded-full"></div>
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
                                    <div className="w-3 h-5 bg-orange-500 rounded-full"></div>
                                </div>
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 text-orange-600 mr-2" />
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
                            {/* FC not consumed */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-3.5 h-3.5 bg-purple-100 border border-purple-300 flex-shrink-0"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    FC not consumed
                                </span>
                                <span className="ml-auto">
                                    <Clock className="h-3.5 w-3.5 text-purple-500" />
                                </span>
                            </button>

                            {/* FC consumed */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-3.5 h-3.5 bg-purple-200 border border-purple-400 flex-shrink-0"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    FC consumed
                                </span>
                                <span className="ml-auto">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                                </span>
                            </button>

                            {/* Completed (RG) */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-3.5 h-3.5 bg-green-100 border border-green-300 flex-shrink-0"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Completed (RG)
                                </span>
                                <span className="ml-auto">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                </span>
                            </button>

                            {/* Completed (PRM) */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-3.5 h-3.5 bg-blue-100 border border-blue-300 flex-shrink-0"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Completed (PRM)
                                </span>
                                <span className="ml-auto">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                                </span>
                            </button>

                            {/* Absent w/ntc counted */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-3.5 h-3.5 bg-yellow-100 border border-yellow-300 flex-shrink-0"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Absent w/ntc counted
                                </span>
                                <span className="ml-auto">
                                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
                                </span>
                            </button>

                            {/* Absent w/o ntc counted */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-3.5 h-3.5 bg-amber-100 border border-amber-300 flex-shrink-0"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Absent w/o ntc counted
                                </span>
                                <span className="ml-auto">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                </span>
                            </button>

                            {/* Absent w/ntc-not counted */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-3.5 h-3.5 bg-orange-100 border border-orange-300 flex-shrink-0"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Absent w/ntc-not counted
                                </span>
                                <span className="ml-auto">
                                    <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                                </span>
                            </button>

                            {/* Cancelled */}
                            <button className="flex items-center p-2.5 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 bg-white text-left">
                                <span className="w-3.5 h-3.5 bg-red-100 border border-red-300 flex-shrink-0"></span>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Cancelled
                                </span>
                                <span className="ml-auto">
                                    <XCircle className="h-3.5 w-3.5 text-red-600" />
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
