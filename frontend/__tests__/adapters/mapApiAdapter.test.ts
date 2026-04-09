import { describe, it, expect } from "vitest";
import {
  adaptOrsGeocode,
  adaptTransitlandStops,
  adaptOrsDirections,
  adaptOverpassStations,
  adaptGbfsFeedUrls,
  adaptBixiStations
} from '../../src/adapters/mapApiAdapter.js';

describe('adaptOrsGeocode', () => {
  it('maps ORS geocode response correctly', () => {
    const input = {
      features: [
        {
          properties: { label: 'Concordia University' },
          geometry: { coordinates: [-73.5789, 45.4972] }
        }
      ]
    };

    const result = adaptOrsGeocode(input);

    expect(result).toEqual([
      {
        label: 'Concordia University',
        coords: [45.4972, -73.5789]
      }
    ]);
  });

  it('returns empty array when no features', () => {
    expect(adaptOrsGeocode({})).toEqual([]);
  });
});

describe('adaptTransitlandStops', () => {
  it('maps transit stops correctly', () => {
    const input = {
      stops: [
        {
          onestop_id: 's-123',
          stop_name: 'Metro Guy-Concordia',
          geometry: { coordinates: [-73.579, 45.495] },
          route_stops: [
            { route: { route_short_name: 'Green' } },
            { route: { route_short_name: 'Orange' } }
          ]
        }
      ]
    };

    const result = adaptTransitlandStops(input);

    expect(result).toEqual([
      {
        id: 's-123',
        name: 'Metro Guy-Concordia',
        lat: 45.495,
        lon: -73.579,
        routes: ['Green', 'Orange']
      }
    ]);
  });

  it('filters undefined route names', () => {
    const input = {
      stops: [
        {
          onestop_id: '1',
          stop_name: 'Stop',
          geometry: { coordinates: [1, 2] },
          route_stops: [{ route: {} }]
        }
      ]
    };

    const result = adaptTransitlandStops(input);

    expect(result[0].routes).toEqual([]);
  });
});

describe('adaptOrsDirections', () => {
  it('maps directions correctly', () => {
    const input = {
      features: [
        {
          geometry: { coordinates: [[-73.5, 45.5], [-73.6, 45.6]] },
          properties: {
            segments: [{ distance: 1000, duration: 600 }]
          }
        }
      ]
    };

    const result = adaptOrsDirections(input);

    expect(result).toEqual({
      points: [
        [45.5, -73.5],
        [45.6, -73.6]
      ],
      distanceMeters: 1000,
      durationSeconds: 600
    });
  });

  it('returns null when no feature exists', () => {
    expect(adaptOrsDirections({})).toBeNull();
  });
});

describe('adaptOverpassStations', () => {
  it('maps charging stations correctly', () => {
    const input = {
      elements: [
        {
          id: 1,
          lat: 45.5,
          lon: -73.5,
          tags: {
            name: 'Fast Charger',
            network: 'Circuit Electric',
            capacity: '4',
            fee: 'yes',
            'socket:type2': 'yes'
          }
        }
      ]
    };

    const result = adaptOverpassStations(input);

    expect(result[0]).toMatchObject({
      id: 1,
      name: 'Fast Charger',
      lat: 45.5,
      lon: -73.5,
      network: 'Circuit Electric',
      sockets: '4',
      connectors: 'Type 2',
      access: 'Paid'
    });
  });

  it('filters elements without coordinates', () => {
    const input = {
      elements: [{ id: 1 }]
    };

    const result = adaptOverpassStations(input);

    expect(result).toEqual([]);
  });
});

describe('adaptGbfsFeedUrls', () => {
  it('extracts feed URLs', () => {
    const input = {
      data: {
        en: {
          feeds: [
            { name: 'station_information', url: 'info_url' },
            { name: 'station_status', url: 'status_url' }
          ]
        }
      }
    };

    const result = adaptGbfsFeedUrls(input);

    expect(result).toEqual({
      stationInformationUrl: 'info_url',
      stationStatusUrl: 'status_url'
    });
  });

  it('throws error when feeds missing', () => {
    expect(() => adaptGbfsFeedUrls({})).toThrow();
  });
});

describe('adaptBixiStations', () => {
  it('merges station info with status', () => {
    const info = {
      data: {
        stations: [
          {
            station_id: '1',
            name: 'Station A',
            lat: 45.5,
            lon: -73.5,
            capacity: 10
          }
        ]
      }
    };

    const status = {
      data: {
        stations: [
          {
            station_id: '1',
            num_bikes_available: 3,
            num_ebikes_available: 1,
            num_docks_available: 7,
            is_installed: 1,
            is_renting: 1,
            is_returning: 1,
            last_reported: 123
          }
        ]
      }
    };

    const result = adaptBixiStations(info, status);

    expect(result).toEqual([
      {
        id: '1',
        name: 'Station A',
        lat: 45.5,
        lon: -73.5,
        address: 'Montreal, QC',
        capacity: 10,
        numBikesAvailable: 3,
        numEbikesAvailable: 1,
        numDocksAvailable: 7,
        isInstalled: true,
        isRenting: true,
        isReturning: true,
        lastReported: 123
      }
    ]);
  });

  it('sorts stations alphabetically', () => {
    const info = {
      data: {
        stations: [
          { station_id: '2', name: 'B', lat: 0, lon: 0 },
          { station_id: '1', name: 'A', lat: 0, lon: 0 }
        ]
      }
    };

    const status = { data: { stations: [] } };

    const result = adaptBixiStations(info, status);

    expect(result[0].name).toBe('A');
  });
});