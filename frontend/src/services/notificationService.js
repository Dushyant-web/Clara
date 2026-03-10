import api from './api';

export const notificationService = {
    getNotifications: async (userId) => {
        const response = await api.get(`/notifications/${userId}`);
        return response.data;
    },
    markAsRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    }
};
