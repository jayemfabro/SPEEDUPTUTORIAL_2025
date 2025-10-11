import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, Clock, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import axios from 'axios';

const NotificationDropdown = ({ isOpen, onClose, onNotificationRead }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

    // Get the position of the notification bell for portal positioning
    useEffect(() => {
        if (isOpen) {
            const bellElement = document.querySelector('[title="Notifications"]');
            if (bellElement) {
                const rect = bellElement.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 8,
                    right: window.innerWidth - rect.right
                });
            }
        }
    }, [isOpen]);

    // Handle clicking outside to close dropdown
    useEffect(() => {
        if (isOpen) {
            const handleClickOutside = (event) => {
                const bellElement = document.querySelector('[title="Notifications"]');
                const dropdownElement = document.querySelector('[data-notification-dropdown]');
                
                if (bellElement && dropdownElement) {
                    if (!bellElement.contains(event.target) && !dropdownElement.contains(event.target)) {
                        onClose();
                    }
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    // Fetch notifications when component mounts or opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/notifications');
            setNotifications(response.data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications');
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/api/notifications/${notificationId}/read`);
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, is_read: true, read_at: new Date().toISOString() }
                        : notification
                )
            );
            // Notify parent component to refresh unread count
            if (onNotificationRead) {
                onNotificationRead();
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/api/notifications/read-all');
            setNotifications(prev => 
                prev.map(notification => ({
                    ...notification,
                    is_read: true,
                    read_at: new Date().toISOString()
                }))
            );
            // Notify parent component to refresh unread count
            if (onNotificationRead) {
                onNotificationRead();
            }
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`/api/notifications/${notificationId}`);
            setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
            );
            // Notify parent component to refresh unread count if deleted notification was unread
            if (onNotificationRead) {
                onNotificationRead();
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <Check className="w-4 h-4 text-green-500" />;
            case 'warning':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'error':
                return <X className="w-4 h-4 text-red-500" />;
            default:
                return <Bell className="w-4 h-4 text-blue-500" />;
        }
    };

    const unreadCount = notifications ? notifications.filter(n => !n.is_read).length : 0;

    if (!isOpen) return null;

    const dropdownContent = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[99999]"
                style={{ 
                    top: dropdownPosition.top,
                    right: dropdownPosition.right,
                    zIndex: 99999 
                }}
                data-notification-dropdown
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notifications
                    </h3>
                    <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span>Mark all read</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2">Loading notifications...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500">
                            <p>{error}</p>
                            <button
                                onClick={fetchNotifications}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                                Try again
                            </button>
                        </div>
                    ) : !notifications || notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">No notifications yet</p>
                            <p className="text-sm">When you get notifications, they'll show up here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                        !notification.is_read ? '' : ''
                                    }`}
                                    style={{
                                        backgroundColor: !notification.is_read ? '#D0D9E8' : 'transparent'
                                    }}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${
                                                        !notification.is_read 
                                                            ? 'text-gray-900 dark:text-white' 
                                                            : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className={`text-sm mt-1 ${
                                                        !notification.is_read
                                                            ? 'text-gray-700 dark:text-gray-300'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        {notification.time_ago}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-1 ml-2">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                                        title="Delete notification"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications && notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                        <button
                            onClick={fetchNotifications}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            Refresh notifications
                        </button>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );

    // Use portal to render dropdown at body level for proper z-index
    return createPortal(dropdownContent, document.body);
};

export default NotificationDropdown;
