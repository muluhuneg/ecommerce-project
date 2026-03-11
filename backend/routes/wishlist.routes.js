const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// Get user's wishlist
router.get('/', authenticate, async (req, res) => {
    try {
        const [wishlist] = await db.query(
            `SELECT w.*, p.name, p.price, p.discount_price, p.image_url, p.stock,
                    c.name as category_name
             FROM wishlist w
             JOIN products p ON w.product_id = p.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE w.user_id = ?
             ORDER BY w.created_at DESC`,
            [req.user.id]
        );
        res.json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add to wishlist
router.post('/add', authenticate, async (req, res) => {
    try {
        const { product_id } = req.body;

        // Check if product exists
        const [products] = await db.query('SELECT id FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if already in wishlist
        const [existing] = await db.query(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        // Add to wishlist
        await db.query(
            'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
            [req.user.id, product_id]
        );

        res.json({ message: 'Added to wishlist successfully' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: error.message });
    }
});

// Remove from wishlist
router.delete('/remove/:productId', authenticate, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user.id, req.params.productId]
        );
        res.json({ message: 'Removed from wishlist successfully' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: error.message });
    }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticate, async (req, res) => {
    try {
        const [result] = await db.query(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user.id, req.params.productId]
        );
        res.json({ inWishlist: result.length > 0 });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        res.status(500).json({ message: error.message });
    }
});

// Clear wishlist
router.delete('/clear', authenticate, async (req, res) => {
    try {
        await db.query('DELETE FROM wishlist WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Wishlist cleared successfully' });
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;