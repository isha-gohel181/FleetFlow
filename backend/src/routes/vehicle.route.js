/**
 * Vehicle Routes
 * Handles vehicle management endpoints
 * 
 * Routes:
 * GET /api/vehicles - Get all vehicles (all roles)
 * GET /api/vehicles/:id - Get vehicle by ID (all roles)
 * POST /api/vehicles - Create vehicle (FleetManager)
 * PUT /api/vehicles/:id - Update vehicle (FleetManager)
 * DELETE /api/vehicles/:id - Delete vehicle (FleetManager)
 */
const express = require('express');
const router = express.Router();

const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicle.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const {
  createVehicleValidation,
  updateVehicleValidation,
  mongoIdParamValidation
} = require('../middleware/validation.middleware');
const { ROLES } = require('../utils/constants');

// All routes require authentication
router.use(protect);

// GET /api/vehicles - All authenticated users can view
router.get('/', getAllVehicles);

// GET /api/vehicles/:id - All authenticated users can view
router.get('/:id', mongoIdParamValidation, getVehicleById);

// POST /api/vehicles - FleetManager only
router.post(
  '/',
  authorize(ROLES.FLEET_MANAGER),
  createVehicleValidation,
  createVehicle
);

// PUT /api/vehicles/:id - FleetManager only
router.put(
  '/:id',
  authorize(ROLES.FLEET_MANAGER),
  updateVehicleValidation,
  updateVehicle
);

// DELETE /api/vehicles/:id - FleetManager only
router.delete(
  '/:id',
  authorize(ROLES.FLEET_MANAGER),
  mongoIdParamValidation,
  deleteVehicle
);

module.exports = router;
