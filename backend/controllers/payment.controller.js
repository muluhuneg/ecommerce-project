const axios = require('axios');
const crypto = require('crypto');
const db = require('../config/db');

// Chapa configuration
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_PUBLIC_KEY = process.env.CHAPA_PUBLIC_KEY;
const CHAPA_API_URL = 'https://api.chapa.co/v1';

// Helper function to sanitize description
const sanitizeDescription = (text) => {
    if (!text) return 'Payment for order';
    // Remove any special characters that Chapa doesn't allow
    return text.replace(/[^a-zA-Z0-9\s\.\-_]/g, '').substring(0, 100);
};

// Helper function to validate email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Initialize payment
exports.initializePayment = async (req, res) => {
    try {
        console.log('=== PAYMENT INITIALIZATION ===');
        console.log('Request body:', req.body);

        // Check if API keys are configured
        if (!CHAPA_SECRET_KEY || !CHAPA_PUBLIC_KEY) {
            console.error('Missing Chapa API keys in .env file');
            return res.status(500).json({
                success: false,
                message: 'Payment gateway not configured. Please check CHAPA_API_KEYS in .env'
            });
        }

        const { 
            order_id, 
            amount, 
            currency = 'ETB', 
            description,
            customer_email,
            customer_name,
            customer_phone
        } = req.body;

        // DEBUG: Log each field individually
        console.log('DEBUG - Raw values:');
        console.log('customer_email:', customer_email);
        console.log('customer_name:', customer_name);
        console.log('customer_phone:', customer_phone);
        console.log('amount:', amount);

        // Validate required fields
        if (!amount) {
            return res.status(400).json({ 
                success: false, 
                message: 'Amount is required' 
            });
        }
        
        if (!customer_email) {
            console.error('Email is missing');
            return res.status(400).json({
                success: false,
                message: 'Customer email is required'
            });
        }
        
        if (!customer_name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Customer name is required' 
            });
        }
        
        if (!customer_phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Customer phone is required' 
            });
        }

        // Clean the email - remove spaces, convert to lowercase
        const cleanEmail = customer_email.toString().toLowerCase().trim();
        console.log('Cleaned email:', cleanEmail);

        // Validate email format
        if (!isValidEmail(cleanEmail)) {
            console.error('Email format invalid:', cleanEmail);
            return res.status(400).json({
                success: false,
                message: 'Invalid email format. Please use a valid email address like name@example.com'
            });
        }

        // Sanitize description
        const cleanDescription = sanitizeDescription(description || `Payment for order ${order_id || 'N/A'}`);

        // Use provided tx_ref from pending order (if available), otherwise generate a new one
        const tx_ref = req.body.tx_ref && req.body.tx_ref.toString().trim().length > 0
            ? req.body.tx_ref.toString().trim()
            : `TX-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

        // Split name into first and last
        const nameParts = customer_name.trim().split(' ');
        const first_name = nameParts[0] || 'Customer';
        const last_name = nameParts.slice(1).join(' ') || 'Name';

        // Clean phone number (remove non-numeric except +)
        const cleanPhone = customer_phone.replace(/[^0-9+]/g, '');

        // Prepare payment data
        const paymentData = {
            amount: amount.toString(),
            currency: currency,
            email: cleanEmail,
            first_name: first_name,
            last_name: last_name,
            phone_number: cleanPhone,
            tx_ref: tx_ref,
            callback_url: `http://localhost:5000/api/payment/verify/${tx_ref}`,
            return_url: `http://localhost:3000/order-success?tx_ref=${tx_ref}`,
            customization: {
                title: 'E-Store Payment',
                description: cleanDescription
            }
        };

        console.log('Final payment data being sent to Chapa:', JSON.stringify(paymentData, null, 2));

        // Make API request to Chapa
        const response = await axios.post(
            `${CHAPA_API_URL}/transaction/initialize`,
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Chapa response:', response.data);

        if (response.data.status === 'success') {
            // ========== FIXED: Save transaction to database ==========
            try {
                // Convert order_id to number or NULL (FIXED)
                const orderIdValue = (order_id && order_id !== 'N/A') ? parseInt(order_id) : null;
                
                await db.query(
                    `INSERT INTO transactions 
                    (order_id, tx_ref, amount, currency, status, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())`,
                    [orderIdValue, tx_ref, amount, currency, 'pending']
                );

                // Update order with transaction reference
                if (orderIdValue) {
                    await db.query(
                        'UPDATE orders SET transaction_id = ? WHERE id = ?',
                        [tx_ref, orderIdValue]
                    );
                }
                
                console.log('✅ Transaction saved successfully');
            } catch (dbError) {
                console.error('❌ Database error:', dbError.message);
                // Don't continue - this is important
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save transaction'
                });
            }

            res.json({
                success: true,
                checkout_url: response.data.data.checkout_url,
                tx_ref: tx_ref
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment initialization failed',
                details: response.data
            });
        }

    } catch (error) {
        console.error('=== CHAPA ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        // Handle specific Chapa errors
        if (error.response?.status === 401) {
            res.status(401).json({
                success: false,
                message: 'Invalid Chapa API key. Please check your CHAPA_SECRET_KEY in .env file'
            });
        } else if (error.response?.data?.message) {
            res.status(500).json({
                success: false,
                message: error.response.data.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.message || 'Payment initialization failed'
            });
        }
    }
};

