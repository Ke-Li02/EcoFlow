
//all pool instances become db
const db = require('../services/db');
//const pool = require('../services/db');

async function createOwnershipsTable() {
  /** 
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ownerships (
      id SERIAL PRIMARY KEY,
      vehicle_id INT NOT NULL REFERENCES vehicles(id),
      owner_id INT NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  */
 await db.getPool().query(`
    CREATE TABLE IF NOT EXISTS ownerships (
      id SERIAL PRIMARY KEY,
      vehicle_id INT NOT NULL REFERENCES vehicles(id),
      owner_id INT NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function createOwnership(vehicle, owner, executor = pool) {
  const pool = executor || db.getPool(); //added this line as well
  const { rows } = await pool.query(
    'INSERT INTO ownerships (vehicle_id, owner_id) VALUES ($1, $2) RETURNING id',
    [vehicle, owner]
  );
  /*const { rows } = await executor.query(
    'INSERT INTO ownerships (vehicle_id, owner_id) VALUES ($1, $2) RETURNING id',
    [vehicle, owner]
  );
  */
  return rows[0];
}

module.exports = { createOwnershipsTable, createOwnership };

