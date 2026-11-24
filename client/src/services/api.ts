import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('meditrust_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('meditrust_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh-token', { token: refreshToken });
          if (res.data.success) {
            localStorage.setItem('meditrust_access_token', res.data.data.accessToken);
            localStorage.setItem('meditrust_refresh_token', res.data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (e) {
          localStorage.removeItem('meditrust_access_token');
          localStorage.removeItem('meditrust_refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
