import { API_ENDPOINTS } from '../constants/constants';
import { TokenUtil } from '../utils/tokenUtil';

/**
 * API utility for making HTTP requests
 */
export const ApiService = {
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
   * Update user profile
   */
  updateProfile: async (profileData) => {
    const response = await fetch(API_ENDPOINTS.PROFILE.UPDATE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...TokenUtil.getAuthHeader()
      },
      body: JSON.stringify(profileData),
    });

    return { response, data: await response.json() };
  },

  /**
   * Change account password
   */
  changePassword: async (payload) => {
    const response = await fetch(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...TokenUtil.getAuthHeader()
      },
      body: JSON.stringify(payload),
    });

    return { response, data: await response.json() };
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
