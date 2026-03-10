import api from './api';

export const wishlistService = {
    getWishlist: async (userId) => {
        const response = await api.get(`/wishlist/${userId}`);
        return response.data;
    },
    addToWishlist: async (userId, productId) => {
        const response = await api.post('/wishlist/add', null, {
            params: { user_id: userId, product_id: productId }
        });
        return response.data;
    },
    removeFromWishlist: async (userId, productId) => {
        const response = await api.delete(`/wishlist/remove/${productId}`, {
            params: { user_id: userId }
        });
        return response.data;
    }
};
