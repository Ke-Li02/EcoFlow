import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import * as authStore from '../../src/store/authStore';

const { mockInstance, interceptorContext } = vi.hoisted(() => {
  const context = { callback: null as any };
  const requestUseSpy = vi.fn((fn) => { context.callback = fn; });

  return {
    interceptorContext: context,
    mockInstance: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      interceptors: { request: { use: requestUseSpy } },
    },
  };
});

vi.mock('axios', () => ({ default: { create: vi.fn(() => mockInstance) } }));
vi.mock('../store/authStore');

import * as rentalService from '../../src/services/rentalService';

describe('rentalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('API Requests', () => {
    it('should inject token in interceptor', () => {
      vi.spyOn(authStore, 'getToken').mockReturnValue('token-123');
      const config = { headers: {} } as any;
      interceptorContext.callback(config);
      expect(config.headers.Authorization).toBe('Bearer token-123');
    });

    it('createRental calls post', async () => {
      vi.spyOn(mockInstance, 'post').mockResolvedValue({ data: { id: 1 } });
      const res = await rentalService.createRental({} as any);
      expect(res.id).toBe(1);
      expect(mockInstance.post).toHaveBeenCalledWith('/create', {});
    });

    it('returnRental calls patch', async () => {
      vi.spyOn(mockInstance, 'patch').mockResolvedValue({ data: { id: 99 } });
      await rentalService.returnRental(99);
      expect(mockInstance.patch).toHaveBeenCalledWith('/99/return');
    });
  });

  describe('getRentalPeriodStatus Logic', () => {
    const now = new Date('2024-05-15T12:00:00Z');
    
    beforeEach(() => {
      vi.setSystemTime(now);
    });

    it('should return Past if returnedAt exists', () => {
      const status = rentalService.getRentalPeriodStatus({ returnedAt: 'any' } as any);
      expect(status).toBe('Past');
    });

    it('should return Future if start date is invalid', () => {
      const status = rentalService.getRentalPeriodStatus({ startDateTime: 'invalid' } as any);
      expect(status).toBe('Future');
    });

    it('should return Future if now < start', () => {
      const status = rentalService.getRentalPeriodStatus({
        startDateTime: '2024-06-01',
        endDateTime: '2024-06-10'
      } as any);
      expect(status).toBe('Future');
    });

    it('should return Past if now > end', () => {
      const status = rentalService.getRentalPeriodStatus({
        startDateTime: '2024-01-01',
        endDateTime: '2024-01-10'
      } as any);
      expect(status).toBe('Past');
    });

    it('should return Current if now is between start and end', () => {
      const status = rentalService.getRentalPeriodStatus({
        startDateTime: '2024-05-01',
        endDateTime: '2024-05-30'
      } as any);
      expect(status).toBe('Current');
    });
  });

  describe('groupRentalsByPeriod', () => {
    it('should group and sort rentals correctly', () => {
      vi.setSystemTime(new Date('2024-05-15'));

      const rentals = [
        { id: 1, startDateTime: '2024-06-10', endDateTime: '2024-06-15' },
        { id: 2, startDateTime: '2024-06-01', endDateTime: '2024-06-05' },
        { id: 3, startDateTime: '2024-01-01', endDateTime: '2024-01-05' },
        { id: 4, startDateTime: '2024-05-10', endDateTime: '2024-05-20' },
      ] as any[];

      const result = rentalService.groupRentalsByPeriod(rentals);

      expect(result.future).toHaveLength(2);
      expect(result.future[0].id).toBe(2);
      expect(result.current).toHaveLength(1);
      expect(result.past).toHaveLength(1);
    });
  });
});