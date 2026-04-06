import type { BixiFeedUrls, BixiStation, ChargingStation, PlaceSuggestion, RouteResult, TransitStop } from '../models/types/map';

interface OrsGeocodeFeature {
  properties: { label: string };
  geometry: { coordinates: [number, number] };
}

interface OrsGeocodeResponse {
  features?: OrsGeocodeFeature[];
}

interface TransitlandRouteStop {
  route?: { route_short_name?: string };
}

interface TransitlandStop {
  onestop_id: string;
  stop_name: string;
  geometry: { coordinates: [number, number] };
  route_stops?: TransitlandRouteStop[];
}

interface TransitlandResponse {
  stops?: TransitlandStop[];
}

interface OrsDirectionsSegment {
  distance: number;
  duration: number;
}

interface OrsDirectionsFeature {
  geometry: { coordinates: [number, number][] };
  properties: { segments?: OrsDirectionsSegment[] };
}

interface OrsDirectionsResponse {
  features?: OrsDirectionsFeature[];
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { name?: string; operator?: string; fee?: string; [key: string]: string | undefined };
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

interface GbfsFeed {
  name: string;
  url: string;
}

interface GbfsLanguageData {
  feeds?: GbfsFeed[];
}

interface GbfsDiscoveryResponse {
  data?: {
    en?: GbfsLanguageData;
    fr?: GbfsLanguageData;
  };
}

interface BixiStationInformation {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  capacity?: number;
}

interface BixiStationStatus {
  station_id: string;
  num_bikes_available?: number;
  num_ebikes_available?: number;
  num_docks_available?: number;
  is_installed?: number;
  is_renting?: number;
  is_returning?: number;
  last_reported?: number;
}

interface BixiStationInformationResponse {
  data?: {
    stations?: BixiStationInformation[];
  };
}

interface BixiStationStatusResponse {
  data?: {
    stations?: BixiStationStatus[];
  };
}

export function adaptOrsGeocode(data: unknown): PlaceSuggestion[] {
  const response = data as OrsGeocodeResponse;
  return (response.features ?? []).map((feature) => ({
    label: feature.properties.label,
    coords: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
  }));
}

export function adaptTransitlandStops(data: unknown): TransitStop[] {
  const response = data as TransitlandResponse;
  return (response.stops ?? []).map((stop) => ({
    id: stop.onestop_id,
    name: stop.stop_name,
    lat: stop.geometry.coordinates[1],
    lon: stop.geometry.coordinates[0],
    routes: (stop.route_stops ?? []).map((routeStop) => routeStop.route?.route_short_name).filter(Boolean) as string[],
  }));
}

export function adaptOrsDirections(data: unknown): RouteResult | null {
  const response = data as OrsDirectionsResponse;
  const feature = response.features?.[0];
  const segment = feature?.properties?.segments?.[0];
  if (!feature || !segment) return null;

  return {
    points: feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: segment.distance,
    durationSeconds: segment.duration,
  };
}

export function adaptOverpassStations(data: unknown): ChargingStation[] {
  const response = data as OverpassResponse;

  return (response.elements ?? [])
    .map((element): ChargingStation | null => {
      const tags = element.tags ?? {};
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      if (lat == null || lon == null) return null;

      return {
        id: element.id,
        lat,
        lon,
        name: tags.name || tags.operator || 'EV Charging Station',
        address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']].filter(Boolean).join(' ') || 'Montreal, QC',
        network: tags.network || tags.operator || 'Unknown network',
        sockets: tags.capacity || tags['socket:count'] || 'N/A',
        connectors:
          [
            tags['socket:type2'] && 'Type 2',
            tags['socket:chademo'] && 'CHAdeMO',
            tags['socket:type2_combo'] && 'CCS',
            tags['socket:tesla_supercharger'] && 'Tesla',
            tags['socket:type1'] && 'Type 1',
          ]
            .filter(Boolean)
            .join(', ') || 'See on-site',
        access: tags.fee === 'yes' ? 'Paid' : tags.fee === 'no' ? 'Free' : 'Check on-site',
      };
    })
    .filter((station): station is ChargingStation => station !== null);
}

export function adaptGbfsFeedUrls(data: unknown): BixiFeedUrls {
  const response = data as GbfsDiscoveryResponse;
  const feeds = response.data?.en?.feeds ?? response.data?.fr?.feeds ?? [];
  const stationInformationUrl = feeds.find((feed) => feed.name === 'station_information')?.url;
  const stationStatusUrl = feeds.find((feed) => feed.name === 'station_status')?.url;

  if (!stationInformationUrl || !stationStatusUrl) {
    throw new Error('Bixi GBFS feed is missing station information or status URLs.');
  }

  return { stationInformationUrl, stationStatusUrl };
}

export function adaptBixiStations(stationInformationData: unknown, stationStatusData: unknown): BixiStation[] {
  const stationInformation = (stationInformationData as BixiStationInformationResponse).data?.stations ?? [];
  const stationStatuses = (stationStatusData as BixiStationStatusResponse).data?.stations ?? [];

  const statusById = new Map(stationStatuses.map((status) => [status.station_id, status]));

  return stationInformation
    .map((station): BixiStation => {
      const status = statusById.get(station.station_id);

      return {
        id: station.station_id,
        name: station.name,
        lat: station.lat,
        lon: station.lon,
        address: station.address ?? 'Montreal, QC',
        capacity: station.capacity ?? null,
        numBikesAvailable: status?.num_bikes_available ?? 0,
        numEbikesAvailable: status?.num_ebikes_available ?? 0,
        numDocksAvailable: status?.num_docks_available ?? 0,
        isInstalled: status?.is_installed === 1,
        isRenting: status?.is_renting === 1,
        isReturning: status?.is_returning === 1,
        lastReported: status?.last_reported ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
