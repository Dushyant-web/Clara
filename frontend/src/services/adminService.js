import api from './api';

export const adminService = {
    // Products
    createProduct: async (productData) => {
        const response = await api.post('/admin/product', null, { params: productData });
        return response.data;
    },
    updateProduct: async (productId, productData) => {
        // Explicitly pass data as params to match the new backend signature
        const response = await api.put(`/admin/product/${productId}`, null, { params: productData });
        return response.data;
    },
    deleteProduct: async (productId) => {
        const response = await api.delete(`/admin/product/${productId}`);
        return response.data;
    },

    // Variants
    createVariant: async (productId, variantData) => {
        const response = await api.post(`/admin/product/${productId}/variant`, variantData);
        return response.data;
    },
    updateVariantFull: async (variantId, variantData) => {
        const response = await api.put(`/admin/variant-full/${variantId}`, null, { params: variantData });
        return response.data;
    },
    updateStock: async (variantId, stock) => {
        const response = await api.put(`/admin/variant/${variantId}/stock`, null, { params: { stock } });
        return response.data;
    },
    bulkUpdateStock: async (updates) => {
        const response = await api.patch('/admin/variants/bulk-stock', updates);
        return response.data;
    },
    updatePrice: async (variantId, price) => {
        const response = await api.put(`/admin/variant/${variantId}/price`, null, { params: { price } });
        return response.data;
    },
    updateVariantImage: async (variantId, imageUrl) => {
        const response = await api.post(`/admin/variant/${variantId}/image`, null, { params: { image_url: imageUrl } });
        return response.data;
    },
    deleteVariant: async (variantId) => {
        const response = await api.delete(`/admin/variant/${variantId}`);
        return response.data;
    },

    // Promos
    createPromo: async (promoData) => {
        const response = await api.post('/admin/promo', null, { params: promoData });
        return response.data;
    },
    getAllPromos: async () => {
        const response = await api.get('/admin/promos');
        return response.data;
    },
    disablePromo: async (promoId) => {
        const response = await api.put(`/admin/promo/${promoId}/disable`);
        return response.data;
    },
    deletePromo: async (promoId) => {
        const response = await api.delete(`/admin/promo/${promoId}`);
        return response.data;
    },

    // Images & Uploads
    addVariantImage(data) {
        return api.post('/admin/variant-image', null, {
            params: {
                variant_id: data.variant_id,
                image_url: data.image_url,
                type: data.type,
                position: data.position
            }
        });
    },
    addProductImage(productId, imageUrl) {
        return api.post(`/admin/product-image`, null, {
            params: {
                product_id: productId,
                image_url: imageUrl
            }
        });
    },
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    uploadVideo: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload/video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Orders & Users
    getAllOrders: async () => {
        const response = await api.get('/admin/orders');
        return response.data;
    },
    getOrderDetails: async (orderId) => {
        const response = await api.get(`/admin/order/${orderId}`);
        return response.data;
    },
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    getUserProfile: async (userId) => {
        const response = await api.get(`/admin/user/${userId}/profile`);
        return response.data;
    },
    updateOrderStatus: async (orderId, status) => {
        const response = await api.patch(`/admin/orders/${orderId}/status`, null, { params: { status } });
        return response.data;
    },

    // Reviews
    getReviews: async (rating = null) => {
        const response = await api.get('/admin/reviews', { params: { rating } });
        return response.data;
    },
    deleteReview: async (reviewId) => {
        const response = await api.delete(`/admin/review/${reviewId}`);
        return response.data;
    },
    getReviewStats: async () => {
        const response = await api.get('/admin/reviews/stats');
        return response.data;
    },
    getReviewIntelligence: async () => {
        const response = await api.get('/admin/review-intelligence');
        return response.data;
    },

    getProductReviewBreakdown: async (productId) => {
        const response = await api.get(`/admin/product-review-breakdown/${productId}`);
        return response.data;
    },

    getModerationQueue: async () => {
        const response = await api.get('/admin/review-moderation-queue');
        return response.data;
    },

    getReviewTimeline: async () => {
        const response = await api.get('/admin/review-timeline');
        return response.data;
    },
    replyToReview: async ({ review_id, reply }) => {
        const response = await api.post('/reviews/replies', {
            review_id,
            reply
        });
        return response.data;
    },

    deleteReply: async (replyId) => {
        const response = await api.delete(`/reviews/replies/${replyId}`);
        return response.data;
    },

    // Stats & Categories
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    getRevenue: async () => {
        const response = await api.get('/admin/revenue');
        return response.data;
    },
    getCategories: async () => {
        const response = await api.get('/categories');
        return response.data;
    },
    createCategory: async (categoryData) => {
        const response = await api.post('/admin/category', categoryData);
        return response.data;
    },

    // Refund
    refundPayment: async (paymentId, amount = null) => {
        // paymentId is from Razorpay, amount in paise
        const response = await api.post('/admin/refund', null, { params: { payment_id: paymentId, amount } });
        return response.data;
    }
};
