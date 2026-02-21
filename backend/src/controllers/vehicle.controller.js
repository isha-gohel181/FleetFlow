/**
 * Vehicle Controller
 * Handles CRUD operations for fleet vehicles
 * Vehicle status is automatically managed by trip and maintenance operations
 */
const Vehicle = require('../models/vehicle.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all vehicles
 * @route   GET /api/vehicles
 * @access  Private (All roles)
 * @query   status, vehicleType, page, limit
 */
const getAllVehicles = asyncHandler(async (req, res) => {
  const { status, vehicleType, page = 1, limit = 10 } = req.query;
  
  // Build filter query
  const filter = {};
  if (status) filter.status = status;
  if (vehicleType) filter.vehicleType = vehicleType;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Vehicle.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      vehicles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

/**
 * @desc    Get single vehicle by ID
 * @route   GET /api/vehicles/:id
 * @access  Private (All roles)
 */
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  res.status(200).json({
    success: true,
    data: { vehicle }
  });
});

/**
 * @desc    Create new vehicle
 * @route   POST /api/vehicles
 * @access  Private (FleetManager only)
 */
const createVehicle = asyncHandler(async (req, res) => {
  const { name, licensePlate, vehicleType, maxCapacity, odometer, status } = req.body;

  // Check if license plate already exists
  const existingVehicle = await Vehicle.findOne({ licensePlate: licensePlate.toUpperCase() });
  if (existingVehicle) {
    throw new ApiError(400, 'Vehicle with this license plate already exists');
  }

  const vehicle = await Vehicle.create({
    name,
    licensePlate: licensePlate.toUpperCase(),
    vehicleType,
    maxCapacity,
    odometer: odometer || 0,
    status: status || 'Available'
  });

  res.status(201).json({
    success: true,
    message: 'Vehicle created successfully',
    data: { vehicle }
  });
});

/**
 * @desc    Update vehicle
 * @route   PUT /api/vehicles/:id
 * @access  Private (FleetManager only)
 */
const updateVehicle = asyncHandler(async (req, res) => {
  let vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  // If updating license plate, check for duplicates
  if (req.body.licensePlate) {
    const existingVehicle = await Vehicle.findOne({
      licensePlate: req.body.licensePlate.toUpperCase(),
      _id: { $ne: req.params.id }
    });
    if (existingVehicle) {
      throw new ApiError(400, 'Another vehicle with this license plate already exists');
    }
  }

  vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Vehicle updated successfully',
    data: { vehicle }
  });
});

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Private (FleetManager only)
 * @note    Only vehicles with "Available" or "Retired" status can be deleted
 */
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  // Prevent deletion of vehicles that are currently in use
  if (vehicle.status === 'OnTrip' || vehicle.status === 'InShop') {
    throw new ApiError(
      400,
      `Cannot delete vehicle with status '${vehicle.status}'. Vehicle must be 'Available' or 'Retired'.`
    );
  }

  await Vehicle.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Vehicle deleted successfully'
  });
});

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
