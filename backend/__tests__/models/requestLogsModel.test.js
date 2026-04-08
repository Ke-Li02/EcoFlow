const {
    createRequestLogsTable,
    logRequest,
    getLogRequestVolume,
    getStatusCodeBreakdown,
    getTopEndpoints,
} = require('../../models/requestLogsModel');

// Mock the db pool
jest.mock('../../services/db', () => ({ query: jest.fn() }));
const pool = require('../../services/db');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('createRequestLogsTable', () => {
    it('executes a CREATE TABLE IF NOT EXISTS query', async () => {
        pool.query.mockResolvedValueOnce({});

        await createRequestLogsTable();

        expect(pool.query).toHaveBeenCalledTimes(1);
        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS request_logs/i);
    });

    it('creates the table with all required columns', async () => {
        pool.query.mockResolvedValueOnce({});

        await createRequestLogsTable();

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/id/i);
        expect(sql).toMatch(/method/i);
        expect(sql).toMatch(/path/i);
        expect(sql).toMatch(/status_code/i);
        expect(sql).toMatch(/created_at/i);
    });

    it('propagates database errors', async () => {
        pool.query.mockRejectedValueOnce(new Error('DB error'));

        await expect(createRequestLogsTable()).rejects.toThrow('DB error');
    });
});

describe('logRequest', () => {
    it('inserts a row with the correct method, path, and status code', async () => {
        pool.query.mockResolvedValueOnce({});

        await logRequest('GET', '/api/users', 200);

        expect(pool.query).toHaveBeenCalledTimes(1);
        const [sql, params] = pool.query.mock.calls[0];
        expect(sql).toMatch(/INSERT INTO request_logs/i);
        expect(params).toEqual(['GET', '/api/users', 200]);
    });

    it('uses parameterised values ($1 $2 $3) to prevent SQL injection', async () => {
        pool.query.mockResolvedValueOnce({});

        await logRequest('POST', '/login', 401);

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/\$1/);
        expect(sql).toMatch(/\$2/);
        expect(sql).toMatch(/\$3/);
    });

    it('works with non-200 status codes', async () => {
        pool.query.mockResolvedValueOnce({});

        await logRequest('DELETE', '/api/items/99', 404);

        const [, params] = pool.query.mock.calls[0];
        expect(params).toEqual(['DELETE', '/api/items/99', 404]);
    });

    it('propagates database errors', async () => {
        pool.query.mockRejectedValueOnce(new Error('Insert failed'));

        await expect(logRequest('GET', '/', 200)).rejects.toThrow('Insert failed');
    });
});

describe('getLogRequestVolume', () => {
    const mockRows = [
        { hour: '2024-01-01T00:00:00.000Z', count: 5 },
        { hour: '2024-01-01T01:00:00.000Z', count: 12 },
    ];

    it('returns the rows from the query', async () => {
        pool.query.mockResolvedValueOnce({ rows: mockRows });

        const result = await getLogRequestVolume();

        expect(result).toEqual(mockRows);
    });

    it('queries the last 24 hours in 1-hour buckets', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        await getLogRequestVolume();

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/generate_series/i);
        expect(sql).toMatch(/23 hours/i);
        expect(sql).toMatch(/1 hour/i);
    });

    it('returns an empty array when there are no logs', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const result = await getLogRequestVolume();

        expect(result).toEqual([]);
    });

    it('propagates database errors', async () => {
        pool.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(getLogRequestVolume()).rejects.toThrow('Query failed');
    });
});

describe('getStatusCodeBreakdown', () => {
    const mockRows = [
        { status_code: 200, count: 80 },
        { status_code: 404, count: 10 },
        { status_code: 500, count: 3 },
    ];

    it('returns the rows from the query', async () => {
        pool.query.mockResolvedValueOnce({ rows: mockRows });

        const result = await getStatusCodeBreakdown();

        expect(result).toEqual(mockRows);
    });

    it('filters results to the last 24 hours', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        await getStatusCodeBreakdown();

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/24 hours/i);
    });

    it('groups and orders by status_code ascending', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        await getStatusCodeBreakdown();

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/GROUP BY status_code/i);
        expect(sql).toMatch(/ORDER BY status_code ASC/i);
    });

    it('returns an empty array when there are no logs', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const result = await getStatusCodeBreakdown();

        expect(result).toEqual([]);
    });

    it('propagates database errors', async () => {
        pool.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(getStatusCodeBreakdown()).rejects.toThrow('Query failed');
    });
});

describe('getTopEndpoints', () => {
    const mockRows = [
        { method: 'GET',  path: '/api/users',   count: 340 },
        { method: 'POST', path: '/api/orders',  count: 210 },
        { method: 'GET',  path: '/health',      count: 180 },
    ];

    it('returns the rows from the query', async () => {
        pool.query.mockResolvedValueOnce({ rows: mockRows });

        const result = await getTopEndpoints();

        expect(result).toEqual(mockRows);
    });

    it('limits results to 10 endpoints', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        await getTopEndpoints();

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/LIMIT 10/i);
    });

    it('filters results to the last 24 hours', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        await getTopEndpoints();

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/24 hours/i);
    });

    it('groups by method and path, ordered by count descending', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        await getTopEndpoints();

        const sql = pool.query.mock.calls[0][0];
        expect(sql).toMatch(/GROUP BY method, path/i);
        expect(sql).toMatch(/ORDER BY count DESC/i);
    });

    it('returns an empty array when there are no logs', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const result = await getTopEndpoints();

        expect(result).toEqual([]);
    });

    it('propagates database errors', async () => {
        pool.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(getTopEndpoints()).rejects.toThrow('Query failed');
    });
});