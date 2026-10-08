import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Support custom API_URL from environment or fallback to platform-appropriate localhost
const DEFAULT_PORT = 5000;
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_HOST}:${DEFAULT_PORT}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Could not retrieve auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
    }
    return Promise.reject(error);
  }
);

export default api;

// ── AUTH ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (studentId, password) => api.post('/auth/login', { studentId, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  getMe: () => api.get('/auth/me'),
};

// ── USERS ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  changePassword: (currentPassword, newPassword) =>
    api.patch('/users/change-password', { currentPassword, newPassword }),
};

// ── MODULES ──────────────────────────────────────────────────────────────────
export const modulesAPI = {
  getAll: (params) => api.get('/modules', { params }),
  getById: (id) => api.get(`/modules/${id}`),
  getByCode: (code) => api.get(`/modules/code/${code}`),
};

// ── CLASS GROUPS ─────────────────────────────────────────────────────────────
export const classGroupsAPI = {
  getAll: (params) => api.get('/class-groups', { params }),
  getById: (id) => api.get(`/class-groups/${id}`),
  getAlternatives: (id, conflictingGroupIds) =>
    api.get(`/class-groups/${id}/alternatives`, {
      params: { conflictingGroupIds },
    }),
};

// ── REGISTRATIONS ────────────────────────────────────────────────────────────
export const registrationsAPI = {
  get: () => api.get('/registrations'),
  create: (data) => api.post('/registrations', data),
  updateItem: (id, moduleId, classGroupId) =>
    api.patch(`/registrations/${id}/item`, { moduleId, classGroupId }),
  removeItem: (id, moduleId) => api.delete(`/registrations/${id}/item/${moduleId}`),
  confirm: (id) => api.patch(`/registrations/${id}/confirm`),
  cancel: (id) => api.delete(`/registrations/${id}`),
  checkClashes: (classGroupIds) =>
    api.get('/registrations/clash-check', { params: { classGroupIds } }),
};

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: (filter) => api.get('/notifications', { params: { filter } }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
};

// ── ADVISOR REQUESTS ─────────────────────────────────────────────────────────
export const advisorAPI = {
  createRequest: (data) => api.post('/advisor/requests', data),
  getRequests: () => api.get('/advisor/requests'),
  getRequestById: (id) => api.get(`/advisor/requests/${id}`),
  updateRequest: (id, data) => api.patch(`/advisor/requests/${id}`, data),
};

// ── ADMIN ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStatus: () => api.get('/admin/status'),
};
