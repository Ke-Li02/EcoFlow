const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByUsername, createUser } = require('../models/userModel');

async function register(username, password, isAdmin) {
  const existing = await findUserByUsername(username);
  if (existing) throw { status: 409, message: 'Username already taken' };

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser(username, hashed, isAdmin ?? false);
  return user;
}

async function login(username, password) {
  const user = await findUserByUsername(username);
  if (!user) throw { status: 401, message: 'Invalid credentials' };

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 401, message: 'Invalid credentials' };

  const token = jwt.sign(
    { id: user.id, username: user.username, isAdmin: user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return { token };
}

module.exports = { register, login };

