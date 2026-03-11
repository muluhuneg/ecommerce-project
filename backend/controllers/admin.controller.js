const db = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Dashboard overview
exports.getDashboardStats = async (req, res) => {
    try {
        // Total users
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
        
        // Total sellers
        const [totalSellers] = await db.query('SELECT COUNT(*) as count FROM sellers');
        
        // Total products
        const [totalProducts] = await db.query('SELECT COUNT(*) as count FROM products');
        
        // Total orders
        const [totalOrders] = await db.query('SELECT COUNT(*) as count FROM orders');
        
        // Total revenue
        const [totalRevenue] = await db.query('SELECT SUM(grand_total) as total FROM orders WHERE payment_status = ?', ['paid']);
        
        // Pending sellers
        const [pendingSellers] = await db.query('SELECT COUNT(*) as count FROM sellers WHERE is_approved = ?', [false]);
        
        // Pending products
        const [pendingProducts] = await db.query('SELECT COUNT(*) as count FROM products WHERE is_approved = ?', [false]);
        
        // Recent orders
        const [recentOrders] = await db.query(
            'SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5'
        );

        res.json({
            total_users: totalUsers[0].count,
            total_sellers: totalSellers[0].count,
            total_products: totalProducts[0].count,
            total_orders: totalOrders[0].count,
            total_revenue: totalRevenue[0].total || 0,
            pending_sellers: pendingSellers[0].count,
            pending_products: pendingProducts[0].count,
            recent_orders: recentOrders
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: error.message });
    }
};

