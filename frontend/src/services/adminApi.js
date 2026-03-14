import axios from 'axios';

// IMPORTANT: Use environment variable for API URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔧 Admin API Base URL:', API_BASE); // Add for debugging

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
            // Unauthorized - redirect to admin login
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            // Redirect to admin login page
            window.location.href = '/admin/secure-portal';
        }
        return Promise.reject(error);
    }
);

const adminApi = {
    // ========== DASHBOARD ==========
    getDashboardStats: async () => {
        try {
            console.log('📊 Fetching admin dashboard stats...');
            const response = await api.get('/admin/dashboard/stats');
            console.log('✅ Dashboard stats:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Get recent orders for dashboard
    getRecentOrders: async (limit = 10) => {
        try {
            console.log('📦 Fetching recent orders...');
            const response = await api.get(`/admin/orders/recent?limit=${limit}`);
            console.log('✅ Recent orders:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching recent orders:', error);
            return [];
        }
    },

    // Get pending products for dashboard
    getPendingProducts: async (limit = 5) => {
        try {
            console.log('🔄 Fetching pending products...');
            const response = await api.get(`/admin/products/pending?limit=${limit}`);
            console.log('✅ Pending products:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching pending products:', error);
            return [];
        }
    },

    // ========== USER MANAGEMENT ==========
    getUsers: async (role = 'all', search = '') => {
        try {
            const response = await api.get(`/admin/users?role=${role}&search=${search}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    getUserDetails: async (userId) => {
        try {
            const response = await api.get(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user details:', error);
            throw error;
        }
    },

    updateUser: async (userId, userData) => {
        try {
            const response = await api.put(`/admin/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    toggleUserStatus: async (userId, isVerified) => {
        try {
            const response = await api.put(`/admin/users/${userId}/status`, { is_verified: isVerified });
            return response.data;
        } catch (error) {
            console.error('Error toggling user status:', error);
            throw error;
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // ========== SELLER MANAGEMENT ==========
    getPendingSellers: async () => {
        try {
            const response = await api.get('/admin/sellers/pending');
            return response.data;
        } catch (error) {
            console.error('Error fetching pending sellers:', error);
            throw error;
        }
    },

    getAllSellers: async () => {
        try {
            const response = await api.get('/admin/sellers');
            return response.data;
        } catch (error) {
            console.error('Error fetching all sellers:', error);
            throw error;
        }
    },

    getSellerDetails: async (sellerId) => {
        try {
            const response = await api.get(`/admin/sellers/${sellerId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching seller details:', error);
            throw error;
        }
    },

    approveSeller: async (sellerId, approve) => {
        try {
            const response = await api.put(`/admin/sellers/${sellerId}/approve`, { approve });
            return response.data;
        } catch (error) {
            console.error('Error approving seller:', error);
            throw error;
        }
    },

    updateSeller: async (sellerId, sellerData) => {
        try {
            const response = await api.put(`/admin/sellers/${sellerId}`, sellerData);
            return response.data;
        } catch (error) {
            console.error('Error updating seller:', error);
            throw error;
        }
    },

    // ========== CATEGORY MANAGEMENT WITH IMAGE UPLOAD ==========
    getCategories: async () => {
        try {
            const response = await api.get('/admin/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    getCategoryDetails: async (categoryId) => {
        try {
            const response = await api.get(`/admin/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching category details:', error);
            throw error;
        }
    },

    addCategory: async (categoryData) => {
        try {
            const isFormData = categoryData instanceof FormData;
            const response = await api.post('/admin/categories', categoryData, {
                headers: isFormData ? { 
                    'Content-Type': 'multipart/form-data' 
                } : {}
            });
            return response.data;
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    },

    updateCategory: async (categoryId, categoryData) => {
        try {
            const isFormData = categoryData instanceof FormData;
            const response = await api.put(`/admin/categories/${categoryId}`, categoryData, {
                headers: isFormData ? { 
                    'Content-Type': 'multipart/form-data' 
                } : {}
            });
            return response.data;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },

    deleteCategory: async (categoryId) => {
        try {
            const response = await api.delete(`/admin/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    },

    toggleCategoryStatus: async (categoryId, isActive) => {
        try {
            const response = await api.put(`/admin/categories/${categoryId}/toggle`, { is_active: isActive });
            return response.data;
        } catch (error) {
            console.error('Error toggling category status:', error);
            throw error;
        }
    },

    // ========== PRODUCT MANAGEMENT ==========
    getAllProducts: async () => {
        try {
            const response = await api.get('/admin/products');
            return response.data;
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    },

    getProductDetails: async (productId) => {
        try {
            const response = await api.get(`/admin/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product details:', error);
            throw error;
        }
    },

    approveProduct: async (productId, approve) => {
        try {
            const response = await api.put(`/admin/products/${productId}/approve`, { approve });
            return response.data;
        } catch (error) {
            console.error('Error approving product:', error);
            throw error;
        }
    },

    updateProduct: async (productId, productData) => {
        try {
            const response = await api.put(`/admin/products/${productId}`, productData);
            return response.data;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    deleteProduct: async (productId) => {
        try {
            const response = await api.delete(`/admin/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    featureProduct: async (productId, feature) => {
        try {
            const response = await api.put(`/admin/products/${productId}/feature`, { feature });
            return response.data;
        } catch (error) {
            console.error('Error featuring product:', error);
            throw error;
        }
    },

    // ========== ORDER MANAGEMENT ==========
    getAllOrders: async (status = 'all') => {
        try {
            const response = await api.get(`/admin/orders?status=${status}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    getOrderDetails: async (orderId) => {
        try {
            const response = await api.get(`/admin/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    },

    updateOrderStatus: async (orderId, status, trackingNumber = '') => {
        try {
            const response = await api.put(`/admin/orders/${orderId}/status`, {
                status,
                tracking_number: trackingNumber
            });
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    },

    updatePaymentStatus: async (orderId, paymentStatus) => {
        try {
            const response = await api.put(`/admin/orders/${orderId}/payment`, {
                payment_status: paymentStatus
            });
            return response.data;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    },

    // ========== REPORTS & ANALYTICS ==========
    getSalesReport: async (startDate, endDate, groupBy = 'day') => {
        try {
            const response = await api.get('/admin/reports/sales', {
                params: { 
                    start_date: startDate, 
                    end_date: endDate, 
                    group_by: groupBy 
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching sales report:', error);
            throw error;
        }
    },

    getTopProducts: async (limit = 10) => {
        try {
            const response = await api.get(`/admin/reports/top-products?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching top products:', error);
            throw error;
        }
    },

    getTopSellers: async (limit = 10) => {
        try {
            const response = await api.get(`/admin/reports/top-sellers?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching top sellers:', error);
            throw error;
        }
    },

    getRevenueSummary: async (period = 'monthly') => {
        try {
            const response = await api.get('/admin/reports/revenue', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching revenue summary:', error);
            throw error;
        }
    },

    // ========== PAYMENT MANAGEMENT ==========
    getTransactions: async () => {
        try {
            const response = await api.get('/admin/transactions');
            return response.data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    getTransactionDetails: async (transactionId) => {
        try {
            const response = await api.get(`/admin/transactions/${transactionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            throw error;
        }
    },

    // ========== SETTINGS ==========
    getSettings: async () => {
        try {
            const response = await api.get('/admin/settings');
            return response.data;
        } catch (error) {
            console.error('Error fetching settings:', error);
            throw error;
        }
    },

    updateSettings: async (settingsData) => {
        try {
            const response = await api.put('/admin/settings', settingsData);
            return response.data;
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    },

    // ========== NOTIFICATIONS ==========
    getNotifications: async () => {
        try {
            const response = await api.get('/admin/notifications');
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    markNotificationRead: async (notificationId) => {
        try {
            const response = await api.put(`/admin/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // ========== BACKUP ==========
    createBackup: async () => {
        try {
            const response = await api.post('/admin/backup');
            return response.data;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    },

    getBackups: async () => {
        try {
            const response = await api.get('/admin/backups');
            return response.data;
        } catch (error) {
            console.error('Error fetching backups:', error);
            throw error;
        }
    },

    restoreBackup: async (backupId) => {
        try {
            const response = await api.post(`/admin/backups/${backupId}/restore`);
            return response.data;
        } catch (error) {
            console.error('Error restoring backup:', error);
            throw error;
        }
    },

    // ========== EXPORT DATA ==========
    exportData: async (type, format = 'csv') => {
        try {
            const response = await api.get(`/admin/export/${type}?format=${format}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    },

    // ========== CATEGORY IMAGE UPLOAD HELPER ==========
    createCategoryFormData: (categoryData, imageFile) => {
        const formData = new FormData();
        formData.append('name', categoryData.name);
        formData.append('description', categoryData.description || '');
        
        if (imageFile) {
            formData.append('categoryImage', imageFile);
        }
        
        return formData;
    },

    // ========== CATEGORY BULK OPERATIONS ==========
    bulkDeleteCategories: async (categoryIds) => {
        try {
            const response = await api.post('/admin/categories/bulk-delete', { ids: categoryIds });
            return response.data;
        } catch (error) {
            console.error('Error bulk deleting categories:', error);
            throw error;
        }
    },

    bulkToggleCategories: async (categoryIds, isActive) => {
        try {
            const response = await api.post('/admin/categories/bulk-toggle', { 
                ids: categoryIds, 
                is_active: isActive 
            });
            return response.data;
        } catch (error) {
            console.error('Error bulk toggling categories:', error);
            throw error;
        }
    }
};

export default adminApi;