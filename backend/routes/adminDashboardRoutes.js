const { Router } = require('express');
const { getAdminDashboardHandler } = require('../controllers/adminDashboardController');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');

const router = Router();

router.get('/dashboard', verifyToken, verifyAdmin, getAdminDashboardHandler);

module.exports = router;