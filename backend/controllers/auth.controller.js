const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

// ========== REGISTRATION FUNCTIONS ==========

// Register customer
exports.registerCustomer = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user exists
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ? OR phone = ?',
            [email, phone]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email or phone' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 3600000); // 24 hours

        // Create user as customer
        const [result] = await db.query(
            'INSERT INTO users (name, email, phone, password, role, verification_token, verification_token_expiry) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, hashedPassword, 'customer', verificationToken, tokenExpiry]
        );

        // Create token
        const token = jwt.sign(
            { id: result.insertId, email, role: 'customer' },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );

        // Send welcome email
        try {
            await emailService.sendWelcomeEmail({ name, email });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }

        // Send verification email
        try {
            await emailService.sendVerificationEmail({ name, email }, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }

        // Send welcome SMS
        if (phone) {
            try {
                await smsService.sendWelcomeSMS(phone, name);
            } catch (smsError) {
                console.error('Failed to send welcome SMS:', smsError);
            }
        }

        res.status(201).json({
            message: 'Customer registered successfully. Please verify your email.',
            token,
            user: { id: result.insertId, name, email, phone, role: 'customer' }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Register seller
exports.registerSeller = async (req, res) => {
    try {
        const { 
            name, email, phone, password,
            business_name, business_address, business_phone, 
            business_email, tax_id, business_license 
        } = req.body;

        // Check if user exists
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ? OR phone = ?',
            [email, phone]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email or phone' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 3600000); // 24 hours

        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Create user as seller
            const [userResult] = await connection.query(
                'INSERT INTO users (name, email, phone, password, role, is_verified, verification_token, verification_token_expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, email, phone, hashedPassword, 'seller', false, verificationToken, tokenExpiry]
            );

            // Create seller record
            const [sellerResult] = await connection.query(
                `INSERT INTO sellers 
                (user_id, business_name, business_address, business_phone, business_email, tax_id, business_license, is_approved) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userResult.insertId, business_name, business_address, business_phone, business_email, tax_id, business_license, false]
            );

            await connection.commit();

            // Create token
            const token = jwt.sign(
                { id: userResult.insertId, email, role: 'seller' },
                process.env.JWT_SECRET || 'your_secret_key',
                { expiresIn: '24h' }
            );

            // Send welcome email
            try {
                await emailService.sendWelcomeEmail({ name, email });
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
            }

            // Send verification email
            try {
                await emailService.sendVerificationEmail({ name, email }, verificationToken);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
            }

            // Send welcome SMS
            if (phone) {
                try {
                    await smsService.sendWelcomeSMS(phone, name);
                } catch (smsError) {
                    console.error('Failed to send welcome SMS:', smsError);
                }
            }

            res.status(201).json({
                message: 'Seller registered successfully. Awaiting admin approval.',
                token,
                user: { 
                    id: userResult.insertId, 
                    name, email, phone, 
                    role: 'seller',
                    seller_id: sellerResult.insertId,
                    is_approved: false
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Seller registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== AUTHENTICATION FUNCTIONS ==========

// Login (works for all roles)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user with role
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check if account is active
        if (user.is_active === false) {
            return res.status(403).json({ message: 'Account has been deactivated. Please contact support.' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Get seller info if user is seller
        let sellerInfo = null;
        if (user.role === 'seller') {
            const [sellers] = await db.query('SELECT * FROM sellers WHERE user_id = ?', [user.id]);
            sellerInfo = sellers[0] || null;
        }

        // Create session record
        const sessionToken = crypto.randomBytes(32).toString('hex');
        await db.query(
            `INSERT INTO user_sessions (user_id, token, ip_address, user_agent) 
             VALUES (?, ?, ?, ?)`,
            [user.id, sessionToken, req.ip, req.headers['user-agent'] || 'Unknown']
        );

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, session: sessionToken },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );

        // Send login alert SMS (optional - for security)
        if (user.phone && user.is_phone_verified) {
            try {
                const loginTime = new Date().toLocaleString();
                const location = req.headers['x-forwarded-for'] || req.ip || 'Unknown location';
                await smsService.sendSMS(
                    user.phone,
                    `E-Store: New login to your account at ${loginTime} from ${location}. If this wasn't you, please change your password immediately.`
                );
            } catch (smsError) {
                console.error('Failed to send login alert SMS:', smsError);
            }
        }

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                is_verified: user.is_verified,
                is_phone_verified: user.is_phone_verified,
                profile_image: user.profile_image,
                two_factor_enabled: user.two_factor_enabled,
                seller: sellerInfo
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        // Get session token from JWT
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.decode(token);
            if (decoded && decoded.session) {
                await db.query('DELETE FROM user_sessions WHERE token = ?', [decoded.session]);
            }
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== PROFILE MANAGEMENT ==========

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, role, is_verified, is_phone_verified, profile_image, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Get additional data based on role
        if (user.role === 'seller') {
            const [sellers] = await db.query('SELECT * FROM sellers WHERE user_id = ?', [user.id]);
            user.seller = sellers[0] || null;
        }

        // Get order statistics
        const [orderStats] = await db.query(
            `SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders
             FROM orders WHERE user_id = ?`,
            [user.id]
        );
        user.order_stats = orderStats[0];

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, profile_image } = req.body;

        // Check if phone is being changed
        const [users] = await db.query('SELECT phone FROM users WHERE id = ?', [req.user.id]);
        const oldPhone = users[0].phone;
        const phoneChanged = phone && phone !== oldPhone;

        await db.query(
            'UPDATE users SET name = ?, phone = ?, profile_image = ? WHERE id = ?',
            [name, phone, profile_image, req.user.id]
        );

        // If phone changed, reset verification
        if (phoneChanged) {
            await db.query(
                'UPDATE users SET is_phone_verified = false WHERE id = ?',
                [req.user.id]
            );
            
            // Send SMS notification about profile update
            try {
                await smsService.sendSMS(
                    phone,
                    `E-Store: Your phone number has been updated. Please verify your new number in account settings.`
                );
            } catch (smsError) {
                console.error('Failed to send profile update SMS:', smsError);
            }
        } else {
            // Send SMS notification about profile update
            if (phone) {
                try {
                    await smsService.sendSMS(
                        phone,
                        `E-Store: Your profile information has been updated. If this wasn't you, please contact support immediately.`
                    );
                } catch (smsError) {
                    console.error('Failed to send profile update SMS:', smsError);
                }
            }
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        // Get user with password
        const [users] = await db.query('SELECT password, phone, email FROM users WHERE id = ?', [req.user.id]);
        
        // Verify current password
        const isValid = await bcrypt.compare(current_password, users[0].password);
        if (!isValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        // Invalidate all other sessions
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.decode(token);
            if (decoded && decoded.session) {
                await db.query('DELETE FROM user_sessions WHERE user_id = ? AND token != ?', [req.user.id, decoded.session]);
            }
        }

        // Send email notification about password change
        try {
            await emailService.sendPasswordChangeEmail({ email: users[0].email });
        } catch (emailError) {
            console.error('Failed to send password change email:', emailError);
        }

        // Send SMS notification about password change
        if (users[0].phone) {
            try {
                await smsService.sendSMS(
                    users[0].phone,
                    `E-Store: Your password was changed successfully. If this wasn't you, please contact support immediately.`
                );
            } catch (smsError) {
                console.error('Failed to send password change SMS:', smsError);
            }
        }

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete account
exports.deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        // Verify password
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);

        const isValid = await bcrypt.compare(password, users[0].password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Send goodbye email
        try {
            await emailService.sendGoodbyeEmail({ email: req.user.email, name: req.user.name });
        } catch (emailError) {
            console.error('Failed to send goodbye email:', emailError);
        }

        // Delete user (cascade will delete related records)
        await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== PASSWORD RESET FUNCTIONS ==========

// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save token to database
        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
            [resetToken, resetTokenExpiry, user.id]
        );

        // Send reset email
        await emailService.sendPasswordResetEmail(user, resetToken);

        // Send SMS notification about password reset request
        if (user.phone) {
            try {
                await smsService.sendSMS(
                    user.phone,
                    `E-Store: A password reset was requested for your account. If this wasn't you, please contact support immediately.`
                );
            } catch (smsError) {
                console.error('Failed to send password reset SMS:', smsError);
            }
        }

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Find user with valid token
        const [users] = await db.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = users[0];

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear token
        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        // Invalidate all sessions
        await db.query('DELETE FROM user_sessions WHERE user_id = ?', [user.id]);

        // Send confirmation email
        try {
            await emailService.sendPasswordResetConfirmationEmail(user);
        } catch (emailError) {
            console.error('Failed to send reset confirmation email:', emailError);
        }

        // Send SMS notification about successful password reset
        if (user.phone) {
            try {
                await smsService.sendSMS(
                    user.phone,
                    `E-Store: Your password has been reset successfully. You can now log in with your new password.`
                );
            } catch (smsError) {
                console.error('Failed to send password reset SMS:', smsError);
            }
        }

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== EMAIL VERIFICATION FUNCTIONS ==========

// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with this verification token
        const [users] = await db.query(
            'SELECT * FROM users WHERE verification_token = ? AND verification_token_expiry > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        const user = users[0];

        // Update user as verified
        await db.query(
            'UPDATE users SET is_verified = true, verification_token = NULL, verification_token_expiry = NULL WHERE id = ?',
            [user.id]
        );

        // Send welcome email after verification
        try {
            await emailService.sendWelcomeEmail(user);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        if (user.is_verified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 3600000); // 24 hours

        await db.query(
            'UPDATE users SET verification_token = ?, verification_token_expiry = ? WHERE id = ?',
            [verificationToken, tokenExpiry, user.id]
        );

        // Send verification email
        await emailService.sendVerificationEmail(user, verificationToken);

        res.json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== PHONE VERIFICATION FUNCTIONS ==========

// Send verification SMS
exports.sendVerificationSMS = async (req, res) => {
    try {
        const { phone } = req.body;
        const targetPhone = phone || req.user.phone;

        if (!targetPhone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save code to database
        await db.query(
            'UPDATE users SET verification_code = ?, verification_code_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?',
            [verificationCode, req.user.id]
        );

        // Send SMS with verification code
        await smsService.sendSMS(
            targetPhone,
            `E-Store: Your verification code is ${verificationCode}. Valid for 10 minutes.`
        );

        res.json({ message: 'Verification code sent successfully' });
    } catch (error) {
        console.error('Send verification SMS error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Verify phone number
exports.verifyPhone = async (req, res) => {
    try {
        const { code } = req.body;

        // Check verification code
        const [users] = await db.query(
            'SELECT * FROM users WHERE id = ? AND verification_code = ? AND verification_code_expiry > NOW()',
            [req.user.id, code]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Mark phone as verified
        await db.query(
            'UPDATE users SET is_phone_verified = true, verification_code = NULL WHERE id = ?',
            [req.user.id]
        );

        // Send confirmation SMS
        await smsService.sendSMS(
            req.user.phone,
            `E-Store: Your phone number has been verified successfully!`
        );

        res.json({ message: 'Phone number verified successfully' });
    } catch (error) {
        console.error('Verify phone error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== SESSION MANAGEMENT ==========

// Get active sessions
exports.getActiveSessions = async (req, res) => {
    try {
        const [sessions] = await db.query(
            `SELECT id, created_at, last_activity, ip_address, user_agent 
             FROM user_sessions 
             WHERE user_id = ? 
             ORDER BY last_activity DESC`,
            [req.user.id]
        );

        // Get current session token
        const currentToken = req.headers.authorization?.split(' ')[1];
        let currentSession = null;
        if (currentToken) {
            const decoded = jwt.decode(currentToken);
            currentSession = decoded?.session;
        }

        const sessionsWithCurrent = sessions.map(s => ({
            ...s,
            is_current: s.token === currentSession
        }));

        res.json(sessionsWithCurrent);
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Terminate session
exports.terminateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Check if trying to terminate current session
        const currentToken = req.headers.authorization?.split(' ')[1];
        if (currentToken) {
            const decoded = jwt.decode(currentToken);
            const [session] = await db.query('SELECT token FROM user_sessions WHERE id = ?', [sessionId]);
            if (session.length > 0 && session[0].token === decoded?.session) {
                return res.status(400).json({ message: 'Cannot terminate current session. Use logout instead.' });
            }
        }

        await db.query(
            'DELETE FROM user_sessions WHERE id = ? AND user_id = ?',
            [sessionId, req.user.id]
        );

        res.json({ message: 'Session terminated successfully' });
    } catch (error) {
        console.error('Terminate session error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Terminate all other sessions
exports.terminateAllOtherSessions = async (req, res) => {
    try {
        const currentToken = req.headers.authorization?.split(' ')[1];
        if (!currentToken) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const decoded = jwt.decode(currentToken);
        if (!decoded?.session) {
            return res.status(400).json({ message: 'Invalid session' });
        }

        await db.query(
            'DELETE FROM user_sessions WHERE user_id = ? AND token != ?',
            [req.user.id, decoded.session]
        );

        res.json({ message: 'All other sessions terminated successfully' });
    } catch (error) {
        console.error('Terminate all sessions error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== TWO-FACTOR AUTHENTICATION ==========

// Enable 2FA
exports.enable2FA = async (req, res) => {
    try {
        // In production, you'd use a library like speakeasy to generate real secrets
        const secret = crypto.randomBytes(20).toString('hex');
        
        // Store secret in database
        await db.query(
            'UPDATE users SET two_factor_secret = ?, two_factor_enabled = false WHERE id = ?',
            [secret, req.user.id]
        );

        // Generate a QR code URL (you'd use a library like qrcode to generate actual QR)
        const qrCodeUrl = `otpauth://totp/E-Store:${req.user.email}?secret=${secret}&issuer=E-Store`;

        res.json({
            message: '2FA setup initiated',
            secret: secret,
            qrCode: qrCodeUrl
        });
    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Verify and enable 2FA
exports.verifyAndEnable2FA = async (req, res) => {
    try {
        const { token } = req.body;

        // Get user's 2FA secret
        const [users] = await db.query(
            'SELECT two_factor_secret FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!users[0].two_factor_secret) {
            return res.status(400).json({ message: '2FA not initialized' });
        }

        // Verify token (simplified - in production use proper TOTP verification)
        // This is a placeholder - you'd use speakeasy.totp.verify()
        const isValid = token.length === 6 && !isNaN(token);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Enable 2FA
        await db.query(
            'UPDATE users SET two_factor_enabled = true WHERE id = ?',
            [req.user.id]
        );

        res.json({ message: '2FA enabled successfully' });
    } catch (error) {
        console.error('Verify 2FA error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
    try {
        const { password } = req.body;

        // Verify password
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);

        const isValid = await bcrypt.compare(password, users[0].password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        await db.query(
            'UPDATE users SET two_factor_secret = NULL, two_factor_enabled = false WHERE id = ?',
            [req.user.id]
        );

        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Verify 2FA during login (second step)
exports.verify2FALogin = async (req, res) => {
    try {
        const { userId, token } = req.body;

        const [users] = await db.query(
            'SELECT two_factor_secret FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify token (simplified - in production use proper TOTP verification)
        const isValid = token.length === 6 && !isNaN(token);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Generate final JWT
        const [userData] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const user = userData[0];

        const jwtToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            message: '2FA verification successful',
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('2FA login verification error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== ADMIN FUNCTIONS ==========

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [users] = await db.query(
            `SELECT id, name, email, phone, role, is_verified, is_phone_verified, 
                    is_active, two_factor_enabled, created_at 
             FROM users 
             ORDER BY created_at DESC`
        );

        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        if (!['customer', 'seller', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

        // Notify user of role change
        const [users] = await db.query('SELECT email, phone FROM users WHERE id = ?', [id]);
        const user = users[0];

        if (user.email) {
            try {
                await emailService.sendRoleChangeEmail(user.email, role);
            } catch (emailError) {
                console.error('Failed to send role change email:', emailError);
            }
        }

        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Toggle user status (admin only)
exports.toggleUserStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const { is_active } = req.body;

        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);

        // If deactivating, terminate all sessions
        if (!is_active) {
            await db.query('DELETE FROM user_sessions WHERE user_id = ?', [id]);
        }

        // Notify user of status change
        const [users] = await db.query('SELECT email, phone FROM users WHERE id = ?', [id]);
        const user = users[0];

        if (user.email) {
            try {
                await emailService.sendAccountStatusEmail(user.email, is_active);
            } catch (emailError) {
                console.error('Failed to send status change email:', emailError);
            }
        }

        res.json({ message: `User ${is_active ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Admin: Send bulk SMS to users
exports.sendBulkSMS = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { message, userRole } = req.body;

        // Get users based on role
        let query = 'SELECT phone FROM users WHERE phone IS NOT NULL AND is_phone_verified = true';
        const params = [];

        if (userRole && userRole !== 'all') {
            query += ' AND role = ?';
            params.push(userRole);
        }

        const [users] = await db.query(query, params);

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found with phone numbers' });
        }

        // Send SMS to each user
        const results = [];
        let successCount = 0;

        for (const user of users) {
            try {
                const result = await smsService.sendSMS(user.phone, message);
                results.push({ phone: user.phone, success: true, result });
                successCount++;
            } catch (error) {
                results.push({ phone: user.phone, success: false, error: error.message });
            }
        }

        res.json({
            message: `SMS sent to ${successCount} out of ${users.length} users`,
            results: results.slice(0, 10) // Return first 10 results to avoid huge response
        });
    } catch (error) {
        console.error('Bulk SMS error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Admin: Send bulk email to users
exports.sendBulkEmail = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { subject, content, userRole } = req.body;

        // Get users based on role
        let query = 'SELECT email, name FROM users WHERE email IS NOT NULL';
        const params = [];

        if (userRole && userRole !== 'all') {
            query += ' AND role = ?';
            params.push(userRole);
        }

        const [users] = await db.query(query, params);

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found with email addresses' });
        }

        // Send email to each user (in production, use a queue system)
        const results = [];
        let successCount = 0;

        for (const user of users) {
            try {
                await emailService.sendCustomEmail(user, subject, content);
                successCount++;
            } catch (error) {
                console.error(`Failed to send email to ${user.email}:`, error);
            }
        }

        res.json({
            message: `Emails sent to ${successCount} out of ${users.length} users`
        });
    } catch (error) {
        console.error('Bulk email error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ========== UTILITY FUNCTIONS ==========

// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Verify refresh token (you'd need to implement refresh token storage)
        // This is a simplified version
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret');

        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = users[0];

        // Create new access token
        const newToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Token refreshed successfully',
            token: newToken
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};