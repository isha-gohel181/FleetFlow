/**
 * Maintenance Routes
 * Handles maintenance log endpoints
 * 
 * Routes:
 * GET /api/maintenance - Get all maintenance logs
 * GET /api/maintenance/:id - Get maintenance log by ID
 * POST /api/maintenance - Create maintenance log (sets vehicle to InShop)
 * PATCH /api/maintenance/:id/complete - Complete maintenance (sets vehicle to Available)
 */
const express = require('express');
const router = express.Router();

const {
  getAllMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
  completeMaintenace
} = require('../controllers/maintenance.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const {
  createMaintenanceValidation,
  mongoIdParamValidation
} = require('../middleware/validation.middleware');
const { ROLES } = require('../utils/constants');

// All routes require authentication
router.use(protect);

// GET /api/maintenance - FleetManager, SafetyOfficer, FinancialAnalyst
router.get(
  '/',
  authorize(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST),
  getAllMaintenanceLogs
);

// GET /api/maintenance/:id - FleetManager, SafetyOfficer, FinancialAnalyst
router.get(
  '/:id',
  authorize(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST),
  mongoIdParamValidation,
  getMaintenanceLogById
);

// POST /api/maintenance - FleetManager, SafetyOfficer
// Business Rule: Creates log and sets vehicle status to InShop
router.post(
  '/',
  authorize(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER),
  createMaintenanceValidation,
  createMaintenanceLog
);

// PUT /api/maintenance/:id - FleetManager, SafetyOfficer
router.put(
  '/:id',
  authorize(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER),
  mongoIdParamValidation,
  updateMaintenanceLog
);

// DELETE /api/maintenance/:id - FleetManager, SafetyOfficer
router.delete(
  '/:id',
  authorize(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER),
  mongoIdParamValidation,
  deleteMaintenanceLog
);

// PATCH /api/maintenance/:id/complete - FleetManager, SafetyOfficer
// Sets vehicle status back to Available
router.patch(
  '/:id/complete',
  authorize(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER),
  mongoIdParamValidation,
  completeMaintenace
);

module.exports = router;
