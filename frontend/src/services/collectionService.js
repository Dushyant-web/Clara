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
    },
    createCollection: async (collectionData) => {
        const response = await api.post('/admin/collection', null, { params: collectionData });
        return response.data;
    },
    deleteCollection: async (id) => {
        const response = await api.delete(`/admin/collection/${id}`);
        return response.data;
    },
    addCollectionImage: async (imageData) => {
        const response = await api.post('/admin/collection-image', null, { params: imageData });
        return response.data;
    },

    getCollection: async (slug) => {
        const response = await api.get(`/collections/${slug}`);
        return response.data;
    },
};

