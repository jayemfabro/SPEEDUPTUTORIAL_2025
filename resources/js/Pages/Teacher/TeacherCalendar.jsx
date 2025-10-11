import React, { useState, useEffect, useCallback } from "react";
import { Head, usePage } from "@inertiajs/react";
import TeachersLayout from "@/Layouts/TeachersLayout";
import DetailsCalendarModal from "@/Components/Teacher/DetailsCalendarModal";
import MoreClassesModal from "@/Components/Teacher/MoreClassesModal";
import Legend from "@/Components/Admin/Legend";
import axios from "axios";
import refreshEventManager from "@/utils/refreshEvents";
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TeacherCalendar() {
  const { auth } = usePage().props;
  
  // State for calendar and events
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [allEvents, setAllEvents] = useState([]) // Store all events for filtering
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [renderKey, setRenderKey] = useState(0) // Force re-render key
  
  // Filter states
  const [filterOpen, setFilterOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Status options matching AdminCalendar.jsx
  const statuses = [
    "Valid for cancellation",
    "FC not consumed",
    "Completed", 
    "Absent w/ntc counted",
            "Cancelled",
    "Absent w/ntc-not counted",
    "FC consumed",
    "Absent Without Notice",
  ];
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [forceUpdateTimestamp, setForceUpdateTimestamp] = useState(Date.now())
  const [calendarKey, setCalendarKey] = useState(0) // Calendar component key
  
  // State for MoreClassesModal
  const [showMoreClassesModal, setShowMoreClassesModal] = useState(false)
  const [selectedDayEvents, setSelectedDayEvents] = useState([])
  const [selectedDayDate, setSelectedDayDate] = useState(null)
  
  // Helper function to convert date to weekday name
  const getWeekdayFromDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Fetch classes from API
  const fetchClasses = async () => {
    console.log('Teacher fetchClasses called for date:', selectedDate);
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching classes for teacher:', auth.user?.name, 'ID:', auth.user?.id);
      const response = await axios.get('/api/teacher/classes/calendar');
      const classes = response.data || [];
      
      console.log('Teacher retrieved classes:', classes.length, 'classes');
      console.log('Teacher classes data:', classes);
      
      // Transform API data to match expected event format
      const transformedEvents = classes.map(classItem => {
        try {
          // Ensure date is properly formatted
          const eventDate = classItem.date ? new Date(classItem.date) : new Date();
          
          return {
            id: classItem.id,
            title: classItem.title || classItem.student_name,
            student_name: classItem.student_name,
            teacher_name: classItem.teacher_name,
            teacher_id: classItem.teacher_id,
            class_type: classItem.class_type,
            date: eventDate,
            time: classItem.time,
            status: classItem.status,
            notes: classItem.notes || '',
            // Additional properties for calendar display
            weekday: getWeekdayFromDate(eventDate),
            description: `${classItem.class_type} for ${classItem.student_name}`,
            start: classItem.start || `${classItem.date}T${classItem.time}`,
            created_at: classItem.created_at,
            updated_at: classItem.updated_at
          };
        } catch (error) {
          console.error('Error transforming teacher class data in fetchClasses:', classItem, error);
          return null;
        }
      }).filter(event => event !== null); // Remove null entries
      
      console.log('Transformed events:', transformedEvents);
      
      setAllEvents(transformedEvents);
      setEvents(transformedEvents);
      setRenderKey(prev => prev + 1); // Force re-render after fetching new events
    } catch (err) {
      console.error('Error fetching classes:', err);
      
      // More detailed error handling
      if (err.response) {
        // Server responded with error status
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        setError(`Failed to load classes: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request);
        setError('Failed to connect to server');
      } else {
        // Something else happened
        console.error('Error message:', err.message);
        setError(`Failed to load classes: ${err.message}`);
      }
      
      setAllEvents([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
    setSelectedDate(new Date());
  }, []);

  // Removed auto-refresh mechanism that was polling every 3 seconds
  // Force refresh to clear any cached references
  
  // Listen for external refresh events (e.g., from admin updates)
  useEffect(() => {
    let refreshTimeout;
    
    const unsubscribe = refreshEventManager.addListener((refreshData) => {
      console.log('Teacher received refresh event:', refreshData);
      
      // Clear any existing timeout to debounce rapid refreshes
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      
      // Debounce refresh calls to prevent rapid fire refreshes
      refreshTimeout = setTimeout(() => {
        // Trigger immediate data refresh
        fetchClasses();
        
        // Single refresh for real-time updates
        setRenderKey(prev => prev + 1);
        setForceUpdateTimestamp(Date.now());
        setCalendarKey(prev => prev + 1);
      }, 300); // 300ms debounce
    });
    
    // Cleanup listener and timeout on unmount
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      unsubscribe();
    };
  }, []);
  
  // Update events when filters change
  useEffect(() => {
    if (searchQuery || statusFilter !== 'all') {
      const filtered = allEvents.filter(event => {
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
      setEvents([...allEvents]);
    }
  }, [searchQuery, statusFilter, allEvents]);

  
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

  // Make getEventsForDate always use the latest allEvents state
  const getEventsForDate = useCallback((date) => {
    if (!allEvents || !Array.isArray(allEvents)) {
      return { items: [], total: 0 };
    }
    const filteredEvents = allEvents.filter(event => {
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
  }, [allEvents, searchQuery, statusFilter]);
  
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
    console.log('Teacher handleEventClick called with event:', event);
    // If group class, gather all students for this time/teacher/class_type/date
    if (event.class_type === 'Group') {
      const groupStudents = allEvents
        .filter(ev =>
          ev.class_type === 'Group' &&
          ev.time === event.time &&
          ev.teacher_id === event.teacher_id &&
          (ev.date instanceof Date ? ev.date.toDateString() : new Date(ev.date).toDateString()) === (event.date instanceof Date ? event.date.toDateString() : new Date(event.date).toDateString())
        )
        .map(ev => ev.student_name);
      setSelectedEvent({
        ...event,
        student_name: groupStudents,
        date: event.date ? new Date(event.date) : new Date(),
      });
    } else {
      setSelectedEvent({
        ...event,
        date: event.date ? new Date(event.date) : new Date(),
      });
    }
    setShowDetailsModal(true);
    console.log('Teacher modal state set to open, selectedEvent:', event);
  };

  const handleMoreClassesClick = (dayEvents, dayDate) => {
    console.log('Teacher handleMoreClassesClick called with:', { dayEvents, dayDate });
    // dayEvents now contains only the hidden events passed from the button click
    setSelectedDayEvents(dayEvents);
    setSelectedDayDate(dayDate);
    setShowMoreClassesModal(true);
    console.log('Teacher modal state updated, showMoreClassesModal:', true);
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
      const updatedEvents = allEvents.map(event => 
        event.id === classId ? { ...event, notes: notes } : event
      );
      
      setAllEvents(updatedEvents);
      
      // Update displayed events
      if (searchQuery || statusFilter !== 'all') {
        const filtered = updatedEvents.filter(event => {
          if (searchQuery && 
              (!event.student_name || 
               !event.student_name.toLowerCase().includes(searchQuery.toLowerCase()))) {
            return false;
          }
          if (statusFilter !== 'all' && event.status !== statusFilter) {
            return false;
          }
          return true;
        });
        setEvents(filtered);
      } else {
        setEvents(updatedEvents);
      }
    } catch (err) {
      console.error('Error updating class notes:', err);
      // You could add a toast notification here
    }
  };

  // Handle status change in the modal
  const handleStatusChange = (eventId, newStatus) => {
    console.log('HandleStatusChange called:', eventId, newStatus);
    
    // Update the selected event status immediately
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => ({
        ...prev,
        status: newStatus
      }));
    }
    
    // Update the events in the local state immediately
    setAllEvents(prevEvents => {
      const updated = prevEvents.map(event =>
        event.id === eventId ? { ...event, status: newStatus } : event
      );
      console.log('Updated allEvents:', updated);
      return updated;
    });
    
    setEvents(prevEvents => {
      const updated = prevEvents.map(event =>
        event.id === eventId ? { ...event, status: newStatus } : event
      );
      console.log('Updated events:', updated);
      return updated;
    });

    // Single refresh to update UI
    setRenderKey(prev => prev + 1);
    setForceUpdateTimestamp(Date.now());
    setCalendarKey(prev => prev + 1);
    
    // Trigger cross-component refresh event
    refreshEventManager.triggerEventUpdate(eventId, 'status_change', 'teacher');
    
    // Force immediate notification refresh to update bell for admin
    if (window.refreshNotifications) {
      window.refreshNotifications();
    }
    
    // Also trigger immediate admin calendar refresh
    setTimeout(() => {
      refreshEventManager.triggerRefresh('teacher_status_change');
    }, 100);
  };

  // Handle class update (Update button functionality)
  const handleUpdateClass = async (eventId, updateData) => {
    try {
      setLoading(true);
      const eventToUpdate = updateData || selectedEvent;
      if (!eventToUpdate) {
        console.error('No event selected for update');
        return;
      }
      // If group class, update all group students for this slot
      if (eventToUpdate.class_type === 'Group' && Array.isArray(eventToUpdate.student_name)) {
        const groupStudents = allEvents.filter(ev =>
          ev.class_type === 'Group' &&
          ev.time === eventToUpdate.time &&
          ev.teacher_id === eventToUpdate.teacher_id &&
          (ev.date instanceof Date ? ev.date.toDateString() : new Date(ev.date).toDateString()) === (eventToUpdate.date instanceof Date ? eventToUpdate.date.toDateString() : new Date(eventToUpdate.date).toDateString())
        );
        await Promise.all(groupStudents.map(async (cls) => {
          const payload = {
            teacher_id: cls.teacher_id,
            student_name: cls.student_name,
            class_type: cls.class_type,
            schedule: cls.date ? (cls.date instanceof Date ? cls.date.toISOString().split('T')[0] : cls.date) : '',
            time: cls.time,
            status: eventToUpdate.status
          };
          await axios.patch(`/api/teacher/classes/${cls.id}/update`, payload);
        }));
        setAllEvents(prevEvents => prevEvents.map(event => {
          if (groupStudents.some(g => g.id === event.id)) {
            return { ...event, status: eventToUpdate.status };
          }
          return event;
        }));
        setEvents(prevEvents => prevEvents.map(event => {
          if (groupStudents.some(g => g.id === event.id)) {
            return { ...event, status: eventToUpdate.status };
          }
          return event;
        }));
        setSelectedEvent(prev => prev ? { ...prev, status: eventToUpdate.status } : null);
        setShowDetailsModal(false);
        toast.success('Group class statuses updated successfully!', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        refreshEventManager.triggerEventUpdate(eventId, 'class_update', 'teacher');
        if (window.refreshNotifications) {
          window.refreshNotifications();
        }
        setTimeout(() => {
          refreshEventManager.triggerRefresh('teacher_class_update');
        }, 100);
        window.dispatchEvent(new Event('classUpdated'));
        setLoading(false);
        setTimeout(() => setLoading(false), 10);
      } else {
        const payload = {
          teacher_id: eventToUpdate.teacher_id,
          student_name: eventToUpdate.student_name || eventToUpdate.studentName,
          class_type: eventToUpdate.class_type || eventToUpdate.classType,
          schedule: eventToUpdate.date ? (eventToUpdate.date instanceof Date ? eventToUpdate.date.toISOString().split('T')[0] : eventToUpdate.date) : '',
          time: eventToUpdate.time,
          status: eventToUpdate.status
        };
        const response = await axios.patch(`/api/teacher/classes/${eventId}/update`, payload);
        const updatedEventData = response.data && response.data.class
          ? { ...response.data.class }
          : { ...payload, id: eventId };
        setAllEvents(prevEvents => {
          const updated = prevEvents.map(event =>
            event.id === eventId ? { ...event, ...updatedEventData } : event
          );
          setRenderKey(prev => prev + 1);
          return updated;
        });
        setEvents(prevEvents => {
          const updated = prevEvents.map(event =>
            event.id === eventId ? { ...event, ...updatedEventData } : event
          );
          return updated;
        });
        setSelectedEvent(prev => prev ? { ...prev, ...updatedEventData } : null);
        setShowDetailsModal(false);
        toast.success('Class updated successfully!', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        refreshEventManager.triggerEventUpdate(eventId, 'class_update', 'teacher');
        if (window.refreshNotifications) {
          window.refreshNotifications();
        }
        setTimeout(() => {
          refreshEventManager.triggerRefresh('teacher_class_update');
        }, 100);
        window.dispatchEvent(new Event('classUpdated'));
        setLoading(false);
        setTimeout(() => setLoading(false), 10);
      }
    } catch (error) {
      console.error('Error updating class:', error);
      
      let errorMessage = 'Error updating class.';
      if (error.response) {
        if (error.response.status === 419) {
          errorMessage = 'Session expired. Please refresh the page and try again.';
        } else if (error.response.status === 422) {
          errorMessage = 'Invalid data provided. Please check your input.';
        } else if (error.response.status === 403) {
          errorMessage = 'You are not authorized to perform this action.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle event updated
  const handleEventUpdated = async (eventId, newStatus) => {
    try {
      await axios.patch(`/api/teacher/classes/${eventId}/status`, {
        status: newStatus
      });
      
      // If status is completed, update student stats in backend
      if (newStatus.toLowerCase() === 'completed') {
        // Find the event to get student name and class type
        const event = allEvents.find(e => e.id === eventId);
        if (event && event.student_name && event.class_type) {
          // Call backend to recalculate student stats
          await axios.post(`/api/admin/students/update-from-class-status/${encodeURIComponent(event.student_name)}`);
          // Show toast notification
          toast.success('Class marked as completed! Class left -1, Completed +1 for student.', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
      
      // If status is Absent Without Notice, update student stats in backend
      if (newStatus === 'Absent Without Notice') {
        // Find the event to get student name and class type
        const event = allEvents.find(e => e.id === eventId);
        if (event && event.student_name && event.class_type) {
          // Call backend to recalculate student stats
          await axios.post(`/api/admin/students/update-from-class-status/${encodeURIComponent(event.student_name)}`);
          // Show toast notification
          toast.success('Class marked as Absent Without Notice! Class left -1, Absent Without Notice +1 for student.', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
      
      // Update local state
      const updatedEvents = allEvents.map(event => 
        event.id === eventId ? { ...event, status: newStatus } : event
      );
      
      setAllEvents(updatedEvents);
      
      // Update displayed events based on current filters
      if (searchQuery || statusFilter !== 'all') {
        const filtered = updatedEvents.filter(event => {
          if (searchQuery && 
              (!event.student_name || 
               !event.student_name.toLowerCase().includes(searchQuery.toLowerCase()))) {
            return false;
          }
          if (statusFilter !== 'all' && event.status !== statusFilter) {
            return false;
          }
          return true;
        });
        setEvents(filtered);
      } else {
        setEvents(updatedEvents);
      }
      
      // Force re-render to update colors immediately
      setRenderKey(prev => prev + 1);
      setForceUpdateTimestamp(Date.now());
      setCalendarKey(prev => prev + 1);
      
      // Additional forced update
      setTimeout(() => {
        setRenderKey(prev => prev + 1);
        setForceUpdateTimestamp(Date.now());
        setCalendarKey(prev => prev + 1);
      }, 50);
      
      // Force state refresh
      setTimeout(() => {
        setAllEvents(prevEvents => [...prevEvents]);
        setEvents(prevEvents => [...prevEvents]);
      }, 100);
      
      setShowDetailsModal(false);
      
    } catch (err) {
      console.error('Error updating class status:', err);
      // You could add a toast notification here
    }
  }

  // Helper function to get event icon and styling based on class type and status
  const getEventStyles = (classType, status = 'scheduled') => {
    // Class type styling (border color)
    let border = '';
    let typeIcon = null;
    
    switch (classType) {
      case "Premium":
        border = 'border-orange-500';
        typeIcon = <Gem className="h-3 w-3 text-orange-600 mr-1" />;
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
    
    // Status styling (background color matching admin calendar)
    let bg = '';
    let text = '';
    let secondaryText = '';
    let statusIcon = null;
    
    switch (status) {
      case 'Valid for cancellation':
      case 'Valid for Cancellation':
        bg = 'bg-gray-400';
        text = 'text-white';
        secondaryText = 'text-white';
        statusIcon = <Calendar className="h-3 w-3 text-gray-200 mr-1" />;
        break;
      case 'FC not consumed':
      case 'Free Class':
        bg = 'bg-yellow-400';
        text = 'text-black';
        secondaryText = 'text-black';
        statusIcon = <Calendar className="h-3 w-3 text-yellow-200 mr-1" />;
        break;
      case 'Completed':
        bg = 'bg-green-400';
        text = 'text-white';
        secondaryText = 'text-white';
        statusIcon = <CheckCircle2 className="h-3 w-3 text-green-800 mr-1" />;
        break;
      case 'Absent w/ntc counted':
        bg = 'bg-blue-400';
        text = 'text-white';
        secondaryText = 'text-white';
        statusIcon = <AlertCircle className="h-3 w-3 text-blue-800 mr-1" />;
        break;
                  case 'Cancelled':
                bg = 'bg-purple-400';
                text = 'text-white';
                secondaryText = 'text-white';
                statusIcon = <XCircle className="h-3 w-3 text-purple-800 mr-1" />;
                break;
      case 'Absent w/ntc-not counted':
        bg = 'bg-gray-600';
        text = 'text-white';
        secondaryText = 'text-white';
        statusIcon = <AlertCircle className="h-3 w-3 text-gray-800 mr-1" />;
        break;
      case 'FC consumed':
        bg = 'bg-pink-400';
        text = 'text-white';
        secondaryText = 'text-white';
        statusIcon = <Calendar className="h-3 w-3 text-pink-800 mr-1" />;
        break;
      case 'Absent Without Notice':
        bg = 'bg-red-400';
        text = 'text-white';
        secondaryText = 'text-white';
        statusIcon = <AlertCircle className="h-3 w-3 text-red-800 mr-1" />;
        break;
      case 'scheduled':
      default:
        bg = 'bg-slate-400';
        text = 'text-slate-900';
        secondaryText = 'text-slate-700';
        statusIcon = <Calendar className="h-3 w-3 text-slate-800" />;
        break;
    }
    
    return {
      bg,
      text,
      secondaryText,
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
      <Head title="My Calendar" />
      
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Success Message */}
        {updateSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Class updated successfully!
            </div>
          </div>
        )}

        {/* Teacher Info Header */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-700 rounded-xl shadow-lg p-4 mb-6 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">My Class Calendar</h1>
              <p className="text-navy-100 text-sm mt-1">
                Welcome, {auth.user?.name || 'Teacher'} - View and manage your assigned classes
              </p>
            </div>
          </div>
        </div>
        
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
                    <div className="p-2 space-y-1">
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
                      
                      {statuses.map((status) => {
                        // Get status color based on status name (matching legend)
                        let statusColor = '';
                        let borderColor = '';
                        
                        switch (status) {
                          case 'Valid for cancellation':
                            statusColor = 'bg-gray-400';
                            borderColor = 'border-gray-500';
                            break;
                          case 'FC not consumed':
                            statusColor = 'bg-yellow-400';
                            borderColor = 'border-yellow-500';
                            break;
                          case 'Completed':
                            statusColor = 'bg-green-400';
                            borderColor = 'border-green-500';
                            break;
                          case 'Absent w/ntc counted':
                            statusColor = 'bg-blue-400';
                            borderColor = 'border-blue-500';
                            break;
                                                                                  case 'Cancelled':
                                                            statusColor = 'bg-purple-400';
                                                            borderColor = 'border-purple-500';
                                                            break;
                          case 'Absent w/ntc-not counted':
                            statusColor = 'bg-gray-600';
                            borderColor = 'border-gray-600';
                            break;
                          case 'FC consumed':
                            statusColor = 'bg-pink-400';
                            borderColor = 'border-pink-400';
                            break;
                          case 'Absent Without Notice':
                            statusColor = 'bg-red-400';
                            borderColor = 'border-red-500';
                            break;
                          default:
                            statusColor = 'bg-[#4B5563]';
                            borderColor = 'border-[#4B5563]';
                            break;
                        }
                        
                        return (
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
                            <span className={`w-4 h-4 ${statusColor} ${borderColor} border flex-shrink-0 rounded-sm mr-3`}></span>
                            {status}
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
        <div key={renderKey} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full">
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
                      key={`${day.date.toISOString()}-${renderKey}-${forceUpdateTimestamp}`}
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
                        <div className="mt-1" style={{ pointerEvents: 'auto' }}>
                          {/* Display individual cards for group class students - just like admin view */}
                          {(() => {
                            const allEvents = [...day.events.items];
                            
                            // Sort events by time, then by class type
                            allEvents.sort((a, b) => {
                              if (a.time !== b.time) {
                                return a.time.localeCompare(b.time);
                              }
                              if (a.class_type !== b.class_type) {
                                // Priority: Premium > Group > Regular
                                const typePriority = { 'Premium': 0, 'Group': 1, 'Regular': 2 };
                                return typePriority[a.class_type] - typePriority[b.class_type];
                              }
                              return 0;
                            });
                            
                            // Group class events should be handled individually for display
                            const processedEvents = [];
                            const groupTimeMap = {};
                            
                            // First pass: identify group classes
                            allEvents.forEach(event => {
                              if (event.class_type === 'Group') {
                                const key = `${event.time}|${event.teacher_id}`;
                                if (!groupTimeMap[key]) {
                                  groupTimeMap[key] = [];
                                }
                                groupTimeMap[key].push(event);
                              } else {
                                // Non-group events go directly to processed list
                                processedEvents.push(event);
                              }
                            });
                            
                            // Second pass: process group classes into individual student cards
                            Object.values(groupTimeMap).forEach(groupEvents => {
                              // If there's only one student in this group time slot, treat normally
                              if (groupEvents.length === 1) {
                                processedEvents.push(groupEvents[0]);
                                return;
                              }
                              
                              // For groups with multiple students, create individual cards
                              groupEvents.forEach((event, index) => {
                                // Create reference to all students in this group
                                const allStudents = groupEvents.map(e => e.student_name);
                                
                                const enhancedEvent = {
                                  ...event,
                                  isIndividualGroupStudent: true,
                                  original_student_list: allStudents.join(', ')
                                };
                                processedEvents.push(enhancedEvent);
                              });
                            });
                            
                            // Create individual card for each event
                            const eventCards = processedEvents.map((event, eventIndex) => {
                              let eventTime = new Date(day.date);
                              if (event.time) {
                                const [hours, minutes] = event.time.split(':');
                                eventTime.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0);
                              }
                              
                              const isGroupStudent = event.class_type === 'Group';
                              
                              return (
                                <div
                                  key={`${event.id}-${eventIndex}-${event.student_name}-${renderKey}-${forceUpdateTimestamp}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEventClick(event);
                                  }}
                                  className={`text-xs p-1.5 rounded-md cursor-pointer transition-all duration-200 hover:shadow-md shadow-sm mb-1 last:mb-0 ${getEventStyles(event.class_type, event.status).bg} ${getEventStyles(event.class_type, event.status).text} border-l-4 ${getEventStyles(event.class_type, event.status).border} hover:bg-opacity-80`}
                                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 overflow-hidden">
                                      {getEventStyles(event.class_type, event.status).typeIcon}
                                      <span className="font-semibold truncate max-w-[70px] xs:max-w-[100px]">{event.student_name}</span>
                                    </div>
                                    <span className="text-xs font-medium opacity-80 ml-2">{event.class_type}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-80">
                                    <Clock className="h-3 w-3 mr-1 text-navy-400" />
                                    {eventTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </div>
                                </div>
                              );
                            });
                            
                            // Show up to maxVisibleEvents
                            return eventCards.slice(0, maxVisibleEvents);
                          })()}
                          {hasMoreEvents && (
                            <button 
                              onClick={(e) => {
                                console.log('Teacher +X more button clicked for date:', day.date);
                                e.stopPropagation();
                                
                                // Use our processed events for consistent handling
                                // This ensures all events are shown in the more dialog, including individual group class students
                                const hiddenEvents = processedEvents.slice(maxVisibleEvents);
                                console.log('Teacher hidden events:', hiddenEvents);
                                handleMoreClassesClick(hiddenEvents, day.date);
                              }}
                              className="text-xs text-navy-500 hover:text-navy-700 w-full text-left px-1 py-0.5 hover:bg-navy-50 rounded mb-1"
                            >
                              +{processedEvents.length - maxVisibleEvents} more
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
        onClose={() => {
          console.log('Teacher details modal closing');
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
        onClose={() => {
          console.log('Teacher MoreClassesModal closing');
          setShowMoreClassesModal(false);
        }}
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
  )
}
