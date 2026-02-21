/**
 * FleetFlow - Express Application Setup
 * Modular Fleet & Logistics Management System
 * 
 * This file configures the Express application with:
 * - CORS and JSON parsing middleware
 * - All API routes
 * - Error handling middleware
 */
const express = require('express');
const cors = require('cors');

// Import routes
const {
  authRoutes,
  vehicleRoutes,
  driverRoutes,
  tripRoutes,
  maintenanceRoutes,
  fuelRoutes,
  analyticsRoutes
} = require('./routes');

// Import error handling middleware
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// ===========================================
// MIDDLEWARE CONFIGURATION
// ===========================================

// Enable CORS for all origins (configure for production)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// API ROUTES
// ===========================================

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FleetFlow API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Vehicle management routes
app.use('/api/vehicles', vehicleRoutes);

// Driver management routes
app.use('/api/drivers', driverRoutes);

// Trip management routes
app.use('/api/trips', tripRoutes);

// Maintenance log routes
app.use('/api/maintenance', maintenanceRoutes);

// Fuel log routes
app.use('/api/fuel', fuelRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// Handle 404 - Route not found
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;