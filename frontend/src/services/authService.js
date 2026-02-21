/**
 * Authentication Service
 * Handles login, register, and user management
 */
import api from './api';

const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - User data and token
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    
    // Store token and user in localStorage
    localStorage.setItem('fleetflow_token', token);
    localStorage.setItem('fleetflow_user', JSON.stringify(user));
    
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - User data and token
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data.data;
    
    localStorage.setItem('fleetflow_token', token);
    localStorage.setItem('fleetflow_user', JSON.stringify(user));
    
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise} - Current user data
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('fleetflow_token');
    localStorage.removeItem('fleetflow_user');
  },

  /**
   * Get stored user from localStorage
   * @returns {Object|null} - User object or null
   */
  getStoredUser: () => {
    const user = localStorage.getItem('fleetflow_user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('fleetflow_token');
  }
};

export default authService;
