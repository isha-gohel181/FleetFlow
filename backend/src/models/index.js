/**
 * Models Index
 * Central export point for all Mongoose models
 */

const User = require('./user.model');
const Vehicle = require('./vehicle.model');
const Driver = require('./driver.model');
const Trip = require('./trip.model');
const MaintenanceLog = require('./maintenanceLog.model');
const FuelLog = require('./fuelLog.model');

module.exports = {
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelLog
};
