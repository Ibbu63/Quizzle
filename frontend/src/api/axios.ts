import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor to normalize error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      } else {
        message = `Request failed with status ${error.response.status}`;
      }
    } else if (error.request) {
      message = 'Unable to reach the server. Please check if the backend is running.';
    } else {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;

