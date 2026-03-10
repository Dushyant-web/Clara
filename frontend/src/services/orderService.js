import api from './api';

export const orderService = {
    getUserOrders: async (userId) => {
        const response = await api.get(`/orders/${userId}`);
        return response.data;
    },
    getOrder: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },
    createCheckout: async (userId, idempotencyKey = null, promoCode = null) => {
        let url = `/checkout?user_id=${userId}`;
        if (idempotencyKey) url += `&idempotency_key=${idempotencyKey}`;
        if (promoCode) url += `&promo_code=${promoCode}`;

        const response = await api.post(url);
        return response.data;
    },
    initiatePayment: async (orderId, provider) => {
        const response = await api.post('/payment/create', { order_id: orderId, provider });
        return response.data;
    },
    getPaymentConfig: async () => {
        const response = await api.get('/payment/config');
        return response.data;
    },
    confirmPayment: async (paymentId, transactionId) => {
        const response = await api.post('/payment/confirm', { payment_id: paymentId, transaction_id: transactionId });
        return response.data;
    },
    getInvoice: async (orderId) => {
        const response = await api.get(`/invoice/${orderId}`, { responseType: 'blob' });
        return response.data;
    },
    applyPromo: async (code, userId, orderId = null) => {
        const response = await api.post('/promo/apply', {
            code,
            user_id: userId,
            order_id: orderId
        });
        return response.data;
    },
    getPaymentStatus: async (orderId) => {
        const response = await api.get(`/payment/status/${orderId}`);
        return response.data;
    },
    reserveStock: async (data) => {
        const response = await api.post('/reserve', data);
        return response.data;
    }
};
