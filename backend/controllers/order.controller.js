const db = require('../config/db');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const notificationController = require('./notification.controller');

// Generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}${random}`;
};

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 2
    }).format(amount);
};

// Create new order with extensive debugging
exports.createOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        // ========== DEBUGGING ==========
        console.log('\n🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
        console.log('ORDER CREATION ATTEMPTED');
        console.log('Time:', new Date().toLocaleString());
        console.log('User ID from token:', req.user?.id);
        console.log('User role:', req.user?.role);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Items received:', req.body.items?.length || 0);
        // ========== END DEBUG ==========

        await connection.beginTransaction();

        const {
            shipping_address,
            billing_address,
            payment_method,
            shipping_method,
            shipping_cost,
            tax_amount,
            discount_amount,
            grand_total,
            items,
            order_notes
        } = req.body;

        // Validate required fields
        if (!shipping_address) {
            console.log('❌ Missing shipping address');
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        if (!items || items.length === 0) {
            console.log('❌ No items in order');
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log('✅ Validation passed');

        // Generate order number
        const order_number = generateOrderNumber();
        console.log('📦 Order number:', order_number);

        // Get user details
        console.log('🔍 Fetching user details...');
        const [users] = await connection.query(
            'SELECT name, email, phone FROM users WHERE id = ?',
            [req.user.id]
        );
        const user = users[0];
        console.log('✅ User found:', user.email);

        // Platform commission rate (e.g., 10%)
        const PLATFORM_COMMISSION = 0.10;

        // Insert order
        console.log('📝 Inserting order into database...');
        const [orderResult] = await connection.query(
            `INSERT INTO orders 
            (order_number, user_id, total_amount, shipping_cost, tax_amount, discount_amount, grand_total,
             status, payment_method, shipping_address, billing_address, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                order_number, req.user.id, grand_total, shipping_cost, tax_amount, 
                discount_amount || 0, grand_total, 'pending', payment_method, 
                shipping_address, billing_address || shipping_address, order_notes || null
            ]
        );

        const orderId = orderResult.insertId;
        console.log('✅ Order inserted with ID:', orderId);

        // Track seller earnings
        const sellerEarnings = {};

        // Insert order items and update stock
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log(`\n--- Processing item ${i+1}/${items.length} ---`);
            console.log('Item data:', item);

            // Get seller ID from product
            console.log('🔍 Looking up product ID:', item.product_id);
            const [products] = await connection.query(
                `SELECT p.*, s.id as seller_id, s.business_name 
                 FROM products p
                 LEFT JOIN sellers s ON p.seller_id = s.id
                 WHERE p.id = ?`,
                [item.product_id]
            );

            if (products.length === 0) {
                throw new Error(`Product ID ${item.product_id} not found`);
            }

            const product = products[0];
            console.log('✅ Product found:', product.name);
            console.log('Seller ID:', product.seller_id);
            console.log('Seller name:', product.business_name || 'Unknown');
            console.log('Current stock:', product.stock);

            if (!product.seller_id) {
                throw new Error(`Product ${product.name} has no seller assigned`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
            }

            // Calculate item total
            const itemTotal = item.price * item.quantity;
            
            // Calculate seller earning (after platform commission)
            const sellerAmount = itemTotal * (1 - PLATFORM_COMMISSION);
            const platformFee = itemTotal * PLATFORM_COMMISSION;

            console.log(`💰 Item total: ${itemTotal} ETB`);
            console.log(`💰 Seller gets: ${sellerAmount} ETB (90%)`);
            console.log(`💰 Platform fee: ${platformFee} ETB (10%)`);

            // Track seller earnings
            if (!sellerEarnings[product.seller_id]) {
                sellerEarnings[product.seller_id] = 0;
            }
            sellerEarnings[product.seller_id] += sellerAmount;

            // Insert order item with seller_id
            console.log('Inserting into order_items...');
            await connection.query(
                `INSERT INTO order_items 
                (order_id, product_id, seller_id, quantity, price, total, seller_amount, platform_fee)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, product.seller_id, item.quantity, item.price, itemTotal, sellerAmount, platformFee]
            );
            console.log('✅ Order item inserted');

            // Update product stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
            console.log('✅ Stock updated');

            // Update product sold count
            await connection.query(
                'UPDATE products SET sold_count = sold_count + ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
            console.log('✅ Sold count updated');

            // Create notification for seller
            const [sellers] = await connection.query(
                'SELECT user_id FROM sellers WHERE id = ?',
                [product.seller_id]
            );

            if (sellers.length > 0) {
                console.log('Notification would be sent to seller user_id:', sellers[0].user_id);
                // Uncomment if notification system is working
                // await notificationController.createNotification(...);
            }
        }

        // Update seller wallets and total earnings
        console.log('\n💰 Updating seller wallets...');
        for (const [sellerId, amount] of Object.entries(sellerEarnings)) {
            console.log(`Updating seller ${sellerId} wallet...`);
            
            // Update seller's wallet balance and total earnings
            const [updateResult] = await connection.query(
                `UPDATE sellers 
                 SET wallet_balance = wallet_balance + ?,
                     total_earnings = total_earnings + ?
                 WHERE id = ?`,
                [amount, amount, sellerId]
            );

            if (updateResult.affectedRows === 0) {
                throw new Error(`Failed to update seller ${sellerId} wallet`);
            }
            console.log(`✅ Seller wallet updated +${amount} ETB`);

            // Record transaction in wallet_transactions
            await connection.query(
                `INSERT INTO wallet_transactions 
                (seller_id, amount, type, status, description, reference, created_at)
                 VALUES (?, ?, 'credit', 'completed', ?, ?, NOW())`,
                [sellerId, amount, `Earnings from order #${order_number}`, order_number]
            );
            console.log('✅ Transaction recorded');
        }

        // Add to order timeline
        console.log('📅 Adding to order timeline...');
        await connection.query(
            `INSERT INTO order_timeline (order_id, status, description, created_at)
             VALUES (?, ?, ?, NOW())`,
            [orderId, 'pending', 'Order placed successfully']
        );
        console.log('✅ Timeline updated');

        // Clear user's cart
        try {
            await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
            console.log('✅ Cart cleared');
        } catch (cartError) {
            console.log('⚠️ Cart table not found or error clearing cart:', cartError.message);
            // Continue anyway - order is already created
        }

        await connection.commit();
        console.log('\n🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉');
        console.log('ORDER COMPLETED SUCCESSFULLY!');
        console.log('Order ID:', orderId);
        console.log('Order Number:', order_number);
        console.log('🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉\n');

        // Prepare order data for notifications
        const orderData = {
            id: orderId,
            order_number,
            grand_total,
            shipping_cost,
            tax_amount,
            discount_amount,
            payment_method,
            shipping_address,
            items,
            created_at: new Date().toISOString(),
            seller_earnings: sellerEarnings
        };

        // Send email confirmation
        try {
            await emailService.sendOrderConfirmationEmail(orderData, user);
            console.log('✅ Email confirmation sent');
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
        }

        // Send SMS confirmation
        if (user.phone) {
            try {
                await smsService.sendOrderConfirmationSMS(user.phone, orderData);
                console.log('✅ SMS confirmation sent');
            } catch (smsError) {
                console.error('Failed to send order confirmation SMS:', smsError);
            }
        }

        // Create notification for customer
        await notificationController.createNotification(
            req.user.id,
            'order',
            `✅ Order #${order_number} Confirmed`,
            `Your order has been confirmed and is being processed.`,
            { order_id: orderId, order_number },
            'medium',
            `/orders/${orderId}`
        );
        console.log('✅ Customer notification created');

        res.status(201).json({
            message: 'Order created successfully',
            order_id: orderId,
            order_number
        });

    } catch (error) {
        await connection.rollback();
        console.error('\n❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌');
        console.error('ORDER CREATION FAILED!');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n');
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// Get user's orders
exports.getMyOrders = async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.*, 
                    COUNT(oi.id) as item_count,
                    SUM(oi.quantity) as total_items,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'product_id', oi.product_id,
                            'name', p.name,
                            'price', oi.price,
                            'quantity', oi.quantity,
                            'image', p.image_url,
                            'seller_id', oi.seller_id,
                            'seller_amount', oi.seller_amount
                        )
                    ) as items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get single order details
exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;

        const [orders] = await db.query(
            `SELECT o.*, 
                    u.name as customer_name, 
                    u.email as customer_email,
                    u.phone as customer_phone
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.id = ? AND o.user_id = ?`,
            [orderId, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const [items] = await db.query(
            `SELECT oi.*, p.name, p.image_url, p.sku,
                    s.business_name as seller_name,
                    s.user_id as seller_user_id
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             LEFT JOIN sellers s ON oi.seller_id = s.id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        // Get order timeline
        const [timeline] = await db.query(
            `SELECT * FROM order_timeline WHERE order_id = ? ORDER BY created_at ASC`,
            [orderId]
        );

        res.json({
            order: orders[0],
            items,
            timeline
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get seller earnings for an order
exports.getOrderSellerEarnings = async (req, res) => {
    try {
        const orderId = req.params.id;

        const [earnings] = await db.query(
            `SELECT oi.seller_id, s.business_name, 
                    SUM(oi.seller_amount) as total_earnings,
                    SUM(oi.platform_fee) as platform_fees,
                    COUNT(oi.id) as items_count
             FROM order_items oi
             JOIN sellers s ON oi.seller_id = s.id
             WHERE oi.order_id = ?
             GROUP BY oi.seller_id`,
            [orderId]
        );

        res.json(earnings);
    } catch (error) {
        console.error('Error fetching order seller earnings:', error);
        res.status(500).json({ message: error.message });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const orderId = req.params.id;

        // Check if order exists and belongs to user
        const [orders] = await connection.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [orderId, req.user.id]
        );

        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orders[0];

        // Check if order can be cancelled
        if (order.status !== 'pending' && order.status !== 'confirmed') {
            await connection.rollback();
            return res.status(400).json({ 
                message: 'Only pending or confirmed orders can be cancelled' 
            });
        }

        const oldStatus = order.status;

        // Update order status
        await connection.query(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['cancelled', orderId]
        );

        // Get order items to reverse seller earnings
        const [items] = await connection.query(
            'SELECT * FROM order_items WHERE order_id = ?',
            [orderId]
        );

        // Restore stock and reverse seller earnings
        for (const item of items) {
            // Restore product stock
            await connection.query(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [item.quantity, item.product_id]
            );

            // Reverse seller earnings if payment was processed
            if (order.payment_status === 'paid') {
                await connection.query(
                    `UPDATE sellers 
                     SET wallet_balance = wallet_balance - ?,
                         total_earnings = total_earnings - ?
                     WHERE id = ?`,
                    [item.seller_amount, item.seller_amount, item.seller_id]
                );

                // Record reversal transaction
                await connection.query(
                    `INSERT INTO wallet_transactions 
                    (seller_id, amount, type, status, description, reference, created_at)
                     VALUES (?, ?, 'debit', 'completed', ?, ?, NOW())`,
                    [item.seller_id, item.seller_amount, `Reversal for cancelled order #${order.order_number}`, order.order_number]
                );
            }
        }

        // Add to timeline
        await connection.query(
            `INSERT INTO order_timeline (order_id, status, description, created_at)
             VALUES (?, ?, ?, NOW())`,
            [orderId, 'cancelled', 'Order cancelled by customer']
        );

        await connection.commit();

        // Get user details for notifications
        const [users] = await db.query(
            'SELECT name, email, phone FROM users WHERE id = ?',
            [req.user.id]
        );
        const user = users[0];

        // Send cancellation email
        try {
            await emailService.sendOrderStatusEmail(
                { ...order, status: 'cancelled' },
                user,
                oldStatus
            );
        } catch (emailError) {
            console.error('Failed to send cancellation email:', emailError);
        }

        // Send cancellation SMS
        if (user.phone) {
            try {
                await smsService.sendOrderStatusSMS(
                    user.phone,
                    { ...order, status: 'cancelled' },
                    oldStatus
                );
            } catch (smsError) {
                console.error('Failed to send cancellation SMS:', smsError);
            }
        }

        // Create notification for customer
        await notificationController.createNotification(
            req.user.id,
            'order',
            `❌ Order #${order.order_number} Cancelled`,
            `Your order has been cancelled successfully.`,
            { order_id: orderId, order_number: order.order_number },
            'high',
            `/orders/${orderId}`
        );

        // Notify sellers about cancellation
        for (const item of items) {
            const [sellers] = await connection.query(
                'SELECT user_id FROM sellers WHERE id = ?',
                [item.seller_id]
            );

            if (sellers.length > 0) {
                await notificationController.createNotification(
                    sellers[0].user_id,
                    'seller',
                    '❌ Order Cancelled',
                    `Order #${order.order_number} containing your products has been cancelled.`,
                    { order_id: orderId, order_number: order.order_number },
                    'high',
                    `/seller/orders/${orderId}`
                );
            }
        }

        res.json({ message: 'Order cancelled successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// Request order return
exports.requestReturn = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const orderId = req.params.id;
        const { reason, items } = req.body;

        // Check if order exists and belongs to user
        const [orders] = await connection.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [orderId, req.user.id]
        );

        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orders[0];

        // Check if order can be returned
        if (order.status !== 'delivered') {
            await connection.rollback();
            return res.status(400).json({ 
                message: 'Only delivered orders can be returned' 
            });
        }

        // Check if within return window (30 days)
        const deliveryDate = new Date(order.updated_at);
        const today = new Date();
        const daysSinceDelivery = Math.floor((today - deliveryDate) / (1000 * 60 * 60 * 24));

        if (daysSinceDelivery > 30) {
            await connection.rollback();
            return res.status(400).json({ 
                message: 'Return window has expired (30 days from delivery)' 
            });
        }

        // Create return request
        const [returnResult] = await connection.query(
            `INSERT INTO return_requests 
            (order_id, user_id, reason, status, items, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [orderId, req.user.id, reason, 'pending', JSON.stringify(items)]
        );

        // Update order status
        await connection.query(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            ['return_requested', orderId]
        );

        // Add to timeline
        await connection.query(
            `INSERT INTO order_timeline (order_id, status, description, created_at)
             VALUES (?, ?, ?, NOW())`,
            [orderId, 'return_requested', 'Return request submitted']
        );

        await connection.commit();

        // Get order items for notification
        const [orderItems] = await db.query(
            'SELECT DISTINCT seller_id FROM order_items WHERE order_id = ?',
            [orderId]
        );

        // Notify admin about return request
        const [admins] = await db.query(
            'SELECT id FROM users WHERE role = ?',
            ['admin']
        );

        for (const admin of admins) {
            await notificationController.createNotification(
                admin.id,
                'admin',
                '🔄 New Return Request',
                `Return request #${returnResult.insertId} for order #${order.order_number}`,
                { 
                    return_id: returnResult.insertId,
                    order_id: orderId,
                    order_number: order.order_number 
                },
                'high',
                `/admin/returns/${returnResult.insertId}`
            );
        }

        // Notify sellers
        for (const item of orderItems) {
            const [sellers] = await db.query(
                'SELECT user_id FROM sellers WHERE id = ?',
                [item.seller_id]
            );

            if (sellers.length > 0) {
                await notificationController.createNotification(
                    sellers[0].user_id,
                    'seller',
                    '🔄 Return Request',
                    `A return has been requested for order #${order.order_number}`,
                    { order_id: orderId, order_number: order.order_number },
                    'medium',
                    `/seller/orders/${orderId}`
                );
            }
        }

        // Notify user
        await notificationController.createNotification(
            req.user.id,
            'order',
            '📦 Return Request Submitted',
            `Your return request for order #${order.order_number} has been submitted.`,
            { order_id: orderId, order_number: order.order_number },
            'medium',
            `/orders/${orderId}`
        );

        res.status(201).json({ 
            message: 'Return request submitted successfully',
            return_id: returnResult.insertId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error requesting return:', error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// Reorder previous order
exports.reorder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const orderId = req.params.id;

        // Get original order items
        const [items] = await connection.query(
            `SELECT oi.product_id, oi.quantity, oi.price, p.stock, p.name, p.seller_id
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        if (items.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'No items found in original order' });
        }

        // Check stock availability
        const outOfStock = items.filter(item => item.stock < item.quantity);
        if (outOfStock.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                message: 'Some items are out of stock',
                outOfStock: outOfStock.map(item => item.name)
            });
        }

        // Generate new order number
        const order_number = generateOrderNumber();

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create new order
        const [orderResult] = await connection.query(
            `INSERT INTO orders 
            (order_number, user_id, total_amount, grand_total, status, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [order_number, req.user.id, total, total, 'pending']
        );

        const newOrderId = orderResult.insertId;

        // Platform commission rate
        const PLATFORM_COMMISSION = 0.10;
        const sellerEarnings = {};

        // Create order items and update stock
        for (const item of items) {
            const itemTotal = item.price * item.quantity;
            const sellerAmount = itemTotal * (1 - PLATFORM_COMMISSION);
            const platformFee = itemTotal * PLATFORM_COMMISSION;

            // Track seller earnings
            if (!sellerEarnings[item.seller_id]) {
                sellerEarnings[item.seller_id] = 0;
            }
            sellerEarnings[item.seller_id] += sellerAmount;

            await connection.query(
                `INSERT INTO order_items 
                (order_id, product_id, seller_id, quantity, price, total, seller_amount, platform_fee)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [newOrderId, item.product_id, item.seller_id, item.quantity, item.price, itemTotal, sellerAmount, platformFee]
            );

            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Add to timeline
        await connection.query(
            `INSERT INTO order_timeline (order_id, status, description, created_at)
             VALUES (?, ?, ?, NOW())`,
            [newOrderId, 'pending', 'Order placed via reorder']
        );

        await connection.commit();

        // Get user details for notifications
        const [users] = await db.query(
            'SELECT name, email, phone FROM users WHERE id = ?',
            [req.user.id]
        );
        const user = users[0];

        // Send reorder confirmation
        try {
            await emailService.sendOrderConfirmationEmail(
                { id: newOrderId, order_number, grand_total: total, items },
                user
            );
        } catch (emailError) {
            console.error('Failed to send reorder email:', emailError);
        }

        res.status(201).json({
            message: 'Reorder successful',
            order_id: newOrderId,
            order_number
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error reordering:', error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// Download invoice
exports.downloadInvoice = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Get order details with items
        const [orders] = await db.query(
            `SELECT o.*, u.name as customer_name, u.email, u.phone
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.id = ? AND o.user_id = ?`,
            [orderId, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orders[0];

        const [items] = await db.query(
            `SELECT oi.*, p.name, p.sku, s.business_name as seller_name
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             LEFT JOIN sellers s ON oi.seller_id = s.id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        // Generate HTML invoice
        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${order.order_number}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { font-size: 24px; font-weight: bold; color: #667eea; }
                    .invoice-title { font-size: 20px; margin: 20px 0; }
                    .details { margin-bottom: 30px; }
                    .details table { width: 100%; }
                    .details td { padding: 5px; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .items-table th { background: #667eea; color: white; padding: 10px; text-align: left; }
                    .items-table td { padding: 10px; border-bottom: 1px solid #ddd; }
                    .total-row { font-weight: bold; font-size: 16px; }
                    .footer { margin-top: 50px; text-align: center; color: #666; }
                    .seller-info { font-size: 0.8rem; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">E-Store</div>
                    <div class="invoice-title">TAX INVOICE</div>
                </div>
                
                <div class="details">
                    <table>
                        <tr>
                            <td><strong>Invoice Number:</strong></td>
                            <td>INV-${order.order_number}</td>
                            <td><strong>Order Number:</strong></td>
                            <td>${order.order_number}</td>
                        </tr>
                        <tr>
                            <td><strong>Date:</strong></td>
                            <td>${new Date(order.created_at).toLocaleDateString()}</td>
                            <td><strong>Status:</strong></td>
                            <td>${order.status}</td>
                        </tr>
                        <tr>
                            <td><strong>Customer:</strong></td>
                            <td>${order.customer_name}</td>
                            <td><strong>Email:</strong></td>
                            <td>${order.email}</td>
                        </tr>
                        <tr>
                            <td><strong>Phone:</strong></td>
                            <td>${order.phone || 'N/A'}</td>
                            <td><strong>Payment Method:</strong></td>
                            <td>${order.payment_method || 'N/A'}</td>
                        </tr>
                    </table>
                </div>
                
                <h3>Order Items</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Seller</th>
                            <th>SKU</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td class="seller-info">${item.seller_name || 'E-Store'}</td>
                                <td>${item.sku || 'N/A'}</td>
                                <td>${item.quantity}</td>
                                <td>${item.price} Br</td>
                                <td>${item.price * item.quantity} Br</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5" style="text-align: right;"><strong>Subtotal:</strong></td>
                            <td>${order.total_amount} Br</td>
                        </tr>
                        <tr>
                            <td colspan="5" style="text-align: right;"><strong>Shipping:</strong></td>
                            <td>${order.shipping_cost || 0} Br</td>
                        </tr>
                        <tr>
                            <td colspan="5" style="text-align: right;"><strong>Tax:</strong></td>
                            <td>${order.tax_amount || 0} Br</td>
                        </tr>
                        <tr>
                            <td colspan="5" style="text-align: right;"><strong>Discount:</strong></td>
                            <td>${order.discount_amount || 0} Br</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="5" style="text-align: right;"><strong>Grand Total:</strong></td>
                            <td>${order.grand_total} Br</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div class="footer">
                    <p>Thank you for shopping with E-Store!</p>
                    <p>For any questions, contact support@estore.com</p>
                </div>
            </body>
            </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.order_number}.html`);
        res.send(invoiceHTML);

    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ message: error.message });
    }
};

// Track order
exports.trackOrder = async (req, res) => {
    try {
        const { tracking_number } = req.params;

        const [orders] = await db.query(
            `SELECT o.*, u.name as customer_name
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.tracking_number = ?`,
            [tracking_number]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orders[0];

        // Get tracking history
        const [tracking] = await db.query(
            `SELECT * FROM order_timeline WHERE order_id = ? ORDER BY created_at DESC`,
            [order.id]
        );

        // Get seller information
        const [sellers] = await db.query(
            `SELECT DISTINCT s.business_name 
             FROM order_items oi
             JOIN sellers s ON oi.seller_id = s.id
             WHERE oi.order_id = ?`,
            [order.id]
        );

        // Estimate delivery date
        let estimatedDelivery = null;
        if (order.status === 'shipped') {
            const shippedDate = new Date(order.updated_at);
            estimatedDelivery = new Date(shippedDate.setDate(shippedDate.getDate() + 3));
        }

        res.json({
            order_number: order.order_number,
            status: order.status,
            tracking_number: order.tracking_number,
            estimated_delivery: estimatedDelivery,
            timeline: tracking,
            sellers: sellers.map(s => s.business_name)
        });

    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get order statistics (for dashboard)
exports.getOrderStatistics = async (req, res) => {
    try {
        const [stats] = await db.query(
            `SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
                SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned_orders,
                SUM(grand_total) as total_revenue,
                AVG(grand_total) as average_order_value
             FROM orders 
             WHERE user_id = ?`,
            [req.user.id]
        );

        // Get monthly statistics
        const [monthlyStats] = await db.query(
            `SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as order_count,
                SUM(grand_total) as revenue
             FROM orders
             WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month
             ORDER BY month DESC`,
            [req.user.id]
        );

        res.json({
            ...stats[0],
            monthly: monthlyStats
        });

    } catch (error) {
        console.error('Error fetching order statistics:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get seller order statistics (for seller dashboard)
exports.getSellerOrderStatistics = async (req, res) => {
    try {
        // Get seller ID
        const [sellers] = await db.query(
            'SELECT id FROM sellers WHERE user_id = ?',
            [req.user.id]
        );

        if (sellers.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        const sellerId = sellers[0].id;

        // Get seller-specific order stats
        const [stats] = await db.query(
            `SELECT 
                COUNT(DISTINCT o.id) as total_orders,
                SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN o.status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
                SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
                SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(oi.seller_amount) as total_earnings,
                SUM(oi.platform_fee) as total_fees,
                COUNT(oi.id) as total_items_sold
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE oi.seller_id = ? AND o.payment_status = 'paid'`,
            [sellerId]
        );

        // Get recent earnings
        const [recentEarnings] = await db.query(
            `SELECT o.order_number, o.created_at, 
                    SUM(oi.seller_amount) as earnings
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE oi.seller_id = ? AND o.payment_status = 'paid'
             GROUP BY o.id
             ORDER BY o.created_at DESC
             LIMIT 10`,
            [sellerId]
        );

        res.json({
            stats: stats[0],
            recent_earnings: recentEarnings
        });

    } catch (error) {
        console.error('Error fetching seller order statistics:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update order status (for sellers)
exports.updateSellerOrderStatus = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const orderId = req.params.id;
        const { status, tracking_number } = req.body;

        // Get seller ID
        const [sellers] = await connection.query(
            'SELECT id FROM sellers WHERE user_id = ?',
            [req.user.id]
        );

        if (sellers.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Seller not found' });
        }

        const sellerId = sellers[0].id;

        // Check if order contains seller's products
        const [orderItems] = await connection.query(
            'SELECT id FROM order_items WHERE order_id = ? AND seller_id = ?',
            [orderId, sellerId]
        );

        if (orderItems.length === 0) {
            await connection.rollback();
            return res.status(403).json({ message: 'Order does not contain your products' });
        }

        // Get order details
        const [orders] = await connection.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );

        const order = orders[0];
        const oldStatus = order.status;

        // Update order status (only for seller-specific statuses)
        const allowedStatuses = ['processing', 'shipped'];
        if (!allowedStatuses.includes(status)) {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid status update' });
        }

        await connection.query(
            'UPDATE orders SET status = ?, tracking_number = ?, updated_at = NOW() WHERE id = ?',
            [status, tracking_number || null, orderId]
        );

        // Add to timeline
        await connection.query(
            `INSERT INTO order_timeline (order_id, status, description, created_at)
             VALUES (?, ?, ?, NOW())`,
            [orderId, status, `Order status updated to ${status} by seller`]
        );

        await connection.commit();

        // Notify customer
        const [customer] = await connection.query(
            'SELECT user_id FROM orders WHERE id = ?',
            [orderId]
        );

        if (customer.length > 0) {
            await notificationController.createNotification(
                customer[0].user_id,
                'order',
                `📦 Order #${order.order_number} ${status}`,
                `Your order has been ${status}${tracking_number ? ` (Tracking: ${tracking_number})` : ''}`,
                { order_id: orderId, order_number: order.order_number, status, tracking_number },
                'high',
                `/orders/${orderId}`
            );
        }

        res.json({ message: 'Order status updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating order status:', error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// ============================================
// Create COD Order (for Cash on Delivery and Test Mode)
// ============================================
exports.createCODOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        console.log('\n💰💰💰 CREATE COD ORDER CALLED 💰💰💰');
        console.log('Request body:', req.body);
        console.log('User:', req.user?.id);

        await connection.beginTransaction();

        const orderData = req.body;
        const order_number = generateOrderNumber();
        
        console.log('📦 Generating order number:', order_number);

        // Insert order
        const [orderResult] = await connection.query(
            `INSERT INTO orders 
            (order_number, user_id, total_amount, grand_total, status, payment_status, payment_method, shipping_address, notes, created_at)
            VALUES (?, ?, ?, ?, 'processing', 'paid', ?, ?, ?, NOW())`,
            [
                order_number, 
                req.user.id, 
                orderData.grand_total, 
                orderData.grand_total,
                orderData.payment_method || 'cod',
                orderData.shipping_address,
                orderData.notes || null
            ]
        );

        const orderId = orderResult.insertId;
        console.log('✅ Order inserted with ID:', orderId);

        // Track seller earnings
        const sellerEarnings = {};

        // Insert order items
        for (const item of orderData.items) {
            console.log(`\n--- Processing item: ${item.product_id} ---`);
            
            // Get product details
            const [products] = await connection.query(
                'SELECT seller_id, stock, name FROM products WHERE id = ?',
                [item.product_id]
            );

            if (products.length === 0) {
                throw new Error(`Product ${item.product_id} not found`);
            }

            const product = products[0];
            
            // Check stock
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ID ${item.product_id}`);
            }

            // Calculate amounts
            const itemTotal = Number(item.price) * Number(item.quantity);
            const sellerAmount = itemTotal * 0.9; // 90% to seller
            const platformFee = itemTotal * 0.1;  // 10% platform fee

            console.log(`💰 Item total: ${itemTotal} ETB`);
            console.log(`💰 Seller amount: ${sellerAmount} ETB`);

            // Track seller earnings
            if (!sellerEarnings[product.seller_id]) {
                sellerEarnings[product.seller_id] = 0;
            }
            sellerEarnings[product.seller_id] += sellerAmount;

            // Insert order item
            await connection.query(
                `INSERT INTO order_items 
                (order_id, product_id, seller_id, quantity, price, total, seller_amount, platform_fee)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, product.seller_id, item.quantity, item.price, itemTotal, sellerAmount, platformFee]
            );
            console.log('✅ Order item inserted');

            // Update product stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
            console.log('✅ Stock updated');
        }

        // Update seller wallets
        console.log('\n💰 Updating seller wallets...');
        for (const [sellerId, amount] of Object.entries(sellerEarnings)) {
            console.log(`Updating seller ${sellerId} with ${amount} ETB`);
            
            // Update seller's wallet
            await connection.query(
                `UPDATE sellers 
                 SET wallet_balance = wallet_balance + ?,
                     total_earnings = total_earnings + ?
                 WHERE id = ?`,
                [amount, amount, sellerId]
            );
            console.log(`✅ Seller ${sellerId} wallet updated`);

            // Record transaction
            await connection.query(
                `INSERT INTO wallet_transactions 
                (seller_id, amount, type, status, description, reference, created_at)
                VALUES (?, ?, 'credit', 'completed', ?, ?, NOW())`,
                [sellerId, amount, `Earnings from order #${order_number}`, order_number]
            );
            console.log('✅ Transaction recorded');
        }

        // Add to timeline
        await connection.query(
            `INSERT INTO order_timeline (order_id, status, description, created_at)
             VALUES (?, 'processing', 'Order placed successfully', NOW())`,
            [orderId]
        );
        console.log('✅ Timeline updated');

        await connection.commit();
        console.log('\n🎉🎉🎉 COD ORDER CREATED SUCCESSFULLY! 🎉🎉🎉');
        console.log('Order ID:', orderId);
        console.log('Order Number:', order_number);
        console.log('Seller earnings:', sellerEarnings);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order_id: orderId,
            order_number
        });

    } catch (error) {
        await connection.rollback();
        console.error('\n❌❌❌ COD ORDER CREATION FAILED ❌❌❌');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    } finally {
        connection.release();
    }
};

// ============================================
// Save Pending Order (before payment)
// ============================================
exports.savePendingOrder = async (req, res) => {
    try {
        console.log('📦 Saving pending order for user:', req.user.id);
        
        const orderData = req.body;
        const tx_ref = 'TX-' + Date.now() + '-' + Math.random().toString(36).substring(7);

        await db.query(
            'INSERT INTO pending_orders (user_id, tx_ref, order_data, created_at) VALUES (?, ?, ?, NOW())',
            [req.user.id, tx_ref, JSON.stringify(orderData)]
        );

        console.log('✅ Pending order saved with tx_ref:', tx_ref);

        res.json({ 
            success: true, 
            tx_ref,
            message: 'Pending order saved' 
        });
    } catch (error) {
        console.error('❌ Error saving pending order:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// ============================================
// Check Order Status by tx_ref
// ============================================
exports.checkOrderStatus = async (req, res) => {
    try {
        const { tx_ref } = req.params;

        console.log('🔍 Checking order status for tx_ref:', tx_ref);

        // Check if order exists in orders table
        const [orders] = await db.query(
            `SELECT id, order_number, status 
             FROM orders 
             WHERE transaction_id = ?`,
            [tx_ref]
        );

        if (orders.length > 0) {
            return res.json({
                exists: true,
                order_id: orders[0].id,
                order_number: orders[0].order_number,
                status: orders[0].status
            });
        }

        // Check pending orders
        const [pendingOrders] = await db.query(
            'SELECT * FROM pending_orders WHERE tx_ref = ?',
            [tx_ref]
        );

        if (pendingOrders.length > 0) {
            return res.json({
                exists: false,
                pending: true,
                message: 'Order is still pending'
            });
        }

        res.json({
            exists: false,
            pending: false,
            message: 'No order found'
        });

    } catch (error) {
        console.error('Error checking order status:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = exports;