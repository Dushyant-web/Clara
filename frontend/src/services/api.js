import axios from 'axios';

const api = axios.create({
  baseURL: 'https://clara-xpfh.onrender.com',
});

// Add a request interceptor to include the Bearer token in all requests
api.interceptors.request.use((config) => {
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
  return Promise.reject(error);
});

export default api;
