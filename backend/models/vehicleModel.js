const pool = require('../services/db');

async function createVehicleType() {
  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE vehicle_type AS ENUM ('Bike', 'EV', 'Scooter');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
    `);
}

async function createRegionType() {
  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE region_type AS ENUM (
        'Ahuntsic-Cartierville',
        'Anjou',
        'NDG',
        'Lachine',
        'LaSalle',
        'Mercier-Hochelaga Maisonneuve',
        'Montreal-Nord',
        'Outremont',
        'Westmount',
        'Pierrefonds-Roxboro',
        'Le Plateau-Mont Royal',
        'Pointe aux Trembles',
        'Rosemont La Petite Patrie',
        'Saint-Leonard',
        'Sud-Ouest',
        'West-Island',
        'Verdun',
        'Ville-Marie',
        'Villeray-Saint-Michel-Parc-Extension'
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
    `);
}


async function createVehiclesTable() {
  await createVehicleType();
  await createRegionType();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      available BOOLEAN DEFAULT TRUE,
      address TEXT NOT NULL,
      photo_path TEXT NOT NULL,
      hourly_rate DECIMAL(10,2) NOT NULL,
      region region_type NOT NULL,
      vehicle_type vehicle_type NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function findVehiclesByOwner(owner) {
  const { rows } = await pool.query('SELECT v.id, v.name, v.description, v.available, v.address, v.photo_path AS "photoPath", v.hourly_rate::FLOAT AS "hourlyRate", v.region, v.vehicle_type AS "vehicleType" FROM vehicles v JOIN ownerships o ON v.id = o.vehicle_id WHERE o.owner_id = $1', [owner]);
  return rows;
}

async function getAvailableVehicles() {
  const { rows } = await pool.query('SELECT id, name, description, available, address, photo_path AS "photoPath", hourly_rate::FLOAT AS "hourlyRate", region, vehicle_type AS "vehicleType" FROM vehicles WHERE available = TRUE;');
  return rows;
}

async function createVehicle(name, description, available, address, photoPath, hourlyRate, region, vehicleType) {
  try {
    const { rows } = await pool.query(
      'INSERT INTO vehicles (name, description, available, address, photo_path, hourly_rate, region, vehicle_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [name, description, available, address, photoPath, hourlyRate, region, vehicleType]
    );
    return rows[0];
  } catch (err) {
    if (err.code === '22P02') {
      throw new Error(`Invalid enum value — check that region and vehicle type are valid options`);
    }
    throw err;
  }
}

module.exports = { createVehiclesTable, findVehiclesByOwner, getAvailableVehicles, createVehicle };

