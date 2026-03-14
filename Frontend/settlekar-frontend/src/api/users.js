import api from './axios';

export const getMe = () =>
  api.get('/users/me');

export const updateProfile = (data) =>
  api.put('/users/update-profile', data);

export const changePassword = (currentPassword, newPassword) =>
  api.post('/users/change-password', { currentPassword, newPassword });

export const setPassword = (password) =>
  api.post('/users/set-password', { password });

export const searchUsers = (query, page = 0, size = 10) =>
  api.get('/users/search', { params: { q: query, page, size } });

export const checkUsername = (username) =>
  api.get('/users/check-username', { params: { username } });
