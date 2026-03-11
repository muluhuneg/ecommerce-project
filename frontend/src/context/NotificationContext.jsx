import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationApi from '../services/notificationApi';

// Create context
const NotificationContext = createContext();

// Custom hook
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}

// Provider component
export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Fetch real notifications from backend when user logs in
    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
            
            // Set up polling for new notifications (every 30 seconds)
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, 30000);
            
            return () => clearInterval(interval);
        } else {
            // Clear notifications when user logs out
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    const fetchNotifications = async (page = 1) => {
        if (!user) return;
        
        try {
            setLoading(true);
            const data = await notificationApi.getNotifications(page);
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        if (!user) return;
        
        try {
            const data = await notificationApi.getUnreadCount();
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (id) => {
        if (!user) return;
        
        try {
            const data = await notificationApi.markAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(data.unreadCount || 0);
            return data;
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => 
                prev.map(n => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const archiveNotification = async (id) => {
        if (!user) return;
        
        try {
            await notificationApi.archiveNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            fetchUnreadCount();
        } catch (error) {
            console.error('Error archiving notification:', error);
        }
    };

    const deleteNotification = async (id) => {
        if (!user) return;
        
        try {
            await notificationApi.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const addNotification = (notification) => {
        if (!user) return;
        
        setNotifications(prev => [notification, ...prev]);
        if (!notification.is_read) {
            setUnreadCount(prev => prev + 1);
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        showDropdown,
        setShowDropdown,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        archiveNotification,
        deleteNotification,
        addNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}