import axios from 'axios';
import { startLoading, stopLoading } from '../components/TopLoadingBar';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://clara-xpfh.onrender.com',
});

// Add a request interceptor to include the Bearer token in all requests.
// Pass `{ silent: true }` in the axios config to skip the global TopLoadingBar
// (useful for long-running calls that have their own inline loader, e.g. AI chat).
api.interceptors.request.use((config) => {
  if (!config.silent) startLoading();

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
  if (!error?.config?.silent) stopLoading();
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  if (!response?.config?.silent) stopLoading();
  return response;
}, (error) => {
  if (!error?.config?.silent) stopLoading();
  return Promise.reject(error);
});

export default api;
