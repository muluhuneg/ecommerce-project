const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const notificationController = require('./notification.controller');

// Get seller dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        // Get seller ID from user
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        // Get total products
        const [products] = await db.query('SELECT COUNT(*) as count FROM products WHERE seller_id = ?', [sellerId]);

        // Get total orders
        const [orders] = await db.query('SELECT COUNT(*) as count FROM orders WHERE seller_id = ?', [sellerId]);

        // Get total sales
        const [sales] = await db.query(
            'SELECT SUM(total) as total FROM order_items WHERE seller_id = ?', 
            [sellerId]
        );

        // Get pending orders
        const [pendingOrders] = await db.query(
            'SELECT COUNT(*) as count FROM orders WHERE seller_id = ? AND status = ?', 
            [sellerId, 'pending']
        );

        // Get seller wallet
        const [wallet] = await db.query(
            'SELECT wallet_balance, total_earnings, pending_withdrawal FROM sellers WHERE id = ?',
            [sellerId]
        );

        res.json({
            total_products: products[0].count,
            total_orders: orders[0].count,
            total_sales: sales[0].total || 0,
            pending_orders: pendingOrders[0].count,
            wallet: wallet[0]
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get seller products
exports.getProducts = async (req, res) => {
    try {
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [products] = await db.query(
            `SELECT p.*, c.name as category_name,
            (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count,
            (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.seller_id = ?
            ORDER BY p.created_at DESC`,
            [sellerId]
        );

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add new product with image upload
exports.addProduct = async (req, res) => {
    try {
        const {
            name, description, price, category_id, stock,
            discount_price, brand, weight, dimensions, tags
        } = req.body;

        // Get seller ID
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        // Handle image upload
        let imageUrl = null;
        if (req.file) {
            // Construct the URL for the uploaded image
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        }

        // Insert product
        const [result] = await db.query(
            `INSERT INTO products 
            (name, description, price, category_id, stock, seller_id, 
             discount_price, brand, weight, dimensions, tags, image_url, is_approved) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, price, category_id, stock, sellerId,
             discount_price || null, brand || null, weight || null, 
             dimensions || null, tags || null, imageUrl, false]
        );

        // Notify admins about a product waiting for approval
        try {
            // Get seller name for context
            const [user] = await db.query(
                'SELECT u.name FROM users u JOIN sellers s ON u.id = s.user_id WHERE s.id = ?',
                [sellerId]
            );

            await notificationController.createAdminNotificationForAll({
                type: 'product_needs_approval',
                product_name: name,
                seller_name: user.length ? user[0].name : 'Seller'
            });
        } catch (notifyError) {
            console.error('Failed to create admin notification for new product:', notifyError);
        }

        res.status(201).json({
            message: 'Product added successfully. Awaiting admin approval.',
            productId: result.insertId,
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add multiple product images
exports.addProductImages = async (req, res) => {
    try {
        const productId = req.params.productId;
        const files = req.files;

        // Verify product belongs to seller
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
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        // Insert each image
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrls = [];

        for (const file of files) {
            const imageUrl = `${baseUrl}/uploads/${file.filename}`;
            imageUrls.push(imageUrl);
            
            await db.query(
                'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                [productId, imageUrl, false]
            );
        }

        res.status(201).json({
            message: 'Images uploaded successfully',
            imageUrls: imageUrls
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get product images
exports.getProductImages = async (req, res) => {
    try {
        const productId = req.params.productId;

        const [images] = await db.query(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, created_at DESC',
            [productId]
        );

        res.json(images);
    } catch (error) {
        console.error('Error fetching product images:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete product image
exports.deleteProductImage = async (req, res) => {
    try {
        const imageId = req.params.imageId;
        const productId = req.params.productId;

        // Verify product belongs to seller
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
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        // Get image info to delete file
        const [images] = await db.query(
            'SELECT image_url FROM product_images WHERE id = ?',
            [imageId]
        );

        if (images.length > 0) {
            // Extract filename from URL
            const imageUrl = images[0].image_url;
            const filename = imageUrl.split('/').pop();
            const filePath = path.join(__dirname, '../uploads', filename);

            // Delete file from filesystem
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete from database
        await db.query('DELETE FROM product_images WHERE id = ?', [imageId]);

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: error.message });
    }
};

// Set primary image
exports.setPrimaryImage = async (req, res) => {
    try {
        const imageId = req.params.imageId;
        const productId = req.params.productId;

        // Verify product belongs to seller
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
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        // Remove primary flag from all images
        await db.query(
            'UPDATE product_images SET is_primary = ? WHERE product_id = ?',
            [false, productId]
        );

        // Set new primary image
        await db.query(
            'UPDATE product_images SET is_primary = ? WHERE id = ?',
            [true, imageId]
        );

        // Update product main image
        const [image] = await db.query(
            'SELECT image_url FROM product_images WHERE id = ?',
            [imageId]
        );

        if (image.length > 0) {
            await db.query(
                'UPDATE products SET image_url = ? WHERE id = ?',
                [image[0].image_url, productId]
            );
        }

        res.json({ message: 'Primary image set successfully' });
    } catch (error) {
        console.error('Error setting primary image:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = req.body;

        // Verify product belongs to seller
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
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        // Handle image update if new file uploaded
        let imageUrl = product[0].image_url;
        if (req.file) {
            // Delete old image file
            if (imageUrl) {
                const oldFilename = imageUrl.split('/').pop();
                const oldFilePath = path.join(__dirname, '../uploads', oldFilename);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            // Set new image
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        }

        // Build update query dynamically
        const allowedFields = ['name', 'description', 'price', 'category_id', 'stock', 
                              'discount_price', 'brand', 'weight', 'dimensions', 'tags'];
        const setClauses = [];
        const values = [];

        if (imageUrl !== product[0].image_url) {
            setClauses.push('image_url = ?');
            values.push(imageUrl);
        }

        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                values.push(updates[field]);
            }
        });

        if (setClauses.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(productId, sellerId);
        await db.query(
            `UPDATE products SET ${setClauses.join(', ')} WHERE id = ? AND seller_id = ?`,
            values
        );

        res.json({ 
            message: 'Product updated successfully',
            imageUrl: imageUrl 
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Verify product belongs to seller
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
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        // Get all product images to delete files
        const [images] = await db.query(
            'SELECT image_url FROM product_images WHERE product_id = ?',
            [productId]
        );

        // Delete image files from filesystem
        images.forEach(image => {
            const filename = image.image_url.split('/').pop();
            const filePath = path.join(__dirname, '../uploads', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        // Delete main product image if exists
        if (product[0].image_url) {
            const mainFilename = product[0].image_url.split('/').pop();
            const mainFilePath = path.join(__dirname, '../uploads', mainFilename);
            if (fs.existsSync(mainFilePath)) {
                fs.unlinkSync(mainFilePath);
            }
        }

        // Delete product (cascade will delete images from database)
        await db.query('DELETE FROM products WHERE id = ?', [productId]);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get seller orders
exports.getOrders = async (req, res) => {
    try {
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [orders] = await db.query(
            `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
            COUNT(oi.id) as item_count,
            SUM(oi.quantity) as total_items,
            GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as product_names
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.seller_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC`,
            [sellerId]
        );

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get single order details
exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Verify order belongs to seller
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [orders] = await db.query(
            `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
                    u.address as customer_address
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.id = ? AND o.seller_id = ?`,
            [orderId, sellerId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const [items] = await db.query(
            `SELECT oi.*, p.name, p.image_url, p.sku,
                    pv.attributes as variant_attributes
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             LEFT JOIN product_variants pv ON oi.variant_id = pv.id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        res.json({
            order: orders[0],
            items: items
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status, tracking_number, notes } = req.body;

        // Verify order belongs to seller
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [order] = await db.query(
            'SELECT * FROM orders WHERE id = ? AND seller_id = ?',
            [orderId, sellerId]
        );

        if (order.length === 0) {
            return res.status(404).json({ message: 'Order not found or not authorized' });
        }

        await db.query(
            'UPDATE orders SET status = ?, tracking_number = ?, notes = ?, updated_at = NOW() WHERE id = ?',
            [status, tracking_number || null, notes || null, orderId]
        );

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get seller earnings summary
exports.getEarningsSummary = async (req, res) => {
    try {
        const [sellers] = await db.query(
            'SELECT id, wallet_balance, total_earnings, pending_withdrawal FROM sellers WHERE user_id = ?',
            [req.user.id]
        );

        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        const seller = sellers[0];

        // Get earnings by period
        const [monthlyEarnings] = await db.query(
            `SELECT DATE_FORMAT(o.created_at, '%Y-%m') as month,
                    SUM(oi.total) as earnings
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE o.seller_id = ? AND o.payment_status = 'paid'
             GROUP BY month
             ORDER BY month DESC
             LIMIT 6`,
            [seller.id]
        );

        res.json({
            wallet_balance: seller.wallet_balance,
            total_earnings: seller.total_earnings,
            pending_withdrawal: seller.pending_withdrawal,
            monthly_earnings: monthlyEarnings
        });
    } catch (error) {
        console.error('Error fetching earnings:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get wallet transactions
exports.getWalletTransactions = async (req, res) => {
    try {
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        const [transactions] = await db.query(
            'SELECT * FROM wallet_transactions WHERE seller_id = ? ORDER BY created_at DESC',
            [sellerId]
        );

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: error.message });
    }
};

// Request withdrawal
exports.requestWithdrawal = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { amount } = req.body;

        await connection.beginTransaction();

        const [sellers] = await connection.query(
            'SELECT id, wallet_balance FROM sellers WHERE user_id = ?',
            [req.user.id]
        );

        if (sellers.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Seller not found' });
        }
        const seller = sellers[0];

        if (amount > seller.wallet_balance) {
            await connection.rollback();
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create withdrawal request
        await connection.query(
            `INSERT INTO wallet_transactions 
            (seller_id, amount, type, status, description) 
            VALUES (?, ?, ?, ?, ?)`,
            [seller.id, amount, 'withdrawal', 'pending', 'Withdrawal request']
        );

        // Update pending withdrawal
        await connection.query(
            'UPDATE sellers SET pending_withdrawal = pending_withdrawal + ? WHERE id = ?',
            [amount, seller.id]
        );

        await connection.commit();

        res.json({ message: 'Withdrawal request submitted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error requesting withdrawal:', error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// Cancel withdrawal request
exports.cancelWithdrawal = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const transactionId = req.params.id;

        await connection.beginTransaction();

        // Get transaction details
        const [transactions] = await connection.query(
            'SELECT * FROM wallet_transactions WHERE id = ?',
            [transactionId]
        );

        if (transactions.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const transaction = transactions[0];

        // Update transaction status
        await connection.query(
            'UPDATE wallet_transactions SET status = ? WHERE id = ?',
            ['cancelled', transactionId]
        );

        // Update seller pending withdrawal
        await connection.query(
            'UPDATE sellers SET pending_withdrawal = pending_withdrawal - ? WHERE id = ?',
            [transaction.amount, transaction.seller_id]
        );

        await connection.commit();

        res.json({ message: 'Withdrawal request cancelled successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error cancelling withdrawal:', error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// Get seller profile
exports.getProfile = async (req, res) => {
    try {
        const [sellers] = await db.query(
            `SELECT s.*, u.name, u.email, u.phone, u.profile_image 
             FROM sellers s
             JOIN users u ON s.user_id = u.id
             WHERE s.user_id = ?`,
            [req.user.id]
        );

        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        res.json(sellers[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update seller profile
exports.updateProfile = async (req, res) => {
    try {
        const { 
            business_name, 
            business_address, 
            business_phone, 
            business_email,
            tax_id,
            business_license
        } = req.body;

        await db.query(
            `UPDATE sellers 
             SET business_name = ?, business_address = ?, business_phone = ?, 
                 business_email = ?, tax_id = ?, business_license = ?
             WHERE user_id = ?`,
            [business_name, business_address, business_phone, business_email, 
             tax_id, business_license, req.user.id]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get seller statistics
exports.getStatistics = async (req, res) => {
    try {
        const [sellers] = await db.query('SELECT id FROM sellers WHERE user_id = ?', [req.user.id]);
        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        const sellerId = sellers[0].id;

        // Get monthly sales for the last 6 months
        const [monthlySales] = await db.query(
            `SELECT DATE_FORMAT(o.created_at, '%Y-%m') as month,
                    COUNT(DISTINCT o.id) as order_count,
                    SUM(oi.total) as total_sales
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE o.seller_id = ? AND o.payment_status = 'paid'
               AND o.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month
             ORDER BY month DESC`,
            [sellerId]
        );

        // Get top products
        const [topProducts] = await db.query(
            `SELECT p.id, p.name, p.price, p.image_url,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.total) as revenue
             FROM products p
             JOIN order_items oi ON p.id = oi.product_id
             JOIN orders o ON oi.order_id = o.id
             WHERE p.seller_id = ? AND o.payment_status = 'paid'
             GROUP BY p.id
             ORDER BY total_sold DESC
             LIMIT 5`,
            [sellerId]
        );

        // Get low stock products
        const [lowStock] = await db.query(
            'SELECT id, name, stock FROM products WHERE seller_id = ? AND stock < 10 ORDER BY stock ASC',
            [sellerId]
        );

        res.json({
            monthly_sales: monthlySales,
            top_products: topProducts,
            low_stock: lowStock
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get categories for dropdown
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query(
            'SELECT id, name FROM categories WHERE is_active = 1 ORDER BY name'
        );
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: error.message });
    }
};