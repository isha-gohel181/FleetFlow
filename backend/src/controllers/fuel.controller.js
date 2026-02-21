/**
 * Fuel Controller
 * Handles fuel log creation and retrieval
 * Used for tracking fuel consumption and costs per vehicle
 */
const FuelLog = require('../models/fuelLog.model');
const Vehicle = require('../models/vehicle.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all fuel logs
 * @route   GET /api/fuel
 * @access  Private (FleetManager, Dispatcher, FinancialAnalyst)
 * @query   vehicle, page, limit, startDate, endDate
 */
const getAllFuelLogs = asyncHandler(async (req, res) => {
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
    FuelLog.find(filter)
      .populate('vehicle', 'name licensePlate vehicleType')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    FuelLog.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      fuelLogs: logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

/**
 * @desc    Get fuel log by ID
 * @route   GET /api/fuel/:id
 * @access  Private (FleetManager, Dispatcher, FinancialAnalyst)
 */
const getFuelLogById = asyncHandler(async (req, res) => {
  const log = await FuelLog.findById(req.params.id)
    .populate('vehicle', 'name licensePlate vehicleType');

  if (!log) {
    throw new ApiError(404, 'Fuel log not found');
  }

  res.status(200).json({
    success: true,
    data: { fuelLog: log }
  });
});

/**
 * @desc    Create fuel log
 * @route   POST /api/fuel
 * @access  Private (FleetManager, Dispatcher)
 */
const createFuelLog = asyncHandler(async (req, res) => {
  const { vehicle: vehicleId, liters, cost, date } = req.body;

  // Validate vehicle exists
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  // Create fuel log
  const log = await FuelLog.create({
    vehicle: vehicleId,
    liters,
    cost,
    date: date || new Date()
  });

  // Populate for response
  await log.populate('vehicle', 'name licensePlate vehicleType');

  res.status(201).json({
    success: true,
    message: 'Fuel log created successfully',
    data: { fuelLog: log }
  });
});

module.exports = {
  getAllFuelLogs,
  getFuelLogById,
  createFuelLog
};
