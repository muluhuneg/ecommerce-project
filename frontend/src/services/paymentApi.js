import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const paymentApi = {
    initializePayment: async (orderData) => {
        const response = await axios.post(`${API_BASE}/payment/initialize`, orderData);
        return response.data;
    },

    getTransactionStatus: async (txRef) => {
        const response = await axios.get(`${API_BASE}/payment/status/${txRef}`);
        return response.data;
    }
};

export default paymentApi;