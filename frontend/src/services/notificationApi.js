import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const notificationApi = {
    // Get notifications with filters
    getNotifications: async (page = 1, limit = 20, filters = {}) => {
        try {
            const params = new URLSearchParams({
                page,
                limit,
                ...filters
            });
            const response = await axios.get(`${API_BASE}/notifications?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // Get unread count
    getUnreadCount: async () => {
        try {
            const response = await axios.get(`${API_BASE}/notifications/unread-count`);
            return response.data;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    },

    // Get notification by ID
    getNotificationById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE}/notifications/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notification:', error);
            throw error;
        }
    },

    // Mark notification as read
    markAsRead: async (id) => {
        try {
            const response = await axios.put(`${API_BASE}/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            const response = await axios.put(`${API_BASE}/notifications/read-all`);
            return response.data;
        } catch (error) {
            console.error('Error marking all as read:', error);
            throw error;
        }
    },

    // Archive notification
    archiveNotification: async (id) => {
        try {
            const response = await axios.put(`${API_BASE}/notifications/${id}/archive`);
            return response.data;
        } catch (error) {
            console.error('Error archiving notification:', error);
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE}/notifications/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },

    // Get notification preferences
    getPreferences: async () => {
        try {
            const response = await axios.get(`${API_BASE}/notifications/preferences`);
            return response.data;
        } catch (error) {
            console.error('Error fetching preferences:', error);
            throw error;
        }
    },

    // Update notification preferences
    updatePreferences: async (preferences) => {
        try {
            const response = await axios.put(`${API_BASE}/notifications/preferences`, preferences);
            return response.data;
        } catch (error) {
            console.error('Error updating preferences:', error);
            throw error;
        }
    }
};

export default notificationApi;