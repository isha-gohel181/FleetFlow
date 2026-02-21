/**
 * Driver Model
 * Stores driver information including license details
 * Status automatically updates based on trip assignments
 */
const mongoose = require('mongoose');
const { DRIVER_STATUS } = require('../utils/constants');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  licenseCategory: {
    type: String,
    required: [true, 'License category is required'],
    trim: true,
    uppercase: true
  },
  licenseExpiryDate: {
    type: Date,
    required: [true, 'License expiry date is required']
  },
  status: {
    type: String,
    enum: {
      values: Object.values(DRIVER_STATUS),
      message: 'Invalid status. Must be one of: Available, OnDuty, Suspended'
    },
    default: DRIVER_STATUS.AVAILABLE
  }
}, {
  timestamps: true
});

// Indexes for common queries
driverSchema.index({ status: 1 });
driverSchema.index({ licenseExpiryDate: 1 });

/**
 * Virtual to check if driver's license is expired
 */
driverSchema.virtual('isLicenseExpired').get(function() {
  return this.licenseExpiryDate < new Date();
});

// Ensure virtuals are included in JSON output
driverSchema.set('toJSON', { virtuals: true });
driverSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Driver', driverSchema);
