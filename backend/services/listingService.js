const { getAvailableVehicles, findVehiclesByOwner, createVehicle, updateVehicleById, removeVehicleById, findVehicleByIdForOwner } = require('../models/vehicleModel');
const { createOwnership } = require('../models/ownershipModel');
const pool = require('./db');
const AddVehicleCommand = require('./commands/AddVehicleCommand');
const UpdateVehicleCommand = require('./commands/UpdateVehicleCommand');
const RemoveVehicleCommand = require('./commands/RemoveVehicleCommand');

class ListingCommandInvoker {
  constructor() {
    this.queue = [];
  }

  addCommand(command) {
    this.queue.push(command);
  }

  async executeAll(client, ownerId) {
    const results = [];
    for (const command of this.queue) {
      const result = await command.execute(client, ownerId);
      results.push(result);
    }

    this.queue = [];
    return results;
  }
}

function buildListingCommand(operation) {
  if (!operation || typeof operation !== 'object') {
    throw { status: 400, message: 'Each operation must be an object' };
  }

  switch (operation.type) {
    case 'add':
      return new AddVehicleCommand(operation.payload ?? {});
    case 'update':
      return new UpdateVehicleCommand(operation.payload ?? {});
    case 'remove':
      return new RemoveVehicleCommand(operation.payload ?? {});
    default:
      throw { status: 400, message: `Unsupported command type: ${operation.type}` };
  }
}

async function createListing(name, description, available, address, photoPath, hourlyRate, owner, region, vehicleType) {
  const vehicle = await createVehicle(name, description, available, address, photoPath, hourlyRate, region, vehicleType);
  await createOwnership(vehicle.id, owner);
  return vehicle;
}

async function updateListing(id, ownerId, updates) {
  return await updateVehicleById(id, ownerId, updates);
}

async function removeListing(id, ownerId) {
  return await removeVehicleById(id, ownerId);
}

async function findListingById(id, ownerId) {
  return await findVehicleByIdForOwner(id, ownerId);
}

async function findListings(owner) {
  return await findVehiclesByOwner(owner);
}

async function getAvailableListings() {
  return await getAvailableVehicles();
}

async function executeListingCommands(operations, ownerId) {
  if (!Array.isArray(operations) || operations.length === 0) {
    throw { status: 400, message: 'operations must be a non-empty array' };
  }

  if (operations.length > 100) {
    throw { status: 400, message: 'A maximum of 100 operations is allowed per batch request' };
  }

  const invoker = new ListingCommandInvoker();
  operations.forEach((operation) => {
    invoker.addCommand(buildListingCommand(operation));
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const results = await invoker.executeAll(client, ownerId);
    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { createListing, findListings, getAvailableListings, executeListingCommands, updateListing, removeListing, findListingById };

