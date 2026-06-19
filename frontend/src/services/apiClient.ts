/**
 * apiClient.ts — Production-only Axios instance.
 *
 * This client is NEVER used by demo services. It is only imported by
 * the prod implementations in services/[domain]/prod.ts.
 *
 * It reads the production storage key (medibridge_token) for JWT auth.
 * The x-app-mode header has been removed — mode is build-time, not a request header.
 */
import axios from 'axios';
import { API_BASE_URL, STORAGE } from '../config/appMode';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Always reads from the production token key — demo never reaches here
    const token = localStorage.getItem(STORAGE.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    const msg = error.response?.data?.message || error.message || 'An unexpected server error occurred.';

    // Dispatch a global toast event for automatic UI display
    window.dispatchEvent(
      new CustomEvent('medibridge-toast', {
        detail: { title: 'API Request Failed', message: msg, type: 'error' },
      })
    );

    if (error.response?.status === 401) {
      // Clear only the production storage keys — never touches demo keys
      localStorage.removeItem(STORAGE.TOKEN);
      localStorage.removeItem(STORAGE.USER);
      window.dispatchEvent(new CustomEvent('medibridge-unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
