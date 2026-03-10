import api from './api';

export const collectionService = {
    getCollections: async () => {
        const response = await api.get('/collections');
        return response.data;
    },
    getCollectionProducts: async (slug) => {
        const response = await api.get(`/collections/${slug}/products`);
        return response.data;
    },
    getCollectionImages: async (id) => {
        const response = await api.get(`/collections/${id}/images`);
        return response.data;
    }
};
