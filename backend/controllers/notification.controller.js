const db = require('../config/db');

// ========== NOTIFICATION MANAGEMENT ==========

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, is_read, priority } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT * FROM notifications 
            WHERE user_id = ? AND is_archived = FALSE
        `;
        const params = [req.user.id];

        if (type && type !== 'all') {
            query += ' AND type = ?';
            params.push(type);
        }

        if (is_read !== undefined && is_read !== 'all') {
            query += ' AND is_read = ?';
            params.push(is_read === 'true');
        }

        if (priority && priority !== 'all') {
            query += ' AND priority = ?';
            params.push(priority);
        }

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND is_archived = FALSE`,
            [req.user.id]
        );

        // Add ORDER BY clause - THIS WAS THE PROBLEM LINE
        query += ' ORDER BY ' +
            'CASE priority ' +
            'WHEN "urgent" THEN 1 ' +
            'WHEN "high" THEN 2 ' +
            'WHEN "medium" THEN 3 ' +
            'WHEN "low" THEN 4 ' +
            'ELSE 5 END, ' +
            'created_at DESC ' +
            'LIMIT ? OFFSET ?';
        
        params.push(parseInt(limit), parseInt(offset));

        const [notifications] = await db.query(query, params);

        // Get unread count
        const [unreadCount] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE AND is_archived = FALSE',
            [req.user.id]
        );

        res.json({
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            },
            unreadCount: unreadCount[0].count
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (notifications.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notifications[0]);
    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({ message: error.message });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Get updated unread count
        const [unreadCount] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE AND is_archived = FALSE',
            [req.user.id]
        );

        res.json({ 
            message: 'Notification marked as read',
            unreadCount: unreadCount[0].count
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: error.message });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
            [req.user.id]
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: error.message });
    }
};

