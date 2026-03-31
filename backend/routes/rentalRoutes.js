const { Router } = require('express');
const verifyToken = require('../middlewares/verifyToken');
const { createRentalHandler, getMyRentalsHandler, returnRentalHandler, getMyVehicleRentalsHandler } = require('../controllers/rentalController');

const router = Router();

router.post('/create', verifyToken, createRentalHandler);
router.get('/my-rentals', verifyToken, getMyRentalsHandler);
router.get('/my-vehicles/rentals', verifyToken, getMyVehicleRentalsHandler);
router.patch('/:id/return', verifyToken, returnRentalHandler);

module.exports = router;


