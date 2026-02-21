/**
 * Analytics Controller
 * Provides dashboard and vehicle-specific analytics
 * 
 * ANALYTICS CALCULATIONS:
 * - Fuel Efficiency = (endOdometer - startOdometer) / liters
 * - Total Operational Cost per vehicle = sum of fuel costs + maintenance costs
 */
const Vehicle = require('../models/vehicle.model');
const Driver = require('../models/driver.model');
const Trip = require('../models/trip.model');
const MaintenanceLog = require('../models/maintenanceLog.model');
const FuelLog = require('../models/fuelLog.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } = require('../utils/constants');

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/analytics/dashboard
 * @access  Private (FleetManager, FinancialAnalyst)
 * 
 * Returns:
 * - Fleet overview (vehicle counts by status)
 * - Driver statistics
 * - Trip statistics
 * - Cost summaries
 * - Recent activities
 */
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  // Vehicle statistics
  const vehicleStats = await Vehicle.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const vehiclesByType = await Vehicle.aggregate([
    {
      $group: {
        _id: '$vehicleType',
        count: { $sum: 1 }
      }
    }
  ]);

  // Driver statistics
  const driverStats = await Driver.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Count drivers with expiring licenses (within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringLicenseCount = await Driver.countDocuments({
    licenseExpiryDate: {
      $gte: new Date(),
      $lte: thirtyDaysFromNow
    }
  });

  // Trip statistics
  const tripStats = await Trip.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Calculate total distance from completed trips
  const completedTripsStats = await Trip.aggregate([
    {
      $match: { status: TRIP_STATUS.COMPLETED }
    },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalDistance: {
          $sum: { $subtract: ['$endOdometer', '$startOdometer'] }
        },
        totalCargoWeight: { $sum: '$cargoWeight' }
      }
    }
  ]);

  // Cost statistics
  const maintenanceCosts = await MaintenanceLog.aggregate([
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$cost' },
        count: { $sum: 1 }
      }
    }
  ]);

  const fuelCosts = await FuelLog.aggregate([
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$cost' },
        totalLiters: { $sum: '$liters' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Format vehicle stats into object
  const vehicleStatusCounts = vehicleStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  // Format driver stats into object
  const driverStatusCounts = driverStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  // Format trip stats into object
  const tripStatusCounts = tripStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  // Recent trips
  const recentTrips = await Trip.find()
    .populate('vehicle', 'name licensePlate')
    .populate('driver', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      vehicles: {
        byStatus: vehicleStatusCounts,
        byType: vehiclesByType.reduce((acc, v) => {
          acc[v._id] = v.count;
          return acc;
        }, {}),
        total: Object.values(vehicleStatusCounts).reduce((a, b) => a + b, 0)
      },
      drivers: {
        byStatus: driverStatusCounts,
        total: Object.values(driverStatusCounts).reduce((a, b) => a + b, 0),
        expiringLicenses: expiringLicenseCount
      },
      trips: {
        byStatus: tripStatusCounts,
        total: Object.values(tripStatusCounts).reduce((a, b) => a + b, 0),
        completed: completedTripsStats[0] || { totalTrips: 0, totalDistance: 0, totalCargoWeight: 0 }
      },
      costs: {
        maintenance: {
          total: maintenanceCosts[0]?.totalCost || 0,
          count: maintenanceCosts[0]?.count || 0
        },
        fuel: {
          total: fuelCosts[0]?.totalCost || 0,
          totalLiters: fuelCosts[0]?.totalLiters || 0,
          count: fuelCosts[0]?.count || 0
        },
        totalOperationalCost: 
          (maintenanceCosts[0]?.totalCost || 0) + (fuelCosts[0]?.totalCost || 0)
      },
      recentTrips
    }
  });
});

/**
 * @desc    Get vehicle-specific analytics
 * @route   GET /api/analytics/vehicle/:id
 * @access  Private (FleetManager, FinancialAnalyst)
 * 
 * Returns:
 * - Vehicle details
 * - Trip history summary
 * - Fuel efficiency calculation
 * - Maintenance history
 * - Total operational costs
 */
