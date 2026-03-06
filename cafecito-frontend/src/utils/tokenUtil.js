import { TOKEN_KEY } from '../config/constants';

/**
 * Token utility functions for managing authentication tokens
 */
export const TokenUtil = {
  /**
   * Get the authentication token from storage
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set the authentication token in localStorage
   */
  setToken: (token, useSessionStorage = false) => {
    if (useSessionStorage) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  /**
   * Remove the authentication token from storage
   */
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Set user data in storage
   */
  setUserData: (userData) => {
    localStorage.setItem('user_data', JSON.stringify(userData));
  },

  /**
   * Get user data from storage
   */
  getUserData: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Remove user data from storage
   */
  removeUserData: () => {
    localStorage.removeItem('user_data');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!TokenUtil.getToken();
  },

  /**
   * Get authorization header for API requests
   */
  getAuthHeader: () => {
    const token = TokenUtil.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};
