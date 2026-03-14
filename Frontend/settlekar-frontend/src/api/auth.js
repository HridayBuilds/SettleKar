import api from './axios';

const BACKEND_URL = 'http://localhost:8080';

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const signup = ({ email, password, firstName, lastName }) =>
  api.post('/auth/signup', { email, password, firstName, lastName });

export const verifyEmail = (token) =>
  api.get('/auth/verify', { params: { token } });

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', { token, newPassword });

export const validateResetToken = (token) =>
  api.get('/auth/validate-reset-token', { params: { token } });

export const getGoogleOAuthUrl = () =>
  `${BACKEND_URL}/oauth2/authorize/google`;

export const healthCheck = () =>
  api.get('/auth/health');
