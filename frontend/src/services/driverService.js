/**
 * Driver Service
 * Handles all driver-related API calls
 */
import api from './api';

const driverService = {
  /**
   * Get all drivers with optional filters
   * @param {Object} params - Query parameters (status, page, limit)
   * @returns {Promise} - Drivers list with pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get('/drivers', { params });
    return response.data;
  },

  /**
   * Get driver by ID
   * @param {string} id - Driver ID
   * @returns {Promise} - Driver data
   */
  getById: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  /**
   * Create new driver
   * @param {Object} driverData - Driver data
   * @returns {Promise} - Created driver
   */
  create: async (driverData) => {
    const response = await api.post('/drivers', driverData);
    return response.data;
  },

  /**
   * Update driver
   * @param {string} id - Driver ID
   * @param {Object} driverData - Updated driver data
   * @returns {Promise} - Updated driver
   */
  update: async (id, driverData) => {
    const response = await api.put(`/drivers/${id}`, driverData);
    return response.data;
  },

  /**
   * Get drivers with expiring licenses
   * @param {number} days - Days until expiry (default: 30)
   * @returns {Promise} - List of drivers with expiring licenses
   */
  getExpiringLicenses: async (days = 30) => {
    const response = await api.get('/drivers/expiring', { params: { days } });
    return response.data;
  }
};

export default driverService;
