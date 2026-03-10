import api from './api';

export const newsletterService = {
    subscribe: async (email) => {
        const response = await api.post('/newsletter/subscribe', { email });
        return response.data;
    },
    // Admin methods
    createNewsletter: async (data) => {
        const response = await api.post('/admin/newsletter', data);
        return response.data;
    },
    sendNewsletter: async (id) => {
        const response = await api.post('/admin/newsletter/send', { id });
        return response.data;
    }
};
