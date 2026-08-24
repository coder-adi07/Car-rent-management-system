import axios from 'axios';

// Base API configuration using VITE_API_URL environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Formatted Bengali Error Messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'সার্ভারের সাথে যোগাযোগ করতে ব্যর্থ হয়েছে।';

    if (error.response) {
      message = error.response.data?.message || message;
      // Handle unauthorized or expired token
      if (error.response.status === 401 && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    } else if (error.request) {
      message = 'নেটওয়ার্ক কানেকশন সমস্যা। ইন্টারনেট চেক করুন।';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
