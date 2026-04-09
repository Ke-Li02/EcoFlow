import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import * as authStore from '../../src/store/authStore';

const { mockInstance, interceptorContext } = vi.hoisted(() => {
  const context = { callback: null as any };
  const requestUseSpy = vi.fn((fn) => {
    context.callback = fn;
  });

  return {
    interceptorContext: context,
    mockInstance: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: requestUseSpy, eject: vi.fn() },
      },
    },
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockInstance),
  },
}));
vi.mock('../store/authStore');

import * as listingService from '../../src/services/listingService';

describe('listingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Request Interceptor', () => {
    it('should inject Bearer token if it exists', () => {
      vi.spyOn(authStore, 'getToken').mockReturnValue('valid-token');
      const config = { headers: {} } as any;
      
      const result = interceptorContext.callback(config);
      
      expect(result.headers.Authorization).toBe('Bearer valid-token');
    });

    it('should not inject Authorization header if token is missing', () => {
      vi.spyOn(authStore, 'getToken').mockReturnValue(null);
      const config = { headers: {} } as any;
      
      const result = interceptorContext.callback(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('GET operations', () => {
    it('getAvailableVehicles calls correct endpoint', async () => {
      vi.spyOn(mockInstance, 'get').mockResolvedValue({ data: [{ id: 1 }] });
      const res = await listingService.getAvailableVehicles();
      expect(mockInstance.get).toHaveBeenCalledWith('/available');
      expect(res).toEqual([{ id: 1 }]);
    });

    it('getMyVehicles calls correct endpoint', async () => {
      vi.spyOn(mockInstance, 'get').mockResolvedValue({ data: [] });
      await listingService.getMyVehicles();
      expect(mockInstance.get).toHaveBeenCalledWith('/my-listings');
    });

    it('getMyVehicleById calls correct endpoint with ID', async () => {
      vi.spyOn(mockInstance, 'get').mockResolvedValue({ data: { id: 5 } });
      await listingService.getMyVehicleById(5);
      expect(mockInstance.get).toHaveBeenCalledWith('/5');
    });
  });

  describe('Write operations (FormData)', () => {
    it('createVehicle should append all fields to FormData', async () => {
      vi.spyOn(mockInstance, 'post').mockResolvedValue({ data: { success: true } });
      const payload = {
        name: 'Car',
        description: 'Desc',
        address: 'Addr',
        hourlyRate: 50,
        photo: new File([], 'car.png'),
        vehicleType: 'SUV',
        region: 'North'
      } as any;

      await listingService.createVehicle(payload);

      const [url, formData] = vi.mocked(mockInstance.post).mock.calls[0];
      expect(url).toBe('/create');
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get('name')).toBe('Car');
      expect(formData.get('hourlyRate')).toBe('50');
    });

    it('updateVehicle should only append provided fields', async () => {
      vi.spyOn(mockInstance, 'patch').mockResolvedValue({ data: {} });
      
      const partialUpdate = { name: 'New Name', hourlyRate: 100 } as any;
      await listingService.updateVehicle(10, partialUpdate);

      const [url, formData] = vi.mocked(mockInstance.patch).mock.calls[0];
      expect(url).toBe('/10');
      expect(formData.get('name')).toBe('New Name');
      expect(formData.get('hourlyRate')).toBe('100');
      expect(formData.has('description')).toBe(false);
    });
  });

  describe('remove and batch', () => {
    it('removeVehicle should call DELETE', async () => {
      vi.spyOn(mockInstance, 'delete').mockResolvedValue({ data: { id: 1 } });
      await listingService.removeVehicle(1);
      expect(mockInstance.delete).toHaveBeenCalledWith('/1');
    });

    it('executeListingCommands should send operations in body', async () => {
      vi.spyOn(mockInstance, 'post').mockResolvedValue({ data: { results: [] } });
      const ops = [{ type: 'CREATE', data: {} }] as any;
      
      await listingService.executeListingCommands(ops);
      
      expect(mockInstance.post).toHaveBeenCalledWith('/batch', { operations: ops });
    });
  });
});