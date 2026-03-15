import api from './api';

export const reviewService = {
  getReviews: async (productId) => {
    const response = await api.get(`/reviews/${productId}`);
    return response.data;
  },

  getUserReviews: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },

  getReviewStats: async (productId) => {
    const response = await api.get(`/reviews/${productId}/stats`);
    return response.data;
  },

  createReview: async (reviewData) => {
    const response = await api.post('/reviews', {
      product_id: reviewData.product_id,
      user_id: reviewData.user_id,
      rating: reviewData.rating,
      comment: reviewData.comment,
      images: reviewData.images || [],
      videos: reviewData.videos || []
    });
    return response.data;
  },

  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, {
      product_id: reviewData.product_id,
      user_id: reviewData.user_id,
      rating: reviewData.rating,
      comment: reviewData.comment,
      images: reviewData.images || [],
      videos: reviewData.videos || []
    });
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  voteHelpful: async (reviewId, userId) => {
    const response = await api.post(`/reviews/${reviewId}/helpful`, null, {
      params: { user_id: userId }
    });
    return response.data;
  }
};