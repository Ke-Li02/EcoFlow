const UpdateVehicleCommand = require('../../../services/commands/UpdateVehicleCommand');
const { updateVehicleById } = require('../../../models/vehicleModel');

// Mock dependency
jest.mock('../../../models/vehicleModel');

describe('UpdateVehicleCommand', () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();
    client = {}; // mock transaction client
  });

  const validPayload = {
    vehicleId: 1,
    updates: { name: 'Updated Bike' },
  };

  it('should update vehicle and return result', async () => {
    const updatedVehicle = { id: 1, name: 'Updated Bike' };
    updateVehicleById.mockResolvedValue(updatedVehicle);

    const command = new UpdateVehicleCommand(validPayload);

    const result = await command.execute(client, 99);

    expect(updateVehicleById).toHaveBeenCalledWith(
      1,
      99,
      { name: 'Updated Bike' },
      client
    );

    expect(result).toEqual({
      type: 'update',
      vehicle: updatedVehicle,
    });
  });

  it('should throw if vehicleId is missing', async () => {
    const command = new UpdateVehicleCommand({
      updates: { name: 'Test' },
    });

    await expect(command.execute(client, 1)).rejects.toEqual({
      status: 400,
      message: 'Invalid update command payload',
    });

    expect(updateVehicleById).not.toHaveBeenCalled();
  });

  it('should throw if updates is not an object', async () => {
    const command = new UpdateVehicleCommand({
      vehicleId: 1,
      updates: null,
    });

    await expect(command.execute(client, 1)).rejects.toEqual({
      status: 400,
      message: 'Invalid update command payload',
    });
  });

  it('should throw if vehicle not found for owner', async () => {
    updateVehicleById.mockResolvedValue(null);

    const command = new UpdateVehicleCommand(validPayload);

    await expect(command.execute(client, 99)).rejects.toEqual({
      status: 404,
      message: 'Vehicle 1 was not found for this owner',
    });
  });

  it('should propagate errors from updateVehicleById', async () => {
    updateVehicleById.mockRejectedValue(new Error('DB error'));

    const command = new UpdateVehicleCommand(validPayload);

    await expect(command.execute(client, 1)).rejects.toThrow('DB error');
  });
});