//new code to fix db auth error
const db = require('../services/db');

async function createRequestLogsTable() {
  await db.getPool().query(`
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
  await db.getPool().query(
    `INSERT INTO request_logs (method, path, status_code) VALUES ($1, $2, $3)`,
    [method, path, statusCode]
  );
}

async function getLogRequestVolume() {
  const { rows } = await db.getPool().query(`
    WITH hours AS (
      SELECT generate_series(
        DATE_TRUNC('hour', NOW()) - INTERVAL '23 hours',
        DATE_TRUNC('hour', NOW()),
        INTERVAL '1 hour'
      ) AS hour
    )
    SELECT hours.hour, COALESCE(COUNT(rl.id), 0)::INT AS count
    FROM hours
    LEFT JOIN request_logs rl ON DATE_TRUNC('hour', rl.created_at) = hours.hour
    GROUP BY hours.hour ORDER BY hours.hour ASC
  `);
  return rows;
}

async function getStatusCodeBreakdown() {
  const { rows } = await db.getPool().query(`
    SELECT status_code, COUNT(*)::INT AS count
    FROM request_logs
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY status_code ORDER BY status_code ASC
  `);
  return rows;
}

async function getTopEndpoints() {
  const { rows } = await db.getPool().query(`
    SELECT method, path, COUNT(*)::INT AS count
    FROM request_logs
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY method, path ORDER BY count DESC LIMIT 10
  `);
  return rows;
}

module.exports = { createRequestLogsTable, logRequest, getLogRequestVolume, getStatusCodeBreakdown, getTopEndpoints };

// const pool = require('../services/db');

// async function createRequestLogsTable() {
//     await pool.query(`
//         CREATE TABLE IF NOT EXISTS request_logs (
//             id SERIAL PRIMARY KEY,
//             method TEXT NOT NULL,
//             path TEXT NOT NULL,
//             status_code INTEGER,
//             created_at TIMESTAMPTZ DEFAULT NOW()
//         )
//     `);
// }

// async function logRequest(method, path, statusCode) {
//     await pool.query(
//         `INSERT INTO request_logs (method, path, status_code) VALUES ($1, $2, $3)`,
//         [method, path, statusCode]
//     );
// }

// async function getLogRequestVolume() {
//     const { rows } = await pool.query(`
//         WITH hours AS (
//             SELECT generate_series(
//                 DATE_TRUNC('hour', NOW()) - INTERVAL '23 hours',
//                 DATE_TRUNC('hour', NOW()),
//                 INTERVAL '1 hour'
//             ) AS hour
//         )
//         SELECT
//             hours.hour,
//             COALESCE(COUNT(rl.id), 0)::INT AS count
//         FROM hours
//         LEFT JOIN request_logs rl
//             ON DATE_TRUNC('hour', rl.created_at) = hours.hour
//         GROUP BY hours.hour
//         ORDER BY hours.hour ASC
//     `);
//     return rows;
// }

// async function getStatusCodeBreakdown() {
//     const { rows } = await pool.query(`
//         SELECT
//             status_code,
//             COUNT(*)::INT AS count
//         FROM request_logs
//         WHERE created_at > NOW() - INTERVAL '24 hours'
//         GROUP BY status_code
//         ORDER BY status_code ASC
//     `);
//     return rows;
// }

// async function getTopEndpoints() {
//     const { rows } = await pool.query(`
//         SELECT
//             method,
//             path,
//             COUNT(*)::INT AS count
//         FROM request_logs
//         WHERE created_at > NOW() - INTERVAL '24 hours'
//         GROUP BY method, path
//         ORDER BY count DESC
//         LIMIT 10
//     `);
//     return rows;
// }

// module.exports = { createRequestLogsTable, logRequest, getLogRequestVolume, getStatusCodeBreakdown, getTopEndpoints };