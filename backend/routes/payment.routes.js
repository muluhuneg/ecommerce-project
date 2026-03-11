const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

// Initialize payment (protected)
router.post('/initialize', authenticate, paymentController.initializePayment);

// Verify payment (public - for callback)
router.get('/verify/:tx_ref', paymentController.verifyPayment);

// Webhook (public - for Chapa to call)
router.post('/webhook', paymentController.handleWebhook);

// Get transaction status (protected)
router.get('/status/:tx_ref', authenticate, paymentController.getTransactionStatus);

// ============================================
// TEST ROUTE - Create order from pending order manually
// Use this when Chapa webhook doesn't work on localhost
// This is for testing only - remove in production
// ============================================
router.get('/create-order-from-pending/:tx_ref', authenticate, paymentController.createOrderFromPending);

// ============================================
// NEW ROUTE - Manual payment success (for testing)
// Use this to simulate successful payment without Chapa
// Call this after checkout to create order immediately
// ============================================
router.get('/manual-success/:tx_ref', authenticate, paymentController.manualPaymentSuccess);

module.exports = router;