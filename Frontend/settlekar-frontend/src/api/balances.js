import api from './axios';

export const getPairwiseBalances = (groupId) =>
  api.get(`/groups/${groupId}/balances`);

export const getBalanceSummary = (groupId) =>
  api.get(`/groups/${groupId}/balances/summary`);

export const getDebtGraph = (groupId) =>
  api.get(`/groups/${groupId}/balances/graph`);
