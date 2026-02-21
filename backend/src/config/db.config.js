/**
 * Database Configuration
 * MongoDB connection setup using Mongoose
 */
const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses environment variable MONGO_URI or defaults to local MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fleetflow', {
      // These options are no longer needed in Mongoose 6+, but kept for clarity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
