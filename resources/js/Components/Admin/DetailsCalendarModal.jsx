import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar as CalendarIcon, Clock, Users, FileText, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const DetailsCalendarModal = ({
  isOpen,
  onClose,
  event: selectedEvent,
  onStatusChange,
  onNotesSave,
  onJoinClass
}) => {
  if (!selectedEvent) return null;

  // Helper function to get status information
  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled':
        return { 
          label: 'Scheduled', 
          color: 'bg-orange-50 text-orange-800 border border-orange-100', 
          icon: <CalendarIcon className="h-4 w-4 text-orange-600" /> 
        };
      case 'completed':
      case 'Completed (RG)':
      case 'Completed (PRM)':
        return { 
          label: status, 
          color: status.includes('PRM') ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900',
          icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> 
        };
      case 'cancelled':
      case 'Cancelled (RG)':
        return { 
          label: status, 
          color: 'bg-red-100 text-red-900', 
          icon: <XCircle className="h-4 w-4 text-red-600" /> 
        };
      case 'FC not consumed (RG)':
      case 'FC consumed (RG)':
        return {
          label: status,
          color: 'bg-purple-100 text-purple-900',
          icon: <CalendarIcon className="h-4 w-4 text-purple-600" />
        };
      default:
        if (status && status.includes('Absent')) {
          return {
            label: status,
            color: status.includes('w/ntc counted') ? 'bg-yellow-100 text-yellow-900' : 
                  status.includes('w/ntc-not counted') ? 'bg-orange-100 text-orange-900' :
                  'bg-amber-100 text-amber-900',
            icon: <AlertCircle className="h-4 w-4 text-amber-600" />
          };
        }
        return { 
          label: status || 'Unknown', 
          color: 'bg-navy-50 text-navy-800 border border-navy-100', 
          icon: <AlertCircle className="h-4 w-4 text-navy-500" /> 
        };
    }
  };

  const [notes, setNotes] = React.useState(selectedEvent.notes || '');
  const statusInfo = getStatusInfo(selectedEvent.status);

  const handleNotesSave = () => {
    if (onNotesSave && notes !== selectedEvent.notes) {
      onNotesSave(selectedEvent.id, notes);
    }
  };

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
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md sm:max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="bg-gradient-to-r from-navy-800 to-navy-700 px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <Dialog.Title as="h3" className="text-lg font-semibold text-white">
                      {selectedEvent.student_name}
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

                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Date and Time */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-navy-50 flex-shrink-0">
                          <CalendarIcon className="h-5 w-5 text-navy-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-navy-600">Date</p>
                          <p className="text-navy-800 font-medium">
                            {selectedEvent.date.toLocaleDateString("en-US", { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-navy-50 flex-shrink-0">
                          <Clock className="h-5 w-5 text-navy-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-navy-600">Time</p>
                          <p className="text-navy-800 font-medium">
                            {selectedEvent.date.toLocaleTimeString("en-US", { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Class Type and Status */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-navy-50 flex-shrink-0">
                          <Users className="h-5 w-5 text-navy-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-navy-600">Class Type</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                              selectedEvent.class_type === 'Premium' ? 'bg-amber-100 text-amber-800' :
                              selectedEvent.class_type === 'Group' ? 'bg-purple-100 text-purple-800' :
                              'bg-navy-100 text-navy-800'
                            }`}>
                              {selectedEvent.class_type}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-navy-50 flex-shrink-0">
                          {statusInfo.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-navy-600">Status</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Duration and Teacher */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-navy-50 flex-shrink-0">
                          <Clock className="h-5 w-5 text-navy-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-navy-600">Duration</p>
                          <p className="text-navy-800 font-medium">
                            {selectedEvent.duration} minutes
                          </p>
                        </div>
                      </div>
                      
                      {selectedEvent.teacher_name && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-navy-50 flex-shrink-0">
                            <Users className="h-5 w-5 text-navy-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-navy-600">Teacher</p>
                            <p className="text-navy-800 font-medium">
                              {selectedEvent.teacher_name}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-navy-700 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-navy-500" />
                        <span>Notes</span>
                      </h4>
                      <div className="relative">
                        <textarea
                          className="w-full h-24 p-3 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Add notes about this class..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          onBlur={handleNotesSave}
                        />
                        {notes !== (selectedEvent.notes || '') && (
                          <button
                            onClick={handleNotesSave}
                            className="absolute bottom-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600 transition-colors"
                          >
                            Save
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-navy-100 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-navy-700 bg-white border border-navy-200 rounded-lg hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => onJoinClass(selectedEvent.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                      Join Class
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