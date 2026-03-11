const express = require('express');
const router = express.Router();
const db = require('../config/db');
const sellerController = require('../controllers/seller.controller');
const { authenticate, isSeller } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');

// All seller routes require authentication and seller role
router.use(authenticate, isSeller);

// ========== DASHBOARD ==========
router.get('/dashboard/stats', sellerController.getDashboardStats);
router.get('/statistics', sellerController.getStatistics);

// ========== PRODUCT MANAGEMENT ==========
// Get all products
router.get('/products', sellerController.getProducts);

// Add product with image upload
router.post('/products', uploadSingle, handleUploadError, sellerController.addProduct);

// Add multiple product images
router.post('/products/:productId/images', uploadMultiple, handleUploadError, sellerController.addProductImages);

// Get product images
router.get('/products/:productId/images', sellerController.getProductImages);

// Delete product image
router.delete('/products/:productId/images/:imageId', sellerController.deleteProductImage);

// Set primary image
router.put('/products/:productId/images/:imageId/primary', sellerController.setPrimaryImage);

// Update product (with optional image)
router.put('/products/:id', uploadSingle, handleUploadError, sellerController.updateProduct);

// Delete product
router.delete('/products/:id', sellerController.deleteProduct);

// Get product details
router.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        const [products] = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.id = ?`,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Get product images
        const [images] = await db.query(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
            [productId]
        );

        // Get product variants
        const [variants] = await db.query(
            'SELECT * FROM product_variants WHERE product_id = ?',
            [productId]
        );

        res.json({
            ...products[0],
            images,
            variants
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== ORDER MANAGEMENT ==========
// Get all orders
router.get('/orders', sellerController.getOrders);

// Get single order details
router.get('/orders/:id', sellerController.getOrderDetails);

// Update order status
router.put('/orders/:id/status', sellerController.updateOrderStatus);

// Get order statistics
router.get('/orders/statistics/summary', async (req, res) => {
    try {
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [stats] = await db.query(
            `SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
                SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(grand_total) as total_revenue
             FROM orders 
             WHERE seller_id = ?`,
            [sellerId]
        );

        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== EARNINGS & WALLET ==========
// Get earnings summary
router.get('/earnings/summary', sellerController.getEarningsSummary);

// Get earnings
router.get('/earnings', sellerController.getEarningsSummary);

// Get wallet transactions
router.get('/wallet/transactions', sellerController.getWalletTransactions);

// Request withdrawal
router.post('/wallet/withdraw', sellerController.requestWithdrawal);

// Cancel withdrawal
router.post('/wallet/withdraw/:id/cancel', sellerController.cancelWithdrawal);

// Get withdrawal history
router.get('/wallet/withdrawals', async (req, res) => {
    try {
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [withdrawals] = await db.query(
            `SELECT * FROM wallet_transactions 
             WHERE seller_id = ? AND type = 'withdrawal' 
             ORDER BY created_at DESC`,
            [sellerId]
        );

        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== PROFILE MANAGEMENT ==========
// Get seller profile
router.get('/profile', sellerController.getProfile);

// Update seller profile
router.put('/profile', sellerController.updateProfile);

// Update profile image
router.post('/profile/image', uploadSingle, handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        await db.query(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [imageUrl, req.user.id]
        );

        res.json({ 
            message: 'Profile image updated successfully',
            imageUrl 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== CATEGORIES ==========
// Get categories for dropdown
router.get('/categories', sellerController.getCategories);

// ========== INVENTORY MANAGEMENT ==========
// Get low stock products
router.get('/inventory/low-stock', async (req, res) => {
    try {
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [products] = await db.query(
            `SELECT id, name, stock, price, image_url 
             FROM products 
             WHERE seller_id = ? AND stock < 10 
             ORDER BY stock ASC`,
            [sellerId]
        );

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update stock
router.put('/inventory/:productId/stock', async (req, res) => {
    try {
        const productId = req.params.productId;
        const { stock } = req.body;

        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [product] = await db.query(
            'SELECT * FROM products WHERE id = ? AND seller_id = ?',
            [productId, sellerId]
        );

        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await db.query(
            'UPDATE products SET stock = ? WHERE id = ?',
            [stock, productId]
        );

        // Log stock change
        await db.query(
            `INSERT INTO inventory_logs (product_id, old_stock, new_stock, changed_by, changed_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [productId, product[0].stock, stock, req.user.id]
        );

        res.json({ 
            message: 'Stock updated successfully',
            newStock: stock
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get inventory logs
router.get('/inventory/logs', async (req, res) => {
    try {
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [logs] = await db.query(
            `SELECT l.*, p.name as product_name 
             FROM inventory_logs l
             JOIN products p ON l.product_id = p.id
             WHERE p.seller_id = ?
             ORDER BY l.changed_at DESC
             LIMIT 50`,
            [sellerId]
        );

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== REVIEWS MANAGEMENT ==========
// Get product reviews
router.get('/reviews', async (req, res) => {
    try {
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [reviews] = await db.query(
            `SELECT r.*, p.name as product_name, p.image_url as product_image,
                    u.name as customer_name
             FROM reviews r
             JOIN products p ON r.product_id = p.id
             JOIN users u ON r.user_id = u.id
             WHERE p.seller_id = ?
             ORDER BY r.created_at DESC`,
            [sellerId]
        );

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reply to review
router.post('/reviews/:reviewId/reply', async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const { reply } = req.body;

        // Check if review belongs to seller's product
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [review] = await db.query(
            `SELECT r.* FROM reviews r
             JOIN products p ON r.product_id = p.id
             WHERE r.id = ? AND p.seller_id = ?`,
            [reviewId, sellerId]
        );

        if (review.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await db.query(
            'UPDATE reviews SET seller_reply = ?, seller_replied_at = NOW() WHERE id = ?',
            [reply, reviewId]
        );

        res.json({ message: 'Reply posted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== SALES REPORTS ==========
// Get sales report by date range
router.get('/reports/sales', async (req, res) => {
    try {
        const { start_date, end_date, group_by } = req.query;
        
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        let dateFormat = '%Y-%m-%d';
        if (group_by === 'month') dateFormat = '%Y-%m';
        if (group_by === 'year') dateFormat = '%Y';

        const [report] = await db.query(
            `SELECT DATE_FORMAT(o.created_at, ?) as period,
                    COUNT(DISTINCT o.id) as order_count,
                    SUM(oi.quantity) as items_sold,
                    SUM(oi.total) as total_sales,
                    AVG(oi.total) as average_order_value
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE o.seller_id = ? 
               AND o.payment_status = 'paid'
               AND (o.created_at >= ? OR ? IS NULL)
               AND (o.created_at <= ? OR ? IS NULL)
             GROUP BY period
             ORDER BY period DESC`,
            [dateFormat, sellerId, start_date, start_date, end_date, end_date]
        );

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get product performance report
router.get('/reports/products', async (req, res) => {
    try {
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [products] = await db.query(
            `SELECT p.id, p.name, p.price, p.stock,
                    COUNT(DISTINCT o.id) as order_count,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.total) as revenue,
                    AVG(r.rating) as avg_rating,
                    COUNT(DISTINCT r.id) as review_count
             FROM products p
             LEFT JOIN order_items oi ON p.id = oi.product_id
             LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
             LEFT JOIN reviews r ON p.id = r.product_id
             WHERE p.seller_id = ?
             GROUP BY p.id
             ORDER BY revenue DESC`,
            [sellerId]
        );

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== NOTIFICATIONS ==========
// Get seller notifications
router.get('/notifications', async (req, res) => {
    try {
        const [notifications] = await db.query(
            `SELECT * FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [req.user.id]
        );

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = ? WHERE id = ? AND user_id = ?',
            [true, req.params.id, req.user.id]
        );

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark all notifications as read
router.put('/notifications/read-all', async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = ? WHERE user_id = ?',
            [true, req.user.id]
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;