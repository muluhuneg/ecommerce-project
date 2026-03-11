const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all categories - UPDATED to handle missing columns
router.get('/', async (req, res) => {
    try {
        console.log('Fetching categories...');
        
        // First, check what columns exist
        const [columns] = await db.query('SHOW COLUMNS FROM categories');
        const columnNames = columns.map(col => col.Field);
        
        // Build query based on existing columns
        let selectColumns = 'id, name, description, created_at';
        
        if (columnNames.includes('image')) {
            selectColumns += ', image';
        }
        if (columnNames.includes('is_active')) {
            selectColumns += ', is_active';
        }
        
        // Add WHERE clause only if is_active column exists
        let whereClause = '';
        if (columnNames.includes('is_active')) {
            whereClause = 'WHERE is_active = 1';
        }
        
        const query = `SELECT ${selectColumns} FROM categories ${whereClause} ORDER BY name`;
        console.log('Query:', query);
        
        const [categories] = await db.query(query);
        console.log(`Found ${categories.length} categories`);
        
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single category - UPDATED
router.get('/:id', async (req, res) => {
    try {
        const [columns] = await db.query('SHOW COLUMNS FROM categories');
        const columnNames = columns.map(col => col.Field);
        
        let selectColumns = 'id, name, description, created_at';
        
        if (columnNames.includes('image')) {
            selectColumns += ', image';
        }
        if (columnNames.includes('is_active')) {
            selectColumns += ', is_active';
        }
        
        const [categories] = await db.query(
            `SELECT ${selectColumns} FROM categories WHERE id = ?`,
            [req.params.id]
        );
        
        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.json(categories[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get products by category
router.get('/:id/products', async (req, res) => {
    try {
        const [products] = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             JOIN categories c ON p.category_id = c.id 
             WHERE p.category_id = ? AND p.is_approved = 1
             ORDER BY p.created_at DESC`,
            [req.params.id]
        );
        res.json(products);
    } catch (error) {
        console.error('Error fetching category products:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;