/**
 * Trip Service
 * Handles all trip-related API calls
 */
import api from './api';

const tripService = {
  /**
   * Get all trips with optional filters
   * @param {Object} params - Query parameters (status, vehicle, driver, page, limit)
   * @returns {Promise} - Trips list with pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get('/trips', { params });
    return response.data;
  },

  /**
   * Get trip by ID
   * @param {string} id - Trip ID
   * @returns {Promise} - Trip data
   */
  getById: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  /**
   * Create new trip
   * @param {Object} tripData - Trip data
   * @returns {Promise} - Created trip
   */
  create: async (tripData) => {
    const response = await api.post('/trips', tripData);
    return response.data;
  },

  /**
   * Update trip status
   * @param {string} id - Trip ID
   * @param {string} status - New status (Dispatched, Completed, Cancelled)
   * @param {number} endOdometer - End odometer reading (required for Completed)
   * @returns {Promise} - Updated trip
   */
  updateStatus: async (id, status, endOdometer = null) => {
    const data = { status };
    if (endOdometer !== null) {
      data.endOdometer = endOdometer;
    }
    const response = await api.patch(`/trips/${id}/status`, data);
    return response.data;
  }
};

export default tripService;
