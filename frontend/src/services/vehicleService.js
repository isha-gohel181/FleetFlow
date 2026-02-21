/**
 * Vehicle Service
 * Handles all vehicle-related API calls
 */
import api from './api';

const vehicleService = {
  /**
   * Get all vehicles with optional filters
   * @param {Object} params - Query parameters (status, vehicleType, page, limit)
   * @returns {Promise} - Vehicles list with pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  /**
   * Get vehicle by ID
   * @param {string} id - Vehicle ID
   * @returns {Promise} - Vehicle data
   */
  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  /**
   * Create new vehicle
   * @param {Object} vehicleData - Vehicle data
   * @returns {Promise} - Created vehicle
   */
  create: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  /**
   * Update vehicle
   * @param {string} id - Vehicle ID
   * @param {Object} vehicleData - Updated vehicle data
   * @returns {Promise} - Updated vehicle
   */
  update: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  /**
   * Delete vehicle
   * @param {string} id - Vehicle ID
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  }
};

export default vehicleService;
