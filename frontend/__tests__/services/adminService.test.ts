import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import * as authStore from '../../src/store/authStore';

const { mockInstance, interceptorContext } = vi.hoisted(() => {
  const context = { callback: null as any };
  
  const mockRequestUse = vi.fn((fn) => {
    context.callback = fn;
  });

  return {
    interceptorContext: context,
    mockInstance: {
      get: vi.fn(),
      interceptors: {
        request: { use: mockRequestUse, eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    },
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockInstance),
  },
}));

import { getAdminDashboard } from '../../src/services/adminService';

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', () => {

      const interceptorCallback = interceptorContext.callback;
      
      vi.spyOn(authStore, 'getToken').mockReturnValue('super-secret-token');

      const config = { headers: {} } as any;
      const resultConfig = interceptorCallback(config);

      expect(resultConfig.headers.Authorization).toBe('Bearer super-secret-token');
    });

    it('should NOT add Authorization header when token is missing', () => {
      const interceptorCallback = interceptorContext.callback;
      
      vi.spyOn(authStore, 'getToken').mockReturnValue(null);

      const config = { headers: {} } as any;
      const resultConfig = interceptorCallback(config);

      expect(resultConfig.headers.Authorization).toBeUndefined();
    });
  });

  describe('getAdminDashboard', () => {
    it('should fetch data using the instance', async () => {
      const mockData = { requestVolume: [] };
      vi.spyOn(mockInstance, 'get').mockResolvedValueOnce({ data: mockData });

      const result = await getAdminDashboard();
      expect(result).toEqual(mockData);
      expect(mockInstance.get).toHaveBeenCalledWith('/dashboard');
    });
  });
});