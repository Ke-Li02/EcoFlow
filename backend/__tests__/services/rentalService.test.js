const {
  createRentalBooking,
  getMyRentals,
  returnRental,
  getMyVehicleRentals,
} = require('../../services/rentalService');

const {
  createRental,
  hasOverlappingRental,
  findRentalsByUserId,
  findRentalByIdForUser,
  returnRentalById,
  findRentalsByVehicleOwnerId,
} = require('../../models/rentalModel');

// Mock model
jest.mock('../../models/rentalModel');

describe('Rental Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRentalBooking', () => {
    const validStart = '2026-01-01T10:00:00Z';
    const validEnd = '2026-01-01T12:00:00Z';

    it('should create rental if all inputs are valid', async () => {
      hasOverlappingRental.mockResolvedValue(false);
      createRental.mockResolvedValue({ id: 1 });

      const result = await createRentalBooking(
        1,
        2,
        validStart,
        validEnd,
        20
      );

      expect(hasOverlappingRental).toHaveBeenCalled();
      expect(createRental).toHaveBeenCalled();

      // Check unlock code length (3rd argument)
      const unlockCode = createRental.mock.calls[0][2];
      expect(unlockCode).toHaveLength(6);

      expect(result).toEqual({ id: 1 });
    });

    it('should throw if missing parameters', async () => {
      await expect(
        createRentalBooking(null, 1, validStart, validEnd, 10)
      ).rejects.toEqual({
        status: 400,
        message: 'A parameter is missing',
      });
    });

    it('should throw if invalid start date', async () => {
      await expect(
        createRentalBooking(1, 1, 'invalid-date', validEnd, 10)
      ).rejects.toEqual({
        status: 400,
        message: 'Invalid startDateTime',
      });
    });

    it('should throw if end <= start', async () => {
      await expect(
        createRentalBooking(1, 1, validStart, validStart, 10)
      ).rejects.toEqual({
        status: 400,
        message: 'End date/time must be after start date/time',
      });
    });

    it('should throw if totalAmount is invalid', async () => {
      await expect(
        createRentalBooking(1, 1, validStart, validEnd, -5)
      ).rejects.toEqual({
        status: 400,
        message: 'Invalid totalAmount',
      });
    });

    it('should throw if overlapping rental exists', async () => {
      hasOverlappingRental.mockResolvedValue(true);

      await expect(
        createRentalBooking(1, 1, validStart, validEnd, 10)
      ).rejects.toEqual({
        status: 409,
        message: 'This item is already booked for part of that time range',
      });
    });
  });

  describe('getMyRentals', () => {
    it('should return rentals for user', async () => {
      findRentalsByUserId.mockResolvedValue([{ id: 1 }]);

      const result = await getMyRentals(1);

      expect(findRentalsByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('returnRental', () => {
    it('should return rental successfully', async () => {
      findRentalByIdForUser.mockResolvedValue({ id: 1 });
      returnRentalById.mockResolvedValue({ id: 1, returned: true });

      const result = await returnRental(1, 2);

      expect(findRentalByIdForUser).toHaveBeenCalledWith(1, 2);
      expect(returnRentalById).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual({ id: 1, returned: true });
    });

    it('should throw if rentalId is invalid', async () => {
      await expect(returnRental('abc', 1)).rejects.toEqual({
        status: 400,
        message: 'Invalid rental id',
      });
    });

    it('should throw if rental not found', async () => {
      findRentalByIdForUser.mockResolvedValue(null);

      await expect(returnRental(1, 2)).rejects.toEqual({
        status: 404,
        message: 'Rental not found',
      });
    });

    it('should throw if return fails', async () => {
      findRentalByIdForUser.mockResolvedValue({ id: 1 });
      returnRentalById.mockResolvedValue(null);

      await expect(returnRental(1, 2)).rejects.toEqual({
        status: 500,
        message: 'Failed to return rental',
      });
    });
  });

  describe('getMyVehicleRentals', () => {
    it('should return rentals for owner', async () => {
      findRentalsByVehicleOwnerId.mockResolvedValue([{ id: 1 }]);

      const result = await getMyVehicleRentals(99);

      expect(findRentalsByVehicleOwnerId).toHaveBeenCalledWith(99);
      expect(result).toEqual([{ id: 1 }]);
    });
  });
});