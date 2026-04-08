// tests/adminDashboardHandler.test.js
const { getAdminDashboardHandler } = require('../../controllers/adminDashboardController');
const { getLogRequestVolume, getStatusCodeBreakdown, getTopEndpoints } = require('../../models/requestLogsModel');

// Mock the model
jest.mock('../../models/requestLogsModel');

describe('getAdminDashboardHandler', () => {
  let req, res;

  // Mock request and response objects
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('should return 200 with all dashboard data', async () => {
      const mockRequestVolume = [{ date: '2024-01-01', count: 120 }];
      const mockStatusBreakdown = [{ status: 200, count: 100 }, { status: 500, count: 20 }];
      const mockTopEndpoints = [{ endpoint: '/api/users', count: 80 }];

      getLogRequestVolume.mockResolvedValue(mockRequestVolume);
      getStatusCodeBreakdown.mockResolvedValue(mockStatusBreakdown);
      getTopEndpoints.mockResolvedValue(mockTopEndpoints);

      await getAdminDashboardHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        requestVolume: mockRequestVolume,
        statusBreakdown: mockStatusBreakdown,
        topEndpoints: mockTopEndpoints,
      });
    });

    it('should call all three model functions', async () => {
      getLogRequestVolume.mockResolvedValue([]);
      getStatusCodeBreakdown.mockResolvedValue([]);
      getTopEndpoints.mockResolvedValue([]);

      await getAdminDashboardHandler(req, res);

      expect(getLogRequestVolume).toHaveBeenCalledTimes(1);
      expect(getStatusCodeBreakdown).toHaveBeenCalledTimes(1);
      expect(getTopEndpoints).toHaveBeenCalledTimes(1);
    });

    it('should handle empty data from all models', async () => {
      getLogRequestVolume.mockResolvedValue([]);
      getStatusCodeBreakdown.mockResolvedValue([]);
      getTopEndpoints.mockResolvedValue([]);

      await getAdminDashboardHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        requestVolume: [],
        statusBreakdown: [],
        topEndpoints: [],
      });
    });
  });

  describe('error handling', () => {
    it('should return 500 when a model throws a generic error', async () => {
      getLogRequestVolume.mockRejectedValue(new Error('Database connection failed'));
      getStatusCodeBreakdown.mockResolvedValue([]);
      getTopEndpoints.mockResolvedValue([]);

      await getAdminDashboardHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
    });

    it('should use err.status if present on the thrown error', async () => {
      const customError = { status: 403, message: 'Forbidden' };
      getLogRequestVolume.mockRejectedValue(customError);
      getStatusCodeBreakdown.mockResolvedValue([]);
      getTopEndpoints.mockResolvedValue([]);

      await getAdminDashboardHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('should return 500 when getStatusCodeBreakdown fails', async () => {
      getLogRequestVolume.mockResolvedValue([]);
      getStatusCodeBreakdown.mockRejectedValue(new Error('Query timeout'));
      getTopEndpoints.mockResolvedValue([]);

      await getAdminDashboardHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Query timeout' });
    });

    it('should return 500 when getTopEndpoints fails', async () => {
      getLogRequestVolume.mockResolvedValue([]);
      getStatusCodeBreakdown.mockResolvedValue([]);
      getTopEndpoints.mockRejectedValue(new Error('Service unavailable'));

      await getAdminDashboardHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Service unavailable' });
    });
  });
});