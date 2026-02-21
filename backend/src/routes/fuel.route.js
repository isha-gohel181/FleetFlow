/**
 * Fuel Routes
 * Handles fuel log endpoints
 * 
 * Routes:
 * GET /api/fuel - Get all fuel logs
 * GET /api/fuel/:id - Get fuel log by ID
 * POST /api/fuel - Create fuel log
 */
const express = require('express');
const router = express.Router();

const {
  getAllFuelLogs,
  getFuelLogById,
  createFuelLog
} = require('../controllers/fuel.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const {
  createFuelValidation,
  mongoIdParamValidation
} = require('../middleware/validation.middleware');
const { ROLES } = require('../utils/constants');

// All routes require authentication
router.use(protect);

// GET /api/fuel - FleetManager, Dispatcher, FinancialAnalyst
router.get(
  '/',
  authorize(ROLES.FLEET_MANAGER, ROLES.DISPATCHER, ROLES.FINANCIAL_ANALYST),
  getAllFuelLogs
);

// GET /api/fuel/:id - FleetManager, Dispatcher, FinancialAnalyst
router.get(
  '/:id',
  authorize(ROLES.FLEET_MANAGER, ROLES.DISPATCHER, ROLES.FINANCIAL_ANALYST),
  mongoIdParamValidation,
  getFuelLogById
);

// POST /api/fuel - FleetManager, Dispatcher
router.post(
  '/',
  authorize(ROLES.FLEET_MANAGER, ROLES.DISPATCHER),
  createFuelValidation,
  createFuelLog
);

module.exports = router;
