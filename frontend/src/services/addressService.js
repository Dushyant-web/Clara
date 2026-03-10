import api from './api';

export const addressService = {
    getAddresses: async (userId) => {
        const response = await api.get(`/addresses/${userId}`);
        return response.data;
    },
    createAddress: async (addressData) => {
        const response = await api.post('/address', addressData);
        return response.data;
    },
    updateAddress: async (addressId, addressData) => {
        const response = await api.put(`/address/${addressId}`, addressData);
        return response.data;
    },
    deleteAddress: async (addressId) => {
        const response = await api.delete(`/address/${addressId}`);
        return response.data;
    }
};
