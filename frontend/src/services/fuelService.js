/**
 * Fuel Service
 * Handles all fuel log API calls
 */
import api from './api';

const fuelService = {
  /**
   * Get all fuel logs
   * @param {Object} params - Query parameters (vehicle, page, limit, startDate, endDate)
   * @returns {Promise} - Fuel logs with pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get('/fuel', { params });
    return response.data;
  },

  /**
   * Get fuel log by ID
   * @param {string} id - Fuel log ID
   * @returns {Promise} - Fuel log data
   */
  getById: async (id) => {
    const response = await api.get(`/fuel/${id}`);
    return response.data;
  },

  /**
   * Create fuel log
   * @param {Object} data - Fuel data (vehicle, liters, cost, date)
   * @returns {Promise} - Created fuel log
   */
  create: async (data) => {
    const response = await api.post('/fuel', data);
    return response.data;
  }
};

export default fuelService;
