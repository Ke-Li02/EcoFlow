require('dotenv').config();
const { createUsersTable } = require('../models/userModel');
const { createVehiclesTable } = require('../models/vehicleModel');
const { createOwnershipsTable } = require('../models/ownershipModel');
const authService = require('../services/authService');
const listingService = require('../services/listingService');
const pool = require('../services/db');

async function seed() {
  try {
    // create tables
    await Promise.all([createUsersTable(), createVehiclesTable(), createOwnershipsTable()]);

    // create users
    const user1 = await authService.register('user', '123', false);
    await authService.register('admin', '123', true);

    // create listings
    await listingService.createListing('Mountain Bike', 'A great mountain bike', true, '123 Main St', 'public/uploads/bike1.jpg', 15.00, user1.id);
    await listingService.createListing('Electric Scooter', 'Fast electric scooter', true, '456 Elm St', 'public/uploads/scooter1.jpg', 20.00, user1.id);
    await listingService.createListing('Electric Vehicle', 'Eco-friendly electric car', true, '789 Oak Ave', 'public/uploads/ev1.jpg', 45.00, user1.id);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end(); // close the connection when done
  }
}

seed();