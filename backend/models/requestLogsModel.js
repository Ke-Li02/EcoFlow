const pool = require('../services/db');

async function createRequestLogsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS request_logs (
            id SERIAL PRIMARY KEY,
            method TEXT NOT NULL,
            path TEXT NOT NULL,
            status_code INTEGER,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
}

async function logRequest(method, path, statusCode) {
    await pool.query(
        `INSERT INTO request_logs (method, path, status_code) VALUES ($1, $2, $3)`,
        [method, path, statusCode]
    );
}

async function getLogRequestVolume() {
    const { rows } = await pool.query(`
        WITH hours AS (
            SELECT generate_series(
                DATE_TRUNC('hour', NOW()) - INTERVAL '23 hours',
                DATE_TRUNC('hour', NOW()),
                INTERVAL '1 hour'
            ) AS hour
        )
        SELECT
            hours.hour,
            COALESCE(COUNT(rl.id), 0)::INT AS count
        FROM hours
        LEFT JOIN request_logs rl
            ON DATE_TRUNC('hour', rl.created_at) = hours.hour
        GROUP BY hours.hour
        ORDER BY hours.hour ASC
    `);
    return rows;
}

module.exports = { createRequestLogsTable, logRequest, getLogRequestVolume };