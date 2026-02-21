/**
 * Maintenance Service
 * Handles all maintenance log API calls
 */
import api from './api';

const maintenanceService = {
  /**
   * Get all maintenance logs
   * @param {Object} params - Query parameters (vehicle, page, limit, startDate, endDate)
   * @returns {Promise} - Maintenance logs with pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get('/maintenance', { params });
    return response.data;
  },

  /**
   * Get maintenance log by ID
   * @param {string} id - Maintenance log ID
   * @returns {Promise} - Maintenance log data
   */
  getById: async (id) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  /**
   * Create maintenance log
   * @param {Object} data - Maintenance data (vehicle, description, cost, date)
   * @returns {Promise} - Created maintenance log
   */
  create: async (data) => {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  /**
   * Update maintenance log
   * @param {string} id - Maintenance log ID
   * @param {Object} data - Updated data (description, cost, date)
   * @returns {Promise} - Updated maintenance log
   */
  update: async (id, data) => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  /**
   * Delete maintenance log
   * @param {string} id - Maintenance log ID
   * @returns {Promise} - Success message
   */
  delete: async (id) => {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },

  /**
   * Complete maintenance
   * @param {string} id - Maintenance log ID
   * @returns {Promise} - Updated vehicle
   */
  complete: async (id) => {
    const response = await api.patch(`/maintenance/${id}/complete`);
    return response.data;
  }
};

export default maintenanceService;
