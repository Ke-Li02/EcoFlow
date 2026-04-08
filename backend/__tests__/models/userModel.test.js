const { createUsersTable, findUserByUsername, createUser } = require('../../models/userModel');

// Mock the db pool
jest.mock('../../services/db', () => ({ query: jest.fn() }));
const pool = require('../../services/db');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('createUsersTable', () => {
    it('executes a CREATE TABLE IF NOT EXISTS query', async () => {
        pool.query.mockResolvedValueOnce({});

        await createUsersTable();

        expect(pool.query).toHaveBeenCalledTimes(1);
        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS users/i);
    });

    it('creates the table with all required columns', async () => {
        pool.query.mockResolvedValueOnce({});

        await createUsersTable();

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/id/i);
        expect(sql).toMatch(/username/i);
        expect(sql).toMatch(/password/i);
        expect(sql).toMatch(/is_admin/i);
        expect(sql).toMatch(/created_at/i);
    });

    it('defines username as UNIQUE', async () => {
        pool.query.mockResolvedValueOnce({});

        await createUsersTable();

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/username\s+TEXT\s+UNIQUE/i);
    });

    it('defaults is_admin to FALSE', async () => {
        pool.query.mockResolvedValueOnce({});

        await createUsersTable();

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/is_admin\s+BOOLEAN\s+DEFAULT\s+FALSE/i);
    });

    it('propagates database errors', async () => {
        pool.query.mockRejectedValueOnce(new Error('DB error'));

        await expect(createUsersTable()).rejects.toThrow('DB error');
    });
});

describe('findUserByUsername', () => {
    const mockUser = {
        id: 1,
        username: 'alice',
        password: 'hashed_pw',
        is_admin: false,
        created_at: new Date(),
    };

    it('returns the matching user row', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockUser] });

        const result = await findUserByUsername('alice');

        expect(result).toEqual(mockUser);
    });

    it('queries by username using a parameterised value', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockUser] });

        await findUserByUsername('alice');

        const [sql, params] = pool.query.mock.calls[0];
        expect(sql).toMatch(/WHERE username = \$1/i);
        expect(params).toEqual(['alice']);
    });

    it('returns undefined when no user is found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const result = await findUserByUsername('ghost');

        expect(result).toBeUndefined();
    });

    it('selects all columns for the returned user', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockUser] });

        await findUserByUsername('alice');

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/SELECT \*/i);
    });

    it('propagates database errors', async () => {
        pool.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(findUserByUsername('alice')).rejects.toThrow('Query failed');
    });
});

describe('createUser', () => {
    const mockCreatedUser = {
        id: 1,
        username: 'bob',
        is_admin: false,
        created_at: new Date(),
    };

    it('returns the newly created user row', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockCreatedUser] });

        const result = await createUser('bob', 'hashed_pw', false);

        expect(result).toEqual(mockCreatedUser);
    });

    it('passes username, hashedPassword, and isAdmin as parameterised values', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockCreatedUser] });

        await createUser('bob', 'hashed_pw', false);

        const [sql, params] = pool.query.mock.calls[0];
        expect(sql).toMatch(/INSERT INTO users/i);
        expect(params).toEqual(['bob', 'hashed_pw', false]);
    });

    it('uses RETURNING to avoid a second query for the new row', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockCreatedUser] });

        await createUser('bob', 'hashed_pw', false);

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/RETURNING/i);
    });

    it('does not return the password in the result', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockCreatedUser] });

        await createUser('bob', 'hashed_pw', false);

        const sql = pool.query.mock.calls[0][0];
        // password should not appear after the RETURNING keyword
        const returningClause = sql.split(/RETURNING/i)[1];
        expect(returningClause).not.toMatch(/password/i);
    });

    it('can create an admin user', async () => {
        const adminUser = { ...mockCreatedUser, is_admin: true };
        pool.query.mockResolvedValueOnce({ rows: [adminUser] });

        const result = await createUser('admin', 'hashed_pw', true);

        const [, params] = pool.query.mock.calls[0];
        expect(params[2]).toBe(true);
        expect(result.is_admin).toBe(true);
    });

    it('propagates database errors (e.g. duplicate username)', async () => {
        pool.query.mockRejectedValueOnce(new Error('duplicate key value violates unique constraint'));

        await expect(createUser('bob', 'hashed_pw', false)).rejects.toThrow(
            'duplicate key value violates unique constraint'
        );
    });
});