// ============================================
// FIXED: Verify payment with COMPLETE order creation
// ============================================
exports.verifyPayment = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { tx_ref } = req.params;

        console.log('\n🔴🔴🔴 VERIFYING PAYMENT 🔴🔴🔴');
        console.log('tx_ref:', tx_ref);
        console.log('Time:', new Date().toLocaleString());

        // Verify with Chapa
        const response = await axios.get(
            `${CHAPA_API_URL}/transaction/verify/${tx_ref}`,
            {
                headers: {
                    'Authorization': `Bearer ${CHAPA_SECRET_KEY}`
                }
            }
        );

        console.log('Chapa verification response:', response.data);

        if (response.data.status === 'success') {
            await connection.beginTransaction();

            // 1. Update transaction status
            console.log('✅ Payment verified, updating transaction...');
            await connection.query(
                `UPDATE transactions 
                SET status = ?, verified_at = NOW() 
                WHERE tx_ref = ?`,
                ['completed', tx_ref]
            );

            // 2. Get pending order from database
            console.log('🔍 Looking for pending order with tx_ref:', tx_ref);
            const [pendingOrders] = await connection.query(
                'SELECT * FROM pending_orders WHERE tx_ref = ?',
                [tx_ref]
            );

            if (pendingOrders.length === 0) {
                console.log('❌ No pending order found for this transaction. Trying fallback to existing order record');

                // Fallback: maybe transaction already completed and pending entry deleted
                const [existingOrders] = await connection.query(
                    'SELECT id, order_number FROM orders WHERE transaction_id = ? LIMIT 1',
                    [tx_ref]
                );

                if (existingOrders.length > 0) {
                    const existingOrder = existingOrders[0];
                    console.log('✅ Existing order found for tx_ref:', existingOrder);
                    await connection.commit();
                    return res.redirect(`http://localhost:3000/order-success?order_id=${existingOrder.id}&tx_ref=${tx_ref}`);
                }

                throw new Error('No pending order found for this transaction');
            }

            const pendingOrder = pendingOrders[0];
            const orderData = JSON.parse(pendingOrder.order_data);
            console.log('✅ Found pending order for user:', pendingOrder.user_id);
            console.log('Order data:', JSON.stringify(orderData, null, 2));

            // 3. Create the actual order
            const order_number = 'ORD-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 1000);
            console.log('📦 Creating order with number:', order_number);
            
            const [orderResult] = await connection.query(
                `INSERT INTO orders 
                (order_number, user_id, total_amount, grand_total, status, payment_status, transaction_id, shipping_address, notes, created_at)
                VALUES (?, ?, ?, ?, 'processing', 'paid', ?, ?, ?, NOW())`,
                [
                    order_number, 
                    pendingOrder.user_id, 
                    orderData.grand_total, 
                    orderData.grand_total, 
                    tx_ref,
                    orderData.shipping_address || 'N/A',
                    orderData.notes || null
                ]
            );

            const orderId = orderResult.insertId;
            console.log('✅ Order inserted with ID:', orderId);

            // 4. Insert order items and update seller wallets
            console.log('📦 Processing order items...');
            const sellerEarnings = {};

            for (const item of orderData.items) {
                console.log(`\n--- Processing item: ${item.name} ---`);
                
                // Get product details with seller info
                const [products] = await connection.query(
                    'SELECT seller_id, stock, name FROM products WHERE id = ?',
                    [item.product_id]
                );

                if (products.length === 0) {
                    console.log(`❌ Product ${item.product_id} not found, skipping...`);
                    continue;
                }

                const product = products[0];
                
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

            // 5. Update seller wallets
            console.log('\n💰 Updating seller wallets...');
            for (const [sellerId, amount] of Object.entries(sellerEarnings)) {
                console.log(`Updating seller ${sellerId} with ${amount} ETB`);
                
                // Update seller's wallet balance and total earnings
                await connection.query(
                    `UPDATE sellers 
                     SET wallet_balance = wallet_balance + ?,
                         total_earnings = total_earnings + ?
                     WHERE id = ?`,
                    [amount, amount, sellerId]
                );
                console.log(`✅ Seller ${sellerId} wallet updated`);

                // Record transaction in wallet_transactions
                await connection.query(
                    `INSERT INTO wallet_transactions 
                    (seller_id, amount, type, status, description, reference, created_at)
                    VALUES (?, ?, 'credit', 'completed', ?, ?, NOW())`,
                    [sellerId, amount, `Earnings from order #${order_number}`, order_number]
                );
                console.log('✅ Transaction recorded');
            }

            // 6. Add to order timeline
            await connection.query(
                `INSERT INTO order_timeline (order_id, status, description, created_at)
                 VALUES (?, 'processing', 'Payment confirmed, order processing started', NOW())`,
                [orderId]
            );
            console.log('✅ Timeline updated');

            // 7. Delete pending order
            await connection.query('DELETE FROM pending_orders WHERE tx_ref = ?', [tx_ref]);
            console.log('✅ Pending order deleted');

            await connection.commit();
            console.log('\n🎉🎉🎉 ORDER CREATED SUCCESSFULLY! 🎉🎉🎉');
            console.log('Order ID:', orderId);
            console.log('Order Number:', order_number);
            console.log('User ID:', pendingOrder.user_id);
            console.log('Seller earnings:', sellerEarnings);

            // Redirect to success page with order_id
            res.redirect(`http://localhost:3000/order-success?order_id=${orderId}&tx_ref=${tx_ref}`);

        } else {
            console.log('❌ Payment verification failed:', response.data);
            
            // Update transaction as failed
            try {
                await connection.query(
                    'UPDATE transactions SET status = ? WHERE tx_ref = ?',
                    ['failed', tx_ref]
                );
            } catch (dbError) {
                console.error('Database error:', dbError.message);
            }

            res.redirect(`http://localhost:3000/order-failed?tx_ref=${tx_ref}`);
        }

    } catch (error) {
        await connection.rollback();
        console.error('\n❌❌❌ VERIFICATION FAILED ❌❌❌');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('❌❌❌❌❌❌❌❌❌❌❌❌❌\n');
        res.redirect(`http://localhost:3000/order-failed?error=verification_failed`);
    } finally {
        connection.release();
    }
};

