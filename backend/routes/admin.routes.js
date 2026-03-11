const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

// ========== DASHBOARD ==========
router.get('/dashboard/stats', adminController.getDashboardStats);

// ========== USER MANAGEMENT ==========
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// ========== SELLER MANAGEMENT ==========
router.get('/sellers', adminController.getAllSellers);
router.get('/sellers/pending', adminController.getPendingSellers);
router.get('/sellers/:id', adminController.getSellerDetails);
router.put('/sellers/:id/approve', adminController.approveSeller);
router.put('/sellers/:id', adminController.updateSeller);

// ========== CATEGORY MANAGEMENT WITH IMAGE UPLOAD ==========
router.get('/categories', adminController.getCategories);
router.get('/categories/:id', adminController.getCategoryDetails);
router.post('/categories', uploadSingle, handleUploadError, adminController.addCategory);
router.put('/categories/:id', uploadSingle, handleUploadError, adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.put('/categories/:id/toggle', adminController.toggleCategoryStatus);

// ========== PRODUCT MANAGEMENT ==========
router.get('/products', adminController.getAllProducts);
router.get('/products/pending', adminController.getPendingProducts);
router.get('/products/:id', adminController.getProductDetails);
router.put('/products/:id/approve', adminController.approveProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.put('/products/:id/feature', adminController.featureProduct);

// ========== ORDER MANAGEMENT ==========
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderDetails);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.put('/orders/:id/payment', adminController.updatePaymentStatus);

// ========== PAYMENT MANAGEMENT ==========
router.get('/transactions', adminController.getTransactions);
router.get('/transactions/:id', adminController.getTransactionDetails);

// ========== REPORTS & ANALYTICS ==========
router.get('/reports/sales', adminController.getSalesReport);
router.get('/reports/top-products', adminController.getTopProducts);
router.get('/reports/top-sellers', adminController.getTopSellers);
router.get('/reports/revenue', adminController.getRevenueSummary);

// ========== SETTINGS ==========
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// ========== NOTIFICATIONS ==========
router.get('/notifications', adminController.getNotifications);
router.put('/notifications/:id/read', adminController.markNotificationRead);

// ========== BACKUP ==========
router.post('/backup', adminController.createBackup);
router.get('/backups', adminController.getBackups);
router.post('/backups/:id/restore', adminController.restoreBackup);

// ========== EXPORT DATA ==========
router.get('/export/:type', adminController.exportData);

module.exports = router;