// User Management
exports.getUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = 'SELECT id, name, email, phone, role, is_verified, profile_image, created_at FROM users';
        const params = [];

        if (role && role !== 'all') {
            query += ' WHERE role = ?';
            params.push(role);
        }

        if (search) {
            query += role ? ' AND' : ' WHERE';
            query += ' (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [users] = await db.query(query, params);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user details
exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const [users] = await db.query(
            'SELECT id, name, email, phone, role, is_verified, profile_image, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get seller info if user is seller
        let sellerInfo = null;
        if (users[0].role === 'seller') {
            const [sellers] = await db.query('SELECT * FROM sellers WHERE user_id = ?', [userId]);
            sellerInfo = sellers[0] || null;
        }

        res.json({
            ...users[0],
            seller: sellerInfo
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, phone, role, is_verified } = req.body;

        await db.query(
            'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, is_verified = ? WHERE id = ?',
            [name, email, phone, role, is_verified, userId]
        );

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Toggle user status
exports.toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { is_verified } = req.body;

        await db.query(
            'UPDATE users SET is_verified = ? WHERE id = ?',
            [is_verified, userId]
        );

        res.json({ 
            message: `User ${is_verified ? 'activated' : 'deactivated'} successfully` 
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user has orders
        const [orders] = await db.query('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [userId]);
        if (orders[0].count > 0) {
            return res.status(400).json({ message: 'Cannot delete user with orders' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get pending sellers
exports.getPendingSellers = async (req, res) => {
    try {
        const [sellers] = await db.query(
            `SELECT s.*, u.name, u.email, u.phone 
             FROM sellers s
             JOIN users u ON s.user_id = u.id
             WHERE s.is_approved = ?`,
            [false]
        );
        res.json(sellers);
    } catch (error) {
        console.error('Error fetching pending sellers:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all sellers
exports.getAllSellers = async (req, res) => {
    try {
        const [sellers] = await db.query(
            `SELECT s.*, u.name, u.email, u.phone, u.is_verified,
                    COUNT(p.id) as product_count
             FROM sellers s
             JOIN users u ON s.user_id = u.id
             LEFT JOIN products p ON s.id = p.seller_id
             GROUP BY s.id
             ORDER BY s.created_at DESC`
        );
        res.json(sellers);
    } catch (error) {
        console.error('Error fetching all sellers:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get seller details
exports.getSellerDetails = async (req, res) => {
    try {
        const sellerId = req.params.id;
        
        const [sellers] = await db.query(
            `SELECT s.*, u.name, u.email, u.phone, u.is_verified,
                    COUNT(p.id) as product_count
             FROM sellers s
             JOIN users u ON s.user_id = u.id
             LEFT JOIN products p ON s.id = p.seller_id
             WHERE s.id = ?
             GROUP BY s.id`,
            [sellerId]
        );

        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // Get seller's products
        const [products] = await db.query(
            'SELECT id, name, price, stock, is_approved, created_at FROM products WHERE seller_id = ?',
            [sellerId]
        );

        res.json({
            ...sellers[0],
            products
        });
    } catch (error) {
        console.error('Error fetching seller details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Approve/reject seller
exports.approveSeller = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const { approve } = req.body;

        await db.query(
            `UPDATE sellers SET is_approved = ?, approved_by = ?, approved_at = NOW() WHERE id = ?`,
            [approve, req.user.id, sellerId]
        );

        // Update user verified status
        await db.query(
            `UPDATE users SET is_verified = ? WHERE id = (SELECT user_id FROM sellers WHERE id = ?)`,
            [approve, sellerId]
        );

        res.json({ 
            message: approve ? 'Seller approved successfully' : 'Seller rejected successfully' 
        });
    } catch (error) {
        console.error('Error approving seller:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update seller
exports.updateSeller = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const { business_name, business_address, business_phone, business_email, tax_id, business_license } = req.body;

        await db.query(
            `UPDATE sellers 
             SET business_name = ?, business_address = ?, business_phone = ?, 
                 business_email = ?, tax_id = ?, business_license = ?
             WHERE id = ?`,
            [business_name, business_address, business_phone, business_email, tax_id, business_license, sellerId]
        );

        res.json({ message: 'Seller updated successfully' });
    } catch (error) {
        console.error('Error updating seller:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== CATEGORY MANAGEMENT WITH IMAGE UPLOAD ==========

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query(
            `SELECT id, name, description, image, is_active, created_at 
             FROM categories 
             ORDER BY name`
        );
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get category details
exports.getCategoryDetails = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const [categories] = await db.query(
            'SELECT id, name, description, image, is_active, created_at FROM categories WHERE id = ?',
            [categoryId]
        );
        
        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.json(categories[0]);
    } catch (error) {
        console.error('Error fetching category details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add category with image upload
exports.addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Handle image upload
        let imageUrl = null;
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        }

        const [result] = await db.query(
            'INSERT INTO categories (name, description, image, is_active) VALUES (?, ?, ?, ?)',
            [name, description || null, imageUrl, true]
        );

        // Fetch the newly created category
        const [newCategory] = await db.query(
            'SELECT id, name, description, image, is_active, created_at FROM categories WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Category added successfully',
            category: newCategory[0]
        });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update category with optional image upload
exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, description, is_active } = req.body;

        // Check if category exists
        const [existing] = await db.query('SELECT image FROM categories WHERE id = ?', [categoryId]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        let imageUrl = existing[0].image;

        // Handle new image upload
        if (req.file) {
            // Delete old image file if exists
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

        // Build update query
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (imageUrl !== existing[0].image) {
            updates.push('image = ?');
            values.push(imageUrl);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(categoryId);
        await db.query(
            `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Fetch updated category
        const [updatedCategory] = await db.query(
            'SELECT id, name, description, image, is_active, created_at FROM categories WHERE id = ?',
            [categoryId]
        );

        res.json({
            message: 'Category updated successfully',
            category: updatedCategory[0]
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Check if category has products
        const [products] = await db.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [categoryId]);
        if (products[0].count > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete category with products. Please reassign or delete the products first.' 
            });
        }

        // Get category image to delete file
        const [category] = await db.query('SELECT image FROM categories WHERE id = ?', [categoryId]);
        
        // Delete image file if exists
        if (category.length > 0 && category[0].image) {
            const filename = category[0].image.split('/').pop();
            const filePath = path.join(__dirname, '../uploads', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM categories WHERE id = ?', [categoryId]);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: error.message });
    }
};

// Toggle category status
exports.toggleCategoryStatus = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { is_active } = req.body;

        await db.query(
            'UPDATE categories SET is_active = ? WHERE id = ?',
            [is_active ? 1 : 0, categoryId]
        );

        res.json({ 
            message: `Category ${is_active ? 'activated' : 'deactivated'} successfully` 
        });
    } catch (error) {
        console.error('Error toggling category status:', error);
        res.status(500).json({ message: error.message });
    }
};

// Product Management (Admin)
exports.getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query(
            `SELECT p.*, c.name as category_name, 
             u.name as seller_name, s.business_name,
             (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN sellers s ON p.seller_id = s.id
             LEFT JOIN users u ON s.user_id = u.id
             ORDER BY p.created_at DESC`
        );
        res.json(products);
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingProducts = async (req, res) => {
    try {
        const [products] = await db.query(
            `SELECT p.*, c.name as category_name, 
             u.name as seller_name, s.business_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN sellers s ON p.seller_id = s.id
             LEFT JOIN users u ON s.user_id = u.id
             WHERE p.is_approved = ?
             ORDER BY p.created_at DESC`,
            [false]
        );
        res.json(products);
    } catch (error) {
        console.error('Error fetching pending products:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get product details
exports.getProductDetails = async (req, res) => {
    try {
        const productId = req.params.id;

        const [products] = await db.query(
            `SELECT p.*, c.name as category_name, 
             u.name as seller_name, s.business_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN sellers s ON p.seller_id = s.id
             LEFT JOIN users u ON s.user_id = u.id
             WHERE p.id = ?`,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Get product images
        const [images] = await db.query(
            'SELECT * FROM product_images WHERE product_id = ?',
            [productId]
        );

        res.json({
            ...products[0],
            images
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Approve/reject product
exports.approveProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { approve } = req.body;

        await db.query(
            `UPDATE products SET is_approved = ?, approved_by = ?, approved_at = NOW() WHERE id = ?`,
            [approve, req.user.id, productId]
        );

        res.json({ 
            message: approve ? 'Product approved successfully' : 'Product rejected successfully' 
        });
    } catch (error) {
        console.error('Error approving product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, description, price, category_id, stock, discount_price, brand, weight, dimensions, tags } = req.body;

        await db.query(
            `UPDATE products 
             SET name = ?, description = ?, price = ?, category_id = ?, stock = ?,
                 discount_price = ?, brand = ?, weight = ?, dimensions = ?, tags = ?
             WHERE id = ?`,
            [name, description, price, category_id, stock, discount_price, brand, weight, dimensions, tags, productId]
        );

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Get product images to delete files
        const [images] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [productId]);
        
        // Delete image files
        images.forEach(image => {
            const filename = image.image_url.split('/').pop();
            const filePath = path.join(__dirname, '../uploads', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await db.query('DELETE FROM products WHERE id = ?', [productId]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Feature product
exports.featureProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { feature } = req.body;

        await db.query(
            'UPDATE products SET is_featured = ? WHERE id = ?',
            [feature ? 1 : 0, productId]
        );

        res.json({ 
            message: `Product ${feature ? 'featured' : 'unfeatured'} successfully` 
        });
    } catch (error) {
        console.error('Error featuring product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Order Management (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT o.*, 
                   u.name as customer_name, 
                   s.business_name as seller_name,
                   COUNT(oi.id) as item_count
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN sellers s ON o.seller_id = s.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
        `;
        const params = [];

        if (status && status !== 'all') {
            query += ' WHERE o.status = ?';
            params.push(status);
        }

        query += ' GROUP BY o.id ORDER BY o.created_at DESC';

        const [orders] = await db.query(query, params);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;

        const [orders] = await db.query(
            `SELECT o.*, 
                    u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
                    s.business_name as seller_name
             FROM orders o
             JOIN users u ON o.user_id = u.id
             LEFT JOIN sellers s ON o.seller_id = s.id
             WHERE o.id = ?`,
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const [items] = await db.query(
            `SELECT oi.*, p.name as product_name, p.image_url
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
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

exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status, tracking_number } = req.body;

        await db.query(
            'UPDATE orders SET status = ?, tracking_number = ?, updated_at = NOW() WHERE id = ?',
            [status, tracking_number, orderId]
        );

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { payment_status } = req.body;

        await db.query(
            'UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?',
            [payment_status, orderId]
        );

        res.json({ message: 'Payment status updated successfully' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: error.message });
    }
};

// Payment Management
exports.getTransactions = async (req, res) => {
    try {
        const [transactions] = await db.query(
            `SELECT t.*, o.order_number, o.grand_total, u.name as customer_name
             FROM transactions t
             JOIN orders o ON t.order_id = o.id
             JOIN users u ON o.user_id = u.id
             ORDER BY t.created_at DESC`
        );
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTransactionDetails = async (req, res) => {
    try {
        const transactionId = req.params.id;

        const [transactions] = await db.query(
            `SELECT t.*, o.order_number, o.grand_total, o.status as order_status,
                    u.name as customer_name, u.email as customer_email
             FROM transactions t
             JOIN orders o ON t.order_id = o.id
             JOIN users u ON o.user_id = u.id
             WHERE t.id = ?`,
            [transactionId]
        );

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(transactions[0]);
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Reports & Analytics
exports.getSalesReport = async (req, res) => {
    try {
        const { start_date, end_date, group_by } = req.query;
        
        let dateFormat = '%Y-%m-%d';
        if (group_by === 'month') dateFormat = '%Y-%m';
        if (group_by === 'year') dateFormat = '%Y';

        const [report] = await db.query(
            `SELECT DATE_FORMAT(created_at, ?) as period,
                    COUNT(*) as order_count,
                    SUM(grand_total) as total_sales,
                    AVG(grand_total) as average_order_value
             FROM orders
             WHERE payment_status = 'paid'
               AND (? IS NULL OR created_at >= ?)
               AND (? IS NULL OR created_at <= ?)
             GROUP BY period
             ORDER BY period DESC`,
            [dateFormat, start_date, start_date, end_date, end_date]
        );

        res.json(report);
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTopProducts = async (req, res) => {
    try {
        const [products] = await db.query(
            `SELECT p.id, p.name, p.price, p.image_url,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.total) as revenue,
                    COUNT(DISTINCT o.id) as order_count
             FROM products p
             JOIN order_items oi ON p.id = oi.product_id
             JOIN orders o ON oi.order_id = o.id
             WHERE o.payment_status = 'paid'
             GROUP BY p.id
             ORDER BY total_sold DESC
             LIMIT 10`
        );
        res.json(products);
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTopSellers = async (req, res) => {
    try {
        const [sellers] = await db.query(
            `SELECT s.id, s.business_name, u.name as owner_name,
                    COUNT(DISTINCT o.id) as order_count,
                    SUM(oi.total) as total_sales,
                    COUNT(DISTINCT p.id) as product_count
             FROM sellers s
             JOIN users u ON s.user_id = u.id
             LEFT JOIN products p ON s.id = p.seller_id
             LEFT JOIN orders o ON s.id = o.seller_id AND o.payment_status = 'paid'
             LEFT JOIN order_items oi ON o.id = oi.order_id
             GROUP BY s.id
             ORDER BY total_sales DESC
             LIMIT 10`
        );
        res.json(sellers);
    } catch (error) {
        console.error('Error fetching top sellers:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getRevenueSummary = async (req, res) => {
    try {
        const { period } = req.query;
        
        let dateFormat = '%Y-%m-%d';
        let interval = '30 DAY';
        
        if (period === 'monthly') {
            dateFormat = '%Y-%m';
            interval = '12 MONTH';
        } else if (period === 'yearly') {
            dateFormat = '%Y';
            interval = '5 YEAR';
        }

        const [summary] = await db.query(
            `SELECT DATE_FORMAT(created_at, ?) as period,
                    COUNT(*) as order_count,
                    SUM(grand_total) as revenue
             FROM orders
             WHERE payment_status = 'paid'
               AND created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
             GROUP BY period
             ORDER BY period DESC`,
            [dateFormat]
        );

        res.json(summary);
    } catch (error) {
        console.error('Error fetching revenue summary:', error);
        res.status(500).json({ message: error.message });
    }
};

// Settings
exports.getSettings = async (req, res) => {
    try {
        // You can implement settings table if needed
        res.json({
            site_name: 'E-Store',
            site_email: 'admin@estore.com',
            site_phone: '+251912345678',
            currency: 'ETB',
            tax_rate: 15,
            shipping_fee: 5.99,
            free_shipping_threshold: 50
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = req.body;
        // You can implement settings update logic here
        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: error.message });
    }
};

// Notifications
exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(
            `SELECT * FROM notifications 
             ORDER BY created_at DESC 
             LIMIT 50`
        );
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const notificationId = req.params.id;

        await db.query(
            'UPDATE notifications SET is_read = ? WHERE id = ?',
            [true, notificationId]
        );

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: error.message });
    }
};

// Backup
exports.createBackup = async (req, res) => {
    try {
        // Implement backup logic here
        res.json({ message: 'Backup created successfully', backupId: Date.now() });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getBackups = async (req, res) => {
    try {
        // Implement get backups logic here
        res.json([]);
    } catch (error) {
        console.error('Error fetching backups:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.restoreBackup = async (req, res) => {
    try {
        const backupId = req.params.id;
        // Implement restore logic here
        res.json({ message: 'Backup restored successfully' });
    } catch (error) {
        console.error('Error restoring backup:', error);
        res.status(500).json({ message: error.message });
    }
};

// Export Data
exports.exportData = async (req, res) => {
    try {
        const { type } = req.params;
        const { format } = req.query;
        
        // Implement export logic here
        res.json({ message: `Exporting ${type} data in ${format} format` });
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ message: error.message });
    }
};