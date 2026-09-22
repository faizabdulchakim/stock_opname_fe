import { apiClient } from './client';

export const authApi = {
  login: async (email, password) => {
    return apiClient('/auth/login', {
      body: { email, password },
    });
  },

  getProfile: async () => {
    return apiClient('/auth/me');
  },
};
