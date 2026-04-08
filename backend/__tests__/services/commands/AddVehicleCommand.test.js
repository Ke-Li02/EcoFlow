const AddVehicleCommand = require('../../../services/commands/AddVehicleCommand');

const {
  createVehicle,
  findVehicleByIdForOwner,
} = require('../../../models/vehicleModel');

const { createOwnership } = require('../../../models/ownershipModel');

// Mock dependencies
jest.mock('../../../models/vehicleModel');
jest.mock('../../../models/ownershipModel');

describe('AddVehicleCommand', () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();
    client = {}; // mock transaction client
  });

  const validPayload = {
    name: 'Bike',
    description: 'Nice bike',
    available: true,
    address: '123 Street',
    photoPath: 'img.jpg',
    hourlyRate: 10,
    region: 'NDG',
    vehicleType: 'Bike',
  };

  it('should create vehicle, ownership, and return result', async () => {
    createVehicle.mockResolvedValue({ id: 1 });
    createOwnership.mockResolvedValue();
    findVehicleByIdForOwner.mockResolvedValue({ id: 1, name: 'Bike' });

    const command = new AddVehicleCommand(validPayload);

    const result = await command.execute(client, 99);

    expect(createVehicle).toHaveBeenCalledWith(
      'Bike',
      'Nice bike',
      true,
      '123 Street',
      'img.jpg',
      10,
      'NDG',
      'Bike',
      client
    );

    expect(createOwnership).toHaveBeenCalledWith(1, 99, client);

    expect(findVehicleByIdForOwner).toHaveBeenCalledWith(1, 99, client);

    expect(result).toEqual({
      type: 'add',
      vehicle: { id: 1, name: 'Bike' },
    });
  });

  it('should default available to true if not provided', async () => {
    const payload = { ...validPayload };
    delete payload.available;

    createVehicle.mockResolvedValue({ id: 1 });
    createOwnership.mockResolvedValue();
    findVehicleByIdForOwner.mockResolvedValue({ id: 1 });

    const command = new AddVehicleCommand(payload);
    await command.execute(client, 1);

    expect(createVehicle).toHaveBeenCalledWith(
      'Bike',
      'Nice bike',
      true, // default applied
      '123 Street',
      'img.jpg',
      10,
      'NDG',
      'Bike',
      client
    );
  });

  it('should throw if required fields are missing', async () => {
    const invalidPayload = { name: 'Bike' }; // incomplete

    const command = new AddVehicleCommand(invalidPayload);

    await expect(command.execute(client, 1)).rejects.toEqual({
      status: 400,
      message: 'Invalid add command payload',
    });

    expect(createVehicle).not.toHaveBeenCalled();
    expect(createOwnership).not.toHaveBeenCalled();
  });

  it('should propagate errors from createVehicle', async () => {
    createVehicle.mockRejectedValue(new Error('DB error'));

    const command = new AddVehicleCommand(validPayload);

    await expect(command.execute(client, 1)).rejects.toThrow('DB error');
  });

  it('should propagate errors from createOwnership', async () => {
    createVehicle.mockResolvedValue({ id: 1 });
    createOwnership.mockRejectedValue(new Error('Ownership error'));

    const command = new AddVehicleCommand(validPayload);

    await expect(command.execute(client, 1)).rejects.toThrow('Ownership error');
  });

  it('should propagate errors from findVehicleByIdForOwner', async () => {
    createVehicle.mockResolvedValue({ id: 1 });
    createOwnership.mockResolvedValue();
    findVehicleByIdForOwner.mockRejectedValue(new Error('Fetch error'));

    const command = new AddVehicleCommand(validPayload);

    await expect(command.execute(client, 1)).rejects.toThrow('Fetch error');
  });
});