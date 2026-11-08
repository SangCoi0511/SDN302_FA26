/**
 * Token Manager
 * Handles JWT token storage and retrieval
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
// Keep in sync with AuthContext storage key
const USER_KEY = 'user';

export const tokenManager = {
  /**
   * Get access token from localStorage
   * @returns {string|null} Access token or null
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set access token in localStorage
   * @param {string} token - Access token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  /**
   * Get refresh token from localStorage
   * @returns {string|null} Refresh token or null
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set refresh token in localStorage
   * @param {string} token - Refresh token
   */
  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  /**
   * Get user data from localStorage
   * @returns {object|null} User object or null
   */
  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Set user data in localStorage
   * @param {object} user - User object
   */
  setUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Remove all auth data from localStorage
   */
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Cleanup legacy/alternate keys if they exist
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  },
};

export default tokenManager;
