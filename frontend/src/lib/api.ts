import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add device ID for tracking
  const deviceId = localStorage.getItem('device_id') || generateDeviceId();
  config.headers['x-device-id'] = deviceId;
  
  return config;
});

// Response interceptor - handle token expiry with auto refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('🔄 [API] Attempting to refresh access token');
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = response.data;
        
        // Update stored token
        localStorage.setItem('access_token', accessToken);
        
        // Update default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Process queued requests
        processQueue(null, accessToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error('🔴 [API] Token refresh failed:', refreshError);
        
        // Refresh failed, logout user
        processQueue(refreshError, null);
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Generate a unique device ID for tracking
function generateDeviceId(): string {
  const deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  localStorage.setItem('device_id', deviceId);
  return deviceId;
}
