require('dotenv').config();

const connectDB = require('../config/db');
const seedUsers = require('./users.seed');
const seedDrivers = require('./drivers.seed');
const seedCustomers = require('./customers.seed');
const seedCars = require('./cars.seed');
const seedBookings = require('./bookings.seed');
const seedRentals = require('./rentals.seed');
const seedPayments = require('./payments.seed');
const seedMaintenance = require('./maintenance.seed');
const seedReviews = require('./reviews.seed');
const seedNotifications = require('./notifications.seed');

const runSeed = async () => {
  console.log('Seed process started');

  try {
    await connectDB();
    console.log('Seed database connected');

    // Run seed files in dependency order
    await seedUsers();
    await seedDrivers();
    await seedCustomers();
    await seedCars();
    await seedBookings();
    await seedRentals();
    await seedPayments();
    await seedMaintenance();
    await seedReviews();
    await seedNotifications();

    console.log('Seed process completed');
    process.exit(0);
  } catch (error) {
    console.error('Seed process failed:', error.message);
    process.exit(1);
  }
};

runSeed();
