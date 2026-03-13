const pool = require('../services/db');

async function createVehiclesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      available BOOLEAN DEFAULT TRUE,
      address TEXT NOT NULL,
      photo_path TEXT NOT NULL,
      hourly_rate DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function findVehiclesByOwner(owner) {
  const { rows } = await pool.query('SELECT v.id, v.name, v.description, v.available, v.address, v.photo_path, v.hourly_rate::FLOAT FROM vehicles v JOIN ownerships o ON v.id = o.vehicle_id WHERE o.owner_id = $1', [owner]);
  return rows;
}

async function getAvailableVehicles() {
  const { rows } = await pool.query('SELECT id, name, description, available, address, photo_path, hourly_rate::FLOAT FROM vehicles WHERE available = TRUE;');
  return rows;
}

async function createVehicle(name, description, available, address, photoPath, hourlyRate) {
  const { rows } = await pool.query(
    'INSERT INTO vehicles (name, description, available, address, photo_path, hourly_rate) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [name, description, available, address, photoPath, hourlyRate]
  );
  return rows[0];
}

module.exports = { createVehiclesTable, findVehiclesByOwner, getAvailableVehicles, createVehicle };

