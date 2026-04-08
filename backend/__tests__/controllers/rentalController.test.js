const {
  createRentalHandler,
  getMyRentalsHandler,
  getMyVehicleRentalsHandler,
  returnRentalHandler,
} = require('../../controllers/rentalController');

const rentalService = require('../../services/rentalService');

jest.mock('../../services/rentalService');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockUser = { id: 'user-1' };

afterEach(() => jest.clearAllMocks());

describe('createRentalHandler', () => {
  const validReq = () => ({
    body: { vehicleId: 'v-1', startDateTime: '2026-05-01T09:00', endDateTime: '2026-05-01T12:00', totalAmount: 30 },
    user: mockUser,
  });

  test('returns 201 with the created rental', async () => {
    const rental = { id: 'r-1', vehicleId: 'v-1' };
    rentalService.createRentalBooking.mockResolvedValue(rental);

    const res = mockRes();
    await createRentalHandler(validReq(), res);

    expect(rentalService.createRentalBooking).toHaveBeenCalledWith('v-1', mockUser.id, '2026-05-01T09:00', '2026-05-01T12:00', 30);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(rental);
  });

  test('uses error status when provided', async () => {
    const error = Object.assign(new Error('Conflict'), { status: 409 });
    rentalService.createRentalBooking.mockRejectedValue(error);

    const res = mockRes();
    await createRentalHandler(validReq(), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Conflict' });
  });

  test('falls back to 500 and default message when error has neither', async () => {
    rentalService.createRentalBooking.mockRejectedValue(new Error());

    const res = mockRes();
    await createRentalHandler(validReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create rental' });
  });
});

describe('getMyRentalsHandler', () => {
  const req = { user: mockUser };

  test('returns 200 with the user rentals', async () => {
    const rentals = [{ id: 'r-1' }, { id: 'r-2' }];
    rentalService.getMyRentals.mockResolvedValue(rentals);

    const res = mockRes();
    await getMyRentalsHandler(req, res);

    expect(rentalService.getMyRentals).toHaveBeenCalledWith(mockUser.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rentals);
  });

  test('uses error status when provided', async () => {
    const error = Object.assign(new Error('Forbidden'), { status: 403 });
    rentalService.getMyRentals.mockRejectedValue(error);

    const res = mockRes();
    await getMyRentalsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
  });

  test('falls back to 500 and default message when error has neither', async () => {
    rentalService.getMyRentals.mockRejectedValue(new Error());

    const res = mockRes();
    await getMyRentalsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch rentals' });
  });
});

describe('getMyVehicleRentalsHandler', () => {
  const req = { user: mockUser };

  test('returns 200 with the vehicle rentals', async () => {
    const rentals = [{ id: 'r-3' }];
    rentalService.getMyVehicleRentals.mockResolvedValue(rentals);

    const res = mockRes();
    await getMyVehicleRentalsHandler(req, res);

    expect(rentalService.getMyVehicleRentals).toHaveBeenCalledWith(mockUser.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rentals);
  });

  test('uses error status when provided', async () => {
    const error = Object.assign(new Error('Forbidden'), { status: 403 });
    rentalService.getMyVehicleRentals.mockRejectedValue(error);

    const res = mockRes();
    await getMyVehicleRentalsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
  });

  test('falls back to 500 and default message when error has neither', async () => {
    rentalService.getMyVehicleRentals.mockRejectedValue(new Error());

    const res = mockRes();
    await getMyVehicleRentalsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch rentals' });
  });
});

describe('returnRentalHandler', () => {
  const req = { params: { id: 'r-1' }, user: mockUser };

  test('returns 200 with the updated rental', async () => {
    const rental = { id: 'r-1', status: 'returned' };
    rentalService.returnRental.mockResolvedValue(rental);

    const res = mockRes();
    await returnRentalHandler(req, res);

    expect(rentalService.returnRental).toHaveBeenCalledWith('r-1', mockUser.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rental);
  });

  test('uses error status when provided', async () => {
    const error = Object.assign(new Error('Not found'), { status: 404 });
    rentalService.returnRental.mockRejectedValue(error);

    const res = mockRes();
    await returnRentalHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
  });

  test('falls back to 500 and default message when error has neither', async () => {
    rentalService.returnRental.mockRejectedValue(new Error());

    const res = mockRes();
    await returnRentalHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to return rental' });
  });
});