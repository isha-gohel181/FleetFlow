/**
 * Middleware Index
 * Central export point for all middleware
 */

const { protect, generateToken } = require('./auth.middleware');
const { authorize, checkPermission, PERMISSIONS } = require('./rbac.middleware');
const { errorHandler, notFound } = require('./error.middleware');
const {
  registerValidation,
  loginValidation,
  createVehicleValidation,
  updateVehicleValidation,
  createDriverValidation,
  updateDriverValidation,
  createTripValidation,
  updateTripStatusValidation,
  createMaintenanceValidation,
  createFuelValidation,
  mongoIdParamValidation
} = require('./validation.middleware');

module.exports = {
  // Auth
  protect,
  generateToken,
  
  // RBAC
  authorize,
  checkPermission,
  PERMISSIONS,
  
  // Error handling
  errorHandler,
  notFound,
  
  // Validations
  registerValidation,
  loginValidation,
  createVehicleValidation,
  updateVehicleValidation,
  createDriverValidation,
  updateDriverValidation,
  createTripValidation,
  updateTripStatusValidation,
  createMaintenanceValidation,
  createFuelValidation,
  mongoIdParamValidation
};
