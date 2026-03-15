import api from './api'

export const categoryService = {
  async getCategories() {
    const res = await api.get('/categories')
    return res.data
  }
}