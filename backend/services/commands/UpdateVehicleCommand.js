const ListingCommand = require('./ListingCommand');
const { updateVehicleById } = require('../../models/vehicleModel');

class UpdateVehicleCommand extends ListingCommand {
  constructor(payload) {
    super();
    this.payload = payload;
  }

  async execute(client, ownerId) {
    const { vehicleId, updates } = this.payload;

    if (!vehicleId || typeof updates !== 'object' || updates === null) {
      throw { status: 400, message: 'Invalid update command payload' };
    }

    const updatedVehicle = await updateVehicleById(vehicleId, ownerId, updates, client);
    if (!updatedVehicle) {
      throw { status: 404, message: `Vehicle ${vehicleId} was not found for this owner` };
    }

    return {
      type: 'update',
      vehicle: updatedVehicle,
    };
  }
}

module.exports = UpdateVehicleCommand;

