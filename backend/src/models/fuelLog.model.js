/**
 * FuelLog Model
 * Records fuel purchases for vehicles
 * Used for analytics and fuel efficiency calculations
 * 
 * Analytics:
 * - Fuel Efficiency = (endOdometer - startOdometer) / liters
 * - Total Operational Cost = sum of fuel costs + maintenance costs
 */
const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required']
  },
  liters: {
    type: Number,
    required: [true, 'Liters is required'],
    min: [0.1, 'Liters must be at least 0.1']
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
fuelLogSchema.index({ vehicle: 1 });
fuelLogSchema.index({ date: -1 });

module.exports = mongoose.model('FuelLog', fuelLogSchema);
