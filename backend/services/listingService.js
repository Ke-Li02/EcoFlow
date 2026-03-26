const { getAvailableVehicles, findVehiclesByOwner, createVehicle } = require('../models/vehicleModel');
const { createOwnership } = require('../models/ownershipModel');

async function createListing(name, description, available, address, photoPath, hourlyRate, owner, region, vehicleType) {
  const vehicle = await createVehicle(name, description, available, address, photoPath, hourlyRate, region, vehicleType);
  await createOwnership(vehicle.id, owner);
}

async function findListings(owner) {
  return await findVehiclesByOwner(owner);
}

async function getAvailableListings() {
  return await getAvailableVehicles();
}

module.exports = { createListing, findListings, getAvailableListings };

