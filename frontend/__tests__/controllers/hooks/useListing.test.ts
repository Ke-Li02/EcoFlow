import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useListing } from '../../../src/controllers/hooks/useListing';
import * as listingService from '../../../src/services/listingService';

vi.mock('../../../src/services/listingService');

describe('useListing hook', () => {
  const mockVehicles = [
    { id: 1, make: 'Tesla', model: 'Model 3', price: 40000 },
    { id: 2, make: 'Ford', model: 'F-150', price: 55000 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAvailableListings', () => {
    it('should fetch listings and update the state', async () => {
      vi.spyOn(listingService, 'getAvailableVehicles').mockResolvedValue(mockVehicles as any);

      const { result } = renderHook(() => useListing());

      await act(async () => {
        await result.current.fetchAvailableListings();
      });

      expect(result.current.listings).toEqual(mockVehicles);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when fetching fails', async () => {
      const errorMessage = 'Server error';
      vi.spyOn(listingService, 'getAvailableVehicles').mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      const { result } = renderHook(() => useListing());

      await act(async () => {
        await result.current.fetchAvailableListings();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.listings).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('createListing', () => {
    const newListing = { make: 'Rivian', model: 'R1T', price: 70000 } as any;

    it('should return true on successful creation', async () => {
      vi.spyOn(listingService, 'createVehicle').mockResolvedValue({} as any);

      const { result } = renderHook(() => useListing());
      let success: boolean = false;

      await act(async () => {
        success = await result.current.createListing(newListing);
      });

      expect(success).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should return false and set error on failure', async () => {
      vi.spyOn(listingService, 'createVehicle').mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useListing());
      let success: boolean = true;

      await act(async () => {
        success = await result.current.createListing(newListing);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Failed to create listing');
    });
  });

  describe('deleteListing', () => {
    it('should call removeVehicle and return true', async () => {
      const spy = vi.spyOn(listingService, 'removeVehicle').mockResolvedValue({} as any);

      const { result } = renderHook(() => useListing());
      let success: boolean = false;

      await act(async () => {
        success = await result.current.deleteListing(123);
      });

      expect(spy).toHaveBeenCalledWith(123);
      expect(success).toBe(true);
    });
  });

  describe('executeBatchCommands', () => {
    it('should return the batch response on success', async () => {
      const mockBatchResponse = { successCount: 2, errors: [] };
      vi.spyOn(listingService, 'executeListingCommands').mockResolvedValue(mockBatchResponse as any);

      const { result } = renderHook(() => useListing());
      let response;

      await act(async () => {
        response = await result.current.executeBatchCommands([]);
      });

      expect(response).toEqual(mockBatchResponse);
      expect(result.current.loading).toBe(false);
    });

    it('should return null on batch failure', async () => {
      vi.spyOn(listingService, 'executeListingCommands').mockRejectedValue(new Error('Batch failed'));

      const { result } = renderHook(() => useListing());
      let response;

      await act(async () => {
        response = await result.current.executeBatchCommands([]);
      });

      expect(response).toBeNull();
      expect(result.current.error).toBe('Failed to execute listing commands');
    });
  });

    describe('fetchMyListings', () => {
    it('should successfully fetch my listings', async () => {
      const mockData = [{ id: 1, make: 'Ford' }];
      vi.spyOn(listingService, 'getMyVehicles').mockResolvedValue(mockData as any);
      
      const { result } = renderHook(() => useListing());
      await act(async () => {
        await result.current.fetchMyListings();
      });

      expect(result.current.myListings).toEqual(mockData);
    });

    it('should handle fetchMyListings error', async () => {
      vi.spyOn(listingService, 'getMyVehicles').mockRejectedValue({
        response: { data: { message: 'Custom Error' } }
      });
      
      const { result } = renderHook(() => useListing());
      await act(async () => {
        await result.current.fetchMyListings();
      });

      expect(result.current.error).toBe('Custom Error');
    });
  });

  it('should return true on successful update', async () => {
    vi.spyOn(listingService, 'updateVehicle').mockResolvedValue({} as any);
    const { result } = renderHook(() => useListing());

    let success;
    await act(async () => {
      success = await result.current.updateListing(1, { price: 500 } as any);
    });

    expect(success).toBe(true);
  });

  describe('fetchListingById', () => {
    it('should return vehicle data on success', async () => {
      const mockVehicle = { id: 99, make: 'BMW' };
      vi.spyOn(listingService, 'getMyVehicleById').mockResolvedValue(mockVehicle as any);
      
      const { result } = renderHook(() => useListing());
      let data;
      await act(async () => {
        data = await result.current.fetchListingById(99);
      });

      expect(data).toEqual(mockVehicle);
    });

    it('should handle errors in fetchListingById', async () => {
      vi.spyOn(listingService, 'getMyVehicleById').mockRejectedValue({});

      const { result } = renderHook(() => useListing());
      await act(async () => {
        await result.current.fetchListingById(99);
      });

      expect(result.current.error).toBe('Failed to fetch your listings');
    });
  });
});