// Webhook handler (for Chapa to notify server)
exports.handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-chapa-signature'];
        const payload = req.body;

        console.log('Webhook received:', payload);

        // Verify webhook signature (optional but recommended)
        if (signature) {
            const hash = crypto
                .createHmac('sha256', CHAPA_SECRET_KEY)
                .update(JSON.stringify(payload))
                .digest('hex');

            if (signature !== hash) {
                console.warn('Invalid webhook signature');
                return res.status(401).json({ message: 'Invalid signature' });
            }
        }

        const { tx_ref, status } = payload;

        if (status === 'success') {
            // Call the verify function to process the order
            // Create a mock request object
            const mockReq = { params: { tx_ref } };
            const mockRes = {
                redirect: (url) => {
                    console.log('Would redirect to:', url);
                }
            };
            
            // Process the order
            await exports.verifyPayment(mockReq, mockRes);
        }

        res.status(200).json({ message: 'Webhook received' });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

// Get transaction status
exports.getTransactionStatus = async (req, res) => {
    try {
        const { tx_ref } = req.params;

        const [transactions] = await db.query(
            `SELECT * FROM transactions WHERE tx_ref = ?`,
            [tx_ref]
        );

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(transactions[0]);

    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: error.message });
    }
};

// ============================================
// TEST FUNCTION - Create order from pending order manually
// Use this when Chapa webhook doesn't work on localhost
// ============================================
exports.createOrderFromPending = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { tx_ref } = req.params;

        console.log('\n🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧');
        console.log('MANUAL ORDER CREATION FROM PENDING');
        console.log('tx_ref:', tx_ref);
        console.log('Time:', new Date().toLocaleString());
        console.log('🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧\n');

        await connection.beginTransaction();

        // 1. Get pending order from database
        console.log('🔍 Looking for pending order with tx_ref:', tx_ref);
        const [pendingOrders] = await connection.query(
            'SELECT * FROM pending_orders WHERE tx_ref = ?',
            [tx_ref]
        );

        if (pendingOrders.length === 0) {
            console.log('❌ No pending order found for this transaction');
            return res.status(404).json({ 
                success: false, 
                message: 'No pending order found' 
            });
        }

        const pendingOrder = pendingOrders[0];
        const orderData = JSON.parse(pendingOrder.order_data);
        
        console.log('✅ Found pending order:');
        console.log('User ID:', pendingOrder.user_id);
        console.log('Order data:', JSON.stringify(orderData, null, 2));

        // 2. Generate order number
        const order_number = 'ORD-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 1000);
        console.log('📦 Creating order with number:', order_number);

        // 3. Insert into orders table
        const [orderResult] = await connection.query(
            `INSERT INTO orders 
            (order_number, user_id, total_amount, grand_total, status, payment_status, transaction_id, shipping_address, notes, created_at)
            VALUES (?, ?, ?, ?, 'processing', 'paid', ?, ?, ?, NOW())`,
            [
                order_number,
                pendingOrder.user_id,
                orderData.grand_total,
                orderData.grand_total,
                tx_ref,
                orderData.shipping_address || 'N/A',
                orderData.notes || null
            ]
        );

        const orderId = orderResult.insertId;
        console.log('✅ Order inserted with ID:', orderId);

        // 4. Process each item
        console.log('\n📦 Processing order items...');
        const sellerEarnings = {};

        for (const item of orderData.items) {
            console.log(`\n--- Processing item: ${item.name} ---`);

            // Get product details with seller info
            const [products] = await connection.query(
                'SELECT seller_id, stock, name FROM products WHERE id = ?',
                [item.product_id]
            );

            if (products.length === 0) {
                console.log(`❌ Product ${item.product_id} not found, skipping...`);
                continue;
            }

            const product = products[0];
            
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
                [
                    orderId, 
                    item.product_id, 
                    product.seller_id, 
                    item.quantity, 
                    item.price, 
                    itemTotal, 
                    sellerAmount, 
                    platformFee
                ]
            );
            console.log('✅ Order item inserted');

            // Update product stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
            console.log('✅ Stock updated');
        }

        // 5. Update seller wallets
        console.log('\n💰 Updating seller wallets...');
        for (const [sellerId, amount] of Object.entries(sellerEarnings)) {
            console.log(`Updating seller ${sellerId} with ${amount} ETB`);

            // Check current wallet
            const [seller] = await connection.query(
                'SELECT wallet_balance, total_earnings FROM sellers WHERE id = ?',
                [sellerId]
            );

            console.log('Before update:', seller[0]);

            // Update seller's wallet
            await connection.query(
                `UPDATE sellers 
                 SET wallet_balance = wallet_balance + ?,
                     total_earnings = total_earnings + ?
                 WHERE id = ?`,
                [amount, amount, sellerId]
            );
            console.log(`✅ Seller ${sellerId} wallet updated`);

            // Check after update
            const [sellerAfter] = await connection.query(
                'SELECT wallet_balance, total_earnings FROM sellers WHERE id = ?',
                [sellerId]
            );
            console.log('After update:', sellerAfter[0]);

            // Record transaction
            await connection.query(
                `INSERT INTO wallet_transactions 
                (seller_id, amount, type, status, description, reference, created_at)
                VALUES (?, ?, 'credit', 'completed', ?, ?, NOW())`,
                [sellerId, amount, `Earnings from order #${order_number}`, order_number]
            );
            console.log('✅ Transaction recorded');
        }

        // 6. Add to order timeline
        await connection.query(
            `INSERT INTO order_timeline (order_id, status, description, created_at)
             VALUES (?, 'processing', 'Payment confirmed, order processing started', NOW())`,
            [orderId]
        );
        console.log('✅ Timeline updated');

        // 7. Delete pending order
        await connection.query('DELETE FROM pending_orders WHERE tx_ref = ?', [tx_ref]);
        console.log('✅ Pending order deleted');

        await connection.commit();

        console.log('\n🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉');
        console.log('ORDER CREATED SUCCESSFULLY!');
        console.log('Order ID:', orderId);
        console.log('Order Number:', order_number);
        console.log('User ID:', pendingOrder.user_id);
        console.log('Seller earnings:', sellerEarnings);
        console.log('🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉\n');

        res.json({
            success: true,
            message: 'Order created successfully',
            order_id: orderId,
            order_number: order_number
        });

    } catch (error) {
        await connection.rollback();
        console.error('\n❌❌❌ ERROR CREATING ORDER ❌❌❌');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n');
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    } finally {
        connection.release();
    }
};

