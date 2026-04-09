const pool = require('../services/db');

async function createOwnershipsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ownerships (
      id SERIAL PRIMARY KEY,
      vehicle_id INT NOT NULL REFERENCES vehicles(id),
      owner_id INT NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function createOwnership(vehicle, owner, executor = pool) {
  const { rows } = await executor.query(
    'INSERT INTO ownerships (vehicle_id, owner_id) VALUES ($1, $2) RETURNING id',
    [vehicle, owner]
  );
  return rows[0];
}

module.exports = { createOwnershipsTable, createOwnership };

