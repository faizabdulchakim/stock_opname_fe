const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Custom Fetch API client dengan otomatis menyertakan Authorization Bearer Token
 */
export async function apiClient(endpoint, { body, ...customConfig } = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      const errorMsg = data.message || 'Terjadi kesalahan saat menghubungi server';
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Gagal terhubung ke Backend API. Pastikan server Backend aktif di port 3000.');
    }
    throw err;
  }
}
