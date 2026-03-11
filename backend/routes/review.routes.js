/* eslint-disable no-undef */
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/product/:productId/summary', reviewController.getReviewSummary);

// Protected routes (require authentication)
router.get('/can-review/:productId', authenticate, reviewController.canReview);
router.post('/', authenticate, reviewController.createReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);
router.post('/:id/helpful', authenticate, reviewController.markHelpful);
router.delete('/:id/helpful', authenticate, reviewController.unmarkHelpful);

module.exports = router;