import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import TeachersLayout from "@/Layouts/TeachersLayout";
import DetailsCalendarModal from "@/Components/Teacher/DetailsCalendarModal";
import Legend from "@/Components/Admin/Legend";
import { 
  ChevronDown, 
  ChevronUp,
  ChevronLeft,
  ChevronRight, 
  Search, 
  Calendar as CalendarIcon,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Zap,
  AlertCircle,
  User,
  Gem,
  Check,
  CheckCircle,
  ZapOff,
  CalendarX
} from 'lucide-react';

export default function TeacherCalendar() {
  // State for calendar and events
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Filter states
  const [filterOpen, setFilterOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Status options matching TeacherClasses.jsx
  const statusOptions = [
    {
      value: 'FC not consumed (RG)',
      label: 'FC not consumed (RG)',
      icon: Zap,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-900',
    },
    {
      value: 'FC consumed (RG)',
      label: 'FC consumed (RG)',
      icon: ZapOff,
      bgColor: 'bg-purple-200',
      textColor: 'text-purple-900',
    },
    {
      value: 'Completed (RG)',
      label: 'Completed (RG)',
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-900',
    },
    {
      value: 'Completed (PRM)',
      label: 'Completed (PRM)',
      icon: CheckCircle,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-900',
    },
    {
      value: 'Absent w/ntc counted (RG)',
      label: 'Absent w/ntc counted (RG)',
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-900',
    },
    {
      value: 'Absent w/o ntc counted (RG)',
      label: 'Absent w/o ntc counted (RG)',
      icon: AlertCircle,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-900',
    },
    {
      value: 'Absent w/ntc-not counted (RG)',
      label: 'Absent w/ntc-not counted (RG)',
      icon: CalendarX,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-900',
    },
    {
      value: 'Cancelled (RG)',
      label: 'Cancelled (RG)',
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-900',
    },
  ]
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  // Helper function to convert date to weekday name
  const getWeekdayFromDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };
  
  // Dummy class data with minimal fields
  const dummyEvents = [
    { 
      id: 1, 
      student_name: 'Aurora Chen',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 5)),
      time: '17:00',
      class_type: 'Regular',
      status: 'FC not consumed (RG)',
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 5, 17, 0)
    },
    { 
      id: 2, 
      student_name: 'Cozy Huang',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 5)),
      time: '17:30',
      class_type: 'Premium',
      status: 'Completed (PRM)',
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 5, 17, 30)
    },
    { 
      id: 3, 
      student_name: 'Nina Su',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 5)),
      time: '18:00',
      class_type: 'Group',
      status: 'Completed (RG)',
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 5, 18, 0)
    },
    { 
      id: 4, 
      student_name: 'Leo Johnson',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6)),
      time: '14:00',
      class_type: 'Regular',
      status: 'Absent w/ntc counted (RG)',
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6, 14, 0)
    },
    { 
      id: 5, 
      student_name: 'Emily Wang',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6)),
      time: '15:30',
      class_type: 'Premium',
      status: 'FC consumed (RG)',
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6, 15, 30)
    },
    { 
      id: 7, 
      student_name: 'Jane Zhang',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6)),
      time: '20:30',
      class_type: 'Regular',
      status: 'Absent w/o ntc counted (RG)',
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6, 20, 30)
    },
    { 
      id: 8, 
      student_name: 'Jane Zhang',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6)),
      time: '21:00', 
      duration: 30,
      class_type: 'Regular',
      status: 'Absent w/ntc-not counted (RG)',
      // Additional properties needed for calendar functionality
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6, 21, 0),
      endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6, 21, 30),
      title: 'Jane Zhang'
    },
    { 
      id: 9, 
      student_name: 'Alice Bu',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6)),
      time: '21:30', 
      duration: 30,
      class_type: 'Regular',
      status: 'Cancelled (RG)',
      // Additional properties needed for calendar functionality
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6, 21, 30),
      endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 6, 22, 0),
      title: 'Alice Bu'
    },
    { 
      id: 10, 
      student_name: 'Matson Chen',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 8)),
      time: '17:00', 
      duration: 30,
      class_type: 'Premium',
      status: 'Completed (PRM)',
      // Additional properties needed for calendar functionality
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 8, 17, 0),
      endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 8, 17, 30),
      title: 'Matson Chen'
    },
    { 
      id: 11, 
      student_name: 'Group English',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 10)),
      time: '18:00', 
      duration: 60,
      class_type: 'Group',
      status: 'FC not consumed (RG)',
      // Additional properties needed for calendar functionality
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 10, 18, 0),
      endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 10, 19, 0),
      title: 'Group English'
    },
    { 
      id: 12, 
      student_name: 'Group Science',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 12)),
      time: '18:30', 
      duration: 60,
      class_type: 'Group',
      status: 'Completed (RG)',
      // Additional properties needed for calendar functionality
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 12, 18, 30),
      endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 12, 19, 30),
      title: 'Group Science'
    },
    { 
      id: 13, 
      student_name: 'Matson Chen',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 14)),
      time: '16:30', 
      duration: 30,
      class_type: 'Premium',
      status: 'Completed (PRM)',
      // Additional properties needed for calendar functionality
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 14, 16, 30),
      endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 14, 17, 0),
      title: 'Matson Chen'
    },
    { 
      id: 14, 
      student_name: 'Amy Li',
      day: getWeekdayFromDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 15)),
      time: '18:00', 
      duration: 30,
      class_type: 'Regular',
      status: 'FC not consumed (RG)',
      // Additional properties needed for calendar functionality
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 15, 18, 0),
      endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 15, 18, 30),
      title: 'Amy Li'
    }
  ];
  
  // Dummy class data generator function
  const generateDummyEvents = () => {
    const events = [];
    const eventTypes = ["lecture", "lab", "workshop", "seminar"];
    const statuses = ["scheduled", "cancelled", "completed"];
    const rooms = ["Room 101", "Computer Lab A", "Science Lab", "Auditorium B"];
    const subjects = ["Mathematics", "Physics", "Computer Science", "Biology", "Chemistry"];
    
    // Generate random events for the current month
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Generate 20-30 random events
    const numEvents = Math.floor(Math.random() * 11) + 20;
    
    for (let i = 0; i < numEvents; i++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
      const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
      
      const eventDate = new Date(year, month, day, hour, minute);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 3) + 1); // 1-3 hours duration
      
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      
      events.push({
        id: `class-${i}`,
        title: `${subject} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type,
        status,
        date: eventDate,
        endDate,
        room,
        students: Math.floor(Math.random() * 30) + 10,
        description: `${subject} ${type} for Grade ${Math.floor(Math.random() * 6) + 7}`,
        notes: `Remember to bring ${type === 'lab' ? 'lab equipment' : type === 'lecture' ? 'textbooks' : 'materials'}`
      });
    }
    
    return events;
  };
  
  // Memoize dummyEvents to prevent unnecessary re-renders
  const memoizedDummyEvents = React.useMemo(() => [...dummyEvents], []);
  
  // Set events on component mount and when memoizedDummyEvents changes
  useEffect(() => {
    setEvents([...memoizedDummyEvents]);
    setSelectedDate(new Date());
  }, [memoizedDummyEvents]);
  
  // Update events when filters change
  useEffect(() => {
    if (searchQuery || statusFilter !== 'all') {
      const filtered = memoizedDummyEvents.filter(event => {
        try {
          // Apply search filter
          if (searchQuery && 
              (!event.student_name || 
               !event.student_name.toLowerCase().includes(searchQuery.toLowerCase()))) {
            return false;
          }
          
          // Apply status filter
          if (statusFilter !== 'all' && event.status !== statusFilter) {
            return false;
          }
          
          return true;
        } catch (error) {
          console.error('Error filtering events:', error);
          return false;
        }
      });
      
      setEvents([...filtered]);
    } else {
      setEvents([...memoizedDummyEvents]);
    }
  }, [searchQuery, statusFilter, memoizedDummyEvents]);

  
  // Generate calendar days with actual events
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    const daysFromPrevMonth = firstDay.getDay()
    
    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date),
        isToday: isSameDay(date, new Date())
      })
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date),
        isToday: isSameDay(date, new Date())
      })
    }
    
    // Add days from next month
    const remainingDays = 42 - days.length // Always show 6 weeks
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date),
        isToday: isSameDay(date, new Date())
      })
    }
    
    return days
  }
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  // Helper function to get events for a specific date
  const getEventsForDate = (date) => {
    if (!events || !Array.isArray(events)) {
      return { items: [], total: 0 };
    }
    
    const filteredEvents = events.filter(event => {
      if (!event || !event.date) return false;
      
      try {
        // Filter by date
        const eventDate = new Date(event.date);
        if (!isSameDay(eventDate, date)) return false;
        
        // Apply search filter if present
        if (searchQuery && event.student_name && 
            !event.student_name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Apply status filter if not 'all'
        if (statusFilter !== 'all' && event.status !== statusFilter) {
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Error processing event:', event, error);
        return false;
      }
    });
    
    // Sort events by time
    filteredEvents.sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return a.time.localeCompare(b.time);
    });
    
    return {
      items: filteredEvents,
      total: filteredEvents.length
    };
  }
  
  const calendarDays = generateCalendarDays()
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Navigation functions
  const goToPreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
  }
  
  // Event handlers
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleNotesChange = () => {
    // No-op since we removed notes functionality
  };

  const handleSaveNotes = () => {
    // No-op since we removed notes functionality
  };

  // Handle event updated
  const handleEventUpdated = (eventId, newStatus) => {
    // In a real app, you would make an API call here to update the event status
    // For now, we'll just update the local state
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return { ...event, status: newStatus }
      }
      return event
    })
    
    setEvents(updatedEvents)
    setShowDetailsModal(false)
    
    // In a real application, we would show a success message
    console.log(`Updated class ${eventId} status to ${newStatus}`);
  }

  // Helper function to get event icon and styling based on class type and status
  const getEventStyles = (classType, status = 'scheduled') => {
    // Class type styling (border color)
    let border = '';
    let typeIcon = null;
    
    switch (classType) {
      case "Premium":
        border = 'border-amber-500';
        typeIcon = <Gem className="h-3 w-3 text-amber-600 mr-1" />;
        break;
      case "Group":
        border = 'border-orange-500';
        typeIcon = <Users className="h-3 w-3 text-orange-600 mr-1" />;
        break;
      case "Regular":
      default:
        border = 'border-navy-500';
        typeIcon = <User className="h-3 w-3 text-navy-600 mr-1" />;
        break;
    }
    
    // Status styling (background color)
    let bg = '';
    let text = '';
    let statusIcon = null;
    
    switch (status) {
      case 'FC not consumed (RG)':
        bg = 'bg-purple-100';
        text = 'text-purple-900';
        statusIcon = <Calendar className="h-3 w-3 text-purple-700 mr-1" />;
        break;
      case 'FC consumed (RG)':
        bg = 'bg-purple-200';
        text = 'text-purple-900';
        statusIcon = <Calendar className="h-3 w-3 text-purple-700 mr-1" />;
        break;
      case 'Completed (RG)':
      case 'completed':
        bg = 'bg-green-100';
        text = 'text-green-900';
        statusIcon = <CheckCircle2 className="h-3 w-3 text-green-700 mr-1" />;
        break;
      case 'Completed (PRM)':
        bg = 'bg-blue-100';
        text = 'text-blue-900';
        statusIcon = <CheckCircle2 className="h-3 w-3 text-blue-700 mr-1" />;
        break;
      case 'Absent w/ntc counted (RG)':
        bg = 'bg-yellow-100';
        text = 'text-yellow-900';
        statusIcon = <AlertCircle className="h-3 w-3 text-yellow-700 mr-1" />;
        break;
      case 'Absent w/o ntc counted (RG)':
        bg = 'bg-amber-100';
        text = 'text-amber-900';
        statusIcon = <AlertCircle className="h-3 w-3 text-amber-700 mr-1" />;
        break;
      case 'Absent w/ntc-not counted (RG)':
        bg = 'bg-orange-100';
        text = 'text-orange-900';
        statusIcon = <AlertCircle className="h-3 w-3 text-orange-700 mr-1" />;
        break;
      case 'Cancelled (RG)':
      case 'cancelled':
        bg = 'bg-red-100';
        text = 'text-red-900';
        statusIcon = <XCircle className="h-3 w-3 text-red-700 mr-1" />;
        break;
      case 'scheduled':
      default:
        bg = 'bg-orange-50';
        text = 'text-orange-800';
        statusIcon = <Calendar className="h-3 w-3 text-orange-600" />;
        break;
    }
    
    return {
      bg,
      text,
      border,
      typeIcon,
      statusIcon
    };
  }
  
  // Helper function to get status information
  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled':
        return { 
          label: 'Scheduled', 
          color: 'bg-orange-50 text-orange-800 border border-orange-100', 
          icon: <Calendar className="h-4 w-4 text-orange-600" /> 
        }
      case 'completed':
        return { 
          label: 'Completed', 
          color: 'bg-green-50 text-green-800 border border-green-100', 
          icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> 
        }
      case 'cancelled':
        return { 
          label: 'Cancelled', 
          color: 'bg-red-50 text-red-800 border border-red-100', 
          icon: <XCircle className="h-4 w-4 text-red-600" /> 
        }
      default:
        return { 
          label: 'Unknown', 
          color: 'bg-navy-50 text-navy-800 border border-navy-100', 
          icon: <AlertCircle className="h-4 w-4 text-navy-500" /> 
        }
    }
  }

  return (
    <TeachersLayout>
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <Legend/>
        {/* Combined Action Bar with Search, Filter, and Navigation */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6 mt-4 sm:mt-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
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
                  onClick={goToPreviousMonth}
                  className="h-full px-3 text-navy-600 hover:text-navy-800 hover:bg-navy-50 transition-colors duration-200 flex items-center"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="px-3 text-sm font-medium text-navy-900 h-full flex items-center">
                  {selectedDate.toLocaleDateString("en-US", { 
                    month: "short", 
                    year: "numeric"
                  })}
                </div>
                
                <button
                  onClick={goToNextMonth}
                  className="h-full px-3 text-navy-600 hover:text-navy-800 hover:bg-navy-50 transition-colors duration-200 flex items-center"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full">
          <div className="flex items-center justify-between p-2 sm:p-3 bg-navy-700">
            <h2 className="text-sm sm:text-base font-semibold text-white">Monthly View</h2>
          </div>

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
            <div className="overflow-x-auto w-full">
              <div className="min-w-[320px] w-full">
                <div className="grid grid-cols-7 border-b border-navy-100 bg-navy-50">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="py-1.5 sm:py-2 text-center text-[10px] xs:text-xs font-medium text-navy-600 uppercase tracking-wider">
                      {window.innerWidth < 400 ? day : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {calendarDays.map((day, index) => {
                    const maxVisibleEvents = window.innerWidth < 640 ? 1 : 3;
                    const hasMoreEvents = day.events.total > maxVisibleEvents;
                    
                    return (
                    <div 
                      key={day.date.toISOString()}
                      className={`min-h-[4rem] sm:min-h-28 p-1 border-r border-b border-navy-100 transition-colors duration-150 ${
                        day.isCurrentMonth ? 'bg-white hover:bg-navy-50' : 'bg-navy-50/30 text-navy-400 hover:bg-navy-50/50'
                      } ${day.isToday ? 'bg-orange-50 border-l-2 border-l-orange-500' : ''}`}
                    >
                      <div className="flex justify-between items-start h-4">
                        <span className={`text-xs font-medium ${
                          day.isToday 
                            ? 'flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-xs' 
                            : 'text-navy-700'
                        }`}>
                          {day.date.getDate()}
                        </span>
                        {day.events.total > 0 && (
                          <span className="text-[9px] bg-orange-100 text-orange-700 font-medium px-1 py-0.5 rounded-full leading-none">
                            {day.events.total}
                          </span>
                        )}
                      </div>

                      {day.events.total > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {day.events.items.slice(0, maxVisibleEvents).map((event, eventIndex) => {
                            // Safely format time from the event's time string
                            let eventTime = new Date(day.date);
                            if (event.time) {
                              const [hours, minutes] = event.time.split(':');
                              eventTime.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0);
                            }
                            
                            return (
                              <div 
                                key={eventIndex}
                                onClick={() => handleEventClick(event)}
                                className={`text-[9px] p-1 rounded cursor-pointer hover:opacity-90 transition-all duration-200 ${
                                  getEventStyles(event.class_type, event.status).bg
                                } border-l-2 ${getEventStyles(event.class_type, event.status).border}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center overflow-hidden">
                                    {getEventStyles(event.class_type, event.status).typeIcon}
                                    <span className={`font-medium truncate max-w-[60px] xs:max-w-[80px] ${getEventStyles(event.class_type, event.status).text}`}>
                                      {event.student_name}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-0.5 text-[8px] text-navy-500">
                                  <span>
                                    {eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className="flex items-center">
                                    <span className="text-[8px] font-medium">
                                      {event.class_type}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {hasMoreEvents && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(day.date);
                              }}
                              className="text-[9px] text-navy-500 hover:text-navy-700 w-full text-left px-1 py-0.5 hover:bg-navy-50 rounded"
                            >
                              +{day.events.total - maxVisibleEvents} more
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Event Details Modal */}
      <DetailsCalendarModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        event={selectedEvent}
        onNotesChange={handleNotesChange}
        onSaveNotes={handleSaveNotes}
      />
      {/* Debug info */}
      <div className="hidden">
        Modal state: {showDetailsModal ? 'open' : 'closed'}, 
        Selected event: {selectedEvent ? JSON.stringify(selectedEvent) : 'none'}
      </div>
    </TeachersLayout>
  )
}
