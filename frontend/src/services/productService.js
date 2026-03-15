import api from './api';

export const productService = {
    getProducts: async (params = {}, limit = null) => {
        let query = {}

        // support getProducts(page, limit)
        if (typeof params === 'number') {
            query.page = params
            if (limit) query.limit = limit
        }
        // support getProducts({page, limit})
        else if (typeof params === 'object') {
            query = params
        }

        const { data } = await api.get('/products', { params: query })
        return data
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

    getTrendingProducts: async (limit = 20) => {
        const { data } = await api.get('/products/trending', { params: { limit } });
        return data;
    },
};
