const RemoveVehicleCommand = require('../../../services/commands/RemoveVehicleCommand');
const { removeVehicleById } = require('../../../models/vehicleModel');

// Mock dependency
jest.mock('../../../models/vehicleModel');

describe('RemoveVehicleCommand', () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();
    client = {}; // mock transaction client
  });

  it('should remove vehicle and return result', async () => {
    removeVehicleById.mockResolvedValue({ id: 1 });

    const command = new RemoveVehicleCommand({ vehicleId: 1 });

    const result = await command.execute(client, 99);

    expect(removeVehicleById).toHaveBeenCalledWith(1, 99, client);

    expect(result).toEqual({
      type: 'remove',
      vehicleId: 1,
    });
  });

  it('should throw if vehicleId is missing', async () => {
    const command = new RemoveVehicleCommand({});

    await expect(command.execute(client, 1)).rejects.toEqual({
      status: 400,
      message: 'Invalid remove command payload',
    });

    expect(removeVehicleById).not.toHaveBeenCalled();
  });

  it('should throw if vehicle not found for owner', async () => {
    removeVehicleById.mockResolvedValue(null);

    const command = new RemoveVehicleCommand({ vehicleId: 1 });

    await expect(command.execute(client, 99)).rejects.toEqual({
      status: 404,
      message: 'Vehicle 1 was not found for this owner',
    });
  });

  it('should propagate errors from removeVehicleById', async () => {
    removeVehicleById.mockRejectedValue(new Error('DB error'));

    const command = new RemoveVehicleCommand({ vehicleId: 1 });

    await expect(command.execute(client, 1)).rejects.toThrow('DB error');
  });
});