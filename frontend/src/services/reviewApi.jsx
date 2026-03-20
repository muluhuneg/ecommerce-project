import API from './api';

const reviewApi = {
    // Get reviews for a product
    getProductReviews: async (productId, page = 1, limit = 10) => {
        try {
            const response = await API.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    },

    // Get review summary for a product
    getReviewSummary: async (productId) => {
        try {
            const response = await API.get(`/reviews/product/${productId}/summary`);
            return response.data;
        } catch (error) {
            console.error('Error fetching review summary:', error);
            throw error;
        }
    },

    // Create a new review
    createReview: async (reviewData) => {
        try {
            const response = await API.post('/reviews', reviewData);
            return response.data;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    },

    // Update a review
    updateReview: async (reviewId, reviewData) => {
        try {
            const response = await API.put(`/reviews/${reviewId}`, reviewData);
            return response.data;
        } catch (error) {
            console.error('Error updating review:', error);
            throw error;
        }
    },

    // Delete a review
    deleteReview: async (reviewId) => {
        try {
            const response = await API.delete(`/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    },

    // Mark review as helpful
    markHelpful: async (reviewId) => {
        try {
            const response = await API.post(`/reviews/${reviewId}/helpful`);
            return response.data;
        } catch (error) {
            console.error('Error marking review as helpful:', error);
            throw error;
        }
    },

    // Unmark review as helpful
    unmarkHelpful: async (reviewId) => {
        try {
            const response = await API.delete(`/reviews/${reviewId}/helpful`);
            return response.data;
        } catch (error) {
            console.error('Error removing helpful mark:', error); // FIXED: changed "unmarking" to "removing"
            throw error;
        }
    },

    // Upload review images
    uploadReviewImages: async (reviewId, images) => {
        try {
            const formData = new FormData();
            // FIXED: Removed unused 'index' parameter
            images.forEach((image) => {
                formData.append('images', image);
            });
            
            const response = await API.post(
                `/reviews/${reviewId}/images`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error uploading review images:', error);
            throw error;
        }
    },

    // Get user's reviews
    getUserReviews: async (userId) => {
        try {
            const response = await API.get(`/reviews/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            throw error;
        }
    },

    // Check if user can review product
    canReview: async (productId) => {
        try {
            const response = await API.get(`/reviews/can-review/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking review eligibility:', error);
            throw error;
        }
    },

    // Admin: Get all reviews (with filters)
    getAllReviews: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await API.get(`/admin/reviews?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all reviews:', error);
            throw error;
        }
    },

    // Admin: Approve/reject review
    moderateReview: async (reviewId, action) => {
        try {
            const response = await API.put(`/admin/reviews/${reviewId}/moderate`, { action });
            return response.data;
        } catch (error) {
            console.error('Error moderating review:', error);
            throw error;
        }
    }
};

export default reviewApi;