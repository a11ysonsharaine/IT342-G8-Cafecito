import { API_ENDPOINTS } from '../config/constants';
import { TokenUtil } from './tokenUtil';

/**
 * API utility for making HTTP requests
 */
export const ApiService = {
  /**
   * Make a POST request
   */
  post: async (url, body) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...TokenUtil.getAuthHeader()
        },
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  /**
   * Make a GET request
   */
  get: async (url) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...TokenUtil.getAuthHeader()
        }
      });
      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  /**
   * Make a PUT request
   */
  put: async (url, body) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...TokenUtil.getAuthHeader()
        },
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      TokenUtil.setToken(data.token);
    }
    
    return { response, data };
  },

  /**
   * Register user
   */
  register: async (userData) => {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return { response, data: await response.json() };
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await fetch(API_ENDPOINTS.PROFILE.GET, {
      headers: TokenUtil.getAuthHeader()
    });

    if (response.ok) {
      const data = await response.json();
      return data.success && data.data ? data.data : null;
    }

    return null;
  },

  /**
   * Upload profile photo (multipart/form-data)
   */
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_ENDPOINTS.PROFILE.UPLOAD_PHOTO, {
      method: 'POST',
      headers: {
        // Do NOT set Content-Type here — browser sets it with the correct multipart boundary
        ...TokenUtil.getAuthHeader()
      },
      body: formData,
    });

    return await response.json();
  },

  /**
   * Get profile photo as an object URL suitable for use in <img src>
   * Returns a blob URL string, or null if no photo exists
   */
  getPhoto: async () => {
    const response = await fetch(API_ENDPOINTS.PROFILE.GET_PHOTO, {
      headers: TokenUtil.getAuthHeader()
    });

    if (!response.ok) return null;

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
};
