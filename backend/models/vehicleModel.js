//new code to fix the db auth error
const db = require('../services/db');

const VEHICLE_SELECT = 'v.id, v.name, v.description, v.available, v.address, v.photo_path AS "photoPath", v.hourly_rate::FLOAT AS "hourlyRate", v.region, v.vehicle_type AS "vehicleType"';

async function createVehicleType() {
  await db.getPool().query(`
    DO $$ BEGIN
      CREATE TYPE vehicle_type AS ENUM ('Bike', 'EV', 'Scooter');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

async function createRegionType() {
  await db.getPool().query(`
    DO $$ BEGIN
      CREATE TYPE region_type AS ENUM (
        'Ahuntsic-Cartierville','Anjou','NDG','Lachine','LaSalle',
        'Mercier-Hochelaga Maisonneuve','Montreal-Nord','Outremont','Westmount',
        'Pierrefonds-Roxboro','Le Plateau-Mont Royal','Pointe aux Trembles',
        'Rosemont La Petite Patrie','Saint-Leonard','Sud-Ouest','West-Island',
        'Verdun','Ville-Marie','Villeray-Saint-Michel-Parc-Extension'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

async function createVehiclesTable() {
  await createVehicleType();
  await createRegionType();
  await db.getPool().query(`
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
      deleted boolean DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function findVehiclesByOwner(owner) {
  const { rows } = await db.getPool().query(
    `SELECT ${VEHICLE_SELECT} FROM vehicles v JOIN ownerships o ON v.id = o.vehicle_id WHERE o.owner_id = $1 AND NOT deleted`,
    [owner]
  );
  return rows;
}

async function getAvailableVehicles() {
  const { rows } = await db.getPool().query(
    'SELECT id, name, description, available, address, photo_path AS "photoPath", hourly_rate::FLOAT AS "hourlyRate", region, vehicle_type AS "vehicleType" FROM vehicles WHERE available = TRUE AND NOT deleted;'
  );
  return rows;
}

async function findVehicleByIdForOwner(vehicleId, ownerId, executor = null) {
  const pool = executor || db.getPool();
  const { rows } = await pool.query(
    `SELECT ${VEHICLE_SELECT} FROM vehicles v JOIN ownerships o ON v.id = o.vehicle_id WHERE v.id = $1 AND o.owner_id = $2 AND NOT deleted`,
    [vehicleId, ownerId]
  );
  return rows[0] ?? null;
}

async function createVehicle(name, description, available, address, photoPath, hourlyRate, region, vehicleType, executor = null) {
  const pool = executor || db.getPool();
  try {
    const { rows } = await pool.query(
      'INSERT INTO vehicles (name, description, available, address, photo_path, hourly_rate, region, vehicle_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [name, description, available, address, photoPath, hourlyRate, region, vehicleType]
    );
    return rows[0];
  } catch (err) {
    if (err.code === '22P02') throw new Error(`Invalid enum value — check that region and vehicle type are valid options`);
    throw err;
  }
}

async function updateVehicleById(vehicleId, ownerId, updates, executor = null) {
  const pool = executor || db.getPool();
  const allowedFields = {
    name: 'name', description: 'description', available: 'available',
    address: 'address', photoPath: 'photo_path', hourlyRate: 'hourly_rate',
    region: 'region', vehicleType: 'vehicle_type',
  };

  const entries = Object.entries(updates).filter(([key, value]) => allowedFields[key] && value !== undefined);
  if (entries.length === 0) throw { status: 400, message: 'No valid fields provided for update' };

  const setClauses = entries.map(([key], index) => `${allowedFields[key]} = $${index + 1}`);
  const values = [...entries.map(([, value]) => value), vehicleId, ownerId];

  try {
    const { rows } = await pool.query(
      `UPDATE vehicles v SET ${setClauses.join(', ')}
       FROM ownerships o
       WHERE v.id = o.vehicle_id AND v.id = $${entries.length + 1} AND o.owner_id = $${entries.length + 2} AND NOT deleted
       RETURNING ${VEHICLE_SELECT}`,
      values
    );
    return rows[0] ?? null;
  } catch (err) {
    if (err.code === '22P02') throw new Error('Invalid enum value - check that region and vehicle type are valid options');
    throw err;
  }
}

async function removeVehicleById(vehicleId, ownerId, executor = null) {
  const pool = executor || db.getPool();
  const { rows: rentalRows } = await pool.query(
    `SELECT 1 FROM rentals r JOIN ownerships o ON o.vehicle_id = r.vehicle_id
     WHERE r.vehicle_id = $1 AND o.owner_id = $2 AND r.end_time > NOW() LIMIT 1`,
    [vehicleId, ownerId]
  );
  if (rentalRows.length > 0) throw { status: 409, message: 'Cannot delete a vehicle with ongoing or upcoming rentals.' };

  const { rows } = await pool.query(
    `UPDATE vehicles v SET deleted = TRUE FROM ownerships o
     WHERE v.id = o.vehicle_id AND v.id = $1 AND o.owner_id = $2 AND NOT v.deleted
     AND NOT EXISTS (SELECT 1 FROM rentals r WHERE r.vehicle_id = $1 AND r.end_time > NOW())
     RETURNING v.id`,
    [vehicleId, ownerId]
  );
  return rows[0] ?? null;
}

module.exports = { createVehiclesTable, findVehiclesByOwner, getAvailableVehicles, findVehicleByIdForOwner, createVehicle, updateVehicleById, removeVehicleById };
// const pool = require('../services/db');

// const VEHICLE_SELECT = 'v.id, v.name, v.description, v.available, v.address, v.photo_path AS "photoPath", v.hourly_rate::FLOAT AS "hourlyRate", v.region, v.vehicle_type AS "vehicleType"';

// async function createVehicleType() {
//   await pool.query(`
//     DO $$ BEGIN
//       CREATE TYPE vehicle_type AS ENUM ('Bike', 'EV', 'Scooter');
//     EXCEPTION
//       WHEN duplicate_object THEN NULL;
//     END $$;
//     `);
// }

// async function createRegionType() {
//   await pool.query(`
//     DO $$ BEGIN
//       CREATE TYPE region_type AS ENUM (
//         'Ahuntsic-Cartierville',
//         'Anjou',
//         'NDG',
//         'Lachine',
//         'LaSalle',
//         'Mercier-Hochelaga Maisonneuve',
//         'Montreal-Nord',
//         'Outremont',
//         'Westmount',
//         'Pierrefonds-Roxboro',
//         'Le Plateau-Mont Royal',
//         'Pointe aux Trembles',
//         'Rosemont La Petite Patrie',
//         'Saint-Leonard',
//         'Sud-Ouest',
//         'West-Island',
//         'Verdun',
//         'Ville-Marie',
//         'Villeray-Saint-Michel-Parc-Extension'
//       );
//     EXCEPTION
//       WHEN duplicate_object THEN NULL;
//     END $$;
//     `);
// }


// async function createVehiclesTable() {
//   await createVehicleType();
//   await createRegionType();
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS vehicles (
//       id SERIAL PRIMARY KEY,
//       name TEXT NOT NULL,
//       description TEXT NOT NULL,
//       available BOOLEAN DEFAULT TRUE,
//       address TEXT NOT NULL,
//       photo_path TEXT NOT NULL,
//       hourly_rate DECIMAL(10,2) NOT NULL,
//       region region_type NOT NULL,
//       vehicle_type vehicle_type NOT NULL,
//       deleted boolean DEFAULT FALSE,
//       created_at TIMESTAMPTZ DEFAULT NOW()
//     )
//   `);
// }

// async function findVehiclesByOwner(owner) {
//   const { rows } = await pool.query(`SELECT ${VEHICLE_SELECT} FROM vehicles v JOIN ownerships o ON v.id = o.vehicle_id WHERE o.owner_id = $1 AND NOT deleted`, [owner]);
//   return rows;
// }

// async function getAvailableVehicles() {
//   const { rows } = await pool.query('SELECT id, name, description, available, address, photo_path AS "photoPath", hourly_rate::FLOAT AS "hourlyRate", region, vehicle_type AS "vehicleType" FROM vehicles WHERE available = TRUE AND NOT deleted;');
//   return rows;
// }

// async function findVehicleByIdForOwner(vehicleId, ownerId, executor = pool) {
//   const { rows } = await executor.query(
//     `SELECT ${VEHICLE_SELECT} FROM vehicles v JOIN ownerships o ON v.id = o.vehicle_id WHERE v.id = $1 AND o.owner_id = $2 AND NOT deleted`,
//     [vehicleId, ownerId]
//   );

//   return rows[0] ?? null;
// }

// async function createVehicle(name, description, available, address, photoPath, hourlyRate, region, vehicleType, executor = pool) {
//   try {
//     const { rows } = await executor.query(
//       'INSERT INTO vehicles (name, description, available, address, photo_path, hourly_rate, region, vehicle_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
//       [name, description, available, address, photoPath, hourlyRate, region, vehicleType]
//     );
//     return rows[0];
//   } catch (err) {
//     if (err.code === '22P02') {
//       throw new Error(`Invalid enum value — check that region and vehicle type are valid options`);
//     }
//     throw err;
//   }
// }

// async function updateVehicleById(vehicleId, ownerId, updates, executor = pool) {
//   const allowedFields = {
//     name: 'name',
//     description: 'description',
//     available: 'available',
//     address: 'address',
//     photoPath: 'photo_path',
//     hourlyRate: 'hourly_rate',
//     region: 'region',
//     vehicleType: 'vehicle_type',
//   };

//   const entries = Object.entries(updates).filter(([key, value]) => allowedFields[key] && value !== undefined);
//   if (entries.length === 0) {
//     throw { status: 400, message: 'No valid fields provided for update' };
//   }

//   const setClauses = entries.map(([key], index) => `${allowedFields[key]} = $${index + 1}`);
//   const values = entries.map(([, value]) => value);
//   values.push(vehicleId, ownerId);

//   try {
//     const { rows } = await executor.query(
//       `UPDATE vehicles v
//        SET ${setClauses.join(', ')}
//        FROM ownerships o
//        WHERE v.id = o.vehicle_id
//          AND v.id = $${entries.length + 1}
//          AND o.owner_id = $${entries.length + 2}
//          AND NOT deleted
//        RETURNING ${VEHICLE_SELECT}`,
//       values
//     );

//     return rows[0] ?? null;
//   } catch (err) {
//     if (err.code === '22P02') {
//       throw new Error('Invalid enum value - check that region and vehicle type are valid options');
//     }

//     throw err;
//   }
// }

// async function removeVehicleById(vehicleId, ownerId, executor = pool) {
//   // Check for ongoing/future rentals first
//   const { rows: rentalRows } = await executor.query(
//     `SELECT 1 FROM rentals r
//       JOIN ownerships o ON o.vehicle_id = r.vehicle_id
//       WHERE r.vehicle_id = $1
//         AND o.owner_id = $2
//         AND r.end_time > NOW()
//       LIMIT 1`,
//     [vehicleId, ownerId]
//   );

//   if (rentalRows.length > 0) {
//     throw { status: 409, message: 'Cannot delete a vehicle with ongoing or upcoming rentals.' };
//   }

//   const { rows } = await executor.query(
//     ` UPDATE vehicles v
//       SET deleted = TRUE
//       FROM ownerships o
//       WHERE v.id = o.vehicle_id
//         AND v.id = $1
//         AND o.owner_id = $2
//         AND NOT v.deleted
//         AND NOT EXISTS (
//           SELECT 1 FROM rentals r
//           WHERE r.vehicle_id = $1
//             AND r.end_time > NOW()
//         )
//       RETURNING v.id`,
//     [vehicleId, ownerId]
//   );

//   return rows[0] ?? null;
// }

// module.exports = {
//   createVehiclesTable,
//   findVehiclesByOwner,
//   getAvailableVehicles,
//   findVehicleByIdForOwner,
//   createVehicle,
//   updateVehicleById,
//   removeVehicleById,
// };

