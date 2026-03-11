import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth header
const axiosInstance = () => {
    const token = localStorage.getItem('token');
    return axios.create({
        baseURL: API_URL,
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    });
};

// Order API service
const orderApi = {
    // Save pending order before payment
    savePendingOrder: async (orderData) => {
        try {
            console.log('📦 Saving pending order...', orderData);
            const response = await axiosInstance().post('/orders/save-pending', orderData);
            console.log('✅ Pending order saved:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error saving pending order:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to save order' };
        }
    },

    // Create COD order directly
    createCODOrder: async (orderData) => {
        try {
            console.log('📦 Creating COD order...', orderData);
            const response = await axiosInstance().post('/orders/create-cod', orderData);
            console.log('✅ COD order created:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating COD order:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to create order' };
        }
    },

    // ============================================
    // NEW: Manual payment success (for testing)
    // Call this to simulate successful payment without Chapa
    // ============================================
    manualPaymentSuccess: async (tx_ref) => {
        try {
            console.log('💰 Manual payment success for tx_ref:', tx_ref);
            const response = await axiosInstance().get(`/payment/manual-success/${tx_ref}`);
            console.log('✅ Order created via manual payment:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error in manual payment:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to process manual payment' };
        }
    },

    // Check order status by tx_ref (for returning from payment)
    checkOrderStatus: async (tx_ref) => {
        try {
            console.log('🔍 Checking order status for tx_ref:', tx_ref);
            const response = await axiosInstance().get(`/orders/status/${tx_ref}`);
            console.log('✅ Order status check:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error checking order status:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to check order status' };
        }
    },

    // Get user's orders
    getMyOrders: async () => {
        try {
            console.log('📦 Fetching user orders...');
            const response = await axiosInstance().get('/orders/my-orders');
            console.log('✅ Orders fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching orders:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to fetch orders' };
        }
    },

    // Get single order details
    getOrderById: async (orderId) => {
        try {
            console.log('🔍 Fetching order details for ID:', orderId);
            const response = await axiosInstance().get(`/orders/${orderId}`);
            console.log('✅ Order details:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching order details:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to fetch order details' };
        }
    },

    // Cancel order
    cancelOrder: async (orderId) => {
        try {
            console.log('🔍 Cancelling order:', orderId);
            const response = await axiosInstance().put(`/orders/${orderId}/cancel`);
            console.log('✅ Order cancelled:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error cancelling order:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to cancel order' };
        }
    },

    // Request return
    requestReturn: async (orderId, returnData) => {
        try {
            console.log('🔍 Requesting return for order:', orderId, returnData);
            const response = await axiosInstance().post(`/orders/${orderId}/return`, returnData);
            console.log('✅ Return requested:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error requesting return:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to request return' };
        }
    },

    // Reorder previous order
    reorder: async (orderId) => {
        try {
            console.log('🔍 Reordering order:', orderId);
            const response = await axiosInstance().post(`/orders/${orderId}/reorder`);
            console.log('✅ Reorder successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error reordering:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to reorder' };
        }
    },

    // Download invoice
    downloadInvoice: async (orderId) => {
        try {
            console.log('🔍 Downloading invoice for order:', orderId);
            const response = await axiosInstance().get(`/orders/${orderId}/invoice`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.html`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            console.log('✅ Invoice downloaded');
            return { success: true };
        } catch (error) {
            console.error('❌ Error downloading invoice:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to download invoice' };
        }
    },

    // Track order by tracking number
    trackOrder: async (trackingNumber) => {
        try {
            console.log('🔍 Tracking order:', trackingNumber);
            const response = await axiosInstance().get(`/orders/track/${trackingNumber}`);
            console.log('✅ Tracking info:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error tracking order:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to track order' };
        }
    },

    // Get order statistics
    getOrderStatistics: async () => {
        try {
            console.log('📊 Fetching order statistics...');
            const response = await axiosInstance().get('/orders/statistics/summary');
            console.log('✅ Statistics:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching statistics:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to fetch statistics' };
        }
    },

    // Rate order items
    rateOrder: async (orderId, ratings) => {
        try {
            console.log('⭐ Rating order:', orderId, ratings);
            const response = await axiosInstance().post(`/orders/${orderId}/rate`, { ratings });
            console.log('✅ Ratings submitted:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error rating order:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Failed to submit ratings' };
        }
    },

    // Clear pending order data from localStorage
    clearPendingOrder: () => {
        localStorage.removeItem('pending_tx_ref');
        localStorage.removeItem('pending_order_data');
        console.log('🧹 Cleared pending order data from localStorage');
    },

    // Get pending order data from localStorage
    getPendingOrder: () => {
        const tx_ref = localStorage.getItem('pending_tx_ref');
        const orderData = localStorage.getItem('pending_order_data');
        
        if (tx_ref && orderData) {
            return {
                tx_ref,
                orderData: JSON.parse(orderData)
            };
        }
        return null;
    }
};

export default orderApi;