const getVehicleAnalytics = asyncHandler(async (req, res) => {
  const { id: vehicleId } = req.params;

  // Get vehicle
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  // Trip statistics for this vehicle
  const tripStats = await Trip.aggregate([
    {
      $match: { vehicle: vehicle._id }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Completed trips summary
  const completedTrips = await Trip.aggregate([
    {
      $match: { 
        vehicle: vehicle._id,
        status: TRIP_STATUS.COMPLETED
      }
    },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalDistance: {
          $sum: { $subtract: ['$endOdometer', '$startOdometer'] }
        },
        totalCargoWeight: { $sum: '$cargoWeight' },
        avgCargoWeight: { $avg: '$cargoWeight' }
      }
    }
  ]);

  // Fuel statistics
  const fuelStats = await FuelLog.aggregate([
    {
      $match: { vehicle: vehicle._id }
    },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$cost' },
        totalLiters: { $sum: '$liters' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Maintenance statistics
  const maintenanceStats = await MaintenanceLog.aggregate([
    {
      $match: { vehicle: vehicle._id }
    },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$cost' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Calculate fuel efficiency
  // Fuel Efficiency = Total Distance / Total Liters
  const totalDistance = completedTrips[0]?.totalDistance || 0;
  const totalLiters = fuelStats[0]?.totalLiters || 0;
  const fuelEfficiency = totalLiters > 0 
    ? (totalDistance / totalLiters).toFixed(2) 
    : null;

  // Get recent trips
  const recentTrips = await Trip.find({ vehicle: vehicleId })
    .populate('driver', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

  // Get recent maintenance logs
  const recentMaintenance = await MaintenanceLog.find({ vehicle: vehicleId })
    .sort({ date: -1 })
    .limit(5);

  // Get recent fuel logs
  const recentFuel = await FuelLog.find({ vehicle: vehicleId })
    .sort({ date: -1 })
    .limit(5);

  // Total operational cost
  const totalOperationalCost = 
    (fuelStats[0]?.totalCost || 0) + (maintenanceStats[0]?.totalCost || 0);

  res.status(200).json({
    success: true,
    data: {
      vehicle,
      trips: {
        byStatus: tripStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        completed: completedTrips[0] || {
          totalTrips: 0,
          totalDistance: 0,
          totalCargoWeight: 0,
          avgCargoWeight: 0
        }
      },
      fuel: {
        totalCost: fuelStats[0]?.totalCost || 0,
        totalLiters: fuelStats[0]?.totalLiters || 0,
        refillCount: fuelStats[0]?.count || 0,
        efficiency: fuelEfficiency ? `${fuelEfficiency} km/L` : 'N/A'
      },
      maintenance: {
        totalCost: maintenanceStats[0]?.totalCost || 0,
        serviceCount: maintenanceStats[0]?.count || 0
      },
      costs: {
        fuel: fuelStats[0]?.totalCost || 0,
        maintenance: maintenanceStats[0]?.totalCost || 0,
        total: totalOperationalCost
      },
      recentActivity: {
        trips: recentTrips,
        maintenance: recentMaintenance,
        fuel: recentFuel
      }
    }
  });
});

/**
 * @desc    Get fleet-wide fuel efficiency report
 * @route   GET /api/analytics/fuel-efficiency
 * @access  Private (FleetManager, FinancialAnalyst)
 */
const getFuelEfficiencyReport = asyncHandler(async (req, res) => {
  // Get all vehicles with their fuel data
  const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });
  
  const report = await Promise.all(vehicles.map(async (vehicle) => {
    // Get completed trips distance
    const tripData = await Trip.aggregate([
      {
        $match: { 
          vehicle: vehicle._id,
          status: TRIP_STATUS.COMPLETED
        }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: { $subtract: ['$endOdometer', '$startOdometer'] } }
        }
      }
    ]);

    // Get total fuel
    const fuelData = await FuelLog.aggregate([
      {
        $match: { vehicle: vehicle._id }
      },
      {
        $group: {
          _id: null,
          totalLiters: { $sum: '$liters' }
        }
      }
    ]);

    const totalDistance = tripData[0]?.totalDistance || 0;
    const totalLiters = fuelData[0]?.totalLiters || 0;
    const efficiency = totalLiters > 0 ? totalDistance / totalLiters : null;

    return {
      vehicle: {
        id: vehicle._id,
        name: vehicle.name,
        licensePlate: vehicle.licensePlate,
        vehicleType: vehicle.vehicleType
      },
      totalDistance,
      totalLiters,
      fuelEfficiency: efficiency ? parseFloat(efficiency.toFixed(2)) : null,
      efficiencyUnit: 'km/L'
    };
  }));

  // Sort by efficiency (highest first), null values at end
  report.sort((a, b) => {
    if (a.fuelEfficiency === null) return 1;
    if (b.fuelEfficiency === null) return -1;
    return b.fuelEfficiency - a.fuelEfficiency;
  });

  res.status(200).json({
    success: true,
    data: {
      report,
      generatedAt: new Date().toISOString()
    }
  });
});

module.exports = {
  getDashboardAnalytics,
  getVehicleAnalytics,
  getFuelEfficiencyReport
};
