const express = require('express');
const router = express.Router();
const db = require('../config/db');

console.log('✅ ===== PRODUCT ROUTES FILE LOADED =====');
console.log('📁 Database object:', db ? 'Present ✓' : 'Missing ✗');
console.log('📁 Database type:', typeof db);
console.log('📁 Database methods:', db ? Object.keys(db) : 'N/A');
console.log('✅ ====================================');

// Get all products
router.get('/', async (req, res) => {
    console.log('\n📦 ===== PRODUCT LIST ROUTE HIT =====');
    console.log('🔍 Request URL:', req.originalUrl);
    console.log('🔍 Request Method:', req.method);
    console.log('🔍 Request Headers:', req.headers);
    console.log('🔍 Request Query:', req.query);
    
    try {
        console.log('🗄️ Attempting to execute: SELECT * FROM products');
        
        // Test database connection first
        console.log('🔄 Testing database connection...');
        const [testResult] = await db.query('SELECT 1 as connection_test');
        console.log('✅ Database connection test passed:', testResult);
        
        // Execute the actual query
        console.log('🔄 Executing products query...');
        const [products] = await db.query('SELECT * FROM products');
        
        console.log(`✅ Query successful! Found ${products.length} products`);
        
        if (products.length > 0) {
            console.log('📦 First product sample:', JSON.stringify(products[0], null, 2));
        } else {
            console.log('⚠️ No products found in database');
        }
        
        console.log('✅ Sending response with products');
        res.json(products);
        
    } catch (error) {
        console.error('\n❌ ===== DATABASE ERROR IN PRODUCTS ROUTE =====');
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error errno:', error.errno);
        console.error('❌ Error sqlState:', error.sqlState);
        console.error('❌ Error sqlMessage:', error.sqlMessage);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ ==========================================\n');
        
        // Check specific error types
        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({ 
                error: 'Database connection refused',
                message: 'Cannot connect to database server. Please check if database is running.',
                code: error.code
            });
        }
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            return res.status(500).json({ 
                error: 'Database access denied',
                message: 'Invalid database credentials. Please check username and password.',
                code: error.code
            });
        }
        
        if (error.code === 'ER_BAD_DB_ERROR') {
            return res.status(500).json({ 
                error: 'Database not found',
                message: 'The specified database does not exist. Please check database name.',
                code: error.code
            });
        }
        
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            return res.status(500).json({ 
                error: 'Database connection lost',
                message: 'The connection to the database was lost. Please try again.',
                code: error.code
            });
        }
        
        if (error.code === 'ER_PARSE_ERROR') {
            return res.status(500).json({ 
                error: 'SQL syntax error',
                message: 'There is an error in the SQL query syntax.',
                code: error.code
            });
        }
        
        // Generic error response
        res.status(500).json({ 
            error: error.message,
            code: error.code,
            name: error.name,
            message: 'An error occurred while fetching products'
        });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    console.log(`\n📦 ===== SINGLE PRODUCT ROUTE HIT =====`);
    console.log(`🔍 Product ID:`, req.params.id);
    console.log(`🔍 Request URL:`, req.originalUrl);
    
    // Validate ID
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
        console.log('❌ Invalid product ID format');
        return res.status(400).json({ 
            message: 'Invalid product ID format',
            error: 'ID must be a number'
        });
    }
    
    try {
        console.log(`🗄️ Executing: SELECT * FROM products WHERE id = ${productId}`);
        
        const [product] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        
        console.log(`✅ Query executed. Found:`, product.length > 0 ? 'Yes' : 'No');
        
        if (product.length === 0) {
            console.log(`❌ Product with ID ${productId} not found`);
            return res.status(404).json({ 
                message: 'Product not found',
                productId: productId
            });
        }
        
        console.log('✅ Product found:', JSON.stringify(product[0], null, 2));
        res.json(product[0]);
        
    } catch (error) {
        console.error('\n❌ ===== DATABASE ERROR IN SINGLE PRODUCT ROUTE =====');
        console.error('❌ Error:', error);
        console.error('❌ ================================================\n');
        
        res.status(500).json({ 
            error: error.message,
            code: error.code,
            message: 'Error fetching product'
        });
    }
});

// Optional: Add a test route to check database connection
router.get('/test/connection', async (req, res) => {
    console.log('🔄 Testing database connection...');
    
    try {
        const [result] = await db.query('SELECT 1 as connection_test');
        console.log('✅ Database connection successful:', result);
        
        // Get database info
        const [dbInfo] = await db.query('SELECT DATABASE() as db_name');
        const [tableCount] = await db.query('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()');
        
        res.json({
            success: true,
            message: 'Database connection successful',
            database: dbInfo[0].db_name,
            tables: tableCount[0].count,
            connection_test: result[0].connection_test,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message,
            code: error.code
        });
    }
});

console.log('✅ Product routes registered:');
console.log('   - GET /api/products');
console.log('   - GET /api/products/:id');
console.log('   - GET /api/products/test/connection');
console.log('✅ ====================================\n');

module.exports = router;