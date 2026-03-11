import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const sellerApi = {
    // ========== DASHBOARD ==========
    getDashboardStats: async () => {
        try {
            const response = await api.get('/seller/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    getStatistics: async () => {
        try {
            const response = await api.get('/seller/statistics');
            return response.data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    },

    // ========== PRODUCT MANAGEMENT ==========
    getProducts: async () => {
        try {
            const response = await api.get('/seller/products');
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    getProductDetails: async (productId) => {
        try {
            const response = await api.get(`/seller/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product details:', error);
            throw error;
        }
    },

    // Add product with image upload
    addProduct: async (productData) => {
        try {
            // For FormData, don't set Content-Type header (browser will set it with boundary)
            const response = await api.post('/seller/products', productData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    },

    // Add multiple product images
    addProductImages: async (productId, imagesData) => {
        try {
            const response = await api.post(`/seller/products/${productId}/images`, imagesData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    },

    // Get product images
    getProductImages: async (productId) => {
        try {
            const response = await api.get(`/seller/products/${productId}/images`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product images:', error);
            throw error;
        }
    },

    // Delete product image
    deleteProductImage: async (productId, imageId) => {
        try {
            const response = await api.delete(`/seller/products/${productId}/images/${imageId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    },

    // Set primary image
    setPrimaryImage: async (productId, imageId) => {
        try {
            const response = await api.put(`/seller/products/${productId}/images/${imageId}/primary`);
            return response.data;
        } catch (error) {
            console.error('Error setting primary image:', error);
            throw error;
        }
    },

    // Update product with optional image
    updateProduct: async (id, productData) => {
        try {
            const isFormData = productData instanceof FormData;
            const response = await api.put(`/seller/products/${id}`, productData, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
            });
            return response.data;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/seller/products/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    // ========== CATEGORY MANAGEMENT ==========
    getCategories: async () => {
        try {
            console.log('Fetching categories from:', `${API_BASE}/categories`);
            const response = await api.get('/categories');
            console.log('Categories response:', response.data);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error fetching categories:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            return [];
        }
    },

    // ========== ORDER MANAGEMENT ==========
    getOrders: async () => {
        try {
            const response = await api.get('/seller/orders');
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    getOrderDetails: async (orderId) => {
        try {
            const response = await api.get(`/seller/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    },

    updateOrderStatus: async (id, status, trackingNumber = '', notes = '') => {
        try {
            const response = await api.put(`/seller/orders/${id}/status`, {
                status,
                tracking_number: trackingNumber,
                notes
            });
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    },

    getOrderStatistics: async () => {
        try {
            const response = await api.get('/seller/orders/statistics/summary');
            return response.data;
        } catch (error) {
            console.error('Error fetching order statistics:', error);
            throw error;
        }
    },

    // ========== EARNINGS & WALLET ==========
    getEarnings: async () => {
        try {
            const response = await api.get('/seller/earnings');
            return response.data;
        } catch (error) {
            console.error('Error fetching earnings:', error);
            throw error;
        }
    },

    getEarningsSummary: async () => {
        try {
            const response = await api.get('/seller/earnings/summary');
            return response.data;
        } catch (error) {
            console.error('Error fetching earnings summary:', error);
            throw error;
        }
    },

    getWalletTransactions: async () => {
        try {
            const response = await api.get('/seller/wallet/transactions');
            return response.data;
        } catch (error) {
            console.error('Error fetching wallet transactions:', error);
            throw error;
        }
    },

    requestWithdrawal: async (amount) => {
        try {
            const response = await api.post('/seller/wallet/withdraw', { amount });
            return response.data;
        } catch (error) {
            console.error('Error requesting withdrawal:', error);
            throw error;
        }
    },

    cancelWithdrawal: async (transactionId) => {
        try {
            const response = await api.post(`/seller/wallet/withdraw/${transactionId}/cancel`);
            return response.data;
        } catch (error) {
            console.error('Error cancelling withdrawal:', error);
            throw error;
        }
    },

    getWithdrawalHistory: async () => {
        try {
            const response = await api.get('/seller/wallet/withdrawals');
            return response.data;
        } catch (error) {
            console.error('Error fetching withdrawal history:', error);
            throw error;
        }
    },

    // ========== PROFILE MANAGEMENT ==========
    getProfile: async () => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    getSellerProfile: async () => {
        try {
            const response = await api.get('/seller/profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching seller profile:', error);
            throw error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    updateSellerInfo: async (sellerData) => {
        try {
            const response = await api.put('/seller/profile', sellerData);
            return response.data;
        } catch (error) {
            console.error('Error updating seller info:', error);
            throw error;
        }
    },

    // ===== FIXED: Added uploadProfileImage function (alias for updateProfileImage) =====
    uploadProfileImage: async (formData) => {
        try {
            const response = await api.post('/seller/profile/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading profile image:', error);
            throw error;
        }
    },

    updateProfileImage: async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append('profileImage', imageFile);
            
            const response = await api.post('/seller/profile/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating profile image:', error);
            throw error;
        }
    },

    // ========== INVENTORY MANAGEMENT ==========
    getLowStockProducts: async () => {
        try {
            const response = await api.get('/seller/inventory/low-stock');
            return response.data;
        } catch (error) {
            console.error('Error fetching low stock products:', error);
            throw error;
        }
    },

    updateStock: async (productId, stock) => {
        try {
            const response = await api.put(`/seller/inventory/${productId}/stock`, { stock });
            return response.data;
        } catch (error) {
            console.error('Error updating stock:', error);
            throw error;
        }
    },

    getInventoryLogs: async () => {
        try {
            const response = await api.get('/seller/inventory/logs');
            return response.data;
        } catch (error) {
            console.error('Error fetching inventory logs:', error);
            throw error;
        }
    },

    // ========== REVIEWS MANAGEMENT ==========
    getProductReviews: async () => {
        try {
            const response = await api.get('/seller/reviews');
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    },

    replyToReview: async (reviewId, reply) => {
        try {
            const response = await api.post(`/seller/reviews/${reviewId}/reply`, { reply });
            return response.data;
        } catch (error) {
            console.error('Error replying to review:', error);
            throw error;
        }
    },

    // ========== REPORTS ==========
    getSalesReport: async (startDate, endDate, groupBy = 'day') => {
        try {
            const response = await api.get('/seller/reports/sales', {
                params: { start_date: startDate, end_date: endDate, group_by: groupBy }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching sales report:', error);
            throw error;
        }
    },

    getProductPerformanceReport: async () => {
        try {
            const response = await api.get('/seller/reports/products');
            return response.data;
        } catch (error) {
            console.error('Error fetching product performance:', error);
            throw error;
        }
    },

    // ========== NOTIFICATIONS ==========
    getNotifications: async () => {
        try {
            const response = await api.get('/seller/notifications');
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    getUnreadNotificationCount: async () => {
        try {
            const response = await api.get('/seller/notifications/unread-count');
            return response.data.count;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    },

    markNotificationAsRead: async (notificationId) => {
        try {
            const response = await api.put(`/seller/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    markAllNotificationsAsRead: async () => {
        try {
            const response = await api.put('/seller/notifications/read-all');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    deleteNotification: async (notificationId) => {
        try {
            const response = await api.delete(`/seller/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};

export default sellerApi;