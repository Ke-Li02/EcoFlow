const authService = require('../services/authService');

async function registerHandler(req, res) {
  const { username, password, isAdmin } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

  try {
    const user = await authService.register(username, password, isAdmin);
    res.status(201).json(user);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function loginHandler(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

  try {
    const result = await authService.login(username, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { registerHandler, loginHandler };

