/**
 * Analytics Routes
 * Handles analytics and reporting endpoints
 * 
 * Routes:
 * GET /api/analytics/dashboard - Get dashboard overview
 * GET /api/analytics/vehicle/:id - Get vehicle-specific analytics
 * GET /api/analytics/fuel-efficiency - Get fleet fuel efficiency report
 */
const express = require('express');
const router = express.Router();

const {
  getDashboardAnalytics,
  getVehicleAnalytics,
  getFuelEfficiencyReport
} = require('../controllers/analytics.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { mongoIdParamValidation } = require('../middleware/validation.middleware');
const { ROLES } = require('../utils/constants');

// All routes require authentication
router.use(protect);

// GET /api/analytics/dashboard - FleetManager, FinancialAnalyst
router.get(
  '/dashboard',
  authorize(ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  getDashboardAnalytics
);

// GET /api/analytics/fuel-efficiency - FleetManager, FinancialAnalyst
router.get(
  '/fuel-efficiency',
  authorize(ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  getFuelEfficiencyReport
);

// GET /api/analytics/vehicle/:id - FleetManager, FinancialAnalyst
router.get(
  '/vehicle/:id',
  authorize(ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  mongoIdParamValidation,
  getVehicleAnalytics
);

module.exports = router;
