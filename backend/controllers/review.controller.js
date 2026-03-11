/* eslint-disable no-undef */
const db = require('../config/db');

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Get reviews with user info
        const [reviews] = await db.query(
            `SELECT r.*, 
                    u.name as user_name, 
                    u.profile_image as user_image,
                    COUNT(rh.id) as helpful_count,
                    EXISTS(
                        SELECT 1 FROM review_helpful 
                        WHERE review_id = r.id AND user_id = ? 
                        LIMIT 1
                    ) as user_helped
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             LEFT JOIN review_helpful rh ON r.id = rh.review_id
             WHERE r.product_id = ? AND r.is_approved = 1
             GROUP BY r.id
             ORDER BY r.created_at DESC
             LIMIT ? OFFSET ?`,
            [req.user?.id || 0, productId, limit, offset]
        );

        // Get images for each review
        for (let review of reviews) {
            const [images] = await db.query(
                'SELECT image_url FROM review_images WHERE review_id = ?',
                [review.id]
            );
            review.images = images.map(img => img.image_url);
        }

        // Get total count
        const [totalResult] = await db.query(
            'SELECT COUNT(*) as total FROM reviews WHERE product_id = ? AND is_approved = 1',
            [productId]
        );

        res.json({
            reviews,
            pagination: {
                page,
                limit,
                total: totalResult[0].total,
                pages: Math.ceil(totalResult[0].total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get review summary for a product
exports.getReviewSummary = async (req, res) => {
    try {
        const { productId } = req.params;

        // Get average rating and total count
        const [summary] = await db.query(
            `SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
             FROM reviews 
             WHERE product_id = ? AND is_approved = 1`,
            [productId]
        );

        res.json({
            totalReviews: summary[0].total_reviews || 0,
            averageRating: parseFloat(summary[0].average_rating || 0).toFixed(1),
            distribution: {
                5: summary[0].five_star || 0,
                4: summary[0].four_star || 0,
                3: summary[0].three_star || 0,
                2: summary[0].two_star || 0,
                1: summary[0].one_star || 0
            }
        });

    } catch (error) {
        console.error('Error fetching review summary:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { 
            product_id, 
            order_id,
            rating, 
            title, 
            comment,
            images 
        } = req.body;
        const user_id = req.user.id;

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if user has already reviewed this product
        const [existing] = await db.query(
            'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
            [product_id, user_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Check if user purchased this product (for verified purchase)
        let isVerifiedPurchase = false;
        if (order_id) {
            const [order] = await db.query(
                `SELECT oi.* FROM order_items oi
                 JOIN orders o ON oi.order_id = o.id
                 WHERE oi.product_id = ? AND o.user_id = ? AND o.id = ?`,
                [product_id, user_id, order_id]
            );
            isVerifiedPurchase = order.length > 0;
        }

        // Insert review
        const [result] = await db.query(
            `INSERT INTO reviews 
            (product_id, user_id, order_id, rating, title, comment, is_verified_purchase) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [product_id, user_id, order_id || null, rating, title, comment, isVerifiedPurchase]
        );

        const reviewId = result.insertId;

        // Handle images if any
        if (images && images.length > 0) {
            for (let image of images) {
                await db.query(
                    'INSERT INTO review_images (review_id, image_url) VALUES (?, ?)',
                    [reviewId, image]
                );
            }
        }

        // Update product rating
        await updateProductRating(product_id);

        res.status(201).json({
            message: 'Review submitted successfully',
            reviewId
        });

    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper function to update product rating
async function updateProductRating(productId) {
    const [summary] = await db.query(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as total 
         FROM reviews 
         WHERE product_id = ? AND is_approved = 1`,
        [productId]
    );

    await db.query(
        'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
        [summary[0].avg_rating || 0, summary[0].total || 0, productId]
    );
}

// Update a review
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, comment } = req.body;
        const user_id = req.user.id;

        // Check if review exists and belongs to user
        const [review] = await db.query(
            'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        if (review.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Update review
        await db.query(
            `UPDATE reviews 
             SET rating = ?, title = ?, comment = ?, updated_at = NOW() 
             WHERE id = ?`,
            [rating, title, comment, id]
        );

        // Update product rating
        await updateProductRating(review[0].product_id);

        res.json({ message: 'Review updated successfully' });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Check if review exists and belongs to user
        const [review] = await db.query(
            'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        if (review.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Delete review (cascade will delete images and helpful marks)
        await db.query('DELETE FROM reviews WHERE id = ?', [id]);

        // Update product rating
        await updateProductRating(review[0].product_id);

        res.json({ message: 'Review deleted successfully' });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: error.message });
    }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Check if already marked
        const [existing] = await db.query(
            'SELECT id FROM review_helpful WHERE review_id = ? AND user_id = ?',
            [id, user_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Already marked as helpful' });
        }

        // Insert helpful mark
        await db.query(
            'INSERT INTO review_helpful (review_id, user_id) VALUES (?, ?)',
            [id, user_id]
        );

        // Update helpful count
        await db.query(
            'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?',
            [id]
        );

        res.json({ message: 'Marked as helpful' });

    } catch (error) {
        console.error('Error marking helpful:', error);
        res.status(500).json({ message: error.message });
    }
};

// Unmark review as helpful
exports.unmarkHelpful = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Delete helpful mark
        await db.query(
            'DELETE FROM review_helpful WHERE review_id = ? AND user_id = ?',
            [id, user_id]
        );

        // Update helpful count
        await db.query(
            'UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = ?',
            [id]
        );

        res.json({ message: 'Removed helpful mark' });

    } catch (error) {
        console.error('Error removing helpful mark:', error);
        res.status(500).json({ message: error.message });
    }
};

// Check if user can review product
exports.canReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const user_id = req.user?.id;

        if (!user_id) {
            return res.json({ canReview: false, reason: 'Please login to review' });
        }

        // Check if already reviewed
        const [existing] = await db.query(
            'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
            [productId, user_id]
        );

        if (existing.length > 0) {
            return res.json({ canReview: false, reason: 'already_reviewed' });
        }

        // Check if purchased
        const [purchased] = await db.query(
            `SELECT oi.* FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'delivered'`,
            [productId, user_id]
        );

        if (purchased.length === 0) {
            return res.json({ 
                canReview: true, 
                verified: false,
                warning: 'You can review without purchase, but it will not be verified' 
            });
        }

        res.json({ 
            canReview: true, 
            verified: true,
            order_id: purchased[0].order_id 
        });

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({ message: error.message });
    }
};