/**
 * Request Validation Middleware
 * Uses express-validator for input validation
 * Provides reusable validation chains for common inputs
 */
const { body, param, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const { ROLES, VEHICLE_STATUS, VEHICLE_TYPE, DRIVER_STATUS, TRIP_STATUS } = require('../utils/constants');

/**
 * Process validation results
 * Throws ApiError if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    throw new ApiError(400, 'Validation failed', extractedErrors);
  }
  
  next();
};

// ============================================
// AUTH VALIDATIONS
// ============================================

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(Object.values(ROLES)).withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
  
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

// ============================================
// VEHICLE VALIDATIONS
// ============================================

const createVehicleValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Vehicle name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('licensePlate')
    .trim()
    .notEmpty().withMessage('License plate is required')
    .toUpperCase(),
  
  body('vehicleType')
    .notEmpty().withMessage('Vehicle type is required')
    .isIn(Object.values(VEHICLE_TYPE)).withMessage(`Vehicle type must be one of: ${Object.values(VEHICLE_TYPE).join(', ')}`),
  
  body('maxCapacity')
    .notEmpty().withMessage('Maximum capacity is required')
    .isFloat({ min: 0 }).withMessage('Maximum capacity must be a non-negative number'),
  
  body('odometer')
    .optional()
    .isFloat({ min: 0 }).withMessage('Odometer must be a non-negative number'),
  
  body('status')
    .optional()
    .isIn(Object.values(VEHICLE_STATUS)).withMessage(`Status must be one of: ${Object.values(VEHICLE_STATUS).join(', ')}`),
  
  validate
];

const updateVehicleValidation = [
  param('id')
    .isMongoId().withMessage('Invalid vehicle ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('licensePlate')
    .optional()
    .trim()
    .toUpperCase(),
  
  body('vehicleType')
    .optional()
    .isIn(Object.values(VEHICLE_TYPE)).withMessage(`Vehicle type must be one of: ${Object.values(VEHICLE_TYPE).join(', ')}`),
  
  body('maxCapacity')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum capacity must be a non-negative number'),
  
  body('odometer')
    .optional()
    .isFloat({ min: 0 }).withMessage('Odometer must be a non-negative number'),
  
  body('status')
    .optional()
    .isIn(Object.values(VEHICLE_STATUS)).withMessage(`Status must be one of: ${Object.values(VEHICLE_STATUS).join(', ')}`),
  
  validate
];

// ============================================
// DRIVER VALIDATIONS
// ============================================

const createDriverValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Driver name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('licenseCategory')
    .trim()
    .notEmpty().withMessage('License category is required')
    .toUpperCase(),
  
  body('licenseExpiryDate')
    .notEmpty().withMessage('License expiry date is required')
    .isISO8601().withMessage('Please provide a valid date'),
  
  body('status')
    .optional()
    .isIn(Object.values(DRIVER_STATUS)).withMessage(`Status must be one of: ${Object.values(DRIVER_STATUS).join(', ')}`),
  
  validate
];

const updateDriverValidation = [
  param('id')
    .isMongoId().withMessage('Invalid driver ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('licenseCategory')
    .optional()
    .trim()
    .toUpperCase(),
  
  body('licenseExpiryDate')
    .optional()
    .isISO8601().withMessage('Please provide a valid date'),
  
  body('status')
    .optional()
    .isIn(Object.values(DRIVER_STATUS)).withMessage(`Status must be one of: ${Object.values(DRIVER_STATUS).join(', ')}`),
  
  validate
];

// ============================================
// TRIP VALIDATIONS
// ============================================

const createTripValidation = [
  body('vehicle')
    .notEmpty().withMessage('Vehicle ID is required')
    .isMongoId().withMessage('Invalid vehicle ID'),
  
  body('driver')
    .notEmpty().withMessage('Driver ID is required')
    .isMongoId().withMessage('Invalid driver ID'),
  
  body('cargoWeight')
    .notEmpty().withMessage('Cargo weight is required')
    .isFloat({ min: 0 }).withMessage('Cargo weight must be a non-negative number'),
  
  body('fromLocation')
    .trim()
    .notEmpty().withMessage('Origin location is required'),
  
  body('toLocation')
    .trim()
    .notEmpty().withMessage('Destination location is required'),
  
  body('startOdometer')
    .notEmpty().withMessage('Start odometer is required')
    .isFloat({ min: 0 }).withMessage('Start odometer must be a non-negative number'),
  
  validate
];

const updateTripStatusValidation = [
  param('id')
    .isMongoId().withMessage('Invalid trip ID'),
  
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(Object.values(TRIP_STATUS)).withMessage(`Status must be one of: ${Object.values(TRIP_STATUS).join(', ')}`),
  
  body('endOdometer')
    .optional()
    .isFloat({ min: 0 }).withMessage('End odometer must be a non-negative number'),
  
  validate
];

// ============================================
// MAINTENANCE VALIDATIONS
// ============================================

const createMaintenanceValidation = [
  body('vehicle')
    .notEmpty().withMessage('Vehicle ID is required')
    .isMongoId().withMessage('Invalid vehicle ID'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 5, max: 500 }).withMessage('Description must be between 5 and 500 characters'),
  
  body('cost')
    .notEmpty().withMessage('Cost is required')
    .isFloat({ min: 0 }).withMessage('Cost must be a non-negative number'),
  
  body('date')
    .optional()
    .isISO8601().withMessage('Please provide a valid date'),
  
  validate
];

// ============================================
// FUEL VALIDATIONS
// ============================================

const createFuelValidation = [
  body('vehicle')
    .notEmpty().withMessage('Vehicle ID is required')
    .isMongoId().withMessage('Invalid vehicle ID'),
  
  body('liters')
    .notEmpty().withMessage('Liters is required')
    .isFloat({ min: 0.1 }).withMessage('Liters must be at least 0.1'),
  
  body('cost')
    .notEmpty().withMessage('Cost is required')
    .isFloat({ min: 0 }).withMessage('Cost must be a non-negative number'),
  
  body('date')
    .optional()
    .isISO8601().withMessage('Please provide a valid date'),
  
  validate
];

// ============================================
// COMMON VALIDATIONS
// ============================================

const mongoIdParamValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  
  validate
];

module.exports = {
  validate,
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
