import api from './api';

export const authService = {
    signup: async (idToken, name, email) => {
        const response = await api.post('/auth/signup', { id_token: idToken, name, email });
        return response.data;
    },
    login: async (idToken) => {
        const response = await api.post('/auth/login', { id_token: idToken });
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    }
};
