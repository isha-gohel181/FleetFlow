/**
 * Trip Routes
 * Handles trip management endpoints
 * 
 * Routes:
 * GET /api/trips - Get all trips (all roles)
 * GET /api/trips/:id - Get trip by ID (all roles)
 * POST /api/trips - Create trip (FleetManager, Dispatcher)
 * PATCH /api/trips/:id/status - Update trip status (FleetManager, Dispatcher)
 */
const express = require('express');
const router = express.Router();

const {
  getAllTrips,
  getTripById,
  createTrip,
  updateTripStatus
} = require('../controllers/trip.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const {
  createTripValidation,
  updateTripStatusValidation,
  mongoIdParamValidation
} = require('../middleware/validation.middleware');
const { ROLES } = require('../utils/constants');

// All routes require authentication
router.use(protect);

// GET /api/trips - All authenticated users can view
router.get('/', getAllTrips);

// GET /api/trips/:id - All authenticated users can view
router.get('/:id', mongoIdParamValidation, getTripById);

// POST /api/trips - FleetManager, Dispatcher
// Includes validation for business rules (cargo weight, availability, license expiry)
router.post(
  '/',
  authorize(ROLES.FLEET_MANAGER, ROLES.DISPATCHER),
  createTripValidation,
  createTrip
);

// PATCH /api/trips/:id/status - FleetManager, Dispatcher
// Handles status transitions and automatic vehicle/driver status updates
router.patch(
  '/:id/status',
  authorize(ROLES.FLEET_MANAGER, ROLES.DISPATCHER),
  updateTripStatusValidation,
  updateTripStatus
);

module.exports = router;
