require('dotenv').config();
const { createUsersTable } = require('../models/userModel');
const { createVehiclesTable } = require('../models/vehicleModel');
const { createOwnershipsTable } = require('../models/ownershipModel');
const { createRentalsTable } = require('../models/rentalModel');
const { getAvailableVehicles } = require('../models/vehicleModel');
const authService = require('../services/authService');
const listingService = require('../services/listingService');
const rentalService = require('../services/rentalService');
const pool = require('../services/db');

async function seed() {
  try {
    // drop tables
    await pool.query('DROP TABLE IF EXISTS rentals CASCADE');
    await pool.query('DROP TABLE IF EXISTS ownerships CASCADE');
    await pool.query('DROP TABLE IF EXISTS vehicles CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');

    // create tables
    await createUsersTable();
    await createVehiclesTable();
    await createOwnershipsTable();
    await createRentalsTable();

    // create users
    const user1 = await authService.register('user', '123', false);
    const adminUser = await authService.register('admin', '123', true);

    // create listings
    await listingService.createListing('Mountain Bike', 'A great mountain bike', true, '123 Main St', 'public/uploads/bike1.jpg', 15, user1.id, "LaSalle", "Bike");
    await listingService.createListing('Electric Scooter', 'Fast electric scooter', true, '456 Elm St', 'public/uploads/scooter1.jpg', 20, user1.id, "Lachine", "Scooter");
    await listingService.createListing('Electric Vehicle', 'Eco-friendly electric car', true, '789 Oak Ave', 'public/uploads/ev1.jpg', 45, user1.id, "NDG", "EV");

    // create admin rentals relative to now so at least one appears in Current Rentals.
    const seededVehicles = await getAvailableVehicles();
    const now = Date.now();

    if (seededVehicles.length >= 2) {
      const currentStart = new Date(now - 60 * 60 * 1000).toISOString();
      const currentEnd = new Date(now + 2 * 60 * 60 * 1000).toISOString();
      await rentalService.createRentalBooking(
        seededVehicles[0].id,
        adminUser.id,
        currentStart,
        currentEnd,
        seededVehicles[0].hourlyRate * 3
      );

      const futureStart = new Date(now + 24 * 60 * 60 * 1000).toISOString();
      const futureEnd = new Date(now + 27 * 60 * 60 * 1000).toISOString();
      await rentalService.createRentalBooking(
        seededVehicles[1].id,
        adminUser.id,
        futureStart,
        futureEnd,
        seededVehicles[1].hourlyRate * 3
      );
    }

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end(); // close the connection when done
  }
}

seed();