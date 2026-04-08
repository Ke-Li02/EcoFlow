const {
  createListingHandler,
  getMyListingsHandler,
  updateListingHandler,
  deleteListingHandler,
  getMyListingByIdHandler,
  getAvailableListingsHandler,
  executeListingCommandsHandler,
} = require('../../controllers/listingController');

const listingService = require('../../services/listingService');

jest.mock('../../services/listingService');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const baseBody = {
  name: 'Garage Spot',
  description: 'A nice spot',
  address: '123 Main St',
  hourlyRate: 10,
  region: 'Montreal',
  vehicleType: 'car',
};

const mockUser = { id: 'user-1' };
const mockFile = { path: '/uploads/photo.jpg' };

afterEach(() => jest.clearAllMocks());

describe('createListingHandler', () => {
  const validReq = () => ({ body: { ...baseBody }, file: mockFile, user: mockUser });

  describe('validation', () => {
    test.each([
      ['name',        { ...baseBody, name: undefined }],
      ['description', { ...baseBody, description: undefined }],
      ['address',     { ...baseBody, address: undefined }],
      ['hourlyRate',  { ...baseBody, hourlyRate: undefined }],
      ['region',      { ...baseBody, region: undefined }],
      ['vehicleType', { ...baseBody, vehicleType: undefined }],
    ])('returns 400 when %s is missing', async (_, body) => {
      const req = { body, file: mockFile, user: mockUser };
      const res = mockRes();

      await createListingHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'A parameter is missing' });
      expect(listingService.createListing).not.toHaveBeenCalled();
    });

    test('returns 400 when file is missing', async () => {
      const req = { body: { ...baseBody }, file: undefined, user: mockUser };
      const res = mockRes();

      await createListingHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'A parameter is missing' });
      expect(listingService.createListing).not.toHaveBeenCalled();
    });
  });

  describe('success', () => {
    test('returns 201 with the created listing', async () => {
      const listing = { id: 'l-1', ...baseBody };
      listingService.createListing.mockResolvedValue(listing);

      const req = validReq();
      const res = mockRes();

      await createListingHandler(req, res);

      expect(listingService.createListing).toHaveBeenCalledWith(
        baseBody.name,
        baseBody.description,
        true,
        baseBody.address,
        mockFile.path,
        baseBody.hourlyRate,
        mockUser.id,
        baseBody.region,
        baseBody.vehicleType,
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(listing);
    });
  });

  describe('error handling', () => {
    test('uses error status when provided', async () => {
      const error = Object.assign(new Error('Conflict'), { status: 409 });
      listingService.createListing.mockRejectedValue(error);

      const res = mockRes();
      await createListingHandler(validReq(), res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conflict' });
    });

    test('falls back to 500 when error has no status', async () => {
      listingService.createListing.mockRejectedValue(new Error('Unexpected'));

      const res = mockRes();
      await createListingHandler(validReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

describe('getMyListingsHandler', () => {
  const req = { user: mockUser };

  test('returns 200 with the user listings', async () => {
    const listings = [{ id: 'l-1' }, { id: 'l-2' }];
    listingService.findListings.mockResolvedValue(listings);

    const res = mockRes();
    await getMyListingsHandler(req, res);

    expect(listingService.findListings).toHaveBeenCalledWith(mockUser.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(listings);
  });

  test('uses error status when provided', async () => {
    const error = Object.assign(new Error('Forbidden'), { status: 403 });
    listingService.findListings.mockRejectedValue(error);

    const res = mockRes();
    await getMyListingsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
  });

  test('falls back to 500 when error has no status', async () => {
    listingService.findListings.mockRejectedValue(new Error('DB down'));

    const res = mockRes();
    await getMyListingsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('updateListingHandler', () => {
  const validReq = (overrides = {}) => ({
    params: { id: 'l-1' },
    body: { ...baseBody },
    file: mockFile,
    user: mockUser,
    ...overrides,
  });

  test('returns 200 with the updated listing', async () => {
    const updated = { id: 'l-1', ...baseBody };
    listingService.updateListing.mockResolvedValue(updated);

    const res = mockRes();
    await updateListingHandler(validReq(), res);

    expect(listingService.updateListing).toHaveBeenCalledWith('l-1', mockUser.id, {
      name: baseBody.name,
      description: baseBody.description,
      address: baseBody.address,
      photoPath: mockFile.path,
      hourlyRate: baseBody.hourlyRate,
      region: baseBody.region,
      vehicleType: baseBody.vehicleType,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('returns 404 when service returns null', async () => {
    listingService.updateListing.mockResolvedValue(null);

    const res = mockRes();
    await updateListingHandler(validReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Listing not found or access denied' });
  });

  test('passes undefined for missing body fields (partial update)', async () => {
    listingService.updateListing.mockResolvedValue({ id: 'l-1' });

    const req = { params: { id: 'l-1' }, body: {}, file: undefined, user: mockUser };
    const res = mockRes();
    await updateListingHandler(req, res);

    expect(listingService.updateListing).toHaveBeenCalledWith('l-1', mockUser.id, {
      name: undefined,
      description: undefined,
      address: undefined,
      photoPath: undefined,
      hourlyRate: undefined,
      region: undefined,
      vehicleType: undefined,
    });
  });

  test('uses error status when provided', async () => {
    const error = Object.assign(new Error('Not allowed'), { status: 403 });
    listingService.updateListing.mockRejectedValue(error);

    const res = mockRes();
    await updateListingHandler(validReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('falls back to 500 when error has no status', async () => {
    listingService.updateListing.mockRejectedValue(new Error('Unexpected'));

    const res = mockRes();
    await updateListingHandler(validReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('deleteListingHandler', () => {
  const req = { params: { id: 'l-1' }, user: mockUser };

  test('returns 200 with success message when deleted', async () => {
    listingService.removeListing.mockResolvedValue(true);

    const res = mockRes();
    await deleteListingHandler(req, res);

    expect(listingService.removeListing).toHaveBeenCalledWith('l-1', mockUser.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Listing deleted successfully' });
  });

  test('returns 404 when service returns falsy', async () => {
    listingService.removeListing.mockResolvedValue(null);

    const res = mockRes();
    await deleteListingHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Listing not found or access denied' });
  });

  test('uses error status when provided', async () => {
    const error = Object.assign(new Error('Forbidden'), { status: 403 });
    listingService.removeListing.mockRejectedValue(error);

    const res = mockRes();
    await deleteListingHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('falls back to 500 when error has no status', async () => {
    listingService.removeListing.mockRejectedValue(new Error('Unexpected'));

    const res = mockRes();
    await deleteListingHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getMyListingByIdHandler', () => {
  const req = { params: { id: 'l-1' }, user: mockUser };

  test('returns 200 with the listing', async () => {
    const listing = { id: 'l-1', ...baseBody };
    listingService.findListingById.mockResolvedValue(listing);

    const res = mockRes();
    await getMyListingByIdHandler(req, res);

    expect(listingService.findListingById).toHaveBeenCalledWith('l-1', mockUser.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(listing);
  });

  test('uses error status when provided', async () => {
    const error = Object.assign(new Error('Not found'), { status: 404 });
    listingService.findListingById.mockRejectedValue(error);

    const res = mockRes();
    await getMyListingByIdHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
  });

  test('falls back to 500 when error has no status', async () => {
    listingService.findListingById.mockRejectedValue(new Error('Unexpected'));

    const res = mockRes();
    await getMyListingByIdHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getAvailableListingsHandler', () => {
  const req = { user: mockUser };

  test('returns 200 with available listings', async () => {
    const listings = [{ id: 'l-1' }, { id: 'l-2' }];
    listingService.getAvailableListings.mockResolvedValue(listings);

    const res = mockRes();
    await getAvailableListingsHandler(req, res);

    expect(listingService.getAvailableListings).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(listings);
  });

  test('uses error status when provided', async () => {
    const error = Object.assign(new Error('Service unavailable'), { status: 503 });
    listingService.getAvailableListings.mockRejectedValue(error);

    const res = mockRes();
    await getAvailableListingsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
  });

  test('falls back to 500 when error has no status', async () => {
    listingService.getAvailableListings.mockRejectedValue(new Error('Unexpected'));

    const res = mockRes();
    await getAvailableListingsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('executeListingCommandsHandler', () => {
  describe('validation', () => {
    test('returns 400 when operations is not an array', async () => {
      const req = { body: { operations: 'not-an-array' }, user: mockUser };
      const res = mockRes();

      await executeListingCommandsHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'operations must be an array' });
      expect(listingService.executeListingCommands).not.toHaveBeenCalled();
    });

    test('returns 400 when operations is missing', async () => {
      const req = { body: {}, user: mockUser };
      const res = mockRes();

      await executeListingCommandsHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'operations must be an array' });
    });
  });

  describe('success', () => {
    test('returns 200 with processed count and results', async () => {
      const operations = [{ type: 'create' }, { type: 'delete' }];
      const results = [{ ok: true }, { ok: true }];
      listingService.executeListingCommands.mockResolvedValue(results);

      const req = { body: { operations }, user: mockUser };
      const res = mockRes();

      await executeListingCommandsHandler(req, res);

      expect(listingService.executeListingCommands).toHaveBeenCalledWith(operations, mockUser.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ processed: 2, results });
    });

    test('handles an empty operations array', async () => {
      listingService.executeListingCommands.mockResolvedValue([]);

      const req = { body: { operations: [] }, user: mockUser };
      const res = mockRes();

      await executeListingCommandsHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ processed: 0, results: [] });
    });
  });

  describe('error handling', () => {
    test('uses error status when provided', async () => {
      const error = Object.assign(new Error('Bad operation'), { status: 422 });
      listingService.executeListingCommands.mockRejectedValue(error);

      const req = { body: { operations: [] }, user: mockUser };
      const res = mockRes();

      await executeListingCommandsHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: 'Bad operation' });
    });

    test('falls back to 500 and default message when error has neither', async () => {
      const error = new Error();
      listingService.executeListingCommands.mockRejectedValue(error);

      const req = { body: { operations: [] }, user: mockUser };
      const res = mockRes();

      await executeListingCommandsHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to execute listing commands' });
    });
  });
});