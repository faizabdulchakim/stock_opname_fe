import { apiClient } from './client';

export const auditApi = {
  getAllSessions: async (status) => {
    const query = status ? `?status=${status}` : '';
    return apiClient(`/audit-sessions${query}`);
  },

  getSessionById: async (id) => {
    return apiClient(`/audit-sessions/${id}`);
  },

  createSession: async (data) => {
    return apiClient('/audit-sessions', {
      body: data,
    });
  },

  submitCounts: async (sessionId, items) => {
    return apiClient(`/audit-sessions/${sessionId}/submit-counts`, {
      body: { items },
    });
  },

  approveSession: async (sessionId) => {
    return apiClient(`/audit-sessions/${sessionId}/approve`, {
      body: {},
    });
  },

  rejectSession: async (sessionId, reason) => {
    return apiClient(`/audit-sessions/${sessionId}/reject`, {
      body: { reason },
    });
  },

  getAuditLogs: async () => {
    return apiClient('/audit-sessions/logs/audit-history');
  },
};
