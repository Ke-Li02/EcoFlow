require('dotenv').config();
const { createUsersTable } = require('../models/userModel');
const { createVehiclesTable } = require('../models/vehicleModel');
const { createOwnershipsTable } = require('../models/ownershipModel');
const authService = require('../services/authService');
const listingService = require('../services/listingService');
const pool = require('../services/db');

async function seed() {
  try {
    // drop tables
    await pool.query('DROP TABLE IF EXISTS ownerships CASCADE');
    await pool.query('DROP TABLE IF EXISTS vehicles CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');

    // create tables
    await createUsersTable();
    await createVehiclesTable();
    await createOwnershipsTable();

    // create users
    const user1 = await authService.register('user', '123', false);
    await authService.register('admin', '123', true);

    // create listings
    await listingService.createListing('Mountain Bike', 'A great mountain bike', true, '123 Main St', 'public/uploads/bike1.jpg', 15, user1.id, "LaSalle", "Bike");
    await listingService.createListing('Electric Scooter', 'Fast electric scooter', true, '456 Elm St', 'public/uploads/scooter1.jpg', 20, user1.id, "Lachine", "Scooter");
    await listingService.createListing('Electric Vehicle', 'Eco-friendly electric car', true, '789 Oak Ave', 'public/uploads/ev1.jpg', 45, user1.id, "NDG", "EV");

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end(); // close the connection when done
  }
}

seed();