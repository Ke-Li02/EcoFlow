const { createOwnershipsTable, createOwnership } = require('../../models/ownershipModel');
const pool = require('../../services/db');

jest.mock('../../services/db', () => ({ query: jest.fn() }));

afterEach(() => jest.clearAllMocks());

describe('createOwnershipsTable', () => {
  test('executes a CREATE TABLE IF NOT EXISTS query', async () => {
    pool.query.mockResolvedValue({});

    await createOwnershipsTable();

    expect(pool.query).toHaveBeenCalledTimes(1);
    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS ownerships/i);
  });

  test('propagates errors from the pool', async () => {
    pool.query.mockRejectedValue(new Error('DB unavailable'));

    await expect(createOwnershipsTable()).rejects.toThrow('DB unavailable');
  });
});

describe('createOwnership', () => {
  test('inserts a row and returns the new record', async () => {
    const row = { id: 1 };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await createOwnership('v-1', 'u-1');

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO ownerships (vehicle_id, owner_id) VALUES ($1, $2) RETURNING id',
      ['v-1', 'u-1']
    );
    expect(result).toEqual(row);
  });

  test('uses the default pool when no executor is provided', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 2 }] });

    await createOwnership('v-2', 'u-2');

    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test('uses a custom executor when provided', async () => {
    const mockExecutor = { query: jest.fn().mockResolvedValue({ rows: [{ id: 3 }] }) };

    const result = await createOwnership('v-3', 'u-3', mockExecutor);

    expect(mockExecutor.query).toHaveBeenCalledWith(
      'INSERT INTO ownerships (vehicle_id, owner_id) VALUES ($1, $2) RETURNING id',
      ['v-3', 'u-3']
    );
    expect(pool.query).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 3 });
  });

  test('propagates errors from the executor', async () => {
    pool.query.mockRejectedValue(new Error('Insert failed'));

    await expect(createOwnership('v-4', 'u-4')).rejects.toThrow('Insert failed');
  });
});