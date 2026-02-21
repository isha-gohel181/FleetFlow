/**
 * Database Seeder
 * Populates the database with sample data for testing
 * 
 * Usage: node src/utils/seeder.js
 */
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');
const Vehicle = require('../models/vehicle.model');
const Driver = require('../models/driver.model');
const Trip = require('../models/trip.model');
const MaintenanceLog = require('../models/maintenanceLog.model');
const FuelLog = require('../models/fuelLog.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/FleetFlow';

// Sample Users
const users = [
  {
    name: 'John Fleet Manager',
    email: 'fleet@fleetflow.com',
    password: 'password123',
    role: 'FleetManager'
  },
  {
    name: 'Sarah Dispatcher',
    email: 'dispatcher@fleetflow.com',
    password: 'password123',
    role: 'Dispatcher'
  },
  {
    name: 'Mike Safety Officer',
    email: 'safety@fleetflow.com',
    password: 'password123',
    role: 'SafetyOfficer'
  },
  {
    name: 'Emily Financial Analyst',
    email: 'finance@fleetflow.com',
    password: 'password123',
    role: 'FinancialAnalyst'
  }
];

// Sample Vehicles
const vehicles = [
  {
    name: 'Heavy Hauler 1',
    licensePlate: 'ABC-1234',
    vehicleType: 'Truck',
    maxCapacity: 20000,
    odometer: 150000,
    status: 'Available'
  },
  {
    name: 'City Runner',
    licensePlate: 'XYZ-5678',
    vehicleType: 'Van',
    maxCapacity: 3000,
    odometer: 75000,
    status: 'Available'
  },
  {
    name: 'Express Bike 1',
    licensePlate: 'BIKE-001',
    vehicleType: 'Bike',
    maxCapacity: 50,
    odometer: 25000,
    status: 'Available'
  },
  {
    name: 'Long Haul Truck',
    licensePlate: 'DEF-9012',
    vehicleType: 'Truck',
    maxCapacity: 25000,
    odometer: 200000,
    status: 'Available'
  },
  {
    name: 'Delivery Van 2',
    licensePlate: 'GHI-3456',
    vehicleType: 'Van',
    maxCapacity: 2500,
    odometer: 45000,
    status: 'Available'
  }
];

// Sample Drivers (license expiry dates in the future)
const futureDate = new Date();
futureDate.setFullYear(futureDate.getFullYear() + 2);

const drivers = [
  {
    name: 'Robert Johnson',
    licenseCategory: 'A',
    licenseExpiryDate: futureDate,
    status: 'Available'
  },
  {
    name: 'Maria Garcia',
    licenseCategory: 'B',
    licenseExpiryDate: futureDate,
    status: 'Available'
  },
  {
    name: 'James Williams',
    licenseCategory: 'C',
    licenseExpiryDate: futureDate,
    status: 'Available'
  },
  {
    name: 'Linda Davis',
    licenseCategory: 'B',
    licenseExpiryDate: futureDate,
    status: 'Available'
  },
  {
    name: 'Michael Brown',
    licenseCategory: 'A',
    licenseExpiryDate: futureDate,
    status: 'Available'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Trip.deleteMany({}),
      MaintenanceLog.deleteMany({}),
      FuelLog.deleteMany({})
    ]);

    // Create users
    console.log('Creating users...');
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create vehicles
    console.log('Creating vehicles...');
    const createdVehicles = await Vehicle.create(vehicles);
    console.log(`Created ${createdVehicles.length} vehicles`);

    // Create drivers
    console.log('Creating drivers...');
    const createdDrivers = await Driver.create(drivers);
    console.log(`Created ${createdDrivers.length} drivers`);

    // Create sample trips
    console.log('Creating trips...');
    const trips = [
      {
        vehicle: createdVehicles[0]._id,
        driver: createdDrivers[0]._id,
        cargoWeight: 15000,
        fromLocation: 'Warehouse A, City Center',
        toLocation: 'Distribution Hub B, Industrial Zone',
        startOdometer: 150000,
        endOdometer: 150250,
        status: 'Completed'
      },
      {
        vehicle: createdVehicles[1]._id,
        driver: createdDrivers[1]._id,
        cargoWeight: 2000,
        fromLocation: 'Store 1, Downtown',
        toLocation: 'Customer Location, Suburbs',
        startOdometer: 75000,
        status: 'Draft'
      }
    ];
    const createdTrips = await Trip.create(trips);
    console.log(`Created ${createdTrips.length} trips`);

    // Create sample maintenance logs
    console.log('Creating maintenance logs...');
    const maintenanceLogs = [
      {
        vehicle: createdVehicles[0]._id,
        description: 'Regular service - Oil change and filter replacement',
        cost: 250,
        date: new Date('2026-01-15')
      },
      {
        vehicle: createdVehicles[1]._id,
        description: 'Brake pad replacement',
        cost: 450,
        date: new Date('2026-02-01')
      }
    ];
    const createdMaintenance = await MaintenanceLog.create(maintenanceLogs);
    console.log(`Created ${createdMaintenance.length} maintenance logs`);

    // Create sample fuel logs
    console.log('Creating fuel logs...');
    const fuelLogs = [
      {
        vehicle: createdVehicles[0]._id,
        liters: 120,
        cost: 180,
        date: new Date('2026-02-10')
      },
      {
        vehicle: createdVehicles[0]._id,
        liters: 100,
        cost: 150,
        date: new Date('2026-02-15')
      },
      {
        vehicle: createdVehicles[1]._id,
        liters: 50,
        cost: 75,
        date: new Date('2026-02-12')
      }
    ];
    const createdFuel = await FuelLog.create(fuelLogs);
    console.log(`Created ${createdFuel.length} fuel logs`);

    console.log('\n========================================');
    console.log('  Database seeded successfully!');
    console.log('========================================');
    console.log('\nTest User Credentials:');
    console.log('----------------------------------------');
    users.forEach(user => {
      console.log(`  ${user.role}: ${user.email} / ${user.password}`);
    });
    console.log('----------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
