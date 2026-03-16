import api from './api';

export const lookbookService = {
    getLookbooks: async () => {
        const response = await api.get('/lookbooks');
        return response.data;
    },
    getLookbookImages: async (lookbookId) => {
        const response = await api.get(`/lookbooks/${lookbookId}/images`);
        return response.data;
    },
    createLookbook: async (lookbookData) => {
        const response = await api.post('/admin/lookbook', null, { params: lookbookData });
        return response.data;
    },
    deleteLookbook: async (id) => {
        const response = await api.delete(`/admin/lookbook/${id}`);
        return response.data;
    },
    addLookbookImage: async (imageData) => {
        const response = await api.post('/admin/lookbook-image', null, { params: imageData });
        return response.data;
    },
    deleteLookbookImage: async (imageId) => {
        const response = await api.delete(`/admin/lookbook-image/${imageId}`);
        return response.data;
    },
    reorderLookbookImages: async (images) => {
        // images format:
        // [{ image_id: 1, position: 0 }, { image_id: 2, position: 1 }]
        const response = await api.patch('/admin/lookbook-images/reorder', images);
        return response.data;
    }
};
