/**
 * FleetFlow - Server Entry Point
 * Modular Fleet & Logistics Management System
 * 
 * This file:
 * - Loads environment variables
 * - Connects to MongoDB
 * - Starts the Express server
 */
require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fleetflow';

let server;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start the server
    server = app.listen(PORT, () => {
      console.log(`
========================================
  FleetFlow API Server
========================================
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  MongoDB: Connected
========================================
      `);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  console.log('Shutting down the server...');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.log('Shutting down the server...');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  }
});