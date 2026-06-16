import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medibridge_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const mode = localStorage.getItem('medibridge_app_mode') || 'demo';
    if (config.headers) {
      config.headers['x-app-mode'] = mode;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Response:', error.response?.data || error.message);
    const msg = error.response?.data?.message || error.message || 'An unexpected server error occurred.';
    
    // Dispatch a global toast event for automatic UI display
    window.dispatchEvent(new CustomEvent('medibridge-toast', {
      detail: {
        title: 'API Request Failed',
        message: msg,
        type: 'error'
      }
    }));

    if (error.response?.status === 401) {
      localStorage.removeItem('medibridge_token');
      localStorage.removeItem('medibridge_user');
      window.dispatchEvent(new CustomEvent('medibridge-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
