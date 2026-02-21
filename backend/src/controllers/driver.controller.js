/**
 * Driver Controller
 * Handles CRUD operations for fleet drivers
 * Driver status is automatically managed by trip operations
 */
const Driver = require('../models/driver.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all drivers
 * @route   GET /api/drivers
 * @access  Private (FleetManager, Dispatcher, SafetyOfficer)
 * @query   status, page, limit
 */
const getAllDrivers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  // Build filter query
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  
  // Search functionality
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { licenseNumber: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [drivers, total] = await Promise.all([
    Driver.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Driver.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      drivers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

/**
 * @desc    Get single driver by ID
 * @route   GET /api/drivers/:id
 * @access  Private (FleetManager, Dispatcher, SafetyOfficer)
 */
const getDriverById = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  res.status(200).json({
    success: true,
    data: { driver }
  });
});

/**
 * @desc    Create new driver
 * @route   POST /api/drivers
 * @access  Private (FleetManager only)
 */
const createDriver = asyncHandler(async (req, res) => {
  const { name, licenseCategory, licenseNumber, licenseExpiryDate, status } = req.body;

  const driver = await Driver.create({
    name,
    licenseCategory: licenseCategory.toUpperCase(),
    licenseNumber,
    licenseExpiryDate,
    status: status || 'Available'
  });

  res.status(201).json({
    success: true,
    message: 'Driver created successfully',
    data: { driver }
  });
});

/**
 * @desc    Update driver
 * @route   PUT /api/drivers/:id
 * @access  Private (FleetManager, SafetyOfficer)
 */
const updateDriver = asyncHandler(async (req, res) => {
  let driver = await Driver.findById(req.params.id);

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  // Prevent changing status to Available/OnDuty for drivers with expired license
  if (req.body.status && ['Available', 'OnDuty'].includes(req.body.status)) {
    const expiryDate = req.body.licenseExpiryDate 
      ? new Date(req.body.licenseExpiryDate) 
      : driver.licenseExpiryDate;
    
    if (expiryDate < new Date()) {
      throw new ApiError(
        400,
        'Cannot set driver status to Available or OnDuty with an expired license'
      );
    }
  }

  driver = await Driver.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Driver updated successfully',
    data: { driver }
  });
});

/**
 * @desc    Get drivers with expiring licenses
 * @route   GET /api/drivers/expiring
 * @access  Private (FleetManager, SafetyOfficer)
 * @query   days - Number of days to check (default: 30)
 */
const getExpiringLicenses = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + parseInt(days));

  const drivers = await Driver.find({
    licenseExpiryDate: {
      $gte: new Date(),
      $lte: futureDate
    }
  }).sort({ licenseExpiryDate: 1 });

  res.status(200).json({
    success: true,
    data: {
      drivers,
      count: drivers.length,
      expiringWithinDays: parseInt(days)
    }
  });
});

/**
 * @desc    Delete driver
 * @route   DELETE /api/drivers/:id
 * @access  Private (FleetManager only)
 * @note    Only drivers with "Available" or "Suspended" status can be deleted
 */
const deleteDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  // Prevent deletion of drivers that are currently on duty
  if (driver.status === 'OnDuty') {
    throw new ApiError(
      400,
      `Cannot delete driver with status '${driver.status}'. Driver must be 'Available' or 'Suspended'.`
    );
  }

  await Driver.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Driver deleted successfully'
  });
});

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  getExpiringLicenses,
  deleteDriver
};
