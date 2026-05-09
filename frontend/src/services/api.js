import axios from 'axios';
import { startLoading, stopLoading } from '../components/TopLoadingBar';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://clara-xpfh.onrender.com',
});

// Add a request interceptor to include the Bearer token in all requests
api.interceptors.request.use((config) => {
  startLoading();

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const adminPassword = sessionStorage.getItem('admin_password');
  if (adminPassword) {
    config.headers['X-Admin-Password'] = adminPassword;
  }

  return config;
}, (error) => {
  stopLoading();
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  stopLoading();
  return response;
}, (error) => {
  stopLoading();
  return Promise.reject(error);
});

export default api;
