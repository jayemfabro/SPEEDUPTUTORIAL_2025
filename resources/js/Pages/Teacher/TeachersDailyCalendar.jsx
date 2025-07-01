import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import TeachersLayout from '@/Layouts/TeachersLayout';
import Legend from '@/Components/Admin/Legend';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  User,
  Users,
  Search,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Gem,
  Check,
  X,
  ZapOff,
  CalendarX,
  CheckCircle,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';

export default function TeachersDailyCalendar() {
  const { auth } = usePage().props;
  
  // State for current week and filters
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Status options for filter dropdown
  const statusOptions = [
    { value: 'FC not consumed (RG)', label: 'FC not consumed (RG)', icon: Zap, bgColor: 'bg-purple-100', textColor: 'text-purple-900' },
    { value: 'FC consumed (RG)', label: 'FC consumed (RG)', icon: ZapOff, bgColor: 'bg-purple-200', textColor: 'text-purple-900' },
    { value: 'Completed (RG)', label: 'Completed (RG)', icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-900' },
    { value: 'Completed (PRM)', label: 'Completed (PRM)', icon: CheckCircle, bgColor: 'bg-blue-100', textColor: 'text-blue-900' },
    { value: 'Absent w/ntc counted (RG)', label: 'Absent w/ntc counted (RG)', icon: AlertCircleIcon, bgColor: 'bg-yellow-100', textColor: 'text-yellow-900' },
    { value: 'Absent w/o ntc counted (RG)', label: 'Absent w/o ntc counted (RG)', icon: XCircle, bgColor: 'bg-amber-100', textColor: 'text-amber-900' },
    { value: 'Absent w/ntc-not counted (RG)', label: 'Absent w/ntc-not counted (RG)', icon: CalendarX, bgColor: 'bg-orange-100', textColor: 'text-orange-900' },
    { value: 'Cancelled (RG)', label: 'Cancelled (RG)', icon: X, bgColor: 'bg-red-100', textColor: 'text-red-900' }
  ];
  
  // Sample class data - would be fetched from API in a real app
  const [classes, setClasses] = useState([
    { 
      id: 1, 
      student_name: 'Aurora', 
      day: 'Monday', 
      time: '17:00', 
      duration: 30,
      class_type: 'Regular',
      status: 'FC not consumed (RG)'
    },
    { 
      id: 2, 
      student_name: 'Cozy Huang', 
      day: 'Monday', 
      time: '17:30', 
      duration: 30,
      class_type: 'Regular',
      status: 'FC consumed (RG)'
    },
    { 
      id: 3, 
      student_name: 'Cozy Huang', 
      day: 'Monday', 
      time: '18:00', 
      duration: 30,
      class_type: 'Regular',
      status: 'Completed (RG)'
    },
    { 
      id: 4, 
      student_name: 'Nina Su', 
      day: 'Monday', 
      time: '18:30', 
      duration: 30,
      class_type: 'Premium',
      status: 'Completed (PRM)'
    },
    { 
      id: 5, 
      student_name: 'Leo J', 
      day: 'Monday', 
      time: '19:30', 
      duration: 30,
      class_type: 'Regular',
      status: 'Absent w/ntc counted (RG)'
    },
    { 
      id: 6, 
      student_name: 'Eddie', 
      day: 'Monday', 
      time: '20:00', 
      duration: 30,
      class_type: 'Premium',
      status: 'Completed (PRM)'
    },
    { 
      id: 7, 
      student_name: 'Jane Zhang', 
      day: 'Monday', 
      time: '20:30', 
      duration: 30,
      class_type: 'Regular',
      status: 'Absent w/o ntc counted (RG)'
    },
    { 
      id: 8, 
      student_name: 'Jane Zhang', 
      day: 'Monday', 
      time: '21:00', 
      duration: 30,
      class_type: 'Regular',
      status: 'Absent w/ntc-not counted (RG)'
    },
    { 
      id: 9, 
      student_name: 'Alice Bu', 
      day: 'Monday', 
      time: '21:30', 
      duration: 30,
      class_type: 'Regular',
      status: 'Cancelled (RG)'
    },
    // Tuesday classes
    { 
      id: 10, 
      student_name: 'Matson Chen', 
      day: 'Tuesday', 
      time: '17:00', 
      duration: 30,
      class_type: 'Premium',
      status: 'Completed (PRM)'
    },
    { 
      id: 11, 
      student_name: 'Amy Li', 
      day: 'Tuesday', 
      time: '18:00', 
      duration: 30,
      class_type: 'Regular',
      status: 'FC not consumed (RG)'
    },
    { 
      id: 12, 
      student_name: 'Eric Z', 
      day: 'Tuesday', 
      time: '18:30', 
      duration: 30,
      class_type: 'Premium',
      status: 'Completed (PRM)'
    },
    // Add more sample classes for other days...
    { 
      id: 13, 
      student_name: 'Matson Chen', 
      day: 'Wednesday', 
      time: '16:30', 
      duration: 30,
      class_type: 'Premium',
      status: 'Completed (PRM)'
    },
    { 
      id: 14, 
      student_name: 'Jeffery', 
      day: 'Friday', 
      time: '17:30', 
      duration: 30,
      class_type: 'Regular',
      status: 'FC consumed (RG)'
    },
    { 
      id: 15, 
      student_name: 'John', 
      day: 'Friday', 
      time: '20:00', 
      duration: 30,
      class_type: 'Regular',
      status: 'Completed (RG)'
    },
    { 
      id: 16, 
      student_name: 'Group: English Conversation', 
      day: 'Wednesday', 
      time: '19:00', 
      duration: 60,
      class_type: 'Group',
      status: 'Completed (RG)'
    },
    { 
      id: 17, 
      student_name: 'Group: Business English', 
      day: 'Thursday', 
      time: '18:00', 
      duration: 60,
      class_type: 'Group',
      status: 'FC consumed (RG)'
    },
  ]);

  // Get days of the current week
  const getDaysOfWeek = () => {
    const days = [];
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day + 1); // Start from Monday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // Generate time slots from 8:00 AM to 10:00 PM in 30-minute increments (12-hour format)
  const getTimeSlots = () => {
    const timeSlots = [];
    for (let hour = 8; hour <= 22; hour++) {
      for (let minute of ['00', '30']) {
        if (hour === 22 && minute === '30') break; // Skip 10:30 PM
        
        // Convert to 12-hour format
        const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM/PM
        const ampm = hour >= 12 ? 'PM' : 'AM';
        timeSlots.push({
          time24: `${hour.toString().padStart(2, '0')}:${minute}`,
          display: `${displayHour}:${minute} ${ampm}`
        });
      }
    }
    return timeSlots;
  };

  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const getClassesForSlot = (day, time24) => {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day.getDay()];
    return classes.filter(cls => cls.day === dayName && cls.time === time24);
  };

  const formatDate = (date) => {
    return `${date.getMonth() + 1}.${date.getDate()}`;
  };
  
  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const getChineseDayName = (date) => {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[date.getDay()];
  };

  const daysOfWeek = getDaysOfWeek();
  const timeSlots = getTimeSlots();

  // Filter classes based on search query and status filter
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = searchQuery 
      ? cls.student_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesStatus = statusFilter !== 'all' 
      ? cls.status === statusFilter
      : true;
      
    return matchesSearch && matchesStatus;
  });

  return (
    <TeachersLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Daily Calendar</h2>}
    >
      <Head title="Daily Calendar" />

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <Legend/>
        {/* Combined Action Bar with Search, Filter, and Navigation */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6 mt-4 sm:mt-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-xs lg:flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500">
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-navy-700 placeholder-navy-500/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all duration-200"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative w-full sm:w-64">
              <button
                type="button"
                onClick={() => setDropdownOpen(dropdownOpen === 'status' ? null : 'status')}
                onBlur={() => setTimeout(() => setDropdownOpen(null), 200)}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen === 'status'}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-between h-[42px] ${
                  dropdownOpen === 'status'
                    ? 'bg-orange-50 border border-orange-200 text-navy-700'
                    : 'bg-white border border-gray-300 text-navy-700 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <div className="flex items-center">
                  {statusFilter !== 'all' ? (
                    <>
                      {(() => {
                        const selectedStatus = statusOptions.find(s => s.value === statusFilter);
                        if (selectedStatus) {
                          const Icon = selectedStatus.icon;
                          return (
                            <>
                              <span className={`mr-2 ${selectedStatus.bgColor} ${selectedStatus.textColor} rounded-full p-1`}>
                                <Icon className="h-4 w-4" />
                              </span>
                              <span>{selectedStatus.label}</span>
                            </>
                          );
                        }
                        return (
                          <span className="capitalize">{statusFilter}</span>
                        );
                      })()}
                    </>
                  ) : (
                    <span className="text-gray-500">All Statuses</span>
                  )}
                </div>
                {dropdownOpen === 'status' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {dropdownOpen === 'status' && (
                <div className="absolute z-[60] mt-1 w-full min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-visible">
                  <div className="max-h-60 overflow-y-auto">
                    <div className="p-2 space-y-1">
                      <button
                        key="all-statuses"
                        type="button"
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                          statusFilter === 'all' 
                            ? 'bg-navy-600 text-white' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setStatusFilter('all');
                          setDropdownOpen(false);
                        }}
                      >
                        <span className="mr-2">
                          <span className="h-4 w-4 opacity-0"></span>
                        </span>
                        All Statuses
                        {statusFilter === 'all' && (
                          <Check className="h-4 w-4 text-white ml-auto" />
                        )}
                      </button>
                      
                      {statusOptions.map((status) => {
                        const isSelected = statusFilter === status.value;
                        return (
                          <button
                            key={status.value}
                            type="button"
                            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                              isSelected 
                                ? 'bg-navy-600 text-white' 
                                : `${status.bgColor} ${status.textColor} hover:bg-opacity-80`
                            }`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setStatusFilter(status.value);
                              setDropdownOpen(false);
                            }}
                          >
                            <span className={`mr-2 ${isSelected ? 'bg-white bg-opacity-20' : ''} rounded-full p-1`}>
                              {React.createElement(status.icon, {
                                className: `h-4 w-4 ${isSelected ? 'text-white' : status.textColor}`
                              })}
                            </span>
                            {status.label}
                            {isSelected && (
                              <Check className="h-4 w-4 ml-auto text-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center space-x-2 h-[42px]">
              <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-navy-100 h-full">
                <button
                  onClick={goToPreviousWeek}
                  className="h-full px-3 text-navy-600 hover:text-navy-800 hover:bg-navy-50 transition-colors duration-200 flex items-center"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="px-3 text-sm font-medium text-navy-900 h-full flex items-center">
                  {currentWeek.toLocaleDateString("en-US", { 
                    month: "short", 
                    year: "numeric"
                  })}
                </div>
                
                <button
                  onClick={goToNextWeek}
                  className="h-full px-3 text-navy-600 hover:text-navy-800 hover:bg-navy-50 transition-colors duration-200 flex items-center"
                  aria-label="Next week"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="inline-block h-7 sm:h-8 w-7 sm:w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Loading classes...</p>
            </div>
          ) : error ? (
            <div className="p-6 sm:p-8 text-center">
              <AlertCircle className="h-7 sm:h-8 w-7 sm:w-8 text-red-500 mx-auto" />
              <p className="mt-2 text-sm sm:text-base text-gray-600">{error}</p>
              <button 
                className="mt-4 px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:shadow-md transition-all duration-200"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto w-full bg-white rounded-lg shadow">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-navy-700 text-white border-b border-navy-800">
                    <th colSpan="8" className="p-3 text-center">
                      <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-bold text-sm">Weekly Class Schedule</span>
                      </div>
                    </th>
                  </tr>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="border-r border-gray-200 p-3 w-28 text-xs font-semibold text-navy-700 bg-white">Time</th>
                    {daysOfWeek.map((day, index) => (
                      <th key={index} className="border-r border-gray-200 p-2 last:border-r-0 bg-white">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-xs text-navy-500">{getDayName(day)}</span>
                            <span className="text-xs text-navy-700">{formatDate(day)}</span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {/* Time slots */}
                  {timeSlots.map((time, timeIndex) => (
                    <tr key={timeIndex} className="bg-white hover:bg-gray-50" style={{transition: 'all 0.2s'}}>
                      <td className="border-r border-b border-navy-100 p-2 w-28 text-center font-medium text-xs text-navy-700">
                        <div className="flex items-center justify-center">
                          <Clock className="h-3 w-3 mr-1 text-navy-400" />
                          <span>{time.display}</span>
                        </div>
                      </td>
                      {daysOfWeek.map((day, dayIndex) => {
                        const classesInSlot = getClassesForSlot(day, time.time24);
                        const hasClass = classesInSlot.length > 0;
                        const filteredClassesInSlot = classesInSlot.filter(cls => {
                          if (searchQuery) {
                            return cls.student_name.toLowerCase().includes(searchQuery.toLowerCase());
                          }
                          return true;
                        });
                        
                        return (
                          <td 
                            key={dayIndex} 
                            className={`border-r border-b border-navy-100 p-1 last:border-r-0 ${hasClass ? '' : 'bg-white'}`}
                          >
                            {filteredClassesInSlot.map(cls => (
                              <div 
                                key={cls.id}
                                className={`p-1.5 rounded-md text-xs shadow-sm mb-1 last:mb-0 ${
                                  // Border color based on class type
                                  cls.class_type === 'Premium' 
                                    ? 'border-l-4 border-amber-500 ' 
                                    : cls.class_type === 'Group'
                                      ? 'border-l-4 border-orange-500 '
                                      : 'border-l-4 border-navy-500 '
                                }${
                                  // Background color based on status
                                  cls.status === 'FC not consumed (RG)' ? 'bg-purple-100 text-purple-900' :
                                  cls.status === 'FC consumed (RG)' ? 'bg-purple-200 text-purple-900' :
                                  cls.status === 'Completed (RG)' ? 'bg-green-100 text-green-900' :
                                  cls.status === 'Completed (PRM)' ? 'bg-blue-100 text-blue-900' :
                                  cls.status === 'Absent w/ntc counted (RG)' ? 'bg-yellow-100 text-yellow-900' :
                                  cls.status === 'Absent w/o ntc counted (RG)' ? 'bg-amber-100 text-amber-900' :
                                  cls.status === 'Absent w/ntc-not counted (RG)' ? 'bg-orange-100 text-orange-900' :
                                  cls.status === 'Cancelled (RG)' ? 'bg-red-100 text-red-900' :
                                  'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <div className="flex items-center">
                                  {cls.class_type === 'Premium' ? 
                                    <Gem className="h-3 w-3 text-amber-600 mr-1" /> : 
                                    cls.class_type === 'Group' ?
                                    <Users className="h-3 w-3 text-orange-600 mr-1" /> :
                                    <User className="h-3 w-3 text-navy-600 mr-1" />}
                                  <span className="font-medium">{cls.student_name}</span>
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeachersLayout>
  );
}
