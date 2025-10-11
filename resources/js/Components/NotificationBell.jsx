import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import refreshEventManager from '@/utils/refreshEvents';

const NotificationBell = () => {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastCheckTime, setLastCheckTime] = useState(Date.now());
    const [processedNotificationIds, setProcessedNotificationIds] = useState(new Set());
    const [lastRefreshTrigger, setLastRefreshTrigger] = useState(0);
    const [consecutiveRefreshCount, setConsecutiveRefreshCount] = useState(0);
    const dropdownRef = useRef(null);
    const intervalRef = useRef(null);
    const unreadCountRef = useRef(0); // Use ref to avoid stale closure issues

    // Fetch unread count on component mount
    useEffect(() => {
        fetchUnreadCount();
        
        // Set up polling for real-time updates (every 15 seconds to reduce load)
        intervalRef.current = setInterval(() => {
            fetchUnreadCount();
            checkForNewNotifications();
        }, 15000);
        
        // Clean up old processed notification IDs every minute
        const cleanupInterval = setInterval(() => {
            setProcessedNotificationIds(prev => {
                // Clear old IDs every minute to prevent memory buildup
                return new Set();
            });
        }, 60000);
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            clearInterval(cleanupInterval);
        };
    }, []);

    // Focus/blur event listeners for immediate updates when user returns to tab
    useEffect(() => {
        const handleFocus = () => {
            fetchUnreadCount();
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                fetchUnreadCount();
            }
        });

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleFocus);
        };
    }, []);

    const fetchUnreadCount = async () => {
        try {
            if (!loading) {
                setLoading(true);
            }
            const response = await axios.get('/api/notifications/unread-count');
            const newCount = response.data.unread_count || 0;
            const currentCount = unreadCountRef.current;
            
            // Log without console noise, using more concise format
            if (newCount !== currentCount) {
                console.log('Notification count changed:', currentCount, '→', newCount);
            }
            
            // Only trigger refresh if count actually increased and we haven't refreshed very recently
            const now = Date.now();
            const timeSinceLastRefresh = now - lastRefreshTrigger;
            
            // More stringent condition: count must actually increase AND significant time must pass
            if (newCount > currentCount && timeSinceLastRefresh > 10000 && consecutiveRefreshCount < 2) {
                console.log('Notification count increased, triggering calendar refresh:', newCount - currentCount);
                
                // Trigger calendar refresh for real-time updates
                refreshEventManager.triggerRefresh('notification');
                setLastRefreshTrigger(now);
                setConsecutiveRefreshCount(prev => prev + 1);
                
                // Reset consecutive count after 60 seconds
                setTimeout(() => {
                    setConsecutiveRefreshCount(0);
                }, 60000);
            } else if (newCount > currentCount) {
                // Don't log this to reduce console noise
                // console.log('Notification increase detected but skipped due to recent refresh or limit reached');
            }
            
            // Update both state and ref
            setUnreadCount(newCount);
            unreadCountRef.current = newCount;
            setLastCheckTime(Date.now());
        } catch (error) {
            // Only log CSRF errors in debug mode, handle them in bootstrap.js
            if (error.response && error.response.status === 419) {
                // Don't log CSRF errors here, they're handled in bootstrap.js
            } else {
                console.error('Error fetching unread count:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Refresh unread count when opening
            fetchUnreadCount();
        }
    };

    const handleNotificationRead = () => {
        // Refresh unread count when a notification is read
        fetchUnreadCount();
    };

    // Check for new class-related notifications and trigger calendar updates
    const checkForNewNotifications = async () => {
        try {
            // Only check if we haven't triggered a refresh very recently
            const now = Date.now();
            const timeSinceLastRefresh = now - lastRefreshTrigger;
            
            if (timeSinceLastRefresh < 1000) {
                // Skip this check if we refreshed very recently
                return;
            }
            
            // Get recent notifications (last 30 seconds worth)
            const response = await axios.get('/api/notifications');
            const notifications = response.data || [];
            
            // Filter for recent class-related notifications that we haven't processed yet
            const newClassNotifications = notifications.filter(notification => {
                const isClassRelated = [
                    'class_assigned', 
                    'class_updated', 
                    'class_cancelled',
                    'teacher_class_update',
                    'admin_class_update'
                ].includes(notification.type);
                
                // Check if notification is from the last 30 seconds
                const notificationTime = new Date(notification.created_at).getTime();
                const isRecent = (now - notificationTime) <= 30000; // 30 seconds
                
                // Check if we haven't processed this notification yet
                const isUnprocessed = !processedNotificationIds.has(notification.id);
                
                return isClassRelated && isRecent && !notification.is_read && isUnprocessed;
            });
            
            // If we have genuinely new class notifications, trigger calendar refresh
            if (newClassNotifications.length > 0) {
                console.log('Found NEW class-related notifications, triggering calendar refresh:', newClassNotifications.length);
                
                // Mark these notifications as processed
                const newProcessedIds = new Set(processedNotificationIds);
                newClassNotifications.forEach(notification => {
                    newProcessedIds.add(notification.id);
                });
                setProcessedNotificationIds(newProcessedIds);
                setLastRefreshTrigger(now);
                
                // Trigger refresh
                refreshEventManager.triggerRefresh('notification_auto_refresh');
            }
        } catch (error) {
            console.error('Error checking for new notifications:', error);
        }
    };

    // Method to force refresh (can be called externally)
    const forceRefresh = () => {
        // When called externally (from calendar), just fetch the count without triggering calendar refreshes
        fetchUnreadCountSilently();
    };

    const fetchUnreadCountSilently = async () => {
        try {
            if (!loading) {
                setLoading(true);
            }
            const response = await axios.get('/api/notifications/unread-count');
            const newCount = response.data.unread_count || 0;
            
            console.log('Silent notification check - Current:', unreadCountRef.current, 'New:', newCount);
            
            // Update counts without triggering any calendar refreshes
            setUnreadCount(newCount);
            unreadCountRef.current = newCount;
            setLastCheckTime(Date.now());
        } catch (error) {
            console.error('Error fetching unread count silently:', error);
        } finally {
            setLoading(false);
        }
    };

    // Expose refresh method globally for other components to use
    useEffect(() => {
        window.refreshNotifications = forceRefresh;
        return () => {
            delete window.refreshNotifications;
        };
    }, []);

    return (
        <div className="relative z-[99999]" ref={dropdownRef} style={{ zIndex: 99999 }}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 z-[99999]"
                title="Notifications"
                style={{ 
                    zIndex: 99999,
                    color: unreadCount === 0 ? 'rgb(183, 194, 209)' : 'orange'
                }}
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                {loading && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-2 w-2 animate-spin"></span>
                )}
            </button>

            <NotificationDropdown 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)}
                onNotificationRead={handleNotificationRead}
            />
        </div>
    );
};

export default NotificationBell;
