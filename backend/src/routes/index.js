/**
 * Routes Index
 * Central export point for all route modules
 */

const authRoutes = require('./auth.route');
const vehicleRoutes = require('./vehicle.route');
const driverRoutes = require('./driver.route');
const tripRoutes = require('./trip.route');
const maintenanceRoutes = require('./maintenance.route');
const fuelRoutes = require('./fuel.route');
const analyticsRoutes = require('./analytics.route');

module.exports = {
  authRoutes,
  vehicleRoutes,
  driverRoutes,
  tripRoutes,
  maintenanceRoutes,
  fuelRoutes,
  analyticsRoutes
};
