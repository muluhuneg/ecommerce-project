const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware - UPDATED CORS to include ALL Vercel frontend URLs
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:5000',
        'https://ecommerce-project-theta-liard.vercel.app',
        'https://ecommerce-project-git-master-muluhunegs-projects.vercel.app', // Add this line
        'https://ecommerce-project.vercel.app' // Add your main domain too
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// ========== ROUTES ==========
// Authentication routes
app.use('/api/auth', require('./routes/auth.routes'));

// Product routes (public)
app.use('/api/products', require('./routes/product.routes'));

// Cart routes (protected)
app.use('/api/cart', require('./routes/cart.routes'));

// Order routes
app.use('/api/orders', require('./routes/order.routes'));

// Payment routes (Chapa integration)
app.use('/api/payment', require('./routes/payment.routes'));

// Review routes
app.use('/api/reviews', require('./routes/review.routes'));

// Seller routes (protected)
app.use('/api/seller', require('./routes/seller.routes'));

// Admin routes (protected)
app.use('/api/admin', require('./routes/admin.routes'));

// Category routes (public)
app.use('/api/categories', require('./routes/category.routes'));

// Wishlist routes (protected)
app.use('/api/wishlist', require('./routes/wishlist.routes'));

// Search routes
app.use('/api/search', require('./routes/search.routes'));

// Notification routes
app.use('/api/notifications', require('./routes/notification.routes'));

// ========== TEST ROUTE ==========
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!',
        timestamp: new Date().toISOString(),
        status: 'online',
        environment: process.env.NODE_ENV || 'development',
        uploadsDir: uploadsDir
    });
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        time: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
    });
});

// ========== API DOCUMENTATION ==========
app.get('/api', (req, res) => {
    res.json({
        name: 'E-Store API',
        version: '1.0.0',
        description: 'Multi-vendor e-commerce platform API',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            cart: '/api/cart',
            orders: '/api/orders',
            payment: '/api/payment',
            reviews: '/api/reviews',
            seller: '/api/seller',
            admin: '/api/admin',
            categories: '/api/categories',
            wishlist: '/api/wishlist',
            search: '/api/search',
            notifications: '/api/notifications'
        },
        documentation: 'https://github.com/your-repo/e-commerce-api',
        status: 'online'
    });
});

// ========== STATIC FILE INFO ==========
app.get('/api/uploads/info', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        res.json({
            totalFiles: files.length,
            files: files.slice(0, 10), // Return first 10 files
            directory: uploadsDir
        });
    } catch (error) {
        res.status(500).json({ message: 'Error reading uploads directory', error: error.message });
    }
});

// ========== 404 HANDLER ==========
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Handle specific error types
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ 
            message: 'Invalid token or no token provided',
            error: 'unauthorized'
        });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            message: 'Validation error',
            errors: err.errors
        });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
            message: 'File too large. Maximum size is 5MB',
            error: 'file_too_large'
        });
    }
    
    if (err.message.includes('Only image files')) {
        return res.status(400).json({ 
            message: 'Only image files are allowed (jpeg, jpg, png, gif, webp)',
            error: 'invalid_file_type'
        });
    }

    // Default error response
    const statusCode = err.status || 500;
    res.status(statusCode).json({ 
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? {
            message: err.message,
            stack: err.stack,
            name: err.name
        } : {},
        timestamp: new Date().toISOString()
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Perform cleanup if needed
    // Don't exit the process in production, but in development we might want to
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n=================================');
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌍 Host: 0.0.0.0 (all interfaces)`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log('=================================\n');
    console.log(`🔗 Test route: http://localhost:${PORT}/api/test`);
    console.log(`💰 Payment routes: http://localhost:${PORT}/api/payment`);
    console.log(`📚 API docs: http://localhost:${PORT}/api`);
    console.log(`🖼️  Uploads: http://localhost:${PORT}/uploads`);
    console.log('=================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        // Close database connections here if needed
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        // Close database connections here if needed
        process.exit(0);
    });
});

module.exports = app;