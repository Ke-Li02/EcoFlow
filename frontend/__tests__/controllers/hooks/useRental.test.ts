import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRental } from '../../../src/controllers/hooks/useRental';
import * as rentalService from '../../../src/services/rentalService';

vi.mock('../../../src/services/rentalService');

describe('useRental hook', () => {
  const mockRentals = [
    { id: 1, vehicleId: 101, totalAmount: 150, startDateTime: '2024-01-01', endDateTime: '2024-01-02' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchMyRentals', () => {
    it('should successfully fetch rentals and update state', async () => {
      vi.spyOn(rentalService, 'getMyRentals').mockResolvedValue(mockRentals as any);

      const { result } = renderHook(() => useRental());

      await act(async () => {
        await result.current.fetchMyRentals();
      });

      expect(result.current.rentals).toEqual(mockRentals);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors and set the error message', async () => {
      vi.spyOn(rentalService, 'getMyRentals').mockRejectedValue({
        response: { data: { message: 'Server unavailable' } }
      });

      const { result } = renderHook(() => useRental());

      await act(async () => {
        await result.current.fetchMyRentals();
      });

      expect(result.current.error).toBe('Server unavailable');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('fetchMyVehicleRentals', () => {
    it('should successfully fetch vehicle rentals', async () => {
      vi.spyOn(rentalService, 'getMyVehicleRentals').mockResolvedValue(mockRentals as any);

      const { result } = renderHook(() => useRental());

      await act(async () => {
        await result.current.fetchMyVehicleRentals();
      });

      expect(result.current.vehicleRentals).toEqual(mockRentals);
    });

    it('should use default error message on failure without response data', async () => {
      vi.spyOn(rentalService, 'getMyVehicleRentals').mockRejectedValue(new Error('Network fail'));

      const { result } = renderHook(() => useRental());

      await act(async () => {
        await result.current.fetchMyVehicleRentals();
      });

      expect(result.current.error).toBe('Failed to load rentals');
    });
  });

  describe('createMyRental', () => {
    const mockListing = { id: 101 } as any;

    it('should return { ok: true } on success', async () => {
      vi.spyOn(rentalService, 'createRental').mockResolvedValue({} as any);

      const { result } = renderHook(() => useRental());
      let response;

      await act(async () => {
        response = await result.current.createMyRental(mockListing, 'start', 'end', 100);
      });

      expect(response).toEqual({ ok: true });
      expect(result.current.error).toBeNull();
    });

    it('should return { ok: false } and error message on failure', async () => {
      vi.spyOn(rentalService, 'createRental').mockRejectedValue({
        response: { data: { message: 'Vehicle already booked' } }
      });

      const { result } = renderHook(() => useRental());
      let response;

      await act(async () => {
        response = await result.current.createMyRental(mockListing, 'start', 'end', 100);
      });

      expect(response).toEqual({ ok: false, error: 'Vehicle already booked' });
      expect(result.current.error).toBe('Vehicle already booked');
    });
  });

  describe('returnMyRental', () => {
    it('should update the rentals list when a rental is returned', async () => {
      const initialRentals = [
        { id: 1, returned: false },
        { id: 2, returned: false }
      ];
      const updatedRecord = { id: 1, returned: true };

      vi.spyOn(rentalService, 'getMyRentals').mockResolvedValue(initialRentals as any);
      vi.spyOn(rentalService, 'returnRental').mockResolvedValue(updatedRecord as any);

      const { result } = renderHook(() => useRental());

      await act(async () => { await result.current.fetchMyRentals(); });

      let response;
      await act(async () => {
        response = await result.current.returnMyRental(1);
      });

      expect(response).toEqual({ ok: true });
      expect(result.current.rentals).toEqual([updatedRecord, initialRentals[1]]);
    });

    it('should handle errors during return and use default fallback message', async () => {
      vi.spyOn(rentalService, 'returnRental').mockRejectedValue(new Error('Generic Error'));

      const { result } = renderHook(() => useRental());
      let response;

      await act(async () => {
        response = await result.current.returnMyRental(1);
      });

      expect(response!.ok).toBe(false);
      expect(response!.error).toBe('Failed to return rental');
      expect(result.current.error).toBe('Failed to return rental');
    });
  });
});