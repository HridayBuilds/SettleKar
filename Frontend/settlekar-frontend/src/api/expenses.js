import api from './axios';

export const createExpense = (groupId, data) =>
  api.post(`/groups/${groupId}/expenses`, data);

export const getExpenses = (groupId, { page = 0, size = 10, sortBy = 'createdAt', direction = 'DESC' } = {}) =>
  api.get(`/groups/${groupId}/expenses`, { params: { page, size, sortBy, direction } });

export const getExpense = (groupId, expenseId) =>
  api.get(`/groups/${groupId}/expenses/${expenseId}`);

export const updateExpense = (groupId, expenseId, data) =>
  api.put(`/groups/${groupId}/expenses/${expenseId}`, data);

export const deleteExpense = (groupId, expenseId) =>
  api.delete(`/groups/${groupId}/expenses/${expenseId}`);

export const uploadReceipt = (groupId, expenseId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/groups/${groupId}/expenses/${expenseId}/receipt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const scanReceipt = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/receipts/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
