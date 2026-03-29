const ListingCommand = require('./ListingCommand');
const { createVehicle, findVehicleByIdForOwner } = require('../../models/vehicleModel');
const { createOwnership } = require('../../models/ownershipModel');

class AddVehicleCommand extends ListingCommand {
  constructor(payload) {
    super();
    this.payload = payload;
  }

  async execute(client, ownerId) {
    const { name, description, available, address, photoPath, hourlyRate, region, vehicleType } = this.payload;

    if (!name || !description || !address || !photoPath || !hourlyRate || !region || !vehicleType) {
      throw { status: 400, message: 'Invalid add command payload' };
    }

    const vehicle = await createVehicle(
      name,
      description,
      available ?? true,
      address,
      photoPath,
      hourlyRate,
      region,
      vehicleType,
      client
    );

    await createOwnership(vehicle.id, ownerId, client);
    const createdVehicle = await findVehicleByIdForOwner(vehicle.id, ownerId, client);

    return {
      type: 'add',
      vehicle: createdVehicle,
    };
  }
}

module.exports = AddVehicleCommand;

