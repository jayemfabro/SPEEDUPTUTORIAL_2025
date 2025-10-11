import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar as CalendarIcon, Clock, Users, FileText, CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const DetailsCalendarModal = ({
  isOpen,
  onClose,
  event: selectedEvent,
  onStatusChange,
  onNotesSave,
  onJoinClass
}) => {
  // All hooks must be at the top level, called in the same order every time
  const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const dropdownRef = React.useRef(null);
  
  // Update notes when selectedEvent changes
  React.useEffect(() => {
    if (selectedEvent) {
      setNotes(selectedEvent.notes || '');
    }
  }, [selectedEvent]);

  // Add local state for selected status
  const [localStatus, setLocalStatus] = React.useState(selectedEvent?.status || "");

  // Sync localStatus with selectedEvent when modal opens or event changes
  React.useEffect(() => {
    setLocalStatus(selectedEvent?.status || "");
  }, [selectedEvent]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Early return after all hooks
  if (!selectedEvent) return null;

  // Get status options based on class status
  const getStatusOptions = () => {
    // If the class status is "Valid for cancellation", show only specific options
    if (selectedEvent.status === "Valid for cancellation" || selectedEvent.status === "Valid for Cancellation") {
      return [
        {
          value: "Completed",
          label: "Completed",
          bgColor: "bg-green-400",
          borderColor: "border-green-500",
        },
        {
          value: "Absent w/ntc counted",
          label: "Absent w/ntc counted",
          bgColor: "bg-blue-400",
          borderColor: "border-blue-500",
        },
        {
          value: "Cancelled",
          label: "Cancelled",
          bgColor: "bg-purple-400",
          borderColor: "border-purple-500",
        },
        {
          value: "Absent w/ntc-not counted",
          label: "Absent w/ntc-not counted",
          bgColor: "bg-orange-400",
          borderColor: "border-orange-500",
        },
        {
          value: "Absent Without Notice",
          label: "Absent Without Notice",
          bgColor: "bg-red-400",
          borderColor: "border-red-500",
        },
      ];
    }
    
    // If the class status is "Free Class" or "FC not consumed", show only specific options (no Completed)
    if (selectedEvent.status === "Free Class" || selectedEvent.status === "FC not consumed") {
      return [
        {
          value: "Absent w/ntc counted",
          label: "Absent w/ntc counted",
          bgColor: "bg-blue-400",
          borderColor: "border-blue-500",
        },
        {
          value: "Cancelled",
          label: "Cancelled",
          bgColor: "bg-purple-400",
          borderColor: "border-purple-500",
        },
        {
          value: "Absent w/ntc-not counted",
          label: "Absent w/ntc-not counted",
          bgColor: "bg-orange-400",
          borderColor: "border-orange-500",
        },
        {
          value: "FC consumed",
          label: "FC consumed",
          bgColor: "bg-pink-400",
          borderColor: "border-pink-400",
        },
        {
          value: "Absent Without Notice",
          label: "Absent Without Notice",
          bgColor: "bg-red-400",
          borderColor: "border-red-500",
        },
      ];
    }
    
    // Default: show all options
    return [
      {
        value: "Completed",
        label: "Completed",
        bgColor: "bg-green-400",
        borderColor: "border-green-500",
      },
      {
        value: "Absent w/ntc counted",
        label: "Absent w/ntc counted",
        bgColor: "bg-blue-400",
        borderColor: "border-blue-500",
      },
      {
        value: "Cancelled",
        label: "Cancelled",
        bgColor: "bg-purple-400",
        borderColor: "border-purple-500",
      },
      {
        value: "Absent w/ntc-not counted",
        label: "Absent w/ntc-not counted",
        bgColor: "bg-orange-400",
        borderColor: "border-orange-500",
      },
      {
        value: "FC consumed",
        label: "FC consumed",
        bgColor: "bg-pink-400",
        borderColor: "border-pink-400",
      },
      {
        value: "Absent Without Notice",
        label: "Absent Without Notice",
        bgColor: "bg-red-400",
        borderColor: "border-red-500",
      },
    ];
  };

  const statusOptions = getStatusOptions();

  // Helper function to get current status color (for display)
  const getCurrentStatusColor = (status) => {
    switch (status) {
      case 'Valid for cancellation':
      case 'Valid for Cancellation':
        return { bgColor: "bg-gray-300", borderColor: "border-gray-300" }; // Exactly matching Legend.jsx
      case 'Free Class':
      case 'FC not consumed':
        return { bgColor: "bg-yellow-400", borderColor: "border-yellow-500" };
      case 'Completed':
        return { bgColor: "bg-green-400", borderColor: "border-green-500" };
      case 'Absent w/ntc counted':
        return { bgColor: "bg-blue-400", borderColor: "border-blue-500" };
      case 'Cancelled':
        return { bgColor: "bg-purple-400", borderColor: "border-purple-500" };
      case 'Absent w/ntc-not counted':
        return { bgColor: "bg-gray-600", borderColor: "border-gray-500" }; // Matching Legend.jsx
      case 'FC consumed':
        return { bgColor: "bg-pink-400", borderColor: "border-pink-400" };
      case 'Absent Without Notice':
        return { bgColor: "bg-red-400", borderColor: "border-red-500" };
      default:
        return { bgColor: "bg-gray-400", borderColor: "border-gray-500" };
    }
  };

  // Helper function to get status information (matching admin modal)
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Valid for cancellation':
      case 'Valid for Cancellation':
        return { 
          label: 'Valid for Cancellation', 
          color: 'bg-gray-300 text-gray-800 border border-gray-300',
          icon: <Clock className="h-4 w-4 text-gray-700" /> 
        };
      case 'Free Class':
      case 'FC not consumed':
        return { 
          label: 'FC not consumed', 
          color: 'bg-yellow-100 text-yellow-900 border border-yellow-200',
          icon: <Clock className="h-4 w-4 text-yellow-700" /> 
        };
      case 'Completed':
        return { 
          label: 'Completed', 
          color: 'bg-green-100 text-green-900 border border-green-200',
          icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> 
        };
      case 'Absent w/ntc counted':
        return { 
          label: 'Absent w/ntc counted', 
          color: 'bg-blue-100 text-blue-900 border border-blue-200', 
          icon: <AlertCircle className="h-4 w-4 text-blue-600" /> 
        };
      case 'Cancelled':
        return { 
          label: 'Cancelled', 
          color: 'bg-purple-100 text-purple-900 border border-purple-200', 
          icon: <XCircle className="h-4 w-4 text-purple-600" /> 
        };
      case 'Absent w/ntc-not counted':
        return { 
          label: 'Absent w/ntc-not counted', 
          color: 'bg-gray-600 text-white border border-gray-500', 
          icon: <AlertCircle className="h-4 w-4 text-gray-300" /> 
        };
      case 'FC consumed':
        return { 
          label: 'FC consumed', 
          color: 'bg-pink-100 text-pink-900 border border-pink-200', 
          icon: <CalendarIcon className="h-4 w-4 text-pink-600" /> 
        };
      case 'Absent Without Notice':
        return { 
          label: 'Absent Without Notice', 
          color: 'bg-red-100 text-red-900 border border-red-200', 
          icon: <AlertCircle className="h-4 w-4 text-red-600" /> 
        };
      default:
        return { 
          label: status || 'Unknown', 
          color: 'bg-gray-100 text-gray-900 border border-gray-200', 
          icon: <CalendarIcon className="h-4 w-4 text-gray-600" /> 
        };
    }
  };

  // Use localStatus for color coding and icon
  const statusInfo = getStatusInfo(localStatus);

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-3 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm sm:max-w-md transform overflow-visible rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="bg-gradient-to-r from-navy-800 to-navy-700 px-3 py-2 sm:px-4">
                  <div className="flex items-center justify-between">
                    <Dialog.Title as="h3" className="text-base font-semibold text-white">
                      Class Details
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md text-navy-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <div className="space-y-4">
                    {/* Student Information Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-100 flex-shrink-0">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-blue-600 font-medium">Student Name</p>
                          <p className="text-blue-900 font-semibold text-sm">
                            {selectedEvent.student_name || selectedEvent.studentName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Class Schedule Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-lg bg-green-100 flex-shrink-0">
                            <CalendarIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-green-600 font-medium">Date</p>
                            <p className="text-green-900 font-semibold text-sm">
                              {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString("en-US", { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              }) : 'Date not available'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-lg bg-green-100 flex-shrink-0">
                            <Clock className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-green-600 font-medium">Time</p>
                            <p className="text-green-900 font-semibold text-sm">
                              {(() => {
                                if (!selectedEvent.time) return 'Time not available';
                                const [hours, minutes] = selectedEvent.time.split(':');
                                const date = new Date();
                                date.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0);
                                return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Class Details Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-100">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-lg bg-purple-100 flex-shrink-0">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-purple-600 font-medium">Class Type</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                (selectedEvent.classType || selectedEvent.class_type) === 'Premium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                (selectedEvent.classType || selectedEvent.class_type) === 'Group' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                'bg-navy-100 text-navy-800 border border-navy-200'
                              }`}>
                                {(selectedEvent.classType || selectedEvent.class_type) === 'Group' ? 'Group Class' : (selectedEvent.classType || selectedEvent.class_type || 'Regular')}
                                {selectedEvent.isGroupClassStudent && <span className="ml-1 text-[9px] bg-orange-200 px-1 rounded">Individual Student</span>}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {(selectedEvent.teacherName || selectedEvent.teacher_name) && (
                          <div className="flex items-start gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-100 flex-shrink-0">
                              <Users className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-purple-600 font-medium">Teacher</p>
                              <p className="text-purple-900 font-semibold text-sm">
                                {selectedEvent.teacherName || selectedEvent.teacher_name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Management Section */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-100">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-lg bg-orange-100 flex-shrink-0">
                            {statusInfo.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-orange-600 font-medium mb-1">Current Status</p>
                            
                            {/* Status Dropdown */}
                            <div className="relative z-10" ref={dropdownRef}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Dropdown button clicked, current open state:', statusDropdownOpen);
                                  setStatusDropdownOpen(!statusDropdownOpen);
                                }}
                                className="w-full pl-2 pr-6 py-2 text-xs border border-orange-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 rounded-md bg-white text-left flex items-center justify-between hover:bg-orange-50 transition-colors"
                              >
                                <div className="flex items-center min-w-0 flex-1">
                                  <span className={`w-3 h-3 ${getCurrentStatusColor(localStatus).bgColor} ${getCurrentStatusColor(localStatus).borderColor} border flex-shrink-0 rounded-sm mr-2`}></span>
                                  <span className="font-medium text-xs truncate">{localStatus || 'Select Status'}</span>
                                </div>
                                <div className="flex-shrink-0 ml-1">
                                  {statusDropdownOpen ? (
                                    <ChevronUp className="h-3 w-3 text-orange-600" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 text-orange-600" />
                                  )}
                                </div>
                              </button>

                              {statusDropdownOpen && (
                                <div className="absolute z-[100] mt-1 w-full min-w-max rounded-md border border-gray-200 bg-white shadow-xl overflow-visible" style={{ zIndex: 9999 }}>
                                  <div className="max-h-48 overflow-y-auto">
                                    <div className="p-1 space-y-0.5">
                                      {statusOptions.map((status) => (
                                        <button
                                          key={status.value}
                                          type="button"
                                          className={`w-full rounded-sm px-2 py-1.5 text-left text-xs transition-all duration-200 flex items-center whitespace-nowrap ${
                                            localStatus === status.value
                                              ? "bg-orange-600 text-white shadow-sm"
                                              : "hover:bg-gray-100 text-gray-700"
                                          }`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setLocalStatus(status.value);
                                            setStatusDropdownOpen(false);
                                          }}
                                        >
                                          <span className={`w-3 h-3 ${status.bgColor} ${status.borderColor} border flex-shrink-0 rounded-sm mr-2`}></span>
                                          <span className="font-medium">{status.label}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-navy-100 flex flex-col sm:flex-row justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 text-xs font-medium text-navy-700 bg-white border border-navy-200 rounded-md hover:bg-navy-50 focus:outline-none focus:ring-1 focus:ring-navy-500"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => onJoinClass && onJoinClass(selectedEvent.id, { ...selectedEvent, status: localStatus })}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DetailsCalendarModal;