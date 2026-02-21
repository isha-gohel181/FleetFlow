/**
 * Vehicle Model
 * Stores vehicle information for fleet management
 * Status automatically updates based on trips and maintenance
 */
const mongoose = require('mongoose');
const { VEHICLE_STATUS, VEHICLE_TYPE } = require('../utils/constants');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: {
      values: Object.values(VEHICLE_TYPE),
      message: 'Invalid vehicle type. Must be one of: Truck, Van, Bike'
    },
    required: [true, 'Vehicle type is required']
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Maximum capacity is required'],
    min: [0, 'Maximum capacity cannot be negative']
  },
  odometer: {
    type: Number,
    required: [true, 'Odometer reading is required'],
    min: [0, 'Odometer cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: Object.values(VEHICLE_STATUS),
      message: 'Invalid status. Must be one of: Available, OnTrip, InShop, Retired'
    },
    default: VEHICLE_STATUS.AVAILABLE
  }
}, {
  timestamps: true
});

// Indexes for common queries
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vehicleType: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
