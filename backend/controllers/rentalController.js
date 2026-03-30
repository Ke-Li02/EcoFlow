const rentalService = require('../services/rentalService');

async function createRentalHandler(req, res) {
  const { vehicleId, startDateTime, endDateTime, totalAmount } = req.body;

  try {
    const rental = await rentalService.createRentalBooking(vehicleId, req.user.id, startDateTime, endDateTime, totalAmount);
    res.status(201).json(rental);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Failed to create rental' });
  }
}

async function getMyRentalsHandler(req, res) {
  try {
    const rentals = await rentalService.getMyRentals(req.user.id);
    res.status(200).json(rentals);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Failed to fetch rentals' });
  }
}

async function getMyVehicleRentalsHandler(req, res) {
  try {
    const rentals = await rentalService.getMyVehicleRentals(req.user.id);
    res.status(200).json(rentals);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Failed to fetch rentals' });
  }
}

async function returnRentalHandler(req, res) {
  const { id } = req.params;

  try {
    const rental = await rentalService.returnRental(id, req.user.id);
    res.status(200).json(rental);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Failed to return rental' });
  }
}

module.exports = { createRentalHandler, getMyRentalsHandler, returnRentalHandler, getMyVehicleRentalsHandler };


