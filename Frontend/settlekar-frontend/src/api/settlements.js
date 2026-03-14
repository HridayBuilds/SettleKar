import api from './axios';

export const getOptimizedSettlements = (groupId) =>
  api.get(`/groups/${groupId}/settlements/optimize`);

export const createSettlement = (groupId, data) =>
  api.post(`/groups/${groupId}/settlements`, data);

export const getSettlements = (groupId, page = 0, size = 10) =>
  api.get(`/groups/${groupId}/settlements`, { params: { page, size } });

export const confirmSettlement = (groupId, settlementId) =>
  api.put(`/groups/${groupId}/settlements/${settlementId}/confirm`);
