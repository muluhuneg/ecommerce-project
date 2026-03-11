const jwt = require('jsonwebtoken');

// General authentication
exports.authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Check if user is seller
exports.isSeller = (req, res, next) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Access denied. Seller only.' });
    }
    next();
};

// Check if user is customer
exports.isCustomer = (req, res, next) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Access denied. Customers only.' });
    }
    next();
};

// Check if user is admin or seller
exports.isAdminOrSeller = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Access denied. Admin or seller only.' });
    }
    next();
};