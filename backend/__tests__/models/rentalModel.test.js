const {
  createRentalsTable,
  createRental,
  hasOverlappingRental,
  findRentalsByUserId,
  findRentalByIdForUser,
  returnRentalById,
  findRentalsByVehicleOwnerId,
} = require('../../models/rentalModel');

const pool = require('../../services/db');

jest.mock('../../services/db', () => ({ query: jest.fn() }));

const mockExecutor = () => ({ query: jest.fn() });

afterEach(() => jest.clearAllMocks());

describe('createRentalsTable', () => {
  test('runs three queries: CREATE TABLE and two ALTER TABLE statements', async () => {
    pool.query.mockResolvedValue({});

    await createRentalsTable();

    expect(pool.query).toHaveBeenCalledTimes(3);
    expect(pool.query.mock.calls[0][0]).toMatch(/CREATE TABLE IF NOT EXISTS rentals/i);
    expect(pool.query.mock.calls[1][0]).toMatch(/ALTER TABLE rentals ADD COLUMN IF NOT EXISTS unlock_code/i);
    expect(pool.query.mock.calls[2][0]).toMatch(/ALTER TABLE rentals ADD COLUMN IF NOT EXISTS returned_at/i);
  });

  test('propagates errors from the pool', async () => {
    pool.query.mockRejectedValue(new Error('DB unavailable'));

    await expect(createRentalsTable()).rejects.toThrow('DB unavailable');
  });
});

describe('createRental', () => {
  const args = ['v-1', 'u-1', 'ABC123', '2026-05-01T09:00', '2026-05-01T12:00', 30];

  test('inserts a row and returns the new record', async () => {
    const row = { id: 1 };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await createRental(...args);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO rentals'),
      args
    );
    expect(result).toEqual(row);
  });

  test('uses a custom executor when provided', async () => {
    const executor = mockExecutor();
    executor.query.mockResolvedValue({ rows: [{ id: 2 }] });

    await createRental(...args, executor);

    expect(executor.query).toHaveBeenCalledTimes(1);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('propagates errors from the executor', async () => {
    pool.query.mockRejectedValue(new Error('Insert failed'));

    await expect(createRental(...args)).rejects.toThrow('Insert failed');
  });
});

describe('hasOverlappingRental', () => {
  const args = ['v-1', '2026-05-01T09:00', '2026-05-01T12:00'];

  test('returns true when an overlapping rental exists', async () => {
    pool.query.mockResolvedValue({ rows: [{ 1: 1 }] });

    const result = await hasOverlappingRental(...args);

    expect(result).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE vehicle_id = $1'),
      args
    );
  });

  test('returns false when no overlapping rental exists', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await hasOverlappingRental(...args);

    expect(result).toBe(false);
  });

  test('uses a custom executor when provided', async () => {
    const executor = mockExecutor();
    executor.query.mockResolvedValue({ rows: [] });

    await hasOverlappingRental(...args, executor);

    expect(executor.query).toHaveBeenCalledTimes(1);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('propagates errors from the executor', async () => {
    pool.query.mockRejectedValue(new Error('Query failed'));

    await expect(hasOverlappingRental(...args)).rejects.toThrow('Query failed');
  });
});

describe('findRentalsByUserId', () => {
  test('returns rows for the given user', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    pool.query.mockResolvedValue({ rows });

    const result = await findRentalsByUserId('u-1');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE r.renter_id = $1'),
      ['u-1']
    );
    expect(result).toEqual(rows);
  });

  test('returns an empty array when user has no rentals', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await findRentalsByUserId('u-1');

    expect(result).toEqual([]);
  });

  test('uses a custom executor when provided', async () => {
    const executor = mockExecutor();
    executor.query.mockResolvedValue({ rows: [] });

    await findRentalsByUserId('u-1', executor);

    expect(executor.query).toHaveBeenCalledTimes(1);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('propagates errors from the executor', async () => {
    pool.query.mockRejectedValue(new Error('Query failed'));

    await expect(findRentalsByUserId('u-1')).rejects.toThrow('Query failed');
  });
});

describe('findRentalByIdForUser', () => {
  test('returns the rental when found', async () => {
    const row = { id: 1, renterId: 'u-1' };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await findRentalByIdForUser('r-1', 'u-1');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = $1 AND renter_id = $2'),
      ['r-1', 'u-1']
    );
    expect(result).toEqual(row);
  });

  test('returns null when no rental is found', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await findRentalByIdForUser('r-99', 'u-1');

    expect(result).toBeNull();
  });

  test('uses a custom executor when provided', async () => {
    const executor = mockExecutor();
    executor.query.mockResolvedValue({ rows: [{ id: 1 }] });

    await findRentalByIdForUser('r-1', 'u-1', executor);

    expect(executor.query).toHaveBeenCalledTimes(1);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('propagates errors from the executor', async () => {
    pool.query.mockRejectedValue(new Error('Query failed'));

    await expect(findRentalByIdForUser('r-1', 'u-1')).rejects.toThrow('Query failed');
  });
});

describe('returnRentalById', () => {
  test('returns the updated rental on success', async () => {
    const row = { id: 1, returnedAt: '2026-05-01T10:00' };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await returnRentalById('r-1', 'u-1');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SET returned_at = COALESCE'),
      ['r-1', 'u-1']
    );
    expect(result).toEqual(row);
  });

  test('returns null when no matching rental is found', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await returnRentalById('r-99', 'u-1');

    expect(result).toBeNull();
  });

  test('uses a custom executor when provided', async () => {
    const executor = mockExecutor();
    executor.query.mockResolvedValue({ rows: [{ id: 1 }] });

    await returnRentalById('r-1', 'u-1', executor);

    expect(executor.query).toHaveBeenCalledTimes(1);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('propagates errors from the executor', async () => {
    pool.query.mockRejectedValue(new Error('Update failed'));

    await expect(returnRentalById('r-1', 'u-1')).rejects.toThrow('Update failed');
  });
});

describe('findRentalsByVehicleOwnerId', () => {
  test('returns rentals for vehicles owned by the user', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    pool.query.mockResolvedValue({ rows });

    const result = await findRentalsByVehicleOwnerId('u-1');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE o.owner_id = $1'),
      ['u-1']
    );
    expect(result).toEqual(rows);
  });

  test('returns an empty array when the owner has no rentals', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await findRentalsByVehicleOwnerId('u-1');

    expect(result).toEqual([]);
  });

  test('uses a custom executor when provided', async () => {
    const executor = mockExecutor();
    executor.query.mockResolvedValue({ rows: [] });

    await findRentalsByVehicleOwnerId('u-1', executor);

    expect(executor.query).toHaveBeenCalledTimes(1);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('propagates errors from the executor', async () => {
    pool.query.mockRejectedValue(new Error('Query failed'));

    await expect(findRentalsByVehicleOwnerId('u-1')).rejects.toThrow('Query failed');
  });
});