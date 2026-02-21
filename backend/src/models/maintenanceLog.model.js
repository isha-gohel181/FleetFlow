/**
 * MaintenanceLog Model
 * Records maintenance activities for vehicles
 * 
 * Business Rule:
 * - When a MaintenanceLog is created, vehicle.status = "InShop"
 */
const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [5, 'Description must be at least 5 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for common queries
maintenanceLogSchema.index({ vehicle: 1 });
maintenanceLogSchema.index({ date: -1 });

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
