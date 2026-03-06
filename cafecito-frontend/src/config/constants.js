// API configuration constants
export const API_BASE_URL = 'http://localhost:8080/api';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
  PROFILE: {
    GET: `${API_BASE_URL}/profile`,
    UPDATE: `${API_BASE_URL}/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/profile/password`,
    UPLOAD_PHOTO: `${API_BASE_URL}/profile/photo`,
    GET_PHOTO: `${API_BASE_URL}/profile/photo`,
  }
};

// App constants
export const TOKEN_KEY = 'token';
