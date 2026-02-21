/**
 * Driver Routes
 * Handles driver management endpoints
 * 
 * Routes:
 * GET /api/drivers - Get all drivers (FleetManager, Dispatcher, SafetyOfficer)
 * GET /api/drivers/expiring - Get drivers with expiring licenses
 * GET /api/drivers/:id - Get driver by ID
 * POST /api/drivers - Create driver (FleetManager)
 * PUT /api/drivers/:id - Update driver (FleetManager, SafetyOfficer)
 */
const express = require('express');
const router = express.Router();

const {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  getExpiringLicenses,
  deleteDriver
} = require('../controllers/driver.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const {
  createDriverValidation,
  updateDriverValidation,
  mongoIdParamValidation
} = require('../middleware/validation.middleware');
const { ROLES } = require('../utils/constants');

// All routes require authentication
router.use(protect);

// GET /api/drivers/expiring - FleetManager, SafetyOfficer
// Must be before /:id route to prevent conflict
router.get(
  '/expiring',
  authorize(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER),
  getExpiringLicenses
);

// GET /api/drivers - FleetManager, Dispatcher, SafetyOfficer
router.get(
  '/',
  authorize(ROLES.FLEET_MANAGER, ROLES.DISPATCHER, ROLES.SAFETY_OFFICER),
  getAllDrivers
);

// GET /api/drivers/:id - FleetManager, Dispatcher, SafetyOfficer
router.get(
  '/:id',
  authorize(ROLES.FLEET_MANAGER, ROLES.DISPATCHER, ROLES.SAFETY_OFFICER),
  mongoIdParamValidation,
  getDriverById
);

// POST /api/drivers - FleetManager only
router.post(
  '/',
  authorize(ROLES.FLEET_MANAGER),
  createDriverValidation,
  createDriver
);

// PUT /api/drivers/:id - FleetManager, SafetyOfficer
router.put(
  '/:id',
  authorize(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER),
  updateDriverValidation,
  updateDriver
);

// DELETE /api/drivers/:id - FleetManager only
router.delete(
  '/:id',
  authorize(ROLES.FLEET_MANAGER),
  mongoIdParamValidation,
  deleteDriver
);

module.exports = router;
