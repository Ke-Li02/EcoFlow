const { Router } = require('express');
const { registerHandler, loginHandler } = require('../controllers/authController');

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);

module.exports = router;

