const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// ========== PUBLIC ROUTES (No authentication required) ==========

// Registration
router.post('/register/customer', authController.registerCustomer);
router.post('/register/seller', authController.registerSeller);

// Login
router.post('/login', authController.login);

// Password management
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

// ========== PROTECTED ROUTES (Require authentication) ==========

// Profile management
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

// Phone verification
router.post('/send-verification-sms', authenticate, authController.sendVerificationSMS);
router.post('/verify-phone', authenticate, authController.verifyPhone);

// Account management
router.delete('/delete-account', authenticate, authController.deleteAccount);
router.post('/logout', authenticate, authController.logout);

// Session management
router.get('/sessions', authenticate, authController.getActiveSessions);
router.delete('/sessions/:sessionId', authenticate, authController.terminateSession);
router.post('/sessions/terminate-all', authenticate, authController.terminateAllOtherSessions);

// Two-factor authentication
router.post('/enable-2fa', authenticate, authController.enable2FA);
router.post('/verify-2fa-enable', authenticate, authController.verifyAndEnable2FA);
router.post('/disable-2fa', authenticate, authController.disable2FA);
router.post('/verify-2fa-login', authController.verify2FALogin);

// Token refresh
router.post('/refresh-token', authController.refreshToken);

// ========== ADMIN ONLY ROUTES ==========
router.get('/admin/users', authenticate, authController.getAllUsers);
router.put('/admin/users/:id/role', authenticate, authController.updateUserRole);
router.put('/admin/users/:id/status', authenticate, authController.toggleUserStatus);
router.post('/admin/bulk-sms', authenticate, authController.sendBulkSMS);
router.post('/admin/bulk-email', authenticate, authController.sendBulkEmail);

module.exports = router;