import api from './axios';

export const createRecurringExpense = (groupId, data) =>
  api.post(`/groups/${groupId}/recurring`, data);

export const getRecurringExpenses = (groupId) =>
  api.get(`/groups/${groupId}/recurring`);

export const updateRecurringExpense = (groupId, recurringId, data) =>
  api.put(`/groups/${groupId}/recurring/${recurringId}`, data);

export const deleteRecurringExpense = (groupId, recurringId) =>
  api.delete(`/groups/${groupId}/recurring/${recurringId}`);
