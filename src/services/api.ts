import axios from 'axios';

// Base API URL from TRD specifications
const API_BASE_URL = 'https://api.subhancare.pk/api/v1/';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor (injects memory JWT access token)
api.interceptors.request.use(
  (config) => {
    // In a real application, the access token is stored in memory
    // For local evaluation, we retrieve it from the active session context
    const session = localStorage.getItem('subhancare_active_user');
    if (session) {
      try {
        const user = JSON.parse(session);
        // Simulate attaching token
        config.headers.Authorization = `Bearer mock_jwt_access_token_role_${user.role}`;
      } catch {
        // Silent catch
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor (handles silent refreshes on 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expiration)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Trigger silent refresh endpoint POST /auth/refresh/
        const session = localStorage.getItem('subhancare_active_user');
        if (session) {
          const user = JSON.parse(session);
          // Mocking token refresh API call
          console.log('Intercepted 401: Refreshing JWT access token silently...');
          
          // On successful refresh, update request authorization header and retry
          originalRequest.headers.Authorization = `Bearer mock_refreshed_jwt_access_token_role_${user.role}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed/expired -> trigger logout and redirect
        localStorage.removeItem('subhancare_active_user');
        window.location.pathname = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
