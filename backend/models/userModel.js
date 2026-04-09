const pool = require('../services/db');

async function createUsersTable() {
  await pool.query(`
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
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0];
}

async function createUser(username, hashedPassword, isAdmin) {
  const { rows } = await pool.query(
    'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3) RETURNING id, username, is_admin, created_at',
    [username, hashedPassword, isAdmin]
  );
  return rows[0];
}

module.exports = { createUsersTable, findUserByUsername, createUser };

