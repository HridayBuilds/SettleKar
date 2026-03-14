import api from './axios';

export const getCategoryAnalytics = (groupId) =>
  api.get(`/groups/${groupId}/analytics/category`);

export const getMonthlyAnalytics = (groupId) =>
  api.get(`/groups/${groupId}/analytics/monthly`);

export const getMemberAnalytics = (groupId) =>
  api.get(`/groups/${groupId}/analytics/member`);
