import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const paymentApi = {
    initializePayment: async (orderData) => {
        try {
            const response = await axios.post(`${API_BASE}/payment/initialize`, orderData);
            return response.data;
        } catch (error) {
            console.error('❌ paymentApi.initializePayment error:', error);

            if (error.code === 'ERR_NETWORK' || !error.response) {
                throw new Error('Network error: Unable to reach the payment server. Please check your internet connection or server status.');
            }

            const message = error.response?.data?.message || `Payment initialization failed (${error.response?.status})`;
            throw new Error(message);
        }
    },

    getTransactionStatus: async (txRef) => {
        try {
            const response = await axios.get(`${API_BASE}/payment/status/${txRef}`);
            return response.data;
        } catch (error) {
            console.error('❌ paymentApi.getTransactionStatus error:', error);

            if (error.code === 'ERR_NETWORK' || !error.response) {
                throw new Error('Network error: Unable to reach the payment server. Please check your internet connection or server status.');
            }

            const message = error.response?.data?.message || `Failed to get payment status (${error.response?.status})`;
            throw new Error(message);
        }
    }
};

export default paymentApi;