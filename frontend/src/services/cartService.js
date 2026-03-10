import api from './api';

export const cartService = {
    getCart: async (userId) => {
        const response = await api.get(`/cart/${userId}`);
        return response.data;
    },
    addToCart: async (userId, quantity, variantId) => {
        const response = await api.post('/cart/add', {
            user_id: userId,
            quantity,
            variant_id: variantId
        });
        return response.data;
    },
    removeFromCart: async (cartItemId) => {
        const response = await api.delete(`/cart/remove/${cartItemId}`);
        return response.data;
    },
    updateQuantity: async (itemId, quantity) => {
        const response = await api.put('/cart/update', {
            item_id: itemId,
            quantity
        });
        return response.data;
    }
};
