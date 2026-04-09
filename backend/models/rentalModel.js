const pool = require('../services/db');

const RENTAL_SELECT = `
  r.id,
  r.vehicle_id AS "listingId",
  r.unlock_code AS "unlockCode",
  v.name AS "listingName",
  v.photo_path AS "listingPhotoPath",
  v.vehicle_type AS "vehicleType",
  v.region,
  v.hourly_rate::FLOAT AS "hourlyRate",
  r.start_time AS "startDateTime",
  r.end_time AS "endDateTime",
  r.returned_at AS "returnedAt",
  r.total_amount::FLOAT AS "totalAmount",
  r.created_at AS "createdAt"
`;

async function createRentalsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rentals (
      id SERIAL PRIMARY KEY,
      vehicle_id INT NOT NULL REFERENCES vehicles(id),
      renter_id INT NOT NULL REFERENCES users(id),
      unlock_code VARCHAR(6) NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      returned_at TIMESTAMPTZ,
      total_amount DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CHECK (end_time > start_time),
      CHECK (total_amount >= 0)
    )
  `);

  // Keep existing environments compatible when rentals table already exists.
  await pool.query('ALTER TABLE rentals ADD COLUMN IF NOT EXISTS unlock_code VARCHAR(6)');
  await pool.query('ALTER TABLE rentals ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ');
}

async function createRental(vehicleId, renterId, unlockCode, startDateTime, endDateTime, totalAmount, executor = pool) {
  const { rows } = await executor.query(
    `INSERT INTO rentals (vehicle_id, renter_id, unlock_code, start_time, end_time, total_amount)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [vehicleId, renterId, unlockCode, startDateTime, endDateTime, totalAmount]
  );

  return rows[0];
}

async function hasOverlappingRental(vehicleId, startDateTime, endDateTime, executor = pool) {
  const { rows } = await executor.query(
    `SELECT 1
     FROM rentals
     WHERE vehicle_id = $1
       AND start_time < $3
       AND end_time > $2
     LIMIT 1`,
    [vehicleId, startDateTime, endDateTime]
  );

  return rows.length > 0;
}

async function findRentalsByUserId(userId, executor = pool) {
  const { rows } = await executor.query(
    `SELECT ${RENTAL_SELECT}
     FROM rentals r
     JOIN vehicles v ON v.id = r.vehicle_id
     WHERE r.renter_id = $1
     ORDER BY r.start_time DESC`,
    [userId]
  );

  return rows;
}

async function findRentalByIdForUser(rentalId, userId, executor = pool) {
  const { rows } = await executor.query(
    `SELECT id, renter_id AS "renterId", start_time AS "startDateTime", end_time AS "endDateTime", returned_at AS "returnedAt"
     FROM rentals
     WHERE id = $1 AND renter_id = $2`,
    [rentalId, userId]
  );

  return rows[0] ?? null;
}

async function returnRentalById(rentalId, userId, executor = pool) {
  const { rows } = await executor.query(
    `UPDATE rentals r
     SET returned_at = COALESCE(r.returned_at, NOW()),
         end_time = CASE WHEN r.end_time > NOW() THEN NOW() ELSE r.end_time END
     FROM vehicles v
     WHERE r.id = $1
       AND r.renter_id = $2
       AND v.id = r.vehicle_id
     RETURNING ${RENTAL_SELECT}`,
    [rentalId, userId]
  );

  return rows[0] ?? null;
}

async function findRentalsByVehicleOwnerId(userId, executor = pool) {
  const { rows } = await executor.query(
    `SELECT ${RENTAL_SELECT}
     FROM rentals r
     JOIN vehicles v ON v.id = r.vehicle_id
     JOIN ownerships o ON o.vehicle_id = v.id
     WHERE o.owner_id = $1
     ORDER BY r.start_time DESC`,
    [userId]
  );

  return rows;
}

module.exports = { createRentalsTable, createRental, hasOverlappingRental, findRentalsByUserId, findRentalByIdForUser, returnRentalById, findRentalsByVehicleOwnerId };