// ============================================
// NEW: Manual payment success endpoint (for testing)
// Use this to simulate successful payment without Chapa
// ============================================
exports.manualPaymentSuccess = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { tx_ref } = req.params;
        
        console.log('\n💰💰💰 MANUAL PAYMENT SUCCESS TRIGGERED 💰💰💰');
        console.log('tx_ref:', tx_ref);
        console.log('Time:', new Date().toLocaleString());

        await connection.beginTransaction();

        // 1. Get pending order
        console.log('🔍 Looking for pending order with tx_ref:', tx_ref);
        const [pendingOrders] = await connection.query(
            'SELECT * FROM pending_orders WHERE tx_ref = ?',
            [tx_ref]
        );

        if (pendingOrders.length === 0) {
            console.log('❌ No pending order found');
            return res.status(404).json({ 
                success: false, 
                message: 'Pending order not found' 
            });
        }

        const pendingOrder = pendingOrders[0];
        const orderData = JSON.parse(pendingOrder.order_data);
        
        console.log('✅ Found pending order for user:', pendingOrder.user_id);

        // 2. Generate order number
        const order_number = 'ORD-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 1000);
        console.log('📦 Creating order with number:', order_number);

        // 3. Insert into orders table
        const [orderResult] = await connection.query(
            `INSERT INTO orders 
            (order_number, user_id, total_amount, grand_total, status, payment_status, transaction_id, shipping_address, notes, created_at)
            VALUES (?, ?, ?, ?, 'processing', 'paid', ?, ?, ?, NOW())`,
            [
                order_number,
                pendingOrder.user_id,
                orderData.grand_total,
                orderData.grand_total,
                tx_ref,
                orderData.shipping_address || 'Ethiopia',
                orderData.notes || null
            ]
        );

        const orderId = orderResult.insertId;
        console.log('✅ Order inserted with ID:', orderId);

        // 4. Process order items
        console.log('\n📦 Processing order items...');
        const sellerEarnings = {};

        for (const item of orderData.items) {
            console.log(`\n--- Processing item: ${item.name} ---`);

            // Get product details with seller info
            const [products] = await connection.query(
                'SELECT seller_id, stock, name FROM products WHERE id = ?',
                [item.product_id]
            );

            if (products.length === 0) {
                console.log(`❌ Product ${item.product_id} not found, skipping...`);
                continue;
            }

            const product = products[0];
            
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
                [
                    orderId, 
                    item.product_id, 
                    product.seller_id, 
                    item.quantity, 
                    item.price, 
                    itemTotal, 
                    sellerAmount, 
                    platformFee
                ]
            );
            console.log('✅ Order item inserted');

            // Update product stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
            console.log('✅ Stock updated');
        }

        // 5. Update seller wallets
        console.log('\n💰 Updating seller wallets...');
        for (const [sellerId, amount] of Object.entries(sellerEarnings)) {
            console.log(`Updating seller ${sellerId} with ${amount} ETB`);

            // Check current wallet
            const [seller] = await connection.query(
                'SELECT wallet_balance, total_earnings FROM sellers WHERE id = ?',
                [sellerId]
            );

            console.log('Before update:', seller[0]);

            // Update seller's wallet
            await connection.query(
                `UPDATE sellers 
                 SET wallet_balance = wallet_balance + ?,
                     total_earnings = total_earnings + ?
                 WHERE id = ?`,
                [amount, amount, sellerId]
            );
            console.log(`✅ Seller ${sellerId} wallet updated`);

            // Check after update
            const [sellerAfter] = await connection.query(
                'SELECT wallet_balance, total_earnings FROM sellers WHERE id = ?',
                [sellerId]
            );
            console.log('After update:', sellerAfter[0]);

            // Record transaction
            await connection.query(
                `INSERT INTO wallet_transactions 
                (seller_id, amount, type, status, description, reference, created_at)
                VALUES (?, ?, 'credit', 'completed', ?, ?, NOW())`,
                [sellerId, amount, `Earnings from order #${order_number}`, order_number]
            );
            console.log('✅ Transaction recorded');
        }

        // 6. Add to order timeline
        await connection.query(
            `INSERT INTO order_timeline (order_id, status, description, created_at)
             VALUES (?, 'processing', 'Payment confirmed manually', NOW())`,
            [orderId]
        );
        console.log('✅ Timeline updated');

        // 7. Delete pending order
        await connection.query('DELETE FROM pending_orders WHERE tx_ref = ?', [tx_ref]);
        console.log('✅ Pending order deleted');

        await connection.commit();

        console.log('\n🎉🎉🎉 ORDER CREATED SUCCESSFULLY VIA MANUAL PAYMENT! 🎉🎉🎉');
        console.log('Order ID:', orderId);
        console.log('Order Number:', order_number);
        console.log('User ID:', pendingOrder.user_id);
        console.log('Seller earnings:', sellerEarnings);
        console.log('🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉\n');

        res.json({
            success: true,
            message: 'Payment verified and order created successfully',
            order_id: orderId,
            order_number: order_number
        });

    } catch (error) {
        await connection.rollback();
        console.error('\n❌❌❌ ERROR IN MANUAL PAYMENT ❌❌❌');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n');
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    } finally {
        connection.release();
    }
};