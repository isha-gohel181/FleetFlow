/**
 * Application Constants
 * Centralized location for all enum values and constants
 */

// User roles for RBAC
const ROLES = {
  FLEET_MANAGER: 'FleetManager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'SafetyOfficer',
  FINANCIAL_ANALYST: 'FinancialAnalyst'
};

// Vehicle status enum
const VEHICLE_STATUS = {
  AVAILABLE: 'Available',
  ON_TRIP: 'OnTrip',
  IN_SHOP: 'InShop',
  RETIRED: 'Retired'
};

// Vehicle type enum
const VEHICLE_TYPE = {
  TRUCK: 'Truck',
  VAN: 'Van',
  BIKE: 'Bike'
};

// Driver status enum
const DRIVER_STATUS = {
  AVAILABLE: 'Available',
  ON_DUTY: 'OnDuty',
  SUSPENDED: 'Suspended'
};

// Trip status enum
const TRIP_STATUS = {
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

module.exports = {
  ROLES,
  VEHICLE_STATUS,
  VEHICLE_TYPE,
  DRIVER_STATUS,
  TRIP_STATUS
};
