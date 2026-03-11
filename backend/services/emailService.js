const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error('Email service error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Send welcome email
exports.sendWelcomeEmail = async (user) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Welcome to E-Store! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to E-Store! 🎉</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${user.name},</h2>
                            <p>Thank you for joining E-Store! We're excited to have you as part of our community.</p>
                            
                            <h3>What you can do now:</h3>
                            <ul>
                                <li>🛍️ Browse thousands of products</li>
                                <li>❤️ Save items to your wishlist</li>
                                <li>📦 Track your orders in real-time</li>
                                <li>⭐ Leave reviews for products</li>
                            </ul>
                            
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="button">
                                Start Shopping Now
                            </a>
                            
                            <p style="margin-top: 30px;">
                                If you have any questions, feel free to contact our support team.
                            </p>
                            
                            <p>Happy Shopping!<br>The E-Store Team</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} E-Store. All rights reserved.</p>
                            <p>This email was sent to ${user.email}</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

// Send order confirmation email
exports.sendOrderConfirmationEmail = async (order, user) => {
    try {
        // Format order items for email
        const itemsList = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <img src="${item.image_url || 'https://via.placeholder.com/50'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price} Br</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price * item.quantity} Br</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: `Order Confirmed! #${order.order_number}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        table { width: 100%; border-collapse: collapse; }
                        th { text-align: left; padding: 10px; background: #f0f0f0; }
                        td { padding: 10px; }
                        .total-row { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; }
                        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Order Confirmed! ✅</h1>
                        </div>
                        <div class="content">
                            <h2>Thank you for your order, ${user.name}!</h2>
                            <p>Your order has been confirmed and is being processed.</p>
                            
                            <div class="order-details">
                                <h3>Order Summary</h3>
                                <p><strong>Order Number:</strong> #${order.order_number}</p>
                                <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                                <p><strong>Payment Method:</strong> ${order.payment_method}</p>
                                <p><strong>Shipping Address:</strong><br>
                                ${order.shipping_address}</p>
                                
                                <h4>Items Ordered:</h4>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Name</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsList}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="4" style="text-align: right;"><strong>Subtotal:</strong></td>
                                            <td>${order.subtotal} Br</td>
                                        </tr>
                                        <tr>
                                            <td colspan="4" style="text-align: right;"><strong>Shipping:</strong></td>
                                            <td>${order.shipping_cost} Br</td>
                                        </tr>
                                        <tr>
                                            <td colspan="4" style="text-align: right;"><strong>Tax:</strong></td>
                                            <td>${order.tax_amount} Br</td>
                                        </tr>
                                        <tr class="total-row">
                                            <td colspan="4" style="text-align: right;"><strong>Total:</strong></td>
                                            <td>${order.grand_total} Br</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            <h3>What's Next?</h3>
                            <ol>
                                <li>Your order will be processed within 24 hours</li>
                                <li>You'll receive shipping confirmation with tracking number</li>
                                <li>Track your order in real-time</li>
                                <li>Rate your products after delivery</li>
                            </ol>
                            
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.id}" class="button">
                                Track Your Order
                            </a>
                            
                            <p style="margin-top: 30px;">
                                Thank you for shopping with us!
                            </p>
                            
                            <p>The E-Store Team</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} E-Store. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order email:', error);
        return { success: false, error: error.message };
    }
};

// Send order status update email
exports.sendOrderStatusEmail = async (order, user, oldStatus) => {
    try {
        const statusMessages = {
            pending: 'Your order is pending confirmation',
            processing: 'Your order is being processed',
            shipped: 'Your order has been shipped!',
            delivered: 'Your order has been delivered',
            cancelled: 'Your order has been cancelled'
        };

        const statusColors = {
            pending: '#ffc107',
            processing: '#17a2b8',
            shipped: '#007bff',
            delivered: '#28a745',
            cancelled: '#dc3545'
        };

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: `Order Status Update: ${order.status.toUpperCase()} - #${order.order_number}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: ${statusColors[order.status]}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .status-badge { display: inline-block; padding: 8px 16px; background: ${statusColors[order.status]}; color: white; border-radius: 20px; font-weight: bold; }
                        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Order Status Updated</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${user.name},</h2>
                            
                            <p>The status of your order <strong>#${order.order_number}</strong> has been updated.</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <div class="status-badge">
                                    ${order.status.toUpperCase()}
                                </div>
                            </div>
                            
                            <p><strong>Previous Status:</strong> ${oldStatus}</p>
                            <p><strong>Current Status:</strong> ${order.status}</p>
                            
                            <p>${statusMessages[order.status]}</p>
                            
                            ${order.tracking_number ? `
                                <p><strong>Tracking Number:</strong> ${order.tracking_number}</p>
                            ` : ''}
                            
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.id}" class="button">
                                View Order Details
                            </a>
                            
                            <p style="margin-top: 30px;">
                                Thank you for shopping with us!
                            </p>
                            
                            <p>The E-Store Team</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} E-Store. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Status update email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending status email:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
    try {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Reset Your Password - E-Store',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                        .warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${user.name},</h2>
                            
                            <p>We received a request to reset your password for your E-Store account.</p>
                            
                            <div class="warning">
                                <strong>⚠️ This link will expire in 1 hour</strong>
                            </div>
                            
                            <a href="${resetLink}" class="button">
                                Reset Password
                            </a>
                            
                            <p style="margin-top: 20px;">
                                If you didn't request this, please ignore this email or contact support if you have concerns.
                            </p>
                            
                            <p>For your security, this link can only be used once.</p>
                            
                            <hr style="margin: 30px 0;">
                            
                            <p>The E-Store Team</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} E-Store. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending reset email:', error);
        return { success: false, error: error.message };
    }
};