/**
 * Trip Controller
 * Handles trip creation, retrieval, and status updates
 * 
 * BUSINESS RULES:
 * 1. Trip Creation Validation:
 *    - Block if cargoWeight > vehicle.maxCapacity
 *    - Block if vehicle.status !== "Available"
 *    - Block if driver.status !== "Available"
 *    - Block if driver.licenseExpiryDate < current date
 * 
 * 2. When trip status becomes "Dispatched":
 *    - vehicle.status = "OnTrip"
 *    - driver.status = "OnDuty"
 * 
 * 3. When trip status becomes "Completed":
 *    - vehicle.status = "Available"
 *    - driver.status = "Available"
 *    - Update vehicle odometer with endOdometer
 */
const Trip = require('../models/trip.model');
const Vehicle = require('../models/vehicle.model');
const Driver = require('../models/driver.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } = require('../utils/constants');

/**
 * @desc    Get all trips
 * @route   GET /api/trips
 * @access  Private (All roles)
 * @query   status, vehicle, driver, page, limit
 */
const getAllTrips = asyncHandler(async (req, res) => {
  const { status, vehicle, driver, vehicleType, page = 1, limit = 10 } = req.query;
  
  // Build filter query
  const filter = {};
  if (status) filter.status = status;
  if (vehicle) filter.vehicle = vehicle;
  if (driver) filter.driver = driver;

  // Add support for filtering by vehicle type
  if (vehicleType && vehicleType !== 'all') {
    const vehiclesOfType = await Vehicle.find({ vehicleType }).select('_id');
    const vehicleIds = vehiclesOfType.map(v => v._id);
    filter.vehicle = { $in: vehicleIds };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [trips, total] = await Promise.all([
    Trip.find(filter)
      .populate('vehicle', 'name licensePlate vehicleType')
      .populate('driver', 'name licenseCategory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Trip.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      trips,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

/**
 * @desc    Get single trip by ID
 * @route   GET /api/trips/:id
 * @access  Private (All roles)
 */
const getTripById = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate('vehicle', 'name licensePlate vehicleType maxCapacity')
    .populate('driver', 'name licenseCategory licenseExpiryDate');

  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  res.status(200).json({
    success: true,
    data: { trip }
  });
});

/**
 * @desc    Create new trip
 * @route   POST /api/trips
 * @access  Private (FleetManager, Dispatcher)
 * 
 * VALIDATION RULES:
 * - cargoWeight must not exceed vehicle.maxCapacity
 * - vehicle.status must be "Available"
 * - driver.status must be "Available"
 * - driver.licenseExpiryDate must not be expired
 */
const createTrip = asyncHandler(async (req, res) => {
  const { vehicle: vehicleId, driver: driverId, cargoWeight, fromLocation, toLocation, startOdometer } = req.body;

  // Fetch vehicle and driver for validation
  const [vehicle, driver] = await Promise.all([
    Vehicle.findById(vehicleId),
    Driver.findById(driverId)
  ]);

  // Validate vehicle exists
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  // Validate driver exists
  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  // BUSINESS RULE: Check cargo weight against vehicle capacity
  if (cargoWeight > vehicle.maxCapacity) {
    throw new ApiError(
      400,
      `Cargo weight (${cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxCapacity} kg)`
    );
  }

  // BUSINESS RULE: Check vehicle availability
  if (vehicle.status !== VEHICLE_STATUS.AVAILABLE) {
    throw new ApiError(
      400,
      `Vehicle is not available. Current status: ${vehicle.status}`
    );
  }

  // BUSINESS RULE: Check driver availability
  if (driver.status !== DRIVER_STATUS.AVAILABLE) {
    throw new ApiError(
      400,
      `Driver is not available. Current status: ${driver.status}`
    );
  }

  // BUSINESS RULE: Check driver license expiry
  if (driver.licenseExpiryDate < new Date()) {
    throw new ApiError(
      400,
      `Driver's license has expired on ${driver.licenseExpiryDate.toISOString().split('T')[0]}`
    );
  }

  // Create trip with Draft status
  const trip = await Trip.create({
    vehicle: vehicleId,
    driver: driverId,
    cargoWeight,
    fromLocation,
    toLocation,
    startOdometer,
    status: TRIP_STATUS.DRAFT
  });

  // Populate references for response
  await trip.populate([
    { path: 'vehicle', select: 'name licensePlate vehicleType' },
    { path: 'driver', select: 'name licenseCategory' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Trip created successfully',
    data: { trip }
  });
});

/**
 * @desc    Update trip status
 * @route   PATCH /api/trips/:id/status
 * @access  Private (FleetManager, Dispatcher)
 * 
 * STATUS TRANSITIONS:
 * - Draft -> Dispatched: Sets vehicle to OnTrip, driver to OnDuty
 * - Dispatched -> Completed: Sets vehicle to Available, driver to Available, updates odometer
 * - Any -> Cancelled: Sets vehicle to Available, driver to Available (if was dispatched)
 */
const updateTripStatus = asyncHandler(async (req, res) => {
  const { status, endOdometer } = req.body;

  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  const previousStatus = trip.status;

  // Validate status transitions
  const validTransitions = {
    [TRIP_STATUS.DRAFT]: [TRIP_STATUS.DISPATCHED, TRIP_STATUS.CANCELLED],
    [TRIP_STATUS.DISPATCHED]: [TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELLED],
    [TRIP_STATUS.COMPLETED]: [],
    [TRIP_STATUS.CANCELLED]: []
  };

  if (!validTransitions[previousStatus].includes(status)) {
    throw new ApiError(
      400,
      `Invalid status transition from '${previousStatus}' to '${status}'`
    );
  }

  // Handle status-specific business logic
  if (status === TRIP_STATUS.DISPATCHED) {
    // Re-validate vehicle and driver availability before dispatching
    const [vehicle, driver] = await Promise.all([
      Vehicle.findById(trip.vehicle),
      Driver.findById(trip.driver)
    ]);

    if (vehicle.status !== VEHICLE_STATUS.AVAILABLE) {
      throw new ApiError(400, `Vehicle is no longer available. Current status: ${vehicle.status}`);
    }

    if (driver.status !== DRIVER_STATUS.AVAILABLE) {
      throw new ApiError(400, `Driver is no longer available. Current status: ${driver.status}`);
    }

    if (driver.licenseExpiryDate < new Date()) {
      throw new ApiError(400, `Driver's license has expired`);
    }

    // BUSINESS RULE: Update vehicle and driver status when dispatched
    await Promise.all([
      Vehicle.findByIdAndUpdate(trip.vehicle, { status: VEHICLE_STATUS.ON_TRIP }),
      Driver.findByIdAndUpdate(trip.driver, { status: DRIVER_STATUS.ON_DUTY })
    ]);
  }

  if (status === TRIP_STATUS.COMPLETED) {
    // Require endOdometer for completion
    if (!endOdometer) {
      throw new ApiError(400, 'End odometer reading is required to complete the trip');
    }

    if (endOdometer < trip.startOdometer) {
      throw new ApiError(400, 'End odometer must be greater than or equal to start odometer');
    }

    trip.endOdometer = endOdometer;

    // BUSINESS RULE: Update vehicle and driver status when completed
    // Also update vehicle odometer
    await Promise.all([
      Vehicle.findByIdAndUpdate(trip.vehicle, { 
        status: VEHICLE_STATUS.AVAILABLE,
        odometer: endOdometer
      }),
      Driver.findByIdAndUpdate(trip.driver, { status: DRIVER_STATUS.AVAILABLE })
    ]);
  }

  if (status === TRIP_STATUS.CANCELLED) {
    // Only reset statuses if trip was dispatched
    if (previousStatus === TRIP_STATUS.DISPATCHED) {
      await Promise.all([
        Vehicle.findByIdAndUpdate(trip.vehicle, { status: VEHICLE_STATUS.AVAILABLE }),
        Driver.findByIdAndUpdate(trip.driver, { status: DRIVER_STATUS.AVAILABLE })
      ]);
    }
  }

  // Update trip status
  trip.status = status;
  await trip.save();

  // Populate for response
  await trip.populate([
    { path: 'vehicle', select: 'name licensePlate vehicleType status' },
    { path: 'driver', select: 'name licenseCategory status' }
  ]);

  res.status(200).json({
    success: true,
    message: `Trip status updated to '${status}'`,
    data: { trip }
  });
});

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  updateTripStatus
};
