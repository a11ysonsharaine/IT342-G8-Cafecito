// API configuration constants
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
  ADMIN: {
    MENU_PRODUCTS: `${API_BASE_URL}/admin/menu/products`,
  },
  MENU: {
    CATEGORIES: `${API_BASE_URL}/menu/categories`,
    PRODUCTS: `${API_BASE_URL}/menu/products`,
  },
  PROFILE: {
    GET: `${API_BASE_URL}/profile`,
    UPDATE: `${API_BASE_URL}/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/profile/password`,
    UPLOAD_PHOTO: `${API_BASE_URL}/profile/photo`,
    GET_PHOTO: `${API_BASE_URL}/profile/photo`,
  },
  ORDERS: {
    PLACE: `${API_BASE_URL}/orders`,
    MY: `${API_BASE_URL}/orders/my`,
  }
};

// App constants
export const TOKEN_KEY = 'token';


