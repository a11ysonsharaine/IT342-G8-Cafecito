import { API_ENDPOINTS } from '../constants/constants';
import { TokenUtil } from '../utils/tokenUtil';

const parseJsonSafe = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    // Some endpoints may return non-JSON or empty bodies; avoid throwing in the client.
    if (process.env.NODE_ENV !== 'production') {
      console.debug('parseJsonSafe: invalid JSON response', error);
    }
    return null;
  }
};

const clearAuthOnUnauthorized = (response, options = {}) => {
  if (!response) return;

  const { autoLogout = true } = options;
  if (!autoLogout) return;

  if (response.status === 401) {
    TokenUtil.removeToken();
    TokenUtil.removeUserData();
  }
};

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

    const data = (await parseJsonSafe(response)) || {};

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

    return { response, data: (await parseJsonSafe(response)) || {} };
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await fetch(API_ENDPOINTS.PROFILE.GET, {
      headers: TokenUtil.getAuthHeader(),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: true });
    }

    if (response.ok) {
      const data = (await parseJsonSafe(response)) || {};
      if (!(data.success && data.data)) {
        // Helpful when backend returns an unexpected shape
        console.warn('getProfile: unexpected payload', data);
      }
      return data.success && data.data ? data.data : null;
    }

    const errorPayload = (await parseJsonSafe(response)) || {};
    console.warn('getProfile failed', response.status, errorPayload);

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
        ...TokenUtil.getAuthHeader(),
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: true });
    }

    return { response, data: (await parseJsonSafe(response)) || {} };
  },

  /**
   * Change account password
   */
  changePassword: async (payload) => {
    const response = await fetch(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...TokenUtil.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: true });
    }

    return { response, data: (await parseJsonSafe(response)) || {} };
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
        ...TokenUtil.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: true });
    }

    const data = (await parseJsonSafe(response)) || {};

    if (!response.ok) {
      const fallbackMessage =
        response.status === 403
          ? 'Upload forbidden (403). Please log in again and retry.'
          : `Upload failed (${response.status})`;

      return {
        success: false,
        status: response.status,
        message: data?.message || fallbackMessage,
      };
    }

    return data;
  },

  /**
   * Get profile photo as an object URL suitable for use in <img src>
   * Returns a blob URL string, or null if no photo exists
   */
  getPhoto: async () => {
    const response = await fetch(API_ENDPOINTS.PROFILE.GET_PHOTO, {
      headers: TokenUtil.getAuthHeader(),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: true });
    }

    if (!response.ok) return null;

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  /**
   * Cart
   */
  getCart: async () => {
    const response = await fetch(API_ENDPOINTS.CART.GET, {
      headers: TokenUtil.getAuthHeader(),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: true });
    }

    return { response, data: (await parseJsonSafe(response)) || [] };
  },

  addToCart: async (payload) => {
    const params = new URLSearchParams();
    params.set('productId', payload.productId);
    params.set('quantity', String(payload.quantity || 1));

    if (payload.size) params.set('size', payload.size);
    if (payload.sugarLevel) params.set('sugarLevel', payload.sugarLevel);
    if (payload.milkType) params.set('milkType', payload.milkType);

    const response = await fetch(`${API_ENDPOINTS.CART.ADD}?${params.toString()}`, {
      method: 'POST',
      headers: TokenUtil.getAuthHeader(),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: true });
    }

    return { response, data: (await parseJsonSafe(response)) || {} };
  },

  updateCartQuantity: async (itemId, quantity) => {
    const response = await fetch(
      `${API_ENDPOINTS.CART.UPDATE(itemId)}?quantity=${encodeURIComponent(quantity)}`,
      {
        method: 'PUT',
        headers: TokenUtil.getAuthHeader(),
      }
    );

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: true });
    }

    return { response, data: (await parseJsonSafe(response)) || {} };
  },

  removeFromCart: async (itemId) => {
    const response = await fetch(API_ENDPOINTS.CART.REMOVE(itemId), {
      method: 'DELETE',
      headers: TokenUtil.getAuthHeader(),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: true });
    }

    return { response, data: (await parseJsonSafe(response)) || {} };
  },

  clearCart: async () => {
    const response = await fetch(API_ENDPOINTS.CART.CLEAR, {
      method: 'POST',
      headers: TokenUtil.getAuthHeader(),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: true });
    }

    return { response, data: (await parseJsonSafe(response)) || {} };
  },

  /**
   * Public menu
   */
  getMenuCategories: async () => {
    const response = await fetch(API_ENDPOINTS.MENU.CATEGORIES);
    return { response, data: (await parseJsonSafe(response)) || [] };
  },

  getMenuProducts: async (categoryId) => {
    const url = categoryId
      ? `${API_ENDPOINTS.MENU.PRODUCTS}?categoryId=${encodeURIComponent(categoryId)}`
      : API_ENDPOINTS.MENU.PRODUCTS;

    const response = await fetch(url);
    return { response, data: (await parseJsonSafe(response)) || [] };
  },

  /**
   * Admin menu management (JWT protected + admin role)
   */
  getAdminMenuProducts: async () => {
    const response = await fetch(API_ENDPOINTS.ADMIN.MENU_PRODUCTS, {
      headers: TokenUtil.getAuthHeader(),
    });

    if (!response.ok) {
      // Admin endpoints should never force a logout. A single 401 here could be transient
      // (e.g., backend restart) and logging out mid-form is a terrible UX.
      clearAuthOnUnauthorized(response, { autoLogout: false });
    }

    return { response, data: (await parseJsonSafe(response)) || [] };
  },

  createAdminMenuProduct: async (payload) => {
    const response = await fetch(API_ENDPOINTS.ADMIN.MENU_PRODUCTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...TokenUtil.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: false });
    }

    return { response, data: (await parseJsonSafe(response)) || {} };
  },

  updateAdminMenuProduct: async (id, payload) => {
    const response = await fetch(`${API_ENDPOINTS.ADMIN.MENU_PRODUCTS}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...TokenUtil.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: false });
    }

    return { response, data: (await parseJsonSafe(response)) || {} };
  },

  deleteAdminMenuProduct: async (id) => {
    const response = await fetch(`${API_ENDPOINTS.ADMIN.MENU_PRODUCTS}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: TokenUtil.getAuthHeader(),
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: false });
    }

    return { response, data: (await parseJsonSafe(response)) || null };
  },

  uploadAdminMenuProductImage: async (id, file, deleteOld = true) => {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_ENDPOINTS.ADMIN.MENU_PRODUCTS}/${encodeURIComponent(id)}/image?deleteOld=${deleteOld ? 'true' : 'false'}`;

    const headers = new Headers();
    headers.set('Accept', 'application/json');
    const token = TokenUtil.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('uploadAdminMenuProductImage: missing auth token; request will be unauthorized');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      clearAuthOnUnauthorized(response, { autoLogout: false });
    }

    return { response, data: (await parseJsonSafe(response)) || {} };
  },

  /**
   * Orders (JWT protected)
   */
  placeOrder: async (payload) => {
    const response = await fetch(API_ENDPOINTS.ORDERS.PLACE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...TokenUtil.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const data = (await parseJsonSafe(response)) || {};

    if (!response.ok && response.status === 401) {
      TokenUtil.removeToken();
      TokenUtil.removeUserData();
      return {
        response,
        data: {
          ...data,
          message: data?.message || 'Session expired. Please log in again and retry.',
        },
      };
    }

    return { response, data };
  },

  getMyOrders: async () => {
    const response = await fetch(API_ENDPOINTS.ORDERS.MY, {
      headers: TokenUtil.getAuthHeader(),
    });

    return { response, data: (await parseJsonSafe(response)) || [] };
  },
};