import { apiClient } from './client';

export const productApi = {
  getAll: async (search) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient(`/products${query}`);
  },

  getById: async (id) => {
    return apiClient(`/products/${id}`);
  },
};
