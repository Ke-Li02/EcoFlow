import { adaptBixiStations, adaptGbfsFeedUrls, adaptOrsDirections, adaptOrsGeocode, adaptOverpassStations, adaptTransitlandStops } from '../adapters/mapApiAdapter';
import type { BixiStation, ChargingStation, PlaceSuggestion, RouteResult, TransitStop } from '../models/types/map';

const STM_OPERATOR = 'o-f25d-socitdetransportdemontral';
const BIXI_GBFS_DISCOVERY_URL = 'https://gbfs.velobixi.com/gbfs/2-2/gbfs.json';

export const OVERPASS_QUERY = `
[out:json][timeout:25];
(
  node["amenity"="charging_station"](45.40,-73.97,45.70,-73.47);
  way["amenity"="charging_station"](45.40,-73.97,45.70,-73.47);
);
out center tags;
`;

export async function searchSuggestions(text: string, orsKey: string): Promise<PlaceSuggestion[]> {
  if (text.length < 3) return [];

  const response = await fetch(
    `https://api.openrouteservice.org/geocode/autocomplete?api_key=${orsKey}&text=${encodeURIComponent(text)}&boundary.country=CA&size=5`
  );
  if (!response.ok) {
    throw new Error(`Geocoding request failed (${response.status})`);
  }

  const data = await response.json();
  return adaptOrsGeocode(data);
}

export async function getDirections(
  mode: string,
  origin: [number, number],
  destination: [number, number],
  orsKey: string
): Promise<RouteResult | null> {
  const response = await fetch(
    `https://api.openrouteservice.org/v2/directions/${mode}?api_key=${orsKey}&start=${origin[1]},${origin[0]}&end=${destination[1]},${destination[0]}`
  );
  if (!response.ok) {
    throw new Error(`Directions request failed (${response.status})`);
  }

  const data = await response.json();
  return adaptOrsDirections(data);
}

export async function getNearbyTransitStops(
  lat: number,
  lon: number,
  transitlandKey: string,
  radiusMeters = 500
): Promise<TransitStop[]> {
  const response = await fetch(
    `https://transit.land/api/v2/rest/stops?lat=${lat}&lon=${lon}&radius=${radiusMeters}&served_by_operator_onestop_ids=${STM_OPERATOR}&per_page=20&apikey=${transitlandKey}`
  );
  if (!response.ok) {
    throw new Error(`Transit stops request failed (${response.status})`);
  }

  const data = await response.json();
  return adaptTransitlandStops(data);
}

export async function getChargingStations(query = OVERPASS_QUERY): Promise<ChargingStation[]> {
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const data = await response.json();
  return adaptOverpassStations(data);
}

export async function getBixiStations(): Promise<BixiStation[]> {
  const discoveryResponse = await fetch(BIXI_GBFS_DISCOVERY_URL);
  if (!discoveryResponse.ok) {
    throw new Error(`Bixi GBFS discovery request failed (${discoveryResponse.status})`);
  }

  const discoveryData = await discoveryResponse.json();
  const { stationInformationUrl, stationStatusUrl } = adaptGbfsFeedUrls(discoveryData);

  const [stationInformationResponse, stationStatusResponse] = await Promise.all([
    fetch(stationInformationUrl),
    fetch(stationStatusUrl),
  ]);

  if (!stationInformationResponse.ok || !stationStatusResponse.ok) {
    throw new Error('Failed to fetch Bixi station data.');
  }

  const [stationInformationData, stationStatusData] = await Promise.all([
    stationInformationResponse.json(),
    stationStatusResponse.json(),
  ]);

  return adaptBixiStations(stationInformationData, stationStatusData);
}
