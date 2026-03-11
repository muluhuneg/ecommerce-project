const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Search products
router.get('/', async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, brand, sort } = req.query;
        
        let query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.is_approved = 1
        `;
        const params = [];

        // Search by keyword
        if (q) {
            query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)`;
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Filter by category
        if (category) {
            query += ` AND p.category_id = ?`;
            params.push(category);
        }

        // Filter by price range
        if (minPrice) {
            query += ` AND p.price >= ?`;
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ` AND p.price <= ?`;
            params.push(maxPrice);
        }

        // Filter by brand
        if (brand) {
            query += ` AND p.brand = ?`;
            params.push(brand);
        }

        // Sorting
        switch (sort) {
            case 'price_asc':
                query += ` ORDER BY p.price ASC`;
                break;
            case 'price_desc':
                query += ` ORDER BY p.price DESC`;
                break;
            case 'newest':
                query += ` ORDER BY p.created_at DESC`;
                break;
            case 'popular':
                query += ` ORDER BY p.views DESC`;
                break;
            case 'rating':
                query += ` ORDER BY p.rating DESC`;
                break;
            default:
                query += ` ORDER BY p.created_at DESC`;
        }

        const [products] = await db.query(query, params);
        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: error.message });
    }
});

// Autocomplete suggestions
router.get('/suggest', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.json([]);
        }

        const [suggestions] = await db.query(
            `SELECT DISTINCT name, image_url, price 
             FROM products 
             WHERE name LIKE ? AND is_approved = 1
             LIMIT 5`,
            [`%${q}%`]
        );

        res.json(suggestions);
    } catch (error) {
        console.error('Error getting suggestions:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get filter options
router.get('/filters', async (req, res) => {
    try {
        // Get unique brands
        const [brands] = await db.query(
            'SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != "" AND is_approved = 1'
        );

        // Get price range
        const [priceRange] = await db.query(
            'SELECT MIN(price) as min_price, MAX(price) as max_price FROM products WHERE is_approved = 1'
        );

        res.json({
            brands: brands.map(b => b.brand),
            minPrice: priceRange[0].min_price || 0,
            maxPrice: priceRange[0].max_price || 100000
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;