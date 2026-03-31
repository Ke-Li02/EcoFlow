const ListingCommand = require('./ListingCommand');
const { removeVehicleById } = require('../../models/vehicleModel');

class RemoveVehicleCommand extends ListingCommand {
  constructor(payload) {
    super();
    this.payload = payload;
  }

  async execute(client, ownerId) {
    const { vehicleId } = this.payload;

    if (!vehicleId) {
      throw { status: 400, message: 'Invalid remove command payload' };
    }

    const removedVehicle = await removeVehicleById(vehicleId, ownerId, client);
    if (!removedVehicle) {
      throw { status: 404, message: `Vehicle ${vehicleId} was not found for this owner` };
    }

    return {
      type: 'remove',
      vehicleId: removedVehicle.id,
    };
  }
}

module.exports = RemoveVehicleCommand;

