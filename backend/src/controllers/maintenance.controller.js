/**
 * Maintenance Controller
 * Handles maintenance log creation and retrieval
 * 
 * BUSINESS RULE:
 * - When a MaintenanceLog is created, vehicle.status = "InShop"
 */
const MaintenanceLog = require('../models/maintenanceLog.model');
const Vehicle = require('../models/vehicle.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { VEHICLE_STATUS } = require('../utils/constants');

/**
 * @desc    Get all maintenance logs
 * @route   GET /api/maintenance
 * @access  Private (FleetManager, SafetyOfficer, FinancialAnalyst)
 * @query   vehicle, page, limit, startDate, endDate
 */
const getAllMaintenanceLogs = asyncHandler(async (req, res) => {
  const { vehicle, page = 1, limit = 10, startDate, endDate } = req.query;
  
  // Build filter query
  const filter = {};
  if (vehicle) filter.vehicle = vehicle;
  
  // Date range filter
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [logs, total] = await Promise.all([
    MaintenanceLog.find(filter)
      .populate('vehicle', 'name licensePlate vehicleType')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    MaintenanceLog.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      maintenanceLogs: logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

/**
 * @desc    Get maintenance log by ID
 * @route   GET /api/maintenance/:id
 * @access  Private (FleetManager, SafetyOfficer, FinancialAnalyst)
 */
const getMaintenanceLogById = asyncHandler(async (req, res) => {
  const log = await MaintenanceLog.findById(req.params.id)
    .populate('vehicle', 'name licensePlate vehicleType');

  if (!log) {
    throw new ApiError(404, 'Maintenance log not found');
  }

  res.status(200).json({
    success: true,
    data: { maintenanceLog: log }
  });
});

/**
 * @desc    Create maintenance log
 * @route   POST /api/maintenance
 * @access  Private (FleetManager, SafetyOfficer)
 * 
 * BUSINESS RULE:
 * - When created, sets vehicle.status to "InShop"
 */
const createMaintenanceLog = asyncHandler(async (req, res) => {
  const { vehicle: vehicleId, description, cost, date } = req.body;

  // Validate vehicle exists
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  // Check if vehicle is on a trip
  if (vehicle.status === VEHICLE_STATUS.ON_TRIP) {
    throw new ApiError(
      400,
      'Cannot create maintenance log for a vehicle that is currently on a trip'
    );
  }

  // Create maintenance log
  const log = await MaintenanceLog.create({
    vehicle: vehicleId,
    description,
    cost,
    date: date || new Date()
  });

  // BUSINESS RULE: Update vehicle status to InShop
  await Vehicle.findByIdAndUpdate(vehicleId, { status: VEHICLE_STATUS.IN_SHOP });

  // Populate for response
  await log.populate('vehicle', 'name licensePlate vehicleType');

  res.status(201).json({
    success: true,
    message: 'Maintenance log created successfully. Vehicle status set to InShop.',
    data: { maintenanceLog: log }
  });
});

/**
 * @desc    Complete maintenance (set vehicle back to Available)
 * @route   PATCH /api/maintenance/:id/complete
 * @access  Private (FleetManager, SafetyOfficer)
 */
const completeMaintenace = asyncHandler(async (req, res) => {
  const log = await MaintenanceLog.findById(req.params.id);

  if (!log) {
    throw new ApiError(404, 'Maintenance log not found');
  }

  // Set vehicle status back to Available
  const vehicle = await Vehicle.findByIdAndUpdate(
    log.vehicle,
    { status: VEHICLE_STATUS.AVAILABLE },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Maintenance completed. Vehicle status set to Available.',
    data: { vehicle }
  });
});

/**
 * @desc    Update maintenance log
 * @route   PUT /api/maintenance/:id
 * @access  Private (FleetManager, SafetyOfficer)
 */
const updateMaintenanceLog = asyncHandler(async (req, res) => {
  const { description, cost, date } = req.body;

  const log = await MaintenanceLog.findById(req.params.id);
  if (!log) {
    throw new ApiError(404, 'Maintenance log not found');
  }

  // Update fields
  if (description) log.description = description;
  if (cost) log.cost = cost;
  if (date) log.date = date;

  await log.save();
  await log.populate('vehicle', 'name licensePlate vehicleType');

  res.status(200).json({
    success: true,
    message: 'Maintenance log updated successfully',
    data: { maintenanceLog: log }
  });
});

/**
 * @desc    Delete maintenance log
 * @route   DELETE /api/maintenance/:id
 * @access  Private (FleetManager, SafetyOfficer)
 */
const deleteMaintenanceLog = asyncHandler(async (req, res) => {
  const log = await MaintenanceLog.findById(req.params.id);

  if (!log) {
    throw new ApiError(404, 'Maintenance log not found');
  }

  // Check if vehicle is still in shop - if so, set it back to available
  const vehicle = await Vehicle.findById(log.vehicle);
  if (vehicle && vehicle.status === VEHICLE_STATUS.IN_SHOP) {
    await Vehicle.findByIdAndUpdate(log.vehicle, { status: VEHICLE_STATUS.AVAILABLE });
  }

  await MaintenanceLog.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Maintenance log deleted successfully'
  });
});

module.exports = {
  getAllMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
  completeMaintenace
};
