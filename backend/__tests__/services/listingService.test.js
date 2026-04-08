const {
  createListing,
  findListings,
  getAvailableListings,
  executeListingCommands,
  updateListing,
  removeListing,
  findListingById,
} = require('../../services/listingService');

const {
  getAvailableVehicles,
  findVehiclesByOwner,
  createVehicle,
  updateVehicleById,
  removeVehicleById,
  findVehicleByIdForOwner,
} = require('../../models/vehicleModel');

const { createOwnership } = require('../../models/ownershipModel');
const pool = require('../../services/db');

// Mock dependencies
jest.mock('../../models/vehicleModel');
jest.mock('../../models/ownershipModel');
jest.mock('../../services/db');

// Mock command classes
const mockExecute = jest.fn();

jest.mock('../../services/commands/AddVehicleCommand', () =>
  jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  }))
);

jest.mock('../../services/commands/UpdateVehicleCommand', () =>
  jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  }))
);

jest.mock('../../services/commands/RemoveVehicleCommand', () =>
  jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  }))
);

describe('Listing Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createListing', () => {
    it('should create vehicle and ownership', async () => {
      createVehicle.mockResolvedValue({ id: 1 });
      createOwnership.mockResolvedValue();

      const result = await createListing(
        'Bike',
        'desc',
        true,
        'addr',
        'img',
        10,
        99,
        'NDG',
        'Bike'
      );

      expect(createVehicle).toHaveBeenCalled();
      expect(createOwnership).toHaveBeenCalledWith(1, 99);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('updateListing', () => {
    it('should call updateVehicleById', async () => {
      updateVehicleById.mockResolvedValue({ id: 1 });

      const result = await updateListing(1, 2, { name: 'New' });

      expect(updateVehicleById).toHaveBeenCalledWith(1, 2, { name: 'New' });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('removeListing', () => {
    it('should call removeVehicleById', async () => {
      removeVehicleById.mockResolvedValue({ id: 1 });

      const result = await removeListing(1, 2);

      expect(removeVehicleById).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('findListingById', () => {
    it('should call findVehicleByIdForOwner', async () => {
      findVehicleByIdForOwner.mockResolvedValue({ id: 1 });

      const result = await findListingById(1, 2);

      expect(findVehicleByIdForOwner).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('findListings', () => {
    it('should call findVehiclesByOwner', async () => {
      findVehiclesByOwner.mockResolvedValue([{ id: 1 }]);

      const result = await findListings(2);

      expect(findVehiclesByOwner).toHaveBeenCalledWith(2);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getAvailableListings', () => {
    it('should call getAvailableVehicles', async () => {
      getAvailableVehicles.mockResolvedValue([{ id: 1 }]);

      const result = await getAvailableListings();

      expect(getAvailableVehicles).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('executeListingCommands', () => {
    let mockClient;

    beforeEach(() => {
      mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      pool.connect.mockResolvedValue(mockClient);
    });

    it('should execute commands and commit transaction', async () => {
      mockExecute.mockResolvedValueOnce('result1').mockResolvedValueOnce('result2');

      const operations = [
        { type: 'add', payload: {} },
        { type: 'update', payload: {} },
      ];

      const result = await executeListingCommands(operations, 1);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      expect(result).toEqual(['result1', 'result2']);
      expect(mockExecute).toHaveBeenCalledTimes(2);
    });

    it('should rollback on error', async () => {
      mockExecute.mockRejectedValue(new Error('fail'));

      const operations = [{ type: 'add', payload: {} }];

      await expect(executeListingCommands(operations, 1)).rejects.toThrow('fail');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw if operations is empty', async () => {
      await expect(executeListingCommands([], 1)).rejects.toEqual({
        status: 400,
        message: 'operations must be a non-empty array',
      });
    });

    it('should throw if operations exceeds limit', async () => {
      const ops = new Array(101).fill({ type: 'add', payload: {} });

      await expect(executeListingCommands(ops, 1)).rejects.toEqual({
        status: 400,
        message: 'A maximum of 100 operations is allowed per batch request',
      });
    });

    it('should throw on invalid operation type', async () => {
      const ops = [{ type: 'invalid', payload: {} }];

      await expect(executeListingCommands(ops, 1)).rejects.toEqual({
        status: 400,
        message: 'Unsupported command type: invalid',
      });
    });

    it('should throw if operation is not an object', async () => {
      const ops = [null];

      await expect(executeListingCommands(ops, 1)).rejects.toEqual({
        status: 400,
        message: 'Each operation must be an object',
      });
    });
  });
});