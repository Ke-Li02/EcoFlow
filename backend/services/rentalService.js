const { createRental, hasOverlappingRental, findRentalsByUserId, findRentalByIdForUser, returnRentalById } = require('../models/rentalModel');

function generateUnlockCode(length = 6) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    code += alphabet[randomIndex];
  }

  return code;
}

function parseDate(value, fieldName) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw { status: 400, message: `Invalid ${fieldName}` };
  }
  return parsed;
}

async function createRentalBooking(vehicleId, renterId, startDateTime, endDateTime, totalAmount) {
  if (!vehicleId || !startDateTime || !endDateTime || totalAmount === undefined) {
    throw { status: 400, message: 'A parameter is missing' };
  }

  const start = parseDate(startDateTime, 'startDateTime');
  const end = parseDate(endDateTime, 'endDateTime');
  if (end <= start) {
    throw { status: 400, message: 'End date/time must be after start date/time' };
  }

  const amount = Number(totalAmount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw { status: 400, message: 'Invalid totalAmount' };
  }

  const overlap = await hasOverlappingRental(vehicleId, start.toISOString(), end.toISOString());
  if (overlap) {
    throw { status: 409, message: 'This item is already booked for part of that time range' };
  }

  const unlockCode = generateUnlockCode(6);
  return await createRental(vehicleId, renterId, unlockCode, start.toISOString(), end.toISOString(), amount);
}

async function getMyRentals(renterId) {
  return await findRentalsByUserId(renterId);
}

async function returnRental(rentalId, renterId) {
  const normalizedRentalId = Number(rentalId);
  if (!Number.isInteger(normalizedRentalId) || normalizedRentalId <= 0) {
    throw { status: 400, message: 'Invalid rental id' };
  }

  const rental = await findRentalByIdForUser(normalizedRentalId, renterId);
  if (!rental) {
    throw { status: 404, message: 'Rental not found' };
  }

  const updated = await returnRentalById(normalizedRentalId, renterId);
  if (!updated) {
    throw { status: 500, message: 'Failed to return rental' };
  }

  return updated;
}

module.exports = { createRentalBooking, getMyRentals, returnRental };



