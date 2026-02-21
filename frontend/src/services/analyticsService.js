/**
 * Analytics Service
 * Handles all analytics-related API calls
 */
import api from './api';

const analyticsService = {
  /**
   * Get dashboard analytics
   * @param {Object} params - Query parameters (vehicleType, status, days)
   * @returns {Promise} - Dashboard overview data
   */
  getDashboard: async (params = {}) => {
    const response = await api.get('/analytics/dashboard', { params });
    return response.data;
  },

  /**
   * Get vehicle-specific analytics
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise} - Vehicle analytics data
   */
  getVehicleAnalytics: async (vehicleId) => {
    const response = await api.get(`/analytics/vehicle/${vehicleId}`);
    return response.data;
  },

  /**
   * Get fuel efficiency report
   * @returns {Promise} - Fleet-wide fuel efficiency data
   */
  getFuelEfficiency: async () => {
    const response = await api.get('/analytics/fuel-efficiency');
    return response.data;
  }
};

export default analyticsService;
