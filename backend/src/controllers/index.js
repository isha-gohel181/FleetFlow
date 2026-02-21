/**
 * Controllers Index
 * Central export point for all controllers
 */

const authController = require('./auth.controller');
const vehicleController = require('./vehicle.controller');
const driverController = require('./driver.controller');
const tripController = require('./trip.controller');
const maintenanceController = require('./maintenance.controller');
const fuelController = require('./fuel.controller');
const analyticsController = require('./analytics.controller');

module.exports = {
  authController,
  vehicleController,
  driverController,
  tripController,
  maintenanceController,
  fuelController,
  analyticsController
};
