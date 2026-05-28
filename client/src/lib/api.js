import axios from 'axios';
import toast from 'react-hot-toast';
import { env } from './env.js';
import { extractApiError } from './apiError.js';
import { ErrorCode } from './errorCodes.js';

let accessToken = null;
let onSessionExpired = null;

export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        // Deduplicate concurrent refresh calls
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }

        const res = await refreshPromise;
        accessToken = res.data.data.accessToken;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        accessToken = null;
        onSessionExpired?.();
        return Promise.reject(error);
      }
    }

    // Auto-toast for network errors and rate limiting — hooks don't need to handle these
    const { code, message } = extractApiError(error);
    if (code === ErrorCode.NETWORK_ERROR || code === ErrorCode.TIMEOUT) {
      toast.error(message, { id: code });
    } else if (code === ErrorCode.RATE_LIMITED) {
      toast.error(message, { id: ErrorCode.RATE_LIMITED });
    }

    return Promise.reject(error);
  }
);

export default api;
