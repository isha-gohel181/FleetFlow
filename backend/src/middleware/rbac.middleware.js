/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access based on user roles
 * Must be used after auth.middleware (protect)
 * 
 * Roles: FleetManager, Dispatcher, SafetyOfficer, FinancialAnalyst
 */
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');

/**
 * Authorize specific roles
 * @param  {...string} allowedRoles - Roles that can access the route
 * @returns {Function} - Express middleware function
 * 
 * Usage: authorize('FleetManager', 'Dispatcher')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by protect middleware)
    if (!req.user) {
      throw new ApiError(401, 'User not authenticated.');
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Role-based permission matrix
 * Defines which roles can perform which actions
 */
const PERMISSIONS = {
  // Vehicle management
  'vehicles:create': [ROLES.FLEET_MANAGER],
  'vehicles:read': [ROLES.FLEET_MANAGER, ROLES.DISPATCHER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST],
  'vehicles:update': [ROLES.FLEET_MANAGER],
  'vehicles:delete': [ROLES.FLEET_MANAGER],

  // Driver management
  'drivers:create': [ROLES.FLEET_MANAGER],
  'drivers:read': [ROLES.FLEET_MANAGER, ROLES.DISPATCHER, ROLES.SAFETY_OFFICER],
  'drivers:update': [ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER],

  // Trip management
  'trips:create': [ROLES.FLEET_MANAGER, ROLES.DISPATCHER],
  'trips:read': [ROLES.FLEET_MANAGER, ROLES.DISPATCHER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST],
  'trips:updateStatus': [ROLES.FLEET_MANAGER, ROLES.DISPATCHER],

  // Maintenance
  'maintenance:create': [ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER],
  'maintenance:read': [ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST],

  // Fuel
  'fuel:create': [ROLES.FLEET_MANAGER, ROLES.DISPATCHER],
  'fuel:read': [ROLES.FLEET_MANAGER, ROLES.DISPATCHER, ROLES.FINANCIAL_ANALYST],

  // Analytics
  'analytics:read': [ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST]
};

/**
 * Check permission based on action
 * @param {string} action - Action to check (e.g., 'vehicles:create')
 * @returns {Function} - Express middleware function
 */
const checkPermission = (action) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'User not authenticated.');
    }

    const allowedRoles = PERMISSIONS[action];
    
    if (!allowedRoles) {
      throw new ApiError(500, `Permission '${action}' is not defined.`);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. You don't have permission to perform this action.`
      );
    }

    next();
  };
};

module.exports = { authorize, checkPermission, PERMISSIONS };
