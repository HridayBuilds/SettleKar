import api from './axios';

export const createPaymentOrder = (settlementId) =>
  api.post('/payments/create-order', { settlementId });

export const verifyPayment = (data) =>
  api.post('/payments/verify', data);

export const getPayment = (paymentId) =>
  api.get(`/payments/${paymentId}`);
