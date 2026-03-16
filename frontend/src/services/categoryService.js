import api from './api';

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await api.post('/admin/category', categoryData);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/category/${id}`);
    return response.data;
  }
};