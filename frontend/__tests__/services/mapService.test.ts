import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as mapService from '../../src/services/mapService';
import * as adapters from '../../src/adapters/mapApiAdapter';

vi.mock('../adapters/mapApiAdapter');

describe('mapService', () => {
  const mockFetchResponse = (data: any, ok = true, status = 200) => {
    return Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(data),
    } as Response);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('searchSuggestions', () => {
    it('should return empty array if text is less than 3 characters', async () => {
      const result = await mapService.searchSuggestions('ab', 'key');
      expect(result).toEqual([]);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('should fetch and adapt suggestions if text is long enough', async () => {
      const mockData = { features: [] };
      const adaptedData = [{ label: 'Montreal' }];
      
      vi.mocked(globalThis.fetch).mockReturnValue(mockFetchResponse(mockData));
      vi.spyOn(adapters, 'adaptOrsGeocode').mockReturnValue(adaptedData as any);

      const result = await mapService.searchSuggestions('Montreal', 'key');

      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('text=Montreal'));
      expect(result).toEqual(adaptedData);
    });

    it('should throw error if response is not ok', async () => {
      vi.mocked(globalThis.fetch).mockReturnValue(mockFetchResponse({}, false, 401));
      
      await expect(mapService.searchSuggestions('Montreal', 'key'))
        .rejects.toThrow('Geocoding request failed (401)');
    });
  });

  describe('getChargingStations', () => {
    it('should perform a POST request to Overpass API', async () => {
      vi.mocked(globalThis.fetch).mockReturnValue(mockFetchResponse({ elements: [] }));
      vi.spyOn(adapters, 'adaptOverpassStations').mockReturnValue([]);

      await mapService.getChargingStations();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://overpass-api.de/api/interpreter',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('charging_station'),
        })
      );
    });
  });

  describe('getBixiStations', () => {
    it('should handle the full discovery and data fetching flow', async () => {
      // 1. Mock Discovery call
      const discoveryData = { data: { en: { feeds: [] } } };
      // 2. Mock Adapter returning URLs
      vi.spyOn(adapters, 'adaptGbfsFeedUrls').mockReturnValue({
        stationInformationUrl: 'http://info.com',
        stationStatusUrl: 'http://status.com'
      });
      // 3. Mock the three sequential/parallel fetches
      vi.mocked(globalThis.fetch)
        .mockReturnValueOnce(mockFetchResponse(discoveryData)) // Discovery
        .mockReturnValueOnce(mockFetchResponse({ stations: [] })) // Info
        .mockReturnValueOnce(mockFetchResponse({ stations: [] })); // Status

      vi.spyOn(adapters, 'adaptBixiStations').mockReturnValue([{ id: '1' }] as any);

      const result = await mapService.getBixiStations();

      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual([{ id: '1' }]);
    });

    it('should throw error if discovery fails', async () => {
      vi.mocked(globalThis.fetch).mockReturnValue(mockFetchResponse({}, false, 500));
      
      await expect(mapService.getBixiStations()).rejects.toThrow(/discovery request failed/);
    });

    it('should throw error if station data fetches fail', async () => {
      vi.mocked(globalThis.fetch)
        .mockReturnValueOnce(mockFetchResponse({})) // Discovery success
        .mockReturnValueOnce(mockFetchResponse({}, false, 404)); // Info failure

      vi.spyOn(adapters, 'adaptGbfsFeedUrls').mockReturnValue({
        stationInformationUrl: 'u1',
        stationStatusUrl: 'u2'
      });

      await expect(mapService.getBixiStations()).rejects.toThrow('Failed to fetch Bixi station data.');
    });
  });

  describe('getDirections', () => {
    it('should fetch and adapt directions correctly', async () => {
      const mockData = { routes: [] };
      const adaptedRoute = { distance: 100 };
      
      vi.mocked(globalThis.fetch).mockReturnValue(mockFetchResponse(mockData));
      vi.spyOn(adapters, 'adaptOrsDirections').mockReturnValue(adaptedRoute as any);

      const result = await mapService.getDirections('driving-car', [45, -73], [46, -74], 'key');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/driving-car?api_key=key&start=-73,45&end=-74,46')
      );
      expect(result).toEqual(adaptedRoute);
    });

    it('should throw error if directions request fails', async () => {
      vi.mocked(globalThis.fetch).mockReturnValue(mockFetchResponse({}, false, 404));
      
      await expect(mapService.getDirections('mode', [0,0], [1,1], 'k'))
        .rejects.toThrow('Directions request failed (404)');
    });
  });

  describe('getNearbyTransitStops', () => {
    it('should fetch transit stops with default radius', async () => {
      const mockData = { stops: [] };
      vi.mocked(globalThis.fetch).mockReturnValue(mockFetchResponse(mockData));
      vi.spyOn(adapters, 'adaptTransitlandStops').mockReturnValue([]);

      await mapService.getNearbyTransitStops(45.5, -73.5, 'key');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('radius=500&served_by_operator_onestop_ids=o-f25d-socitdetransportdemontral')
      );
    });

    it('should throw error if transit request fails', async () => {
      vi.mocked(globalThis.fetch).mockReturnValue(mockFetchResponse({}, false, 503));
      
      await expect(mapService.getNearbyTransitStops(0, 0, 'k'))
        .rejects.toThrow('Transit stops request failed (503)');
    });
  });

  describe('getChargingStations - Error Handling', () => {
    it('should throw a server error when response is not ok', async () => {
      vi.mocked(globalThis.fetch).mockReturnValue(mockFetchResponse({}, false, 500));
      
      await expect(mapService.getChargingStations())
        .rejects.toThrow('Server error: 500');
    });
  });
});

