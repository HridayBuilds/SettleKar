import api from './axios';

export const createGroup = (data) =>
  api.post('/groups', data);

export const getGroups = (page = 0, size = 10) =>
  api.get('/groups', { params: { page, size } });

export const getGroup = (id) =>
  api.get(`/groups/${id}`);

export const updateGroup = (id, data) =>
  api.put(`/groups/${id}`, data);

export const deleteGroup = (id) =>
  api.delete(`/groups/${id}`);

export const lockGroup = (id) =>
  api.post(`/groups/${id}/lock`);

export const extendGroup = (id) =>
  api.post(`/groups/${id}/extend`);

export const joinGroupByCode = (joinCode) =>
  api.post(`/groups/join/${joinCode}`);

export const addMember = (groupId, username) =>
  api.post(`/groups/${groupId}/members`, { username });

export const removeMember = (groupId, userId) =>
  api.delete(`/groups/${groupId}/members/${userId}`);

export const getMembers = (groupId) =>
  api.get(`/groups/${groupId}/members`);

export const updateMemberRole = (groupId, userId, role) =>
  api.put(`/groups/${groupId}/members/${userId}/role`, null, { params: { role } });

export const getLedger = (groupId, page = 0, size = 20) =>
  api.get(`/groups/${groupId}/ledger`, { params: { page, size } });
