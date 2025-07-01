import React from 'react';
import { 
  X, Calendar as CalendarIcon, Clock, Users, FileText, User, Gem, 
  Zap, ZapOff, CheckCircle, AlertCircle, CalendarX, XCircle
} from 'lucide-react';
import { Transition } from '@headlessui/react';

const statusOptions = [
  { value: 'FC not consumed (RG)', label: 'FC not consumed (RG)', icon: Zap, bgColor: 'bg-purple-100', textColor: 'text-purple-900' },
  { value: 'FC consumed (RG)', label: 'FC consumed (RG)', icon: ZapOff, bgColor: 'bg-purple-200', textColor: 'text-purple-900' },
  { value: 'Completed (RG)', label: 'Completed (RG)', icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-900' },
  { value: 'Completed (PRM)', label: 'Completed (PRM)', icon: CheckCircle, bgColor: 'bg-blue-100', textColor: 'text-blue-900' },
  { value: 'Absent w/ntc counted (RG)', label: 'Absent w/ntc counted (RG)', icon: Clock, bgColor: 'bg-yellow-100', textColor: 'text-yellow-900' },
  { value: 'Absent w/o ntc counted (RG)', label: 'Absent w/o ntc counted (RG)', icon: AlertCircle, bgColor: 'bg-amber-100', textColor: 'text-amber-900' },
  { value: 'Absent w/ntc-not counted (RG)', label: 'Absent w/ntc-not counted (RG)', icon: CalendarX, bgColor: 'bg-orange-100', textColor: 'text-orange-900' },
  { value: 'Cancelled (RG)', label: 'Cancelled (RG)', icon: XCircle, bgColor: 'bg-red-100', textColor: 'text-red-900' }
];

const classTypeOptions = [
  { value: 'Regular', label: 'Regular Class', icon: User, bgColor: 'bg-blue-100', textColor: 'text-blue-900' },
  { value: 'Premium', label: 'Premium Class', icon: Gem, bgColor: 'bg-purple-100', textColor: 'text-purple-900' },
  { value: 'Group', label: 'Group Class', icon: Users, bgColor: 'bg-green-100', textColor: 'text-green-900' }
];

const DetailsCalendarModal = ({ isOpen, onClose, event }) => {
  if (!event) return null;

  const getStatusOption = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option || { bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: XCircle };
  };
  
  const getClassTypeOption = (type) => {
    const option = classTypeOptions.find(opt => opt.value === type);
    return option || { bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: User };
  };

  const statusInfo = getStatusOption(event?.status || '');
  const classTypeInfo = getClassTypeOption(event?.class_type || 'Regular');
  const isGroupClass = event?.class_type === 'Group';

  const formatDate = (dateString) => {
    try {
      const date = dateString ? new Date(dateString) : new Date();
      return date.toLocaleDateString("en-US", { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };
  
  const formatTime = (timeString) => {
    try {
      if (!timeString) return 'Time not available';
      
      if (timeString instanceof Date) {
        return timeString.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      if (typeof timeString === 'string' && timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      return 'Invalid time';
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Time not available';
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
          </Transition.Child>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-gradient-to-r from-navy-700 to-navy-800 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-white">Class Details</h3>
                <button
                  onClick={onClose}
                  className="bg-navy-600 rounded-full p-1 text-gray-300 hover:text-white focus:outline-none transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="space-y-6">
                  {/* Student Name and Class Info */}
                  <div className="bg-navy-50 rounded-lg p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-navy-800">{event.student_name}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${classTypeInfo.bgColor} ${classTypeInfo.textColor}`}>
                          {React.createElement(classTypeInfo.icon, { className: 'h-3.5 w-3.5 mr-1.5' })}
                          {classTypeInfo.label}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                        {React.createElement(statusInfo.icon, { className: 'h-3.5 w-3.5 mr-1.5' })}
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      {/* Date */}
                      <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 text-navy-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-navy-500">Date</p>
                          <p className="text-sm font-medium text-navy-800">
                            {formatDate(event?.date)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Time */}
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-navy-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-navy-500">Time</p>
                          <p className="text-sm font-medium text-navy-800">
                            {formatTime(event?.time || event?.date)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Duration */}
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-navy-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-navy-500">Duration</p>
                          <p className="text-sm font-medium text-navy-800">
                            {event?.duration ? `${event.duration} minutes` : 'Duration not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 sm:px-6 flex justify-end rounded-b-lg space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </div>
    </Transition>
  );
};

export default DetailsCalendarModal;