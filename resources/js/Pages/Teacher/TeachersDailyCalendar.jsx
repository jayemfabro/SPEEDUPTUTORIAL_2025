import React, { Fragment, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import './teacher-calendar.css';
import { Head, usePage } from '@inertiajs/react';
import TeachersLayout from '@/Layouts/TeachersLayout';
import DetailsCalendarModal from '@/Components/Teacher/DetailsCalendarModal';
import MoreClassesModal from '@/Components/Teacher/MoreClassesModal';
import Legend from '@/Components/Admin/Legend';
import axios from 'axios';
import refreshEventManager from '@/utils/refreshEvents';
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
  CheckCircle2,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TeachersDailyCalendar() {
  const { auth } = usePage().props;
  
  // State for current week and filters
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for real-time updates - only use renderKey now for forced refreshes
  const [renderKey, setRenderKey] = useState(0);
  
  // Refs for tracking refresh events
  const lastRefreshTimeRef = useRef(0);
  const refreshTimeoutRef = useRef(null);

  // Modal states for event details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // State for MoreClassesModal
  const [showMoreClassesModal, setShowMoreClassesModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDayDate, setSelectedDayDate] = useState(null);

  // Status options matching AdminCalendar.jsx
  const statuses = [
    "Valid for cancellation",
    "FC not consumed",
    "Completed", 
    "Absent w/ntc counted",
            "Cancelled",
    "Absent w/ntc-not counted",
    "FC consumed",
  ];
   // State for classes data
  const [classes, setClasses] = useState([]);
  
  // Fetch classes from API
  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate start and end of current week (Monday to Sunday)
      const startOfWeek = new Date(currentWeek);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      const params = new URLSearchParams();
      params.append('start_date', startOfWeek.toISOString().split('T')[0]);
      params.append('end_date', endOfWeek.toISOString().split('T')[0]);
      const response = await axios.get(`/api/teacher/classes/calendar?${params}`);
      const classesData = response.data || [];
      console.log('API response (teacher/classes/calendar):', classesData);
      // Filter classes to only those in the week (in case backend doesn't filter)
      let filtered = classesData.filter(classItem => {
        const classDate = new Date(classItem.date);
        return classDate >= startOfWeek && classDate <= endOfWeek;
      });
      console.log('Filtered classes for week:', filtered);
      
      // PRE-PROCESS the student names in group classes before transformation
      const processedClasses = [];
      
      filtered.forEach(classItem => {
        // Special handling for group classes with multiple student names
        if (classItem.class_type === 'Group' && classItem.student_name) {
          console.log('Pre-processing group class:', classItem.student_name);
          
          // Handle "kai, mei..." format - need to extract individual names
          if (classItem.student_name.includes(',')) {
            console.log('Found group class with multiple students:', classItem.student_name);
            
            // Remove the ellipsis if present
            const cleanedName = classItem.student_name.replace('...', '');
            
            // Split by comma and create individual class items
            const studentNames = cleanedName.split(',')
              .map(name => name.trim())
              .filter(name => name.length > 0);
              
            console.log('Split into individual students:', studentNames);
            
            // Create a separate class item for each student
            studentNames.forEach(studentName => {
              const newClassItem = {...classItem};
              newClassItem.student_name = studentName;
              newClassItem.original_student_list = classItem.student_name;
              newClassItem.isIndividualGroupStudent = true;
              processedClasses.push(newClassItem);
            });
          } else {
            // No commas - just a single student in a group class
            processedClasses.push(classItem);
          }
        } else {
          // Not a group class - add as is
          processedClasses.push(classItem);
        }
      });
      
      // Replace the filtered array with our processed classes
      filtered = processedClasses;
      console.log('Processed classes for individual display:', filtered.length);
      // Transform API data to match expected format for daily calendar
      // Process each class and ensure group classes always display as individual cards
      let transformedClasses = [];
      
      filtered.forEach(classItem => {
        const classDateObj = new Date(classItem.date);
        // Always use local yyyy-mm-dd string for date
        const localDateStr = `${classDateObj.getFullYear()}-${String(classDateObj.getMonth() + 1).padStart(2, '0')}-${String(classDateObj.getDate()).padStart(2, '0')}`;
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][classDateObj.getDay()];
        
        // Special handling for all group classes
        if (classItem.class_type === 'Group') {
          console.log('Processing group class:', classItem.student_name);
          
          // If this is an already processed individual student from a group class, preserve that info
          if (classItem.isIndividualGroupStudent) {
            console.log('Adding pre-processed individual group student:', classItem.student_name);
            
            transformedClasses.push({
              id: classItem.id,
              original_id: classItem.id,
              student_name: classItem.student_name,
              original_student_list: classItem.original_student_list || classItem.student_name,
              day: dayName,
              time: classItem.time,
              duration: 30,
              class_type: classItem.class_type,
              teacher_id: classItem.teacher_id,
              status: classItem.status,
              date: localDateStr,
              notes: classItem.notes || '',
              isIndividualGroupStudent: true
            });
          } else {
            // For any remaining group classes that weren't pre-processed, 
            // create individual cards (this is a fallback)
            console.log('Processing regular group class:', classItem.student_name);
            
            transformedClasses.push({
              id: classItem.id,
              student_name: classItem.student_name,
              day: dayName,
              time: classItem.time,
              duration: 30,
              class_type: classItem.class_type,
              teacher_id: classItem.teacher_id,
              status: classItem.status,
              date: localDateStr,
              notes: classItem.notes || ''
            });
          }
        } else {
          // Regular class (not a group class)
          transformedClasses.push({
            id: classItem.id,
            student_name: classItem.student_name,
            day: dayName,
            time: classItem.time,
            duration: 30, // Default duration
            class_type: classItem.class_type,
            teacher_id: classItem.teacher_id,
            status: classItem.status,
            date: localDateStr, // Use local date string
            notes: classItem.notes || ''
          });
        }
      });
      
      // Sort classes to ensure proper ordering
      transformedClasses.sort((a, b) => {
        // First sort by date
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        
        // Then sort by time
        if (a.time < b.time) return -1;
        if (a.time > b.time) return 1;
        
        // Then sort by class type (maintain this order: Premium, Group, Regular)
        const typeOrder = { 'Premium': 0, 'Group': 1, 'Regular': 2 };
        const aType = a.class_type || 'Regular';
        const bType = b.class_type || 'Regular';
        const aOrder = typeOrder[aType] !== undefined ? typeOrder[aType] : 3;
        const bOrder = typeOrder[bType] !== undefined ? typeOrder[bType] : 3;
        
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // Then by student name for consistency
        return a.student_name.localeCompare(b.student_name);
      });
      
      // Debug group class processing
      const groupClassCount = transformedClasses.filter(c => c.class_type === 'Group').length;
      const individualStudentCount = transformedClasses.filter(c => c.isIndividualGroupStudent).length;
      
      console.log('Transformed classes summary:', {
        total: transformedClasses.length,
        groupClasses: groupClassCount,
        individualGroupStudents: individualStudentCount
      });
      
      console.log('Sample of transformed classes:', transformedClasses.slice(0, 3));
      
      setClasses(transformedClasses);
    } catch (err) {
      console.error('Error fetching classes:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        setError(`Failed to load classes: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('Failed to connect to server');
      } else {
        console.error('Error message:', err.message);
        setError(`Failed to load classes: ${err.message}`);
      }
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch classes on component mount and when currentWeek changes
  useEffect(() => {
    fetchClasses();
  }, [currentWeek]); // Only depend on currentWeek, not the function itself

  // Listen for external refresh events (e.g., from admin updates)
  useEffect(() => {
    const REFRESH_COOLDOWN = 10000; // 10 seconds minimum between refreshes - increased further to prevent refresh spam
    
    const handleRefreshEvent = (refreshData) => {
      console.log('Daily calendar received refresh event:', refreshData);
      
      // Clear any existing timeout to debounce rapid refreshes
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      // Check if we've refreshed too recently
      const now = Date.now();
      if (now - lastRefreshTimeRef.current < REFRESH_COOLDOWN) {
        console.log('Skipping refresh - too soon after previous refresh', 
          'Last refresh:', new Date(lastRefreshTimeRef.current).toLocaleTimeString(),
          'Next allowed refresh:', new Date(lastRefreshTimeRef.current + REFRESH_COOLDOWN).toLocaleTimeString());
        return;
      }
      
      // Debounce refresh calls to prevent rapid fire refreshes
      refreshTimeoutRef.current = setTimeout(() => {
        console.log('Actually performing the refresh');
        // Trigger immediate data refresh
        fetchClasses();
        
        // Record this refresh time
        lastRefreshTimeRef.current = Date.now();
      }, 1000); // 1000ms debounce - increased further for stability
    };
    
    // Add the event listener
    const unsubscribe = refreshEventManager.addListener(handleRefreshEvent);
    
    // Cleanup listener and timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      unsubscribe();
    };
  }, []); // Empty dependency array - this only runs once on mount

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

  // Filter classes based on search query and status filter
  const filteredClasses = useMemo(() => {
    let result = [...classes];
    // Apply search query first
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (cls) =>
          cls.student_name.toLowerCase().includes(query) ||
          (cls.teacher_name && cls.teacher_name.toLowerCase().includes(query)) ||
          cls.class_type.toLowerCase().includes(query)
      );
    }
    // Then apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((cls) => {
        // Handle both with and without (RG) suffix for backward compatibility
        const baseStatus = cls.status.replace(/\s*\(RG\)$/, '').trim();
        const targetStatus = statusFilter.replace(/\s*\(RG\)$/, '').trim();
        return baseStatus === targetStatus;
      });
    }
    return result;
  }, [classes, searchQuery, statusFilter]);

  // Create a map of filtered classes by day and time for efficient lookup
  const filteredClassesMap = useMemo(() => {
    const map = new Map();
    filteredClasses.forEach((cls) => {
      const key = `${cls.day}-${cls.time}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(cls);
    });
    return map;
  }, [filteredClasses]);

  // Make getFilteredClassesForSlot always use the latest filteredClassesMap
  const getFilteredClassesForSlot = React.useCallback((day, time24) => {
    const dayName = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ][day.getDay()];
    return filteredClassesMap.get(`${dayName}-${time24}`) || [];
  }, [filteredClassesMap]);

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

  // Event handlers for modal
  const handleEventClick = (event) => {
    console.log('handleEventClick called with event:', event);
    
    // Create a clean copy of the event for the modal
    const eventForModal = {
      ...event,
      date: event.date ? new Date(event.date) : new Date(),
    };
    
    // If this is a group class, make sure it's clearly marked
    if (event.class_type === 'Group') {
      console.log('Handling group class for student:', event.student_name);
      
      // If this is an individual student in a group class, preserve that information
      if (event.isIndividualGroupStudent) {
        console.log('This is an individual student in a group class');
        eventForModal.isIndividualGroupStudent = true;
        eventForModal.original_student_list = event.original_student_list;
        
        // Add more detailed information for display in the modal
        eventForModal.groupClassNote = `This student is part of a group class with: ${event.original_student_list}`;
        eventForModal.modalTitlePrefix = "Individual Student in Group Class";
      } else {
        // Regular group class
        eventForModal.isGroupClassStudent = true;
        eventForModal.modalTitlePrefix = "Group Class";
      }
    }
    
    setSelectedEvent(eventForModal);
    setShowDetailsModal(true);
    console.log('Modal state set to open, selectedEvent:', eventForModal);
  };

  const handleMoreClassesClick = (dayEvents, dayDate) => {
    // dayEvents now contains only the hidden events passed from the button click
    setSelectedDayEvents(dayEvents);
    setSelectedDayDate(dayDate);
    setShowMoreClassesModal(true);
  };

  const handleNotesChange = (notes) => {
    if (selectedEvent) {
      setSelectedEvent({ ...selectedEvent, notes });
    }
  };

  const handleSaveNotes = async (classId, notes) => {
    try {
      await axios.patch(`/api/teacher/classes/${classId}/notes`, {
        notes: notes
      });
      
      // Update local state
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === classId ? { ...cls, notes } : cls
        )
      );
      
      // Update selected event
      if (selectedEvent && selectedEvent.id === classId) {
        setSelectedEvent(prev => ({
          ...prev,
          notes: notes
        }));
      }
      
      console.log('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const response = await axios.patch(`/api/teacher/classes/${eventId}/status`, {
        status: newStatus
      });
      
      // Fallback to local update if response.data is missing
      const updatedData = response.data && Object.keys(response.data).length > 0
        ? response.data
        : { status: newStatus };
      
      // Update classes array directly
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === eventId ? { ...cls, ...updatedData } : cls
        )
      );
      
      // Update selected event if needed
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(prev => prev ? { ...prev, ...updatedData } : null);
      }
      
      toast.success('Class status updated successfully!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Close the modal
      setShowDetailsModal(false);
      
      // Note: We're not manually triggering a render with setRenderKey anymore
      // The classes update will naturally cause a render through the useEffect that
      // watches classes.length, but only if needed
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating class status.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleUpdateClass = async (eventId, updateData) => {
    try {
      setLoading(true);
      const eventToUpdate = updateData || selectedEvent;
      if (!eventToUpdate) {
        console.error('No event selected for update');
        return;
      }
      
      // Update individual class regardless of type
      const payload = {
        teacher_id: eventToUpdate.teacher_id,
        student_name: eventToUpdate.student_name,
        class_type: eventToUpdate.class_type,
        schedule: eventToUpdate.date ? (eventToUpdate.date instanceof Date ? eventToUpdate.date.toISOString().split('T')[0] : eventToUpdate.date) : '',
        time: eventToUpdate.time,
        status: eventToUpdate.status
      };
      
      console.log('Updating class with payload:', payload);
      
      const response = await axios.patch(`/api/teacher/classes/${eventId}/update`, payload);
      const updatedData = response.data && response.data.class
        ? { ...response.data.class }
        : { ...payload, id: eventId };
      
      console.log('Class updated successfully, server response:', updatedData);
      
      // Update classes state - this will trigger one render
      setClasses(prevClasses =>
        prevClasses.map(cls =>
          cls.id === eventId ? { ...cls, ...updatedData } : cls
        )
      );
      
      // Close the modal
      setShowDetailsModal(false);
      
      toast.success('Class updated successfully!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Trigger external events with delayed execution to avoid race conditions
      const triggerEvents = () => {
        console.log('Triggering refresh events');
        refreshEventManager.triggerEventUpdate(eventId, 'class_update', 'teacher');
        
        if (window.refreshNotifications) {
          window.refreshNotifications();
        }
        
        window.dispatchEvent(new Event('classUpdated'));
      };
      
      // Delay the refresh event to ensure UI updates first
      setTimeout(triggerEvents, 500);
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Error updating class.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Keep track of previous classes length to minimize unnecessary refreshes
  const prevClassesLengthRef = useRef(-1);
  
  // Updating renderKey only when necessary
  useEffect(() => {
    // Only refresh if the number of classes has changed and it's not the first load
    if (prevClassesLengthRef.current !== -1 && prevClassesLengthRef.current !== classes.length) {
      console.log('Classes count changed, refreshing calendar:', prevClassesLengthRef.current, '->', classes.length);
      // Update renderKey when class count changes - only happens after user actions
      setRenderKey(prev => prev + 1);
    }
    // Store new count for future comparison
    prevClassesLengthRef.current = classes.length;
  }, [classes.length]); // Only depend on the length, not the entire classes array

  return (
    <TeachersLayout
      /* Removed key to prevent unnecessary remounting of the entire layout */
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
                    <span className="truncate">{statusFilter}</span>
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
                    <div className="p-2">
                      {/* Class Type Legend to help user understand color scheme */}
                      <div className="mb-3 border-b pb-2">
                        <div className="text-xs font-semibold text-gray-500 mb-2">Class Types (Card Colors)</div>
                        <div className="flex items-center mb-1">
                          <span className="w-4 h-4 bg-pink-400 border border-navy-600 flex-shrink-0 rounded-sm mr-2"></span>
                          <span className="text-xs text-gray-700">Regular Class</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <span className="w-4 h-4 bg-purple-400 border border-orange-500 flex-shrink-0 rounded-sm mr-2"></span>
                          <span className="text-xs text-gray-700">Premium Class</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-4 h-4 bg-green-400 border border-[#4A9782] flex-shrink-0 rounded-sm mr-2"></span>
                          <span className="text-xs text-gray-700">Group Class</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 italic">Card colors depend solely on class type, regardless of status</div>
                      </div>
                    
                      <button
                        key="all-statuses"
                        type="button"
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                          statusFilter === 'all' 
                            ? 'bg-navy-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setStatusFilter('all');
                          setDropdownOpen(false);
                        }}
                      >
                        All Statuses
                      </button>
                      
                      {statuses.map((status) => (
                          <button
                            key={status}
                            type="button"
                            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 flex items-center ${
                              statusFilter === status
                                ? 'bg-navy-600 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setStatusFilter(status);
                              setDropdownOpen(false);
                            }}
                          >
                            <span className="w-4 h-4 bg-gray-200 border border-gray-300 flex-shrink-0 rounded-sm mr-3"></span>
                            {status}
                          </button>
                      ))}
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
              <table key={`daily-calendar-${renderKey}`} className="min-w-full border-collapse">
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
                    <tr key={`${timeIndex}-${renderKey}`} className="bg-white hover:bg-gray-50" style={{transition: 'all 0.2s'}}>
                      <td className="border-r border-b border-navy-100 p-2 w-28 text-center font-medium text-xs text-navy-700">
                        <div className="flex items-center justify-center">
                          <Clock className="h-3 w-3 mr-1 text-navy-400" />
                          <span>{time.display}</span>
                        </div>
                      </td>
                      {daysOfWeek.map((day, dayIndex) => {
                        const classesInSlot = getFilteredClassesForSlot(day, time.time24);
                        const hasClass = classesInSlot.length > 0;
                        const filteredClassesInSlot = classesInSlot.filter(cls => {
                          if (searchQuery) {
                            return cls.student_name.toLowerCase().includes(searchQuery.toLowerCase());
                          }
                          return true;
                        });
                        
                        return (
                          <td 
                            key={`${dayIndex}-${renderKey}`} 
                            className={`border-r border-b border-navy-100 p-1 last:border-r-0 ${hasClass ? '' : 'bg-white'}`}
                          >
                            {/* Show individual cards for all classes (no grouping) */}
                            {(() => {
                              // Display each class as an individual card
                              const visibleClasses = filteredClassesInSlot.slice(0, 2);
                              
                              return visibleClasses.map((cls) => {
                                // Define status color and border color based on status
                                let statusColor = '';
                                let borderColor = '';
                                let textColor = '';
                                
                                // Apply color based on status using switch statement
                                let statusIcon = null;
                                let cssClass = '';
                                
                                switch (cls.status) {
                                    case 'Valid for cancellation':
                                    case 'Valid for Cancellation':
                                        statusColor = 'bg-[#94a3b8]';
                                        textColor = 'text-white';
                                        statusIcon = null;
                                        cssClass = 'bg-[#94a3b8] text-white';
                                        break;
                                    case 'FC not consumed':
                                    case 'Free Class':
                                        statusColor = 'bg-[#fcd34d]';
                                        textColor = 'text-white';
                                        statusIcon = null;
                                        cssClass = 'bg-[#fcd34d] text-white';
                                        break;
                                    case 'Completed':
                                        statusColor = 'bg-[#4ade80]';
                                        textColor = 'text-white';
                                        statusIcon = null;
                                        cssClass = 'bg-[#4ade80] text-white';
                                        break;
                                    case 'Absent w/ntc counted':
                                        statusColor = 'bg-[#60a5fa]';
                                        textColor = 'text-white';
                                        statusIcon = null;
                                        cssClass = 'bg-[#60a5fa] text-white';
                                        break;
                                    case 'Cancelled':
                                        statusColor = 'bg-[#c084fc]';
                                        textColor = 'text-white';
                                        statusIcon = null;
                                        cssClass = 'bg-[#c084fc] text-white';
                                        break;
                                    case 'Absent w/ntc-not counted':
                                        statusColor = 'bg-[#64748b]';
                                        textColor = 'text-white';
                                        statusIcon = null;
                                        cssClass = 'bg-[#64748b] text-white';
                                        break;
                                    case 'FC consumed':
                                        statusColor = 'bg-[#f472b6]';
                                        textColor = 'text-white';
                                        statusIcon = null;
                                        cssClass = 'bg-[#f472b6] text-white';
                                        break;
                                    case 'Absent Without Notice':
                                        statusColor = 'bg-[#ef4444]';
                                        textColor = 'text-white';
                                        statusIcon = null;
                                        cssClass = 'bg-[#ef4444] text-white';
                                        break;
                                    default:
                                        // Based on class type
                                        if (cls.class_type === "Premium") {
                                            statusColor = 'bg-[#f472b6]';
                                            textColor = 'text-white';
                                            statusIcon = null;
                                            cssClass = 'bg-[#f472b6] text-white';
                                        } else if (cls.class_type === "Group") {
                                            statusColor = 'bg-[#4ade80]';
                                            textColor = 'text-white';
                                            statusIcon = null;
                                            cssClass = 'bg-[#4ade80] text-white';
                                        } else {
                                            statusColor = 'bg-[#c084fc]';
                                            textColor = 'text-white';
                                            statusIcon = null;
                                            cssClass = 'bg-[#c084fc] text-white';
                                        }
                                        break;
                                }
                                
                                // Determine left border color based on class type
                                let leftBorderColor = '';
                                if (cls.class_type === 'Group') {
                                    leftBorderColor = 'border-l-4 border-[#4A9782]'; // Teal for Group
                                } else if (cls.class_type === 'Premium') {
                                    leftBorderColor = 'border-l-4 border-orange-400'; // Orange for Premium
                                } else {
                                    leftBorderColor = 'border-l-4 border-navy-500'; // Navy for Regular
                                }
                                
                                return (
                                <div
                                  key={`${cls.id}-${cls.student_name}-${renderKey}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEventClick(cls);
                                  }}
                                  className={`p-1.5 rounded-md text-xs shadow-sm mb-1 last:mb-0 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-opacity-80 ${statusColor} ${textColor} ${leftBorderColor}`}
                                >
                                  <div className="flex flex-col">
                                      <div className="flex items-center">
                                        {
                                          // Display icons based on class type for simpler, more consistent styling
                                          cls.class_type === 'Premium' ? 
                                            <Gem className="h-4 w-4 text-white mr-1" title="Premium Class" /> : 
                                          cls.class_type === 'Group' ?
                                            <Users className="h-4 w-4 text-white mr-1" title="Group Class" /> :
                                            <User className="h-4 w-4 text-white mr-1" title="Regular Class" />
                                        }
                                        <span className="font-medium">{cls.student_name}</span>
                                      </div>                                    {/* Removed GROUP CLASS label as requested */}
                                  </div>
                                </div>
                              );
                              });
                            })()}
                            
                            {/* Show "+X more" button if there are more than 2 classes */}
                            {filteredClassesInSlot.length > 2 && (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Pass only the hidden classes (the ones not displayed)
                                  const hiddenClasses = filteredClassesInSlot.slice(2);
                                  handleMoreClassesClick(hiddenClasses, day);
                                }}
                                className="w-full p-1.5 rounded-md text-xs bg-gray-200 text-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-300 hover:text-gray-900 text-center border-l-4 border-gray-400 select-none focus:outline-none focus:ring-2 focus:ring-gray-400"
                              >
                                <span className="font-medium">
                                  +{filteredClassesInSlot.length - 2} more
                                </span>
                              </button>
                            )}
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
      
      {/* Event Details Modal */}
      <DetailsCalendarModal
        isOpen={showDetailsModal}
        onClose={() => {
          console.log('Daily calendar modal closing');
          setShowDetailsModal(false);
        }}
        event={selectedEvent}
        onStatusChange={handleStatusChange}
        onNotesSave={handleSaveNotes}
        onJoinClass={handleUpdateClass}
      />

      {/* More Classes Modal */}
      <MoreClassesModal
        isOpen={showMoreClassesModal}
        onClose={() => setShowMoreClassesModal(false)}
        classes={selectedDayEvents}
        timeSlot="Additional Classes"
        day={selectedDayDate ? selectedDayDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : ''}
        onClassClick={handleEventClick}
      />
      <ToastContainer />
    </TeachersLayout>
  );
}
