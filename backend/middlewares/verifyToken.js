const { decodeToken } = require('../services/authService')

// middleware for authentication
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
  try {
    const decoded = decodeToken(token);
    req.user = decoded; // attach user to request for later use
    next(); // continue to next middleware
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = verifyToken;