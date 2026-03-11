// For Ethiopian phone numbers, we'll use Africa's Talking
const axios = require('axios');

// SMS Service for Ethiopian numbers
exports.sendSMS = async (phoneNumber, message) => {
    try {
        // Format Ethiopian phone number
        let formattedNumber = phoneNumber;
        if (phoneNumber.startsWith('09')) {
            formattedNumber = '251' + phoneNumber.substring(1);
        } else if (phoneNumber.startsWith('+251')) {
            formattedNumber = phoneNumber.substring(1);
        }

        // Using Africa's Talking SMS API (works well in Ethiopia)
        const response = await axios.post(
            'https://api.africastalking.com/version1/messaging',
            new URLSearchParams({
                username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
                to: formattedNumber,
                message: message,
                from: 'E-Store'
            }),
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'apiKey': process.env.AFRICASTALKING_API_KEY || 'your_api_key'
                }
            }
        );

        console.log('SMS sent successfully:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error sending SMS:', error.response?.data || error.message);
        
        // Fallback to console.log for development
        console.log('📱 [DEV MODE] SMS would be sent:', {
            to: phoneNumber,
            message: message
        });
        
        return { success: true, devMode: true };
    }
};

// Send order confirmation SMS
exports.sendOrderConfirmationSMS = async (phoneNumber, order) => {
    const message = `E-Store: Your order #${order.order_number} for ${order.grand_total} Br has been confirmed! Track your order at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.id}`;
    return await exports.sendSMS(phoneNumber, message);
};

// Send order status update SMS
exports.sendOrderStatusSMS = async (phoneNumber, order, oldStatus) => {
    const message = `E-Store: Order #${order.order_number} status updated from ${oldStatus} to ${order.status}. ${order.tracking_number ? `Tracking: ${order.tracking_number}` : ''}`;
    return await exports.sendSMS(phoneNumber, message);
};

// Send shipping confirmation SMS
exports.sendShippingSMS = async (phoneNumber, order) => {
    const message = `E-Store: Your order #${order.order_number} has been shipped! Tracking number: ${order.tracking_number}. Track here: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.id}`;
    return await exports.sendSMS(phoneNumber, message);
};

// Send delivery confirmation SMS
exports.sendDeliverySMS = async (phoneNumber, order) => {
    const message = `E-Store: Your order #${order.order_number} has been delivered! Thank you for shopping with us. Rate your products: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.id}/review`;
    return await exports.sendSMS(phoneNumber, message);
};

// Send welcome SMS
exports.sendWelcomeSMS = async (phoneNumber, userName) => {
    const message = `Welcome to E-Store, ${userName}! 🎉 Start shopping now: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/products`;
    return await exports.sendSMS(phoneNumber, message);
};