import api from './api';

export const adminService = {
    // Products
    createProduct: async (productData) => {
        const response = await api.post('/admin/product', null, { params: productData });
        return response.data;
    },
    updateProduct: async (productId, productData) => {
        const response = await api.put(`/admin/product/${productId}`, null, { params: productData });
        return response.data;
    },
    deleteProduct: async (productId) => {
        const response = await api.delete(`/admin/product/${productId}`);
        return response.data;
    },

    // Variants
    createVariant: async (productId, variantData) => {
        const response = await api.post(`/admin/product/${productId}/variant`, null, { params: variantData });
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
    updatePrice: async (variantId, price) => {
        const response = await api.put(`/admin/variant/${variantId}/price`, null, { params: { price } });
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
    addProductImage: async (productId, imageUrl) => {
        const response = await api.post('/admin/admin/product-image', null, { params: { product_id: productId, image_url: imageUrl } });
        return response.data;
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
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    updateOrderStatus: async (orderId, status) => {
        const response = await api.patch(`/admin/orders/${orderId}/status`, null, { params: { status } });
        return response.data;
    },

    // Stats
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    getRevenue: async () => {
        const response = await api.get('/admin/revenue');
        return response.data;
    },

    // Refund
    refundPayment: async (paymentId, amount = null) => {
        const response = await api.post('/admin/refund', null, { params: { payment_id: paymentId, amount } });
        return response.data;
    }
};
