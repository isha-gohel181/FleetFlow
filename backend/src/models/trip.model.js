/**
 * Trip Model
 * Stores trip information with references to vehicle and driver
 * Manages cargo transport from origin to destination
 * 
 * Business Rules:
 * - Trip creation blocked if cargoWeight > vehicle.maxCapacity
 * - Trip creation blocked if vehicle.status !== "Available"
 * - Trip creation blocked if driver.status !== "Available"
 * - Trip creation blocked if driver.licenseExpiryDate < current date
 * - When dispatched: vehicle.status = "OnTrip", driver.status = "OnDuty"
 * - When completed: vehicle.status = "Available", driver.status = "Available"
 */
const mongoose = require('mongoose');
const { TRIP_STATUS } = require('../utils/constants');

const tripSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver reference is required']
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Cargo weight is required'],
    min: [0, 'Cargo weight cannot be negative']
  },
  fromLocation: {
    type: String,
    required: [true, 'Origin location is required'],
    trim: true
  },
  toLocation: {
    type: String,
    required: [true, 'Destination location is required'],
    trim: true
  },
  startOdometer: {
    type: Number,
    required: [true, 'Start odometer reading is required'],
    min: [0, 'Start odometer cannot be negative']
  },
  endOdometer: {
    type: Number,
    min: [0, 'End odometer cannot be negative'],
    default: null,
    validate: {
      validator: function(value) {
        // endOdometer must be >= startOdometer if provided
        if (value !== null && this.startOdometer !== undefined) {
          return value >= this.startOdometer;
        }
        return true;
      },
      message: 'End odometer must be greater than or equal to start odometer'
    }
  },
  status: {
    type: String,
    enum: {
      values: Object.values(TRIP_STATUS),
      message: 'Invalid status. Must be one of: Draft, Dispatched, Completed, Cancelled'
    },
    default: TRIP_STATUS.DRAFT
  },
  revenue: {
    type: Number,
    default: 0,
    min: [0, 'Revenue cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes for common queries
tripSchema.index({ vehicle: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ createdAt: -1 });

/**
 * Virtual to calculate distance traveled
 */
tripSchema.virtual('distanceTraveled').get(function() {
  if (this.endOdometer && this.startOdometer) {
    return this.endOdometer - this.startOdometer;
  }
  return null;
});

// Ensure virtuals are included in JSON output
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Trip', tripSchema);
