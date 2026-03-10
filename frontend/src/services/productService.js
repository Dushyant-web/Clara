import api from './api';

export const productService = {
    getProducts: async (page = 1, limit = 10) => {
        const { data } = await api.get('/products', { params: { page, limit } });
        return data;
    },
    getProduct: async (id) => {
        const { data } = await api.get(`/products/${id}`);
        return data;
    },
    getProductImages: async (id) => {
        const { data } = await api.get(`/products/${id}/images`);
        return data;
    },
    getRelatedProducts: async (id) => {
        const { data } = await api.get(`/products/${id}/related`);
        return data;
    },
    getCategories: async () => {
        const { data } = await api.get('/categories');
        return data;
    },
    getProductsByCategory: async (slug, page = 1, limit = 40) => {
        const { data } = await api.get(`/products/category/${slug}`, { params: { page, limit } });
        return data;
    },
};
