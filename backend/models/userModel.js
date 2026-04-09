//new code to fix db problems
const db = require('../services/db');

async function createUsersTable() {
  await db.getPool().query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function findUserByUsername(username) {
  const { rows } = await db.getPool().query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0];
}

async function createUser(username, hashedPassword, isAdmin) {
  const { rows } = await db.getPool().query(
    'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3) RETURNING id, username, is_admin, created_at',
    [username, hashedPassword, isAdmin]
  );
  return rows[0];
}

module.exports = { createUsersTable, findUserByUsername, createUser };



// const db = require('../services/db'); //const pool became const db

// async function createUsersTable() {

//   await db.getPool().query(`
//   CREATE TABLE IF NOT EXISTS users (
//   id SERIAL PRIMARY KEY,
//   username TEXT UNIQUE NOT NULL,
//   password TEXT NOT NULL,
//   is_admin BOOLEAN DEFAULT FALSE,
//   created_at TIMESTAMPTZ DEFAULT NOW()
//   )`);

//   //commented to fix the db auth error
//   // await pool.query(`
//   //   CREATE TABLE IF NOT EXISTS users (
//   //     id SERIAL PRIMARY KEY,
//   //     username TEXT UNIQUE NOT NULL,
//   //     password TEXT NOT NULL,
//   //     is_admin BOOLEAN DEFAULT FALSE,
//   //     created_at TIMESTAMPTZ DEFAULT NOW()
//   //   )
//   // `);
// }

// async function findUserByUsername(username) {
//   //const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//   const {row} = await db.getPool().query('SELECT * FROM users WHERE username = $1', [username]);
//   return rows[0];
// }

// async function createUser(username, hashedPassword, isAdmin) {
//   /**const { rows } = await pool.query(
//     'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3) RETURNING id, username, is_admin, created_at',
//     [username, hashedPassword, isAdmin]
//   ); */
//   const { rows } = await db.getPool().query(
//     'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3) RETURNING id, username, is_admin, created_at',
//     [username, hashedPassword, isAdmin]
//   );
//   return rows[0];
// }

// module.exports = { createUsersTable, findUserByUsername, createUser };

