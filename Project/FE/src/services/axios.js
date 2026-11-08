/**
 * Axios Instance Configuration
 * Central axios instance with interceptors for authentication and error handling
 */

import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import tokenManager from '../utils/tokenManager';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let browser set Content-Type automatically for FormData (includes boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    // Tăng timeout cho các request upload ảnh (base64 payload lớn + Cloudinary upload)
    if (config.data && typeof config.data === 'object') {
      const body = config.data;
      if (body.image || body.imageQR) {
        config.timeout = 60000; // 60s cho Cloudinary upload
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const currentToken = tokenManager.getToken();
      // Chỉ clear auth và redirect nếu thực sự có token nhưng server từ chối
      // (không redirect khi request chưa có token hoặc đang trên trang auth)
      if (currentToken) {
        tokenManager.clearAuth();
        localStorage.removeItem('user');

        if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register') &&
            !window.location.pathname.includes('/auth')) {
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      const data = error.response.data;
      
      // Account banned — dispatch event for AuthContext to handle
      if (data.code === 'ACCOUNT_BANNED') {
        tokenManager.clearAuth();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('account-banned', {
          detail: { message: data.message }
        }));
        // Kick out immediately and preserve a message for the login screen.
        const msg = encodeURIComponent(data.message || 'Tài khoản của bạn đã bị khóa.');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth')) {
          window.location.href = `/login?banned=1&message=${msg}`;
        }
        return Promise.reject(error);
      }
      
      console.error('Access denied:', data.message);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config.url);
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data.message);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error: Unable to connect to server');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
