import api from './api';

export const reviewService = {
    getReviews: async (productId) => {
        const response = await api.get(`/reviews/${productId}`);
        return response.data;
    },
    createReview: async (reviewData) => {
        const response = await api.post('/reviews', null, {
            params: {
                product_id: reviewData.product_id,
                user_id: reviewData.user_id,
                rating: reviewData.rating,
                comment: reviewData.comment
            }
        });
        return response.data;
    }
};
