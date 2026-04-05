export type LatLngTuple = [number, number];

export interface PlaceSuggestion {
  label: string;
  coords: LatLngTuple;
}

export interface TransitStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  routes: string[];
}

export interface RouteResult {
  points: LatLngTuple[];
  distanceMeters: number;
  durationSeconds: number;
}

export interface ChargingStation {
  id: number;
  lat: number;
  lon: number;
  name: string;
  address: string;
  network: string;
  sockets: string;
  connectors: string;
  access: string;
}

export interface BixiFeedUrls {
  stationInformationUrl: string;
  stationStatusUrl: string;
}

export interface BixiStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  capacity: number | null;
  numBikesAvailable: number;
  numEbikesAvailable: number;
  numDocksAvailable: number;
  isInstalled: boolean;
  isRenting: boolean;
  isReturning: boolean;
  lastReported: number | null;
}
