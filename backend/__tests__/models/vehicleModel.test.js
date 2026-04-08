const pool = require('../../services/db');
const {
  createVehiclesTable,
  findVehiclesByOwner,
  getAvailableVehicles,
  findVehicleByIdForOwner,
  createVehicle,
  updateVehicleById,
  removeVehicleById,
} = require('../../models/vehicleModel');

// mock the pool
jest.mock('../../services/db', () => ({
  query: jest.fn(),
}));

describe('Vehicle Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVehiclesTable', () => {
    it('should create types and table', async () => {
      pool.query.mockResolvedValue({});

      await createVehiclesTable();

      expect(pool.query).toHaveBeenCalledTimes(3);
    });
  });

  describe('findVehiclesByOwner', () => {
    it('should return vehicles for owner', async () => {
      const mockRows = [{ id: 1, name: 'Bike' }];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await findVehiclesByOwner(123);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE o.owner_id = $1'),
        [123]
      );
      expect(result).toEqual(mockRows);
    });
  });

  describe('getAvailableVehicles', () => {
    it('should return available vehicles', async () => {
      const mockRows = [{ id: 1, available: true }];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await getAvailableVehicles();

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE available = TRUE'),
      );
      expect(result).toEqual(mockRows);
    });
  });

  describe('findVehicleByIdForOwner', () => {
    it('should return vehicle if found', async () => {
      const mockRows = [{ id: 1 }];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await findVehicleByIdForOwner(1, 2);

      expect(result).toEqual(mockRows[0]);
    });

    it('should return null if not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await findVehicleByIdForOwner(1, 2);

      expect(result).toBeNull();
    });
  });

  describe('createVehicle', () => {
    it('should insert and return id', async () => {
      const mockRows = [{ id: 10 }];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await createVehicle(
        'Bike',
        'desc',
        true,
        'addr',
        'path.jpg',
        10,
        'NDG',
        'Bike'
      );

      expect(result).toEqual({ id: 10 });
    });

    it('should throw custom error on invalid enum', async () => {
      pool.query.mockRejectedValue({ code: '22P02' });

      await expect(
        createVehicle('Bike', 'desc', true, 'addr', 'path.jpg', 10, 'BAD', 'Bike')
      ).rejects.toThrow('Invalid enum value');
    });
  });

  describe('updateVehicleById', () => {
    it('should update valid fields', async () => {
      const mockRows = [{ id: 1, name: 'Updated' }];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await updateVehicleById(1, 2, { name: 'Updated' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE vehicles'),
        expect.arrayContaining(['Updated', 1, 2])
      );
      expect(result).toEqual(mockRows[0]);
    });

    it('should throw error if no valid fields', async () => {
      await expect(
        updateVehicleById(1, 2, { invalidField: 'test' })
      ).rejects.toEqual({
        status: 400,
        message: 'No valid fields provided for update',
      });
    });

    it('should return null if no rows updated', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await updateVehicleById(1, 2, { name: 'Test' });

      expect(result).toBeNull();
    });

    it('should throw custom error on enum failure', async () => {
      pool.query.mockRejectedValue({ code: '22P02' });

      await expect(
        updateVehicleById(1, 2, { region: 'INVALID' })
      ).rejects.toThrow('Invalid enum value');
    });
  });

  describe('removeVehicleById', () => {
    it('should throw if there are future rentals', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{}] }); // rental exists

      await expect(removeVehicleById(1, 2)).rejects.toEqual({
        status: 409,
        message: 'Cannot delete a vehicle with ongoing or upcoming rentals.',
      });
    });

    it('should soft delete vehicle', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // no rentals
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const result = await removeVehicleById(1, 2);

      expect(result).toEqual({ id: 1 });
    });

    it('should return null if nothing deleted', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // no rentals
        .mockResolvedValueOnce({ rows: [] });

      const result = await removeVehicleById(1, 2);

      expect(result).toBeNull();
    });
  });
});