// Archive notification
exports.archiveNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE notifications SET is_archived = TRUE WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification archived successfully' });
    } catch (error) {
        console.error('Error archiving notification:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM notifications WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
    try {
        const [preferences] = await db.query(
            'SELECT * FROM notification_preferences WHERE user_id = ?',
            [req.user.id]
        );

        if (preferences.length === 0) {
            // Create default preferences
            await db.query(
                `INSERT INTO notification_preferences (user_id) VALUES (?)`,
                [req.user.id]
            );
            
            const [newPrefs] = await db.query(
                'SELECT * FROM notification_preferences WHERE user_id = ?',
                [req.user.id]
            );
            return res.json(newPrefs[0]);
        }

        res.json(preferences[0]);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
    try {
        const {
            email_notifications,
            sms_notifications,
            push_notifications,
            order_updates,
            payment_updates,
            product_updates,
            promotional_offers,
            seller_updates,
            admin_alerts,
            marketing_emails
        } = req.body;

        await db.query(
            `UPDATE notification_preferences SET 
                email_notifications = ?,
                sms_notifications = ?,
                push_notifications = ?,
                order_updates = ?,
                payment_updates = ?,
                product_updates = ?,
                promotional_offers = ?,
                seller_updates = ?,
                admin_alerts = ?,
                marketing_emails = ?,
                updated_at = NOW()
            WHERE user_id = ?`,
            [
                email_notifications ?? true,
                sms_notifications ?? false,
                push_notifications ?? true,
                order_updates ?? true,
                payment_updates ?? true,
                product_updates ?? true,
                promotional_offers ?? true,
                seller_updates ?? false,
                admin_alerts ?? false,
                marketing_emails ?? false,
                req.user.id
            ]
        );

        res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE AND is_archived = FALSE',
            [req.user.id]
        );

        res.json({ unreadCount: result[0].count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create notification (internal function)
async function createNotification(userId, type, title, message, data = null, priority = 'medium', actionUrl = null, imageUrl = null) {
    try {
        // Check user preferences before sending
        const [prefs] = await db.query(
            'SELECT * FROM notification_preferences WHERE user_id = ?',
            [userId]
        );

        // Determine if notification should be sent based on type
        let shouldSend = true;
        if (prefs.length > 0) {
            switch(type) {
                case 'order':
                    shouldSend = prefs[0].order_updates;
                    break;
                case 'payment':
                    shouldSend = prefs[0].payment_updates;
                    break;
                case 'product':
                    shouldSend = prefs[0].product_updates;
                    break;
                case 'seller':
                    shouldSend = prefs[0].seller_updates;
                    break;
                case 'admin':
                    shouldSend = prefs[0].admin_alerts;
                    break;
                case 'promotion':
                    shouldSend = prefs[0].promotional_offers;
                    break;
                default:
                    shouldSend = true;
            }
        }

        if (!shouldSend) {
            return null;
        }

        const [result] = await db.query(
            `INSERT INTO notifications 
            (user_id, type, title, message, data, priority, action_url, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, type, title, message, data ? JSON.stringify(data) : null, priority, actionUrl, imageUrl]
        );

        return result.insertId;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

// Helper function to create order notifications
exports.createOrderNotification = async (userId, orderData, type = 'order') => {
    const { order_number, order_id, status, amount, tracking_number } = orderData;
    
    let title, message, priority, actionUrl;
    
    switch(status) {
        case 'confirmed':
            title = `Order #${order_number} Confirmed`;
            message = `Your order #${order_number} has been confirmed and is being processed.`;
            priority = 'medium';
            break;
        case 'shipped':
            title = `Order #${order_number} Shipped`;
            message = `Your order #${order_number} has been shipped! Tracking number: ${tracking_number || 'N/A'}`;
            priority = 'high';
            break;
        case 'delivered':
            title = `Order #${order_number} Delivered`;
            message = `Your order #${order_number} has been delivered. Enjoy your purchase!`;
            priority = 'high';
            break;
        case 'cancelled':
            title = `Order #${order_number} Cancelled`;
            message = `Your order #${order_number} has been cancelled. Refund will be processed within 5-7 business days.`;
            priority = 'urgent';
            break;
        default:
            title = `Order #${order_number} Updated`;
            message = `Your order #${order_number} status has been updated to ${status}.`;
            priority = 'medium';
    }
    
    actionUrl = `/orders/${order_id}`;
    
    return await createNotification(userId, 'order', title, message, orderData, priority, actionUrl);
};

// Helper function to create payment notifications
exports.createPaymentNotification = async (userId, paymentData) => {
    const { order_number, order_id, amount, status } = paymentData;
    
    let title, message, priority, actionUrl;
    
    if (status === 'paid') {
        title = `Payment Received`;
        message = `Payment of ${amount} Br for order #${order_number} has been received successfully.`;
        priority = 'high';
    } else if (status === 'failed') {
        title = `Payment Failed`;
        message = `Payment for order #${order_number} failed. Please update your payment method.`;
        priority = 'urgent';
    } else {
        title = `Payment ${status}`;
        message = `Payment for order #${order_number} is ${status}.`;
        priority = 'medium';
    }
    
    actionUrl = status === 'failed' ? '/checkout' : `/orders/${order_id}`;
    
    return await createNotification(userId, 'payment', title, message, paymentData, priority, actionUrl);
};

// Helper function to create seller notifications
exports.createSellerNotification = async (sellerUserId, data) => {
    const { type, business_name, product_name, order_number, amount, order_id, product_id, reason } = data;
    
    let title, message, priority, actionUrl;
    
    if (type === 'new_order') {
        title = `New Order Received`;
        message = `You have received a new order #${order_number} for ${amount} Br.`;
        priority = 'urgent';
        actionUrl = `/seller/orders/${order_id}`;
    } else if (type === 'product_approved') {
        title = `Product Approved`;
        message = `Your product "${product_name}" has been approved and is now live on the store.`;
        priority = 'medium';
        actionUrl = `/seller/products/${product_id}`;
    } else if (type === 'product_rejected') {
        title = `Product Rejected`;
        message = `Your product "${product_name}" has been rejected. Reason: ${reason}`;
        priority = 'high';
        actionUrl = `/seller/products/${product_id}/edit`;
    } else if (type === 'account_approved') {
        title = `Seller Account Approved`;
        message = `Congratulations! Your seller account has been approved. You can now start selling.`;
        priority = 'high';
        actionUrl = '/seller/dashboard';
    }
    
    return await createNotification(sellerUserId, 'seller', title, message, data, priority, actionUrl);
};

// Helper function to create admin notifications
exports.createAdminNotification = async (adminUserId, data) => {
    const { type, business_name, product_name, seller_name } = data;
    
    let title, message, priority, actionUrl;
    
    if (type === 'new_seller') {
        title = `New Seller Registration`;
        message = `A new seller "${business_name}" has registered and is pending approval.`;
        priority = 'high';
        actionUrl = '/admin/sellers/pending';
    } else if (type === 'product_needs_approval') {
        title = `New Product Approval Needed`;
        message = `New product "${product_name}" submitted by ${seller_name} needs approval.`;
        priority = 'high';
        actionUrl = '/admin/products/pending';
    } else {
        title = data.title || 'Admin Notification';
        message = data.message || 'There is an important update.';
        priority = data.priority || 'medium';
        actionUrl = data.actionUrl || '/admin/notifications';
    }
    
    return await createNotification(adminUserId, 'admin', title, message, data, priority, actionUrl);
};

// Helper function to create admin notification for all admins
exports.createAdminNotificationForAll = async (data) => {
    try {
        const [admins] = await db.query('SELECT id FROM users WHERE role = ?', ['admin']);
        for (const admin of admins) {
            await exports.createAdminNotification(admin.id, data);
        }
        return true;
    } catch (error) {
        console.error('Error creating admin notifications for all admins:', error);
        return false;
    }
};

// Helper function to create system notifications
exports.createSystemNotification = async (userId, data) => {
    const { type, user_name } = data;
    
    let title, message, priority, actionUrl;
    
    if (type === 'welcome') {
        title = `Welcome to E-Store`;
        message = `Welcome ${user_name}! Thank you for joining E-Store. Start exploring our amazing products!`;
        priority = 'low';
        actionUrl = '/products';
    } else if (type === 'verified') {
        title = `Account Verified`;
        message = `Your email has been verified successfully. Your account is now fully activated.`;
        priority = 'low';
        actionUrl = '/profile';
    }
    
    return await createNotification(userId, 'system', title, message, data, priority, actionUrl);
};

// Helper function to create promotion notifications
exports.createPromotionNotification = async (userId, promotionData) => {
    const { title, message, image_url, action_url } = promotionData;
    
    return await createNotification(
        userId, 
        'promotion', 
        title, 
        message, 
        promotionData, 
        'medium', 
        action_url, 
        image_url
    );
};

// Export the internal function for use in other controllers
exports.createNotification = createNotification;